import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setGlobalSound, setGlobalHaptics } from '../utils/haptics';
import { QuestProgressState, formatCipherProgress } from '../components/apps/minesweeperLogic';

export type WallpaperId = 'newyear' | 'sangwoo' | 'sisheng';
export type QuestStepKey = 'committee' | 'notes' | 'minesweeper' | 'console_decrypt';

export interface SettingsState {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  wallpaper: WallpaperId;
}

export interface SettingsContextType extends SettingsState {
  questProgress: QuestProgressState;
  cipherCode: string;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setWallpaper: (wallpaper: WallpaperId) => void;
  unlockQuestStep: (step: QuestStepKey) => void;
  resetQuestProgress: () => void;
}

const STORAGE_KEY = 'ios18_gift_settings';
export const QUEST_STORAGE_KEY = 'ios18_quest_progress';

const DEFAULT_SETTINGS: SettingsState = {
  soundEnabled: true,
  hapticsEnabled: true,
  wallpaper: 'newyear',
};

const DEFAULT_QUEST_PROGRESS: QuestProgressState = {
  committeeUnlocked: false,
  notesUnlocked: false,
  minesweeperUnlocked: false,
  rootNoteDecrypted: false,
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

export const getStoredQuestProgress = (): QuestProgressState => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_QUEST_PROGRESS;
  }
  try {
    const raw = window.localStorage.getItem(QUEST_STORAGE_KEY);
    if (!raw) return DEFAULT_QUEST_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      committeeUnlocked: Boolean(parsed.committeeUnlocked),
      notesUnlocked: Boolean(parsed.notesUnlocked),
      minesweeperUnlocked: Boolean(parsed.minesweeperUnlocked),
      rootNoteDecrypted: Boolean(parsed.rootNoteDecrypted),
    };
  } catch {
    return DEFAULT_QUEST_PROGRESS;
  }
};

export const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(() => getStoredSettings());
  const [questProgress, setQuestProgress] = useState<QuestProgressState>(() =>
    getStoredQuestProgress()
  );

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

  useEffect(() => {
    try {
      window.localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(questProgress));
    } catch {
      // Ignore storage write error
    }
  }, [questProgress]);

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

  const unlockQuestStep = useCallback((step: QuestStepKey) => {
    setQuestProgress((prev) => {
      const key: keyof QuestProgressState =
        step === 'committee'
          ? 'committeeUnlocked'
          : step === 'notes'
          ? 'notesUnlocked'
          : step === 'console_decrypt'
          ? 'rootNoteDecrypted'
          : 'minesweeperUnlocked';
      if (prev[key]) return prev;
      const next: QuestProgressState = { ...prev, [key]: true };
      try {
        window.localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent('ios18_quest_step_unlocked', { detail: { step } }));
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
      setQuestProgress(DEFAULT_QUEST_PROGRESS);
      window.dispatchEvent(new CustomEvent('ios18_quest_reset'));
    } catch {
      // Ignore
    }
  }, []);

  const cipherCode = formatCipherProgress(questProgress);

  const value: SettingsContextType = {
    ...settings,
    questProgress,
    cipherCode,
    setSoundEnabled,
    setHapticsEnabled,
    setWallpaper,
    unlockQuestStep,
    resetQuestProgress,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

// Fallback state if useSettings is called without Provider
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context) return context;

  const initial = getStoredSettings();
  const initialQuest = getStoredQuestProgress();
  return {
    ...initial,
    questProgress: initialQuest,
    cipherCode: formatCipherProgress(initialQuest),
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
    unlockQuestStep: (step: QuestStepKey) => {
      try {
        const current = getStoredQuestProgress();
        const key: keyof QuestProgressState =
          step === 'committee'
            ? 'committeeUnlocked'
            : step === 'notes'
            ? 'notesUnlocked'
            : step === 'console_decrypt'
            ? 'rootNoteDecrypted'
            : 'minesweeperUnlocked';
        const next = { ...current, [key]: true };
        window.localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(next));
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
