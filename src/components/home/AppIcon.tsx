import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface AppIconProps {
  name: string;
  icon: LucideIcon;
  badge?: string;
  bg: string;
  iconColor?: string;
  onClick: () => void;
  delay?: number;
  size?: 'normal' | 'dock';
}

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  icon: Icon,
  badge,
  bg,
  iconColor = 'text-white',
  onClick,
  delay = 0,
  size = 'normal',
}) => {
  if (size === 'dock') {
    return (
      <motion.div
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.88 }}
        onClick={onClick}
        aria-label={name}
        className="relative cursor-pointer select-none"
      >
        <div
          className={`w-[54px] h-[54px] rounded-[16px] ${bg} flex items-center justify-center ${iconColor} border border-white/25 shadow-md`}
        >
          <Icon className="w-6 h-6 stroke-[2.2]" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 380,
        damping: 24,
        delay,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.90 }}
      onClick={onClick}
      aria-label={name}
      className="flex flex-col items-center gap-1.5 cursor-pointer group select-none"
    >
      {/* Apple Squircle Icon */}
      <div
        className={`relative w-[60px] h-[60px] rounded-[18px] ${bg} flex items-center justify-center ${iconColor} border border-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-transform`}
      >
        <Icon className="w-7 h-7 stroke-[2.2] group-hover:scale-105 transition-transform" />
        {badge && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold font-sans flex items-center justify-center border-2 border-[#1c1c1e] shadow-sm pointer-events-none">
            {badge}
          </span>
        )}
      </div>

      {/* App Title */}
      <span className="text-[11px] font-medium text-white/95 tracking-tight text-center truncate w-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        {name}
      </span>
    </motion.div>
  );
};
