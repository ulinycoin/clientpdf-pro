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
          
          // Утилиты (небольшие)
          if (id.includes('node_modules/clsx') || 
              id.includes('node_modules/file-saver') ||
              id.includes('node_modules/react-dropzone')) {
            return 'utils-vendor'
          }
          
          // Vercel analytics
          if (id.includes('node_modules/@vercel/analytics')) {
            return 'analytics'
          }
          
          // DOMPurify
          if (id.includes('node_modules/dompurify') || id.includes('node_modules/isomorphic-dompurify')) {
            return 'purify-vendor'
          }
          
          // PDF библиотеки - НЕ включаем в manualChunks!
          // Они должны загружаться только через dynamic import
          if (id.includes('pdfjs-dist') || 
              id.includes('pdf-lib') || 
              id.includes('jspdf') || 
              id.includes('html2canvas')) {
            // Возвращаем undefined - пусть Vite сам решает
            return undefined
          }
          
          // Остальные node_modules объединяем в vendor
          if (id.includes('node_modules/')) {
            return 'vendor-other'
          }
          
          // Компоненты приложения
          return undefined
        },
        
        // Динамическое именование чанков
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          
          if (facadeModuleId) {
            // Для страниц
            if (facadeModuleId.includes('/pages/')) {
              const pageName = facadeModuleId.split('/').pop()?.replace('.tsx', '')
              return `pages/${pageName}-[hash].js`
            }
            
            // Для компонентов
            if (facadeModuleId.includes('/components/')) {
              return `components/[name]-[hash].js`
            }
          }
          
          // Для динамических импортов PDF библиотек
          if (chunkInfo.name?.includes('pdf')) {
            return `pdf/[name]-[hash].js`
          }
          
          return 'chunks/[name]-[hash].js'
        },
        
        entryFileNames: 'assets/[name]-[hash].js',
        
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || '')) {
            return `assets/images/[name]-[hash].${ext}`
          }
          
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
            return `assets/fonts/[name]-[hash].${ext}`
          }
          
          return `assets/[name]-[hash].${ext}`
        }
      }
    },
    
    cssMinify: true,
    assetsInlineLimit: 4096,
  },
  
  // КРИТИЧЕСКИ ВАЖНО: исключаем PDF библиотеки из optimizeDeps
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'clsx',
      'framer-motion',
      'file-saver',
      'react-dropzone',
      'dompurify'
    ],
    // Полностью исключаем PDF библиотеки
    exclude: [
      'pdf-lib',
      'jspdf', 
      'pdfjs-dist',
      'html2canvas'
    ]
  },
  
  // Настройка resolve
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@services': '/src/services',
      '@hooks': '/src/hooks',
      '@utils': '/src/utils',
      '@workers': '/src/workers',
    }
  },
  
  // Worker configuration
  worker: {
    format: 'es',
    plugins: () => [react()]
  },
  
  // Development server
  server: {
    historyApiFallback: true,
    port: 3000,
    open: true,
  },
  
  // Preview server
  preview: {
    port: 4173,
    host: true
  },
  
  // CSS configuration
  css: {
    devSourcemap: true,
  },
})
