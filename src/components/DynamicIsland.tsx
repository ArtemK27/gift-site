import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronUp, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { playTapSound, vibrate } from '../utils/haptics';

export const DynamicIsland: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [expanded, setExpanded] = useState(false);
  const islandRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { currentTrack, isPlaying, currentTime, duration, togglePlay, prevTrack, nextTrack, seek } = useAudio();
  const total = duration || currentTrack.duration || 147;
  const format = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  const collapse = () => {
    setExpanded(false);
    requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-label="Открыть музыкальный плеер"]')?.focus());
  };

  useEffect(() => {
    if (!expanded) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') collapse(); };
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

  return (
    <div data-testid="dynamic-island" className={`relative z-50 shrink-0 h-[31px] w-full select-none ${className}`}>
      <div className="absolute top-1 left-3 right-3 flex justify-center pointer-events-none">
        <motion.div
          ref={islandRef}
          layout={!reducedMotion}
          transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 32 }}
          className={`pointer-events-auto max-w-full bg-black text-white overflow-hidden shadow-lg ${expanded ? 'w-[min(320px,100%)] rounded-[28px] p-3.5' : 'rounded-full'}`}
        >
          {!expanded ? (
            <button type="button" aria-label="Открыть музыкальный плеер" onClick={() => tap(() => setExpanded(true))}
              className="h-[31px] max-w-full flex items-center gap-2 px-2.5 rounded-full hover:bg-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
              <img src={currentTrack.cover} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
              <span className="text-xs font-medium truncate max-w-32">{currentTrack.fandom || currentTrack.title}</span>
              <span className="flex items-end gap-[2px] h-3" aria-hidden="true">
                {[6, 10, 7].map((height, i) => <span key={i} className={`w-[2px] rounded-full bg-white/75 ${isPlaying && !reducedMotion ? 'animate-pulse' : ''}`} style={{ height }} />)}
              </span>
            </button>
          ) : (
            <div className="space-y-3" onPointerDown={(event) => event.stopPropagation()}>
              <div className="flex items-center gap-3 min-w-0">
                <img src={currentTrack.cover} alt={currentTrack.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{currentTrack.title}</div>
                  <div className="text-xs text-zinc-400 truncate">{currentTrack.artist}</div>
                </div>
                <button type="button" aria-label="Свернуть" onClick={() => tap(collapse)} className="w-9 h-9 grid place-items-center rounded-full hover:bg-white/10 shrink-0"><ChevronUp size={18} /></button>
              </div>
              <input type="range" aria-label="Перемотка трека" min={0} max={total} value={Math.min(currentTime, total)}
                onChange={(event) => seek(Number(event.target.value))} className="w-full h-2 accent-white cursor-pointer" />
              <div className="flex justify-between text-[10px] text-zinc-400 -mt-2"><span>{format(currentTime)}</span><span>{format(total)}</span></div>
              <div className="flex items-center justify-center gap-6">
                <button type="button" aria-label="Предыдущий трек" onClick={() => tap(prevTrack)} className="w-10 h-10 grid place-items-center rounded-full hover:bg-white/10"><SkipBack size={19} fill="currentColor" /></button>
                <button type="button" aria-label={isPlaying ? 'Приостановить музыку' : 'Включить музыку'} onClick={() => tap(togglePlay)} className="w-11 h-11 grid place-items-center rounded-full bg-white text-black">{isPlaying ? <Pause size={21} fill="currentColor" /> : <Play size={21} fill="currentColor" />}</button>
                <button type="button" aria-label="Следующий трек" onClick={() => tap(nextTrack)} className="w-10 h-10 grid place-items-center rounded-full hover:bg-white/10"><SkipForward size={19} fill="currentColor" /></button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
