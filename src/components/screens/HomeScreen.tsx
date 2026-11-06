import React, { useState, useRef, useEffect } from 'react';
import {
  motion,
  PanInfo,
  AnimatePresence,
  useMotionValue,
  animate,
  useReducedMotion,
} from 'framer-motion';
import { AppId } from '../../types';
import { vibrate, playTapSound } from '../../utils/haptics';
import { PAGE_0_APPS, PAGE_1_APPS } from '../home/homeAppsData';
import { AppIcon, USE_LEGACY_APP_ICONS } from '../home/AppIcon';
import { Page0Widgets, Page1Widgets } from '../home/HomeWidgets';
import { useMessenger } from '../../context/MessengerContext';

interface HomeScreenProps {
  onOpenApp: (app: AppId) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenApp }) => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const panStartX = useRef(0);
  const reducedMotion = useReducedMotion();
  const { unreadCount } = useMessenger();

  const settlePage = (page: number) => {
    const width = viewportRef.current?.clientWidth ?? 0;
    return animate(
      x,
      -page * width,
      reducedMotion
        ? { duration: 0 }
        : { type: 'spring', stiffness: 320, damping: 30, mass: 1 }
    );
  };

  const pageRef = useRef(currentPage);
  pageRef.current = currentPage;
  useEffect(() => {
    let previousWidth = viewportRef.current?.clientWidth ?? 0;
    const observer = new ResizeObserver(() => {
      const width = viewportRef.current?.clientWidth ?? 0;
      if (width === previousWidth) return;
      previousWidth = width;
      x.stop();
      x.set(-pageRef.current * width);
    });
    if (viewportRef.current) observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, [x]);

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const nextPage =
      currentPage === 0 && (info.offset.x < -45 || info.velocity.x < -250)
        ? 1
        : currentPage === 1 && (info.offset.x > 45 || info.velocity.x > 250)
        ? 0
        : currentPage;
    if (nextPage !== currentPage) {
      setCurrentPage(nextPage);
      vibrate(15);
      playTapSound(480, 0.03);
    }
    settlePage(nextPage);
  };

  const handleLaunch = (appId: AppId | 'console') => {
    if (appId === 'console') {
      vibrate([25, 50, 25]);
      playTapSound(320, 0.04);
      setToastMessage('ROOT PRIVILEGES: GRANTED 🔪');
      setTimeout(() => setToastMessage(null), 2400);
      return;
    }
    vibrate(25);
    playTapSound(520, 0.05);
    onOpenApp(appId);
  };

  const handleDotClick = (pageIndex: number) => {
    if (currentPage !== pageIndex) {
      vibrate(15);
      playTapSound(450, 0.03);
      setCurrentPage(pageIndex);
      settlePage(pageIndex);
    }
  };

  const resolveBadge = (appId: AppId | 'console', legacyBadge?: string) => {
    if (USE_LEGACY_APP_ICONS) return legacyBadge;
    if (appId === 'messenger') {
      return unreadCount > 0 ? String(unreadCount) : undefined;
    }
    return undefined;
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between pt-3 pb-3 select-none z-10 overflow-hidden font-sans">
      {/* Horizontal Draggable SpringBoard Pages */}
      <div
        ref={viewportRef}
        className="relative flex-1 min-h-0 w-full overflow-hidden flex flex-col"
      >
        <motion.div
          data-testid="home-pages"
          style={{ x }}
          onPanStart={(_, info) => {
            x.stop();
            panStartX.current = x.get() - info.offset.x;
          }}
          onPan={(_, info) => {
            const width = viewportRef.current?.clientWidth ?? 0;
            const nextX = panStartX.current + info.offset.x;
            x.set(
              nextX > 0
                ? nextX * 0.2
                : nextX < -width
                ? -width + (nextX + width) * 0.2
                : nextX
            );
          }}
          onPanEnd={handleDragEnd}
          className="flex w-full h-full touch-pan-y"
        >
          {/* Page 0: Main / Quest */}
          <div className="w-full h-full shrink-0 flex flex-col justify-between px-6">
            <Page0Widgets onOpenApp={onOpenApp} />
            <div className="grid grid-cols-4 gap-4 py-4 px-1">
              {PAGE_0_APPS.map((app, idx) => (
                <AppIcon
                  key={app.id}
                  id={app.id}
                  name={app.name}
                  icon={app.icon}
                  badge={resolveBadge(app.id, app.legacyBadge)}
                  bg={app.bg}
                  iconColor={app.iconColor}
                  delay={idx * 0.04}
                  onClick={() => handleLaunch(app.id)}
                />
              ))}
            </div>
          </div>

          {/* Page 1: Companion Apps & Frog Clicker Widget */}
          <div className="w-full h-full shrink-0 flex flex-col justify-between px-6">
            <Page1Widgets onOpenApp={onOpenApp} />
            <div className="grid grid-cols-4 gap-4 py-4 px-1">
              {PAGE_1_APPS.map((app, idx) => (
                <AppIcon
                  key={app.id}
                  id={app.id}
                  name={app.name}
                  icon={app.icon}
                  badge={resolveBadge(app.id, app.legacyBadge)}
                  bg={app.bg}
                  iconColor={app.iconColor}
                  delay={idx * 0.04}
                  onClick={() => handleLaunch(app.id)}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Synchronized interactive iOS pagination dots */}
      <div className="flex items-center justify-center gap-2 py-2">
        {[0, 1].map((idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleDotClick(idx)}
            aria-label={`Страница ${idx + 1}`}
            aria-current={currentPage === idx ? 'page' : undefined}
            className={`rounded-full transition-all duration-200 cursor-pointer ${
              currentPage === idx
                ? 'w-2 h-2 bg-white shadow-sm'
                : 'w-1.5 h-1.5 bg-white/35 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Easter Egg Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-12 left-6 right-6 z-50 p-2.5 rounded-2xl bg-zinc-900/95 border border-emerald-500/40 text-emerald-400 text-xs font-mono text-center shadow-2xl backdrop-blur-md pointer-events-none"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
