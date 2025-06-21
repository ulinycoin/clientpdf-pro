import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  
  // Environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Minification with terser
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    
    rollupOptions: {
      output: {
        // Manual chunks strategy
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['lucide-react', 'framer-motion'],
          'utils-vendor': ['clsx', 'file-saver'],
        },
        
        // File naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
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
      'framer-motion',
      'file-saver',
      'react-dropzone',
      // Include pako to fix module resolution
      'pako'
    ],
    // Exclude heavy PDF libraries - load them dynamically
    exclude: [
      'pdf-lib',
      'jspdf', 
      'pdfjs-dist',
      'html2canvas'
    ]
  },
  
  // SSR externals configuration for proper module handling
  ssr: {
    external: ['pako']
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
      '@workers': '/src/workers'
    }
  },
  
  // Development server
  server: {
    port: 3000,
    open: true,
  },
  
  // Preview server
  preview: {
    port: 4173,
    host: true
  }
})