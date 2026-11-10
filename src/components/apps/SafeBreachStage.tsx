import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  vibrate,
  playTapSound,
  playUnlockSound,
  playAirlockOpenSound,
} from '../../utils/haptics';

export const SAFE_CIPHER_DIGITS: readonly [string, string, string, string] = [
  '2',
  '4',
  '2',
  '7',
];

export interface LaserBeamState {
  id: number;
  kind: 'horizontal' | 'diagonal';
  yPercent: number;
  angleDeg: number;
  glitchStart: number;
  offThreshold: number;
  status: 'active' | 'glitching' | 'off';
}

export interface GearState {
  id: number;
  plane: 'back' | 'mid' | 'front';
  cx: number;
  cy: number;
  radius: number;
  teeth: number;
  direction: 1 | -1;
  speedMultiplier: number;
  rotationDeg: number;
  outwardOffsetPx: number;
  accent: 'steel' | 'gunmetal' | 'bronze';
}

export interface BreachKinematics {
  clampedProgress: number;
  activeStage: 1 | 2 | 3;
  /** Stage 1: Wheel rotation in degrees */
  wheelRotationDeg: number;
  /** Stage 1: 0..1 rotational speed intensity for motion blur & arc effects */
  wheelSpinIntensity: number;
  /** Stage 1: 0..1 progress of outer doors sliding apart left/right (26%..35%) */
  doorSplitProgress: number;
  /** Stage 2: Camera scale & opacity for the multi-depth gear chamber */
  gearLayerScale: number;
  gearLayerOpacity: number;
  /** Stage 2: 0..1 progress of gears parting outward from center (62%..70%) */
  gearSplitProgress: number;
  gearsAligned: boolean;
  gears: GearState[];
  /** Stage 3: Camera scale & opacity for the laser cryo-chamber */
  laserLayerScale: number;
  laserLayerOpacity: number;
  lasers: LaserBeamState[];
  activeLasersCount: number;
  allLasersOff: boolean;
  specularAngleDeg: number;
  isDoorsOpening: boolean;
}

export function computeAngleDeltaDeg(prevRad: number, nextRad: number): number {
  let diff = ((nextRad - prevRad) * 180) / Math.PI;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return diff;
}

function clamp01(val: number): number {
  return Math.max(0, Math.min(1, val));
}

/**
 * Pure kinematics computation for the 3-stage vault breach animation:
 * - Stage 1 (0% – 35%): Realistic stylized gunmetal vault door with 6-spoke wheel & motion effects -> splits at 35%
 * - Stage 2 (35% – 70%): 9 multi-layered textured dark-metal gears across 3 depth planes -> parts outward at 70%
 * - Stage 3 (70% – 100%): Neon-red laser grid over the frosted card -> lasers short-circuit & shut off by 100%
 */
export function computeBreachKinematics(rawProgress: number): BreachKinematics {
  const clampedProgress = Math.max(0, Math.min(100, Number(rawProgress.toFixed(2))));

  const activeStage: 1 | 2 | 3 =
    clampedProgress < 35 ? 1 : clampedProgress < 70 ? 2 : 3;

  // ================= STAGE 1: GUNMETAL VAULT DOOR & 6-SPOKE WHEEL (0% -> 35%) =================
  const stage1SpinRatio = clamp01(clampedProgress / 28);
  // Ease-in acceleration curve so the wheel visibly accelerates as it turns
  const easedSpin = stage1SpinRatio * (0.35 + 0.65 * stage1SpinRatio);
  const wheelRotationDeg = Number((easedSpin * 420).toFixed(1));
  const specularAngleDeg = Number(((wheelRotationDeg * 0.7) % 360).toFixed(1));
  const wheelSpinIntensity =
    clampedProgress > 0.5 && clampedProgress < 31
      ? Number(Math.sin(clamp01(clampedProgress / 30) * Math.PI).toFixed(3))
      : 0;

  const doorSplitProgress = Number(clamp01((clampedProgress - 26) / 9).toFixed(3));

  // ================= STAGE 2: 15 ASYMMETRICAL MULTI-LAYERED GEARS (35% -> 70%) =================
  const gearIntroRatio = clamp01((clampedProgress - 23) / 13);
  const gearSplitProgress = Number(clamp01((clampedProgress - 62) / 8).toFixed(3));
  const gearLayerScale = Number(
    (0.82 + gearIntroRatio * 0.18 + gearSplitProgress * 0.26).toFixed(3)
  );
  const gearLayerOpacity = Number(
    (clamp01((clampedProgress - 21) / 9) * (1 - clamp01((clampedProgress - 66) / 5))).toFixed(3)
  );

  const gearSpinDeg = Math.max(0, clampedProgress - 24) * 11.5;
  const gearsAligned = clampedProgress >= 60 && clampedProgress <= 72;
  const baseOutwardPx = gearSplitProgress * 235;

  const gearDefinitions: Array<{
    id: number;
    plane: 'back' | 'mid' | 'front';
    cx: number;
    cy: number;
    radius: number;
    teeth: number;
    direction: 1 | -1;
    speedMultiplier: number;
    initialAngle: number;
    accent: 'steel' | 'gunmetal' | 'bronze';
  }> = [
    // Plane 1: Deep Background Asymmetrical Structural Gears (5 gears)
    { id: 1, plane: 'back', cx: -118, cy: -162, radius: 108, teeth: 22, direction: 1, speedMultiplier: 0.48, initialAngle: 12, accent: 'gunmetal' },
    { id: 2, plane: 'back', cx: 82, cy: -188, radius: 74, teeth: 15, direction: -1, speedMultiplier: 0.72, initialAngle: -20, accent: 'gunmetal' },
    { id: 3, plane: 'back', cx: 138, cy: -38, radius: 96, teeth: 20, direction: 1, speedMultiplier: 0.54, initialAngle: 33, accent: 'gunmetal' },
    { id: 4, plane: 'back', cx: -134, cy: 48, radius: 84, teeth: 17, direction: -1, speedMultiplier: 0.64, initialAngle: -14, accent: 'gunmetal' },
    { id: 5, plane: 'back', cx: 44, cy: 174, radius: 112, teeth: 22, direction: -1, speedMultiplier: 0.45, initialAngle: 25, accent: 'gunmetal' },

    // Plane 2: Midground Off-Axis Machined Transmission Cluster (6 gears)
    { id: 6, plane: 'mid', cx: -34, cy: -116, radius: 68, teeth: 14, direction: -1, speedMultiplier: 0.95, initialAngle: 8, accent: 'steel' },
    { id: 7, plane: 'mid', cx: 78, cy: -92, radius: 54, teeth: 12, direction: 1, speedMultiplier: 1.2, initialAngle: 22, accent: 'bronze' },
    { id: 8, plane: 'mid', cx: -88, cy: -22, radius: 62, teeth: 13, direction: 1, speedMultiplier: 1.05, initialAngle: -19, accent: 'bronze' },
    { id: 9, plane: 'mid', cx: 28, cy: 18, radius: 78, teeth: 16, direction: -1, speedMultiplier: 0.85, initialAngle: 14, accent: 'steel' },
    { id: 10, plane: 'mid', cx: -64, cy: 118, radius: 72, teeth: 15, direction: 1, speedMultiplier: 0.92, initialAngle: 31, accent: 'steel' },
    { id: 11, plane: 'mid', cx: 116, cy: 96, radius: 52, teeth: 11, direction: 1, speedMultiplier: 1.28, initialAngle: -9, accent: 'bronze' },

    // Plane 3: Foreground High-Speed Pinions & Escapement Couplers (4 gears)
    { id: 12, plane: 'front', cx: -28, cy: -38, radius: 44, teeth: 10, direction: 1, speedMultiplier: 1.55, initialAngle: 0, accent: 'bronze' },
    { id: 13, plane: 'front', cx: 88, cy: -18, radius: 34, teeth: 8, direction: -1, speedMultiplier: 1.95, initialAngle: 17, accent: 'steel' },
    { id: 14, plane: 'front', cx: -18, cy: 76, radius: 38, teeth: 9, direction: -1, speedMultiplier: 1.75, initialAngle: -24, accent: 'bronze' },
    { id: 15, plane: 'front', cx: -116, cy: 168, radius: 46, teeth: 10, direction: -1, speedMultiplier: 1.48, initialAngle: 11, accent: 'bronze' },

    // Peripheral Edge Pinions & Idler Gears filling outer empty spaces (6 gears)
    { id: 16, plane: 'mid', cx: -8, cy: -196, radius: 42, teeth: 10, direction: 1, speedMultiplier: 1.45, initialAngle: 15, accent: 'steel' },
    { id: 17, plane: 'front', cx: 148, cy: -134, radius: 36, teeth: 9, direction: -1, speedMultiplier: 1.8, initialAngle: -12, accent: 'bronze' },
    { id: 18, plane: 'front', cx: -152, cy: -54, radius: 38, teeth: 9, direction: -1, speedMultiplier: 1.7, initialAngle: 24, accent: 'steel' },
    { id: 19, plane: 'mid', cx: -154, cy: 116, radius: 44, teeth: 10, direction: 1, speedMultiplier: 1.38, initialAngle: -8, accent: 'gunmetal' },
    { id: 20, plane: 'front', cx: 154, cy: 36, radius: 34, teeth: 8, direction: -1, speedMultiplier: 1.9, initialAngle: 19, accent: 'bronze' },
    { id: 21, plane: 'mid', cx: 132, cy: 178, radius: 44, teeth: 10, direction: 1, speedMultiplier: 1.42, initialAngle: -16, accent: 'steel' },
  ];

  const gears: GearState[] = gearDefinitions.map((g) => {
    const planeOutwardScale = g.plane === 'back' ? 0.8 : g.plane === 'mid' ? 1.05 : 1.25;
    const rot = g.initialAngle + g.direction * gearSpinDeg * g.speedMultiplier;
    return {
      id: g.id,
      plane: g.plane,
      cx: g.cx,
      cy: g.cy,
      radius: g.radius,
      teeth: g.teeth,
      direction: g.direction,
      speedMultiplier: g.speedMultiplier,
      rotationDeg: Number(rot.toFixed(1)),
      outwardOffsetPx: Number((baseOutwardPx * planeOutwardScale).toFixed(1)),
      accent: g.accent,
    };
  });

  // ================= STAGE 3: LASER BARRIER & CRYO-CHAMBER (70% -> 100%) =================
  const laserIntroRatio = clamp01((clampedProgress - 59) / 12);
  const laserLayerScale = Number((0.88 + laserIntroRatio * 0.12).toFixed(3));
  const laserLayerOpacity = Number(clamp01((clampedProgress - 57) / 10).toFixed(3));

  const laserThresholds: Array<{
    id: number;
    kind: 'horizontal' | 'diagonal';
    yPercent: number;
    angleDeg: number;
    glitchStart: number;
    offThreshold: number;
  }> = [
    { id: 1, kind: 'horizontal', yPercent: 11, angleDeg: 0, glitchStart: 70.5, offThreshold: 73.5 },
    { id: 2, kind: 'diagonal', yPercent: 20, angleDeg: 14, glitchStart: 73.6, offThreshold: 76.8 },
    { id: 3, kind: 'horizontal', yPercent: 30, angleDeg: 0, glitchStart: 76.9, offThreshold: 80.0 },
    { id: 4, kind: 'diagonal', yPercent: 40, angleDeg: -14, glitchStart: 80.1, offThreshold: 83.2 },
    { id: 5, kind: 'horizontal', yPercent: 50, angleDeg: 0, glitchStart: 83.3, offThreshold: 86.5 },
    { id: 6, kind: 'diagonal', yPercent: 60, angleDeg: 13, glitchStart: 86.6, offThreshold: 89.8 },
    { id: 7, kind: 'horizontal', yPercent: 70, angleDeg: 0, glitchStart: 89.9, offThreshold: 93.0 },
    { id: 8, kind: 'diagonal', yPercent: 79, angleDeg: -13, glitchStart: 93.1, offThreshold: 96.2 },
    { id: 9, kind: 'horizontal', yPercent: 88, angleDeg: 0, glitchStart: 96.3, offThreshold: 99.3 },
  ];

  const lasers: LaserBeamState[] = laserThresholds.map((lt) => {
    const status: 'active' | 'glitching' | 'off' =
      clampedProgress >= lt.offThreshold
        ? 'off'
        : clampedProgress >= lt.glitchStart
        ? 'glitching'
        : 'active';
    return {
      ...lt,
      status,
    };
  });

  const activeLasersCount = lasers.filter((l) => l.status !== 'off').length;
  const allLasersOff = clampedProgress >= 99.5;

  return {
    clampedProgress,
    activeStage,
    wheelRotationDeg,
    wheelSpinIntensity,
    doorSplitProgress,
    gearLayerScale,
    gearLayerOpacity,
    gearSplitProgress,
    gearsAligned,
    gears,
    laserLayerScale,
    laserLayerOpacity,
    lasers,
    activeLasersCount,
    allLasersOff,
    specularAngleDeg,
    isDoorsOpening: allLasersOff,
  };
}

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface CryoVaporPuff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  decay: number;
}

/**
 * Generates an involute-like machined gear profile path.
 */
function buildMachinedGearPath(outerR: number, rootR: number, teethCount: number): string {
  const step = (Math.PI * 2) / teethCount;
  let d = '';
  for (let i = 0; i < teethCount; i++) {
    const base = i * step;
    const a1 = base;
    const a2 = base + step * 0.16;
    const a3 = base + step * 0.46;
    const a4 = base + step * 0.62;

    const p1x = Math.cos(a1) * rootR;
    const p1y = Math.sin(a1) * rootR;
    const p2x = Math.cos(a2) * outerR;
    const p2y = Math.sin(a2) * outerR;
    const p3x = Math.cos(a3) * outerR;
    const p3y = Math.sin(a3) * outerR;
    const p4x = Math.cos(a4) * rootR;
    const p4y = Math.sin(a4) * rootR;

    d += `${i === 0 ? 'M' : 'L'} ${p1x.toFixed(1)} ${p1y.toFixed(1)} `;
    d += `L ${p2x.toFixed(1)} ${p2y.toFixed(1)} L ${p3x.toFixed(1)} ${p3y.toFixed(1)} L ${p4x.toFixed(1)} ${p4y.toFixed(1)} `;
  }
  d += 'Z';
  return d;
}

interface SafeBreachStageProps {
  onBreachComplete: () => void;
}

export const SafeBreachStage: React.FC<SafeBreachStageProps> = ({
  onBreachComplete,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  const fxCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const progressRef = useRef<number>(0);
  const isHoldingRef = useRef<boolean>(false);
  const completedRef = useRef<boolean>(false);

  const phaseStartTimeRef = useRef<number>(0);
  const phaseStartProgressRef = useRef<number>(0);

  const lastStageRef = useRef<number>(1);
  const lastLasersOffCountRef = useRef<number>(0);
  const lastSparkStepRef = useRef<number>(0);

  const sparksRef = useRef<SparkParticle[]>([]);
  const vaporRef = useRef<CryoVaporPuff[]>([]);

  const kin = computeBreachKinematics(progress);

  const spawnSparks = useCallback(
    (
      originX: number,
      originY: number,
      count: number,
      burstSpeed = 4.8,
      palette: string[] = ['#fde68a', '#fbbf24', '#f59e0b', '#ffffff']
    ) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (0.35 + Math.random() * 0.85) * burstSpeed;
        sparksRef.current.push({
          x: originX + (Math.random() - 0.5) * 10,
          y: originY + (Math.random() - 0.5) * 10,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.9,
          life: 0,
          maxLife: 14 + Math.random() * 18,
          color: palette[i % palette.length],
          size: 1.3 + Math.random() * 1.6,
        });
      }
      if (sparksRef.current.length > 150) {
        sparksRef.current.splice(0, sparksRef.current.length - 150);
      }
    },
    []
  );

  const finishBreachSequence = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    isHoldingRef.current = false;
    setIsExiting(true);

    vibrate([45, 60, 140]);
    playUnlockSound();

    const canvas = fxCanvasRef.current;
    const cw = canvas?.clientWidth || 380;
    const ch = canvas?.clientHeight || 700;
    spawnSparks(cw / 2, ch * 0.28, 32, 7.5, ['#ffffff', '#bae6fd', '#fde68a']);

    setTimeout(() => {
      onBreachComplete();
    }, 240);
  }, [onBreachComplete, spawnSparks]);

  const updateBreachProgress = useCallback(
    (nextRaw: number, autoFinishOn100: boolean) => {
      const clamped = Math.max(0, Math.min(100, nextRaw));
      const prev = progressRef.current;
      progressRef.current = clamped;
      setProgress(clamped);

      const canvas = fxCanvasRef.current;
      const cw = canvas?.clientWidth || 380;
      const ch = canvas?.clientHeight || 700;
      const cx = cw / 2;
      const cy = ch / 2;

      const nextKin = computeBreachKinematics(clamped);

      // Trigger heavy airlock sound when outer vault doors begin splitting apart (~26%)
      if (clamped >= 26 && prev < 26) {
        playAirlockOpenSound('door');
        vibrate([35, 25, 65]);
      }

      // Trigger secondary mechanical airlock sound when clockwork gears part open (~62%)
      if (clamped >= 62 && prev < 62) {
        playAirlockOpenSound('gears');
        vibrate([30, 20, 55]);
      }

      // Subtle sparks & tactile ticks every 2% when advancing
      const sparkStep = Math.floor(clamped / 2);
      if (sparkStep > lastSparkStepRef.current && clamped > prev) {
        lastSparkStepRef.current = sparkStep;
        vibrate(10);

        if (nextKin.activeStage === 1) {
          // Subtle friction sparks around the spinning 6-spoke wheel collar
          const a = Math.random() * Math.PI * 2;
          spawnSparks(cx + Math.cos(a) * 64, cy + Math.sin(a) * 64, 4, 3.8);
          playTapSound(210 + Math.round(clamped * 3.5), 0.02);
        } else if (nextKin.activeStage === 2) {
          // Small sparks from meshing gear teeth contact points across the asymmetrical cluster
          const contactPoints = [
            { x: cx - 30, y: cy - 68 },
            { x: cx + 52, y: cy - 42 },
            { x: cx - 54, y: cy - 8 },
            { x: cx + 10, y: cy + 44 },
            { x: cx - 42, y: cy + 88 },
            { x: cx + 72, y: cy + 56 },
          ];
          const pt = contactPoints[sparkStep % contactPoints.length];
          spawnSparks(pt.x, pt.y, 6, 4.4, ['#fde68a', '#fbbf24', '#e2e8f0']);
          playTapSound(280 + Math.round((clamped - 35) * 4.5), 0.025);
        } else {
          playTapSound(500 + Math.round((clamped - 70) * 8), 0.02);
        }
      } else if (clamped < prev && sparkStep < lastSparkStepRef.current) {
        lastSparkStepRef.current = sparkStep;
        if (sparkStep % 2 === 0) {
          playTapSound(170 + Math.round(clamped * 2.2), 0.016);
        }
      }

      if (nextKin.activeStage !== lastStageRef.current) {
        if (nextKin.activeStage > lastStageRef.current) {
          vibrate([30, 25, 60]);
          playTapSound(nextKin.activeStage === 2 ? 390 : 520, 0.07);
          spawnSparks(cx, cy, 22, 6.5);
        }
        lastStageRef.current = nextKin.activeStage;
      }

      const lasersOffNow = nextKin.lasers.filter((l) => l.status === 'off').length;
      if (lasersOffNow > lastLasersOffCountRef.current) {
        lastLasersOffCountRef.current = lasersOffNow;
        vibrate([20, 15, 40]);
        playTapSound(620 + lasersOffNow * 50, 0.055);
        const ly = ch * (0.11 + (lasersOffNow - 1) * 0.095);
        spawnSparks(
          cx + (Math.random() - 0.5) * 140,
          ly,
          16,
          6.0,
          ['#ef4444', '#fca5a5', '#fde68a', '#ffffff']
        );
      } else if (lasersOffNow < lastLasersOffCountRef.current) {
        lastLasersOffCountRef.current = lasersOffNow;
      }

      if (clamped >= 100 && autoFinishOn100 && !completedRef.current) {
        finishBreachSequence();
      }
    },
    [finishBreachSequence, spawnSparks]
  );

  // Hold-to-Advance (~2.5s forward at 40%/s) & Release-to-Rewind (slower backward at 24%/s)
  useEffect(() => {
    let rafId = 0;

    const tick = (now: number) => {
      if (!completedRef.current) {
        const elapsedSec = Math.max(0, (now - phaseStartTimeRef.current) / 1000);
        if (isHoldingRef.current) {
          const nextProg = Math.min(100, phaseStartProgressRef.current + elapsedSec * 40);
          if (nextProg !== progressRef.current) {
            updateBreachProgress(nextProg, true);
          }
        } else if (progressRef.current > 0) {
          const nextProg = Math.max(0, phaseStartProgressRef.current - elapsedSec * 24);
          if (nextProg !== progressRef.current) {
            updateBreachProgress(nextProg, false);
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [updateBreachProgress]);

  useEffect(() => {
    const onGlobalUp = () => {
      if (isHoldingRef.current) {
        isHoldingRef.current = false;
        phaseStartTimeRef.current = performance.now();
        phaseStartProgressRef.current = progressRef.current;
      }
    };
    window.addEventListener('pointerup', onGlobalUp);
    window.addEventListener('pointercancel', onGlobalUp);
    window.addEventListener('mouseup', onGlobalUp);
    window.addEventListener('touchend', onGlobalUp);
    return () => {
      window.removeEventListener('pointerup', onGlobalUp);
      window.removeEventListener('pointercancel', onGlobalUp);
      window.removeEventListener('mouseup', onGlobalUp);
      window.removeEventListener('touchend', onGlobalUp);
    };
  }, []);

  // Full-Screen HTML5 Canvas Loop for Sparks & Subtle Cryo Vapor
  useEffect(() => {
    const canvas = fxCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      const w = canvas.parentElement?.clientWidth || 380;
      const h = canvas.parentElement?.clientHeight || 700;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let animId = 0;
    const renderLoop = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const currentProg = progressRef.current;

      // Subtle rising cryo mist in Stage 2 & Stage 3
      const vaporChance = currentProg > 30 ? 0.14 + (currentProg / 100) * 0.35 : 0.04;
      if (Math.random() < vaporChance && vaporRef.current.length < 30) {
        vaporRef.current.push({
          x: Math.random() * w,
          y: h + 20,
          vx: (Math.random() - 0.5) * 0.45,
          vy: -(0.6 + Math.random() * 1.2 + (currentProg / 100) * 0.9),
          radius: 32 + Math.random() * 44,
          alpha: 0.03 + (currentProg / 100) * 0.07,
          decay: 0.0008 + Math.random() * 0.0007,
        });
      }

      for (let i = vaporRef.current.length - 1; i >= 0; i--) {
        const puff = vaporRef.current[i];
        puff.x += puff.vx;
        puff.y += puff.vy;
        puff.radius += 0.22;
        puff.alpha -= puff.decay;

        if (puff.alpha <= 0.002 || puff.y + puff.radius < -30) {
          vaporRef.current.splice(i, 1);
          continue;
        }

        const grad = ctx.createRadialGradient(
          puff.x,
          puff.y,
          puff.radius * 0.1,
          puff.x,
          puff.y,
          puff.radius
        );
        grad.addColorStop(0, `rgba(203, 213, 225, ${puff.alpha.toFixed(3)})`);
        grad.addColorStop(0.55, `rgba(148, 163, 184, ${(puff.alpha * 0.4).toFixed(3)})`);
        grad.addColorStop(1, 'rgba(148, 163, 184, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(puff.x, puff.y, puff.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Fine metallic sparks
      ctx.lineCap = 'round';
      for (let i = sparksRef.current.length - 1; i >= 0; i--) {
        const sp = sparksRef.current[i];
        const prevX = sp.x;
        const prevY = sp.y;

        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vx *= 0.94;
        sp.vy = sp.vy * 0.94 + 0.22;
        sp.life += 1;

        if (sp.life >= sp.maxLife) {
          sparksRef.current.splice(i, 1);
          continue;
        }

        const lifeRatio = 1 - sp.life / sp.maxLife;
        ctx.strokeStyle = sp.color;
        ctx.globalAlpha = Math.max(0, lifeRatio);
        ctx.lineWidth = sp.size * lifeRatio;

        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(sp.x, sp.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleStagePointerDown = () => {
    if (completedRef.current || isHoldingRef.current) return;
    phaseStartTimeRef.current = performance.now();
    phaseStartProgressRef.current = progressRef.current;
    isHoldingRef.current = true;
    vibrate(15);
    playTapSound(240, 0.035);
  };

  const renderGearNode = (gear: GearState) => {
    const normLen = Math.hypot(gear.cx, gear.cy) || 1;
    const dirX = gear.cx === 0 ? 0 : gear.cx / normLen;
    const dirY = gear.cy === 0 ? -1 : gear.cy / normLen;
    const tx = gear.cx + dirX * gear.outwardOffsetPx;
    const ty = gear.cy + dirY * gear.outwardOffsetPx;

    const toothDepth = gear.plane === 'back' ? 12 : gear.plane === 'mid' ? 10 : 7;
    const gearPath = buildMachinedGearPath(
      gear.radius,
      gear.radius - toothDepth,
      gear.teeth
    );

    const fillGrad =
      gear.plane === 'back'
        ? 'url(#gearBackDarkGrad)'
        : gear.accent === 'bronze'
        ? 'url(#gearBronzeSteelGrad)'
        : 'url(#gearMachinedSteelGrad)';

    const rimStroke =
      gear.plane === 'back'
        ? '#1e2532'
        : gear.accent === 'bronze'
        ? '#786242'
        : '#64748b';

    const isSmallPinion = gear.radius <= 42;
    const useRadialSpokes = !isSmallPinion && gear.id % 2 === 1;
    const holeCount = isSmallPinion ? 3 : gear.radius >= 85 ? 7 : gear.id % 3 === 0 ? 6 : 5;
    const holeRingR = gear.radius * (isSmallPinion ? 0.46 : 0.52);
    const holeR = gear.radius * (isSmallPinion ? 0.1 : 0.135);
    const spokeCount = gear.radius >= 92 ? 6 : 5;

    return (
      <g
        key={gear.id}
        data-testid={`clockwork-gear-${gear.id}`}
        transform={`translate(${tx.toFixed(1)}, ${ty.toFixed(1)}) rotate(${gear.rotationDeg})`}
        style={{
          filter:
            gear.plane === 'back'
              ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.85))'
              : 'drop-shadow(0 14px 24px rgba(0,0,0,0.92))',
        }}
      >
        {/* Outer Machined Gear Body */}
        <path
          d={gearPath}
          fill={fillGrad}
          stroke="#090c12"
          strokeWidth={gear.plane === 'back' ? '2.5' : '3'}
          strokeLinejoin="round"
        />

        {/* Beveled Tooth Root Ring */}
        <circle
          cx="0"
          cy="0"
          r={gear.radius - toothDepth - 2}
          fill="none"
          stroke={rimStroke}
          strokeWidth="1.8"
          strokeOpacity={gear.plane === 'back' ? '0.35' : '0.65'}
        />

        {/* Recessed Inner Web Dish */}
        <circle
          cx="0"
          cy="0"
          r={gear.radius - toothDepth - 6}
          fill={gear.plane === 'back' ? '#0a0d13' : '#111620'}
          stroke="#07090e"
          strokeWidth="2.5"
        />

        {/* Brushed Concentric Turning Rings */}
        <circle
          cx="0"
          cy="0"
          r={gear.radius * 0.66}
          fill="none"
          stroke="rgba(203,213,225,0.12)"
          strokeWidth="1.2"
        />
        <circle
          cx="0"
          cy="0"
          r={gear.radius * 0.38}
          fill="none"
          stroke="rgba(203,213,225,0.14)"
          strokeWidth="1.2"
        />

        {/* Style A: Radial Structural Spokes + Dark Cutout Sectors */}
        {useRadialSpokes ? (
          <>
            <circle
              cx="0"
              cy="0"
              r={gear.radius * 0.62}
              fill="#06080c"
              stroke="#05070a"
              strokeWidth="2"
            />
            {Array.from({ length: spokeCount }).map((_, idx) => {
              const deg = (idx * 360) / spokeCount;
              return (
                <rect
                  key={idx}
                  x={-gear.radius * 0.08}
                  y={-gear.radius * 0.66}
                  width={gear.radius * 0.16}
                  height={gear.radius * 1.32}
                  rx={3}
                  fill={fillGrad}
                  stroke="#080b10"
                  strokeWidth="1.6"
                  transform={`rotate(${deg})`}
                />
              );
            })}
          </>
        ) : (
          /* Style B: Machined Weight-Reduction Perforation Holes with Bevel Rims */
          Array.from({ length: holeCount }).map((_, idx) => {
            const a = (idx * Math.PI * 2) / holeCount;
            const hx = Math.cos(a) * holeRingR;
            const hy = Math.sin(a) * holeRingR;
            return (
              <g key={idx}>
                <circle
                  cx={hx}
                  cy={hy}
                  r={holeR}
                  fill="#06080c"
                  stroke="#05070a"
                  strokeWidth="2"
                />
                <circle
                  cx={hx}
                  cy={hy}
                  r={holeR + 1.5}
                  fill="none"
                  stroke="rgba(148,163,184,0.25)"
                  strokeWidth="1"
                />
              </g>
            );
          })
        )}

        {/* Stepped Machined Center Hub */}
        <circle
          cx="0"
          cy="0"
          r={gear.radius * 0.28}
          fill="url(#gearHubGrad)"
          stroke="#090c12"
          strokeWidth="2.5"
        />

        {/* Hex Bolts Around the Hub */}
        {[0, 60, 120, 180, 240, 300].map((bDeg) => {
          const br = gear.radius * 0.2;
          return (
            <circle
              key={bDeg}
              cx={Math.cos((bDeg * Math.PI) / 180) * br}
              cy={Math.sin((bDeg * Math.PI) / 180) * br}
              r={isSmallPinion ? '1.5' : '2.1'}
              fill="#94a3b8"
              stroke="#090c12"
              strokeWidth="1"
            />
          );
        })}

        {/* Center Axle Cap */}
        <circle
          cx="0"
          cy="0"
          r={gear.radius * 0.11}
          fill={gear.accent === 'bronze' ? '#b48a4e' : '#64748b'}
          stroke="#090c12"
          strokeWidth="2"
        />
      </g>
    );
  };

  return (
    <motion.div
      data-testid="safe-breach-stage"
      data-progress={kin.clampedProgress}
      initial={false}
      animate={{
        opacity: isExiting ? 0 : 1,
      }}
      transition={{ duration: 0.38, ease: 'easeOut' }}
      style={{
        backgroundColor: `rgba(9, 12, 18, ${(1 - kin.gearSplitProgress * 0.96).toFixed(3)})`,
      }}
      className="absolute inset-0 w-full h-full overflow-hidden select-none z-30 flex flex-col justify-between"
    >
      {/* ===================================================================== */}
      {/* MAIN INTERACTIVE VIEWPORT (HOLD TO ADVANCE, RELEASE TO REWIND)        */}
      {/* ===================================================================== */}
      <div
        data-testid="vault-hold-surface"
        onPointerDown={handleStagePointerDown}
        onMouseDown={handleStagePointerDown}
        onTouchStart={handleStagePointerDown}
        className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center cursor-pointer touch-none"
      >
        {/* =================================================================== */}
        {/* LAYER 3 (70% — 100%): NEON-RED LASER GRID OVER REAL FROSTED CARD    */}
        {/* =================================================================== */}
        <div
          data-testid="vault-layer-lasers"
          style={{
            transform: `scale(${kin.laserLayerScale})`,
            opacity: kin.laserLayerOpacity,
          }}
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {/* Neon-Red Security Laser Grid Guarding the Real Frosted Card Underneath */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {kin.lasers.map((laser) => {
              const isOff = laser.status === 'off';
              const isGlitching = laser.status === 'glitching';
              return (
                <div
                  key={laser.id}
                  data-testid={`laser-beam-${laser.id}`}
                  data-status={laser.status}
                  style={{
                    top: `${laser.yPercent}%`,
                    transform: `translateY(-50%) rotate(${laser.angleDeg}deg)`,
                  }}
                  className="absolute -left-10 -right-10 h-6 flex items-center justify-between"
                >
                  <div
                    className={`w-5 h-4 rounded-r-sm border border-black transition-colors ${
                      isOff ? 'bg-zinc-800' : 'bg-red-950 border-red-500/80'
                    }`}
                  />
                  <div
                    style={{
                      opacity: isOff ? 0 : isGlitching ? 0.42 : 1,
                      boxShadow: isOff
                        ? 'none'
                        : isGlitching
                        ? '0 0 18px #f87171, 0 0 36px #ef4444, 0 0 6px #ffffff'
                        : '0 0 12px #ef4444, 0 0 24px #dc2626, 0 0 4px #fecaca',
                    }}
                    className={`flex-1 h-[3px] transition-opacity duration-150 ${
                      isOff
                        ? 'scale-y-0'
                        : isGlitching
                        ? 'bg-white animate-pulse scale-y-125'
                        : 'bg-gradient-to-r from-red-500 via-rose-200 to-red-500'
                    }`}
                  />
                  <div
                    className={`w-5 h-4 rounded-l-sm border border-black transition-colors ${
                      isOff ? 'bg-zinc-800' : 'bg-red-950 border-red-500/80'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* =================================================================== */}
        {/* LAYER 2 (35% — 70%): DEEP MULTI-PLANE TEXTURED DARK-METAL GEARS     */}
        {/* =================================================================== */}
        <div
          data-testid="vault-layer-gears"
          style={{
            transform: `scale(${kin.gearLayerScale})`,
            opacity: kin.gearLayerOpacity,
          }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        >
          {/* Deep Vault Shaft Vignette (No dashed circles or extra containers) */}
          <div
            style={{
              opacity: 1 - kin.gearSplitProgress,
              backgroundImage:
                'radial-gradient(circle at 50% 50%, #161d29 0%, #0b0f17 62%, #05070b 100%)',
            }}
            className="absolute inset-0"
          />

          <svg
            viewBox="-200 -260 400 520"
            className="relative z-10 w-full h-full max-w-[420px] overflow-visible"
          >
            <defs>
              {/* Deep Shadowed Gunmetal for Background Plane */}
              <linearGradient id="gearBackDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e2533" />
                <stop offset="50%" stopColor="#131822" />
                <stop offset="100%" stopColor="#0a0d13" />
              </linearGradient>

              {/* Brushed Machined Steel for Midground Plane */}
              <linearGradient id="gearMachinedSteelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#526075" />
                <stop offset="28%" stopColor="#2e3848" />
                <stop offset="55%" stopColor="#1b222e" />
                <stop offset="82%" stopColor="#384457" />
                <stop offset="100%" stopColor="#141923" />
              </linearGradient>

              {/* Warm Gunmetal-Bronze Steel for Interlocking Gears */}
              <linearGradient id="gearBronzeSteelGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2b2623" />
                <stop offset="35%" stopColor="#5c4d3c" />
                <stop offset="55%" stopColor="#2c3340" />
                <stop offset="80%" stopColor="#736049" />
                <stop offset="100%" stopColor="#1a1f29" />
              </linearGradient>

              {/* Stepped Center Hub Gradient */}
              <radialGradient id="gearHubGrad" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="55%" stopColor="#27303f" />
                <stop offset="100%" stopColor="#0f141d" />
              </radialGradient>
            </defs>

            {/* Render Plane 1 (Back), Plane 2 (Mid), Plane 3 (Front) in depth order */}
            {kin.gears.filter((g) => g.plane === 'back').map(renderGearNode)}
            {kin.gears.filter((g) => g.plane === 'mid').map(renderGearNode)}
            {kin.gears.filter((g) => g.plane === 'front').map(renderGearNode)}
          </svg>
        </div>

        {/* =================================================================== */}
        {/* LAYER 1 (0% — 35%): GUNMETAL VAULT DOOR & 6-SPOKE SHIP WHEEL        */}
        {/* =================================================================== */}
        <div
          data-testid="vault-layer-outer-door"
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        >
          {/* LEFT GUNMETAL VAULT DOOR LEAF */}
          <div
            data-testid="titanium-door-left"
            style={{
              transform: `translateX(${-kin.doorSplitProgress * 112}%)`,
              backgroundImage:
                'linear-gradient(145deg, #252d3a 0%, #1a212c 48%, #11161f 100%)',
              boxShadow:
                'inset -1px 0 0 rgba(255,255,255,0.12), inset -6px 0 14px rgba(0,0,0,0.85), 16px 0 36px rgba(0,0,0,0.92)',
            }}
            className="relative w-1/2 h-full p-3.5 flex flex-col justify-between"
          >
            {/* Outer Recessed Door Slab Frame (Left Half of Reference Vault Door) */}
            <div
              style={{
                backgroundImage:
                  'linear-gradient(160deg, #1f2633 0%, #151b24 60%, #10151d 100%)',
                boxShadow:
                  'inset 2px 2px 1px rgba(203,213,225,0.18), inset 0 -3px 8px rgba(0,0,0,0.85), 0 0 0 2px #090c12',
              }}
              className="relative w-full h-full rounded-l-[22px] p-4 flex flex-col justify-between"
            >
              {/* Top-Left Machined Corner Bolt */}
              <div
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 35% 30%, #475569 0%, #1e2530 65%, #0b0e14 100%)',
                  boxShadow:
                    '0 3px 6px rgba(0,0,0,0.85), inset 0 1px 1px rgba(255,255,255,0.35)',
                }}
                className="w-6 h-6 rounded-full border border-[#090c12] flex items-center justify-center"
              >
                <div className="w-3 h-3 rounded-full border border-slate-400/25 bg-[#141922]" />
              </div>

              {/* Bottom-Left Machined Corner Bolt */}
              <div
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 35% 30%, #475569 0%, #1e2530 65%, #0b0e14 100%)',
                  boxShadow:
                    '0 3px 6px rgba(0,0,0,0.85), inset 0 1px 1px rgba(255,255,255,0.35)',
                }}
                className="w-6 h-6 rounded-full border border-[#090c12] flex items-center justify-center"
              >
                <div className="w-3 h-3 rounded-full border border-slate-400/25 bg-[#141922]" />
              </div>
            </div>
          </div>

          {/* RIGHT GUNMETAL VAULT DOOR LEAF */}
          <div
            data-testid="titanium-door-right"
            style={{
              transform: `translateX(${kin.doorSplitProgress * 112}%)`,
              backgroundImage:
                'linear-gradient(215deg, #252d3a 0%, #1a212c 48%, #11161f 100%)',
              boxShadow:
                'inset 1px 0 0 rgba(255,255,255,0.12), inset 6px 0 14px rgba(0,0,0,0.85), -16px 0 36px rgba(0,0,0,0.92)',
            }}
            className="relative w-1/2 h-full p-3.5 flex flex-col justify-between"
          >
            {/* Outer Recessed Door Slab Frame (Right Half of Reference Vault Door) */}
            <div
              style={{
                backgroundImage:
                  'linear-gradient(200deg, #1f2633 0%, #151b24 60%, #10151d 100%)',
                boxShadow:
                  'inset -1px 2px 1px rgba(203,213,225,0.14), inset 0 -3px 8px rgba(0,0,0,0.85), 0 0 0 2px #090c12',
              }}
              className="relative w-full h-full rounded-r-[22px] p-4 flex flex-col justify-between items-end"
            >
              {/* Top-Right Machined Corner Bolt */}
              <div
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 35% 30%, #475569 0%, #1e2530 65%, #0b0e14 100%)',
                  boxShadow:
                    '0 3px 6px rgba(0,0,0,0.85), inset 0 1px 1px rgba(255,255,255,0.35)',
                }}
                className="w-6 h-6 rounded-full border border-[#090c12] flex items-center justify-center"
              >
                <div className="w-3 h-3 rounded-full border border-slate-400/25 bg-[#141922]" />
              </div>

              {/* Bottom-Right Machined Corner Bolt */}
              <div
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 35% 30%, #475569 0%, #1e2530 65%, #0b0e14 100%)',
                  boxShadow:
                    '0 3px 6px rgba(0,0,0,0.85), inset 0 1px 1px rgba(255,255,255,0.35)',
                }}
                className="w-6 h-6 rounded-full border border-[#090c12] flex items-center justify-center"
              >
                <div className="w-3 h-3 rounded-full border border-slate-400/25 bg-[#141922]" />
              </div>
            </div>
          </div>

          {/* 6-SPOKE MACHINED STEEL VAULT WHEEL (MATCHING ATTACHED REFERENCE IMAGE) */}
          <div
            data-testid="titanium-vault-wheel"
            style={{
              transform: `translateX(${-kin.doorSplitProgress * 230}px) scale(${
                1 - kin.doorSplitProgress * 0.1
              })`,
              opacity: 1 - kin.doorSplitProgress,
            }}
            className="absolute z-20 flex items-center justify-center"
          >
            <svg
              viewBox="-140 -140 280 280"
              className="w-64 h-64 overflow-visible drop-shadow-[0_22px_32px_rgba(0,0,0,0.92)]"
            >
              <defs>
                {/* Cylindrical Steel Spoke Gradient */}
                <linearGradient id="spokeCylinderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0f141c" />
                  <stop offset="28%" stopColor="#475569" />
                  <stop offset="50%" stopColor="#94a3b8" />
                  <stop offset="75%" stopColor="#263040" />
                  <stop offset="100%" stopColor="#0b0f16" />
                </linearGradient>

                {/* Cylindrical Outer Grip Handle Gradient (Cool Machined Steel) */}
                <linearGradient id="handleSteelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#111620" />
                  <stop offset="22%" stopColor="#3b4758" />
                  <stop offset="48%" stopColor="#cbd5e1" />
                  <stop offset="76%" stopColor="#283242" />
                  <stop offset="100%" stopColor="#0c1017" />
                </linearGradient>

                {/* Warm Bronze-Tinted Bottom Handle Gradient (As in Reference Image) */}
                <linearGradient id="handleBronzeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1c1612" />
                  <stop offset="24%" stopColor="#6b533b" />
                  <stop offset="48%" stopColor="#e2c7a4" />
                  <stop offset="76%" stopColor="#4a3928" />
                  <stop offset="100%" stopColor="#14100d" />
                </linearGradient>

                {/* 3D Wheel Rim Torus Gradient */}
                <radialGradient id="wheelRimTorusGrad" cx="45%" cy="42%" r="58%">
                  <stop offset="68%" stopColor="#11161f" />
                  <stop offset="80%" stopColor="#64748b" />
                  <stop offset="87%" stopColor="#cbd5e1" />
                  <stop offset="94%" stopColor="#273142" />
                  <stop offset="100%" stopColor="#0b0e14" />
                </radialGradient>

                {/* Center Conical Brushed Hub Cap */}
                <linearGradient id="centerCapBevelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="35%" stopColor="#475569" />
                  <stop offset="65%" stopColor="#1e2633" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
              </defs>

              {/* Rotational Motion Blur Streaks & Warm Acceleration Arc (Visible when wheel spins) */}
              {kin.wheelSpinIntensity > 0.02 && (
                <g opacity={kin.wheelSpinIntensity}>
                  {/* Outer Motion Blur Halo */}
                  <circle
                    cx="0"
                    cy="0"
                    r="95"
                    fill="none"
                    stroke="rgba(251, 191, 36, 0.16)"
                    strokeWidth="16"
                    strokeDasharray="42 62"
                    transform={`rotate(${kin.wheelRotationDeg * 0.85})`}
                  />
                  <circle
                    cx="0"
                    cy="0"
                    r="88"
                    fill="none"
                    stroke="rgba(148, 163, 184, 0.18)"
                    strokeWidth="10"
                    strokeDasharray="55 45"
                    transform={`rotate(${-kin.wheelRotationDeg * 0.6})`}
                  />

                  {/* Curved Warm Amber Acceleration Arrow (Top-Left, like Reference #2) */}
                  <path
                    d="M -78 -68 A 104 104 0 0 1 -28 -100"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.85))' }}
                  />
                  <path
                    d="M -39 -106 L -26 -100 L -35 -89"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.85))' }}
                  />
                </g>
              )}

              {/* Deep Shadow Under Wheel */}
              <circle
                cx="4"
                cy="10"
                r="62"
                fill="none"
                stroke="rgba(0,0,0,0.65)"
                strokeWidth="16"
                style={{ filter: 'blur(6px)' }}
              />

              {/* Rotating 6-Spoke Ship-Style Vault Wheel */}
              <g transform={`rotate(${kin.wheelRotationDeg})`}>
                {/* 6 Radial Spokes + Cylindrical Outer Handles (0°, 60°, 120°, 180°, 240°, 300°) */}
                {[0, 60, 120, 180, 240, 300].map((angle) => {
                  const isBottomBronze = angle === 180;
                  return (
                    <g key={angle} transform={`rotate(${angle})`}>
                      {/* Inner Spoke Rod (Center to Rim) */}
                      <rect
                        x="-4.5"
                        y="-58"
                        width="9"
                        height="58"
                        rx="2"
                        fill="url(#spokeCylinderGrad)"
                        stroke="#090c12"
                        strokeWidth="1.2"
                      />

                      {/* Narrow Neck Collar Outside the Rim */}
                      <rect
                        x="-5.5"
                        y="-74"
                        width="11"
                        height="12"
                        rx="2"
                        fill={isBottomBronze ? 'url(#handleBronzeGrad)' : 'url(#spokeCylinderGrad)'}
                        stroke="#090c12"
                        strokeWidth="1.2"
                      />

                      {/* Collar Ring Groove */}
                      <line
                        x1="-5.5"
                        y1="-72"
                        x2="5.5"
                        y2="-72"
                        stroke="#cbd5e1"
                        strokeWidth="1"
                        strokeOpacity="0.6"
                      />

                      {/* Outer Turned Cylindrical Grip Handle */}
                      <rect
                        x="-8.5"
                        y="-108"
                        width="17"
                        height="35"
                        rx="4.5"
                        fill={isBottomBronze ? 'url(#handleBronzeGrad)' : 'url(#handleSteelGrad)'}
                        stroke="#090c12"
                        strokeWidth="1.5"
                      />

                      {/* Subtle Top Specular Cap on Handle End */}
                      <line
                        x1="-6"
                        y1="-105.5"
                        x2="6"
                        y2="-105.5"
                        stroke="rgba(255,255,255,0.45)"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })}

                {/* Main 3D Beveled Steel Wheel Ring */}
                <circle
                  cx="0"
                  cy="0"
                  r="58"
                  fill="none"
                  stroke="#090c12"
                  strokeWidth="16"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="58"
                  fill="none"
                  stroke="url(#wheelRimTorusGrad)"
                  strokeWidth="13"
                />
                {/* Inner & Outer Specular Rim Highlights */}
                <circle
                  cx="0"
                  cy="0"
                  r="63.5"
                  fill="none"
                  stroke="rgba(226,232,240,0.32)"
                  strokeWidth="1"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="52.5"
                  fill="none"
                  stroke="rgba(226,232,240,0.25)"
                  strokeWidth="1"
                />

                {/* Top Index Notch on Wheel Ring (Matches Reference) */}
                <circle
                  cx="0"
                  cy="-58"
                  r="2"
                  fill="#090c12"
                  stroke="#cbd5e1"
                  strokeWidth="0.8"
                />

                {/* Center Brushed Steel Hub Cap */}
                <circle
                  cx="0"
                  cy="0"
                  r="22"
                  fill="#0f141d"
                  stroke="#080b10"
                  strokeWidth="3"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="19"
                  fill="url(#centerCapBevelGrad)"
                  stroke="rgba(226,232,240,0.4)"
                  strokeWidth="1"
                />
                {/* Diagonal Specular Sheen Across Center Cap */}
                <line
                  x1="-12"
                  y1="-12"
                  x2="12"
                  y2="12"
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </g>
            </svg>
          </div>
        </div>

        {/* Full-screen HTML5 Canvas for Sparks & Cryo Mist */}
        <canvas
          ref={fxCanvasRef}
          data-testid="vault-fx-canvas"
          className="pointer-events-none absolute inset-0 w-full h-full z-30"
        />
      </div>
    </motion.div>
  );
};

export default SafeBreachStage;
