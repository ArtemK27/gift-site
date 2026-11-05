import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  Lock,
  Unlock,
  Sparkles,
  Gift,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  CreditCard,
  Flame,
} from 'lucide-react';
import { vibrate, playTapSound, playUnlockSound, playScratchSound } from '../../utils/haptics';

interface SafeAppProps {
  onBack: () => void;
}

export const SafeApp: React.FC<SafeAppProps> = ({ onBack }) => {
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isError, setIsError] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [isScratchedOff, setIsScratchedOff] = useState(false);
  const [selectedGift, setSelectedGift] = useState<'goldapple' | 'ozon' | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastCheckTimeRef = useRef(0);

  // Keypad click handler
  const handleKeyPress = (num: string) => {
    if (pin.length >= 4) return;
    vibrate(20);
    playTapSound(500 + pin.length * 70, 0.04);
    const newPin = pin + num;
    setPin(newPin);

    if (newPin.length === 4) {
      if (newPin === '2027') {
        setTimeout(() => {
          vibrate([50, 100, 150]);
          playUnlockSound();
          setIsUnlocked(true);
        }, 300);
      } else {
        setTimeout(() => {
          vibrate([80, 80, 80]);
          setIsError(true);
          setTimeout(() => {
            setPin('');
            setIsError(false);
          }, 800);
        }, 300);
      }
    }
  };

  const handleDelete = () => {
    vibrate(15);
    playTapSound(350, 0.04);
    setPin((prev) => prev.slice(0, -1));
  };

  // Canvas Scratch-Off Logic
  useEffect(() => {
    if (!isUnlocked || isScratchedOff) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 340);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 200);

    // Draw realistic frosty ice & snow cover
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#8ec5fc');
    grad.addColorStop(0.5, '#e0c3fc');
    grad.addColorStop(1, '#8ec5fc');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Add frosted crystal texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let i = 0; i < 400; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      const r = Math.random() * 2.5;
      ctx.beginPath();
      ctx.arc(rx, ry, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Overlay text & snowflakes on ice
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('❄️ ПОТРИТЕ ЭКРАН, ЧТОБЫ РАСТОПИТЬ ЛЁД ❄️', width / 2, height / 2 - 8);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = '11px monospace';
    ctx.fillText('VIP PASS 2027 СЮРПРИЗ', width / 2, height / 2 + 16);

    const scratchAt = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 32, 0, Math.PI * 2);
      ctx.fill();

      playScratchSound();
      vibrate(10);

      // Throttled progress calculation
      const now = Date.now();
      if (now - lastCheckTimeRef.current > 180) {
        lastCheckTimeRef.current = now;
        try {
          const imgData = ctx.getImageData(0, 0, width, height);
          const pixels = imgData.data;
          let transparentCount = 0;
          const totalSampled = pixels.length / 4;

          for (let i = 3; i < pixels.length; i += 16) {
            if (pixels[i] === 0) transparentCount += 4;
          }

          const percent = Math.min(100, Math.round((transparentCount / totalSampled) * 100));
          setScratchProgress(percent);

          if (percent >= 45) {
            setIsScratchedOff(true);
            vibrate([50, 100, 200]);
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#00f5ff', '#ffd15c', '#ff3366', '#ffffff'],
            });
          }
        } catch {
          // ignore
        }
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      isDrawingRef.current = true;
      scratchAt(e.clientX, e.clientY);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDrawingRef.current) return;
      scratchAt(e.clientX, e.clientY);
    };

    const onPointerUp = () => {
      isDrawingRef.current = false;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [isUnlocked, isScratchedOff]);

  const handleSelectGift = (type: 'goldapple' | 'ozon') => {
    vibrate([40, 60, 120]);
    playUnlockSound();
    setSelectedGift(type);

    confetti({
      particleCount: 160,
      spread: 100,
      origin: { y: 0.5 },
      colors: type === 'goldapple' ? ['#22c55e', '#ffd700', '#ffffff'] : ['#005bff', '#f43f5e', '#ffffff'],
    });
  };

  const copyCode = (code: string) => {
    vibrate(25);
    playTapSound(800, 0.05);
    navigator.clipboard?.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#07070B] text-white select-none z-30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-white/10 bg-black/60 backdrop-blur-xl z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              vibrate(15);
              onBack();
            }}
            aria-label="Назад из Сейфа"
            className="p-1.5 -ml-1 rounded-full hover:bg-white/10 active:scale-95 transition-all text-zinc-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-base font-bold tracking-tight">VIP Сейф 2027</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-mono">
          {isUnlocked ? (
            <>
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">ОТКРЫТО</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>ЗАКРЫТО</span>
            </>
          )}
        </div>
      </div>

      {/* Screen Content: Keypad OR Safe Inside */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-between overscroll-contain">
        {!isUnlocked ? (
          // ================= LOCKED: NUMERIC PIN KEYPAD =================
          <div className="w-full max-w-[340px] flex flex-col items-center my-auto">
            <motion.div
              animate={isError ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center mb-6"
            >
              <div className="w-16 h-16 rounded-3xl bg-white/[0.05] border border-white/15 flex items-center justify-center text-amber-400 mb-3 shadow-[0_0_25px_rgba(251,191,36,0.25)]">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                Введите 4-значный ПИН-код
              </h2>
              <p className="text-xs text-zinc-400 text-center mt-1">
                Шифр спрятан в ПодвалГраме (первые две) и Заметках (вторые две)
              </p>

              {/* 4 PIN Dots */}
              <div className="flex items-center gap-4 mt-5">
                {[0, 1, 2, 3].map((idx) => {
                  const filled = pin.length > idx;
                  return (
                    <motion.div
                      key={idx}
                      animate={filled ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                      className={`w-4 h-4 rounded-full border-2 transition-all ${
                        isError
                          ? 'border-red-500 bg-red-500 shadow-[0_0_12px_#ef4444]'
                          : filled
                          ? 'border-amber-400 bg-amber-400 shadow-[0_0_10px_#f59e0b]'
                          : 'border-white/30 bg-transparent'
                      }`}
                    />
                  );
                })}
              </div>
            </motion.div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-3.5 w-full">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(
                (btn) => {
                  const isAction = btn === 'C' || btn === '⌫';
                  return (
                    <motion.button
                      key={btn}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => {
                        if (btn === 'C') {
                          vibrate(15);
                          setPin('');
                        } else if (btn === '⌫') {
                          handleDelete();
                        } else {
                          handleKeyPress(btn);
                        }
                      }}
                      className={`h-14 rounded-2xl font-mono text-xl font-bold flex items-center justify-center border transition-all ${
                        isAction
                          ? 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                          : 'bg-white/[0.08] hover:bg-white/[0.14] border-white/15 text-white shadow-md active:bg-amber-400 active:text-black'
                      }`}
                    >
                      {btn}
                    </motion.button>
                  );
                }
              )}
            </div>
          </div>
        ) : (
          // ================= UNLOCKED: SCRATCH-OFF CARD & GIFTS =================
          <div className="w-full max-w-[370px] flex flex-col items-center space-y-4 py-2">
            {/* VIP PASS Card with Scratch Layer */}
            <div className="w-full relative aspect-[16/9] rounded-3xl overflow-hidden bg-gradient-to-tr from-amber-600 via-rose-600 to-purple-800 p-0.5 border border-white/30 shadow-[0_20px_50px_rgba(244,63,94,0.35)]">
              {/* Inner Metallic Card Content */}
              <div className="w-full h-full rounded-[22px] bg-[#0c0d14] p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

                {/* Card Header */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-300" />
                    <span className="text-xs font-black font-mono tracking-wider text-amber-300">
                      VIP PASS 2027
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    АКТИВИРОВАНО
                  </span>
                </div>

                {/* Card Center Secret Amount */}
                <div className="my-auto text-center z-10">
                  <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">
                    ПРАЗДНИЧНЫЙ БАЛАНС
                  </div>
                  <div className="text-2xl font-black tracking-tight text-white [text-shadow:_0_0_20px_rgba(255,209,92,0.6)]">
                    100 000 ✨ СЧАСТЬЯ
                  </div>
                  <div className="text-[11px] text-amber-200/90 font-medium mt-0.5">
                    + Главный Новогодний Подарок На Выбор
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 z-10">
                  <span>ВЛАДЕЛЕЦ: ЛУЧШАЯ ПОДРУГА</span>
                  <span>VALID: FOREVER</span>
                </div>

                {/* HTML5 Canvas Scratch Layer */}
                {!isScratchedOff && (
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full z-20 cursor-crosshair touch-none"
                  />
                )}
              </div>
            </div>

            {/* Scratch progress indicator */}
            {!isScratchedOff ? (
              <div className="w-full flex items-center justify-between px-2 text-xs text-zinc-400 font-mono">
                <span>Растоплено льда: {scratchProgress}%</span>
                <span className="text-cyan-300 animate-pulse">
                  Потрите палец по карточке 👆
                </span>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full flex items-center justify-center gap-2 py-1 text-xs text-amber-300 font-bold font-mono"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                ЛЁД РАСТОПЛЕН! ВЫБЕРИ СВОЙ ПОДАРОК:
              </motion.div>
            )}

            {/* Comic Transfers from Characters */}
            <div className="w-full p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block mb-1">
                Праздничные переводы от Комитета:
              </span>

              <div className="text-xs space-y-1.5 text-zinc-300">
                <div className="flex items-center justify-between">
                  <span>🔪 Сану:</span>
                  <span className="font-mono text-emerald-400 font-bold">+5 000 ₽ («На кроссовки»)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>🥟 Чу Ваньнин:</span>
                  <span className="font-mono text-cyan-300 font-bold">+10 000 хунтуней</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>✨ Мо Жань:</span>
                  <span className="font-mono text-amber-300 font-bold">+1 000 000 улыбок</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>🦇 VIPERR:</span>
                  <span className="font-mono text-purple-300 font-bold">+Бесконечный саунд</span>
                </div>
              </div>
            </div>

            {/* 2 Big Gift Choice Buttons */}
            {isScratchedOff && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full space-y-3 pt-1"
              >
                <span className="text-xs font-bold text-white text-center block">
                  Какой сертификат забрать прямо сейчас?
                </span>

                <div className="grid grid-cols-2 gap-3">
                  {/* Button 1: Golden Apple */}
                  <button
                    disabled={selectedGift !== null}
                    onClick={() => handleSelectGift('goldapple')}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-95 ${
                      selectedGift === 'goldapple'
                        ? 'bg-emerald-600/30 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                        : selectedGift === 'ozon'
                        ? 'opacity-30 pointer-events-none bg-zinc-900 border-white/5'
                        : 'bg-gradient-to-br from-emerald-950/40 to-black/80 hover:bg-emerald-900/30 border-emerald-500/30 shadow-md'
                    }`}
                  >
                    <div className="text-2xl mb-2">🍏</div>
                    <div>
                      <div className="text-xs font-bold text-white leading-tight">
                        Золотое Яблоко
                      </div>
                      <div className="text-[10px] text-emerald-300 font-mono mt-0.5">
                        Сертификат на красоту
                      </div>
                    </div>
                  </button>

                  {/* Button 2: Ozon */}
                  <button
                    disabled={selectedGift !== null}
                    onClick={() => handleSelectGift('ozon')}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-95 ${
                      selectedGift === 'ozon'
                        ? 'bg-blue-600/30 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                        : selectedGift === 'goldapple'
                        ? 'opacity-30 pointer-events-none bg-zinc-900 border-white/5'
                        : 'bg-gradient-to-br from-blue-950/40 to-black/80 hover:bg-blue-900/30 border-blue-500/30 shadow-md'
                    }`}
                  >
                    <div className="text-2xl mb-2">📦</div>
                    <div>
                      <div className="text-xs font-bold text-white leading-tight">
                        Сертификат Ozon
                      </div>
                      <div className="text-[10px] text-blue-300 font-mono mt-0.5">
                        На любые желания
                      </div>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* FINAL CELEBRATION MODAL */}
      <AnimatePresence>
        {selectedGift && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="w-full max-w-[340px] p-6 rounded-3xl bg-white/[0.06] border border-white/20 backdrop-blur-xl shadow-[0_0_60px_rgba(255,209,92,0.3)] flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-white mb-4 shadow-neon-gold">
                <Gift className="w-8 h-8 animate-bounce" />
              </div>

              <h2 className="text-xl font-black tracking-tight text-white mb-1">
                Подарок твой! 🎄✨
              </h2>
              <p className="text-xs text-amber-200/90 font-medium mb-4">
                {selectedGift === 'goldapple'
                  ? 'Выбран сертификат «Золотое Яблоко» 🍏'
                  : 'Выбран сертификат «Ozon» 📦'}
              </p>

              <div className="text-xs text-zinc-300 leading-relaxed space-y-2 mb-5 bg-black/50 p-3.5 rounded-2xl border border-white/10 text-left">
                <p>
                  Дорогая подруга! С наступающим 2027 годом! Пусть этот год будет полон энергии, стиля и счастливых дней.
                </p>
                <p className="text-amber-300 font-semibold">
                  Твой персональный новогодний промокод готов:
                </p>

                {/* Promo code badge */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/10 border border-amber-400/30">
                  <span className="font-mono font-bold text-amber-300 text-xs">
                    {selectedGift === 'goldapple'
                      ? 'GOLDEN-APPLE-NY2027'
                      : 'OZON-MAGIC-NY2027'}
                  </span>
                  <button
                    onClick={() =>
                      copyCode(
                        selectedGift === 'goldapple'
                          ? 'GOLDEN-APPLE-NY2027'
                          : 'OZON-MAGIC-NY2027'
                      )
                    }
                    className="p-1 rounded-md hover:bg-white/10 text-zinc-300 hover:text-white"
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  vibrate(20);
                  setSelectedGift(null);
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-bold text-xs shadow-lg active:scale-95 transition-all"
              >
                Вернуться в смартфон ✨
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
