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
        brand: {
          dark: '#060B19',
          darker: '#040711',
          navy: '#0A1128',
          slate: '#1B243B',
          card: '#0D1936',
          cardHover: '#112248',
          cardLight: '#142552',
          border: 'rgba(0, 240, 255, 0.12)',
          borderSlate: '#1E2E5D',
          borderLight: '#E2E8F0',
          cyan: '#00F0FF',
          cyanLight: '#38F9D7',
          cyanDark: '#00B4D8',
          blue: '#0078FF',
          blueDark: '#0052CC',
          textMuted: '#7B8B9E',
          textDim: '#94A3B8',
          textLight: '#F1F5F9',
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(0, 240, 255, 0.4)',
        'glow-cyan-lg': '0 0 35px -5px rgba(0, 240, 255, 0.5)',
        'glow-blue': '0 0 25px -4px rgba(0, 120, 255, 0.45)',
        'glow-card': '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
        'glow-pill': '0 0 15px rgba(0, 240, 255, 0.45)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-radial': 'radial-gradient(ellipse at top left, #123063 0%, #0D1C3E 50%, #060B19 100%)',
        'cyan-blue-gradient': 'linear-gradient(135deg, #00F0FF 0%, #0078FF 100%)',
        'glass-gradient': 'linear-gradient(180deg, rgba(17, 28, 68, 0.85) 0%, rgba(13, 25, 54, 0.95) 100%)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.8, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.03)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
