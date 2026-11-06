import React, { ReactNode, useEffect, useState } from 'react';
import { Wifi, Signal } from 'lucide-react';
import { DynamicIsland } from './DynamicIsland';
import { LiveWallpaper } from './LiveWallpaper';
import { vibrate, playTapSound } from '../utils/haptics';
import { getUtc7TimeSnapshot } from '../utils/timeZoneUtils';

interface PhoneShellProps {
  children: ReactNode;
  activeApp: string | null;
  onHomePress: () => void;
  showDynamicIsland?: boolean;
}

export const PhoneShell: React.FC<PhoneShellProps> = ({
  children,
  activeApp,
  onHomePress,
  showDynamicIsland = true,
}) => {
  const gesture = React.useRef<{ id: number; x: number; y: number; time: number } | null>(null);
  const lastSwipeTime = React.useRef(0);
  const [utc7Time, setUtc7Time] = useState(() => getUtc7TimeSnapshot().hm);

  useEffect(() => {
    const interval = setInterval(() => {
      setUtc7Time(getUtc7TimeSnapshot().hm);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleIndicatorPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== undefined && e.button !== 0) return;
    gesture.current = { id: e.pointerId ?? 0, x: e.clientX, y: e.clientY, time: Date.now() };
    try {
      if (e.currentTarget.setPointerCapture && e.pointerId !== undefined) {
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    } catch {}
  };

  const handleIndicatorPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = gesture.current;
    if (!start) return;
    gesture.current = null;
    const dy = start.y - e.clientY;
    const dx = Math.abs(start.x - e.clientX);
    const velocity = dy / Math.max(1, Date.now() - start.time);
    if (Math.max(Math.abs(dy), dx) > 8) lastSwipeTime.current = Date.now();
    if (dy > dx && (dy > 25 || (dy > 15 && velocity > 0.25)) && activeApp) {
      vibrate(25);
      playTapSound(420, 0.04);
      onHomePress();
    }
    try {
      if (e.currentTarget.hasPointerCapture && e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
  };

  const handleIndicatorTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches && e.touches.length > 0) {
      const t = e.touches[0];
      gesture.current = { id: t.identifier, x: t.clientX, y: t.clientY, time: Date.now() };
    }
  };

  const handleIndicatorTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const start = gesture.current;
    if (!start) return;
    gesture.current = null;
    const t = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]);
    if (!t) return;
    const dy = start.y - t.clientY;
    const dx = Math.abs(start.x - t.clientX);
    const velocity = dy / Math.max(1, Date.now() - start.time);
    if (Math.max(Math.abs(dy), dx) > 8) lastSwipeTime.current = Date.now();
    if (dy > dx && (dy > 25 || (dy > 15 && velocity > 0.25)) && activeApp) {
      vibrate(25);
      playTapSound(420, 0.04);
      onHomePress();
    }
  };

  const handleIndicatorPointerCancel = () => {
    if (gesture.current) lastSwipeTime.current = Date.now();
    gesture.current = null;
  };

  const handleIndicatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (Date.now() - lastSwipeTime.current < 400) return;
    if (activeApp) {
      vibrate(25);
      playTapSound(420, 0.04);
      onHomePress();
    }
  };

  return (
    <div className="phone-stage w-full h-[100dvh] sm:p-6 flex items-center justify-center bg-[#010103] overflow-hidden select-none">
      {/* Outer ambient desktop glow */}
      <div className="absolute w-[540px] h-[860px] rounded-full bg-gradient-to-tr from-rose-950/20 via-sky-950/15 to-purple-950/20 blur-3xl pointer-events-none" />

      {/* iOS Device Chassis: Authentic iPhone 16 Pro frame */}
      <div
        data-testid="phone-chassis"
        className="w-full h-full rounded-none border-0 sm:w-[430px] sm:h-[min(932px,calc(100dvh-48px))] sm:rounded-[56px] sm:border-[10px] sm:border-[#232328] sm:ring-1 sm:ring-white/10 sm:shadow-[0_25px_80px_rgba(0,0,0,0.9)] mx-auto relative overflow-hidden bg-[#000000] flex flex-col justify-between"
      >
        {/* Global Live Canvas Wallpaper (active on SpringBoard & LockScreen, unmounted during full-screen apps) */}
        {!activeApp && <LiveWallpaper />}

        {/* Authentic iOS Status Bar with Centered Dynamic Island on the Same Line */}
        <div
          data-testid="status-bar"
          className="relative z-50 w-full h-[44px] px-6 flex items-center justify-between text-white font-sans shrink-0"
        >
          {/* Left Time (UTC+7 / MSK+4) */}
          <span
            data-testid="status-bar-time"
            className="font-semibold text-[14px] tracking-tight text-white/95 drop-shadow-sm font-sans w-[74px]"
          >
            {utc7Time}
          </span>

          {/* Center Dynamic Island on the exact same horizontal line */}
          {showDynamicIsland && <DynamicIsland />}

          {/* Right Status Icons: Cellular, Wifi, Battery */}
          <div className="flex items-center justify-end gap-1.5 w-[74px]">
            <Signal className="w-3.5 h-3.5 text-white/90 shrink-0" />
            <Wifi className="w-3.5 h-3.5 text-white/90 shrink-0" />

            {/* iOS Battery Icon with inside fill */}
            <div className="flex items-center gap-1 shrink-0">
              <div className="w-6 h-3 rounded-[4px] border border-white/60 p-[1.5px] flex items-center relative">
                <div className="h-full w-[92%] bg-emerald-400 rounded-[2px]" />
                <div className="w-[1.5px] h-1.5 bg-white/60 absolute -right-[3px] top-1/2 -translate-y-1/2 rounded-r-[1px]" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Viewport Content Area */}
        <div
          className={`relative z-20 flex-1 min-h-0 w-full overflow-hidden flex flex-col ${
            activeApp ? 'pb-0' : 'pb-8'
          }`}
        >
          {children}
        </div>

        {/* Single Persistent iOS Home Indicator Bar with interactive swipe gesture */}
        <div
          id="ios-home-indicator"
          onPointerDown={handleIndicatorPointerDown}
          onPointerUp={handleIndicatorPointerUp}
          onPointerCancel={handleIndicatorPointerCancel}
          onLostPointerCapture={handleIndicatorPointerCancel}
          onTouchStart={handleIndicatorTouchStart}
          onTouchEnd={handleIndicatorTouchEnd}
          onClick={handleIndicatorClick}
          aria-label="Закрыть приложение и вернуться на рабочий стол"
          className="absolute bottom-0 left-0 right-0 h-8 z-50 pointer-events-auto touch-none flex items-center justify-center cursor-pointer group active:opacity-60"
        >
          <div
            className={`w-36 h-1.5 rounded-full transition-all duration-300 pointer-events-none ${
              activeApp
                ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.85)] group-active:scale-x-90'
                : 'bg-white/40'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
