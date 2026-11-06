import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronUp, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { playTapSound, vibrate } from '../utils/haptics';

export const formatTrackTime = (seconds: number): string => {
  const safe = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
};

export const clampProgressPercent = (current: number, total: number): number => {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, (current / total) * 100));
};

/**
 * Self-contained rotating Vinyl Record component.
 * Uses requestAnimationFrame to accumulate rotation angle smoothly when playing,
 * and freezes at the exact angle when paused.
 */
const VinylDisc: React.FC<{
  cover: string;
  title?: string;
  isPlaying: boolean;
  reducedMotion: boolean;
  size: 'sm' | 'lg';
  testId: string;
}> = ({ cover, title = '', isPlaying, reducedMotion, size, testId }) => {
  const discRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying || reducedMotion) return;
    let rafId: number;
    let last = performance.now();
    const speedDegPerSec = size === 'sm' ? 80 : 62;

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      angleRef.current = (angleRef.current + dt * speedDegPerSec) % 360;
      if (discRef.current) {
        discRef.current.style.transform = `rotate(${angleRef.current}deg)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, reducedMotion, size]);

  const isSmall = size === 'sm';

  return (
    <div
      data-testid={testId}
      className={`relative shrink-0 flex items-center justify-center ${
        isSmall ? 'w-[22px] h-[22px]' : 'w-[46px] h-[46px]'
      }`}
    >
      {/* Rotating Vinyl Disc */}
      <div
        ref={discRef}
        style={{ transform: `rotate(${angleRef.current}deg)` }}
        className={`relative rounded-full bg-[#09090d] border border-white/20 shadow-inner flex items-center justify-center overflow-hidden will-change-transform ${
          isSmall ? 'w-[22px] h-[22px]' : 'w-[44px] h-[44px]'
        }`}
      >
        {/* Subtle metallic vinyl sheen */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.28) 40deg, transparent 80deg, transparent 180deg, rgba(255,255,255,0.28) 220deg, transparent 260deg)',
          }}
        />
        {/* Concentric vinyl micro-grooves */}
        <div
          className="absolute inset-0 rounded-full opacity-50"
          style={{
            background: isSmall
              ? 'repeating-radial-gradient(circle at center, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 0.8px, transparent 1.2px, transparent 2.4px)'
              : 'repeating-radial-gradient(circle at center, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 1px, transparent 1.8px, transparent 3.4px)',
          }}
        />
        {/* Center Album Art Label */}
        <img
          src={cover}
          alt={title}
          className={`rounded-full object-cover border border-white/35 relative z-10 ${
            isSmall ? 'w-[12px] h-[12px]' : 'w-[22px] h-[22px]'
          }`}
        />
        {/* Vinyl Marker Dot on Label */}
        <span
          className={`absolute z-20 rounded-full bg-amber-300 ${
            isSmall ? 'w-[2px] h-[2px] top-[5px]' : 'w-[3px] h-[3px] top-[11px]'
          }`}
        />
        {/* Center Spindle Hole */}
        <span
          className={`rounded-full bg-[#000000] border border-white/50 relative z-20 ${
            isSmall ? 'w-[3px] h-[3px]' : 'w-[5px] h-[5px]'
          }`}
        />
      </div>
    </div>
  );
};

export const DynamicIsland: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [expanded, setExpanded] = useState(false);
  const islandRef = useRef<HTMLDivElement>(null);
  const reducedMotion = !!useReducedMotion();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    prevTrack,
    nextTrack,
    seek,
  } = useAudio();

  const total = duration || currentTrack.duration || 147;
  const progressPercent = clampProgressPercent(currentTime, total);

  const collapse = () => {
    setExpanded(false);
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>('[aria-label="Открыть музыкальный плеер"]')?.focus()
    );
  };

  useEffect(() => {
    if (!expanded) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') collapse();
    };
    const onOutside = (event: PointerEvent) => {
      if (!islandRef.current?.contains(event.target as Node)) setExpanded(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onOutside);
    };
  }, [expanded]);

  const tap = (action: () => void) => {
    vibrate(15);
    playTapSound(520, 0.04);
    action();
  };

  const eqPlayState: React.CSSProperties = {
    animationPlayState: isPlaying && !reducedMotion ? 'running' : 'paused',
  };

  return (
    <div
      data-testid="dynamic-island"
      className={`absolute left-1/2 -translate-x-1/2 top-[7px] z-50 flex justify-center pointer-events-none select-none ${className}`}
    >
      <motion.div
        ref={islandRef}
        layout={!reducedMotion}
        transition={
          reducedMotion
            ? { duration: 0 }
            : {
                layout: {
                  type: 'spring',
                  stiffness: 420,
                  damping: 32,
                  mass: 0.72,
                },
              }
        }
        className={`pointer-events-auto relative text-white overflow-hidden bg-[#000000] border border-white/[0.08] ${
          expanded
            ? 'w-[min(372px,calc(100vw-24px))] sm:w-[376px] rounded-[30px] px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.88)]'
            : 'rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.65)]'
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {!expanded ? (
            <motion.button
              key="island-collapsed"
              type="button"
              aria-label="Открыть музыкальный плеер"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
              whileHover={reducedMotion ? undefined : { scale: 1.03 }}
              whileTap={reducedMotion ? undefined : { scale: 0.95 }}
              onClick={() => tap(() => setExpanded(true))}
              className="relative z-10 h-[30px] w-[108px] flex items-center justify-between px-2 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60"
            >
              {/* Left: Rotating Vinyl Record / Cover ONLY */}
              <VinylDisc
                cover={currentTrack.cover}
                isPlaying={isPlaying}
                reducedMotion={reducedMotion}
                size="sm"
                testId="island-vinyl-collapsed"
              />

              {/* Center: Subtle iPhone TrueDepth Camera Lens */}
              <span
                aria-hidden="true"
                className="w-2.5 h-2.5 rounded-full bg-[#09090f] border border-white/[0.05] shadow-inner shrink-0"
              />

              {/* Right: Live Animated Sound Waves (Equalizer) */}
              <span className="flex items-end gap-[2.5px] h-3.5 pr-0.5" aria-hidden="true">
                {[
                  { h: 'h-2.5', anim: 'animate-eq-1', color: 'bg-emerald-400' },
                  { h: 'h-3.5', anim: 'animate-eq-2', color: 'bg-sky-400' },
                  { h: 'h-2', anim: 'animate-eq-3', color: 'bg-amber-300' },
                  { h: 'h-3', anim: 'animate-eq-4', color: 'bg-rose-400' },
                ].map((bar, i) => (
                  <span
                    key={i}
                    style={eqPlayState}
                    className={`w-[2.5px] rounded-full ${bar.color} ${bar.h} ${
                      isPlaying && !reducedMotion ? bar.anim : 'scale-y-50 opacity-45'
                    }`}
                  />
                ))}
              </span>
            </motion.button>
          ) : (
            <motion.div
              key="island-expanded"
              initial={reducedMotion ? false : { opacity: 0, y: -4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 space-y-2.5"
              onPointerDown={(event) => event.stopPropagation()}
            >
              {/* Row 1: Spinning Vinyl + Track Title/Artist + Equalizer & Collapse Button */}
              <div className="flex items-center gap-3 min-w-0">
                <VinylDisc
                  cover={currentTrack.cover}
                  title={currentTrack.title}
                  isPlaying={isPlaying}
                  reducedMotion={reducedMotion}
                  size="lg"
                  testId="island-vinyl-expanded"
                />

                <div className="min-w-0 flex-1">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={currentTrack.id}
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.14 }}
                    >
                      <div className="text-sm font-bold tracking-tight text-white truncate leading-tight">
                        {currentTrack.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {currentTrack.artist}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Mini waveform + Collapse button */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-end gap-[2.5px] h-4" aria-hidden="true">
                    {[
                      { h: 'h-3', anim: 'animate-eq-1', color: 'bg-emerald-400' },
                      { h: 'h-4', anim: 'animate-eq-2', color: 'bg-sky-400' },
                      { h: 'h-2.5', anim: 'animate-eq-3', color: 'bg-amber-300' },
                      { h: 'h-3.5', anim: 'animate-eq-4', color: 'bg-rose-400' },
                    ].map((bar, i) => (
                      <span
                        key={i}
                        style={eqPlayState}
                        className={`w-[2.5px] rounded-full ${bar.color} ${bar.h} ${
                          isPlaying && !reducedMotion ? bar.anim : 'scale-y-50 opacity-45'
                        }`}
                      />
                    ))}
                  </span>

                  <button
                    type="button"
                    aria-label="Свернуть"
                    onClick={() => tap(collapse)}
                    className="w-7 h-7 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 active:scale-90 border border-white/10 shrink-0 transition-all"
                  >
                    <ChevronUp size={15} />
                  </button>
                </div>
              </div>

              {/* Row 2: Inline iOS Scrubber (Time - Bar - Total) */}
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-mono text-white/55 w-7 text-left shrink-0">
                  {formatTrackTime(currentTime)}
                </span>

                <div className="relative flex-1 h-4 flex items-center">
                  <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white/85 transition-[width] duration-200"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div
                    className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white shadow"
                    style={{ left: `${progressPercent}%` }}
                  />
                  <input
                    type="range"
                    aria-label="Перемотка трека"
                    min={0}
                    max={total}
                    value={Math.min(currentTime, total)}
                    onChange={(event) => seek(Number(event.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                <span className="text-[10px] font-mono text-white/55 w-7 text-right shrink-0">
                  {formatTrackTime(total)}
                </span>
              </div>

              {/* Row 3: Compact Playback Controls */}
              <div className="flex items-center justify-center gap-7">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.88 }}
                  aria-label="Предыдущий трек"
                  onClick={() => tap(prevTrack)}
                  className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/10 text-white/90 transition-colors"
                >
                  <SkipBack size={18} fill="currentColor" />
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  aria-label={isPlaying ? 'Приостановить музыку' : 'Включить музыку'}
                  onClick={() => tap(togglePlay)}
                  className="w-9 h-9 grid place-items-center rounded-full bg-white text-black shadow-md transition-all"
                >
                  {isPlaying ? (
                    <Pause size={18} fill="currentColor" />
                  ) : (
                    <Play size={18} fill="currentColor" className="ml-0.5" />
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.88 }}
                  aria-label="Следующий трек"
                  onClick={() => tap(nextTrack)}
                  className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/10 text-white/90 transition-colors"
                >
                  <SkipForward size={18} fill="currentColor" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
