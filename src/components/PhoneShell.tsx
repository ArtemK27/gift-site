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
  return (
    <div className="w-full h-[100dvh] flex items-center justify-center bg-[#010103] overflow-hidden select-none">
      {/* Outer ambient desktop glow */}
      <div className="absolute w-[540px] h-[860px] rounded-full bg-gradient-to-tr from-rose-950/20 via-sky-950/15 to-purple-950/20 blur-3xl pointer-events-none" />

      {/* iOS Device Chassis: Authentic iPhone 16 Pro frame */}
      <div className="w-full max-w-[430px] h-[100dvh] mx-auto relative overflow-hidden bg-[#000000] sm:rounded-[56px] sm:border-[10px] sm:border-[#232328] sm:ring-1 sm:ring-white/10 sm:shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_15px_rgba(255,255,255,0.05)] flex flex-col justify-between">
        
        {/* Subtle speaker ear grill at the very top bezel */}
        <div className="hidden sm:block absolute top-2.5 left-1/2 -translate-x-1/2 w-14 h-1 bg-zinc-800 rounded-full z-50 pointer-events-none" />

        {/* Global Live Canvas Wallpaper */}
        <LiveWallpaper />

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
        <div className="relative z-20 flex-1 w-full overflow-hidden flex flex-col">
          {children}
        </div>

        {/* iOS Home Indicator Bar with interactive swipe gesture */}
        <div
          id="ios-home-indicator"
          onClick={(e) => {
            e.stopPropagation();
            if (activeApp) {
              vibrate(25);
              playTapSound(420, 0.04);
              onHomePress();
            }
          }}
          className="relative z-50 w-full pb-3 pt-2.5 flex flex-col items-center justify-center cursor-pointer group active:opacity-50"
        >
          <div
            className={`w-36 h-1.5 rounded-full transition-all duration-200 ${
              activeApp
                ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] group-active:scale-x-90'
                : 'bg-white/40'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
