import React from 'react';
import { motion } from 'framer-motion';
import { AppId } from '../../types';
import { DOCK_APPS } from './homeAppsData';
import { AppIcon } from './AppIcon';
import { vibrate, playTapSound } from '../../utils/haptics';

interface HomeDockProps {
  onOpenApp: (appId: AppId) => void;
}

export const HomeDock: React.FC<HomeDockProps> = ({ onOpenApp }) => {
  const handleLaunch = (appId: AppId) => {
    vibrate(25);
    playTapSound(520, 0.05);
    onOpenApp(appId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="w-full max-w-[360px] mx-auto p-3 rounded-[34px] bg-white/[0.14] border border-white/20 backdrop-blur-3xl shadow-[0_16px_40px_rgba(0,0,0,0.55)] flex items-center justify-around select-none"
    >
      {DOCK_APPS.map((app) => (
        <AppIcon
          key={`dock-${app.id}`}
          name={app.name}
          icon={app.icon}
          bg={app.bg}
          size="dock"
          onClick={() => handleLaunch(app.id as AppId)}
        />
      ))}
    </motion.div>
  );
};
