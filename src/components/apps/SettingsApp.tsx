import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  X,
  Volume2,
  VolumeX,
  Vibrate,
  Smartphone,
  Check,
  ShieldAlert,
  Info,
  HardDrive,
  Cpu,
  KeyRound,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Flame,
  Moon,
  CloudSnow,
} from 'lucide-react';
import { useSettings, WallpaperId } from '../../context/SettingsContext';
import { vibrate, playTapSound, playGlitchSound } from '../../utils/haptics';

interface SettingsAppProps {
  onBack: () => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({ onBack }) => {
  const {
    soundEnabled,
    hapticsEnabled,
    wallpaper,
    setSoundEnabled,
    setHapticsEnabled,
    setWallpaper,
    resetQuestProgress,
  } = useSettings();

  const [confirmReset, setConfirmReset] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      playTapSound(600, 0.05);
    }
    vibrate(20);
  };

  const handleToggleHaptics = () => {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    if (next) {
      vibrate([25, 40]);
    }
    playTapSound(480, 0.04);
  };

  const handleSelectWallpaper = (id: WallpaperId) => {
    vibrate(20);
    playTapSound(520, 0.04);
    setWallpaper(id);
  };

  const handleReset = () => {
    vibrate([40, 80, 120]);
    playGlitchSound();
    resetQuestProgress();
    setConfirmReset(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2600);
  };

  const wallpapers: Array<{
    id: WallpaperId;
    title: string;
    description: string;
    gradient: string;
    icon: typeof CloudSnow;
    accent: string;
  }> = [
    {
      id: 'newyear',
      title: 'Новогодняя ночь',
      description: 'OLED + Снегопад + Лепестки сянься',
      gradient: 'from-[#07090e] via-[#0f172a] to-[#1e1b4b]',
      icon: CloudSnow,
      accent: 'border-cyan-400/40 text-cyan-300',
    },
    {
      id: 'sangwoo',
      title: 'Пентхаус Сану',
      description: 'Глубокий бордовый градиент + салют',
      gradient: 'from-[#140407] via-[#2a0812] to-[#4c0519]',
      icon: Flame,
      accent: 'border-red-500/40 text-red-300',
    },
    {
      id: 'sisheng',
      title: 'Пик Сишэн',
      description: 'Лазурный туман + морозные кристаллы',
      gradient: 'from-[#03131d] via-[#082f49] to-[#0c4a6e]',
      icon: Moon,
      accent: 'border-sky-400/40 text-sky-300',
    },
  ];

  return (
    <div className="relative w-full h-full flex flex-col bg-[#000000] text-white select-none z-30 overflow-hidden font-sans">
      {/* Top Navigation Bar with ChevronLeft & Frosted X Exit */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2.5 bg-black/80 backdrop-blur-xl border-b border-white/10 z-20">
        <button
          onClick={() => {
            vibrate(15);
            playTapSound(400, 0.04);
            onBack();
          }}
          className="flex items-center gap-1 text-[#007aff] hover:text-[#0a84ff] active:opacity-60 transition-all -ml-1 py-1 px-1.5 rounded-lg"
          aria-label="Назад"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.4]" />
          <span className="text-base font-normal">Назад</span>
        </button>

        <span className="text-base font-semibold text-white tracking-tight">Настройки</span>

        <button
          onClick={() => {
            vibrate(20);
            playTapSound(420, 0.04);
            onBack();
          }}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center backdrop-blur-md border border-white/15 text-white/80 transition-all"
          aria-label="Закрыть настройки"
        >
          <X className="w-4 h-4 stroke-[2.4]" />
        </button>
      </div>

      {/* Scrollable Settings Groups with Touch Isolation */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8 space-y-5 overscroll-contain touch-pan-y">
        {/* iOS Large Title */}
        <div className="pt-1 pb-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Настройки</h1>
        </div>

        {/* Profile Card: Sangwoo */}
        <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/10 shadow-lg flex items-center gap-3.5">
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-red-900 to-black border-2 border-red-500/30 shrink-0 flex items-center justify-center shadow-inner">
            {!avatarError ? (
              <img
                src="./assets/avatar_sangwoo.jpg"
                alt="О Сану"
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className="text-xl font-bold text-red-200">ОС</span>
            )}
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#1c1c1e]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white truncate">О Сану</h2>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-semibold tracking-wide shrink-0">
                Владелец устройства
              </span>
            </div>
            <p className="text-xs text-white/50 truncate mt-0.5">
              Apple ID, iCloud & Пентхаус
            </p>
            <p className="text-[11px] text-zinc-400/80 truncate mt-0.5">
              Сеул • Премиум аккаунт 🔪
            </p>
          </div>
        </div>

        {/* Group 1: Звуки и тактильность */}
        <div className="space-y-1.5">
          <div className="px-3 text-[11px] font-bold text-white/45 uppercase tracking-wider">
            Звуки и тактильность
          </div>
          <div className="bg-[#1c1c1e] rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/[0.08]">
            {/* Sound Toggle */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${soundEnabled ? 'bg-[#34c759]' : 'bg-zinc-700'}`}>
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Звуковые эффекты</div>
                  <div className="text-[11px] text-white/40">Тапы, клики сейфа, уведомления</div>
                </div>
              </div>

              {/* iOS Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={soundEnabled}
                onClick={handleToggleSound}
                className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
                  soundEnabled ? 'bg-[#34c759]' : 'bg-[#39393d]'
                }`}
              >
                <motion.div
                  className="w-6 h-6 rounded-full bg-white shadow-md"
                  animate={{ x: soundEnabled ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* Haptics Toggle */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${hapticsEnabled ? 'bg-[#5856d6]' : 'bg-zinc-700'}`}>
                  <Vibrate className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Тактильный отклик</div>
                  <div className="text-[11px] text-white/40">Вибрация клавиш и анимаций</div>
                </div>
              </div>

              {/* iOS Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={hapticsEnabled}
                onClick={handleToggleHaptics}
                className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
                  hapticsEnabled ? 'bg-[#34c759]' : 'bg-[#39393d]'
                }`}
              >
                <motion.div
                  className="w-6 h-6 rounded-full bg-white shadow-md"
                  animate={{ x: hapticsEnabled ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Group 2: Обои и оформление */}
        <div className="space-y-1.5">
          <div className="px-3 text-[11px] font-bold text-white/45 uppercase tracking-wider">
            Обои и оформление
          </div>
          <div className="bg-[#1c1c1e] rounded-2xl border border-white/10 p-3 space-y-2">
            {wallpapers.map((wp) => {
              const isSelected = wallpaper === wp.id;
              const IconComp = wp.icon;
              return (
                <button
                  key={wp.id}
                  onClick={() => handleSelectWallpaper(wp.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
                    isSelected
                      ? 'bg-white/10 border-white/30 shadow-md'
                      : 'bg-black/30 border-white/5 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${wp.gradient} border ${wp.accent} flex items-center justify-center shrink-0 shadow`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {wp.title}
                      </div>
                      <div className="text-[11px] text-white/50 truncate">
                        {wp.description}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-[#007aff] flex items-center justify-center text-white shadow">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-white/20" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Group 3: Об этом устройстве (Easter Egg Lore) */}
        <div className="space-y-1.5">
          <div className="px-3 text-[11px] font-bold text-white/45 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>Об этом устройстве</span>
          </div>
          <div className="bg-[#1c1c1e] rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/[0.08] text-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-white/70">Имя</span>
              <span className="font-medium text-white">iPhone О Сану</span>
            </div>

            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-white/70">Модель</span>
              <span className="font-medium text-white">iPhone 16 Pro (Dark Titanium)</span>
            </div>

            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-white/70">Версия ОС</span>
              <span className="font-mono text-xs text-white">iOS 18.2 (NY-2027 Exploit)</span>
            </div>

            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-white/70">Статус взлома</span>
              <span className="font-bold text-xs text-red-400 flex items-center gap-1 bg-red-950/40 px-2 py-0.5 rounded-full border border-red-500/30">
                <ShieldAlert className="w-3.5 h-3.5" />
                СИСТЕМА ПЕРЕХВАЧЕНА 🔪
              </span>
            </div>

            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-white/70">Хранилище</span>
              <span className="text-xs text-zinc-300 text-right">
                512 ГБ <span className="text-white/40 block text-[10px]">(2 ГБ — рецепты хунтуней и треки VIPERR)</span>
              </span>
            </div>

            {/* Secret Quest Clue Inset */}
            <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border-t border-amber-500/20">
              <div className="flex items-start gap-2.5">
                <KeyRound className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                    Подсказка шифра Сейфа
                  </div>
                  <div className="text-xs font-mono text-zinc-200 mt-0.5">
                    Шифр сейфа: <span className="font-bold text-amber-400">2027</span>
                  </div>
                  <div className="text-[11px] text-white/60 mt-0.5">
                    (ПодвалГрам: <span className="text-amber-300">20</span>, Заметки: <span className="text-amber-300">27</span>)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Group 4: Управление квестом */}
        <div className="space-y-1.5 pt-1">
          <div className="px-3 text-[11px] font-bold text-white/45 uppercase tracking-wider">
            Управление квестом
          </div>

          <div className="bg-[#1c1c1e] rounded-2xl border border-white/10 overflow-hidden p-3 space-y-2">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => {
                  vibrate(20);
                  playTapSound(450, 0.04);
                  setConfirmReset(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:scale-[0.98] border border-red-500/25 text-red-400 font-medium text-sm transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Сбросить прогресс квеста</span>
              </button>
            ) : (
              <div className="p-3 bg-red-950/30 rounded-xl border border-red-500/30 space-y-2.5">
                <div className="text-xs text-red-200 font-medium text-center">
                  Сбросить сохранённый прогресс сейфа и подсказок?
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      vibrate(15);
                      setConfirmReset(false);
                    }}
                    className="flex-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition-all"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 active:scale-95 text-xs font-bold text-white shadow-lg transition-all"
                  >
                    Да, сбросить
                  </button>
                </div>
              </div>
            )}

            {resetSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-1.5 py-1.5 text-xs text-emerald-400 font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Прогресс успешно сброшен! ✨</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center pt-2 pb-8 text-[11px] text-white/30 space-y-0.5">
          <div>Apple Inc. • Designed by Cupertino & Penthouse Seoul</div>
          <div>New Year 2027 Interactive Gift OS</div>
        </div>
      </div>
    </div>
  );
};
export default SettingsApp;
