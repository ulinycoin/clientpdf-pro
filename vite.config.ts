import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  
  // Optimizations
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    
    // Chunk splitting strategy для максимальной оптимизации
    rollupOptions: {
      output: {
        // Оптимизированное разделение chunks
        manualChunks: {
          // Core React libs (меняется редко)
          'vendor-react': ['react', 'react-dom'],
          
          // Router (средняя частота изменений)
          'vendor-router': ['react-router-dom'],
          
          // UI libraries (стабильные)
          'vendor-ui': ['framer-motion', 'lucide-react'],
          
          // PDF libraries разделены отдельно (тяжелые)
          'pdf-core': ['pdf-lib'],
          'pdf-viewer': ['pdfjs-dist'],
          'pdf-generator': ['jspdf', 'html2canvas'],
          
          // Utilities (легкие, часто используемые)
          'vendor-utils': ['clsx', 'file-saver'],
        },
        
        // Именование chunks для лучшего кеширования
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? 
            chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/[name]-[hash].js`;
        },
        
        // Именование entry файлов
        entryFileNames: 'assets/[name]-[hash].js',
        
        // Именование assets
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash].${ext}`;
          }
          
          return `assets/[name]-[hash].${ext}`;
        }
      }
    },
    
    // Минификация
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Убираем console.log в продакшене
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'], // Убираем specific console methods
      },
      format: {
        comments: false, // Убираем комментарии
      },
    },
    
    // CSS минификация
    cssMinify: true,
    
    // Размер chunk warning
    chunkSizeWarningLimit: 500, // 500kb warning
    
    // Asset размер для inline
    assetsInlineLimit: 4096, // 4kb для inline assets
  },
  
  // Development optimizations
  server: {
    historyApiFallback: true,
    port: 3000,
    open: true,
  },
  
  // Production preview
  preview: {
    port: 4173,
    host: true
  },
  
  // Dependency optimization
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
      // Исключаем PDF библиотеки из pre-bundling для lazy loading
      'pdf-lib',
      'jspdf', 
      'pdfjs-dist',
      'html2canvas'
    ]
  },
  
  // Experimental features
  experimental: {
    // Включаем renderBuiltUrl для assets optimization
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        // Для JS файлов используем relative paths
        return { relative: true };
      }
      return { relative: true };
    }
  },
  
  // Worker configuration для PDF Web Worker
  worker: {
    format: 'es',
    plugins: () => [react()]
  },
  
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  
  // CSS configuration
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      // Если в будущем добавим SCSS
    }
  },
  
  // Resolution configuration
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
})
