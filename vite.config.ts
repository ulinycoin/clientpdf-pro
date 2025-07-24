import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/data': path.resolve(__dirname, './src/data'),
    }
  },

  server: {
    host: true,
    port: 3000
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom', 'react-helmet-async'],
          'pdf-vendor': ['pdf-lib', 'jspdf', 'pdfjs-dist'],
          'word-vendor': ['mammoth', 'html2canvas'],
          'ui-vendor': ['lucide-react'],
          'ocr-vendor': ['tesseract.js']
        }
      }
    },
    target: 'es2020',
    minify: 'esbuild'
  },

  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom', 'react-helmet-async',
      'pdf-lib', 'jspdf', 'pdfjs-dist', 'lucide-react',
      'mammoth', 'html2canvas', 'tesseract.js'
    ]
  }
})