import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Pin,
  Search,
  Mic,
  MoreHorizontal,
  Share,
  CheckCircle2,
  Circle,
  CheckSquare,
  Camera,
  PenTool,
  SquarePen,
  Key,
} from 'lucide-react';
import { NoteItem } from '../../types';
import { vibrate, playTapSound } from '../../utils/haptics';

interface NotesAppProps {
  onBack: () => void;
}

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  isClue?: boolean;
}

export const NotesApp: React.FC<NotesAppProps> = ({ onBack }) => {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  // Checklists inside each note
  const [checklists, setChecklists] = useState<Record<string, ChecklistItem[]>>({
    'note-1': [
      { id: 'c1', text: 'Взять тончайшее тесто, белое, как снег на пике Сишэн', checked: true },
      { id: 'c2', text: 'Мясная начинка + сочный лук + масло чили', checked: true },
      { id: 'c3', text: 'Отмерить ровно 2 грамма священного перца [ЦИФРА 2]', checked: false, isClue: true },
      { id: 'c4', text: 'Варить ровно 7 минут (стекло в рецепте — метафора, Мо Жань!)', checked: true },
      { id: 'c5', text: 'Подать Учителю с чаем и забрать первую часть шифра', checked: false },
    ],
    'note-2': [
      { id: 'c6', text: 'Две огромные черные шубы из эко-меха для Kai Angel & 9mice', checked: true },
      { id: 'c7', text: '4 банки ледяного напитка и винтажные очки Balenciaga', checked: true },
      { id: 'c8', text: 'Ровно 7 пачек серебряной мишуры на микрофоны [ЦИФРА 7]', checked: false, isClue: true },
      { id: 'c9', text: 'Дропнуть Heavy Metal New Year ровно под бой курантов', checked: true },
      { id: 'c10', text: 'Сложить шифр: 2 (хунтуни) + 7 (райдер) = «27»', checked: false, isClue: true },
    ],
  });

  const toggleCheck = (noteId: string, itemId: string) => {
    vibrate(20);
    playTapSound(700, 0.04);
    setChecklists((prev) => ({
      ...prev,
      [noteId]: prev[noteId].map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      ),
    }));
  };

  const notes: NoteItem[] = [
    {
      id: 'note-1',
      title: '🥟 Рецепт хунтуней от Чу Ваньнина',
      date: '31 декабря',
      excerpt: 'Если Мо Вэйюй ещё раз перепутает сахар с солью, Тяньвэнь станцует на его спине...',
      clueDigit: '2',
      pinned: true,
      fullText: [
        '«Инструкция для тех, кто не умеет готовить (то есть для Мо Жаня)»:',
        '1. Тесто должно быть тонким и нежным. Лепить аккуратно, не сминать!',
        '2. В начинку строго 2 грамма священного белого перца. Запомни это число: цифра «2»!',
        '3. Острота бульона согревает сердце даже в лютый новогодний мороз.',
        '— Чу Ваньнин. (Вторая половина кода начинается с 2).',
      ],
    },
    {
      id: 'note-2',
      title: '🦇 Новогодний райдер Kai Angel & 9mice',
      date: '31 декабря',
      excerpt: 'Шубы в пол, серебряная мишура, черные стекла и тяжелый новогодний металл...',
      clueDigit: '7',
      pinned: true,
      fullText: [
        '«BACKSTAGE RIDER: HEAVY METAL NEW YEAR 2027»',
        '1. Черная кожа, серебряные кресты и чистый звук на 120dB.',
        '2. Ровно 7 пачек сверкающей мишуры! Запомни цифру: «7»!',
        '3. Соединить с цифрой Учителя: 2 + 7 = «27» для Сейфа!',
        '— Kai & 9mice. (Вторая половина кода завершена: 27!).',
      ],
    },
  ];

  const activeNote = notes.find((n) => n.id === activeNoteId);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#000000] text-white select-none z-30 overflow-hidden font-sans">
      {/* Top iOS Navigation Bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 bg-black/80 backdrop-blur-xl border-b border-white/10 z-20">
        <button
          onClick={() => {
            vibrate(15);
            playTapSound(400, 0.04);
            if (activeNoteId) {
              setActiveNoteId(null);
            } else {
              onBack();
            }
          }}
          className="flex items-center gap-0.5 text-[#ffd60a] text-base font-normal active:opacity-60 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6 -ml-1 stroke-[2.2]" />
          <span>{activeNoteId ? 'Заметки' : 'Папки'}</span>
        </button>

        <div className="flex items-center gap-3 text-[#ffd60a]">
          <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#ffd60a]/15 text-[#ffd60a] border border-[#ffd60a]/30 flex items-center gap-1">
            <Key className="w-3 h-3" />
            Код: ?? 27
          </span>
          <button className="p-1 rounded-full active:opacity-60">
            <Share className="w-5 h-5" />
          </button>
          <button className="p-1 rounded-full active:opacity-60">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 overscroll-contain">
        <AnimatePresence mode="wait">
          {!activeNote ? (
            // ================= iOS NOTES LIST VIEW =================
            <motion.div
              key="notes-list"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Large iOS Title */}
              <div className="pt-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                  Заметки
                </h1>
                <span className="text-xs text-white/50 font-medium">
                  iCloud • 2 заметки с шифрами
                </span>
              </div>

              {/* iOS Search Bar */}
              <div className="flex items-center justify-between px-3 py-2 rounded-[14px] bg-[#1c1c1e] text-white/60 text-sm">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-white/40" />
                  <span className="text-white/40 text-xs">Поиск</span>
                </div>
                <Mic className="w-4 h-4 text-white/40" />
              </div>

              {/* Grouped Notes Section */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 px-2 text-[11px] font-bold text-white/40 uppercase tracking-wider">
                  <Pin className="w-3 h-3 text-[#ffd60a]" />
                  <span>Закрепленные</span>
                </div>

                {/* iOS Grouped Inset Card Container */}
                <div className="rounded-[20px] bg-[#1c1c1e] border border-white/10 overflow-hidden divide-y divide-white/10 shadow-lg">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => {
                        vibrate(20);
                        playTapSound(520, 0.04);
                        setActiveNoteId(note.id);
                      }}
                      className="p-3.5 hover:bg-white/[0.04] active:bg-white/[0.08] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-bold text-white tracking-tight truncate pr-2">
                          {note.title}
                        </h3>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#ffd60a]/20 text-[#ffd60a] border border-[#ffd60a]/30 flex-shrink-0">
                          «{note.clueDigit}»
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <span className="text-white/40 text-[11px] font-mono flex-shrink-0">
                          {note.date}
                        </span>
                        <span className="truncate text-white/70">
                          {note.excerpt}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quest Hint Box */}
              <div className="p-3.5 rounded-[18px] bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-transparent border border-[#ffd60a]/20 text-xs text-amber-200/90 leading-relaxed">
                <div className="font-bold text-[#ffd60a] mb-1 flex items-center gap-1.5">
                  <span>💡 Новогодняя подсказка</span>
                </div>
                Открой обе заметки и отметь пункты в чек-листе. Цифры <strong>2</strong> и <strong>7</strong> дают вторую половину кода: <strong>«27»</strong>!
              </div>
            </motion.div>
          ) : (
            // ================= iOS NOTE EDITOR / DETAIL VIEW =================
            <motion.div
              key="note-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="py-2 space-y-4"
            >
              {/* Date Header */}
              <div className="text-center text-[11px] text-white/40 font-mono">
                31 декабря 2026 г. в 22:15
              </div>

              {/* Note Title */}
              <h1 className="text-xl font-extrabold tracking-tight text-white leading-snug">
                {activeNote.title}
              </h1>

              {/* Note Paragraphs */}
              <div className="space-y-2 text-xs text-white/80 leading-relaxed">
                {activeNote.fullText.map((p, idx) => (
                  <p key={idx} className="p-1">
                    {p}
                  </p>
                ))}
              </div>

              {/* Interactive iOS Checklist */}
              <div className="pt-2">
                <div className="text-xs font-bold text-[#ffd60a] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4" />
                  <span>Интерактивный список ингредиентов / райдера:</span>
                </div>

                <div className="rounded-[18px] bg-[#1c1c1e] border border-white/10 p-2 space-y-1 shadow-md">
                  {checklists[activeNote.id]?.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleCheck(activeNote.id, item.id)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                        item.checked
                          ? 'bg-white/[0.02] text-white/40 line-through'
                          : 'hover:bg-white/[0.05] text-white'
                      } ${item.isClue ? 'border border-[#ffd60a]/30' : ''}`}
                    >
                      {item.checked ? (
                        <CheckCircle2 className="w-5 h-5 text-[#ffd60a] flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-white/40 flex-shrink-0" />
                      )}
                      <span className={`text-xs ${item.isClue ? 'font-bold text-[#ffd60a]' : ''}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom iOS Notes Toolbar */}
      <div className="px-6 py-2.5 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-between text-[#ffd60a] z-20">
        <button
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
          {activeNoteId ? 'Сохранено' : '2 заметки'}
        </span>

        <button
          onClick={() => {
            vibrate(15);
            playTapSound();
            if (activeNoteId) setActiveNoteId(null);
          }}
          className="p-1 active:opacity-60"
          title="Новая заметка"
        >
          <SquarePen className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
