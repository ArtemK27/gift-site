import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vibrate, playFrogCroakSound } from '../../utils/haptics';

const FROG_STORAGE_KEY = 'ios18_frog_clicks_v1';

const FROG_STATUSES = [
  'Жаба довольна',
  '+100 к удаче ✨',
  'С Новым годом! 🎄',
  'Дзен и цитрусы 🍊',
  'Босс болота 👑',
];

interface FrogParticle {
  id: number;
  x: number;
  y: number;
  symbol: string;
}

/**
 * Interactive "Жаба удачи 2027 🐸" clicker widget for Home Screen Page 2.
 * Separate modular widget file for easy maintenance and extension.
 */
export const FrogClickerWidget: React.FC = () => {
  const [clicks, setClicks] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(FROG_STORAGE_KEY);
        if (saved) return Math.max(0, parseInt(saved, 10) || 0);
      } catch {}
    }
    return 0;
  });

  const [squishKey, setSquishKey] = useState<number>(0);
  const [particles, setParticles] = useState<FrogParticle[]>([]);
  const particleIdRef = useRef(0);

  useEffect(() => {
    try {
      window.localStorage.setItem(FROG_STORAGE_KEY, String(clicks));
    } catch {}
  }, [clicks]);

  useEffect(() => {
    const onReset = () => {
      setClicks(0);
      try {
        window.localStorage.removeItem(FROG_STORAGE_KEY);
      } catch {}
    };
    window.addEventListener('ios18_quest_reset', onReset);
    return () => window.removeEventListener('ios18_quest_reset', onReset);
  }, []);

  const statusIndex = Math.floor(clicks / 3) % FROG_STATUSES.length;
  const currentStatus = FROG_STATUSES[statusIndex];

  const handleFrogClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(20);
      }
    } catch {}
    vibrate(20);
    // Play a short playful frog croak ("ква") sound
    playFrogCroakSound();

    setClicks((prev) => prev + 1);
    setSquishKey((prev) => prev + 1);

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX ? e.clientX - rect.left : rect.width / 2;
    const clickY = e.clientY ? e.clientY - rect.top : rect.height / 2;

    const symbols = ['🍊', '🪙', '✨', '🍊', '🪙'];
    const id1 = ++particleIdRef.current;
    const id2 = ++particleIdRef.current;

    setParticles((prev) => [
      ...prev.slice(-8),
      {
        id: id1,
        x: clickX - 10 + (Math.random() * 16 - 8),
        y: clickY - 10,
        symbol: symbols[id1 % symbols.length],
      },
      {
        id: id2,
        x: clickX + 8 + (Math.random() * 16 - 8),
        y: clickY - 14,
        symbol: symbols[id2 % symbols.length],
      },
    ]);
  };

  return (
    <motion.div
      data-testid="frog-clicker-widget"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      onClick={handleFrogClick}
      onPointerDown={(e) => e.stopPropagation()}
      role="button"
      tabIndex={0}
      aria-label="Жаба удачи 2027"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleFrogClick(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }}
      className="h-[148px] rounded-[26px] bg-gradient-to-br from-[#0d2218]/90 via-[#101c18]/90 to-[#141824]/90 hover:from-[#112a1e]/95 border border-emerald-400/25 backdrop-blur-2xl p-3 sm:p-3.5 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.45)] relative overflow-hidden cursor-pointer select-none"
    >
      {/* Subtle ambient lily-pad glow */}
      <div className="pointer-events-none absolute -top-8 -right-8 w-24 h-24 rounded-full bg-emerald-400/15 blur-xl" />

      {/* Top Header: Full-width single line so it never wraps */}
      <div className="relative z-10 flex items-center justify-between gap-1 min-w-0">
        <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wide text-emerald-300 whitespace-nowrap">
          ЖАБА УДАЧИ 2027 🐸
        </span>
      </div>

      {/* Middle Row: Status Text + SVG Cute Meme Frog in Santa Hat */}
      <div className="flex items-center justify-between gap-1.5 relative z-10 my-auto">
        <span
          data-testid="frog-status-text"
          className="text-[10.5px] sm:text-[11px] text-white/90 font-medium leading-snug min-w-0 flex-1"
        >
          {currentStatus}
        </span>

        {/* Multi-layered SVG Meme Frog in New Year Santa Hat */}
        <motion.div
          key={squishKey}
          animate={
            squishKey > 0
              ? {
                  scaleX: [1, 1.22, 0.9, 1.04, 1],
                  scaleY: [1, 0.78, 1.14, 0.97, 1],
                  y: [0, 2, -6, 0],
                }
              : undefined
          }
          transition={{ duration: 0.34, ease: 'easeOut' }}
          className="w-12 h-12 shrink-0 -my-1 -mr-0.5 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
        >
          <svg viewBox="0 0 72 72" fill="none" className="w-full h-full">
            <defs>
              <linearGradient id="frog-body" x1="36" y1="22" x2="36" y2="66" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="65%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
              <linearGradient id="frog-belly" x1="36" y1="40" x2="36" y2="64" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#bef264" />
              </linearGradient>
              <linearGradient id="santa-hat" x1="20" y1="4" x2="52" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="55%" stopColor="#e11d48" />
                <stop offset="100%" stopColor="#9f1239" />
              </linearGradient>
            </defs>

            {/* Frog Left & Right Eye Bulges */}
            <circle cx="23" cy="30" r="9.5" fill="url(#frog-body)" />
            <circle cx="49" cy="30" r="9.5" fill="url(#frog-body)" />

            {/* Frog Plump Chubby Body */}
            <ellipse cx="36" cy="46" rx="23" ry="17" fill="url(#frog-body)" />
            {/* Cream-Yellow Frog Belly */}
            <ellipse cx="36" cy="50" rx="15" ry="10.5" fill="url(#frog-belly)" />

            {/* Big Glossy Eyes */}
            <circle cx="23" cy="29" r="6" fill="#ffffff" />
            <circle cx="49" cy="29" r="6" fill="#ffffff" />
            <circle cx="23.5" cy="29" r="3.4" fill="#090d16" />
            <circle cx="49.5" cy="29" r="3.4" fill="#090d16" />
            {/* Eye Specular Sparkles */}
            <circle cx="22" cy="27.5" r="1.4" fill="#ffffff" />
            <circle cx="48" cy="27.5" r="1.4" fill="#ffffff" />

            {/* Rosy Cheeks */}
            <ellipse cx="17" cy="40" rx="4" ry="2.3" fill="#fb7185" fillOpacity="0.65" />
            <ellipse cx="55" cy="40" rx="4" ry="2.3" fill="#fb7185" fillOpacity="0.65" />

            {/* Happy Smug Meme Frog Smile */}
            <path
              d="M24 39.5C28 43.5 44 43.5 48 39.5"
              stroke="#064e3b"
              strokeWidth="2.4"
              strokeLinecap="round"
            />

            {/* Little Front Paws */}
            <ellipse cx="22" cy="60" rx="4.5" ry="2.8" fill="#16a34a" />
            <ellipse cx="50" cy="60" rx="4.5" ry="2.8" fill="#16a34a" />

            {/* Festive New Year Santa Hat on Frog's Head */}
            <path
              d="M22 22C25 10 38 6 52 15C47 18 42 20 22 22Z"
              fill="url(#santa-hat)"
            />
            {/* White Fluffy Hat Brim */}
            <rect
              x="19"
              y="19"
              width="28"
              height="6"
              rx="3"
              transform="rotate(-6 19 19)"
              fill="#ffffff"
            />
            {/* White Pom-Pom on Tip */}
            <circle cx="53" cy="15.5" r="4.2" fill="#ffffff" />
          </svg>
        </motion.div>
      </div>

      {/* Bottom Row: Click Counter */}
      <div className="relative z-10 pt-1 border-t border-white/10 flex items-center justify-between gap-1 text-[9.5px] sm:text-[10px] font-mono whitespace-nowrap">
        <span className="text-emerald-300 font-bold truncate" data-testid="frog-click-counter">
          Кваков: {clicks}
        </span>
        <span className="text-amber-300/90 shrink-0 font-semibold">ЖМЯК 🍊</span>
      </div>

      {/* Flying Tangerine & Coin Particles */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 1, scale: 0.7, x: p.x, y: p.y }}
              animate={{
                opacity: 0,
                scale: 1.25,
                x: p.x + ((p.id % 2 === 0 ? 1 : -1) * 18),
                y: p.y - 38,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="absolute text-sm select-none"
            >
              {p.symbol}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FrogClickerWidget;
