import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Skip TypeScript warnings and errors
        if (warning.code === 'TYPESCRIPT' || warning.code === 'TS') return
        // Skip all warnings related to types
        if (warning.message.includes('TypeScript') || warning.message.includes('types')) return
        warn(warning)
      }
    }
  },
  esbuild: {
    // Ignore TypeScript errors completely
    logLevel: 'silent'
  }
})
