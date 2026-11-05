import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  X,
  CloudSnow,
  Sparkles,
  Wind,
  Droplets,
  Eye,
  Thermometer,
  Moon,
  Calendar,
  Clock,
  Compass,
} from 'lucide-react';
import { vibrate, playTapSound, playGlitchSound } from '../../utils/haptics';

interface WeatherAppProps {
  onBack: () => void;
}

export const WeatherApp: React.FC<WeatherAppProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isBlizzardActive, setIsBlizzardActive] = useState(false);
  const blizzardStartTimeRef = useRef<number | null>(null);
  const blizzardTimerRef = useRef<number | null>(null);

  const handleTriggerBlizzard = () => {
    if (isBlizzardActive) return;
    setIsBlizzardActive(true);
    blizzardStartTimeRef.current = performance.now();

    // Tactile haptic pulse via navigator.vibrate & safe wrapper
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.([50, 100, 50, 100]);
      }
    } catch {
      // Ignore unsupported vibration
    }
    vibrate([50, 100, 50, 100]);
    playGlitchSound();

    if (blizzardTimerRef.current) {
      window.clearTimeout(blizzardTimerRef.current);
    }
    blizzardTimerRef.current = window.setTimeout(() => {
      setIsBlizzardActive(false);
      blizzardStartTimeRef.current = null;
    }, 4500);
  };

  useEffect(() => {
    return () => {
      if (blizzardTimerRef.current) {
        window.clearTimeout(blizzardTimerRef.current);
      }
    };
  }, []);

  // High-performance 60 FPS Canvas Snowfall & Vortex Blizzard Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || 360);
    let height = (canvas.height = canvas.offsetHeight || 640);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 360;
      height = canvas.height = canvas.offsetHeight || 640;
    };
    window.addEventListener('resize', handleResize);

    // Snowflake particle pool: 45 ambient + 85 blizzard-specific = 130 particles
    const snowflakes = [
      ...Array.from({ length: 45 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.8,
        speedY: Math.random() * 0.9 + 0.5,
        speedX: Math.random() * 0.5 - 0.25,
        opacity: Math.random() * 0.6 + 0.3,
        swirlOffset: Math.random() * Math.PI * 2,
        isBlizzardSpecial: false,
      })),
      ...Array.from({ length: 85 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.4 + 0.6,
        speedY: Math.random() * 1.5 + 0.8,
        speedX: Math.random() * 1.2 - 0.6,
        opacity: Math.random() * 0.55 + 0.35,
        swirlOffset: Math.random() * Math.PI * 2,
        isBlizzardSpecial: true,
      })),
    ];

    const render = () => {
      // Calculate blizzard intensity envelope (4.5s cycle: 700ms ramp, 2900ms peak, 900ms decay)
      let intensity = 0;
      if (blizzardStartTimeRef.current !== null) {
        const elapsed = performance.now() - blizzardStartTimeRef.current;
        if (elapsed >= 0 && elapsed < 4500) {
          if (elapsed < 700) {
            intensity = elapsed / 700;
          } else if (elapsed < 3600) {
            intensity = 1.0;
          } else {
            intensity = Math.max(0, (4500 - elapsed) / 900);
          }
        } else {
          blizzardStartTimeRef.current = null;
        }
      }

      ctx.clearRect(0, 0, width, height);

      // Frost vignette around phone screen edges drawn directly in Canvas 2D without DOM bloat
      if (intensity > 0.005) {
        const maxR = Math.max(width, height) * 0.75;
        const minR = Math.min(width, height) * 0.28;
        const frostGrad = ctx.createRadialGradient(
          width / 2,
          height * 0.45,
          minR,
          width / 2,
          height * 0.45,
          maxR
        );
        frostGrad.addColorStop(0, 'rgba(210, 240, 255, 0)');
        frostGrad.addColorStop(0.55, `rgba(180, 225, 255, ${0.12 * intensity})`);
        frostGrad.addColorStop(1, `rgba(225, 248, 255, ${0.48 * intensity})`);

        ctx.fillStyle = frostGrad;
        ctx.fillRect(0, 0, width, height);

        // Top frost border
        const topGrad = ctx.createLinearGradient(0, 0, 0, 52);
        topGrad.addColorStop(0, `rgba(235, 250, 255, ${0.45 * intensity})`);
        topGrad.addColorStop(1, 'rgba(235, 250, 255, 0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, width, 52);

        // Bottom frost border
        const botGrad = ctx.createLinearGradient(0, height - 70, 0, height);
        botGrad.addColorStop(0, 'rgba(235, 250, 255, 0)');
        botGrad.addColorStop(1, `rgba(235, 250, 255, ${0.55 * intensity})`);
        ctx.fillStyle = botGrad;
        ctx.fillRect(0, height - 70, width, 70);

        // Left frost border
        const leftGrad = ctx.createLinearGradient(0, 0, 36, 0);
        leftGrad.addColorStop(0, `rgba(235, 250, 255, ${0.38 * intensity})`);
        leftGrad.addColorStop(1, 'rgba(235, 250, 255, 0)');
        ctx.fillStyle = leftGrad;
        ctx.fillRect(0, 0, 36, height);

        // Right frost border
        const rightGrad = ctx.createLinearGradient(width - 36, 0, width, 0);
        rightGrad.addColorStop(0, 'rgba(235, 250, 255, 0)');
        rightGrad.addColorStop(1, `rgba(235, 250, 255, ${0.38 * intensity})`);
        ctx.fillStyle = rightGrad;
        ctx.fillRect(width - 36, 0, 36, height);
      }

      // Vortex coordinates & physics dynamics
      const vortexCenterX = width / 2;
      const vortexCenterY = height * 0.45;
      const nowSec = performance.now() * 0.001;

      snowflakes.forEach((flake) => {
        // If this is a blizzard-only particle and intensity is idle, skip
        if (flake.isBlizzardSpecial && intensity < 0.01) {
          return;
        }

        let currentAlpha = flake.opacity;
        if (flake.isBlizzardSpecial) {
          currentAlpha = flake.opacity * intensity;
        } else if (intensity > 0) {
          currentAlpha = Math.min(1, flake.opacity * (1 + intensity * 0.4));
        }

        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.fill();

        if (intensity > 0.001) {
          // Vortex vector field physics
          const dx = flake.x - vortexCenterX;
          const dy = flake.y - vortexCenterY;
          const dist = Math.sqrt(dx * dx + dy * dy) + 0.1;

          // Tangential swirl vectors
          const tx = -dy / dist;
          const ty = dx / dist;

          // Radial vectors
          const rx = dx / dist;
          const ry = dy / dist;

          const maxInfluenceDist = width * 0.85;
          const distFactor = Math.max(0, 1 - dist / maxInfluenceDist);
          const tangentialSpeed = (4.5 + 7.5 * distFactor) * intensity;

          const radialSpeed =
            (-1.2 + 2.0 * Math.cos(dist * 0.035 - nowSec * 3.5 + flake.swirlOffset)) *
            intensity;

          const windX = (-2.8 + Math.sin(nowSec * 2.5) * 1.6) * intensity;
          const windY = (2.2 + Math.cos(nowSec * 2.0) * 0.9) * intensity;

          const vx =
            flake.speedX * (1 - intensity * 0.5) +
            tx * tangentialSpeed +
            rx * radialSpeed +
            windX;
          const vy =
            flake.speedY * (1 + intensity * 1.5) +
            ty * tangentialSpeed +
            ry * radialSpeed +
            windY;

          flake.x += vx;
          flake.y += vy;
        } else {
          // Gentle ambient snowfall
          flake.x += flake.speedX;
          flake.y += flake.speedY;
        }

        // Boundary wrap-around
        if (flake.y > height + 20) {
          flake.y = -15;
          flake.x = Math.random() * width;
        } else if (flake.y < -20) {
          flake.y = height + 15;
          flake.x = Math.random() * width;
        }

        if (flake.x > width + 25) {
          flake.x = -20;
        } else if (flake.x < -25) {
          flake.x = width + 20;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const hourlyForecast = [
    { time: 'Сейчас', temp: '-5°', icon: '❄️', highlight: false, note: '' },
    { time: '23:00', temp: '-5°', icon: '❄️', highlight: false, note: '' },
    { time: '00:00', temp: '-5°', icon: '🎆', highlight: true, note: 'Новый Год! Салют' },
    { time: '01:00', temp: '-6°', icon: '🌙', highlight: false, note: '' },
    { time: '02:00', temp: '-7°', icon: '☁️', highlight: false, note: '' },
    { time: '03:00', temp: '-7°', icon: '🦇', highlight: true, note: 'Рейв VIPERR' },
    { time: '04:00', temp: '-8°', icon: '❄️', highlight: false, note: '' },
    { time: '05:00', temp: '-8°', icon: '❄️', highlight: false, note: '' },
    { time: '06:00', temp: '-7°', icon: '🌅', highlight: false, note: '' },
  ];

  const tenDayForecast = [
    { day: 'Сегодня', icon: '❄️', min: -8, max: -2, currentMinOffset: 25, currentMaxOffset: 70 },
    { day: 'Ср 1 янв', icon: '🎆', min: -7, max: -1, currentMinOffset: 30, currentMaxOffset: 78 },
    { day: 'Чт 2 янв', icon: '☁️', min: -9, max: -3, currentMinOffset: 20, currentMaxOffset: 65 },
    { day: 'Пт 3 янв', icon: '❄️', min: -10, max: -4, currentMinOffset: 15, currentMaxOffset: 60 },
    { day: 'Сб 4 янв', icon: '🥟', min: -6, max: 0, currentMinOffset: 35, currentMaxOffset: 85 },
    { day: 'Вс 5 янв', icon: '🦇', min: -5, max: 1, currentMinOffset: 40, currentMaxOffset: 92 },
    { day: 'Пн 6 янв', icon: '❄️', min: -7, max: -2, currentMinOffset: 28, currentMaxOffset: 72 },
    { day: 'Вт 7 янв', icon: '✨', min: -8, max: -3, currentMinOffset: 22, currentMaxOffset: 68 },
    { day: 'Ср 8 янв', icon: '☁️', min: -11, max: -5, currentMinOffset: 10, currentMaxOffset: 55 },
    { day: 'Чт 9 янв', icon: '❄️', min: -9, max: -4, currentMinOffset: 18, currentMaxOffset: 62 },
  ];

  return (
    <div className="relative w-full h-full flex flex-col bg-gradient-to-b from-[#101b33] via-[#0b1324] to-[#040810] text-white select-none z-30 overflow-hidden font-sans">
      {/* Background Animated Canvas Snowfall & 60 FPS Blizzard Vortex (R4) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-25 z-[25] opacity-90"
        style={{ zIndex: 25 }}
      />

      {/* Top Header with ChevronLeft and Frosted X Exit */}
      <div className="relative flex items-center justify-between px-4 pt-3 pb-2.5 bg-black/40 backdrop-blur-xl border-b border-white/10 z-20">
        <button
          onClick={() => {
            vibrate(15);
            playTapSound(400, 0.04);
            onBack();
          }}
          className="flex items-center gap-1 text-sky-400 hover:text-sky-300 active:opacity-60 transition-all -ml-1 py-1 px-1.5 rounded-lg"
          aria-label="Назад"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.4]" />
          <span className="text-base font-normal">Назад</span>
        </button>

        <span className="text-base font-semibold text-white tracking-tight">Погода</span>

        <button
          onClick={() => {
            vibrate(20);
            playTapSound(420, 0.04);
            onBack();
          }}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center backdrop-blur-md border border-white/15 text-white/80 transition-all"
          aria-label="Закрыть погоду"
        >
          <X className="w-4 h-4 stroke-[2.4]" />
        </button>
      </div>

      {/* Main Weather Scroll Container */}
      <div className="relative flex-1 overflow-y-auto px-4 pt-4 pb-8 space-y-5 overscroll-contain touch-pan-y z-20">
        {/* Hero Section */}
        <div className="text-center pt-2 pb-1 space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-lg font-bold tracking-tight text-white">
            <span>Новогодняя Ночь 2027</span>
            <span>❄️</span>
          </div>
          <div className="text-xs text-sky-200/70 font-medium">
            Пентхаус Сану / Пик Сишэн
          </div>

          <div className="py-2">
            <div className="text-7xl font-extralight tracking-tighter text-white">
              -5°
            </div>
            <div className="text-sm font-medium text-sky-100/90 mt-1">
              Снегопад
            </div>
            <div className="text-xs text-white/60 font-medium mt-0.5">
              Макс.: -2°, мин.: -8°
            </div>
          </div>
        </div>

        {/* Interactive Festive Blizzard Trigger Button (R4) */}
        <button
          onClick={handleTriggerBlizzard}
          disabled={isBlizzardActive}
          aria-label="Запустить новогоднюю метель"
          className={`w-full relative overflow-hidden py-3 px-4 rounded-2xl flex items-center justify-between border transition-all duration-300 backdrop-blur-xl shadow-lg active:scale-[0.98] ${
            isBlizzardActive
              ? 'bg-gradient-to-r from-cyan-500/30 via-sky-500/35 to-blue-600/30 border-cyan-300/60 shadow-[0_0_25px_rgba(56,189,248,0.35)] cursor-default'
              : 'bg-white/[0.08] hover:bg-white/[0.14] border-white/20 hover:border-sky-300/40 cursor-pointer'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                isBlizzardActive
                  ? 'bg-sky-400/30 text-cyan-200'
                  : 'bg-white/10 text-sky-300'
              }`}
            >
              <Sparkles
                className={`w-4 h-4 ${isBlizzardActive ? 'animate-spin' : ''}`}
                style={{ animationDuration: '3s' }}
              />
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5">
                <span>{isBlizzardActive ? 'Бушует снежная буря!' : 'Запустить метель'}</span>
                <span className="text-xs">❄️</span>
              </div>
              <div className="text-[10px] text-sky-200/70 font-medium">
                {isBlizzardActive
                  ? 'Новогодний вихрь в пентхаусе'
                  : 'Спиральный вихрь • 4.5 сек'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isBlizzardActive ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-400/20 text-cyan-200 border border-cyan-300/40 animate-pulse">
                АКТИВНО
              </span>
            ) : (
              <div className="flex items-center gap-1 text-sky-300 text-xs font-semibold bg-white/[0.06] py-1 px-2.5 rounded-xl border border-white/10">
                <span>Вьюга</span>
                <Wind className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        </button>

        {/* Hourly Forecast Horizontal Scroll Tile */}
        <div className="bg-white/[0.08] backdrop-blur-2xl rounded-2xl p-3.5 border border-white/15 shadow-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-sky-200/80 font-semibold uppercase tracking-wider px-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Почасовой прогноз</span>
          </div>

          <div
            className="flex items-center gap-4 overflow-x-auto py-2 px-1 no-scrollbar touch-pan-x touch-pan-y"
            style={{ touchAction: 'pan-x pan-y' }}
          >
            {hourlyForecast.map((item, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center justify-between min-w-[58px] py-2 px-1 rounded-xl transition-all ${
                  item.highlight
                    ? 'bg-gradient-to-b from-sky-400/25 to-blue-600/30 border border-sky-300/40 shadow-md'
                    : 'bg-black/20'
                }`}
              >
                <span className="text-[11px] font-medium text-white/70 whitespace-nowrap">
                  {item.time}
                </span>
                <span className="text-xl my-1.5 filter drop-shadow">
                  {item.icon}
                </span>
                <span className="text-sm font-semibold text-white">
                  {item.temp}
                </span>
                {item.note && (
                  <span className="text-[9px] text-amber-300 font-bold whitespace-nowrap mt-1 text-center px-1">
                    {item.note}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 10-Day Forecast Card */}
        <div className="bg-white/[0.08] backdrop-blur-2xl rounded-2xl p-4 border border-white/15 shadow-xl space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-sky-200/80 font-semibold uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            <span>Прогноз на 10 дней</span>
          </div>

          <div className="divide-y divide-white/[0.08]">
            {tenDayForecast.map((row, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 text-xs font-medium"
              >
                <span className="w-16 text-white/80">{row.day}</span>
                <span className="text-base w-8 text-center">{row.icon}</span>

                {/* Min Temp */}
                <span className="text-white/50 w-7 text-right font-mono">
                  {row.min}°
                </span>

                {/* iOS Gradient Temperature Range Bar */}
                <div className="flex-1 mx-3 h-1.5 bg-black/40 rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-300"
                    style={{
                      left: `${row.currentMinOffset}%`,
                      right: `${100 - row.currentMaxOffset}%`,
                    }}
                  />
                  {/* Indicator Dot for Today */}
                  {idx === 0 && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow border border-black/40"
                      style={{ left: `${(row.currentMinOffset + row.currentMaxOffset) / 2}%` }}
                    />
                  )}
                </div>

                {/* Max Temp */}
                <span className="text-white font-mono w-7 text-left font-semibold">
                  {row.max}°
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2x2 Atmospheric Insight Tiles */}
        <div className="grid grid-cols-2 gap-3 pb-8">
          {/* Tile 1: Влажность 88% */}
          <div className="bg-white/[0.08] backdrop-blur-2xl rounded-2xl p-3.5 border border-white/15 shadow-lg flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs text-white/50 uppercase font-semibold">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              <span>Влажность</span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-white tracking-tight">88%</div>
              <div className="text-[11px] text-white/60 mt-1 leading-tight">
                Точка росы -6° прямо сейчас.
              </div>
            </div>
          </div>

          {/* Tile 2: Вероятность чуда 100% ✨ */}
          <div className="bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-white/[0.08] backdrop-blur-2xl rounded-2xl p-3.5 border border-amber-400/30 shadow-lg flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 uppercase font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Вероятность чуда</span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-extrabold text-amber-300 tracking-tight flex items-center gap-1">
                <span>100%</span>
                <span className="text-lg">✨</span>
              </div>
              <div className="text-[11px] text-amber-100/80 mt-1 leading-tight font-medium">
                Аномально высокий уровень волшебства!
              </div>
            </div>
          </div>

          {/* Tile 3: Видимость 6 км */}
          <div className="bg-white/[0.08] backdrop-blur-2xl rounded-2xl p-3.5 border border-white/15 shadow-lg flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs text-white/50 uppercase font-semibold">
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span>Видимость</span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-white tracking-tight">6 км</div>
              <div className="text-[11px] text-white/60 mt-1 leading-tight">
                Праздничная снежная метель.
              </div>
            </div>
          </div>

          {/* Tile 4: Ветер 4 м/с С-З */}
          <div className="bg-white/[0.08] backdrop-blur-2xl rounded-2xl p-3.5 border border-white/15 shadow-lg flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs text-white/50 uppercase font-semibold">
              <Wind className="w-3.5 h-3.5 text-sky-400" />
              <span>Ветер</span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-white tracking-tight">4 м/с</div>
              <div className="text-[11px] text-white/60 mt-1 leading-tight">
                С-З • Свежий северный бриз с гор Сишэн.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default WeatherApp;
