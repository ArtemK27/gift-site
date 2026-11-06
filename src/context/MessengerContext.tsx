import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ChatMessage } from '../types';
import { playNotificationSound, vibrate } from '../utils/haptics';
import {
  SANGWOO_MINESWEEPER_WIN_MESSAGE,
  STICKER_REACTIONS,
  THREADS,
  ThreadId,
} from '../components/apps/messengerStory';
import { useSettings } from './SettingsContext';

export const MESSENGER_STORAGE_KEY = 'ios18_messenger_state_v1';

export type MessengerState = {
  messages: Record<ThreadId, ChatMessage[]>;
  unreadThreads: Record<ThreadId, boolean>;
  revealed: Record<string, boolean>;
  activeThread: ThreadId | null;
  draft: Record<ThreadId, string>;
  typing: ThreadId | null;
  clueRevealed: boolean;
  sangwooMineRewardSent: boolean;
};

const createDefaultState = (): MessengerState => ({
  messages: Object.fromEntries(
    THREADS.map((thread) => [thread.id, [...thread.messages]])
  ) as Record<ThreadId, ChatMessage[]>,
  unreadThreads: {
    committee: true,
    sangwoo: true,
    wanning: true,
    kai: true,
  },
  revealed: {},
  activeThread: null,
  draft: { committee: '', sangwoo: '', wanning: '', kai: '' },
  typing: null,
  clueRevealed: false,
  sangwooMineRewardSent: false,
});

const loadInitialState = (): MessengerState => {
  const fallback = createDefaultState();
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(MESSENGER_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      ...fallback,
      messages: parsed.messages ? { ...fallback.messages, ...parsed.messages } : fallback.messages,
      unreadThreads: parsed.unreadThreads
        ? { ...fallback.unreadThreads, ...parsed.unreadThreads }
        : fallback.unreadThreads,
      revealed: parsed.revealed || {},
      clueRevealed: Boolean(parsed.clueRevealed),
      sangwooMineRewardSent: Boolean(parsed.sangwooMineRewardSent),
    };
  } catch {
    return fallback;
  }
};

type MessengerActions = {
  state: MessengerState;
  unreadCount: number;
  openThread: (id: ThreadId | null) => void;
  setDraft: (id: ThreadId, value: string) => void;
  reveal: (id: string) => void;
  sendText: (id: ThreadId) => void;
  sendSticker: (id: ThreadId, image: string, caption: string) => void;
};

const MessengerContext = createContext<MessengerActions | null>(null);

export const MessengerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { questProgress, unlockQuestStep } = useSettings();
  const [state, setState] = useState<MessengerState>(loadInitialState);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sequence = useRef(100);
  const stickerStarted = useRef(state.clueRevealed);

  // Persist messenger state across reloads (until explicit reset in Settings)
  useEffect(() => {
    try {
      const persisted = {
        messages: state.messages,
        unreadThreads: state.unreadThreads,
        revealed: state.revealed,
        clueRevealed: state.clueRevealed,
        sangwooMineRewardSent: state.sangwooMineRewardSent,
      };
      window.localStorage.setItem(MESSENGER_STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // Ignore storage errors
    }
  }, [
    state.messages,
    state.unreadThreads,
    state.revealed,
    state.clueRevealed,
    state.sangwooMineRewardSent,
  ]);

  // Sync clueRevealed with SettingsContext questProgress
  useEffect(() => {
    if (state.clueRevealed && !questProgress.committeeUnlocked) {
      unlockQuestStep('committee');
    }
  }, [state.clueRevealed, questProgress.committeeUnlocked, unlockQuestStep]);

  // When Minesweeper is beaten, Sangwoo sends his digit reward message in his thread
  useEffect(() => {
    if (questProgress.minesweeperUnlocked && !state.sangwooMineRewardSent) {
      setState((prev) => {
        if (prev.sangwooMineRewardSent) return prev;
        const alreadyExists = prev.messages.sangwoo.some(
          (m) => m.id === SANGWOO_MINESWEEPER_WIN_MESSAGE.id
        );
        return {
          ...prev,
          sangwooMineRewardSent: true,
          messages: {
            ...prev.messages,
            sangwoo: alreadyExists
              ? prev.messages.sangwoo
              : [...prev.messages.sangwoo, SANGWOO_MINESWEEPER_WIN_MESSAGE],
          },
          unreadThreads: {
            ...prev.unreadThreads,
            sangwoo: prev.activeThread !== 'sangwoo',
          },
        };
      });
    }
  }, [questProgress.minesweeperUnlocked, state.sangwooMineRewardSent]);

  useEffect(() => {
    const reset = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      sequence.current = 100;
      stickerStarted.current = false;
      const fresh = createDefaultState();
      setState(fresh);
      try {
        window.localStorage.removeItem(MESSENGER_STORAGE_KEY);
      } catch {}
    };
    window.addEventListener('ios18_quest_reset', reset);
    return () => {
      window.removeEventListener('ios18_quest_reset', reset);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const later = (callback: () => void, delay: number) => {
    timers.current.push(setTimeout(callback, delay));
  };

  const addMessage = (id: ThreadId, msg: ChatMessage) => {
    setState((prev) => ({
      ...prev,
      messages: { ...prev.messages, [id]: [...prev.messages[id], msg] },
      unreadThreads:
        !msg.isMe && prev.activeThread !== id
          ? { ...prev.unreadThreads, [id]: true }
          : prev.unreadThreads,
    }));
  };

  const reply = (id: ThreadId) => {
    const story = THREADS.find((thread) => thread.id === id)!;
    later(() => setState((prev) => ({ ...prev, typing: id })), 450);
    later(() => {
      setState((prev) => ({ ...prev, typing: null }));
      const replyText =
        id === 'sangwoo' && questProgress.minesweeperUnlocked
          ? 'Ты уже разминировала моё поле. Моя цифра — «7», не забудь её при вводе кода в Сейфе 🔪'
          : story.reply.text;
      addMessage(id, {
        ...story.reply,
        text: replyText,
        id: `reply-${++sequence.current}`,
        time: '23:57',
      });
      playNotificationSound();
    }, 1450);
  };

  const sendText = (id: ThreadId) => {
    const text = state.draft[id].trim();
    if (!text) return;
    addMessage(id, {
      id: `mine-${++sequence.current}`,
      sender: 'Вы',
      avatar: '',
      text,
      time: '23:57',
      isMe: true,
    });
    setState((prev) => ({ ...prev, draft: { ...prev.draft, [id]: '' } }));
    reply(id);
  };

  const sendSticker = (id: ThreadId, image: string, caption: string) => {
    addMessage(id, {
      id: `sticker-${++sequence.current}`,
      sender: 'Вы',
      avatar: '',
      text: caption,
      time: '23:57',
      isMe: true,
      isSticker: true,
      stickerUrl: image,
    });
    if (id !== 'committee') {
      reply(id);
      return;
    }
    if (stickerStarted.current || state.clueRevealed) return;
    stickerStarted.current = true;
    later(() => setState((prev) => ({ ...prev, typing: 'committee' })), 450);
    later(() => {
      addMessage(id, { id: 'reaction-kai', ...STICKER_REACTIONS[0], time: '23:57' });
      playNotificationSound();
    }, 1500);
    later(() => {
      setState((prev) => ({ ...prev, typing: null, clueRevealed: true }));
      unlockQuestStep('committee');
      addMessage(id, { id: 'reaction-clue', ...STICKER_REACTIONS[1], time: '23:58' });
      vibrate(35);
      playNotificationSound();
    }, 3200);
  };

  const openThread = (activeThread: ThreadId | null) => {
    setState((prev) => ({
      ...prev,
      activeThread,
      unreadThreads: activeThread
        ? { ...prev.unreadThreads, [activeThread]: false }
        : prev.unreadThreads,
    }));
  };

  const unreadCount = Object.values(state.unreadThreads).filter(Boolean).length;

  return (
    <MessengerContext.Provider
      value={{
        state,
        unreadCount,
        openThread,
        setDraft: (id, value) =>
          setState((prev) => ({ ...prev, draft: { ...prev.draft, [id]: value } })),
        reveal: (id) =>
          setState((prev) => ({ ...prev, revealed: { ...prev.revealed, [id]: true } })),
        sendText,
        sendSticker,
      }}
    >
      {children}
    </MessengerContext.Provider>
  );
};

export const useMessenger = () => {
  const value = useContext(MessengerContext);
  if (!value) throw new Error('MessengerProvider is required');
  return value;
};
