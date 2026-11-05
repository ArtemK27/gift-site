import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

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
  const [tracks] = useState<Track[]>(DEFAULT_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(42);
  const [duration, setDuration] = useState<number>(DEFAULT_TRACKS[0].duration);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const wasPlayingBeforeHiddenRef = useRef<boolean>(false);
  const fallbackTimerRef = useRef<number | null>(null);

  isPlayingRef.current = isPlaying;
  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Helper to safely play audio without unhandled promise rejection
  const safePlayAudio = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio) return;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Autoplay policy or abort, safe to log and allow synthetic timer fallback
        console.warn('Audio playback not allowed or aborted:', err?.message || err);
      });
    }
  }, []);

  // Forward declaration of nextTrack for event listeners
  const nextTrackRef = useRef<() => void>(() => {});

  // Initialize HTML5 Audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = currentTrack.src;
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

    const onEnded = () => {
      nextTrackRef.current();
    };

    const onError = () => {
      console.warn('Audio element error loading:', audio.src, '- falling back to visual synthetic progress');
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    if (isPlayingRef.current) {
      safePlayAudio(audio);
    }

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audioRef.current = null;
    };
  }, [safePlayAudio]);

  // Update track source on track change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = currentTrack.src;
    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(currentTrack.duration);

    if (isPlayingRef.current) {
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
        if (wasPlayingBeforeHiddenRef.current) {
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
    safePlayAudio(audioRef.current);
  }, [safePlayAudio]);

  const pause = useCallback(() => {
    setIsPlaying(false);
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
