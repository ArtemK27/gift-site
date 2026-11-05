import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScreenType, AppId } from './types';
import { PhoneShell } from './components/PhoneShell';
import { BaitScreen } from './components/screens/BaitScreen';
import { LockScreen } from './components/screens/LockScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { MessengerApp } from './components/apps/MessengerApp';
import { SafeApp } from './components/apps/SafeApp';
import { NotesApp } from './components/apps/NotesApp';
import { GalleryApp } from './components/apps/GalleryApp';
import { SettingsApp } from './components/apps/SettingsApp';
import { ClockApp } from './components/apps/ClockApp';
import { WeatherApp } from './components/apps/WeatherApp';
import { SettingsProvider } from './context/SettingsContext';
import { AudioProvider } from './context/AudioContext';
import { MessengerProvider, useMessenger } from './context/MessengerContext';
import { primeAudioContext } from './utils/haptics';

// iOS App Window Wrapper with iOS 18 spring physics
const AppWindow: React.FC<{
  children: React.ReactNode;
  onDismiss: () => void;
}> = ({ children }) => {
  return (
    <motion.div
      initial={{ scale: 0.88, opacity: 0, y: 24, borderRadius: 36 }}
      animate={{ scale: 1, opacity: 1, y: 0, borderRadius: 0 }}
      exit={{ scale: 0.84, opacity: 0, y: -24, borderRadius: 44 }}
      transition={{
        type: 'spring',
        stiffness: 320,
        damping: 28,
        mass: 0.75,
      }}
      className="absolute inset-0 w-full h-full z-40 bg-[#000000] overflow-hidden shadow-2xl flex flex-col will-change-transform"
    >
      <div className="flex-1 w-full h-full overflow-hidden flex flex-col">
        {children}
      </div>
    </motion.div>
  );
};

const MainAppContent: React.FC = () => {
  const [screen, setScreen] = useState<ScreenType>('bait');
  const [activeApp, setActiveApp] = useState<AppId>(null);
  const { openThread } = useMessenger();

  // Prime Web Audio API on first user interaction
  useEffect(() => {
    const handleFirstTouch = () => {
      primeAudioContext();
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
    if (
      targetApp === 'messenger' ||
      targetApp === 'safe' ||
      targetApp === 'notes' ||
      targetApp === 'gallery' ||
      targetApp === 'settings' ||
      targetApp === 'clock' ||
      targetApp === 'weather'
    ) {
      setActiveApp(targetApp as AppId);
    }
  };

  const handleOpenApp = (appId: AppId) => {
    setActiveApp(appId);
  };

  const handleCloseApp = () => {
    if (activeApp === 'messenger') openThread(null);
    setActiveApp(null);
  };

  // If on BaitScreen, render full cozy card experience with responsive chassis
  if (screen === 'bait') {
    return (
      <div className="w-full h-[100dvh] sm:p-6 flex items-center justify-center bg-[#010103] overflow-hidden select-none">
        {/* Outer ambient desktop glow */}
        <div className="hidden sm:block absolute w-[540px] h-[860px] rounded-full bg-gradient-to-tr from-rose-950/20 via-sky-950/15 to-purple-950/20 blur-3xl pointer-events-none" />

        <div className="w-full h-[100dvh] rounded-none border-0 sm:w-[430px] sm:h-[min(932px,calc(100dvh-48px))] sm:rounded-[56px] sm:border-[10px] sm:border-[#232328] sm:ring-1 sm:ring-white/10 sm:shadow-[0_25px_80px_rgba(0,0,0,0.9)] mx-auto relative overflow-hidden bg-[#000000]">
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
              {activeApp === 'settings' && (
                <SettingsApp onBack={handleCloseApp} />
              )}
              {activeApp === 'clock' && (
                <ClockApp onBack={handleCloseApp} />
              )}
              {activeApp === 'weather' && (
                <WeatherApp onBack={handleCloseApp} />
              )}
            </AppWindow>
          )}
        </AnimatePresence>
      </div>
    </PhoneShell>
  );
};

export const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AudioProvider>
        <MessengerProvider>
          <MainAppContent />
        </MessengerProvider>
      </AudioProvider>
    </SettingsProvider>
  );
};
