import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  X,
  Globe,
  AlarmClock,
  Timer,
  Hourglass,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Bell,
  Check,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { vibrate, playTapSound, playUnlockSound } from '../../utils/haptics';

interface ClockAppProps {
  onBack: () => void;
}

type ClockTab = 'world' | 'alarm' | 'stopwatch' | 'timer';

export const ClockApp: React.FC<ClockAppProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<ClockTab>('world');

  // Real-time tick every second for world clocks & countdown
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute countdown to New Year 2027
  // Target: Jan 1, 2027 00:00:00
  const targetYear = 2027;
  const targetDate = new Date(targetYear, 0, 1, 0, 0, 0);
  const diffMs = Math.max(0, targetDate.getTime() - currentTime.getTime());
  const countdownDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const countdownHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const countdownMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const countdownSeconds = Math.floor((diffMs / 1000) % 60);

  // Time format helper with timezone offset
  const formatCityTime = (offsetHours: number) => {
    const d = new Date(currentTime.getTime() + offsetHours * 3600000);
    return {
      time: d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      hoursDiff: offsetHours >= 0 ? `+${offsetHours}` : `${offsetHours}`,
    };
  };

  // ================= ALARMS STATE =================
  const [alarms, setAlarms] = useState([
    {
      id: 'ny-alarm',
      time: '00:00',
      label: 'Новый Год 2027 ✨ (Бой курантов + Салют)',
      ringtone: 'VIPERR — Heavy Metal New Year',
      enabled: true,
      highlight: true,
    },
    {
      id: 'prep-alarm',
      time: '23:50',
      label: 'Открыть шампанское в пентхаусе Сану 🍷',
      ringtone: 'Звон хрусталя и салют',
      enabled: true,
      highlight: false,
    },
    {
      id: 'dumplings-alarm',
      time: '23:55',
      label: 'Снять хунтуни Чу Ваньнина с огня 🥟',
      ringtone: 'Тяньвэнь Перезвон',
      enabled: false,
      highlight: false,
    },
  ]);

  const toggleAlarm = (id: string) => {
    vibrate(20);
    playTapSound(500, 0.04);
    setAlarms((prev) =>
      prev.map((al) => (al.id === id ? { ...al, enabled: !al.enabled } : al))
    );
  };

  // ================= STOPWATCH STATE =================
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const stopwatchRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(0);

  useEffect(() => {
    if (stopwatchRunning) {
      lastTimestampRef.current = performance.now();
      const update = (now: number) => {
        const delta = now - lastTimestampRef.current;
        lastTimestampRef.current = now;
        setStopwatchTime((prev) => prev + delta);
        stopwatchRef.current = requestAnimationFrame(update);
      };
      stopwatchRef.current = requestAnimationFrame(update);
    } else if (stopwatchRef.current) {
      cancelAnimationFrame(stopwatchRef.current);
    }
    return () => {
      if (stopwatchRef.current) cancelAnimationFrame(stopwatchRef.current);
    };
  }, [stopwatchRunning]);

  const handleStartStopStopwatch = () => {
    vibrate(25);
    playTapSound(stopwatchRunning ? 380 : 620, 0.05);
    setStopwatchRunning((r) => !r);
  };

  const handleLapOrReset = () => {
    vibrate(20);
    playTapSound(480, 0.04);
    if (stopwatchRunning) {
      setLaps((prev) => [stopwatchTime, ...prev]);
    } else {
      setStopwatchTime(0);
      setLaps([]);
    }
  };

  const formatStopwatch = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
  };

  // Celebration Fireworks Trigger
  const triggerCelebration = () => {
    vibrate([40, 80, 140]);
    playUnlockSound();
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#ff9f0a', '#ff453a', '#00f5ff', '#ffffff', '#ffd60a'],
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#000000] text-white select-none z-30 overflow-hidden font-sans">
      {/* Top iOS Header with ChevronLeft and Frosted X Exit */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2.5 bg-black/80 backdrop-blur-xl border-b border-white/10 z-20">
        <button
          onClick={() => {
            vibrate(15);
            playTapSound(400, 0.04);
            onBack();
          }}
          className="flex items-center gap-1 text-[#ff9f0a] hover:text-[#ffb340] active:opacity-60 transition-all -ml-1 py-1 px-1.5 rounded-lg"
          aria-label="Назад"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.4]" />
          <span className="text-base font-normal">Назад</span>
        </button>

        <span className="text-base font-semibold text-white tracking-tight">Часы</span>

        <button
          onClick={() => {
            vibrate(20);
            playTapSound(420, 0.04);
            onBack();
          }}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center backdrop-blur-md border border-white/15 text-white/80 transition-all"
          aria-label="Закрыть часы"
        >
          <X className="w-4 h-4 stroke-[2.4]" />
        </button>
      </div>

      {/* Main Tab Content with Touch Isolation */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6 space-y-4 overscroll-contain touch-pan-y">
        <AnimatePresence mode="wait">
          {/* ================= TAB 1: WORLD CLOCK ================= */}
          {activeTab === 'world' && (
            <motion.div
              key="world-tab"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-4 pb-12"
            >
              {/* Header Title */}
              <div className="pt-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                  Мировые часы
                </h1>
                <p className="text-xs text-white/50 mt-0.5">
                  Фандомные часовые пояса и таймер 2027
                </p>
              </div>

              {/* Real-time New Year 2027 Countdown Banner */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#1c1c1e] via-[#241a10] to-[#140a05] rounded-2xl p-4 border border-[#ff9f0a]/30 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#ff9f0a] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#ff9f0a]" />
                    <span>До Нового Года 2027</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#ff9f0a]/20 text-[#ff9f0a] border border-[#ff9f0a]/30">
                    LIVE
                  </span>
                </div>

                {/* Big Digits Grid */}
                <div className="grid grid-cols-4 gap-2 text-center py-2">
                  <div className="bg-black/50 rounded-xl py-2 px-1 border border-white/5">
                    <div className="text-2xl font-mono font-extrabold text-white">
                      {countdownDays}
                    </div>
                    <div className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">
                      Дней
                    </div>
                  </div>
                  <div className="bg-black/50 rounded-xl py-2 px-1 border border-white/5">
                    <div className="text-2xl font-mono font-extrabold text-[#ffd60a]">
                      {String(countdownHours).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">
                      Часов
                    </div>
                  </div>
                  <div className="bg-black/50 rounded-xl py-2 px-1 border border-white/5">
                    <div className="text-2xl font-mono font-extrabold text-[#ffd60a]">
                      {String(countdownMinutes).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">
                      Минут
                    </div>
                  </div>
                  <div className="bg-black/50 rounded-xl py-2 px-1 border border-[#ff9f0a]/40 shadow-inner">
                    <div className="text-2xl font-mono font-extrabold text-[#ff9f0a] animate-pulse">
                      {String(countdownSeconds).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-[#ff9f0a]/80 uppercase tracking-wider mt-0.5 font-semibold">
                      Секунд
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
                  <span>Цель: 1 января 2027, 00:00:00</span>
                  <button
                    onClick={triggerCelebration}
                    className="text-[#ff9f0a] hover:text-[#ffb340] active:scale-95 font-semibold transition-all flex items-center gap-1"
                  >
                    <span>Салют 🎆</span>
                  </button>
                </div>
              </div>

              {/* Fandom World Clocks List */}
              <div className="space-y-2.5">
                {/* 1. Пентхаус Сану (Сеул) */}
                <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/10 shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-white/45">Сегодня, +6 ч. (Сеул)</div>
                      <div className="text-lg font-bold text-white">Пентхаус Сану</div>
                    </div>
                    <div className="text-3xl font-light font-mono text-white">
                      {formatCityTime(6).time}
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/[0.08] flex items-center gap-1.5 text-xs text-red-400 font-medium">
                    <span>🍷</span>
                    <span>До Нового Года считанные секунды! 🍷</span>
                  </div>
                </div>

                {/* 2. Пик Сишэн (Цзючжоу) */}
                <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/10 shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-white/45">Сегодня, +5 ч. (Цзючжоу)</div>
                      <div className="text-lg font-bold text-white">Пик Сишэн</div>
                    </div>
                    <div className="text-3xl font-light font-mono text-white">
                      {formatCityTime(5).time}
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/[0.08] flex items-center gap-1.5 text-xs text-cyan-300 font-medium">
                    <span>🥟</span>
                    <span>Чу Ваньнин варит хунтуни 🥟</span>
                  </div>
                </div>

                {/* 3. Студия VIPERR (Москва) */}
                <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/10 shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-white/45">Сегодня, +0 ч. (Москва)</div>
                      <div className="text-lg font-bold text-white">Студия VIPERR</div>
                    </div>
                    <div className="text-3xl font-light font-mono text-white">
                      {formatCityTime(0).time}
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/[0.08] flex items-center gap-1.5 text-xs text-amber-300 font-medium">
                    <span>🦇</span>
                    <span>Дроп Heavy Metal New Year 🦇</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= TAB 2: ALARMS ================= */}
          {activeTab === 'alarm' && (
            <motion.div
              key="alarm-tab"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-4 pb-12"
            >
              <div className="pt-1 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-white">
                    Будильник
                  </h1>
                  <p className="text-xs text-white/50 mt-0.5">
                    Специальные праздничные тайминги
                  </p>
                </div>
              </div>

              {/* Alarms List */}
              <div className="space-y-2.5">
                {alarms.map((al) => (
                  <div
                    key={al.id}
                    className={`rounded-2xl p-4 border transition-all ${
                      al.highlight
                        ? 'bg-gradient-to-r from-[#1c1c1e] to-[#251a0e] border-[#ff9f0a]/40 shadow-lg'
                        : 'bg-[#1c1c1e] border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div
                          className={`text-4xl font-light font-mono tracking-tight ${
                            al.enabled ? 'text-white' : 'text-white/40'
                          }`}
                        >
                          {al.time}
                        </div>
                        <div
                          className={`text-sm font-medium mt-1 ${
                            al.enabled ? 'text-zinc-200' : 'text-zinc-500'
                          }`}
                        >
                          {al.label}
                        </div>
                        <div className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
                          <Bell className="w-3 h-3 text-[#ff9f0a]" />
                          <span>Рингтон: {al.ringtone}</span>
                        </div>
                      </div>

                      {/* iOS Toggle Switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={al.enabled}
                        onClick={() => toggleAlarm(al.id)}
                        className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none shrink-0 ${
                          al.enabled ? 'bg-[#34c759]' : 'bg-[#39393d]'
                        }`}
                      >
                        <motion.div
                          className="w-6 h-6 rounded-full bg-white shadow-md"
                          animate={{ x: al.enabled ? 20 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ================= TAB 3: STOPWATCH ================= */}
          {activeTab === 'stopwatch' && (
            <motion.div
              key="stopwatch-tab"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-6 pb-12"
            >
              <div className="pt-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                  Секундомер
                </h1>
              </div>

              {/* Big Stopwatch Display */}
              <div className="py-8 flex items-center justify-center">
                <span className="text-6xl font-light font-mono tracking-tighter text-white select-all">
                  {formatStopwatch(stopwatchTime)}
                </span>
              </div>

              {/* iOS Round Action Buttons */}
              <div className="flex items-center justify-between px-6">
                {/* Lap / Reset button */}
                <button
                  onClick={handleLapOrReset}
                  disabled={stopwatchTime === 0 && !stopwatchRunning}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-sm font-medium transition-all active:scale-95 border-2 border-black ${
                    stopwatchTime > 0 || stopwatchRunning
                      ? 'bg-[#333333] text-white hover:bg-[#3d3d3d]'
                      : 'bg-[#1c1c1e] text-white/30 cursor-not-allowed'
                  }`}
                >
                  {stopwatchRunning ? 'Круг' : 'Сброс'}
                </button>

                {/* Start / Stop button */}
                <button
                  onClick={handleStartStopStopwatch}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-sm font-bold transition-all active:scale-95 border-2 ${
                    stopwatchRunning
                      ? 'bg-[#3a1a1a] text-[#ff453a] border-[#ff453a]/40 hover:bg-[#481c1c]'
                      : 'bg-[#1c3a27] text-[#34c759] border-[#34c759]/40 hover:bg-[#20452d]'
                  }`}
                >
                  {stopwatchRunning ? 'Стоп' : 'Старт'}
                </button>
              </div>

              {/* Laps List */}
              {laps.length > 0 && (
                <div className="bg-[#1c1c1e] rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/[0.08] max-h-48 overflow-y-auto">
                  {laps.map((lapTime, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-4 py-2.5 text-sm"
                    >
                      <span className="text-white/60">Круг {laps.length - idx}</span>
                      <span className="font-mono text-white font-medium">
                        {formatStopwatch(lapTime)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ================= TAB 4: TIMER 2027 ================= */}
          {activeTab === 'timer' && (
            <motion.div
              key="timer-tab"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-5 pb-12 text-center"
            >
              <div className="pt-1 text-left">
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                  Таймер 2027
                </h1>
                <p className="text-xs text-white/50 mt-0.5">
                  Синхронизация с курантами
                </p>
              </div>

              {/* Circular Aesthetic Progress Ring */}
              <div className="relative w-56 h-56 mx-auto flex items-center justify-center my-4">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="112"
                    cy="112"
                    r="98"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="112"
                    cy="112"
                    r="98"
                    stroke="#ff9f0a"
                    strokeWidth="8"
                    strokeDasharray="615.75"
                    strokeDashoffset={615.75 * (1 - (countdownSeconds / 60))}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>

                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-light font-mono text-white tracking-tight">
                    {String(countdownHours).padStart(2, '0')}:{String(countdownMinutes).padStart(2, '0')}:{String(countdownSeconds).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-[#ff9f0a] font-medium uppercase tracking-widest mt-1">
                    До 2027 года
                  </span>
                </div>
              </div>

              <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/10 text-left space-y-2">
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ff9f0a]" />
                  <span>Праздничный салют 2027</span>
                </div>
                <p className="text-xs text-white/60">
                  В полночь сработают праздничные конфетти и главный сюрприз в сейфе!
                </p>

                <button
                  onClick={triggerCelebration}
                  className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-[#ff9f0a] to-[#ff453a] active:scale-[0.98] text-black font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Запустить салют прямо сейчас!</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom iOS Clock Tab Bar */}
      <div className="flex items-center justify-around pt-2 px-3 pb-6 bg-black/90 backdrop-blur-2xl border-t border-white/10 z-20">
        {[
          { id: 'world' as const, label: 'Мировые часы', icon: Globe },
          { id: 'alarm' as const, label: 'Будильник', icon: AlarmClock },
          { id: 'stopwatch' as const, label: 'Секундомер', icon: Timer },
          { id: 'timer' as const, label: 'Таймер', icon: Hourglass },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                vibrate(10);
                playTapSound(isActive ? 420 : 500, 0.03);
                setActiveTab(tab.id);
              }}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
                isActive ? 'text-[#ff9f0a]' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <IconComp className="w-5 h-5 stroke-[2]" />
              <span className="text-[10px] font-medium tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default ClockApp;
