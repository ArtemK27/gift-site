import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  CloudSnow,
  Sparkles,
  Flame,
  Compass,
} from 'lucide-react';
import { AppId } from '../../types';
import { vibrate, playTapSound } from '../../utils/haptics';
import { useSettings } from '../../context/SettingsContext';
import { getUtc7TimeSnapshot } from '../../utils/timeZoneUtils';
import { FrogClickerWidget } from './FrogClickerWidget';

interface WidgetsProps {
  onOpenApp?: (appId: AppId) => void;
}

/**
 * Page 0 Widgets:
 * 1. New Year 2027 (UTC+7 / MSK+4) with live forward counter "🎉 Мы в 2027 году уже: [ЧЧ:ММ:СС]"
 * 2. Weather & Safe Quest Status (progressive cipher ???? -> 2027)
 */
export const Page0Widgets: React.FC<WidgetsProps> = ({ onOpenApp }) => {
  const [snapshot, setSnapshot] = useState(() => getUtc7TimeSnapshot());
  const { cipherCode } = useSettings();

  useEffect(() => {
    const timer = setInterval(() => {
      setSnapshot(getUtc7TimeSnapshot());
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
      {/* Widget 1: Calendar / 2027 Live Counter (UTC+7 / MSK+4) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => handleWidgetClick('clock')}
        className="h-[148px] rounded-[26px] bg-white/[0.10] hover:bg-white/[0.14] border border-white/15 backdrop-blur-2xl p-3.5 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.35)] relative overflow-hidden group cursor-pointer transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            UTC+7 • МСК+4
          </span>
          <span className="text-[10px] font-mono text-white/60">{snapshot.hm}</span>
        </div>

        <div>
          <div className="text-[24px] font-black font-sans tracking-tight text-white leading-none">
            2027
          </div>
          <div
            data-testid="widget-2027-elapsed"
            className="text-[10.5px] text-amber-200/95 font-medium mt-1 leading-snug"
          >
            🎉 Мы в 2027 году уже:{' '}
            <span className="font-mono font-bold text-white block mt-0.5">
              {snapshot.elapsedIn2027Hms}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] font-mono text-cyan-300">
          <span>{snapshot.isNewYearReached ? 'НОВЫЙ ГОД' : 'ДО 2027'}</span>
          <span>
            {snapshot.isNewYearReached
              ? 'НАСТУПИЛ ✨'
              : `${snapshot.countdown.days}д ${snapshot.countdown.hmsFormatted}`}
          </span>
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
 * 1. FrogClickerWidget ("Жаба удачи 2027 🐸") — replaces old Seoul clock widget
 * 2. Weather Insight (Snowfall & Fireworks)
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
    <div className="grid grid-cols-2 gap-3.5 pt-1">
      {/* Widget 1: Interactive Frog Clicker ("Жаба удачи 2027 🐸") */}
      <FrogClickerWidget />

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

export const HomeWidgets = Page0Widgets;
