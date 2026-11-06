import React from 'react';
import { AppId } from '../../types';

export type CustomIconId = Exclude<AppId, null> | 'console';

/**
 * Multi-layered illustrative iOS 18 style SVG app icons with inner volume,
 * specular highlights, drop shadows, and rich surface details.
 */
export const CustomAppIconSvg: React.FC<{
  id: CustomIconId;
  className?: string;
}> = ({ id, className = 'w-full h-full' }) => {
  switch (id) {
    case 'messenger':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="msg-bg" x1="10" y1="4" x2="54" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
            <radialGradient id="msg-glow" cx="30%" cy="22%" r="65%">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="msg-bubble" x1="16" y1="14" x2="46" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#bae6fd" />
            </linearGradient>
            <filter id="msg-shadow" x="8" y="10" width="48" height="46" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#082f49" floodOpacity="0.55" />
            </filter>
          </defs>
          <rect width="64" height="64" rx="16" fill="url(#msg-bg)" />
          <rect width="64" height="64" rx="16" fill="url(#msg-glow)" />
          {/* 3D Glossy Speech Bubble */}
          <g filter="url(#msg-shadow)">
            <path
              d="M32 14C20.954 14 12 21.611 12 31C12 35.25 13.84 39.136 16.885 42.118C16.21 45.14 14.42 47.76 13.78 48.59C13.38 49.1 13.81 49.84 14.45 49.71C17.91 49.02 21.17 47.55 23.47 46.12C26.11 47.33 29.01 48 32 48C43.046 48 52 40.389 52 31C52 21.611 43.046 14 32 14Z"
              fill="url(#msg-bubble)"
            />
          </g>
          {/* Specular Top-Left Highlight on Bubble */}
          <ellipse
            cx="26"
            cy="21.5"
            rx="10"
            ry="4"
            transform="rotate(-14 26 21.5)"
            fill="white"
            fillOpacity="0.85"
          />
          {/* Subtle 3D Conversation Dots */}
          <circle cx="24.5" cy="31" r="2.6" fill="#0284c7" fillOpacity="0.85" />
          <circle cx="32" cy="31" r="2.6" fill="#0284c7" fillOpacity="0.85" />
          <circle cx="39.5" cy="31" r="2.6" fill="#0284c7" fillOpacity="0.85" />
        </svg>
      );

    case 'safe':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="safe-bg" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3f3f46" />
              <stop offset="45%" stopColor="#18181b" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
            <linearGradient id="safe-door" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#27272a" />
              <stop offset="55%" stopColor="#1f1f23" />
              <stop offset="100%" stopColor="#121215" />
            </linearGradient>
            <linearGradient id="safe-gold" x1="18" y1="18" x2="46" y2="46" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <radialGradient id="safe-ruby" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="55%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#881337" />
            </radialGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="url(#safe-bg)" />
          {/* Vault Recessed Door Frame */}
          <rect
            x="9"
            y="9"
            width="46"
            height="46"
            rx="11"
            fill="url(#safe-door)"
            stroke="#52525b"
            strokeWidth="1.5"
          />
          {/* Heavy Hinges on Right */}
          <rect x="52" y="16" width="4" height="9" rx="1.5" fill="url(#safe-gold)" />
          <rect x="52" y="39" width="4" height="9" rx="1.5" fill="url(#safe-gold)" />
          {/* Steel Locking Bolts on Left */}
          <rect x="8" y="20" width="4" height="5" rx="1" fill="#a1a1aa" />
          <rect x="8" y="39" width="4" height="5" rx="1" fill="#a1a1aa" />
          {/* Outer Metallic Dial Ring */}
          <circle
            cx="32"
            cy="32"
            r="15"
            fill="#18181b"
            stroke="url(#safe-gold)"
            strokeWidth="2.5"
          />
          {/* Vault Wheel Spokes */}
          <g stroke="url(#safe-gold)" strokeWidth="2.8" strokeLinecap="round">
            <line x1="32" y1="19" x2="32" y2="45" />
            <line x1="19" y1="32" x2="45" y2="32" />
            <line x1="22.8" y1="22.8" x2="41.2" y2="41.2" />
            <line x1="41.2" y1="22.8" x2="22.8" y2="41.2" />
          </g>
          {/* Inner Wheel Rim */}
          <circle
            cx="32"
            cy="32"
            r="9.5"
            fill="none"
            stroke="url(#safe-gold)"
            strokeWidth="2"
          />
          {/* Center Ruby Core Hub */}
          <circle cx="32" cy="32" r="5" fill="url(#safe-ruby)" stroke="#fde68a" strokeWidth="1.2" />
          <circle cx="30.6" cy="30.6" r="1.4" fill="white" fillOpacity="0.8" />
        </svg>
      );

    case 'notes':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="notes-paper" x1="32" y1="18" x2="32" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fffdf7" />
              <stop offset="100%" stopColor="#f3eedf" />
            </linearGradient>
            <linearGradient id="notes-header" x1="0" y1="0" x2="64" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#facc15" />
              <stop offset="55%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
          {/* Paper Body */}
          <rect width="64" height="64" rx="16" fill="url(#notes-paper)" />
          {/* Top Golden Header Band */}
          <path
            d="M0 16C0 7.16344 7.16344 0 16 0H48C56.8366 0 64 7.16344 64 16V20H0V16Z"
            fill="url(#notes-header)"
          />
          {/* Subtle Header Specular Highlight */}
          <path
            d="M6 10C6 6 10 3 16 3H48C54 3 58 6 58 10"
            stroke="white"
            strokeOpacity="0.45"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Perforated Shadow Ridge Under Header */}
          <line x1="0" y1="20.5" x2="64" y2="20.5" stroke="#a16207" strokeOpacity="0.55" strokeWidth="1.2" />
          <line x1="0" y1="22" x2="64" y2="22" stroke="#d97706" strokeOpacity="0.2" strokeWidth="1.5" />
          {/* Ruled Horizontal Lines on Paper */}
          <line x1="10" y1="31" x2="54" y2="31" stroke="#cbd5e1" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="10" y1="40" x2="54" y2="40" stroke="#cbd5e1" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="10" y1="49" x2="42" y2="49" stroke="#cbd5e1" strokeWidth="1.6" strokeLinecap="round" />
          {/* Left Red Margin Line */}
          <line x1="16" y1="21" x2="16" y2="64" stroke="#fca5a5" strokeOpacity="0.65" strokeWidth="1.2" />
        </svg>
      );

    case 'gallery':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="photo-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="url(#photo-bg)" />
          {/* 8 Overlapping Translucent Kaleidoscope Petals */}
          <g transform="translate(32,32)">
            <rect x="-6.5" y="-22" width="13" height="20" rx="6.5" fill="#ff3b30" fillOpacity="0.82" transform="rotate(0)" />
            <rect x="-6.5" y="-22" width="13" height="20" rx="6.5" fill="#ff9500" fillOpacity="0.82" transform="rotate(45)" />
            <rect x="-6.5" y="-22" width="13" height="20" rx="6.5" fill="#ffcc00" fillOpacity="0.85" transform="rotate(90)" />
            <rect x="-6.5" y="-22" width="13" height="20" rx="6.5" fill="#34c759" fillOpacity="0.82" transform="rotate(135)" />
            <rect x="-6.5" y="-22" width="13" height="20" rx="6.5" fill="#00c7be" fillOpacity="0.82" transform="rotate(180)" />
            <rect x="-6.5" y="-22" width="13" height="20" rx="6.5" fill="#007aff" fillOpacity="0.82" transform="rotate(225)" />
            <rect x="-6.5" y="-22" width="13" height="20" rx="6.5" fill="#5856d6" fillOpacity="0.82" transform="rotate(270)" />
            <rect x="-6.5" y="-22" width="13" height="20" rx="6.5" fill="#af52de" fillOpacity="0.82" transform="rotate(315)" />
            <circle cx="0" cy="0" r="4" fill="white" fillOpacity="0.9" />
          </g>
        </svg>
      );

    case 'minesweeper':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            {/* Muted frosted rose-slate to steel-grey gradient matching reference */}
            <linearGradient id="mine-bg" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#d8c8cf" />
              <stop offset="48%" stopColor="#aeb6c9" />
              <stop offset="100%" stopColor="#6f7c80" />
            </linearGradient>
            <radialGradient id="mine-vignette" cx="32%" cy="24%" r="75%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.22" />
            </radialGradient>
            <linearGradient id="mine-body" x1="14" y1="14" x2="50" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#12151c" />
              <stop offset="55%" stopColor="#080a0f" />
              <stop offset="100%" stopColor="#020305" />
            </linearGradient>
          </defs>
          {/* Squircle Base */}
          <rect width="64" height="64" rx="16" fill="url(#mine-bg)" />
          <rect width="64" height="64" rx="16" fill="url(#mine-vignette)" />
          {/* Subtle inner glass border */}
          <rect
            x="0.75"
            y="0.75"
            width="62.5"
            height="62.5"
            rx="15.25"
            stroke="#ffffff"
            strokeOpacity="0.35"
            strokeWidth="1.2"
          />

          {/* Subtle ambient shadow under the naval mine */}
          <circle cx="32" cy="34" r="17.2" fill="#090d16" fillOpacity="0.24" />

          {/* 8-Horned Naval Mine Silhouette (Reference Design centered at 32,32) */}
          <g>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <path
                key={deg}
                d="M28.2 18 L29.3 8.8 C29.45 7.6 30.4 6.8 31.6 6.8 H32.4 C33.6 6.8 34.55 7.6 34.7 8.8 L35.8 18 Z"
                fill="url(#mine-body)"
                transform={`rotate(${deg} 32 32)`}
              />
            ))}

            {/* Central Naval Mine Sphere */}
            <circle cx="32" cy="32" r="16.8" fill="url(#mine-body)" />

            {/* Signature Curved Crescent Highlight Arc in Top-Left Quadrant */}
            <path
              d="M 20.2 32 A 11.8 11.8 0 0 1 32 20.2 L 32 23.8 A 8.2 8.2 0 0 0 23.8 32 Z"
              fill="#d5ced6"
              fillOpacity="0.92"
            />
          </g>
        </svg>
      );

    case 'clock':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <rect width="64" height="64" rx="16" fill="#09090b" />
          <circle cx="32" cy="32" r="24" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
          {/* Clock Hour Ticks */}
          <g stroke="#e4e4e7" strokeWidth="1.6" strokeLinecap="round">
            <line x1="32" y1="11" x2="32" y2="14" />
            <line x1="32" y1="50" x2="32" y2="53" />
            <line x1="11" y1="32" x2="14" y2="32" />
            <line x1="50" y1="32" x2="53" y2="32" />
          </g>
          {/* Hour & Minute Hands */}
          <line x1="32" y1="32" x2="23" y2="24" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="32" y1="32" x2="43" y2="21" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
          {/* Sweeping Orange Second Hand */}
          <line x1="32" y1="36" x2="32" y2="14" stroke="#ff9f0a" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="32" cy="32" r="2.5" fill="#ff9f0a" />
        </svg>
      );

    case 'weather':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="w-bg" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="50%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
            <linearGradient id="w-cloud" x1="16" y1="22" x2="48" y2="46" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#bae6fd" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="url(#w-bg)" />
          {/* Warm Golden Sun/Moon Behind Cloud */}
          <circle cx="23" cy="23" r="9.5" fill="#facc15" />
          {/* 3D Frosted Cloud */}
          <path
            d="M22 44H44.5C49.1944 44 53 40.1944 53 35.5C53 31.119 49.687 27.512 45.424 27.05C43.78 21.81 38.88 18 33 18C25.82 18 20 23.82 20 31C15.58 31 12 34.58 12 39C12 41.76 14.24 44 17 44H22Z"
            fill="url(#w-cloud)"
          />
          {/* Snowflakes Below Cloud */}
          <circle cx="23" cy="51" r="2" fill="#e0f2fe" />
          <circle cx="32" cy="53" r="2.2" fill="#ffffff" />
          <circle cx="41" cy="50.5" r="2" fill="#e0f2fe" />
        </svg>
      );

    case 'settings':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="set-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#71717a" />
              <stop offset="100%" stopColor="#27272a" />
            </linearGradient>
            <linearGradient id="set-gear" x1="14" y1="14" x2="50" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f4f4f5" />
              <stop offset="50%" stopColor="#a1a1aa" />
              <stop offset="100%" stopColor="#71717a" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="url(#set-bg)" />
          <g transform="translate(32,32)">
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <rect
                key={deg}
                x="-3"
                y="-23"
                width="6"
                height="8"
                rx="2"
                fill="url(#set-gear)"
                transform={`rotate(${deg})`}
              />
            ))}
            <circle cx="0" cy="0" r="18" fill="url(#set-gear)" stroke="#e4e4e7" strokeWidth="1" />
            <circle cx="0" cy="0" r="12" fill="#27272a" stroke="#52525b" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="5" fill="url(#set-gear)" />
          </g>
        </svg>
      );

    case 'console':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <rect width="64" height="64" rx="16" fill="#090d14" />
          <rect
            x="6"
            y="6"
            width="52"
            height="52"
            rx="12"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="1.5"
          />
          <circle cx="14" cy="14" r="2" fill="#ef4444" />
          <circle cx="21" cy="14" r="2" fill="#f59e0b" />
          <circle cx="28" cy="14" r="2" fill="#10b981" />
          <path
            d="M16 28L25 35L16 42"
            stroke="#34d399"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="29"
            y1="42"
            x2="42"
            y2="42"
            stroke="#34d399"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </svg>
      );
  }
};
