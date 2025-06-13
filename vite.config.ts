import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  base: '/clientpdf-pro/',
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
})