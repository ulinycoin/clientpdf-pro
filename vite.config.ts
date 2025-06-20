import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  
  // Решение проблемы с eval в pdfjs-dist
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    
    // Увеличиваем лимит warning
    chunkSizeWarningLimit: 1000,
    
    // Минификация с terser
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.warn'],
        passes: 2,
      },
      format: {
        comments: false,
      },
      mangle: {
        safari10: true,
      },
    },
    
    rollupOptions: {
      output: {
        // Стратегия разделения без PDF библиотек в основных чанках
        manualChunks: (id) => {
          // ВАЖНО: PDF библиотеки НЕ должны попадать в manualChunks
          // Они должны загружаться только через dynamic import()
          
          // React ecosystem
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor'
          }
          
          // Router
          if (id.includes('node_modules/react-router')) {
            return 'router-vendor'
          }
          
          // UI библиотеки
          if (id.includes('node_modules/framer-motion')) {
            return 'ui-animations'
          }
          
          if (id.includes('node_modules/lucide-react')) {
            return 'ui-icons'
          }
          
          // Утилиты (