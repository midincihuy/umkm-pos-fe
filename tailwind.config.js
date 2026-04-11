/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#fdf2ff',
          100: '#f9e4ff',
          200: '#f3c9ff',
          300: '#e99dff',
          400: '#da62ff',
          500: '#c62af5',
          600: '#a808d9',
          700: '#8c07b2',
          800: '#730a90',
          900: '#5e0c73',
        },
        coral: {
          400: '#ff6b6b',
          500: '#ff4757',
        },
        mint: {
          400: '#26de81',
          500: '#20bf6b',
        },
        gold: {
          400: '#fed330',
          500: '#f7b731',
        },
        ocean: {
          400: '#45aaf2',
          500: '#2d98da',
        },
      },
      backgroundImage: {
        'mesh-1': 'radial-gradient(at 40% 20%, hsla(280,100%,74%,0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.2) 0px, transparent 50%)',
        'mesh-2': 'radial-gradient(at 20% 80%, hsla(280,100%,74%,0.2) 0px, transparent 50%), radial-gradient(at 80% 20%, hsla(38,100%,74%,0.2) 0px, transparent 50%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'slide-in': 'slideIn 0.4s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'glow': '0 0 40px -10px rgba(198, 42, 245, 0.4)',
        'glow-sm': '0 0 20px -5px rgba(198, 42, 245, 0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
