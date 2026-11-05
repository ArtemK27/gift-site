import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Lock,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Terminal,
  Settings,
  Flame,
  Calendar,
  CloudSnow,
} from 'lucide-react';
import { AppId } from '../../types';
import { vibrate, playTapSound } from '../../utils/haptics';

interface HomeScreenProps {
  onOpenApp: (app: AppId) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenApp }) => {
  const [countdown, setCountdown] = useState({ m: 0, s: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { m: prev.m - 1, s: 59 };
        return { m: 0, s: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLaunch = (appId: AppId) => {
    vibrate(25);
    playTapSound(520, 0.05);
    onOpenApp(appId);
  };

  const apps = [
    {
      id: 'messenger' as AppId,
      name: 'ПодвалГрам',
      icon: MessageCircle,
      badge: '4',
      bg: 'bg-gradient-to-tr from-sky-400 via-sky-500 to-blue-600',
    },
    {
      id: 'safe' as AppId,
      name: 'VIP Сейф',
      icon: Lock,
      badge: 'PIN',
      bg: 'bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600',
    },
    {
      id: 'notes' as AppId,
      name: 'Заметки',
      icon: FileText,
      badge: '2',
      bg: 'bg-gradient-to-tr from-yellow-300 via-amber-400 to-amber-500',
    },
    {
      id: 'gallery' as AppId,
      name: 'Фото',
      icon: ImageIcon,
      badge: '3D',
      bg: 'bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-600',
    },
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-between pt-8 pb-3 px-6 select-none z-10 overflow-hidden font-sans">
      {/* Top 2x2 iOS Widgets Grid */}
      <div className="grid grid-cols-2 gap-3.5 pt-1">
        {/* Widget 1: Calendar / Countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="h-[148px] rounded-[26px] bg-white/[0.10] hover:bg-white/[0.14] border border-white/15 backdrop-blur-2xl p-3.5 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.35)] relative overflow-hidden group cursor-default"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              31 ДЕК
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div>
            <div className="text-[28px] font-black font-sans tracking-tight text-white leading-none">
              2027
            </div>
            <div className="text-[11px] text-white/80 font-medium mt-1">
              Новый Год близко!
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] font-mono text-cyan-300">
            <span>ТАЙМЕР</span>
            <span>00:{countdown.s < 10 ? `0${countdown.s}` : countdown.s}</span>
          </div>
        </motion.div>

        {/* Widget 2: Weather & Quest Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="h-[148px] rounded-[26px] bg-white/[0.10] hover:bg-white/[0.14] border border-white/15 backdrop-blur-2xl p-3.5 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.35)] relative overflow-hidden group cursor-default"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
              <CloudSnow className="w-3.5 h-3.5" />
              -5°C СНЕГ
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Flame className="w-4 h-4 text-rose-400 animate-bounce" />
              <span className="text-xs font-bold text-white tracking-tight">Квест Сейфа</span>
            </div>
            <div className="text-[11px] text-white/75 leading-tight">
              Собери 4 цифры ПИН-кода
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] font-mono text-amber-300">
            <span>СТАТУС:</span>
            <span className="font-bold">ШИФР 2027</span>
          </div>
        </motion.div>
      </div>

      {/* Main iOS Springboard App Grid (4 Columns) */}
      <div className="grid grid-cols-4 gap-4 py-4 px-1">
        {apps.map((app, idx) => {
          const Icon = app.icon;
          return (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 24,
                delay: idx * 0.04,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.90 }}
              onClick={() => handleLaunch(app.id)}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              {/* Apple Squircle Icon */}
              <div
                className={`relative w-[60px] h-[60px] rounded-[18px] ${app.bg} flex items-center justify-center text-white border border-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-transform`}
              >
                <Icon className="w-7 h-7 stroke-[2.2] group-hover:scale-105 transition-transform" />
                {app.badge && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold font-sans flex items-center justify-center border-2 border-[#1c1c1e] shadow-sm">
                    {app.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium text-white/95 tracking-tight text-center truncate w-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {app.name}
              </span>
            </motion.div>
          );
        })}

        {/* Decorative Extra System Apps */}
        <motion.div
          whileTap={{ scale: 0.90 }}
          onClick={() => {
            vibrate(15);
            playTapSound(300, 0.03);
          }}
          className="flex flex-col items-center gap-1.5 cursor-pointer opacity-80 hover:opacity-100"
        >
          <div className="w-[60px] h-[60px] rounded-[18px] bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/15 flex items-center justify-center text-emerald-400 shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
            <Terminal className="w-7 h-7" />
          </div>
          <span className="text-[11px] font-medium text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            Консоль
          </span>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.90 }}
          onClick={() => {
            vibrate(15);
            playTapSound(300, 0.03);
          }}
          className="flex flex-col items-center gap-1.5 cursor-pointer opacity-80 hover:opacity-100"
        >
          <div className="w-[60px] h-[60px] rounded-[18px] bg-gradient-to-tr from-zinc-700 to-zinc-600 border border-white/15 flex items-center justify-center text-zinc-300 shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
            <Settings className="w-7 h-7" />
          </div>
          <span className="text-[11px] font-medium text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            Настройки
          </span>
        </motion.div>
      </div>

      {/* iOS Pagination Dots */}
      <div className="flex items-center justify-center gap-1.5 py-1">
        <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
        <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
        <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
      </div>

      {/* Authentic iOS Glass Dock */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="w-full max-w-[360px] mx-auto p-3 rounded-[34px] bg-white/[0.14] border border-white/20 backdrop-blur-3xl shadow-[0_16px_40px_rgba(0,0,0,0.55)] flex items-center justify-around"
      >
        {apps.map((app) => {
          const Icon = app.icon;
          return (
            <motion.div
              key={`dock-${app.id}`}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => handleLaunch(app.id)}
              className="relative cursor-pointer"
            >
              <div
                className={`w-[54px] h-[54px] rounded-[16px] ${app.bg} flex items-center justify-center text-white border border-white/25 shadow-md`}
              >
                <Icon className="w-6 h-6 stroke-[2.2]" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
