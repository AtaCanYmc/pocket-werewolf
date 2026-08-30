/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-color)',
        surface: {
          DEFAULT: 'var(--surface-color)',
          light: 'var(--surface-light-color)',
          card: 'var(--surface-color)',
          border: 'var(--surface-border-color)'
        },
        blood: {
          DEFAULT: '#e11d48',
          hover: '#be123c',
          dark: '#9f1239',
          light: '#f43f5e'
        },
        mystic: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dark: '#4338ca'
        },
        village: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#047857'
        },
        wolf: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#b91c1c'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        gothic: ['Cinzel', 'Georgia', 'serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      boxShadow: {
        'flat-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'flat': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'flat-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'flat-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'subtle-red': '0 0 0 1px rgba(225, 29, 72, 0.3)',
        'subtle-indigo': '0 0 0 1px rgba(99, 102, 241, 0.3)',
        'subtle-emerald': '0 0 0 1px rgba(16, 185, 129, 0.3)'
      }
    },
  },
  plugins: [],
}
