import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, ChevronUp, Volume2, Sparkles, Music2 } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { vibrate, playTapSound } from '../utils/haptics';

interface DynamicIslandProps {
  className?: string;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const islandRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
  } = useAudio();

  // Escape key listener to collapse
  useEffect(() => {
    if (!isExpanded) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
        requestAnimationFrame(() => {
          document.querySelector<HTMLElement>('[aria-label="Открыть музыкальный плеер"]')?.focus();
        });
      }
    };
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [isExpanded]);

  // Click-outside listener
  useEffect(() => {
    if (!isExpanded) return;
    const handlePointerDownOutside = (e: PointerEvent | MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // Do not collapse if clicked inside dynamic island
      if (islandRef.current?.contains(target)) return;
      // Do not collapse if interacting with home indicator or launching apps (preserve multitasking)
      if (
        target.closest('#ios-home-indicator') ||
        target.closest('[data-testid="app-icon"]') ||
        target.closest('[data-testid="home-pages"]')
      ) {
        return;
      }
      // If clicked on backdrop / outer phone chassis area
      if (target.classList?.contains('phone-stage') || target.closest('[data-testid="phone-chassis"]')) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDownOutside);
    return () => document.removeEventListener('pointerdown', handlePointerDownOutside);
  }, [isExpanded]);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    vibrate(18);
    playTapSound(600, 0.05);
    setIsExpanded((prev) => !prev);
  };

  const handleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    vibrate(18);
    playTapSound(500, 0.04);
    setIsExpanded(false);
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('[aria-label="Открыть музыкальный плеер"]')?.focus();
    });
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    vibrate(25);
    playTapSound(isPlaying ? 350 : 700, 0.06);
    togglePlay();
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    vibrate(15);
    playTapSound(480, 0.04);
    prevTrack();
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    vibrate(15);
    playTapSound(520, 0.04);
    nextTrack();
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = Math.floor(pct * (duration || currentTrack.duration));
    seek(newTime);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentDuration = duration || currentTrack.duration || 147;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / currentDuration) * 100));

  return (
    // Reserve only the compact pill's space: expansion must never push or resize elements below.
    <div
      data-testid="dynamic-island"
      className={`relative z-50 shrink-0 h-10 w-full select-none ${className}`}
    >
      <div className="absolute top-2 left-4 right-4 flex justify-center pointer-events-none">
        <motion.div
          ref={islandRef}
          layout={!reducedMotion}
          role={!isExpanded ? 'button' : undefined}
          tabIndex={!isExpanded ? 0 : undefined}
          aria-label={!isExpanded ? 'Открыть музыкальный плеер' : undefined}
          onKeyDown={
            !isExpanded
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsExpanded(true);
                  }
                }
              : undefined
          }
          onClick={!isExpanded ? toggleExpand : undefined}
          drag={isExpanded ? 'y' : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.25, bottom: 0.05 }}
          onDragEnd={(_, info) => {
            // Swipe up gesture collapses island
            if (info.offset.y < -20 || info.velocity.y < -250) {
              vibrate(18);
              setIsExpanded(false);
            }
          }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : {
                  type: 'spring',
                  stiffness: 420,
                  damping: 30,
                  mass: 0.8,
                }
          }
          className={`pointer-events-auto max-w-full bg-black/95 backdrop-blur-2xl border border-white/15 text-white shadow-[0_12px_40px_rgba(0,0,0,0.85)] cursor-pointer overflow-hidden transition-colors ${
            isExpanded
              ? 'w-[370px] rounded-[32px] p-4 border-white/20'
              : 'h-8 px-3.5 rounded-full flex items-center justify-between gap-3 hover:border-white/30'
          }`}
        >
          {!isExpanded ? (
            // ================= COMPACT PILL VIEW =================
            <div className="flex items-center justify-between w-full h-full gap-2.5">
              <div className="flex items-center gap-2 min-w-0">
                {/* Rotating mini vinyl cover */}
                <motion.div
                  animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 rounded-full overflow-hidden bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-400 flex items-center justify-center shadow-sm flex-shrink-0 relative border border-white/20"
                >
                  {currentTrack.cover ? (
                    <img
                      src={currentTrack.cover}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                  )}
                </motion.div>
                <span className="text-[11px] font-semibold tracking-tight text-white/90 truncate max-w-[120px]">
                  {currentTrack.fandom || currentTrack.title}
                </span>
              </div>

              {/* Mini animated equalizer bars */}
              <div className="flex items-center gap-[2.5px] h-3 flex-shrink-0">
                {[0.4, 0.8, 0.5, 0.9, 0.3].map((height, i) => (
                  <motion.div
                    key={i}
                    animate={isPlaying ? { scaleY: [0.3, height, 0.2] } : { scaleY: 0.2 }}
                    transition={{
                      duration: 0.55 + i * 0.1,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut',
                    }}
                    className="w-[2.5px] h-3 bg-gradient-to-t from-cyan-400 to-pink-500 rounded-full origin-bottom"
                  />
                ))}
              </div>
            </div>
          ) : (
            // ================= EXPANDED PLAYER VIEW =================
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3.5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header info bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex-shrink-0">
                    {currentTrack.badge || 'LIVE 2027'}
                  </span>
                  <span className="text-xs font-mono text-zinc-400 flex items-center gap-1 truncate">
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="truncate">{currentTrack.title}</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCollapse}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-zinc-400 hover:text-white flex-shrink-0 ml-2"
                  title="Свернуть"
                  aria-label="Свернуть"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>

              {/* Main player layout: Cover Art + Info + Equalizer */}
              <div className="flex items-center gap-3.5">
                {/* Album Art Thumbnail with subtle vinyl shadow */}
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 p-0.5 border border-white/15 shadow-md flex-shrink-0">
                  <img
                    src={currentTrack.cover}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      // Fallback icon if image fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Subtle spinning vinyl center indicator */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none rounded-xl" />
                </div>

                {/* Title & Artist & Equalizer */}
                <div className="flex flex-col justify-between flex-grow min-w-0">
                  <div className="truncate">
                    <div className="text-sm font-bold tracking-tight text-white truncate flex items-center gap-1.5">
                      <span className="truncate">{currentTrack.title}</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse flex-shrink-0" />
                    </div>
                    <div className="text-xs text-zinc-400 truncate font-medium mt-0.5">
                      {currentTrack.artist}
                    </div>
                  </div>

                  {/* Animated 8-bar audio equalizer */}
                  <div className="flex items-center gap-1 h-3.5 mt-2">
                    {[0.5, 0.9, 0.3, 0.75, 1.0, 0.45, 0.85, 0.6].map((peak, idx) => (
                      <motion.div
                        key={idx}
                        animate={
                          isPlaying
                            ? { scaleY: [0.15, peak, 0.25] }
                            : { scaleY: 0.15 }
                        }
                        transition={{
                          duration: 0.45 + (idx % 3) * 0.15,
                          repeat: Infinity,
                          repeatType: 'reverse',
                          ease: 'easeInOut',
                        }}
                        className="flex-1 h-full bg-gradient-to-t from-cyan-500 via-pink-500 to-yellow-400 rounded-full origin-bottom"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Scrubber progress bar */}
              <div className="flex flex-col gap-1 pt-0.5">
                <div
                  role="slider"
                  aria-label="Перемотка трека"
                  aria-valuemin={0}
                  aria-valuemax={currentDuration}
                  aria-valuenow={currentTime}
                  tabIndex={0}
                  onClick={handleScrubberClick}
                  className="w-full h-2 bg-white/15 rounded-full overflow-hidden cursor-pointer hover:h-2.5 transition-all flex items-center"
                >
                  <div
                    className="h-full bg-gradient-to-r from-red-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-200"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(currentDuration)}</span>
                </div>
              </div>

              {/* Transport Controls: Prev, Play/Pause, Next */}
              <div className="flex items-center justify-center gap-6 pt-1">
                {/* Prev Button */}
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Предыдущий трек"
                  title="Предыдущий трек"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white flex items-center justify-center shadow-md hover:border hover:border-white/20"
                >
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>

                {/* Play / Pause Button */}
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  aria-label={isPlaying ? 'Приостановить музыку' : 'Включить музыку'}
                  title={isPlaying ? 'Приостановить музыку' : 'Включить музыку'}
                  className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform flex-shrink-0 shadow-lg shadow-white/20"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-black" />
                  ) : (
                    <Play className="w-5 h-5 fill-black ml-0.5" />
                  )}
                </button>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Следующий трек"
                  title="Следующий трек"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white flex items-center justify-center shadow-md hover:border hover:border-white/20"
                >
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
