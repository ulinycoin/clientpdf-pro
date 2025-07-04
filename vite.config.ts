import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // Disable TypeScript checking in build
      typescript: false
    })
  ],
  server: {
    host: true,
    port: 3000
  },
  build: {
    // Skip TypeScript checking during build
    rollupOptions: {
      onwarn(warning, warn) {
        // Skip TypeScript warnings
        if (warning.code === 'TYPESCRIPT') return
        warn(warning)
      }
    }
  },
  esbuild: {
    // Disable TypeScript checking in esbuild
    logLevel: 'error'
  }
})
