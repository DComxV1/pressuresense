/** @type {import('tailwindcss').Config} */
const withVar = (v) => `rgb(var(${v}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: withVar('--bg'),
        surface: withVar('--surface'),
        'surface-2': withVar('--surface-2'),
        border: withVar('--border'),
        text: withVar('--text'),
        muted: withVar('--muted'),
        accent: withVar('--accent'),
        good: { DEFAULT: withVar('--good'), ink: withVar('--good-ink') },
        caution: { DEFAULT: withVar('--caution'), ink: withVar('--caution-ink') },
        high: { DEFAULT: withVar('--high'), ink: withVar('--high-ink') },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'Cambria', 'serif'],
      },
      minHeight: { touch: '44px' },
      minWidth: { touch: '44px' },
    },
  },
  plugins: [],
}
