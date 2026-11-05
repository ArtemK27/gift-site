/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        oled: "#070709",
        "surface-dark": "rgba(18, 20, 28, 0.75)",
        "cyber-accent": "#00F5FF",
        "festive-gold": "#FFD15C",
        "festive-emerald": "#00E599",
        "alert-crimson": "#FF3366",
        "glass-border": "rgba(255, 255, 255, 0.12)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Inter",
          "Segoe UI",
          "Roboto",
          "sans-serif"
        ],
        mono: [
          "JetBrains Mono",
          "SF Mono",
          "Fira Code",
          "monospace"
        ]
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'neon-cyan': '0 0 20px rgba(0, 245, 255, 0.4)',
        'neon-crimson': '0 0 20px rgba(255, 51, 102, 0.4)',
        'neon-gold': '0 0 20px rgba(255, 209, 92, 0.4)',
      },
      animation: {
        'glitch': 'glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.85' },
        }
      }
    },
  },
  plugins: [],
}
