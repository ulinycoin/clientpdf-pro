import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'
  const isAnalyze = mode === 'analyze'

  // Dynamic import for bundle analyzer (optional)
  const plugins = [
    react({
      // React Fast Refresh optimizations
      fastRefresh: !isProduction,
      // Fix for CSS imports in JSX
      include: "**/*.{jsx,tsx}",
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
      sourcemap: !isProduction,
      target: 'es2020',
      assetsDir: 'assets',
      
      // Chunk size warning limit
      chunkSizeWarningLimit: 1000,
      
      // Advanced minification
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
          // Code splitting strategy
          manualChunks: {
            'react-core': ['react', 'react-dom'],
            'router': ['react-router-dom'],
            'ui-libs': ['lucide-react', 'framer-motion', 'react-hot-toast'],
            'file-utils': ['file-saver', 'react-dropzone'],
            'utils': ['clsx', 'tailwind-merge'],
            'pdf-heavy': ['pdf-lib'],
            'pdf-render': ['pdfjs-dist'],
            'pdf-generate': ['jspdf', 'jspdf-autotable'],
            'data-processing': ['papaparse', 'pako'],
            'canvas': ['html2canvas'],
            'analytics': ['@vercel/analytics'],
          },
          
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1]
            if (/\.(css)$/.test(assetInfo.name)) {
              return 'assets/css/[name]-[hash].[ext]'
            }
            if (/\.(png|jpe?g|svg|gif|webp|avif)$/i.test(assetInfo.name)) {
              return 'assets/images/[name]-[hash].[ext]'
            }
            if (/\.(woff2?|ttf|eot)$/i.test(assetInfo.name)) {
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
      exclude: [
        'pdf-lib',
        'jspdf', 
        'jspdf-autotable',
        'pdfjs-dist',
        'html2canvas'
      ]
    },
    
    // Development server configuration
    server: {
      port: 3000,
      host: 'localhost',
      open: false,
      cors: true,
      strictPort: false,
      fs: {
        allow: ['..']
      },
      hmr: {
        overlay: true
      }
    },
    
    // Preview server
    preview: {
      port: 4173,
      host: 'localhost',
      open: false,
      cors: true
    },
    
    // CSS configuration
    css: {
      devSourcemap: !isProduction,
      modules: {
        localsConvention: 'camelCase'
      },
      postcss: {
        plugins: []
      }
    },
    
    // Path resolution
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@services': path.resolve(__dirname, './src/services'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@workers': path.resolve(__dirname, './src/workers'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@types': path.resolve(__dirname, './src/types')
      }
    },
    
    // Fix for CommonJS modules
    esbuild: {
      target: 'es2020',
      format: 'esm'
    }
  }
})