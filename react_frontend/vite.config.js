import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// PUBLIC_INTERFACE
export default defineConfig({
  /** Vite config for Price-Pal React frontend. */
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true
  }
})
