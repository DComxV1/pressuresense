/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        risk: {
          green: '#16a34a',
          yellow: '#d97706',
          red: '#dc2626',
        },
      },
    },
  },
  plugins: [],
}
