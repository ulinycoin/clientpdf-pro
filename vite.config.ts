import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  
  // Решение проблемы с eval в pdfjs-dist
  define: {
    // Отключаем eval для production
    'process.env.NODE_ENV': JSON.stringify('production'),
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    // Заменяем eval на безопасную альтернативу
    'globalThis.eval': 'undefined',
    'window.eval': 'undefined',
  },
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    
    // Увеличиваем лимит warning и используем более агрессивное разделение
    chunkSizeWarningLimit: 1000,
    
    // Минификация с terser
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.warn'],
        passes: 2,
        // Убираем eval из кода
        unsafe_comps: true,
        unsafe_Function: true,
        unsafe_math: true,
        unsafe_symbols: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
      },
      format: {
        comments: false,
      },
      mangle: {
        safari10: true,
      },
    },
    
    rollupOptions: {
      // Настройки для работы с eval в pdfjs-dist
      external: [],
      
      output: {
        // Более детальное разделение для уменьшения размера чанков
        manualChunks: (id) => {
          // React ecosystem
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor'
          }
          
          // Router
          if (id.includes('react-router')) {
            return 'router-vendor'
          }
          
          // PDF.js - самый тяжелый
          if (id.includes('pdfjs-dist')) {
            if (id.includes('worker')) {
              return 'pdf-worker'
            }
            return 'pdf-viewer'
          }
          
          // PDF-lib
          if (id.includes('pdf-lib')) {
            return 'pdf-core'
          }
          
          // jsPDF и html2canvas
          if (id.includes('jspdf') || id.includes('html2canvas')) {
            return 'pdf-generator'
          }
          
          // UI библиотеки
          if (id.includes('framer-motion')) {
            return 'ui-animations'
          }
          
          if (id.includes('lucide-react')) {
            return 'ui-icons'
          }
          
          // Утилиты
          if (id.includes('clsx') || id.includes('file-saver')) {
            return 'utils-vendor'
          }
          
          // Dropzone
          if (id.includes('react-dropzone')) {
            return 'ui-dropzone'
          }
          
          // Vercel analytics
          if (id.includes('@vercel/analytics')) {
            return 'analytics'
          }
          
          // Остальные node_modules
          if (id.includes('node_modules')) {
            return 'vendor-other'
          }
        },
        
        // Динамическое именование чанков
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          
          if (facadeModuleId) {
            // Для страниц создаем отдельные чанки
            if (facadeModuleId.includes('/pages/')) {
              const pageName = facadeModuleId.split('/').pop()?.replace('.tsx', '')
              return `pages/${pageName}-[hash].js`
            }
            
            // Для компонентов
            if (facadeModuleId.includes('/components/')) {
              return `components/[name]-[hash].js`
            }
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
  
  // Настройка для работы с pdfjs-dist и решения проблемы eval
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'clsx',
      'framer-motion',
    ],
    exclude: [
      'pdf-lib',
      'jspdf', 
      'pdfjs-dist',
      'html2canvas'
    ]
  },
  
  // Настройка resolve для алиасов
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
