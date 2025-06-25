import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 3000,
    host: '0.0.0.0', // Изменено с 'localhost' для лучшей совместимости
    open: false,
    // Исправление WebSocket проблем
    hmr: {
      port: 3000,
      host: 'localhost'
    },
    // Увеличиваем таймауты для больших файлов
    timeout: 120000
  },
  
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false,
    // Увеличиваем лимит для больших файлов
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui': ['lucide-react', 'framer-motion'],
          'pdf': ['jspdf', 'jspdf-autotable', 'pdf-lib'] // Выделяем PDF библиотеки
        }
      }
    }
  },
  
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@services': '/src/services',
      '@hooks': '/src/hooks',
      '@utils': '/src/utils',
      '@workers': '/src/workers',
      '@assets': '/src/assets',
      '@types': '/src/types'
    }
  },
  
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'lucide-react',
      'clsx',
      'tailwind-merge',
      // Добавляем PDF библиотеки для предварительной оптимизации
      'jspdf',
      'jspdf-autotable',
      'pdf-lib',
      'papaparse'
    ],
    // Исключаем проблемные модули из предварительной оптимизации
    exclude: [
      'pdfjs-dist'
    ]
  },
  
  // Дополнительные настройки для работы с PDF библиотеками
  define: {
    // Устанавливаем глобальные переменные для совместимости
    global: 'globalThis',
  },
  
  // Обработка CommonJS модулей
  esbuild: {
    // Включаем поддержку legacy decorators если нужно
    target: 'es2020'
  }
})