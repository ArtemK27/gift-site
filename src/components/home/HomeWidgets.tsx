import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  CloudSnow,
  Sparkles,
  Flame,
  Clock,
  Compass,
} from 'lucide-react';
import { AppId } from '../../types';
import { vibrate, playTapSound } from '../../utils/haptics';

interface WidgetsProps {
  onOpenApp?: (appId: AppId) => void;
}

/**
 * Page 0 Widgets:
 * 1. Calendar Countdown to 2027
 * 2. Weather & Safe Quest Status
 */
export const Page0Widgets: React.FC<WidgetsProps> = ({ onOpenApp }) => {
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

  const handleWidgetClick = (target: AppId) => {
    vibrate(20);
    playTapSound(480, 0.04);
    if (onOpenApp && target) {
      onOpenApp(target);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3.5 pt-1">
      {/* Widget 1: Calendar / Countdown */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => handleWidgetClick('clock')}
        className="h-[148px] rounded-[26px] bg-white/[0.10] hover:bg-white/[0.14] border border-white/15 backdrop-blur-2xl p-3.5 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.35)] relative overflow-hidden group cursor-pointer transition-colors"
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
        whileTap={{ scale: 0.97 }}
        onClick={() => handleWidgetClick('safe')}
        className="h-[148px] rounded-[26px] bg-white/[0.10] hover:bg-white/[0.14] border border-white/15 backdrop-blur-2xl p-3.5 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.35)] relative overflow-hidden group cursor-pointer transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
            <CloudSnow className="w-3.5 h-3.5" />
            -5°C СНЕГ
          </span>
          <Sparkles
            className="w-3.5 h-3.5 text-amber-300 animate-spin"
            style={{ animationDuration: '8s' }}
          />
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Flame className="w-4 h-4 text-rose-400 animate-bounce" />
            <span className="text-xs font-bold text-white tracking-tight">
              Квест Сейфа
            </span>
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
  );
};

/**
 * Page 1 Widgets:
 * 1. World Clock (Penthouse Sangwoo live time)
 * 2. Weather Insight (Snowfall & Fireworks countdown)
 */
export const Page1Widgets: React.FC<WidgetsProps> = ({ onOpenApp }) => {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const sec = time.getSeconds();
  const secStr = sec < 10 ? `0${sec}` : `${sec}`;

  const handleWidgetClick = (target: AppId) => {
    vibrate(20);
    playTapSound(480, 0.04);
    if (onOpenApp && target) {
      onOpenApp(target);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3.5 pt-1">
      {/* Widget 1: World Clock Penthouse */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => handleWidgetClick('clock')}
        className="h-[148px] rounded-[26px] bg-white/[0.10] hover:bg-white/[0.14] border border-white/15 backdrop-blur-2xl p-3.5 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.35)] relative overflow-hidden group cursor-pointer transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            СЕУЛ • САХА
          </span>
          <span className="text-[10px] font-mono text-white/50">GMT+9</span>
        </div>

        <div>
          <div className="text-[26px] font-black font-mono tracking-tight text-white leading-none">
            23:59:<span className="text-amber-400">{secStr}</span>
          </div>
          <div className="text-[11px] text-white/80 font-medium mt-1 truncate">
            Пентхаус Сану 🍷
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] font-mono text-amber-300">
          <span>СЧЁТЧИК</span>
          <span className="font-bold">ДО 2027</span>
        </div>
      </motion.div>

      {/* Widget 2: Weather Insight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => handleWidgetClick('weather')}
        className="h-[148px] rounded-[26px] bg-white/[0.10] hover:bg-white/[0.14] border border-white/15 backdrop-blur-2xl p-3.5 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.35)] relative overflow-hidden group cursor-pointer transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" />
            АТМОСФЕРА
          </span>
          <span className="text-[10px] font-semibold text-sky-400">100% ❄️</span>
        </div>

        <div>
          <div className="text-[26px] font-black font-sans tracking-tight text-white leading-none">
            -5°
          </div>
          <div className="text-[11px] text-white/80 font-medium mt-1">
            Метель и огни
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] font-mono text-cyan-300">
          <span>00:00</span>
          <span className="font-bold">🎆 САЛЮТ</span>
        </div>
      </motion.div>
    </div>
  );
};

// Default export alias for modularity
export const HomeWidgets = Page0Widgets;
