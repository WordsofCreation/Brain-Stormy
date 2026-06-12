/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#030712',
        storm: '#475569',
        violet: '#9f7aea',
        electric: '#c084fc',
        silver: '#d8dee9',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 70px rgba(159, 122, 234, 0.34)',
        glass: '0 26px 90px rgba(0, 0, 0, 0.46)',
      },
      backgroundImage: {
        'storm-radial': 'radial-gradient(circle at top left, rgba(192, 132, 252, 0.22), transparent 34%), radial-gradient(circle at bottom right, rgba(103, 232, 249, 0.10), transparent 35%), linear-gradient(145deg, #030712 0%, #07111f 48%, #050816 100%)',
      },
    },
  },
  plugins: [],
}
