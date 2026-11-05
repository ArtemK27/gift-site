import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Send,
  Smile,
  Eye,
  CheckCheck,
  Sparkles,
  X,
  Phone,
  Video,
} from 'lucide-react';
import { ChatMessage } from '../../types';
import { vibrate, playTapSound, playNotificationSound } from '../../utils/haptics';

interface MessengerAppProps {
  onBack: () => void;
}

export const MessengerApp: React.FC<MessengerAppProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'Сану',
      senderRole: 'Killing Stalking',
      avatar: './assets/avatar_sangwoo.jpg',
      text: 'Я принёс новогоднюю гирлянду... и биту на всякий случай. Мандарины кто-нибудь взял? 🔪🎄',
      time: '23:51',
    },
    {
      id: 'm2',
      sender: 'Чу Ваньнин',
      senderRole: 'Хаски и его белый кот',
      avatar: './assets/avatar_chu_wanning.jpg',
      text: 'Мо Вэйюй, положи нож и отойди от хунтуней. Ты их сожжёшь ещё до боя курантов.',
      time: '23:52',
    },
    {
      id: 'm3',
      sender: 'Мо Жань',
      senderRole: 'Хаски и его белый кот',
      avatar: './assets/avatar_mo_ran.jpg',
      text: 'Учитель! Я просто хотел украсить их золотой стружкой ради праздника! ✨',
      time: '23:53',
    },
    {
      id: 'm4',
      sender: 'Kai Angel',
      senderRole: 'VIPERR',
      avatar: './assets/avatar_kai_angel.jpg',
      text: 'мы с 9mice щас на студии в шубах дропаем новогодний металл. вайб нереальный 🦇❄️',
      time: '23:54',
    },
    {
      id: 'm5',
      sender: 'Сану',
      senderRole: 'Killing Stalking',
      avatar: './assets/avatar_sangwoo.jpg',
      isSpoilerPhoto: true,
      photoUrl: './assets/art_spoiler_sangwoo.jpg',
      text: 'Чекайте новогодний пентхаус. Подарок ждёт в Сейфе 🍷',
      time: '23:55',
    },
  ]);

  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [showStickers, setShowStickers] = useState(false);
  const [clueRevealed, setClueRevealed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const stickers = [
    {
      id: 'st-1',
      name: 'Сану & Пряник',
      image: './assets/sticker_sangwoo.png',
      caption: 'С Новым Годом, добыча 🎄',
    },
    {
      id: 'st-2',
      name: 'Кот Шицзунь',
      image: './assets/sticker_chu_wanning.png',
      caption: 'Хунтуни готовы! 🥟',
    },
    {
      id: 'st-3',
      name: 'Viperr Конфетти',
      image: './assets/sticker_viperr.png',
      caption: 'Heavy Metal 2027 🦇✨',
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initial typing simulation from Mo Ran
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setIsTyping('Мо Жань');
    }, 1500);

    const timer2 = setTimeout(() => {
      setIsTyping(null);
      playNotificationSound();
      vibrate(35);
      setMessages((prev) => [
        ...prev,
        {
          id: 'm-live-1',
          sender: 'Мо Жань',
          senderRole: 'Хаски и его белый кот',
          avatar: './assets/avatar_mo_ran.jpg',
          text: 'Кстати! Наша подруга зашла в сеть! Скинь стикер в чат, чтобы мы выдали тебе код от сейфа! 🎁',
          time: '23:56',
        },
      ]);
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const toggleSpoiler = (msgId: string, photoUrl?: string) => {
    vibrate(25);
    playTapSound(500, 0.05);
    setRevealedSpoilers((prev) => ({ ...prev, [msgId]: true }));
    if (photoUrl) {
      setActivePhotoModal(photoUrl);
    }
  };

  const handleSendSticker = (sticker: typeof stickers[0]) => {
    vibrate(30);
    playTapSound(700, 0.06);
    setShowStickers(false);

    // Append user sticker
    const newMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'Вы',
      avatar: './assets/bait_cover.jpg',
      isMe: true,
      isSticker: true,
      stickerUrl: sticker.image,
      text: sticker.caption,
      time: '23:57',
    };
    setMessages((prev) => [...prev, newMsg]);

    // Characters react
    setTimeout(() => {
      setIsTyping('Kai Angel');
    }, 800);

    setTimeout(() => {
      setIsTyping(null);
      playNotificationSound();
      vibrate(40);
      setMessages((prev) => [
        ...prev,
        {
          id: `m-react-1`,
          sender: 'Kai Angel',
          senderRole: 'VIPERR',
          avatar: './assets/avatar_kai_angel.jpg',
          text: 'ВАУ ВОТ ЭТО СТИЛЬ 🦇✨ Наш человек!',
          time: '23:57',
        },
      ]);
    }, 2200);

    setTimeout(() => {
      setIsTyping('Сану');
    }, 2800);

    setTimeout(() => {
      setIsTyping(null);
      playNotificationSound();
      vibrate([40, 80, 40]);
      setClueRevealed(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `m-react-2`,
          sender: 'Сану',
          senderRole: 'Killing Stalking',
          avatar: './assets/avatar_sangwoo.jpg',
          text: 'Ха-ха, заценил. Заслужила! Первые две цифры от Сейфа — «20». Вторые две спрятаны в Заметках, иди проверяй! 🗝️',
          time: '23:58',
        },
      ]);
    }, 4500);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#08090E] select-none text-white z-30 overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/10 bg-black/60 backdrop-blur-xl z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              vibrate(15);
              onBack();
            }}
            aria-label="Назад к чатам"
            className="p-1.5 -ml-1 rounded-full hover:bg-white/10 active:scale-95 transition-all text-zinc-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Group Avatar stack */}
          <div className="relative w-10 h-10 flex-shrink-0">
            <img
              src="./assets/avatar_sangwoo.jpg"
              alt="Avatar 1"
              className="w-7 h-7 rounded-full border border-black absolute top-0 left-0 object-cover"
            />
            <img
              src="./assets/avatar_chu_wanning.jpg"
              alt="Avatar 2"
              className="w-7 h-7 rounded-full border border-black absolute bottom-0 right-0 object-cover"
            />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold tracking-tight truncate flex items-center gap-1">
              Новогодний Комитет 🎄
            </span>
            <span className="text-[11px] text-zinc-400 truncate">
              {isTyping ? (
                <span className="text-cyan-400 font-medium animate-pulse">
                  {isTyping} печатает...
                </span>
              ) : (
                '5 участников в сети'
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-zinc-400">
          <button className="p-2 rounded-full hover:bg-white/10 active:scale-95" title="Позвонить">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 active:scale-95" title="Видеозвонок">
            <Video className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              vibrate(15);
              playTapSound(400, 0.04);
              onBack();
            }}
            aria-label="Закрыть мессенджер"
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white/80 transition-all ml-1"
            title="Закрыть приложение"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Secret Clue Toast Banner */}
      <AnimatePresence>
        {clueRevealed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 border-b border-amber-400/30 px-4 py-2 flex items-center justify-between text-xs backdrop-blur-md"
          >
            <span className="text-amber-200 font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Код разблокировки: 20 • •
            </span>
            <span className="text-[10px] text-zinc-300 font-mono">
              Часть 1/2 найдена
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3.5 overscroll-contain touch-pan-y">
        {messages.map((msg) => {
          const isRevealed = revealedSpoilers[msg.id];

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`flex gap-2.5 ${msg.isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!msg.isMe && (
                <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-zinc-800 border border-white/15">
                  <img
                    src={msg.avatar}
                    alt={msg.sender}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div
                className={`max-w-[78%] flex flex-col ${
                  msg.isMe ? 'items-end' : 'items-start'
                }`}
              >
                {!msg.isMe && (
                  <div className="flex items-center gap-1.5 mb-1 ml-1">
                    <span className="text-[11px] font-bold text-amber-300">
                      {msg.sender}
                    </span>
                    {msg.senderRole && (
                      <span className="text-[9px] text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded-full border border-white/10 font-mono">
                        {msg.senderRole}
                      </span>
                    )}
                  </div>
                )}

                {/* Spoiler photo message */}
                {msg.isSpoilerPhoto ? (
                  <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-white/15 shadow-lg p-1.5">
                    <div
                      onClick={() => toggleSpoiler(msg.id, msg.photoUrl)}
                      className="relative w-52 h-64 rounded-xl overflow-hidden cursor-pointer group"
                    >
                      <img
                        src={msg.photoUrl}
                        alt="Spoiler"
                        className={`w-full h-full object-cover transition-all duration-500 ${
                          isRevealed ? 'filter-none scale-100' : 'filter blur-xl scale-110 brightness-50'
                        }`}
                      />

                      {/* Telegram-style sparkling particle canvas overlay if hidden */}
                      {!isRevealed && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center p-3 text-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                            className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white mb-2 shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                          >
                            <Eye className="w-5 h-5 text-amber-300" />
                          </motion.div>
                          <span className="text-xs font-bold text-white tracking-wide">
                            СПОЙЛЕР ФОТО 🎄
                          </span>
                          <span className="text-[10px] text-zinc-300 mt-0.5">
                            Нажмите, чтобы открыть
                          </span>
                        </div>
                      )}
                    </div>
                    {msg.text && (
                      <p className="text-xs text-zinc-200 mt-2 px-1">
                        {msg.text}
                      </p>
                    )}
                  </div>
                ) : msg.isSticker ? (
                  // Sticker message
                  <div className="flex flex-col items-end">
                    <div className="w-28 h-28 rounded-2xl bg-white/5 p-1 border border-white/10 overflow-hidden shadow-lg">
                      <img
                        src={msg.stickerUrl}
                        alt="Sticker"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {msg.text && (
                      <span className="text-[10px] text-zinc-400 mt-1 font-medium">
                        {msg.text}
                      </span>
                    )}
                  </div>
                ) : (
                  // Standard text bubble
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed shadow-md ${
                      msg.isMe
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs'
                        : 'bg-white/[0.08] border border-white/10 text-zinc-200 rounded-bl-xs backdrop-blur-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                )}

                <div className="flex items-center gap-1 mt-0.5 px-1">
                  <span className="text-[9px] text-zinc-500 font-mono">
                    {msg.time}
                  </span>
                  {msg.isMe && (
                    <CheckCheck className="w-3 h-3 text-cyan-400" />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Live typing indicator bubble */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs text-zinc-400 pl-1"
          >
            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] border border-white/10">
              ✍️
            </div>
            <div className="flex items-center gap-1 bg-white/[0.06] px-3 py-1.5 rounded-full border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input & Sticker Drawer trigger */}
      <div className="p-3 border-t border-white/10 bg-black/70 backdrop-blur-xl z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              vibrate(20);
              playTapSound();
              setShowStickers((prev) => !prev);
            }}
            aria-label="Открыть стикеры"
            className={`p-2.5 rounded-xl border transition-all ${
              showStickers
                ? 'bg-amber-400 text-black border-amber-300'
                : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white'
            }`}
            title="Отправить стикер"
          >
            <Smile className="w-5 h-5" />
          </button>

          <div className="flex-1 bg-white/[0.06] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-400 flex items-center justify-between">
            <span>Выберите стикер для персонажей...</span>
          </div>

          <button
            onClick={() => setShowStickers(true)}
            className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Sticker Picker Drawer */}
        <AnimatePresence>
          {showStickers && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 pt-3 border-t border-white/10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                  Праздничные Стикеры 🎄
                </span>
                <span className="text-[10px] text-zinc-500">
                  Тапните, чтобы отправить
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {stickers.map((st) => (
                  <motion.div
                    key={st.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSendSticker(st)}
                    className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-black/40 p-1">
                      <img
                        src={st.image}
                        alt={st.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[10px] font-medium text-zinc-300 text-center truncate w-full">
                      {st.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      <AnimatePresence>
        {activePhotoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4"
          >
            <button
              onClick={() => {
                vibrate(15);
                setActivePhotoModal(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-[360px] aspect-[9/16] max-h-[75vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
            >
              <img
                src={activePhotoModal}
                alt="Fullscreen"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
