import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// On GitHub Pages the app is served from /pressuresense/, so the production
// build needs that base. Local dev/preview stay at / so nothing else changes.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/pressuresense/' : '/',
  plugins: [react()],
}))
