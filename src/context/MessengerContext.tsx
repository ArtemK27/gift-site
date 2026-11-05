import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ChatMessage } from '../types';
import { playNotificationSound, vibrate } from '../utils/haptics';
import { STICKER_REACTIONS, THREADS, ThreadId } from '../components/apps/messengerStory';

type MessengerState = {
  messages: Record<ThreadId, ChatMessage[]>;
  revealed: Record<string, boolean>;
  activeThread: ThreadId | null;
  draft: Record<ThreadId, string>;
  typing: ThreadId | null;
  clueRevealed: boolean;
};

const initialState = (): MessengerState => ({
  messages: Object.fromEntries(THREADS.map((thread) => [thread.id, [...thread.messages]])) as Record<ThreadId, ChatMessage[]>,
  revealed: {}, activeThread: null,
  draft: { committee: '', sangwoo: '', wanning: '', kai: '' },
  typing: null, clueRevealed: false,
});

type MessengerActions = {
  state: MessengerState;
  openThread: (id: ThreadId | null) => void;
  setDraft: (id: ThreadId, value: string) => void;
  reveal: (id: string) => void;
  sendText: (id: ThreadId) => void;
  sendSticker: (id: ThreadId, image: string, caption: string) => void;
};
const MessengerContext = createContext<MessengerActions | null>(null);

export const MessengerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Intentionally memory-only: opening/closing apps retains conversations; reloading the page resets them.
  const [state, setState] = useState(initialState);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sequence = useRef(0);
  const stickerStarted = useRef(false);
  useEffect(() => {
    const reset = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      sequence.current = 0;
      stickerStarted.current = false;
      setState(initialState());
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
    setState((prev) => ({ ...prev, messages: { ...prev.messages, [id]: [...prev.messages[id], msg] } }));
  };
  const reply = (id: ThreadId) => {
    const story = THREADS.find((thread) => thread.id === id)!;
    later(() => setState((prev) => ({ ...prev, typing: id })), 450);
    later(() => {
      setState((prev) => ({ ...prev, typing: null }));
      addMessage(id, { ...story.reply, id: `reply-${++sequence.current}`, time: '23:57' });
      playNotificationSound();
    }, 1450);
  };
  const sendText = (id: ThreadId) => {
    const text = state.draft[id].trim();
    if (!text) return;
    addMessage(id, { id: `mine-${++sequence.current}`, sender: 'Вы', avatar: '', text, time: '23:57', isMe: true });
    setState((prev) => ({ ...prev, draft: { ...prev.draft, [id]: '' } }));
    reply(id);
  };
  const sendSticker = (id: ThreadId, image: string, caption: string) => {
    addMessage(id, { id: `sticker-${++sequence.current}`, sender: 'Вы', avatar: '', text: caption, time: '23:57', isMe: true, isSticker: true, stickerUrl: image });
    if (id !== 'committee') { reply(id); return; }
    // Only the first group sticker triggers the quest clue, including rapid repeat taps.
    if (stickerStarted.current) return;
    stickerStarted.current = true;
    later(() => setState((prev) => ({ ...prev, typing: 'committee' })), 450);
    later(() => {
      addMessage(id, { id: 'reaction-kai', ...STICKER_REACTIONS[0], time: '23:57' });
      playNotificationSound();
    }, 1500);
    later(() => {
      setState((prev) => ({ ...prev, typing: null, clueRevealed: true }));
      addMessage(id, { id: 'reaction-clue', ...STICKER_REACTIONS[1], time: '23:58' });
      vibrate(35);
      playNotificationSound();
    }, 3200);
  };
  return <MessengerContext.Provider value={{ state, openThread: (activeThread) => setState((prev) => ({ ...prev, activeThread })), setDraft: (id, value) => setState((prev) => ({ ...prev, draft: { ...prev.draft, [id]: value } })), reveal: (id) => setState((prev) => ({ ...prev, revealed: { ...prev.revealed, [id]: true } })), sendText, sendSticker }}>{children}</MessengerContext.Provider>;
};

export const useMessenger = () => {
  const value = useContext(MessengerContext);
  if (!value) throw new Error('MessengerProvider is required');
  return value;
};
