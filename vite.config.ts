import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// This helper function generates a minimal HTML shell for pre-rendering.
function generatePrerenderedHTML(lang: string, canonicalUrl: string, indexJsFile: string, indexCssFile: string) {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LocalPDF</title>
  <meta name="description" content="Privacy-first PDF tools that work entirely in your browser.">
  <link rel="canonical" href="${canonicalUrl}">
  ${indexJsFile ? `<script type="module" crossorigin src="/${indexJsFile}"></script>` : ''}
  ${indexCssFile ? `<link rel="stylesheet" href="/${indexCssFile}"></script>` : ''}
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
}

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
    {
      name: 'pre-render-routes',
      apply: 'build',
      generateBundle(options, bundle) {
        console.log('Starting pre-rendering...');

        // Find the generated JS and CSS assets
        let indexJsFile = '';
        let indexCssFile = '';
        for (const fileName in bundle) {
          if (fileName.startsWith('assets/index-') && fileName.endsWith('.js')) {
            indexJsFile = fileName;
          }
          if (fileName.startsWith('assets/index-') && fileName.endsWith('.css')) {
            indexCssFile = fileName;
          }
        }

        // Safely read route paths from the JSON file
        const routePaths = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'src/config/routePaths.json'), 'utf-8'));
        const staticRoutes = routePaths.filter((r: any) => !r.hasDynamicPath && r.path !== '*');
        const supportedLanguages = ['en', 'de', 'fr', 'es', 'ru'];
        const defaultLanguage = 'en';
        const baseUrl = 'https://localpdf.online';

        console.log(`Found ${staticRoutes.length} static routes to pre-render for ${supportedLanguages.length} languages.`);

        for (const route of staticRoutes) {
          for (const lang of supportedLanguages) {
            let filePath;
            let canonicalUrl;

            if (lang === defaultLanguage) {
              filePath = route.path === '/' ? 'index.html' : `${route.path.substring(1)}.html`;
              canonicalUrl = `${baseUrl}${route.path}`;
            } else {
              const localizedPath = route.path === '/' ? `/${lang}/` : `/${lang}${route.path}`;
              filePath = `${localizedPath.substring(1)}.html`;
              canonicalUrl = `${baseUrl}${localizedPath}`;
            }
            
            filePath = filePath.replace(/^\//, '');
            if (filePath.endsWith('/')) {
                filePath += 'index.html';
            }

            const html = generatePrerenderedHTML(lang, canonicalUrl, indexJsFile, indexCssFile);
            this.emitFile({
              type: 'asset',
              fileName: filePath,
              source: html,
            });
          }
        }
        console.log('Pre-rendering complete.');
      },
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
    rollupOptions: {
      // Включаем markdown файлы в сборку как статические ресурсы
      external: [],
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
});
