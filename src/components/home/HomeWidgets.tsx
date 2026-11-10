import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Sparkles,
  Flame,
  Compass,
  Lock,
} from 'lucide-react';
import { AppId } from '../../types';
import { vibrate, playTapSound } from '../../utils/haptics';
import { useSettings } from '../../context/SettingsContext';
import { getUtc10TimeSnapshot } from '../../utils/timeZoneUtils';
import { FrogClickerWidget } from './FrogClickerWidget';

interface WidgetsProps {
  onOpenApp?: (appId: AppId) => void;
}

/**
 * Page 0 Widgets:
 * 1. New Year 2027 (UTC+10 / MSK+7) — shows countdown before 2027, and elapsed time once 2027 arrives
 * 2. Safe Quest Status (progressive cipher ???? -> 2427)
 */
export const Page0Widgets: React.FC<WidgetsProps> = ({ onOpenApp }) => {
  const [snapshot, setSnapshot] = useState(() => getUtc10TimeSnapshot());
  const { cipherCode } = useSettings();

  useEffect(() => {
    const timer = setInterval(() => {
      setSnapshot(getUtc10TimeSnapshot());
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
    <div className="grid grid-cols-2 gap-3 pt-1">
      {/* Widget 1: Calendar / 2027 Counter (UTC+10 / MSK+7) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => handleWidgetClick('clock')}
        className="h-[148px] rounded-[26px] bg-white/[0.10] hover:bg-white/[0.14] border border-white/15 backdrop-blur-2xl p-3 sm:p-3.5 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.35)] relative overflow-hidden group cursor-pointer transition-colors"
      >
        <div className="flex items-center justify-between gap-1 min-w-0">
          <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wide text-rose-400 flex items-center gap-1 whitespace-nowrap">
            <Calendar className="w-3 h-3 shrink-0" />
            UTC+10 • МСК+7
          </span>
        </div>

        <div className="min-w-0">
          <div className="text-[23px] sm:text-[25px] font-black font-sans tracking-tight text-white leading-none">
            2027
          </div>
          {snapshot.isNewYearReached ? (
            <div
              data-testid="widget-2027-elapsed"
              className="text-[10px] sm:text-[10.5px] text-amber-200/95 font-medium mt-1 leading-snug whitespace-nowrap"
            >
              🎉 Уже в 2027 году:{' '}
              <span className="font-mono font-bold text-white block mt-0.5 text-[11px]">
                {snapshot.elapsedIn2027Hms}
              </span>
            </div>
          ) : (
            <div
              data-testid="widget-2027-elapsed"
              className="text-[10px] sm:text-[10.5px] text-amber-200/95 font-medium mt-1 leading-snug whitespace-nowrap"
            >
              ⏳ До Нового года:{' '}
              <span className="font-mono font-bold text-white block mt-0.5 text-[11px]">
                {snapshot.countdown.days}д {snapshot.countdown.hmsFormatted}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/10 text-[9.5px] sm:text-[10px] font-mono text-cyan-300 whitespace-nowrap">
          <span>{snapshot.isNewYearReached ? 'НОВЫЙ ГОД' : 'СЕГОДНЯ'}</span>
          <span>
            {snapshot.isNewYearReached ? 'НАСТУПИЛ ✨' : snapshot.dateShort}
          </span>
        </div>
      </motion.div>

      {/* Widget 2: Safe Quest Status (without weather) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => handleWidgetClick('safe')}
        className="h-[148px] rounded-[26px] bg-white/[0.10] hover:bg-white/[0.14] border border-white/15 backdrop-blur-2xl p-3 sm:p-3.5 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.35)] relative overflow-hidden group cursor-pointer transition-colors"
      >
        <div className="flex items-center justify-between gap-1 min-w-0">
          <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wide text-amber-300 flex items-center gap-1 whitespace-nowrap">
            <Lock className="w-3 h-3 shrink-0" />
            VIP СЕЙФ
          </span>
          <Sparkles
            className="w-3.5 h-3.5 text-amber-300 shrink-0 animate-spin"
            style={{ animationDuration: '8s' }}
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 whitespace-nowrap">
            <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-bounce" />
            <span className="text-xs font-bold text-white tracking-tight">
              Квест Сейфа
            </span>
          </div>
          <div className="text-[10.5px] text-white/75 leading-snug whitespace-nowrap">
            Собери 4 цифры кода
          </div>
        </div>

        <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/10 text-[9.5px] sm:text-[10px] font-mono text-amber-300 whitespace-nowrap">
          <span>СТАТУС:</span>
          <span className="font-bold tracking-wider" data-testid="widget-cipher-status">
            ШИФР {cipherCode}
          </span>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Page 1 Widgets:
 * 1. FrogClickerWidget ("Жаба удачи 2027 🐸")
 * 2. Weather Insight (Snowfall & Fireworks, -20°C)
 */
export const Page1Widgets: React.FC<WidgetsProps> = ({ onOpenApp }) => {
  const handleWidgetClick = (target: AppId) => {
    vibrate(20);
    playTapSound(480, 0.04);
    if (onOpenApp && target) {
      onOpenApp(target);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 pt-1">
      {/* Widget 1: Interactive Frog Clicker ("Жаба удачи 2027 🐸") */}
      <FrogClickerWidget />

      {/* Widget 2: Weather Insight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => handleWidgetClick('weather')}
        className="h-[148px] rounded-[26px] bg-white/[0.10] hover:bg-white/[0.14] border border-white/15 backdrop-blur-2xl p-3 sm:p-3.5 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.35)] relative overflow-hidden group cursor-pointer transition-colors"
      >
        <div className="flex items-center justify-between gap-1 min-w-0">
          <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wide text-sky-300 flex items-center gap-1 whitespace-nowrap">
            <Compass className="w-3 h-3 shrink-0" />
            АТМОСФЕРА
          </span>
          <span className="text-[9.5px] sm:text-[10px] font-semibold text-sky-400 whitespace-nowrap shrink-0">
            100% ❄️
          </span>
        </div>

        <div className="min-w-0">
          <div className="text-[25px] sm:text-[26px] font-black font-sans tracking-tight text-white leading-none">
            -20°
          </div>
          <div className="text-[10.5px] sm:text-[11px] text-white/80 font-medium mt-1 whitespace-nowrap">
            Метель и огни
          </div>
        </div>

        <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/10 text-[9.5px] sm:text-[10px] font-mono text-cyan-300 whitespace-nowrap">
          <span>00:00</span>
          <span className="font-bold">🎆 САЛЮТ</span>
        </div>
      </motion.div>
    </div>
  );
};

export const HomeWidgets = Page0Widgets;

