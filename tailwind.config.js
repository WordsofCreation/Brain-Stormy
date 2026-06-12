/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#02110d',
        storm: '#4d7568',
        violet: '#8f7dff',
        electric: '#5ff0b2',
        mint: '#9df7c8',
        silver: '#d7fbe7',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 70px rgba(95, 240, 178, 0.26), 0 0 34px rgba(143, 125, 255, 0.16)',
        glass: '0 26px 90px rgba(0, 8, 5, 0.56)',
      },
      backgroundImage: {
        'storm-radial': 'radial-gradient(circle at 16% 12%, rgba(95, 240, 178, 0.20), transparent 34%), radial-gradient(circle at 82% 14%, rgba(143, 125, 255, 0.12), transparent 28%), radial-gradient(circle at bottom right, rgba(57, 255, 136, 0.10), transparent 35%), linear-gradient(145deg, #010806 0%, #02110d 48%, #061916 100%)',
      },
    },
  },
  plugins: [],
}
