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
          dark: '#881337',
          glow: 'rgba(225, 29, 72, 0.4)'
        },
        mystic: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dark: '#3730a3',
          glow: 'rgba(99, 102, 241, 0.4)'
        },
        village: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#065f46'
        },
        wolf: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#991b1b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        gothic: ['Cinzel', 'Georgia', 'serif']
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 15px rgba(225,29,72,0.6))' },
          '50%': { opacity: '0.7', filter: 'drop-shadow(0 0 5px rgba(225,29,72,0.2))' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        }
      },
      boxShadow: {
        'blood-glow': '0 0 25px -5px rgba(225, 29, 72, 0.35)',
        'mystic-glow': '0 0 25px -5px rgba(99, 102, 241, 0.35)',
        'emerald-glow': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
      }
    },
  },
  plugins: [],
}
