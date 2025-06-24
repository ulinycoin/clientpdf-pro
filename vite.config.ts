import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'
  const isAnalyze = mode === 'analyze'

  // Dynamic import for bundle analyzer (optional)
  const plugins = [
    react({
      // React Fast Refresh optimizations
      fastRefresh: !isProduction,
    })
  ]

  // Add visualizer plugin only if available and in analyze mode
  if (isAnalyze) {
    try {
      const { visualizer } = require('rollup-plugin-visualizer')
      plugins.push(
        visualizer({
          filename: 'dist/bundle-analysis.html',
          open: true,
          gzipSize: true,
          brotliSize: true,
        })
      )
    } catch (error) {
      console.warn('rollup-plugin-visualizer not available, skipping bundle analysis')
    }
  }

  return {
    plugins,
    
    base: '/',
    
    // Environment variables
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.VITE_APP_VERSION': JSON.stringify(env.npm_package_version || '0.1.0'),
      '__DEV__': !isProduction,
    },
    
    build: {
      outDir: 'dist',
      sourcemap: !isProduction, // Source maps only in development
      target: 'es2020',
      
      // Chunk size warning limit
      chunkSizeWarningLimit: 1000,
      
      // Advanced minification with terser
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
          pure_funcs: isProduction ? ['console.log', 'console.info', 'console.debug'] : [],
        },
        format: {
          comments: false,
        },
      },
      
      rollupOptions: {
        output: {
          // Aggressive code splitting strategy
          manualChunks: {
            // Core React libraries
            'react-core': ['react', 'react-dom'],
            
            // Routing
            'router': ['react-router-dom'],
            
            // UI & Animation libraries
            'ui-libs': ['lucide-react', 'framer-motion', 'react-hot-toast'],
            
            // File handling utilities
            'file-utils': ['file-saver', 'react-dropzone'],
            
            // Utility libraries
            'utils': ['clsx', 'tailwind-merge'],
            
            // Heavy PDF libraries (dynamically loaded)
            'pdf-heavy': ['pdf-lib'],
            'pdf-render': ['pdfjs-dist'],
            'pdf-generate': ['jspdf', 'jspdf-autotable'],
            
            // Data processing
            'data-processing': ['papaparse', 'pako'],
            
            // Canvas & Image processing
            'canvas': ['html2canvas'],
            
            // Analytics (separate chunk)
            'analytics': ['@vercel/analytics'],
          },
          
          // CSS and assets in root assets folder
          chunkFileNames: (chunkInfo) => {
            // Create descriptive names for better debugging
            if (chunkInfo.name?.includes('pdf')) {
              return 'assets/pdf-[name]-[hash].js'
            }
            if (chunkInfo.name?.includes('react')) {
              return 'assets/react-[name]-[hash].js'
            }
            return 'assets/[name]-[hash].js'
          },
          entryFileNames: 'assets/main-[hash].js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || ''
            if (name.endsWith('.css')) {
              return 'assets/[name]-[hash].[ext]'
            }
            if (name.match(/\.(png|jpe?g|svg|gif|webp|avif)$/)) {
              return 'assets/images/[name]-[hash].[ext]'
            }
            if (name.match(/\.(woff2?|ttf|eot)$/)) {
              return 'assets/fonts/[name]-[hash].[ext]'
            }
            return 'assets/[name]-[hash].[ext]'
          }
        }
      },
    },
    
    // Dependency optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'lucide-react',
        'clsx',
        'tailwind-merge',
        'framer-motion',
        'file-saver',
        'react-dropzone',
        'react-hot-toast',
        'react-helmet-async',
      ],
      // Exclude heavy PDF libraries - load them dynamically
      exclude: [
        'pdf-lib',
        'jspdf', 
        'jspdf-autotable',
        'pdfjs-dist',
        'html2canvas'
      ]
    },
    
    // Development server with MIME fix
    server: {
      port: 3000,
      open: !process.env.CI,
      host: true,
      cors: true,
      fs: {
        allow: ['..']
      },
      hmr: {
        overlay: true
      },
      // Fix MIME type issues
      middlewareMode: false,
      headers: {
        'Content-Type': 'application/javascript'
      }
    },
    
    // Preview server
    preview: {
      port: 4173,
      host: true,
      cors: true
    },
    
    // CSS optimization with proper handling
    css: {
      devSourcemap: !isProduction,
      modules: {
        localsConvention: 'camelCase'
      }
    },
    
    // Path resolution
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
    }
  }
})