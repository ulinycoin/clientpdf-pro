import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  // Path resolution for cleaner imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/data': path.resolve(__dirname, './src/data'),
    },
  },
  
  server: {
    host: true,
    port: 3000
  },
  
  build: {
    // Optimize bundle
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom', 'react-helmet-async'],
          'pdf-vendor': ['pdf-lib', 'jspdf', 'pdfjs-dist'],
          'ui-vendor': ['lucide-react']
        }
      },
      onwarn(warning, warn) {
        // Skip certain warnings that don't affect functionality
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return
        if (warning.message.includes('Use of eval')) return
        if (warning.message.includes('Circular dependency')) return
        if (warning.message.includes('Generated an empty chunk')) return
        
        // Only show critical warnings
        warn(warning)
      }
    },
    
    // Build optimizations - safe settings for Vercel
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
  
  // Optimized dependencies
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'react-helmet-async',
      'pdf-lib',
      'jspdf',
      'pdfjs-dist',
      'lucide-react'
    ],
  },
  
  esbuild: {
    logLevel: 'info',
    target: 'es2020'
  }
})
