import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          pdf: ['pdf-lib', 'jspdf', 'pdfjs-dist'],
        }
      }
    }
  },
  // Для SPA роутинга
  server: {
    historyApiFallback: true
  }
})