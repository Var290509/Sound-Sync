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
        // Semantic custom theme colors
        theme: {
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
          surfaceHover: 'var(--color-surface-hover)',
          border: 'var(--color-border)',
          borderHover: 'var(--color-border-hover)',
          text: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          accent: 'var(--color-accent)',
          accentHover: 'var(--color-accent-hover)',
          glow: 'var(--color-glow)',
        },
        ivory: {
          50: '#FAF8F5',
          100: '#F5F0E8',
          200: '#EBE2D4',
          300: '#DED1BC',
          400: '#C7B496',
          500: '#AD9674',
          600: '#8E7756',
          700: '#6E5A40',
          800: '#4E3E2B',
          900: '#2E2419',
        },
        gold: {
          50: '#FDFBF3',
          100: '#FAF4DC',
          200: '#F3E5AE',
          300: '#EBD47C',
          400: '#E2C24E',
          500: '#D4AF37', // Classic metallic gold
          600: '#B89225',
          700: '#8E6F18',
          800: '#644D0F',
          900: '#3D2E07',
        },
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#627D98',
          500: '#334E68',
          600: '#243B53',
          700: '#1B263B',
          800: '#0F2038',
          900: '#0B192C',
          950: '#060D17', // Deep Atlas Navy
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'equalizer-1': 'equalize 1.2s ease-in-out infinite alternate',
        'equalizer-2': 'equalize 0.8s ease-in-out infinite alternate 0.2s',
        'equalizer-3': 'equalize 1.5s ease-in-out infinite alternate 0.4s',
        'equalizer-4': 'equalize 1.0s ease-in-out infinite alternate 0.1s',
        'equalizer-5': 'equalize 1.3s ease-in-out infinite alternate 0.3s',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        equalize: {
          '0%': { height: '15%' },
          '100%': { height: '95%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { opacity: '0.4', filter: 'drop-shadow(0 0 15px var(--color-glow))' },
          '100%': { opacity: '0.9', filter: 'drop-shadow(0 0 35px var(--color-glow))' },
        }
      }
    },
  },
  plugins: [],
}
