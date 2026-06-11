/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#07111f',
        storm: '#7b8798',
        violet: '#8b5cf6',
        electric: '#a855f7',
        silver: '#d8dee9',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 60px rgba(139, 92, 246, 0.24)',
        glass: '0 24px 80px rgba(0, 0, 0, 0.35)',
      },
      backgroundImage: {
        'storm-radial': 'radial-gradient(circle at top left, rgba(168, 85, 247, 0.32), transparent 34%), radial-gradient(circle at bottom right, rgba(56, 189, 248, 0.18), transparent 35%)',
      },
    },
  },
  plugins: [],
}
