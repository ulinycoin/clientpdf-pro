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
    // Remove unnecessary modulepreload hints for mobile performance
    {
      name: 'remove-heavy-preloads',
      apply: 'build',
      transformIndexHtml(html) {
        // Remove modulepreload for heavy chunks that aren't needed on first load
        return html
          .replace(/<link rel="modulepreload"[^>]*pdf-lib[^>]*>/g, '')
          .replace(/<link rel="modulepreload"[^>]*xlsx[^>]*>/g, '')
          .replace(/<link rel="modulepreload"[^>]*pdfjs[^>]*>/g, '')
          .replace(/<link rel="modulepreload"[^>]*tesseract[^>]*>/g, '')
          .replace(/<link rel="modulepreload"[^>]*authority[^>]*>/g, '')
          .replace(/<link rel="modulepreload"[^>]*blog[^>]*>/g, '')
          .replace(/<link rel="modulepreload"[^>]*html2canvas[^>]*>/g, '');
      }
    },
  ],

  server: {
    host: true,
    port: 3000,
  },

  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 500, // Warn if chunks exceed 500kb
    rollupOptions: {
      // Включаем markdown файлы в сборку как статические ресурсы
      external: [],
      output: {
        // Aggressive code splitting for better caching and mobile performance
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/react-router')) {
            return 'react-router';
          }

          // PDF processing libraries (large dependencies) - load on demand
          if (id.includes('node_modules/pdf-lib') || id.includes('@pdf-lib/fontkit')) {
            return 'pdf-lib';
          }
          if (id.includes('node_modules/pdfjs-dist')) {
            return 'pdfjs';
          }

          // OCR library (Tesseract is very large) - only for OCR pages
          if (id.includes('node_modules/tesseract')) {
            return 'tesseract';
          }

          // html2canvas - ONLY for Watermark/AddText/PDFToSvg pages
          if (id.includes('node_modules/html2canvas')) {
            return 'html2canvas';
          }

          // xlsx library - ONLY for Excel to PDF
          if (id.includes('node_modules/xlsx')) {
            return 'xlsx';
          }

          // DOMPurify - security library
          if (id.includes('node_modules/dompurify')) {
            return 'purify';
          }

          // UI libraries
          if (id.includes('node_modules/react-helmet-async')) {
            return 'ui-vendor';
          }

          // Blog-related code - separate chunk
          if (id.includes('/pages/Blog') || id.includes('/hooks/useSimpleBlog')) {
            return 'blog';
          }

          // Authority pages - separate chunk
          if (id.includes('/pages/authority/')) {
            return 'authority';
          }
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
