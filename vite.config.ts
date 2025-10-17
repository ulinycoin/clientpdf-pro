import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';


export default defineConfig({
  plugins: [
    react(),
    // Plugin для копирования markdown файлов блога в dist
    {
      name: 'copy-blog-content',
      apply: 'build',
      generateBundle() {
        const contentDir = path.resolve(__dirname, 'src/content');
        if (fs.existsSync(contentDir)) {
          // Рекурсивно копируем всю папку content
          const copyDir = (srcDir: string, targetPath: string) => {
            const entries = fs.readdirSync(srcDir, { withFileTypes: true });
            entries.forEach(entry => {
              const srcPath = path.join(srcDir, entry.name);
              const targetFilePath = path.join(targetPath, entry.name);

              if (entry.isDirectory()) {
                copyDir(srcPath, targetFilePath);
              } else if (entry.name.endsWith('.md')) {
                try {
                  const relativePath = path.relative(path.resolve(__dirname), srcPath);
                  this.emitFile({
                    type: 'asset',
                    fileName: relativePath,
                    source: fs.readFileSync(srcPath, 'utf-8')
                  });
                } catch (error) {
                  console.warn(`[copy-blog-content] Could not read file: ${srcPath}`, error);
                }
              }
            });
          };
          copyDir(contentDir, 'src/content');
        }
      }
    },
  ],

  server: {
    host: true,
    port: 3000,
  },

  build: {
    target: 'es2020', // Modern browsers only - no legacy polyfills
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 500, // Warn if chunks exceed 500kb
    rollupOptions: {
      // Включаем markdown файлы в сборку как статические ресурсы
      external: [],
      output: {
        // CRITICAL: Aggressive code splitting for mobile performance
        // PDF libraries are NOT in manualChunks - they load only on tool pages via dynamic import
        manualChunks: {
          // Core React libraries (always needed)
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries (lightweight)
          'ui-vendor': ['react-helmet-async'],
          // NOTE: pdf-lib, pdfjs, tesseract are NOT here - they load dynamically per route
        },
        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Копируем markdown файлы в dist
    copyPublicDir: true,
  },

  // Обеспечиваем корректную работу с markdown файлами
  assetsInclude: ['**/*.md'],

  // Добавляем markdown файлы в public для копирования
  publicDir: 'public',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
  },
});
