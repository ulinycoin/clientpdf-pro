import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  root: '.',
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/locales': path.resolve(__dirname, './src/locales'),
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true, // Split CSS per route for faster initial load
    rollupOptions: {
      output: {
        // CRITICAL: Aggressive code splitting for mobile performance
        manualChunks: {
          // Core React libraries (always needed)
          'vendor-react': ['react', 'react-dom'],

          // PDF Core libraries (shared by all tools)
          'vendor-pdf-lib': ['pdf-lib', '@pdf-lib/fontkit'],

          // PDF.js for rendering (used by OCR, Split, Watermark)
          'vendor-pdfjs': ['pdfjs-dist'],

          // Tesseract for OCR (large library - separate chunk)
          'vendor-ocr': ['tesseract.js'],

          // Word conversion libraries (mammoth for DOCX→PDF, docx for PDF→DOCX)
          'vendor-word': ['mammoth', 'docx'],

          // NOTE: Tool components are lazy-loaded via React.lazy() - not in manualChunks
        },

        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      css: {
        // Ensure CSS is minified
        charset: false,
      },
    },
  },
})
