import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Disc3, Sparkles, Volume2, ChevronUp } from 'lucide-react';
import { vibrate, playTapSound } from '../utils/haptics';

interface DynamicIslandProps {
  className?: string;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [trackProgress, setTrackProgress] = useState(42);
  const audioLoopRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Synthesize rhythmic festive synth loop when playing
  useEffect(() => {
    if (!isPlaying) {
      if (audioLoopRef.current) {
        clearInterval(audioLoopRef.current);
        audioLoopRef.current = null;
      }
      return;
    }

    // Melodic sequence (Goth / Cyberpunk minor key festive arpeggio)
    const notes = [220, 261.63, 329.63, 440, 392, 329.63, 261.63, 246.94];
    let noteIdx = 0;

    audioLoopRef.current = window.setInterval(() => {
      setTrackProgress((prev) => (prev >= 147 ? 0 : prev + 1));
      
      // Gentle ambient synth pluck
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioContextClass) audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx && ctx.state === 'running') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const freq = notes[noteIdx % notes.length];
          noteIdx++;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          gain.gain.setValueAtTime(0.015, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0005, ctx.currentTime + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        }
      } catch {
        // Audio unavailable
      }
    }, 450);

    return () => {
      if (audioLoopRef.current) clearInterval(audioLoopRef.current);
    };
  }, [isPlaying]);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    vibrate(18);
    playTapSound(600, 0.05);
    setIsExpanded((prev) => !prev);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    vibrate(25);
    playTapSound(isPlaying ? 350 : 700, 0.06);
    if (!isPlaying && audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    setIsPlaying((prev) => !prev);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={`relative z-50 flex justify-center w-full px-4 pt-2 select-none ${className}`}>
      <motion.div
        layout
        onClick={!isExpanded ? toggleExpand : undefined}
        transition={{
          type: 'spring',
          stiffness: 420,
          damping: 30,
          mass: 0.8,
        }}
        className={`bg-black/95 backdrop-blur-2xl border border-white/15 text-white shadow-[0_12px_40px_rgba(0,0,0,0.85)] cursor-pointer overflow-hidden transition-colors ${
          isExpanded
            ? 'w-[370px] rounded-[32px] p-4 border-white/20'
            : 'h-8 px-3.5 rounded-full flex items-center justify-between gap-3 hover:border-white/30'
        }`}
      >
        {!isExpanded ? (
          // Compact Pill View
          <div className="flex items-center justify-between w-full h-full gap-2.5">
            <div className="flex items-center gap-2">
              <motion.div
                animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-400 flex items-center justify-center shadow-sm"
              >
                <div className="w-1.5 h-1.5 bg-black rounded-full" />
              </motion.div>
              <span className="text-[11px] font-semibold tracking-tight text-white/90">
                VIPERR
              </span>
            </div>

            {/* Mini jumping equalizer bars */}
            <div className="flex items-center gap-[2.5px] h-3">
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
          // Expanded Player View
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  LIVE 2027
                </span>
                <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  Heavy Metal NY
                </span>
              </div>
              <button
                onClick={toggleExpand}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-zinc-400 hover:text-white"
                title="Свернуть"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>

            {/* Main player layout */}
            <div className="flex items-center gap-3.5">
              {/* Vinyl / Album Art */}
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 p-1 border border-white/10 shadow-inner flex-shrink-0">
                <motion.div
                  animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="w-full h-full rounded-xl bg-gradient-to-tr from-purple-900 via-zinc-900 to-red-900 flex items-center justify-center relative border border-white/15"
                >
                  <Disc3 className="w-8 h-8 text-white/70" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_40%,_rgba(0,0,0,0.6)_100%)] rounded-xl" />
                  <div className="w-3 h-3 bg-red-500 rounded-full border border-white/60 absolute shadow-[0_0_8px_#ff0055]" />
                </motion.div>
              </div>

              {/* Title & Artist & Equalizer */}
              <div className="flex flex-col justify-between flex-grow min-w-0">
                <div className="truncate">
                  <div className="text-sm font-bold tracking-tight text-white truncate flex items-center gap-1.5">
                    Heavy Metal New Year
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse flex-shrink-0" />
                  </div>
                  <div className="text-xs text-zinc-400 truncate font-medium">
                    VIPERR (Kai Angel & 9mice)
                  </div>
                </div>

                {/* Animated 8-bar audio equalizer */}
                <div className="flex items-center gap-1 h-4 mt-2">
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

              {/* Play / Pause button */}
              <button
                onClick={togglePlay}
                className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform flex-shrink-0 shadow-lg shadow-white/20"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-black" />
                ) : (
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                )}
              </button>
            </div>

            {/* Scrubber progress */}
            <div className="flex flex-col gap-1 pt-1">
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${(trackProgress / 147) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>{formatTime(trackProgress)}</span>
                <span>2:27</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
