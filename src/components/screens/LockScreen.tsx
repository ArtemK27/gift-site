import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ShieldAlert, ChevronUp, Lock, Flashlight, Camera } from 'lucide-react';
import { NotificationItem } from '../../types';
import { vibrate, playTapSound, playUnlockSound } from '../../utils/haptics';

interface LockScreenProps {
  onUnlock: () => void;
  onOpenNotification?: (targetApp: string) => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock, onOpenNotification }) => {
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      sender: 'Сану',
      avatar: './assets/avatar_sangwoo.jpg',
      title: 'ПодвалГрам',
      message: 'Ты где ходишь? Хунтуни уже стынут, а подвал сам себя не украсит. Быстро сюда. 🔪🎄',
      time: '2 мин назад',
    },
    {
      id: 'notif-2',
      sender: 'Чу Ваньнин',
      avatar: './assets/avatar_chu_wanning.jpg',
      title: 'ПодвалГрам',
      message: 'Мо Жань опять натворил глупостей. Не забудь пароль от сейфа, я оставил часть в Заметках.',
      time: '5 мин назад',
    },
    {
      id: 'notif-3',
      sender: 'Система Безопасности',
      avatar: '',
      title: 'Security Core',
      message: 'ВНИМАНИЕ: Зафиксирован вход в новогоднюю ночь. ПИН-код сейфа разделен по системе.',
      time: 'Только что',
    },
  ]);

  const dragY = useMotionValue(0);
  const lockOpacity = useTransform(dragY, [0, -140], [1, 0]);
  const lockScale = useTransform(dragY, [0, -140], [1, 0.92]);

  const handleDragEnd = (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (info.offset.y < -65 || info.velocity.y < -280) {
      vibrate([25, 40, 50]);
      playUnlockSound();
      onUnlock();
    }
  };

  const toggleFlashlight = (e: React.MouseEvent) => {
    e.stopPropagation();
    vibrate(30);
    playTapSound(650, 0.05);
    setFlashlightOn((prev) => !prev);
  };

  return (
    <motion.div
      style={{ opacity: lockOpacity, scale: lockScale }}
      drag="y"
      dragConstraints={{ top: -200, bottom: 0 }}
      dragElastic={0.25}
      onDragEnd={handleDragEnd}
      className="relative w-full h-full flex flex-col justify-between pt-10 pb-4 px-6 select-none z-10 cursor-grab active:cursor-grabbing font-sans"
    >
      {/* Top iOS Lock & Date & Clock */}
      <div className="flex flex-col items-center">
        {/* iOS Lock Glyph */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-1 text-white/80"
        >
          <Lock className="w-4 h-4 stroke-[2.2]" />
        </motion.div>

        {/* iOS Date Header */}
        <div className="text-[13px] font-semibold text-white/85 tracking-tight mb-0.5">
          Воскресенье, 31 декабря
        </div>

        {/* Giant iOS Clock Typography */}
        <div className="text-[82px] font-extrabold tracking-tighter text-white/95 leading-none drop-shadow-[0_4px_28px_rgba(255,255,255,0.18)] font-sans">
          23:59
        </div>

        {/* iOS Weather / Event Widget Pill */}
        <div className="mt-2.5 px-3 py-1 rounded-full bg-black/30 border border-white/10 backdrop-blur-md flex items-center gap-2 text-xs text-white/90 shadow-sm">
          <span className="text-cyan-300 font-medium">❄️ -5°C</span>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span className="text-amber-200/90 font-medium">Снег в новогоднюю ночь</span>
        </div>
      </div>

      {/* iOS Grouped Notifications Stack */}
      <div className="flex flex-col gap-2.5 my-auto w-full max-w-[390px] mx-auto z-20">
        <div className="flex items-center justify-between px-1.5 mb-0.5">
          <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">
            Уведомления
          </span>
          <span className="text-[10px] text-white/50 font-mono">
            {notifications.length} новых
          </span>
        </div>

        {notifications.map((notif, idx) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 25,
              delay: idx * 0.07,
            }}
            onClick={() => {
              vibrate(25);
              playTapSound();
              if (onOpenNotification) {
                if (notif.id === 'notif-1' || notif.id === 'notif-2') {
                  onOpenNotification('messenger');
                } else {
                  onOpenNotification('safe');
                }
              } else {
                onUnlock();
              }
            }}
            className="group relative p-3 rounded-[22px] bg-white/[0.12] hover:bg-white/[0.16] active:scale-[0.98] border border-white/15 backdrop-blur-2xl shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-all cursor-pointer overflow-hidden"
          >
            {/* Top inner glass hairline */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            <div className="flex items-start gap-3">
              {/* Squircle Avatar or App Icon */}
              {notif.avatar ? (
                <div className="relative w-10 h-10 rounded-[12px] overflow-hidden bg-zinc-800 border border-white/20 flex-shrink-0 shadow-sm">
                  <img
                    src={notif.avatar}
                    alt={notif.sender}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-black rounded-full" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-red-600/40 to-amber-600/40 border border-red-500/40 flex items-center justify-center text-red-400 flex-shrink-0 shadow-sm">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
              )}

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 min-w-0 mb-0.5">
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span className="text-xs font-bold text-white tracking-tight truncate min-w-0">
                      {notif.sender}
                    </span>
                    <span className="text-[10px] font-normal text-white/50 shrink-0">
                      • {notif.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/50 font-mono shrink-0 whitespace-nowrap">
                    {notif.time}
                  </span>
                </div>
                <p className="text-xs text-white/85 leading-snug line-clamp-2 font-normal">
                  {notif.message}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom iOS Lock Screen Bar: Flashlight, Unlock text, Camera */}
      <div className="w-full flex flex-col items-center gap-3">
        {/* Swipe up unlock hint */}
        <div
          onClick={() => {
            vibrate(30);
            playUnlockSound();
            onUnlock();
          }}
          className="flex flex-col items-center gap-0.5 cursor-pointer active:opacity-60 transition-opacity"
        >
          <motion.div
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronUp className="w-5 h-5 text-white/70" />
          </motion.div>
          <span className="text-[11px] font-semibold text-white/70 tracking-wider">
            Смахните вверх для разблокировки
          </span>
        </div>

        {/* Quick Action Buttons: Flashlight & Camera */}
        <div className="w-full flex items-center justify-between px-3 pt-1">
          <button
            onClick={toggleFlashlight}
            className={`w-12 h-12 rounded-full backdrop-blur-2xl border flex items-center justify-center transition-all duration-150 active:scale-90 shadow-lg ${
              flashlightOn
                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.7)]'
                : 'bg-black/40 border-white/20 text-white hover:bg-black/60'
            }`}
            title="Фонарик"
          >
            <Flashlight className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={() => {
              vibrate(20);
              playTapSound();
              if (onOpenNotification) onOpenNotification('gallery');
            }}
            className="w-12 h-12 rounded-full bg-black/40 border border-white/20 backdrop-blur-2xl text-white flex items-center justify-center transition-all duration-150 active:scale-90 hover:bg-black/60 shadow-lg"
            title="Камера"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
