import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, AlertTriangle, Terminal } from 'lucide-react';
import { vibrate, playGlitchSound, playTapSound } from '../../utils/haptics';

interface BaitScreenProps {
  onUnlockStart: () => void;
}

export const BaitScreen: React.FC<BaitScreenProps> = ({ onUnlockStart }) => {
  const [isGlitching, setIsGlitching] = useState(false);
  const [glitchPhase, setGlitchPhase] = useState(0);

  const handleOpenGift = () => {
    vibrate([40, 60, 40, 100, 200]);
    playGlitchSound();
    setIsGlitching(true);

    // Glitch sequence progression
    setTimeout(() => {
      setGlitchPhase(1);
      vibrate([80, 50, 120]);
    }, 450);

    setTimeout(() => {
      setGlitchPhase(2);
      vibrate([100, 50, 200, 50, 300]);
    }, 1100);

    setTimeout(() => {
      onUnlockStart();
    }, 2000);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 select-none overflow-hidden bg-gradient-to-b from-[#120e18] via-[#0b0811] to-[#050409]">
      {/* Background festive ambient warm lights */}
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-rose-600/15 blur-3xl pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full flex items-center justify-between pt-4 z-10"
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-200/80">
            Праздничное письмо ❄️
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-amber-300 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Новый Год
        </div>
      </motion.div>

      {/* Main Cozy Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="relative w-full max-w-[340px] my-auto flex flex-col items-center p-4 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-10"
      >
        {/* Decorative corner ribbons */}
        <div className="w-full relative aspect-square rounded-2xl overflow-hidden mb-4 border border-white/10 shadow-md bg-zinc-900/60">
          <img
            src="./assets/bait_cover.jpg"
            alt="Уютный Новый Год"
            onError={(e) => {
              // Fallback placeholder if image takes a second
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=800&q=80';
            }}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
            <span className="text-xs text-amber-200/90 font-medium">
              31 декабря, 23:59
            </span>
            <span className="text-base">🎄✨</span>
          </div>
        </div>

        {/* Card text */}
        <h2 className="text-xl font-bold tracking-tight text-center text-white mb-2 flex items-center justify-center gap-1.5">
          С Новым Годом!
          <Heart className="w-4 h-4 text-rose-400 fill-rose-400 inline" />
        </h2>
        <p className="text-xs text-center text-zinc-300 leading-relaxed px-2">
          Для самой лучшей подруги. Пусть наступающий год будет наполнен теплом,
          сказкой и самыми невероятными сюрпризами...
        </p>

        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent my-3.5" />

        <p className="text-[11px] text-amber-200/70 font-mono tracking-wide text-center">
          Нажми, чтобы развернуть подарок
        </p>
      </motion.div>

      {/* Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full max-w-[340px] pb-6 z-10"
      >
        <button
          onClick={handleOpenGift}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-white font-semibold text-base shadow-[0_0_25px_rgba(244,63,94,0.4)] active:scale-95 hover:brightness-110 transition-all flex items-center justify-center gap-2 group"
        >
          <Sparkles className="w-5 h-5 text-amber-200 group-hover:rotate-12 transition-transform" />
          <span>Открыть поздравление 🎄</span>
        </button>
      </motion.div>

      {/* GLITCH OVERLAY TAKEOVER */}
      <AnimatePresence>
        {isGlitching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#060608] flex flex-col items-center justify-center p-6 select-none overflow-hidden"
          >
            {/* Red / Cyan glitch scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-60 z-30 animate-pulse" />

            {/* Distorted chromatic RGB split layers */}
            <motion.div
              animate={{
                x: [-10, 8, -6, 12, -4, 0],
                y: [4, -6, 8, -4, 2, 0],
                filter: [
                  'hue-rotate(0deg) contrast(200%)',
                  'hue-rotate(90deg) contrast(300%)',
                  'hue-rotate(180deg) invert(30%)',
                  'hue-rotate(0deg)',
                ],
              }}
              transition={{ repeat: Infinity, duration: 0.18 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-red-500 mb-6 shadow-[0_0_40px_rgba(255,0,0,0.8)]">
                <AlertTriangle className="w-10 h-10 animate-bounce" />
              </div>

              <h1 className="text-2xl font-black font-mono tracking-widest text-red-500 uppercase mb-2 [text-shadow:_0_0_15px_#ff0033]">
                СИСТЕМА ПЕРЕХВАЧЕНА
              </h1>

              <div className="text-cyan-400 font-mono text-xs tracking-wider space-y-1 mb-6 bg-black/80 p-3 rounded-xl border border-cyan-500/40 w-full max-w-[300px] text-left">
                <div className="flex items-center gap-1 text-red-400 font-bold">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>ROOT EXPLOIT: SUCCESS</span>
                </div>
                <div className="text-zinc-400">TARGET: NY_GIFT_CONTAINER</div>
                <div className="text-cyan-300">
                  {glitchPhase >= 1 ? 'BYPASSING KERNEL MEMORY... [OK]' : 'INJECTING PAYLOAD...'}
                </div>
                <div className="text-emerald-400 font-bold">
                  {glitchPhase >= 2 ? 'DEVICE UNLOCKED: "ЧУЖОЙ СМАРТФОН"' : 'SYNCHRONIZING...'}
                </div>
              </div>

              {/* Fake loading bar */}
              <div className="w-full max-w-[280px] h-2 bg-zinc-900 rounded-full overflow-hidden border border-red-500/30">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.8, ease: 'easeInOut' }}
                  className="h-full bg-gradient-to-r from-red-600 via-pink-500 to-cyan-400"
                />
              </div>

              <p className="mt-4 text-[10px] font-mono text-zinc-500 tracking-widest uppercase">
                Переход на экран смартфона...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
