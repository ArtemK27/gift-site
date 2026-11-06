import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Bomb,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  KeyRound,
  Search,
  Send,
  Smile,
  Sparkles,
  X,
} from 'lucide-react';
import { useMessenger } from '../../context/MessengerContext';
import { useSettings } from '../../context/SettingsContext';
import { STICKERS, THREADS, ThreadId } from './messengerStory';
import { playTapSound, vibrate } from '../../utils/haptics';
import { AppId } from '../../types';

const THREAD_ACCENTS: Record<ThreadId, { ring: string; badge: string; dot: string }> = {
  committee: {
    ring: 'from-rose-500 via-amber-400 to-purple-500',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    dot: 'bg-emerald-400',
  },
  sangwoo: {
    ring: 'from-rose-600 to-red-500',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
    dot: 'bg-amber-400',
  },
  wanning: {
    ring: 'from-cyan-400 to-sky-500',
    badge: 'bg-cyan-500/15 text-cyan-200 border-cyan-400/30',
    dot: 'bg-emerald-400',
  },
  kai: {
    ring: 'from-fuchsia-500 to-purple-500',
    badge: 'bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-400/30',
    dot: 'bg-fuchsia-400',
  },
};

export const MessengerApp: React.FC<{
  onBack: () => void;
  onOpenApp?: (app: AppId) => void;
}> = ({ onBack, onOpenApp }) => {
  const { state, unreadCount, openThread, setDraft, reveal, sendText, sendSticker } =
    useMessenger();
  const { questProgress, cipherCode } = useSettings();
  const [stickersOpen, setStickersOpen] = useState(false);
  const [query, setQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevThreadIdRef = useRef<ThreadId | null>(null);
  const reducedMotion = useReducedMotion();

  const thread = THREADS.find((item) => item.id === state.activeThread);
  const messages = thread ? state.messages[thread.id] : [];
  const normalizedQuery = query.trim().toLocaleLowerCase('ru');
  const visibleThreads = THREADS.filter((item) =>
    item.title.toLocaleLowerCase('ru').includes(normalizedQuery)
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!thread || !el) {
      prevThreadIdRef.current = null;
      return;
    }
    const isNewThreadOpen = prevThreadIdRef.current !== thread.id;
    prevThreadIdRef.current = thread.id;

    if (isNewThreadOpen || reducedMotion) {
      el.scrollTop = el.scrollHeight;
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    } else {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [thread?.id, messages.length, state.typing, reducedMotion]);

  const goBack = () => {
    vibrate(15);
    playTapSound(420, 0.04);
    if (thread) {
      openThread(null);
      setStickersOpen(false);
    } else {
      onBack();
    }
  };

  const handleOpenThread = (id: ThreadId) => {
    vibrate(18);
    playTapSound(520, 0.04);
    openThread(id);
  };

  return (
    <div className="relative w-full h-full min-w-0 flex flex-col bg-[#0b0c11] select-none text-white overflow-hidden">
      {/* Animated Header */}
      <header className="relative z-20 shrink-0 flex items-center gap-2 px-3 h-[62px] border-b border-white/10 bg-[#111218]/95 backdrop-blur-xl overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          {thread ? (
            <motion.div
              key={`header-${thread.id}`}
              initial={reducedMotion ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32, mass: 0.75 }}
              className="flex items-center gap-2.5 w-full min-w-0"
            >
              <button
                type="button"
                aria-label="Назад к чатам"
                onClick={goBack}
                className="w-10 h-10 grid place-items-center shrink-0 rounded-full hover:bg-white/10 active:scale-90 transition-transform text-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
              >
                <ChevronLeft size={23} />
              </button>

              <div className="relative shrink-0">
                <div
                  className={`p-[1.5px] rounded-full bg-gradient-to-tr ${
                    THREAD_ACCENTS[thread.id].ring
                  }`}
                >
                  <img
                    src={thread.avatar}
                    alt=""
                    className="w-9 h-9 object-cover rounded-full border border-[#111218]"
                  />
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#111218] ${
                    THREAD_ACCENTS[thread.id].dot
                  }`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-sm font-semibold truncate">{thread.title}</h1>
                <p className="text-xs text-[#a3a7b4] truncate">
                  {state.typing === thread.id ? (
                    <span className="text-sky-400 font-medium">печатает…</span>
                  ) : (
                    thread.subtitle
                  )}
                </p>
              </div>

              <button
                type="button"
                aria-label="Закрыть мессенджер"
                onClick={onBack}
                className="w-8 h-8 grid place-items-center shrink-0 rounded-full bg-white/[0.07] hover:bg-white/15 active:scale-90 text-white/75 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
              >
                <X size={16} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="header-list"
              initial={reducedMotion ? false : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32, mass: 0.75 }}
              className="flex items-center justify-between w-full min-w-0 pl-1"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-sky-100 to-sky-300 bg-clip-text text-transparent">
                    ПодвалГрам
                  </h1>
                  <span className="text-[10px] font-mono text-sky-300/80">
                    · {unreadCount > 0 ? `${unreadCount} непрочит.` : '4 чата'}
                  </span>
                </div>
                <p className="text-xs text-[#a3a7b4]">
                  Сообщения · Шифр: <span className="font-mono text-amber-300">{cipherCode}</span>
                </p>
              </div>
              <button
                type="button"
                aria-label="Закрыть мессенджер"
                onClick={onBack}
                className="w-9 h-9 grid place-items-center shrink-0 rounded-full bg-white/[0.08] hover:bg-white/15 active:scale-90 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Simultaneous iOS Push/Pop View Switcher: Thread List <-> Active Thread */}
      <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          {!thread ? (
            <motion.div
              key="chat-list-view"
              initial={reducedMotion ? false : { opacity: 0, x: -48, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -48, scale: 0.97 }}
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 32,
                mass: 0.75,
              }}
              className="w-full h-full flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y pb-6 bg-[#0b0c11]"
            >
              {/* Search Bar */}
              <label className="mx-4 mt-3.5 mb-2 flex items-center gap-2 h-10 px-3.5 rounded-2xl bg-white/[0.07] border border-white/[0.08] focus-within:border-sky-500/50 focus-within:bg-white/[0.1] text-zinc-400 transition-colors">
                <Search size={17} className="shrink-0 text-zinc-400" />
                <span className="sr-only">Поиск чатов</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Поиск чатов"
                  className="w-full bg-transparent text-sm text-white placeholder:text-zinc-400 outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </label>

              {/* Thread List */}
              <div className="divide-y divide-white/[0.06]">
                {visibleThreads.map((item, idx) => {
                  const threadMessages = state.messages[item.id];
                  const last = threadMessages[threadMessages.length - 1];
                  const accent = THREAD_ACCENTS[item.id];
                  const isUnread = Boolean(state.unreadThreads[item.id]);
                  const showQuestIndicator = item.id === 'committee' && !state.clueRevealed;

                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      aria-label={`Открыть чат ${item.title}`}
                      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, delay: idx * 0.035 }}
                      whileTap={reducedMotion ? undefined : { scale: 0.975 }}
                      onClick={() => handleOpenThread(item.id)}
                      className="group w-full min-w-0 flex items-center gap-3.5 px-4 py-3 text-left hover:bg-white/[0.05] active:bg-white/[0.10] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                    >
                      {/* Avatar with gradient ring */}
                      <span className="relative shrink-0">
                        <span
                          className={`block p-[2px] rounded-full bg-gradient-to-tr ${accent.ring} shadow-md group-hover:scale-105 transition-transform duration-200`}
                        >
                          <img
                            src={item.avatar}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover border border-[#0b0c11]"
                          />
                        </span>
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0b0c11] ${accent.dot}`}
                        />
                      </span>

                      {/* Title & Last Message Preview */}
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center justify-between gap-2">
                          <span
                            className={`text-sm truncate group-hover:text-sky-200 transition-colors ${
                              isUnread ? 'font-bold text-white' : 'font-semibold text-white/90'
                            }`}
                          >
                            {item.title}
                          </span>
                          <span
                            className={`text-[11px] font-mono shrink-0 ${
                              isUnread ? 'text-sky-400 font-semibold' : 'text-zinc-500'
                            }`}
                          >
                            {last.time}
                          </span>
                        </span>
                        <span className="flex items-center justify-between gap-2 mt-1">
                          <span
                            className={`block text-sm truncate ${
                              isUnread ? 'text-zinc-200 font-medium' : 'text-zinc-400'
                            }`}
                          >
                            {last.isMe ? <span className="text-sky-400">Вы: </span> : ''}
                            {last.isSticker
                              ? 'Стикер · '
                              : last.isSpoilerPhoto
                              ? 'Фото · '
                              : ''}
                            {last.text}
                          </span>
                          <span className="flex items-center gap-1.5 shrink-0">
                            {showQuestIndicator && (
                              <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-black text-[10px] font-bold grid place-items-center shadow-sm">
                                <Sparkles size={11} />
                              </span>
                            )}
                            {/* Telegram-style Unread Dot */}
                            {isUnread && (
                              <span
                                data-testid={`unread-dot-${item.id}`}
                                title="Непрочитанные сообщения"
                                className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.85)] shrink-0"
                              />
                            )}
                            <ChevronRight
                              size={15}
                              className="text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all"
                            />
                          </span>
                        </span>
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {visibleThreads.length === 0 && (
                <p className="p-6 text-sm text-zinc-400 text-center">
                  Чатов с таким именем нет
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={`thread-view-${thread.id}`}
              initial={reducedMotion ? false : { opacity: 0, x: 64, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 64, scale: 0.98 }}
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 32,
                mass: 0.75,
              }}
              className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden bg-[#0b0c11]"
            >
              {/* Quest Clue Banner in Committee */}
              <AnimatePresence>
                {thread.id === 'committee' && state.clueRevealed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="shrink-0 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent border-b border-amber-400/20 px-4 py-2 text-xs text-amber-200 flex items-center gap-2"
                  >
                    <KeyRound size={14} className="text-amber-300 shrink-0" />
                    <span>
                      Первые 2 цифры открыты: <strong>20 • •</strong>{' '}
                      <span className="text-zinc-400">· текущий шифр {cipherCode}</span>
                    </span>
                  </motion.div>
                )}

                {thread.id === 'sangwoo' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="shrink-0 bg-gradient-to-r from-rose-500/15 via-amber-500/10 to-transparent border-b border-rose-500/20 px-4 py-2 text-xs text-rose-200 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Bomb size={14} className="text-rose-400 shrink-0" />
                      <span className="truncate">
                        {questProgress.minesweeperUnlocked ? (
                          <>
                            Поле разминировано! Цифра Сану: <strong>«7»</strong>
                          </>
                        ) : (
                          <>Испытание Сану: поле 6×6 в «Сапёре»</>
                        )}
                      </span>
                    </div>
                    {onOpenApp && !questProgress.minesweeperUnlocked && (
                      <button
                        type="button"
                        onClick={() => {
                          vibrate(20);
                          playTapSound(520, 0.04);
                          onOpenApp('minesweeper');
                        }}
                        className="px-2.5 py-1 rounded-full bg-rose-500/25 hover:bg-rose-500/35 border border-rose-400/40 text-[11px] font-semibold text-rose-200 shrink-0 transition-colors"
                      >
                        В «Сапёр» →
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages Container */}
              <div
                ref={scrollRef}
                data-testid="chat-messages"
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y px-3 py-4 space-y-3"
              >
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={
                      reducedMotion
                        ? false
                        : { opacity: 0, y: 10, scale: 0.97 }
                    }
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 30,
                      delay: Math.min(idx * 0.02, 0.12),
                    }}
                    className={`flex items-end gap-2 min-w-0 ${
                      msg.isMe ? 'justify-end' : ''
                    }`}
                  >
                    {!msg.isMe && (
                      <img
                        src={msg.avatar}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/10"
                      />
                    )}
                    <div
                      className={`flex flex-col min-w-0 max-w-[min(80%,310px)] ${
                        msg.isMe ? 'items-end' : 'items-start'
                      }`}
                    >
                      {thread.id === 'committee' && !msg.isMe && (
                        <span className="text-[11px] text-amber-300 font-semibold mb-1 ml-1">
                          {msg.sender}
                        </span>
                      )}
                      {msg.isSpoilerPhoto ? (
                        <div className="max-w-full p-1.5 rounded-2xl bg-[#22232a] border border-white/10 shadow-md">
                          <button
                            type="button"
                            aria-label={
                              state.revealed[msg.id]
                                ? 'Фото раскрыто'
                                : 'Раскрыть фото в чате'
                            }
                            disabled={!!state.revealed[msg.id]}
                            onClick={() => {
                              vibrate(20);
                              playTapSound(560, 0.04);
                              reveal(msg.id);
                            }}
                            className="relative block w-48 max-w-full aspect-[4/5] rounded-xl overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                          >
                            <img
                              src={msg.photoUrl}
                              alt="Новогодний пентхаус"
                              className={`w-full h-full object-cover transition-all duration-500 ${
                                state.revealed[msg.id]
                                  ? 'scale-100'
                                  : 'blur-xl brightness-50 scale-105'
                              }`}
                            />
                            {!state.revealed[msg.id] && (
                              <span className="absolute inset-0 grid place-content-center justify-items-center gap-2 bg-black/35 backdrop-blur-[2px] text-sm font-semibold">
                                <Eye size={24} className="text-amber-300 animate-pulse" />
                                <span>Спойлер · открыть фото</span>
                              </span>
                            )}
                          </button>
                          <p className="text-xs leading-relaxed px-1 pt-2 text-zinc-200 break-words">
                            {msg.text}
                          </p>
                        </div>
                      ) : msg.isSticker ? (
                        <motion.div
                          initial={reducedMotion ? false : { scale: 0.85 }}
                          animate={{ scale: 1 }}
                          className="w-28 max-w-full"
                        >
                          <img
                            src={msg.stickerUrl}
                            alt={msg.text}
                            className="w-28 h-28 object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)]"
                          />
                          <span className="text-xs text-zinc-400 break-words">
                            {msg.text}
                          </span>
                        </motion.div>
                      ) : (
                        <div
                          className={`max-w-full px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words shadow-sm ${
                            msg.isMe
                              ? 'bg-gradient-to-br from-[#2b6ef2] to-[#1e52c8] text-white rounded-br-md'
                              : 'bg-[#232530] border border-white/[0.06] text-zinc-100 rounded-bl-md'
                          }`}
                        >
                          {msg.text}
                        </div>
                      )}
                      <span className="flex items-center gap-1 text-[10px] text-zinc-500 px-1 mt-1">
                        {msg.time}
                        {msg.isMe && <CheckCheck size={12} className="text-sky-400" />}
                      </span>
                    </div>
                  </motion.div>
                ))}

                {state.typing === thread.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 pl-9"
                  >
                    <span className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-[#232530] border border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </span>
                    <p className="text-xs text-sky-300" role="status">
                      {thread.title} печатает…
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Composer & Animated Sticker Drawer */}
              <div className="shrink-0 min-w-0 border-t border-white/10 bg-[#14151b]/95 backdrop-blur-xl px-3 pt-2 pb-9">
                <AnimatePresence initial={false}>
                  {stickersOpen && (
                    <motion.div
                      initial={reducedMotion ? false : { opacity: 0, height: 0, y: 8 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0, y: 8 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div
                        className="grid grid-cols-3 gap-2 pb-2.5 pt-0.5"
                        aria-label="Выбор стикера"
                      >
                        {STICKERS.map((sticker) => (
                          <motion.button
                            type="button"
                            key={sticker.id}
                            whileHover={reducedMotion ? undefined : { scale: 1.03 }}
                            whileTap={reducedMotion ? undefined : { scale: 0.93 }}
                            onClick={() => {
                              vibrate(20);
                              playTapSound(580, 0.04);
                              sendSticker(thread.id, sticker.image, sticker.caption);
                              setStickersOpen(false);
                            }}
                            className="min-w-0 p-1.5 rounded-xl bg-white/[0.07] hover:bg-white/15 border border-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                          >
                            <img
                              src={sticker.image}
                              alt=""
                              className="w-12 h-12 object-contain mx-auto"
                            />
                            <span className="block text-[10px] text-zinc-200 font-medium truncate mt-0.5">
                              {sticker.name}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendText(thread.id);
                  }}
                  className="flex items-center gap-2 min-w-0"
                >
                  <button
                    type="button"
                    aria-label="Открыть стикеры"
                    aria-expanded={stickersOpen}
                    onClick={() => {
                      vibrate(12);
                      playTapSound(480, 0.03);
                      setStickersOpen((value) => !value);
                    }}
                    className={`w-10 h-10 shrink-0 grid place-items-center rounded-full border transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 ${
                      stickersOpen
                        ? 'bg-sky-500/25 border-sky-400/50 text-sky-300'
                        : 'bg-white/[0.08] border-white/10 text-zinc-200 hover:bg-white/15'
                    }`}
                  >
                    <Smile size={21} />
                  </button>
                  <input
                    aria-label="Сообщение"
                    placeholder="Сообщение…"
                    value={state.draft[thread.id]}
                    onChange={(event) => setDraft(thread.id, event.target.value)}
                    className="min-w-0 flex-1 h-10 px-3.5 rounded-2xl bg-white/[0.08] border border-white/10 text-sm placeholder:text-zinc-400 outline-none focus:border-sky-500 transition-colors"
                  />
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.9 }}
                    aria-label="Отправить сообщение"
                    disabled={!state.draft[thread.id].trim()}
                    className="w-10 h-10 shrink-0 grid place-items-center rounded-full bg-gradient-to-tr from-[#2866d9] to-[#3b82f6] disabled:opacity-40 shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                  >
                    <Send size={18} />
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default MessengerApp;
