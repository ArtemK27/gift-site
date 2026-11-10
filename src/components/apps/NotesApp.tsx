import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Pin,
  Search,
  Mic,
  MoreHorizontal,
  Share,
  Check,
  CheckSquare,
  Camera,
  PenTool,
  SquarePen,
  Lock,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { vibrate, playTapSound, playUnlockSound } from '../../utils/haptics';
import { useSettings } from '../../context/SettingsContext';

export interface NotesAppProps {
  onBack: () => void;
  initialNoteId?: string | null;
  onClearInitialNote?: () => void;
}

interface BudgetChecklistItem {
  id: string;
  title: string;
  note: string;
  checked: boolean;
  lockedBySangwoo?: boolean;
}

const NOTES_BUDGET_STORAGE_KEY = 'ios18_notes_budget_v2';
const NOTES_LYRICS_STORAGE_KEY = 'ios18_notes_lyrics_v2';

const DEFAULT_BUDGET_ITEMS: BudgetChecklistItem[] = [
  {
    id: 'b1',
    title: 'Аренда пентхауса на 31 декабря',
    note: 'Оплатил: Тасянь-Цзюнь (древними золотыми слитками, риелтор в шоке)',
    checked: true,
  },
  {
    id: 'b2',
    title: 'Игристое, мандарины и икра',
    note: 'Ответственный: Игорь Синяк (требует подавать оливье только в тарелках Hermes)',
    checked: true,
  },
  {
    id: 'b3',
    title: 'Концертный звук и черная мишура',
    note: 'Ответственные: Kai Angel & 9mice',
    checked: true,
  },
  {
    id: 'b4',
    title: 'Купить бенгальские огни, чтобы прожечь пол',
    note: 'Ответственный: Сану (НЕ ВЫПОЛНЕНО ⚠️)',
    checked: false,
    lockedBySangwoo: true,
  },
  {
    id: 'b5',
    title: 'Секретный подарок в VIP-Сейф',
    note: 'Скинулись все (Статус: Заблокировано кодом)',
    checked: true,
  },
];

const LYRIC_SLOTS: string[][] = [
  [
    'Rick Owens в сугробе',
    'рублюсь в Сапёра на паре',
    'ем оливье в подвале',
  ],
  [
    'Archive Balenciaga под бой курантов',
    'леплю хунтуни с Чу Ваньнином',
    'прячусь от 10 чемоданов Синяка',
  ],
  [
    'Heavy Metal 2027 в пентхаусе',
    'ищу код от Сейфа под ёлкой',
    'жмякаю Жабу удачи за мандарины',
  ],
];

export const NotesApp: React.FC<NotesAppProps> = ({
  onBack,
  initialNoteId = null,
  onClearInitialNote,
}) => {
  const { questProgress, unlockQuestStep } = useSettings();
  const [activeNoteId, setActiveNoteId] = useState<string | null>(initialNoteId);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [spoilerSparks, setSpoilerSparks] = useState<number[]>([]);

  const isRootDecrypted = Boolean(questProgress.rootNoteDecrypted);
  const isSecondDigitRevealed = Boolean(questProgress.notesUnlocked);

  useEffect(() => {
    if (initialNoteId) {
      setActiveNoteId(initialNoteId);
      onClearInitialNote?.();
    }
  }, [initialNoteId, onClearInitialNote]);

  const [budgetItems, setBudgetItems] = useState<BudgetChecklistItem[]>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(NOTES_BUDGET_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return DEFAULT_BUDGET_ITEMS;
  });

  const [lyricIndices, setLyricIndices] = useState<[number, number, number]>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(NOTES_LYRICS_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return [0, 0, 0];
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(NOTES_BUDGET_STORAGE_KEY, JSON.stringify(budgetItems));
    } catch {}
  }, [budgetItems]);

  useEffect(() => {
    try {
      window.localStorage.setItem(NOTES_LYRICS_STORAGE_KEY, JSON.stringify(lyricIndices));
    } catch {}
  }, [lyricIndices]);

  useEffect(() => {
    const onReset = () => {
      setBudgetItems(DEFAULT_BUDGET_ITEMS);
      setLyricIndices([0, 0, 0]);
      try {
        window.localStorage.removeItem(NOTES_BUDGET_STORAGE_KEY);
        window.localStorage.removeItem(NOTES_LYRICS_STORAGE_KEY);
      } catch {}
    };
    window.addEventListener('ios18_quest_reset', onReset);
    return () => window.removeEventListener('ios18_quest_reset', onReset);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2300);
  };

  const handleToggleBudgetItem = (item: BudgetChecklistItem) => {
    if (item.lockedBySangwoo) {
      vibrate([40, 60, 40]);
      playTapSound(220, 0.06);
      showToast('Сану запретил менять этот пункт');
      return;
    }
    vibrate(20);
    playTapSound(680, 0.04);
    setBudgetItems((prev) =>
      prev.map((entry) =>
        entry.id === item.id ? { ...entry, checked: !entry.checked } : entry
      )
    );
  };

  const handleScratchSpoiler = () => {
    if (isSecondDigitRevealed) return;
    vibrate([30, 50, 80]);
    playUnlockSound();
    setSpoilerSparks([1, 2, 3, 4, 5, 6, 7, 8]);
    unlockQuestStep('notes');
    setTimeout(() => setSpoilerSparks([]), 800);
  };

  const handleCycleLyricSlot = (slotIdx: 0 | 1 | 2) => {
    vibrate(18);
    playTapSound(520 + slotIdx * 80, 0.04);
    setLyricIndices((prev) => {
      const next: [number, number, number] = [...prev] as [number, number, number];
      next[slotIdx] = (next[slotIdx] + 1) % LYRIC_SLOTS[slotIdx].length;
      return next;
    });
  };

  const notesList: {
    id: 'note-root' | 'note-budget' | 'note-lyrics';
    title: string;
    date: string;
    excerpt: string;
    pinned?: boolean;
  }[] = [
    {
      id: 'note-root',
      title: '🔐 ПАРОЛИ И ДОСТУПЫ НА 31.12 (ROOT)',
      date: '31.12.26',
      excerpt: isRootDecrypted
        ? 'Wi-Fi пентхауса: Podval_Sangwoo_5G • Где спрятаны 4 цифры от VIP-Сейфа...'
        : 'Файл зашифрован протоколом SSH. Требуется дешифратор Консоли (>_)...',
      pinned: true,
    },
    {
      id: 'note-budget',
      title: '💸 Смета и закупки на НГ (Общак)',
      date: '31.12.26',
      excerpt: 'Аренда пентхауса, игристое и икра в Hermes, концертный звук, бенгальские огни...',
      pinned: false,
    },
    {
      id: 'note-lyrics',
      title: '🦇 Черновик трека (Kai Angel & 9mice — НЕ СЛИВАТЬ)',
      date: '31.12.26',
      excerpt: `${LYRIC_SLOTS[0][lyricIndices[0]]} • ${LYRIC_SLOTS[1][lyricIndices[1]]}...`,
      pinned: false,
    },
  ];

  const activeNote = notesList.find((n) => n.id === activeNoteId);

  return (
    <div className="relative w-full h-full flex flex-col bg-black text-white select-none z-30 overflow-hidden font-sans">
      {/* Native iOS Notes Top Navigation Bar (Minimal yellow back button + yellow icons) */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 bg-black z-20">
        <button
          type="button"
          onClick={() => {
            vibrate(15);
            playTapSound(400, 0.04);
            if (activeNoteId) {
              setActiveNoteId(null);
            } else {
              onBack();
            }
          }}
          aria-label="Назад к списку"
          className="flex items-center gap-0.5 text-[#eab308] text-[17px] font-normal active:opacity-60 transition-opacity cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 -ml-1.5 stroke-[2.2]" />
          <span>Заметки</span>
        </button>

        <div className="flex items-center gap-4 text-[#eab308]">
          {activeNote && (
            <button
              type="button"
              onClick={() => {
                vibrate(12);
                playTapSound(520, 0.03);
              }}
              className="p-0.5 active:opacity-60 cursor-pointer"
              aria-label="Поделиться"
            >
              <Share className="w-[21px] h-[21px]" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              vibrate(12);
              playTapSound(520, 0.03);
            }}
            className="p-0.5 active:opacity-60 cursor-pointer"
            aria-label="Еще"
          >
            <MoreHorizontal className="w-[22px] h-[22px]" />
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-y-auto px-4 pt-1 pb-6 bg-black overscroll-contain touch-pan-y">
        <AnimatePresence mode="wait">
          {!activeNote ? (
            // ================= iOS NOTES LIST VIEW =================
            <motion.div
              key="notes-list"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {/* Large iOS Title */}
              <div className="pt-1">
                <h1 className="text-[32px] font-bold tracking-tight text-white leading-tight">
                  Заметки
                </h1>
              </div>

              {/* iOS Search Bar */}
              <div className="flex items-center justify-between px-3 py-2 rounded-[10px] bg-[#1c1c1e] text-zinc-400 text-sm">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-500 text-[15px]">Поиск</span>
                </div>
                <Mic className="w-4 h-4 text-zinc-500" />
              </div>

              {/* Pinned Quest Note (#1) */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 px-1 text-[13px] font-semibold text-zinc-400">
                  <Pin className="w-3.5 h-3.5 text-[#eab308]" />
                  <span>Закрепленные</span>
                </div>

                <div className="rounded-[12px] bg-[#1c1c1e] overflow-hidden">
                  {notesList
                    .filter((n) => n.pinned)
                    .map((note) => (
                      <div
                        key={note.id}
                        data-testid={`note-item-${note.id}`}
                        onClick={() => {
                          vibrate(20);
                          playTapSound(520, 0.04);
                          setActiveNoteId(note.id);
                        }}
                        className="px-4 py-3 active:bg-white/[0.08] cursor-pointer transition-colors"
                      >
                        <h3 className="text-[15px] font-semibold text-white truncate">
                          {note.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[13px] mt-0.5">
                          <span className="text-zinc-400 shrink-0">{note.date}</span>
                          <span className="truncate text-zinc-500">{note.excerpt}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Other Notes (#2 & #3) */}
              <div className="space-y-1.5">
                <div className="px-1 text-[13px] font-semibold text-zinc-400">
                  <span>Декабрь</span>
                </div>

                <div className="rounded-[12px] bg-[#1c1c1e] overflow-hidden divide-y divide-white/[0.08]">
                  {notesList
                    .filter((n) => !n.pinned)
                    .map((note) => (
                      <div
                        key={note.id}
                        data-testid={`note-item-${note.id}`}
                        onClick={() => {
                          vibrate(20);
                          playTapSound(520, 0.04);
                          setActiveNoteId(note.id);
                        }}
                        className="px-4 py-3 active:bg-white/[0.08] cursor-pointer transition-colors"
                      >
                        <h3 className="text-[15px] font-semibold text-white truncate">
                          {note.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[13px] mt-0.5">
                          <span className="text-zinc-400 shrink-0">{note.date}</span>
                          <span className="truncate text-zinc-500">{note.excerpt}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          ) : (
            // ================= iOS NOTE DETAIL VIEW (PURE BLACK SHEET) =================
            <motion.div
              key={`note-detail-${activeNote.id}`}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 18 }}
              transition={{ duration: 0.18 }}
              className="py-1 bg-black"
            >
              {/* Date Header */}
              <div className="text-center text-[12px] text-zinc-500 mb-3">
                31 декабря 2026 г. в 22:15
              </div>

              {/* Note Title */}
              <h1 className="text-[22px] font-bold tracking-tight text-white leading-snug mb-4">
                {activeNote.title}
              </h1>

              {/* ================= NOTE 1: ROOT PASSWORDS & CIPHER CLUE ================= */}
              {activeNote.id === 'note-root' && (
                <div>
                  {!isRootDecrypted ? (
                    // LOCKED SSH SCREEN (Clean native iOS locked note look on black sheet)
                    <div
                      data-testid="root-note-locked"
                      className="py-12 px-4 flex flex-col items-center text-center space-y-3"
                    >
                      <Lock className="w-9 h-9 text-[#eab308]" />
                      <p className="text-[14px] text-zinc-300 leading-relaxed max-w-[265px]">
                        Файл зашифрован протоколом SSH. Для чтения запустите дешифратор в приложении Консоль (&gt;_)
                      </p>
                    </div>
                  ) : (
                    // DECRYPTED SECRET ORGANIZER CHEAT SHEET (Flat lines on pure black background)
                    <div data-testid="root-note-unlocked" className="text-[15px] leading-relaxed text-white">
                      <div className="py-3 border-b border-white/[0.07]">
                        <span className="text-zinc-400">Wi-Fi пентхауса: </span>
                        <span className="font-mono font-semibold text-white">
                          Podval_Sangwoo_5G
                        </span>
                        <div className="text-xs text-zinc-500 mt-0.5">
                          Пароль: <span className="font-mono text-zinc-300">ne_vyiti_2027</span>
                        </div>
                      </div>

                      <div className="py-3 border-b border-white/[0.07]">
                        <span className="text-zinc-400">Домофон: </span>
                        <span className="font-mono font-semibold text-white">666#</span>
                        <div className="text-xs text-zinc-500 mt-0.5">
                          Если приехал Игорь Синяк с 10 чемоданами — не открывать
                        </div>
                      </div>

                      <div className="pt-4 pb-1 text-[13px] font-semibold text-[#eab308] uppercase tracking-wider">
                        Где спрятаны 4 цифры от VIP-Сейфа
                      </div>

                      <div className="divide-y divide-white/[0.07]">
                        <div className="py-3 text-[15px]">
                          <span className="text-zinc-400">1-я цифра: </span>
                          <span className="text-white">в Сапёре у Сану</span>
                        </div>

                        <div className="py-3 space-y-2">
                          <div className="text-[15px]">
                            <span className="text-zinc-400">2-я цифра: </span>
                            <span className="text-white">
                              прямо в этой заметке под защитной полоской:
                            </span>
                          </div>

                          <div className="relative pt-1">
                            <AnimatePresence mode="wait">
                              {!isSecondDigitRevealed ? (
                                <motion.button
                                  key="spoiler-bar"
                                  type="button"
                                  data-testid="root-note-spoiler-btn"
                                  whileTap={{ scale: 0.98 }}
                                  onClick={handleScratchSpoiler}
                                  className="w-full py-2.5 px-3 rounded-lg bg-zinc-900 text-xs font-mono font-bold text-[#eab308] tracking-wider flex items-center justify-center cursor-pointer"
                                >
                                  <span>[ ████████ НАЖМИ ЧТОБЫ СТЕРЕТЬ ]</span>
                                </motion.button>
                              ) : (
                                <motion.div
                                  key="revealed-digit"
                                  data-testid="root-note-revealed-digit"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="relative py-2 text-[15px] font-mono font-bold text-[#eab308] flex items-center justify-between"
                                >
                                  <span>2-я цифра кода: «4»</span>
                                  <span className="text-xs text-zinc-500 font-sans font-normal">
                                    Сохранено в сейф
                                  </span>

                                  {spoilerSparks.map((s) => (
                                    <motion.span
                                      key={s}
                                      initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                                      animate={{
                                        opacity: 0,
                                        scale: 1.3,
                                        x: (s % 2 === 0 ? 1 : -1) * (15 + s * 6),
                                        y: -18 - (s % 3) * 8,
                                      }}
                                      transition={{ duration: 0.55 }}
                                      className="pointer-events-none absolute left-1/2 top-1/2 text-[#eab308]"
                                    >
                                      <Sparkles className="w-3.5 h-3.5" />
                                    </motion.span>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        <div className="py-3 text-[15px]">
                          <span className="text-zinc-400">3-я цифра: </span>
                          <span className="text-white">в скрытом альбоме Фото («КТО ТАМ?»)</span>
                        </div>

                        <div className="py-3 text-[15px]">
                          <span className="text-zinc-400">4-я цифра: </span>
                          <span className="text-white">в чатах ПодвалГрама</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ================= NOTE 2: NATIVE iOS CHECKLIST (FLAT ON BLACK) ================= */}
              {activeNote.id === 'note-budget' && (
                <div className="bg-black">
                  {budgetItems.map((item) => (
                    <div
                      key={item.id}
                      data-testid={`budget-item-${item.id}`}
                      onClick={() => handleToggleBudgetItem(item)}
                      className="flex items-start gap-3.5 py-3 border-b border-white/[0.07] cursor-pointer active:opacity-75 transition-opacity"
                    >
                      {/* Native iOS Circular Checkbox */}
                      <div className="mt-0.5 shrink-0">
                        {item.checked ? (
                          <div className="w-[22px] h-[22px] rounded-full bg-[#eab308] flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-[22px] h-[22px] rounded-full border-[1.5px] border-zinc-500" />
                        )}
                      </div>

                      {/* Flat Checklist Text (No line-through, calm gray when checked, pure white when unchecked) */}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div
                          className={`text-[15px] leading-snug ${
                            item.checked ? 'text-zinc-400' : 'text-white'
                          }`}
                        >
                          {item.title}
                        </div>
                        <div className="text-zinc-600 text-xs leading-relaxed">
                          {item.note}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ================= NOTE 3: VIPERR INTERACTIVE LYRICS DRAFT ================= */}
              {activeNote.id === 'note-lyrics' && (
                <div className="bg-black space-y-4">
                  <div className="text-xs text-zinc-500 pb-2 border-b border-white/[0.07]">
                    Нажимай на выделенные желтым строчки, чтобы менять панчи • 140 BPM
                  </div>

                  <div className="space-y-4 text-[15px] leading-relaxed text-white">
                    <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                      [Куплет 1 — Kai Angel &amp; 9mice]
                    </div>

                    <p>
                      Полночь бьёт по стеклам, на плечах тяжелый мех,
                      <br />Я стою на крыше:{' '}
                      <button
                        type="button"
                        data-testid="lyric-slot-0"
                        onClick={() => handleCycleLyricSlot(0)}
                        className="inline text-[#eab308] underline decoration-[#eab308]/50 underline-offset-4 font-medium active:opacity-60 cursor-pointer"
                      >
                        «{LYRIC_SLOTS[0][lyricIndices[0]]}»
                      </button>{' '}
                      — это наш успех.
                    </p>

                    <p>
                      Серебро на шее, вспышки камер в темноте,
                      <br />В эту новогоднюю ночь я{' '}
                      <button
                        type="button"
                        data-testid="lyric-slot-1"
                        onClick={() => handleCycleLyricSlot(1)}
                        className="inline text-[#eab308] underline decoration-[#eab308]/50 underline-offset-4 font-medium active:opacity-60 cursor-pointer"
                      >
                        «{LYRIC_SLOTS[1][lyricIndices[1]]}»
                      </button>{' '}
                      на высоте.
                    </p>

                    <p>
                      Снег летит на линзы, бас качает весь квартал,
                      <br />Врубаем{' '}
                      <button
                        type="button"
                        data-testid="lyric-slot-2"
                        onClick={() => handleCycleLyricSlot(2)}
                        className="inline text-[#eab308] underline decoration-[#eab308]/50 underline-offset-4 font-medium active:opacity-60 cursor-pointer"
                      >
                        «{LYRIC_SLOTS[2][lyricIndices[2]]}»
                      </button>{' '}
                      — это наш финал! 🦇❄️
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sangwoo Forbidden Checkbox Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            data-testid="notes-toast"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            className="absolute bottom-16 left-5 right-5 z-50 px-3.5 py-2.5 rounded-xl bg-[#1c1c1e] text-zinc-200 text-xs font-medium flex items-center justify-center gap-2 shadow-2xl pointer-events-none"
          >
            <AlertTriangle className="w-4 h-4 text-[#eab308] shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom iOS Notes Toolbar */}
      <div className="px-6 pt-2.5 pb-6 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-between text-[#ffd60a] z-20">
        <button
          type="button"
          onClick={() => {
            vibrate(15);
            playTapSound();
          }}
          className="p-1 active:opacity-60"
          title="Чек-лист"
        >
          <CheckSquare className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => {
            vibrate(15);
            playTapSound();
          }}
          className="p-1 active:opacity-60"
          title="Камера"
        >
          <Camera className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => {
            vibrate(15);
            playTapSound();
          }}
          className="p-1 active:opacity-60"
          title="Рисование"
        >
          <PenTool className="w-5 h-5" />
        </button>

        <span className="text-[11px] font-mono text-white/40">
          {activeNoteId ? 'Сохранено' : '3 заметки'}
        </span>

        <button
          type="button"
          onClick={() => {
            vibrate(15);
            playTapSound();
            if (activeNoteId) setActiveNoteId(null);
          }}
          className="p-1 active:opacity-60"
          title="К списку заметок"
        >
          <SquarePen className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
export default NotesApp;
