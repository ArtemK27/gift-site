import React, { ReactNode } from 'react';
import { Wifi, Signal } from 'lucide-react';
import { DynamicIsland } from './DynamicIsland';
import { LiveWallpaper } from './LiveWallpaper';
import { vibrate, playTapSound } from '../utils/haptics';

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
  const touchStartY = React.useRef(0);
  const touchStartTime = React.useRef(0);
  const lastSwipeTime = React.useRef(0);

  const handleIndicatorTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleIndicatorTouchEnd = (e: React.TouchEvent) => {
    const deltaY = touchStartY.current - e.changedTouches[0].clientY; // positive = upward
    const deltaTime = Date.now() - touchStartTime.current;
    const velocity = deltaY / Math.max(1, deltaTime);

    if (deltaY > 25 || (deltaY > 15 && velocity > 0.25)) {
      lastSwipeTime.current = Date.now();
      if (activeApp) {
        vibrate(25);
        playTapSound(420, 0.04);
        onHomePress();
      }
    }
  };

  const handleIndicatorPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') {
      touchStartY.current = e.clientY;
      touchStartTime.current = Date.now();
    }
  };

  const handleIndicatorPointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') {
      const deltaY = touchStartY.current - e.clientY;
      if (deltaY > 25) {
        lastSwipeTime.current = Date.now();
        if (activeApp) {
          vibrate(25);
          playTapSound(420, 0.04);
          onHomePress();
        }
      }
    }
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
    <div className="w-full h-[100dvh] sm:p-6 flex items-center justify-center bg-[#010103] overflow-hidden select-none">
      {/* Outer ambient desktop glow */}
      <div className="absolute w-[540px] h-[860px] rounded-full bg-gradient-to-tr from-rose-950/20 via-sky-950/15 to-purple-950/20 blur-3xl pointer-events-none" />

      {/* iOS Device Chassis: Authentic iPhone 16 Pro frame */}
      <div className="w-full h-[100dvh] rounded-none border-0 sm:w-[430px] sm:h-[min(932px,calc(100dvh-48px))] sm:rounded-[56px] sm:border-[10px] sm:border-[#232328] sm:ring-1 sm:ring-white/10 sm:shadow-[0_25px_80px_rgba(0,0,0,0.9)] mx-auto relative overflow-hidden bg-[#000000] flex flex-col justify-between">
        
        {/* Subtle speaker ear grill at the very top bezel */}
        <div className="hidden sm:block absolute top-2.5 left-1/2 -translate-x-1/2 w-14 h-1 bg-zinc-800 rounded-full z-50 pointer-events-none" />

        {/* Global Live Canvas Wallpaper (active on SpringBoard & LockScreen, unmounted during full-screen apps) */}
        {!activeApp && <LiveWallpaper />}

        {/* Authentic iOS Status Bar */}
        <div className="relative z-40 w-full pt-3.5 px-7 flex items-center justify-between text-white font-sans">
          {/* Left Time */}
          <span className="font-semibold text-[14px] tracking-tight text-white/95 drop-shadow-sm font-sans">
            23:59
          </span>

          {/* Right Status Icons: Cellular, Wifi, Battery */}
          <div className="flex items-center gap-2">
            <Signal className="w-4 h-4 text-white/90" />
            <Wifi className="w-4 h-4 text-white/90" />
            
            {/* iOS Battery Icon with inside fill */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold tracking-tight text-white/90 font-mono">
                99%
              </span>
              <div className="w-6 h-3 rounded-[4px] border border-white/60 p-[1.5px] flex items-center relative">
                <div className="h-full w-[92%] bg-emerald-400 rounded-[2px]" />
                <div className="w-[1.5px] h-1.5 bg-white/60 absolute -right-[3px] top-1/2 -translate-y-1/2 rounded-r-[1px]" />
              </div>
            </div>
          </div>
        </div>

        {/* Global Dynamic Island Cutout */}
        {showDynamicIsland && <DynamicIsland />}

        {/* Main Viewport Content Area */}
        <div className="relative z-20 flex-1 min-h-0 w-full overflow-hidden flex flex-col pb-8">
          {children}
        </div>

        {/* Single Persistent iOS Home Indicator Bar with interactive swipe gesture */}
        <div
          id="ios-home-indicator"
          onTouchStart={handleIndicatorTouchStart}
          onTouchEnd={handleIndicatorTouchEnd}
          onPointerDown={handleIndicatorPointerDown}
          onPointerUp={handleIndicatorPointerUp}
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
