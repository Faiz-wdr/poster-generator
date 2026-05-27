import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Resolve base path dynamically: Vercel builds deploy to the root domain ('/'),
  // while local/GitHub Page builds can utilize VITE_BASE_PATH or fall back to /poster-generator/.
  base: process.env.VERCEL ? '/' : (process.env.VITE_BASE_PATH || '/poster-generator/')
})
