import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setGlobalSound, setGlobalHaptics } from '../utils/haptics';

export type WallpaperId = 'newyear' | 'sangwoo' | 'sisheng';

export interface SettingsState {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  wallpaper: WallpaperId;
}

export interface SettingsContextType extends SettingsState {
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setWallpaper: (wallpaper: WallpaperId) => void;
  resetQuestProgress: () => void;
}

const STORAGE_KEY = 'ios18_gift_settings';

const DEFAULT_SETTINGS: SettingsState = {
  soundEnabled: true,
  hapticsEnabled: true,
  wallpaper: 'newyear',
};

const getStoredSettings = (): SettingsState => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_SETTINGS;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
      hapticsEnabled: typeof parsed.hapticsEnabled === 'boolean' ? parsed.hapticsEnabled : true,
      wallpaper: ['newyear', 'sangwoo', 'sisheng'].includes(parsed.wallpaper)
        ? parsed.wallpaper
        : 'newyear',
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(() => getStoredSettings());

  // Keep haptics.ts module synchronized on mount & updates
  useEffect(() => {
    setGlobalSound(settings.soundEnabled);
    setGlobalHaptics(settings.hapticsEnabled);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage write error
    }
  }, [settings]);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setGlobalSound(enabled);
    setSettings((prev) => {
      const next = { ...prev, soundEnabled: enabled };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const setHapticsEnabled = useCallback((enabled: boolean) => {
    setGlobalHaptics(enabled);
    setSettings((prev) => {
      const next = { ...prev, hapticsEnabled: enabled };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const setWallpaper = useCallback((wallpaper: WallpaperId) => {
    setSettings((prev) => {
      const next = { ...prev, wallpaper };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const resetQuestProgress = useCallback(() => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key !== STORAGE_KEY) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
      window.dispatchEvent(new CustomEvent('ios18_quest_reset'));
    } catch {
      // Ignore
    }
  }, []);

  const value: SettingsContextType = {
    ...settings,
    setSoundEnabled,
    setHapticsEnabled,
    setWallpaper,
    resetQuestProgress,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

// Fallback state if useSettings is called without Provider
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context) return context;

  // Graceful standalone fallback
  const initial = getStoredSettings();
  return {
    ...initial,
    setSoundEnabled: (enabled: boolean) => {
      setGlobalSound(enabled);
      try {
        const current = getStoredSettings();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, soundEnabled: enabled }));
      } catch {}
    },
    setHapticsEnabled: (enabled: boolean) => {
      setGlobalHaptics(enabled);
      try {
        const current = getStoredSettings();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, hapticsEnabled: enabled }));
      } catch {}
    },
    setWallpaper: (wallpaper: WallpaperId) => {
      try {
        const current = getStoredSettings();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, wallpaper }));
      } catch {}
    },
    resetQuestProgress: () => {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && key !== STORAGE_KEY) keysToRemove.push(key);
        }
        keysToRemove.forEach((k) => window.localStorage.removeItem(k));
        window.dispatchEvent(new CustomEvent('ios18_quest_reset'));
      } catch {}
    },
  };
};
