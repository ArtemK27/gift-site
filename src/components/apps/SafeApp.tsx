import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  Lock,
  Unlock,
  Gift,
  Copy,
  Check,
  Snowflake,
  RotateCcw,
  X,
} from 'lucide-react';
import { vibrate, playTapSound, playUnlockSound, playScratchSound } from '../../utils/haptics';
import { useSettings } from '../../context/SettingsContext';
import { SafeBreachStage } from './SafeBreachStage';

interface SafeAppProps {
  onBack: () => void;
}

interface IceSpark {
  id: number;
  x: number;
  y: number;
  color: string;
}

const SAFE_STORAGE_KEY = 'ios18_safe_state_v1';

export const SafeApp: React.FC<SafeAppProps> = ({ onBack }) => {
  const { cipherCode } = useSettings();

  const loadStoredSafe = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(SAFE_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            isUnlocked: Boolean(parsed.isUnlocked),
            isBreachCompleted: Boolean(parsed.isBreachCompleted),
            isScratchedOff: Boolean(parsed.isScratchedOff),
            selectedGift: parsed.selectedGift || null,
          };
        }
      } catch {}
    }
    return {
      isUnlocked: false,
      isBreachCompleted: false,
      isScratchedOff: false,
      selectedGift: null,
    };
  };

  const initialSafe = loadStoredSafe();
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(initialSafe.isUnlocked);
  const [isBreachCompleted, setIsBreachCompleted] = useState<boolean>(
    initialSafe.isBreachCompleted
  );
  const [isError, setIsError] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(initialSafe.isScratchedOff ? 100 : 0);
  const [isScratchedOff, setIsScratchedOff] = useState<boolean>(initialSafe.isScratchedOff);
  const [selectedGift, setSelectedGift] = useState<'goldapple' | 'ozon' | null>(
    initialSafe.selectedGift
  );
  const [isCopied, setIsCopied] = useState(false);
  const [sparks, setSparks] = useState<IceSpark[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const lastCheckTimeRef = useRef(0);
  const sparkIdRef = useRef(0);

  // Persist safe state across reloads until reset in Settings
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SAFE_STORAGE_KEY,
        JSON.stringify({ isUnlocked, isBreachCompleted, isScratchedOff, selectedGift })
      );
    } catch {}
  }, [isUnlocked, isBreachCompleted, isScratchedOff, selectedGift]);

  useEffect(() => {
    const onReset = () => {
      setPin('');
      setIsUnlocked(false);
      setIsBreachCompleted(false);
      setIsScratchedOff(false);
      setScratchProgress(0);
      setSelectedGift(null);
      try {
        window.localStorage.removeItem(SAFE_STORAGE_KEY);
      } catch {}
    };
    window.addEventListener('ios18_quest_reset', onReset);
    return () => window.removeEventListener('ios18_quest_reset', onReset);
  }, []);

  // Keypad click handler (functional update prevents dropped digits on rapid presses)
  const handleKeyPress = (num: string) => {
    setPin((prevPin) => {
      if (prevPin.length >= 4) return prevPin;
      vibrate(20);
      playTapSound(500 + prevPin.length * 70, 0.04);
      const newPin = prevPin + num;

      if (newPin.length === 4) {
        if (newPin === '2427' || newPin === '2027') {
          setTimeout(() => {
            vibrate([50, 100, 150]);
            playUnlockSound();
            setIsUnlocked(true);
            setIsBreachCompleted(false);
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
      return newPin;
    });
  };

  const handleDelete = () => {
    vibrate(15);
    playTapSound(350, 0.04);
    setPin((prev) => prev.slice(0, -1));
  };

  const triggerCardRevealConfetti = useCallback(() => {
    vibrate([50, 100, 200]);
    playUnlockSound();
    confetti({
      particleCount: 100,
      spread: 85,
      origin: { y: 0.48 },
      colors: ['#bae6fd', '#38bdf8', '#ffffff', '#c084fc', '#fde68a'],
    });
  }, []);

  // Realistic Monochrome Silver-White Frosted Window / Crystalline Rime Layer (Requires >= 80% scratch)
  useEffect(() => {
    if (!isUnlocked || isScratchedOff) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cssWidth = canvas.parentElement?.clientWidth || 350;
    const cssHeight = canvas.parentElement?.clientHeight || 195;

    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    ctx.scale(dpr, dpr);

    // 1. Multi-stop Frosted Silver-Slate Ice Base (No garish neon/blue)
    const baseGrad = ctx.createLinearGradient(0, 0, cssWidth, cssHeight);
    baseGrad.addColorStop(0, '#cbd5e1');
    baseGrad.addColorStop(0.28, '#f1f5f9');
    baseGrad.addColorStop(0.52, '#94a3b8');
    baseGrad.addColorStop(0.78, '#e2e8f0');
    baseGrad.addColorStop(1, '#64748b');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    // 2. Heavy Frosted Edge Rime Vignette (thicker white hoarfrost around borders)
    const radialFrost = ctx.createRadialGradient(
      cssWidth / 2,
      cssHeight / 2,
      cssHeight * 0.18,
      cssWidth / 2,
      cssHeight / 2,
      cssWidth * 0.72
    );
    radialFrost.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    radialFrost.addColorStop(0.62, 'rgba(226, 232, 240, 0.42)');
    radialFrost.addColorStop(1, 'rgba(255, 255, 255, 0.88)');
    ctx.fillStyle = radialFrost;
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    // 3. Crystalline Ice Facets (polygonal frost patches)
    for (let i = 0; i < 38; i++) {
      const cx = (i * 47) % cssWidth;
      const cy = (i * 31) % cssHeight;
      const radius = 16 + (i % 5) * 9;
      ctx.fillStyle =
        i % 2 === 0 ? 'rgba(255, 255, 255, 0.18)' : 'rgba(71, 85, 105, 0.14)';
      ctx.beginPath();
      for (let side = 0; side < 6; side++) {
        const angle = (Math.PI / 3) * side + (i % 3) * 0.2;
        const px = cx + Math.cos(angle) * radius;
        const py = cy + Math.sin(angle) * radius;
        if (side === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }

    // 4. Dendritic Frost Needles & Ice Veins (60-degree crystalline branches)
    const drawFrostBranch = (x: number, y: number, len: number, angle: number, depth: number) => {
      if (depth <= 0 || len < 4) return;
      const x2 = x + Math.cos(angle) * len;
      const y2 = y + Math.sin(angle) * len;

      ctx.strokeStyle =
        depth === 3 ? 'rgba(255, 255, 255, 0.75)' : 'rgba(241, 245, 249, 0.5)';
      ctx.lineWidth = depth * 0.55;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      const midX = (x + x2) / 2;
      const midY = (y + y2) / 2;
      drawFrostBranch(midX, midY, len * 0.52, angle + Math.PI / 3, depth - 1);
      drawFrostBranch(midX, midY, len * 0.52, angle - Math.PI / 3, depth - 1);
    };

    const crystalSeeds = [
      { x: 18, y: 20, a: 0.6 },
      { x: cssWidth - 20, y: 24, a: 2.4 },
      { x: 24, y: cssHeight - 18, a: -0.6 },
      { x: cssWidth - 24, y: cssHeight - 20, a: -2.4 },
      { x: cssWidth * 0.28, y: 12, a: 1.2 },
      { x: cssWidth * 0.72, y: cssHeight - 12, a: -1.3 },
      { x: cssWidth * 0.18, y: cssHeight * 0.5, a: 0.2 },
      { x: cssWidth * 0.82, y: cssHeight * 0.48, a: 2.9 },
    ];
    for (const seed of crystalSeeds) {
      drawFrostBranch(seed.x, seed.y, 44, seed.a, 3);
    }

    // 5. Diagonal Specular Glass Glint
    const sheenGrad = ctx.createLinearGradient(0, cssHeight, cssWidth, 0);
    sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    sheenGrad.addColorStop(0.38, 'rgba(255, 255, 255, 0.25)');
    sheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.52)');
    sheenGrad.addColorStop(0.62, 'rgba(255, 255, 255, 0.2)');
    sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sheenGrad;
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    // 6. Micro-Snow Rime Grain
    for (let i = 0; i < 550; i++) {
      const rx = Math.random() * cssWidth;
      const ry = Math.random() * cssHeight;
      const r = Math.random() * 1.5 + 0.3;
      ctx.fillStyle =
        i % 3 === 0
          ? 'rgba(255, 255, 255, 0.85)'
          : i % 3 === 1
          ? 'rgba(100, 116, 139, 0.28)'
          : 'rgba(241, 245, 249, 0.7)';
      ctx.beginPath();
      ctx.arc(rx, ry, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Extra central frost crystal veins (no nested text container box on the ice!)
    drawFrostBranch(cssWidth * 0.45, cssHeight * 0.42, 36, 0.4, 3);
    drawFrostBranch(cssWidth * 0.55, cssHeight * 0.58, 36, -2.5, 3);

    const scratchAt = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 48;

      ctx.beginPath();
      if (lastPointRef.current) {
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      ctx.arc(x, y, 24, 0, Math.PI * 2);
      ctx.fill();

      // Add crystalline jagged edge chips along the scraped ice path
      for (let k = 0; k < 5; k++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 18 + Math.random() * 12;
        const chipR = 3 + Math.random() * 5;
        ctx.beginPath();
        ctx.arc(
          x + Math.cos(angle) * dist,
          y + Math.sin(angle) * dist,
          chipR,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.restore();

      lastPointRef.current = { x, y };

      playScratchSound();
      vibrate(8);

      // Spawn flying ice crystals along the scratch path
      const nextId = ++sparkIdRef.current;
      if (nextId % 2 === 0) {
        const sparkColors = ['#ffffff', '#f1f5f9', '#cbd5e1', '#e2e8f0'];
        setSparks((prev) => [
          ...prev.slice(-10),
          {
            id: nextId,
            x,
            y,
            color: sparkColors[nextId % sparkColors.length],
          },
        ]);
      }

      // Throttled progress calculation — requires >= 80% erased before auto-completing
      const now = Date.now();
      if (now - lastCheckTimeRef.current > 110) {
        lastCheckTimeRef.current = now;
        measureScratchProgress();
      }
    };

    const measureScratchProgress = () => {
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imgData.data;
        let transparentCount = 0;
        const totalSampled = pixels.length / 64;

        for (let i = 3; i < pixels.length; i += 64) {
          if (pixels[i] < 32) transparentCount++;
        }

        const percent = Math.min(100, Math.round((transparentCount / totalSampled) * 100));
        setScratchProgress(percent);

        if (percent >= 80) {
          setIsScratchedOff(true);
          setScratchProgress(100);
          setSparks([]);
          triggerCardRevealConfetti();
        }
      } catch {
        // ignore
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      isDrawingRef.current = true;
      const rect = canvas.getBoundingClientRect();
      lastPointRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      scratchAt(e.clientX, e.clientY);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDrawingRef.current) return;
      scratchAt(e.clientX, e.clientY);
    };

    const onPointerUp = () => {
      if (isDrawingRef.current) {
        measureScratchProgress();
      }
      isDrawingRef.current = false;
      lastPointRef.current = null;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [isUnlocked, isScratchedOff, triggerCardRevealConfetti]);

  const handleSelectGift = (type: 'goldapple' | 'ozon') => {
    vibrate([40, 60, 120]);
    playUnlockSound();
    setSelectedGift(type);

    confetti({
      particleCount: 140,
      spread: 95,
      origin: { y: 0.5 },
      colors:
        type === 'goldapple'
          ? ['#d4c37b', '#f8fafc', '#9ca3af']
          : ['#cbd5e1', '#94a3b8', '#ffffff'],
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
    <div className="relative w-full h-full flex flex-col bg-[#08090c] text-white select-none z-30 overflow-hidden">
      {/* Ambient Winter Snow & Warm Gold Dust Particles in Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            'radial-gradient(circle at 14% 18%, rgba(255,255,255,0.45) 1px, transparent 1.5px), radial-gradient(circle at 84% 12%, rgba(251,191,36,0.35) 1px, transparent 2px), radial-gradient(circle at 72% 44%, rgba(255,255,255,0.3) 1px, transparent 1.5px), radial-gradient(circle at 22% 68%, rgba(251,191,36,0.28) 1.5px, transparent 2px), radial-gradient(circle at 88% 82%, rgba(255,255,255,0.35) 1px, transparent 1.5px)',
          backgroundSize: '170px 170px',
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-white/10 bg-[#0b0c10]/90 backdrop-blur-xl z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              vibrate(15);
              onBack();
            }}
            aria-label="Назад из Сейфа"
            className="p-1.5 -ml-1 rounded-full hover:bg-white/10 active:scale-95 transition-all text-zinc-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-base font-bold tracking-tight text-zinc-100">VIP Сейф 2027</span>
        </div>

        <div className="flex items-center gap-1.5">
          {isUnlocked && isBreachCompleted && (
            <button
              type="button"
              data-testid="replay-breach-btn"
              onClick={() => {
                vibrate(20);
                playTapSound(480, 0.04);
                setIsBreachCompleted(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 border border-white/20 text-[10px] font-mono font-bold transition-all cursor-pointer"
              title="Закрыть створки шлюза"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Шлюз</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] text-zinc-200 border border-white/20 text-[11px] font-mono tracking-wider">
            {isUnlocked ? (
              <>
                <Unlock className="w-3 h-3 text-zinc-300" />
                <span>{isBreachCompleted ? 'ОТКРЫТО' : 'ШЛЮЗ'}</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3 text-amber-400" />
                <span>ЗАКРЫТО</span>
              </>
            )}
          </div>
          <button
            onClick={() => {
              vibrate(15);
              playTapSound(400, 0.04);
              onBack();
            }}
            aria-label="Закрыть сейф"
            className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/15 active:scale-90 flex items-center justify-center text-zinc-300 transition-all ml-0.5"
            title="Закрыть приложение"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Screen Content: Keypad OR Full-Screen Titanium Blast Doors parting over Frosted Voucher */}
      <div
        className={`relative flex-1 overflow-y-auto px-4 pb-8 flex flex-col items-center overscroll-contain touch-pan-y ${
          !isUnlocked ? 'justify-center py-5' : 'justify-start pt-3.5'
        }`}
      >
        {!isUnlocked ? (
          // ================= LOCKED: NUMERIC PIN KEYPAD =================
          <div className="w-full max-w-[340px] flex flex-col items-center my-auto">
            <motion.div
              animate={isError ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center mb-6"
            >
              <div className="w-16 h-16 rounded-3xl bg-white/[0.05] border border-white/15 flex items-center justify-center text-amber-400 mb-3 shadow-[0_0_25px_rgba(251,191,36,0.2)]">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                Введите 4-значный ПИН-код
              </h2>
              <p className="text-xs text-zinc-400 text-center mt-1">
                Собранный шифр: <span className="font-mono font-bold text-amber-300">{cipherCode}</span>
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
          // ================= UNLOCKED: FULL-SCREEN TITANIUM VAULT DOORS OVER FROSTED VOUCHER =================
          <>
            {!isBreachCompleted && (
              <SafeBreachStage
                onBreachComplete={() => setIsBreachCompleted(true)}
              />
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="w-full max-w-[362px] flex flex-col items-center justify-start gap-3.5"
            >
              {/* 1. SINGLE FROSTED MATTE-GRAPHITE VOUCHER CARD (SHIFTED TO TOP) */}
              <motion.div
                data-testid="vip-scratch-card"
                animate={isScratchedOff ? { scale: [1, 1.015, 1] } : undefined}
                transition={{ duration: 0.4 }}
                className="w-full relative aspect-[1.82/1] rounded-[18px] p-[1px] bg-white/25 shadow-[0_18px_45px_rgba(0,0,0,0.85)] overflow-hidden"
              >
              {/* Matte Dark Graphite Voucher Card Underneath */}
              <div
                className="w-full h-full rounded-[17px] bg-[#1a1c22] p-4 flex flex-col justify-between relative overflow-hidden"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 50% 45%, rgba(45,49,60,0.55) 0%, rgba(19,21,26,0.95) 100%)',
                }}
              >
                {/* Frosted White Rime Edge Vignette Around Voucher Frame */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-[17px]"
                  style={{
                    boxShadow:
                      'inset 0 0 18px rgba(226,232,240,0.22), inset 0 1px 0 rgba(255,255,255,0.28)',
                  }}
                />

                {/* Subtle Etched Snowflakes on Card Surface */}
                <Snowflake className="pointer-events-none absolute top-3.5 left-[54%] w-3.5 h-3.5 text-zinc-400/45" />
                <Snowflake className="pointer-events-none absolute bottom-10 right-4 w-3.5 h-3.5 text-zinc-400/40" />
                <Snowflake className="pointer-events-none absolute bottom-9 left-4 w-2.5 h-2.5 text-zinc-400/35" />

                {/* Top Row: VOUCHER Number + Barcode (Clean, no nested container pill) */}
                <div className="relative z-10 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono tracking-wider text-zinc-300">
                    VOUCHER № <strong className="ml-1 text-white">2027-NY</strong>
                  </span>

                  {/* Crisp Monochrome Vertical Barcode */}
                  <svg
                    viewBox="0 0 88 22"
                    fill="none"
                    className="w-20 h-5 shrink-0 opacity-85"
                    aria-hidden="true"
                  >
                    {[
                      [2, 2], [6, 1], [9, 3], [14, 1], [17, 2], [21, 1], [24, 3],
                      [29, 1], [32, 2], [36, 1], [39, 2], [43, 3], [48, 1], [51, 2],
                      [55, 1], [58, 3], [63, 1], [66, 2], [70, 1], [73, 3], [78, 2],
                      [82, 1], [85, 2],
                    ].map(([x, w], idx) => (
                      <rect
                        key={idx}
                        x={x}
                        y="1"
                        width={w}
                        height="20"
                        fill="#e2e8f0"
                        fillOpacity={idx % 3 === 0 ? '0.95' : '0.7'}
                      />
                    ))}
                  </svg>
                </div>

                {/* Center Row: Monochrome Ribbon Bow Illustration + Condensed Headline */}
                <div className="relative z-10 flex items-center gap-3.5 my-auto py-1">
                  {/* Engraved Silver Ribbon Bow SVG */}
                  <svg
                    viewBox="0 0 48 44"
                    fill="none"
                    className="w-11 h-10 shrink-0 text-zinc-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
                    aria-hidden="true"
                  >
                    {/* Left & Right Bow Loops */}
                    <path
                      d="M21 20C14 11 5 12 5 20C5 27 14 27 21 22Z"
                      fill="rgba(255,255,255,0.07)"
                      stroke="#e4e4e7"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M27 20C34 11 43 12 43 20C43 27 34 27 27 22Z"
                      fill="rgba(255,255,255,0.07)"
                      stroke="#e4e4e7"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    {/* Inner Loop Creases */}
                    <path d="M11 19C14 19 17 20 20 21" stroke="#a1a1aa" strokeWidth="1.1" strokeLinecap="round" />
                    <path d="M37 19C34 19 31 20 28 21" stroke="#a1a1aa" strokeWidth="1.1" strokeLinecap="round" />
                    {/* Hanging Ribbon Tails */}
                    <path
                      d="M21 23L13 38L18.5 36L21.5 40L23.5 24"
                      fill="rgba(255,255,255,0.05)"
                      stroke="#e4e4e7"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M27 23L35 38L29.5 36L26.5 40L24.5 24"
                      fill="rgba(255,255,255,0.05)"
                      stroke="#e4e4e7"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    {/* Center Knot */}
                    <rect
                      x="20.5"
                      y="17.5"
                      width="7"
                      height="7"
                      rx="2"
                      fill="#27272a"
                      stroke="#f4f4f5"
                      strokeWidth="1.6"
                    />
                  </svg>

                  <div className="min-w-0">
                    <div className="text-[19px] font-black uppercase tracking-tight text-white leading-none">
                      СЕКРЕТНЫЙ ПОДАРОК!
                    </div>
                    <div className="text-xs text-zinc-300 mt-1 font-medium">
                      Выбери любой сертификат ниже
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Hairline Divider + Footer Metadata */}
                <div className="relative z-10 flex items-center justify-between text-[11px] text-zinc-300 border-t border-white/12 pt-2">
                  <span>Новогодний сюрприз</span>
                  <span className="text-zinc-500 text-[10px]">❄</span>
                  <span className="font-mono text-zinc-100 font-semibold">#NY-2027</span>
                </div>

                {/* Interactive Realistic Frost / Ice Canvas (Requires >= 80% Scratch) */}
                <AnimatePresence>
                  {!isScratchedOff && (
                    <motion.canvas
                      ref={canvasRef}
                      exit={{ opacity: 0, scale: 1.03, filter: 'blur(6px)' }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="absolute inset-0 w-full h-full z-20 cursor-crosshair touch-none"
                    />
                  )}
                </AnimatePresence>

                {/* Live Flying Ice Crystals while scratching */}
                <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
                  {sparks.map((sp) => (
                    <motion.span
                      key={sp.id}
                      initial={{ opacity: 1, scale: 1, x: sp.x, y: sp.y }}
                      animate={{
                        opacity: 0,
                        scale: 0,
                        x: sp.x + ((sp.id % 2 === 0 ? 1 : -1) * 18),
                        y: sp.y + 14,
                      }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      style={{ backgroundColor: sp.color }}
                      className="absolute w-2 h-2 rounded-full shadow-[0_0_8px_#e2e8f0]"
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* 2. COLLECTOR GIFT CARDS: APPEAR ONLY AFTER >= 80% OF THE ICE IS SCRATCHED OFF */}
            <AnimatePresence>
              {isScratchedOff && (
                <motion.div
                  key="gift-choices"
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 26 }}
                  data-testid="gift-selection-grid"
                  className="w-full grid grid-cols-2 gap-3"
                >
                  {/* Option 1: ЗОЛОТОЕ ЯБЛОКО (Dark Obsidian-Olive & Monochrome Engraved Apple) */}
                  <motion.button
                    type="button"
                    data-testid="gift-card-goldapple"
                    whileHover={{ scale: 1.015, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={selectedGift !== null}
                    onClick={() => handleSelectGift('goldapple')}
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 88% 12%, rgba(163,146,92,0.22) 0%, rgba(22,28,22,0.92) 48%, rgba(12,15,13,0.98) 100%)',
                    }}
                    className={`group relative overflow-hidden p-3.5 rounded-[20px] border text-left flex flex-col justify-between min-h-[236px] transition-all ${
                      selectedGift === 'goldapple'
                        ? 'border-[#d4c37b] shadow-[0_0_25px_rgba(212,195,123,0.3)]'
                        : 'border-[#635a38]/70 hover:border-[#b5a467] shadow-[0_14px_32px_rgba(0,0,0,0.75)]'
                    }`}
                  >
                    {/* Top Row: Circle Icon + VIP GIFT */}
                    <div className="flex items-center justify-between w-full">
                      <span className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center shadow-inner">
                        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                          <path
                            d="M10.2 5.2C10.9 3.8 12.2 3 13.5 3C13.6 4.4 12.7 5.6 11.4 6.1C10.7 6.3 10.2 5.9 10.2 5.2Z"
                            fill="#d4d4d8"
                          />
                          <path
                            d="M10 6.5C8.2 6.5 6.4 5.5 5 6.8C3.5 8.2 3.4 11.4 4.8 14.1C5.6 15.6 6.7 17 8.1 17C9.1 17 9.5 16.4 10.5 16.4C11.5 16.4 11.8 17 12.9 17C14.3 17 15.3 15.5 16.1 14C16.7 12.8 17 11.5 17 10.2C17 7.6 15 6 13.1 6C11.8 6 10.9 6.5 10 6.5Z"
                            fill="#e4e4e7"
                          />
                        </svg>
                      </span>
                      <span className="text-[9px] font-mono uppercase tracking-[0.16em] text-[#c2b278]">
                        VIP GIFT
                      </span>
                    </div>

                    {/* Title Block */}
                    <div className="mt-2.5">
                      <div className="text-[13px] font-extrabold uppercase tracking-tight text-white leading-tight">
                        ЗОЛОТОЕ ЯБЛОКО
                      </div>
                      <div className="text-[11px] text-[#a89b6e] mt-0.5">
                        Сертификат
                      </div>
                    </div>

                    {/* Center Engraved Monochrome Apple Artwork + Vertical Side Labels */}
                    <div className="relative my-auto py-2 flex items-center justify-center w-full">
                      <span
                        className="text-[7px] font-mono uppercase tracking-widest text-zinc-500/80 select-none"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                      >
                        СЕРТИФИКАТ
                      </span>

                      <svg
                        viewBox="0 0 96 96"
                        fill="none"
                        className="w-24 h-24 mx-auto drop-shadow-[0_8px_16px_rgba(0,0,0,0.75)] group-hover:scale-105 transition-transform"
                        aria-hidden="true"
                      >
                        {/* Engraved Leaf */}
                        <path
                          d="M47 24C40 14 27 12 18 15C24 23 35 27 47 24Z"
                          fill="#181b18"
                          stroke="#e4e4e7"
                          strokeWidth="1.8"
                          strokeLinejoin="round"
                        />
                        <path d="M22 16C30 18 38 20 46 23" stroke="#e4e4e7" strokeWidth="1.2" />
                        <path d="M28 15L32 19M35 16L39 21" stroke="#a1a1aa" strokeWidth="1" />

                        {/* Stem */}
                        <path
                          d="M48 27C48 21 51 16 55 13"
                          stroke="#e4e4e7"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                        />

                        {/* Main Apple Silhouette */}
                        <path
                          d="M48 28C39 28 33 24 25 27C15 31 12 45 16 60C20 73 29 84 39 84C43 84 45 81 48 81C51 81 53 84 57 84C67 84 76 73 80 60C84 45 81 31 71 27C63 24 57 28 48 28Z"
                          fill="#0c0f0d"
                          stroke="#e4e4e7"
                          strokeWidth="2"
                        />

                        {/* Linocut / Woodcut Engraving Hatch Lines on Right & Bottom */}
                        <path
                          d="M56 31C68 33 75 44 73 59C71 70 64 78 56 80"
                          stroke="#d4d4d8"
                          strokeWidth="1.5"
                          strokeDasharray="3 2"
                        />
                        <path
                          d="M52 34C63 36 69 46 67 58C65 67 59 74 52 77"
                          stroke="#a1a1aa"
                          strokeWidth="1.3"
                          strokeDasharray="2 2.5"
                        />
                        <path
                          d="M24 38C21 46 22 56 26 65"
                          stroke="#ffffff"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        />
                        <ellipse cx="29" cy="35" rx="4" ry="2" transform="rotate(-30 29 35)" fill="#ffffff" />
                      </svg>

                      <span
                        className="text-[7px] font-mono uppercase tracking-widest text-zinc-500/80 select-none"
                        style={{ writingMode: 'vertical-rl' }}
                      >
                        VIP GIFT //
                      </span>
                    </div>

                    {/* Bottom Access Footer */}
                    <div className="text-[8px] font-mono uppercase tracking-wider text-[#9c9065] pt-1 border-t border-white/10 w-full truncate">
                      VIP GIFT // ACCESS GRANTED
                    </div>
                  </motion.button>

                  {/* Option 2: СЕРТИФИКАТ OZON (Dark Matte Slate & Monochrome 3D Gift Box) */}
                  <motion.button
                    type="button"
                    data-testid="gift-card-ozon"
                    whileHover={{ scale: 1.015, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={selectedGift !== null}
                    onClick={() => handleSelectGift('ozon')}
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 85% 15%, rgba(100,116,139,0.22) 0%, rgba(17,21,30,0.95) 55%, rgba(11,13,19,0.99) 100%)',
                    }}
                    className={`group relative overflow-hidden p-3.5 rounded-[20px] border text-left flex flex-col justify-between min-h-[236px] transition-all ${
                      selectedGift === 'ozon'
                        ? 'border-slate-300 shadow-[0_0_25px_rgba(203,213,225,0.3)]'
                        : 'border-white/20 hover:border-slate-300/70 shadow-[0_14px_32px_rgba(0,0,0,0.75)]'
                    }`}
                  >
                    {/* Top Row: Circle Cube Icon + VIP GIFT */}
                    <div className="flex items-center justify-between w-full">
                      <span className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center shadow-inner">
                        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                          <path d="M10 2.5L16.5 6.2V13.8L10 17.5L3.5 13.8V6.2L10 2.5Z" stroke="#e2e8f0" strokeWidth="1.4" />
                          <path d="M3.5 6.2L10 10L16.5 6.2M10 10V17.5" stroke="#94a3b8" strokeWidth="1.3" />
                        </svg>
                      </span>
                      <span className="text-[9px] font-mono uppercase tracking-[0.16em] text-slate-400">
                        VIP GIFT
                      </span>
                    </div>

                    {/* Title Block */}
                    <div className="mt-2.5">
                      <div className="text-[13px] font-extrabold uppercase tracking-tight text-white leading-tight">
                        СЕРТИФИКАТ OZON
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        На любые желания
                      </div>
                    </div>

                    {/* Center Monochrome 3D Wrapped Gift Box on Topographic Pattern + OZON Tag */}
                    <div className="relative my-auto mt-2.5 w-full h-[112px] rounded-xl bg-[#0b0d13] border border-white/10 overflow-hidden flex items-center justify-center">
                      {/* Abstract Topographic / Zebra Wave Pattern */}
                      <svg
                        viewBox="0 0 140 110"
                        fill="none"
                        className="pointer-events-none absolute inset-0 w-full h-full opacity-30"
                        aria-hidden="true"
                      >
                        <path
                          d="M-10 20C25 5 45 35 80 18C115 1 130 28 155 15M-10 42C20 28 50 55 85 38C120 21 135 48 155 36M-10 66C30 50 55 80 90 62C125 44 135 72 155 60M-10 90C25 75 55 102 92 86C125 70 138 95 155 84"
                          stroke="#94a3b8"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                      </svg>

                      {/* 3D Silver-Grey Wrapped Gift Box SVG */}
                      <svg
                        viewBox="0 0 84 84"
                        fill="none"
                        className="relative z-10 w-20 h-20 drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform"
                        aria-hidden="true"
                      >
                        {/* Left Box Face */}
                        <path d="M16 34L42 46V74L16 61V34Z" fill="#71717a" stroke="#e4e4e7" strokeWidth="1.4" />
                        {/* Right Box Face */}
                        <path d="M68 34L42 46V74L68 61V34Z" fill="#3f3f46" stroke="#d4d4d8" strokeWidth="1.4" />
                        {/* Top Box Lid */}
                        <path d="M42 21L69 33L42 45L15 33L42 21Z" fill="#d4d4d8" stroke="#ffffff" strokeWidth="1.4" />
                        {/* Vertical & Top Ribbons */}
                        <path d="M27 39L54 27L60 30L33 42V69L27 66V39Z" fill="#18181b" stroke="#f4f4f5" strokeWidth="1.1" />
                        <path d="M55 39L28 27L22 30L49 42V69L55 66V39Z" fill="#27272a" stroke="#f4f4f5" strokeWidth="1.1" />
                        {/* 3D Ribbon Bow on Top */}
                        <path
                          d="M42 28C33 17 23 19 25 27C27 32 35 31 42 28ZM42 28C51 17 61 19 59 27C57 32 49 31 42 28Z"
                          fill="#e4e4e7"
                          stroke="#18181b"
                          strokeWidth="1.5"
                        />
                        <circle cx="42" cy="28" r="3" fill="#ffffff" stroke="#18181b" strokeWidth="1.2" />
                      </svg>

                      {/* Angled Dark Metallic [ OZON ] Stamp Badge */}
                      <span className="absolute bottom-1.5 right-2 z-20 px-2 py-0.5 rounded-md bg-[#090b10]/95 border border-white/30 text-[10px] font-black tracking-wider text-zinc-100 -rotate-6 shadow-md">
                        OZON
                      </span>
                    </div>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          </>
        )}
      </div>

      {/* ================= FINAL VICTORY MODAL ================= */}
      <AnimatePresence>
        {selectedGift && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-5"
          >
            <motion.div
              initial={{ scale: 0.88, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-[340px] rounded-3xl bg-[#12141a] border border-white/20 p-5 text-center shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/[0.07] border border-white/20 flex items-center justify-center mx-auto mb-3 text-zinc-100">
                <Gift className="w-7 h-7" />
              </div>

              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                НОВЫЙ ГОД 2027 · ПОДАРОК РАЗБЛОКИРОВАН
              </span>

              <h3 className="text-xl font-extrabold text-white mt-2">
                {selectedGift === 'goldapple'
                  ? 'Сертификат в Золотое Яблоко'
                  : 'Сертификат Ozon на любые желания'}
              </h3>

              <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                С Новым 2027 Годом, родная! Пусть в новом году у тебя будет столько же радости, сколько хунтуней у Мо Жаня, и такой же мощный вайб, как на концерте VIPERR! ✨
              </p>

              {/* Promo / Activation Code Box */}
              <div className="mt-4 p-3 rounded-2xl bg-black/60 border border-white/15 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[9px] font-mono text-zinc-400 block">
                    КОД ПОЛУЧЕНИЯ ПОДАРКА:
                  </span>
                  <span className="text-sm font-mono font-bold text-white tracking-wider">
                    {selectedGift === 'goldapple'
                      ? 'NY2027-GOLD-APPLE'
                      : 'NY2027-OZON-VIP'}
                  </span>
                </div>
                <button
                  onClick={() =>
                    copyCode(
                      selectedGift === 'goldapple'
                        ? 'NY2027-GOLD-APPLE'
                        : 'NY2027-OZON-VIP'
                    )
                  }
                  className="px-3 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center gap-1 active:scale-95 transition-all"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Скопировано</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Копировать</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-zinc-400 mt-3 font-medium">
                💌 Отправь скриншот этого экрана или скопированный код мне в личку, чтобы забрать настоящий сертификат!
              </p>

              <button
                onClick={() => setSelectedGift(null)}
                className="mt-4 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-zinc-200 transition-all"
              >
                Вернуться в сейф
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default SafeApp;
