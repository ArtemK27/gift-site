import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ScreenType, AppId } from './types';
import { PhoneShell } from './components/PhoneShell';
import { BaitScreen } from './components/screens/BaitScreen';
import { LockScreen } from './components/screens/LockScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { MessengerApp } from './components/apps/MessengerApp';
import { SafeApp } from './components/apps/SafeApp';
import { NotesApp } from './components/apps/NotesApp';
import { GalleryApp } from './components/apps/GalleryApp';
import { requestFullscreenMode, vibrate, playTapSound } from './utils/haptics';

// iOS App Window Wrapper with physical drag-to-dismiss gesture
const AppWindow: React.FC<{
  children: React.ReactNode;
  onDismiss: () => void;
}> = ({ children, onDismiss }) => {
  const touchStartY = React.useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    // Swiped up or down past threshold
    if (Math.abs(diffY) > 20) {
      vibrate(25);
      playTapSound(400, 0.04);
      onDismiss();
    }
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.25, bottom: 0.25 }}
      onDragEnd={(_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
        if (Math.abs(info.offset.y) > 50 || Math.abs(info.velocity.y) > 200) {
          vibrate(25);
          playTapSound(380, 0.05);
          onDismiss();
        }
      }}
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 380,
        damping: 32,
        mass: 0.85,
      }}
      className="absolute inset-0 w-full h-full z-40 bg-[#000000] overflow-hidden shadow-2xl flex flex-col"
    >
      <div className="flex-1 w-full h-full overflow-hidden flex flex-col">
        {children}
      </div>

      {/* Interactive Bottom Pull Bar to Swipe Up */}
      <button
        id="dismiss-app-bar"
        aria-label="Закрыть приложение"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          e.stopPropagation();
          vibrate(25);
          playTapSound(400, 0.04);
          onDismiss();
        }}
        className="w-full pt-1.5 pb-2.5 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center cursor-pointer border-t border-white/10 active:opacity-60 z-50 select-none outline-none border-0"
      >
        <span className="text-[9px] font-mono tracking-wider text-white/50 mb-1 uppercase pointer-events-none">
          Потяните вверх для выхода
        </span>
        <div className="w-36 h-1.5 bg-white/80 rounded-full pointer-events-none" />
      </button>
    </motion.div>
  );
};

export const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenType>('bait');
  const [activeApp, setActiveApp] = useState<AppId>(null);

  // Trigger fullscreen & initial audio context on first touch
  useEffect(() => {
    const handleFirstTouch = () => {
      requestFullscreenMode();
      window.removeEventListener('pointerdown', handleFirstTouch);
    };
    window.addEventListener('pointerdown', handleFirstTouch, { once: true });
    return () => window.removeEventListener('pointerdown', handleFirstTouch);
  }, []);

  const handleUnlockStart = () => {
    setScreen('lock');
  };

  const handleUnlockPhone = () => {
    setScreen('home');
  };

  const handleOpenNotification = (targetApp: string) => {
    setScreen('home');
    if (targetApp === 'messenger') {
      setActiveApp('messenger');
    } else if (targetApp === 'safe') {
      setActiveApp('safe');
    } else if (targetApp === 'notes') {
      setActiveApp('notes');
    } else if (targetApp === 'gallery') {
      setActiveApp('gallery');
    }
  };

  const handleOpenApp = (appId: AppId) => {
    setActiveApp(appId);
  };

  const handleCloseApp = () => {
    setActiveApp(null);
  };

  // If on BaitScreen, render full cozy card experience
  if (screen === 'bait') {
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center bg-[#010103] overflow-hidden select-none">
        <div className="w-full max-w-[430px] h-[100dvh] mx-auto relative overflow-hidden bg-[#000000] sm:rounded-[56px] sm:border-[10px] sm:border-[#232328] sm:ring-1 sm:ring-white/10 sm:shadow-[0_25px_80px_rgba(0,0,0,0.9)]">
          <BaitScreen onUnlockStart={handleUnlockStart} />
        </div>
      </div>
    );
  }

  // OS Interface (LockScreen & HomeScreen & Apps)
  return (
    <PhoneShell
      activeApp={activeApp}
      onHomePress={handleCloseApp}
      showDynamicIsland={true}
    >
      <div className="relative w-full h-full overflow-hidden">
        <AnimatePresence mode="wait">
          {screen === 'lock' && (
            <motion.div
              key="lock-screen"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -70 }}
              transition={{
                type: 'spring',
                stiffness: 340,
                damping: 28,
              }}
              className="absolute inset-0 w-full h-full"
            >
              <LockScreen
                onUnlock={handleUnlockPhone}
                onOpenNotification={handleOpenNotification}
              />
            </motion.div>
          )}

          {screen === 'home' && (
            <motion.div
              key="home-screen"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 340,
                damping: 28,
              }}
              className="absolute inset-0 w-full h-full"
            >
              <HomeScreen onOpenApp={handleOpenApp} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating App Windows with iOS Swipe-Up Gesture */}
        <AnimatePresence>
          {activeApp && (
            <AppWindow key={`app-window-${activeApp}`} onDismiss={handleCloseApp}>
              {activeApp === 'messenger' && (
                <MessengerApp onBack={handleCloseApp} />
              )}
              {activeApp === 'safe' && (
                <SafeApp onBack={handleCloseApp} />
              )}
              {activeApp === 'notes' && (
                <NotesApp onBack={handleCloseApp} />
              )}
              {activeApp === 'gallery' && (
                <GalleryApp onBack={handleCloseApp} />
              )}
            </AppWindow>
          )}
        </AnimatePresence>
      </div>
    </PhoneShell>
  );
};
