import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Heart,
  Share,
  Info,
  SlidersHorizontal,
  DoorOpen,
  X,
  Layers,
  Sparkles,
  Lock,
} from 'lucide-react';
import { GalleryItem } from '../../types';
import { vibrate, playTapSound, playUnlockSound } from '../../utils/haptics';

interface GalleryAppProps {
  onBack: () => void;
}

export const GalleryApp: React.FC<GalleryAppProps> = ({ onBack }) => {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [isFavorited, setIsFavorited] = useState<Record<string, boolean>>({
    'g-1': true,
    'g-2': true,
    'g-3': true,
  });
  const [knockCount, setKnockCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'days' | 'months'>('all');

  const galleryItems: GalleryItem[] = [
    {
      id: 'g-1',
      title: 'Первый снег на пике Сишэн',
      subtitle: 'Чу Ваньнин и Мо Жань под красными фонариками',
      image: './assets/art_spoiler_erha.jpg',
      date: '31 декабря 2026 г., 23:30',
      tag: 'XIANXIA',
    },
    {
      id: 'g-2',
      title: 'Пентхаус Сану: Бокал за 2027',
      subtitle: 'Панорамный вид ночного города, шампанское и колпак Санты',
      image: './assets/art_spoiler_sangwoo.jpg',
      date: '31 декабря 2026 г., 23:45',
      tag: 'THRILLER',
    },
    {
      id: 'g-3',
      title: 'VIPERR Backstage: Heavy Metal NY',
      subtitle: 'Kai Angel & 9mice в шубах и серебряной мишуре на рейве',
      image: './assets/art_spoiler_viperr.jpg',
      date: '31 декабря 2026 г., 23:55',
      tag: 'OPIUM/RAVE',
    },
    {
      id: 'g-4',
      title: 'Скрытый альбом: Таинственная Дверь',
      subtitle: 'Пасхалка прошлого года с надписью «КТО ТАМ?»',
      image: '',
      date: 'Заблокировано FaceID 🚪',
      tag: 'SECRET',
      isEasterEgg: true,
    },
  ];

  const handleOpenPhoto = (item: GalleryItem) => {
    vibrate(20);
    playTapSound(520, 0.04);
    setSelectedItem(item);
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    vibrate(25);
    playTapSound(750, 0.05);
    setIsFavorited((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDoorKnock = () => {
    vibrate([35, 45, 35]);
    playTapSound(240, 0.06);
    setKnockCount((prev) => {
      const next = prev + 1;
      if (next === 3) {
        playUnlockSound();
      }
      return next;
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#000000] text-white select-none z-30 overflow-hidden font-sans">
      {/* Top iOS Photos Bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 bg-black/80 backdrop-blur-xl border-b border-white/10 z-20">
        <button
          onClick={() => {
            vibrate(15);
            playTapSound(400, 0.04);
            onBack();
          }}
          className="flex items-center gap-0.5 text-[#007aff] text-base font-normal active:opacity-60"
        >
          <ChevronLeft className="w-6 h-6 -ml-1 stroke-[2.2]" />
          <span>Альбомы</span>
        </button>

        <span className="text-sm font-bold tracking-tight">Новый Год 2027</span>

        <button className="text-[#007aff] text-sm font-medium active:opacity-60">
          Выбрать
        </button>
      </div>

      {/* Segmented Filter Pills */}
      <div className="flex justify-center py-2 px-4 bg-black/60 border-b border-white/5">
        <div className="flex items-center p-0.5 rounded-[12px] bg-[#1c1c1e] text-[11px] font-semibold text-white/60">
          {(['all', 'days', 'months'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                vibrate(10);
                setActiveTab(tab);
              }}
              className={`px-3 py-1 rounded-[10px] transition-all ${
                activeTab === tab
                  ? 'bg-[#2c2c2e] text-white shadow-sm'
                  : 'hover:text-white/80'
              }`}
            >
              {tab === 'all' ? 'Все фото' : tab === 'days' ? 'Дни' : 'Месяцы'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Photos Grid with Date Headers */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 overscroll-contain">
        {/* Date Group Header */}
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="text-lg font-bold tracking-tight text-white">
              31 декабря 2026
            </h2>
            <span className="text-[11px] text-white/40 font-mono">
              Новогодняя Ночь
            </span>
          </div>
          <p className="text-xs text-white/50 mb-3">
            Пик Сишэн • Пенхаус Сану • VIPERR Stage
          </p>

          {/* 2-Column Responsive Grid */}
          <div className="grid grid-cols-2 gap-3">
            {galleryItems.map((item) => (
              <motion.div
                key={item.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleOpenPhoto(item)}
                className="relative aspect-[3/4] rounded-[20px] overflow-hidden bg-[#1c1c1e] border border-white/10 shadow-lg cursor-pointer group"
              >
                {item.isEasterEgg ? (
                  // Mystery Hidden Album Cover
                  <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-black to-zinc-950 flex flex-col items-center justify-center p-4 text-center relative">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                      <Lock className="w-6 h-6 animate-pulse" />
                    </div>
                    <span className="text-xs font-bold text-amber-300 font-mono">
                      КТО ТАМ?
                    </span>
                    <span className="text-[9px] text-white/40 mt-1 uppercase tracking-wider">
                      Скрытый архив
                    </span>
                  </div>
                ) : (
                  <>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Gradient overlay for labels */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                    {/* Favorite Heart Badge */}
                    <button
                      onClick={(e) => toggleFavorite(item.id, e)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:scale-110 active:scale-95 transition-transform"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isFavorited[item.id]
                            ? 'text-rose-500 fill-rose-500'
                            : 'text-white/70'
                        }`}
                      />
                    </button>

                    {/* Tag badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-[9px] font-mono text-white/80 border border-white/10">
                      {item.tag}
                    </div>

                    {/* Bottom Caption */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <p className="text-[11px] font-bold text-white truncate">
                        {item.title}
                      </p>
                      <p className="text-[9px] text-white/60 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom iOS Photos Navigation Tab Bar */}
      <div className="px-6 py-2 bg-black/85 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around text-xs text-white/50 z-20">
        <div className="flex flex-col items-center text-[#007aff] cursor-pointer">
          <Layers className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] font-medium mt-0.5">Медиатека</span>
        </div>
        <div className="flex flex-col items-center cursor-pointer hover:text-white/80">
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Для вас</span>
        </div>
        <div className="flex flex-col items-center cursor-pointer hover:text-white/80">
          <Heart className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Избранное</span>
        </div>
      </div>

      {/* ================= FULLSCREEN iOS PHOTO VIEWER ================= */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="absolute inset-0 z-50 bg-[#000000] flex flex-col justify-between select-none"
          >
            {/* Viewer Top Bar */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2 bg-black/80 backdrop-blur-xl border-b border-white/10 z-20">
              <button
                onClick={() => {
                  vibrate(15);
                  setSelectedItem(null);
                  setShowInfo(false);
                  setKnockCount(0);
                }}
                className="flex items-center gap-1 text-[#007aff] text-sm active:opacity-60"
              >
                <ChevronLeft className="w-6 h-6 -ml-1 stroke-[2.2]" />
                <span>Фото</span>
              </button>

              <div className="text-center">
                <div className="text-xs font-bold text-white">
                  31 декабря 2026
                </div>
                <div className="text-[10px] text-white/50 font-mono">
                  23:59 • Новогодняя ночь
                </div>
              </div>

              <button
                onClick={() => {
                  vibrate(15);
                  setSelectedItem(null);
                  setShowInfo(false);
                }}
                className="p-1.5 rounded-full bg-white/10 text-white active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Viewer Media Body */}
            <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
              {selectedItem.isEasterEgg ? (
                // Interactive Easter Egg Mystery Door
                <div className="flex flex-col items-center text-center max-w-[320px]">
                  <motion.div
                    whileTap={{ scale: 0.94 }}
                    onClick={handleDoorKnock}
                    className="w-36 h-56 rounded-t-[28px] border-4 border-amber-500 bg-gradient-to-b from-zinc-900 to-black shadow-[0_0_40px_rgba(245,158,11,0.35)] flex flex-col items-center justify-center cursor-pointer transition-all mb-4 relative"
                  >
                    <DoorOpen className="w-10 h-10 text-amber-400 mb-2" />
                    <span className="text-sm font-black font-mono text-amber-300">
                      КТО ТАМ?
                    </span>
                    <span className="text-[10px] text-white/50 mt-2 font-mono">
                      Стуков: {knockCount} / 3
                    </span>
                  </motion.div>

                  <h3 className="text-lg font-bold text-white mb-1">
                    Скрытый новогодний архив
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed mb-4">
                    {knockCount === 0 && 'Постучите в дверь 3 раза, чтобы проверить, кто за ней прячется...'}
                    {knockCount === 1 && '— Тук-тук! Послышался шорох мандаринов и голос Сану: «Кто там ломится?»'}
                    {knockCount === 2 && '— Тук-тук-тук! Чу Ваньнин: «Мо Вэйюй, открой дверь, это наша подруга!»'}
                    {knockCount >= 3 && (
                      <span className="text-amber-300 font-bold animate-pulse">
                        ✨ «ДВЕРЬ ОТКРЫТА! Все персонажи поздравляют тебя с 2027 годом! Скорее открывай VIP Сейф!»
                      </span>
                    )}
                  </p>

                  <button
                    onClick={handleDoorKnock}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white text-xs font-bold shadow-lg active:scale-95 transition-transform"
                  >
                    {knockCount < 3 ? '🚪 Постучать в дверь' : '🎉 Дверь открыта!'}
                  </button>
                </div>
              ) : (
                // Fullscreen Photo Display
                <div className="relative w-full max-w-[370px] aspect-[9/16] max-h-[70vh] rounded-[24px] overflow-hidden border border-white/20 shadow-2xl">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* EXIF Metadata Sheet (if toggled) */}
            <AnimatePresence>
              {showInfo && !selectedItem.isEasterEgg && (
                <motion.div
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 80, opacity: 0 }}
                  className="px-6 py-3 bg-[#1c1c1e] border-t border-white/10 text-xs text-white/80 space-y-1"
                >
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>Apple iPhone 16 Pro</span>
                    <span className="text-white/40 font-mono">48 МП • ISO 100</span>
                  </div>
                  <div className="text-[11px] text-white/50 font-mono">
                    Основная камера 24 мм ƒ/1.78 • 8064 × 6048 • HEIF
                  </div>
                  <div className="text-[11px] text-cyan-300 font-medium">
                    Локация: Новогодняя ночь 2027 • Взлом системы
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Viewer Bottom iOS Toolbar */}
            <div className="px-6 py-3 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-between text-[#007aff] z-20">
              <button
                onClick={() => {
                  vibrate(15);
                  playTapSound();
                }}
                className="p-1 active:opacity-60"
                title="Поделиться"
              >
                <Share className="w-5 h-5" />
              </button>

              <button
                onClick={(e) => toggleFavorite(selectedItem.id, e)}
                className="p-1 active:scale-125 transition-transform"
                title="Избранное"
              >
                <Heart
                  className={`w-6 h-6 ${
                    isFavorited[selectedItem.id]
                      ? 'text-rose-500 fill-rose-500'
                      : 'text-[#007aff]'
                  }`}
                />
              </button>

              <button
                onClick={() => {
                  vibrate(15);
                  setShowInfo((prev) => !prev);
                }}
                className={`p-1 active:opacity-60 transition-colors ${
                  showInfo ? 'text-white' : 'text-[#007aff]'
                }`}
                title="Информация"
              >
                <Info className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  vibrate(15);
                  playTapSound();
                }}
                className="p-1 active:opacity-60"
                title="Настройки"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
