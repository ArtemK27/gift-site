import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSettings } from './SettingsContext';

export interface Track {
  id: string;
  title: string;
  artist: string;
  fandom: string;
  badge: string;
  src: string;
  cover: string;
  duration: number; // Duration in seconds
}

export const DEFAULT_TRACKS: Track[] = [
  {
    id: 'viperr-heavy-metal',
    title: 'Heavy Metal New Year',
    artist: 'VIPERR (Kai Angel & 9mice)',
    fandom: 'VIPERR',
    badge: 'LIVE 2027',
    src: './assets/audio/viperr-heavy-metal.mp3',
    cover: './assets/cover-viperr.jpg',
    duration: 147,
  },
  {
    id: 'sangwoo-lullaby',
    title: 'Midnight Penthouse',
    artist: 'О Сану (Killing Stalking)',
    fandom: 'Killing Stalking',
    badge: 'PENTHOUSE',
    src: './assets/audio/sangwoo-lullaby.mp3',
    cover: './assets/cover-sangwoo.jpg',
    duration: 168,
  },
  {
    id: 'erha-snow-melody',
    title: 'Snow at Sisheng Peak',
    artist: 'Чу Ваньнин & Мо Жань (Erha)',
    fandom: 'Erha',
    badge: 'SISHENG',
    src: './assets/audio/erha-snow-melody.mp3',
    cover: './assets/cover-erha.jpg',
    duration: 195,
  },
];

export interface AudioContextType {
  tracks: Track[];
  currentTrackIndex: number;
  currentTrack: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  selectTrack: (index: number) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { soundEnabled } = useSettings();
  const [tracks] = useState<Track[]>(DEFAULT_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(() => soundEnabled);
  const [currentTime, setCurrentTime] = useState<number>(42);
  const [duration, setDuration] = useState<number>(DEFAULT_TRACKS[0].duration);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const soundEnabledRef = useRef<boolean>(soundEnabled);
  const wasPlayingBeforeHiddenRef = useRef<boolean>(false);
  const wasPlayingBeforeMuteRef = useRef<boolean>(true);
  const fallbackTimerRef = useRef<number | null>(null);

  isPlayingRef.current = isPlaying;
  soundEnabledRef.current = soundEnabled;
  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Helper to safely play audio without unhandled promise rejection, respecting global soundEnabled
  const safePlayAudio = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio) return;
    audio.muted = !soundEnabledRef.current;
    if (!soundEnabledRef.current) {
      audio.pause();
      return;
    }
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Autoplay policy or abort, safe to log and allow synthetic timer fallback
        console.warn('Audio playback not allowed or aborted:', err?.message || err);
      });
    }
  }, []);

  // Sync with global soundEnabled switch from SettingsContext
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !soundEnabled;
    }
    if (!soundEnabled) {
      wasPlayingBeforeMuteRef.current = isPlayingRef.current;
      audio?.pause();
      if (isPlayingRef.current) {
        setIsPlaying(false);
      }
    } else if (wasPlayingBeforeMuteRef.current && !document.hidden) {
      setIsPlaying(true);
      safePlayAudio(audio);
    }
  }, [soundEnabled, safePlayAudio]);

  // Forward declaration of nextTrack for event listeners
  const nextTrackRef = useRef<() => void>(() => {});
  const prevTrackIndexRef = useRef<number>(currentTrackIndex);

  // Initialize HTML5 Audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = currentTrack.src;
    audio.muted = !soundEnabledRef.current;
    audioRef.current = audio;

    const onTimeUpdate = () => {
      if (!isNaN(audio.currentTime)) {
        setCurrentTime(Math.floor(audio.currentTime));
      }
    };

    const onLoadedMetadata = () => {
      if (!isNaN(audio.duration) && audio.duration > 0) {
        setDuration(Math.floor(audio.duration));
      }
    };

    const onCanPlay = () => {
      if (isPlayingRef.current && soundEnabledRef.current && audio.paused) {
        safePlayAudio(audio);
      }
    };

    const onEnded = () => {
      nextTrackRef.current();
    };

    const onError = () => {
      console.warn('Audio element error loading:', audio.src, '- falling back to visual synthetic progress');
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    if (isPlayingRef.current && soundEnabledRef.current) {
      safePlayAudio(audio);
    }

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audioRef.current = null;
    };
  }, [safePlayAudio]);

  // Resume audio automatically on the first user gesture if browser autoplay policy blocked initial mount play()
  useEffect(() => {
    const unlockAudioOnGesture = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (isPlayingRef.current && soundEnabledRef.current && audio.paused) {
        safePlayAudio(audio);
      }
    };

    window.addEventListener('pointerdown', unlockAudioOnGesture, { capture: true, passive: true });
    window.addEventListener('touchstart', unlockAudioOnGesture, { capture: true, passive: true });
    window.addEventListener('click', unlockAudioOnGesture, { capture: true, passive: true });
    window.addEventListener('keydown', unlockAudioOnGesture, { capture: true, passive: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudioOnGesture, { capture: true });
      window.removeEventListener('touchstart', unlockAudioOnGesture, { capture: true });
      window.removeEventListener('click', unlockAudioOnGesture, { capture: true });
      window.removeEventListener('keydown', unlockAudioOnGesture, { capture: true });
    };
  }, [safePlayAudio]);

  // Update track source ONLY when currentTrackIndex actually changes
  useEffect(() => {
    if (prevTrackIndexRef.current === currentTrackIndex) {
      return;
    }
    prevTrackIndexRef.current = currentTrackIndex;

    const audio = audioRef.current;
    if (!audio) return;

    audio.src = currentTrack.src;
    audio.currentTime = 0;
    audio.muted = !soundEnabledRef.current;
    setCurrentTime(0);
    setDuration(currentTrack.duration);

    if (isPlayingRef.current && soundEnabledRef.current) {
      safePlayAudio(audio);
    }
  }, [currentTrackIndex, currentTrack.src, currentTrack.duration, safePlayAudio]);

  // Fallback timer when real audio element cannot play or is paused by autoplay policy
  useEffect(() => {
    if (!isPlaying) {
      if (fallbackTimerRef.current) {
        clearInterval(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      return;
    }

    fallbackTimerRef.current = window.setInterval(() => {
      const audio = audioRef.current;
      // If audio is actively playing and reporting time, let timeupdate handle it
      if (audio && !audio.paused && !isNaN(audio.currentTime) && audio.currentTime > 0) {
        return;
      }

      // Otherwise simulate playback progress
      setCurrentTime((prev) => {
        const d = duration || currentTrack.duration;
        if (prev >= d) {
          nextTrackRef.current();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      if (fallbackTimerRef.current) {
        clearInterval(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, [isPlaying, duration, currentTrack.duration]);

  // R5: Smart Visibility Auto-Pause
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isPlayingRef.current) {
          wasPlayingBeforeHiddenRef.current = true;
          audioRef.current?.pause();
          setIsPlaying(false);
        } else {
          wasPlayingBeforeHiddenRef.current = false;
        }
      } else {
        if (wasPlayingBeforeHiddenRef.current && soundEnabledRef.current) {
          wasPlayingBeforeHiddenRef.current = false;
          safePlayAudio(audioRef.current);
          setIsPlaying(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [safePlayAudio]);

  const play = useCallback(() => {
    setIsPlaying(true);
    wasPlayingBeforeMuteRef.current = true;
    safePlayAudio(audioRef.current);
  }, [safePlayAudio]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    wasPlayingBeforeMuteRef.current = false;
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlayingRef.current) {
      pause();
    } else {
      play();
    }
  }, [play, pause]);

  const nextTrack = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
  }, [tracks.length]);

  const prevTrack = useCallback(() => {
    if (currentTime > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    } else {
      setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    }
  }, [currentTime, tracks.length]);

  nextTrackRef.current = nextTrack;

  const seek = useCallback((seconds: number) => {
    if (audioRef.current && !isNaN(seconds)) {
      audioRef.current.currentTime = seconds;
    }
    setCurrentTime(seconds);
  }, []);

  const selectTrack = useCallback((index: number) => {
    if (index >= 0 && index < tracks.length) {
      setCurrentTrackIndex(index);
    }
  }, [tracks.length]);

  return (
    <AudioContext.Provider
      value={{
        tracks,
        currentTrackIndex,
        currentTrack,
        isPlaying,
        currentTime,
        duration: duration || currentTrack.duration,
        play,
        pause,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        selectTrack,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
