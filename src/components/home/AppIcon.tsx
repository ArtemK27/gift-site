import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { CustomAppIconSvg, CustomIconId } from './CustomAppIcons';

/**
 * Set to `true` to revert to the legacy flat gradient + Lucide icon style in one line.
 */
export const USE_LEGACY_APP_ICONS = false;

export interface AppIconProps {
  id?: CustomIconId;
  name: string;
  icon: LucideIcon;
  badge?: string;
  bg: string;
  iconColor?: string;
  onClick: () => void;
  delay?: number;
  size?: 'normal' | 'dock';
}

/**
 * Preserved legacy icon component (flat Tailwind gradient + Lucide outline icon).
 */
export const LegacyAppIcon: React.FC<AppIconProps> = ({
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
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label={name}
      className="flex flex-col items-center gap-1.5 cursor-pointer group select-none"
    >
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

      <span className="text-[11px] font-medium text-white/95 tracking-tight text-center truncate w-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        {name}
      </span>
    </motion.div>
  );
};

export const AppIcon: React.FC<AppIconProps> = (props) => {
  if (USE_LEGACY_APP_ICONS || !props.id) {
    return <LegacyAppIcon {...props} />;
  }

  const { id, name, badge, onClick, delay = 0, size = 'normal' } = props;

  if (size === 'dock') {
    return (
      <motion.div
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.88 }}
        onClick={onClick}
        aria-label={name}
        className="relative cursor-pointer select-none"
      >
        <div className="w-[54px] h-[54px] rounded-[16px] overflow-hidden ring-1 ring-white/15 shadow-[0_6px_16px_rgba(0,0,0,0.45)]">
          <CustomAppIconSvg id={id} />
        </div>
        {badge && (
          <span
            data-testid={`app-badge-${id}`}
            className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-[#ff3b30] text-white text-[11px] font-bold font-sans flex items-center justify-center border-2 border-[#0b0c10] shadow-md pointer-events-none"
          >
            {badge}
          </span>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.84 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 380,
        damping: 24,
        delay,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label={name}
      className="flex flex-col items-center gap-1.5 cursor-pointer group select-none"
    >
      {/* Detailed Illustrative iOS Squircle Icon */}
      <div className="relative w-[60px] h-[60px] rounded-[16px] transition-transform">
        <div className="w-full h-full rounded-[16px] overflow-hidden ring-1 ring-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.5)] group-hover:scale-[1.03] transition-transform">
          <CustomAppIconSvg id={id} />
        </div>
        {badge && (
          <span
            data-testid={`app-badge-${id}`}
            className="absolute -top-1.5 -right-1.5 z-10 min-w-[21px] h-[21px] px-1.5 rounded-full bg-[#ff3b30] text-white text-[11px] font-bold font-sans flex items-center justify-center border-2 border-[#090a0f] shadow-[0_2px_8px_rgba(255,59,48,0.55)] pointer-events-none"
          >
            {badge}
          </span>
        )}
      </div>

      {/* App Title */}
      <span className="text-[11px] font-medium text-white/95 tracking-tight text-center truncate w-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
        {name}
      </span>
    </motion.div>
  );
};
