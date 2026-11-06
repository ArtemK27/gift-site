import React, { useEffect, useRef } from 'react';
import { useSettings, WallpaperId } from '../context/SettingsContext';

interface Snowflake {
  x: number;
  y: number;
  z: number; // Depth: 0.2 (distant/blurry) to 1.5 (foreground/large)
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  angle: number;
  spin: number;
  swingSpeed: number;
  swingRadius: number;
  type: 'snow' | 'petal' | 'bokeh';
}

const WALLPAPER_PALETTES: Record<
  WallpaperId,
  {
    bgStops: [string, string, string, string];
    glow1: [string, string];
    glow2: [string, string];
    petalStops: [(opacity: number) => string, (opacity: number) => string];
    petalShadow: string;
  }
> = {
  newyear: {
    bgStops: ['#06070b', '#090a12', '#07070d', '#040407'],
    glow1: ['rgba(244, 63, 94, 0.14)', 'rgba(244, 63, 94, 0.03)'],
    glow2: ['rgba(56, 189, 248, 0.12)', 'rgba(168, 85, 247, 0.04)'],
    petalStops: [
      (op) => `rgba(255, 75, 110, ${op})`,
      (op) => `rgba(180, 20, 50, ${op * 0.9})`,
    ],
    petalShadow: 'rgba(255, 40, 80, 0.7)',
  },
  sangwoo: {
    bgStops: ['#120307', '#1f060d', '#140409', '#080204'],
    glow1: ['rgba(225, 29, 72, 0.20)', 'rgba(159, 18, 57, 0.06)'],
    glow2: ['rgba(245, 158, 11, 0.14)', 'rgba(180, 83, 9, 0.04)'],
    petalStops: [
      (op) => `rgba(251, 191, 36, ${op})`,
      (op) => `rgba(225, 29, 72, ${op * 0.9})`,
    ],
    petalShadow: 'rgba(245, 158, 11, 0.75)',
  },
  sisheng: {
    bgStops: ['#03111a', '#062032', '#051726', '#020910'],
    glow1: ['rgba(34, 211, 238, 0.18)', 'rgba(14, 165, 233, 0.05)'],
    glow2: ['rgba(244, 114, 182, 0.12)', 'rgba(56, 189, 248, 0.04)'],
    petalStops: [
      (op) => `rgba(165, 243, 252, ${op})`,
      (op) => `rgba(56, 189, 248, ${op * 0.9})`,
    ],
    petalShadow: 'rgba(56, 189, 248, 0.75)',
  },
};

export const LiveWallpaper: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { wallpaper } = useSettings();
  const wallpaperRef = useRef<WallpaperId>(wallpaper);
  wallpaperRef.current = wallpaper;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 430);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 932);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse / Touch wind interaction
    let mouseX = width / 2;
    let mouseY = height / 2;
    let mouseSpeedX = 0;
    let lastPointerX = width / 2;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      mouseSpeedX = (x - lastPointerX) * 0.15;
      lastPointerX = x;
      mouseX = x;
      mouseY = y;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove);

    // Create 75 diverse particles across 3 depth planes
    const particles: Snowflake[] = [];
    const count = 75;

    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      let type: 'snow' | 'petal' | 'bokeh' = 'snow';
      let z = 0.3 + Math.random() * 1.0;

      if (rand < 0.15) {
        type = 'petal';
        z = 0.6 + Math.random() * 0.8;
      } else if (rand < 0.3) {
        type = 'bokeh';
        z = 0.2 + Math.random() * 0.4;
      }

      particles.push({
        type,
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        size:
          type === 'petal'
            ? 4 + Math.random() * 4
            : type === 'bokeh'
            ? 6 + Math.random() * 8
            : 1.5 + Math.random() * 3,
        speedY:
          type === 'petal'
            ? 0.9 + Math.random() * 0.8
            : type === 'bokeh'
            ? 0.2 + Math.random() * 0.3
            : 0.6 + Math.random() * 1.4,
        speedX: (Math.random() - 0.5) * 0.4,
        opacity:
          type === 'petal'
            ? 0.6 + Math.random() * 0.35
            : type === 'bokeh'
            ? 0.15 + Math.random() * 0.25
            : 0.4 + Math.random() * 0.55,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.04,
        swingSpeed: 0.02 + Math.random() * 0.03,
        swingRadius: 0.5 + Math.random() * 1.5,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      const palette =
        WALLPAPER_PALETTES[wallpaperRef.current] || WALLPAPER_PALETTES.newyear;

      // Decadent OLED midnight background with dynamic subtle aurora
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, palette.bgStops[0]);
      bgGrad.addColorStop(0.4, palette.bgStops[1]);
      bgGrad.addColorStop(0.7, palette.bgStops[2]);
      bgGrad.addColorStop(1, palette.bgStops[3]);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient glowing orbs (deep festive lights bokeh)
      const glow1X = width * 0.3 + Math.sin(time * 0.5) * 40;
      const glow1Y = height * 0.25 + Math.cos(time * 0.4) * 30;
      const glow1 = ctx.createRadialGradient(glow1X, glow1Y, 10, glow1X, glow1Y, 220);
      glow1.addColorStop(0, palette.glow1[0]);
      glow1.addColorStop(0.6, palette.glow1[1]);
      glow1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, width, height);

      const glow2X = width * 0.75 + Math.cos(time * 0.6) * 50;
      const glow2Y = height * 0.65 + Math.sin(time * 0.5) * 40;
      const glow2 = ctx.createRadialGradient(glow2X, glow2Y, 10, glow2X, glow2Y, 250);
      glow2.addColorStop(0, palette.glow2[0]);
      glow2.addColorStop(0.5, palette.glow2[1]);
      glow2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, width, height);

      // Dampen mouse interaction
      mouseSpeedX *= 0.94;

      // Render snow & petals sorted by depth
      particles.forEach((p) => {
        // Natural gentle wind sway + interaction
        const wind =
          Math.sin(time * p.swingSpeed * 60 + p.angle) * p.swingRadius +
          mouseSpeedX * p.z;
        p.y += p.speedY * p.z;
        p.x += p.speedX * p.z + wind * 0.4;
        p.angle += p.spin;

        // Proximity push from pointer
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          const force = (80 - dist) / 80;
          p.x += (dx / dist) * force * 1.5;
          p.y += (dy / dist) * force * 1.5;
        }

        // Wrap around screen boundaries
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        if (p.type === 'snow') {
          const currentSize = p.size * p.z;
          ctx.beginPath();
          ctx.arc(0, 0, currentSize, 0, Math.PI * 2);

          if (p.z > 0.9) {
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 6;
          } else {
            ctx.fillStyle = `rgba(235, 245, 255, ${p.opacity * 0.85})`;
            ctx.shadowColor = 'rgba(200, 230, 255, 0.4)';
            ctx.shadowBlur = 3;
          }
          ctx.fill();
        } else if (p.type === 'bokeh') {
          const orbSize = p.size * p.z;
          const orbGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, orbSize);
          orbGrad.addColorStop(0, `rgba(255, 245, 230, ${p.opacity * 0.8})`);
          orbGrad.addColorStop(0.6, `rgba(255, 215, 160, ${p.opacity * 0.3})`);
          orbGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = orbGrad;
          ctx.beginPath();
          ctx.arc(0, 0, orbSize, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Winter blossom petal / festive spark (tumbling 3D illusion)
          const petalScale = p.size * p.z;
          const wobble = Math.sin(time * 3 + p.angle) * 0.4 + 0.6;

          ctx.beginPath();
          ctx.ellipse(
            0,
            0,
            petalScale * 1.4,
            petalScale * 0.6 * wobble,
            Math.PI / 6,
            0,
            Math.PI * 2
          );

          const petalGrad = ctx.createLinearGradient(
            -petalScale,
            -petalScale,
            petalScale,
            petalScale
          );
          petalGrad.addColorStop(0, palette.petalStops[0](p.opacity));
          petalGrad.addColorStop(1, palette.petalStops[1](p.opacity));
          ctx.fillStyle = petalGrad;
          ctx.shadowColor = palette.petalShadow;
          ctx.shadowBlur = 8;
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 w-full h-full"
    />
  );
};
