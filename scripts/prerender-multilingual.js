#!/usr/bin/env node

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const distPath = 'dist';
const port = 4175;
const baseUrl = `http://localhost:${port}`;

// Поддерживаемые языки
const languages = [
  { code: 'en', name: 'English', domain: 'localpdf.online' },
  { code: 'de', name: 'German', domain: 'localpdf.online' },
  { code: 'fr', name: 'French', domain: 'localpdf.online' },
  { code: 'es', name: 'Spanish', domain: 'localpdf.online' },
  { code: 'ru', name: 'Russian', domain: 'localpdf.online' }
];

// Основные маршруты
const baseRoutes = [
  { path: '/', key: 'home' },
  { path: '/merge-pdf', key: 'merge' },
  { path: '/split-pdf', key: 'split' },
  { path: '/compress-pdf', key: 'compress' },
  { path: '/add-text-pdf', key: 'addText' },
  { path: '/watermark-pdf', key: 'watermark' },
  { path: '/rotate-pdf', key: 'rotate' },
  { path: '/extract-pages-pdf', key: 'extractPages' },
  { path: '/extract-text-pdf', key: 'extractText' },
  { path: '/pdf-to-image', key: 'pdfToImage' },
  { path: '/images-to-pdf', key: 'imagesToPdf' },
  { path: '/word-to-pdf', key: 'wordToPdf' },
  { path: '/excel-to-pdf', key: 'excelToPdf' },
  { path: '/ocr-pdf', key: 'ocrPdf' },
  { path: '/privacy', key: 'privacy' },
  { path: '/faq', key: 'faq' }
];

// SEO данные для разных языков
const seoData = {
  en: {
    home: {
      title: 'LocalPDF - Free Privacy-First PDF Tools | Merge, Split, Compress',
      description: '13 powerful PDF tools that work entirely in your browser. 100% private - no uploads, no tracking. Free forever.'
    },
    merge: {
      title: 'Merge PDF Online Free - Privacy-First PDF Combiner | LocalPDF',
      description: 'Merge PDF files online without uploading to servers. 100% private PDF merger works in your browser.'
    },
    split: {
      title: 'Split PDF Online Free - Privacy-First PDF Splitter | LocalPDF',
      description: 'Split PDF files without uploading to servers. 100% private PDF splitter works in your browser.'
    },
    compress: {
      title: 'Compress PDF Online Free - PDF Size Reducer | LocalPDF',
      description: 'Compress PDF files without uploading to servers. Reduce file size while maintaining quality.'
    },
    privacy: {
      title: 'Privacy Policy - LocalPDF | 100% Private PDF Processing',
      description: 'LocalPDF privacy policy. 100% local PDF processing. No uploads, no tracking, no data collection.'
    },
    faq: {
      title: 'FAQ - Frequently Asked Questions | LocalPDF',
      description: 'Get answers to common questions about LocalPDF privacy-first PDF tools and features.'
    }
  },
  de: {
    home: {
      title: 'LocalPDF - Kostenlose datenschutzfreundliche PDF-Tools | Zusammenführen, Teilen, Komprimieren',
      description: '13 leistungsstarke PDF-Tools, die vollständig in Ihrem Browser funktionieren. 100% privat - keine Uploads, kein Tracking.'
    },
    merge: {
      title: 'PDF Online Zusammenführen Kostenlos - Datenschutz-erste PDF-Kombinierer | LocalPDF',
      description: 'PDF-Dateien online zusammenführen ohne Upload auf Server. 100% privater PDF-Merger funktioniert in Ihrem Browser.'
    },
    split: {
      title: 'PDF Online Teilen Kostenlos - Datenschutz-erste PDF-Splitter | LocalPDF',
      description: 'PDF-Dateien teilen ohne Upload auf Server. 100% privater PDF-Splitter funktioniert in Ihrem Browser.'
    },
    compress: {
      title: 'PDF Online Komprimieren Kostenlos - PDF-Größen-Reduzierer | LocalPDF',
      description: 'PDF-Dateien komprimieren ohne Upload auf Server. Dateigröße reduzieren bei erhaltener Qualität.'
    },
    privacy: {
      title: 'Datenschutzrichtlinie - LocalPDF | 100% Private PDF-Verarbeitung',
      description: 'LocalPDF Datenschutzrichtlinie. 100% lokale PDF-Verarbeitung. Keine Uploads, kein Tracking, keine Datensammlung.'
    },
    faq: {
      title: 'FAQ - Häufig Gestellte Fragen | LocalPDF',
      description: 'Erhalten Sie Antworten auf häufige Fragen zu LocalPDF datenschutzfreundlichen PDF-Tools und Features.'
    }
  },
  ru: {
    home: {
      title: 'LocalPDF - Бесплатные PDF инструменты с защитой конфиденциальности | Объединить, Разделить, Сжать',
      description: '13 мощных PDF инструментов, работающих полностью в вашем браузере. 100% приватно - без загрузок, без отслеживания.'
    },
    merge: {
      title: 'Объединить PDF Онлайн Бесплатно - Приватный PDF Объединитель | LocalPDF',
      description: 'Объединяйте PDF файлы онлайн без загрузки на серверы. 100% приватный PDF объединитель работает в вашем браузере.'
    },
    split: {
      title: 'Разделить PDF Онлайн Бесплатно - Приватный PDF Разделитель | LocalPDF',
      description: 'Разделяйте PDF файлы без загрузки на серверы. 100% приватный PDF разделитель работает в вашем браузере.'
    },
    compress: {
      title: 'Сжать PDF Онлайн Бесплатно - Уменьшитель Размера PDF | LocalPDF',
      description: 'Сжимайте PDF файлы без загрузки на серверы. Уменьшайте размер файла сохраняя качество.'
    },
    privacy: {
      title: 'Политика Конфиденциальности - LocalPDF | 100% Приватная Обработка PDF',
      description: 'Политика конфиденциальности LocalPDF. 100% локальная обработка PDF. Без загрузок, без отслеживания, без сбора данных.'
    },
    faq: {
      title: 'FAQ - Часто Задаваемые Вопросы | LocalPDF',
      description: 'Получите ответы на распространенные вопросы о приватных PDF инструментах и функциях LocalPDF.'
    }
  },
  fr: {
    home: {
      title: 'LocalPDF - Outils PDF Gratuits Axés sur la Confidentialité | Fusionner, Diviser, Compresser',
      description: '13 outils PDF puissants qui fonctionnent entièrement dans votre navigateur. 100% privé - pas de téléchargements, pas de suivi.'
    },
    merge: {
      title: 'Fusionner PDF En Ligne Gratuit - Fusionneur PDF Axé sur la Confidentialité | LocalPDF',
      description: 'Fusionnez des fichiers PDF en ligne sans téléchargement sur serveurs. Fusionneur PDF 100% privé fonctionne dans votre navigateur.'
    },
    privacy: {
      title: 'Politique de Confidentialité - LocalPDF | Traitement PDF 100% Privé',
      description: 'Politique de confidentialité LocalPDF. Traitement PDF 100% local. Pas de téléchargements, pas de suivi, pas de collecte de données.'
    }
  },
  es: {
    home: {
      title: 'LocalPDF - Herramientas PDF Gratuitas Centradas en la Privacidad | Combinar, Dividir, Comprimir',
      description: '13 poderosas herramientas PDF que funcionan completamente en tu navegador. 100% privado - sin subidas, sin rastreo.'
    },
    merge: {
      title: 'Combinar PDF En Línea Gratis - Combinador PDF Centrado en la Privacidad | LocalPDF',
      description: 'Combina archivos PDF en línea sin subir a servidores. Combinador PDF 100% privado funciona en tu navegador.'
    },
    privacy: {
      title: 'Política de Privacidad - LocalPDF | Procesamiento PDF 100% Privado',
      description: 'Política de privacidad LocalPDF. Procesamiento PDF 100% local. Sin subidas, sin rastreo, sin recopilación de datos.'
    }
  }
};

// Функция для получения всех возможных комбинаций язык-маршрут
function generateAllRoutes() {
  const allRoutes = [];

  for (const lang of languages) {
    for (const route of baseRoutes) {
      // Для английского - без префикса языка
      const routePath = lang.code === 'en' ? route.path : `/${lang.code}${route.path}`;
      
      // Получаем SEO данные для этого языка и маршрута
      const langSeoData = seoData[lang.code] || seoData.en;
      const routeSeoData = langSeoData[route.key] || langSeoData.home;

      allRoutes.push({
        path: routePath,
        language: lang.code,
        routeKey: route.key,
        originalPath: route.path,
        fileName: lang.code === 'en' ? 
          (route.path === '/' ? 'index.html' : `${route.path.slice(1)}.html`) :
          (route.path === '/' ? `${lang.code}/index.html` : `${lang.code}${route.path}.html`),
        title: routeSeoData.title,
        description: routeSeoData.description,
        canonical: `https://${lang.domain}${routePath}`,
        hreflang: lang.code
      });
    }
  }

  return allRoutes;
}

// Функция для генерации hreflang тегов
function generateHrefLangTags(currentRoute, allRoutes) {
  const hrefLangTags = [];
  const routeKey = currentRoute.routeKey;
  
  // Найти все языковые версии этой страницы
  const alternateVersions = allRoutes.filter(r => r.routeKey === routeKey);
  
  for (const version of alternateVersions) {
    hrefLangTags.push(`<link rel="alternate" hreflang="${version.hreflang}" href="${version.canonical}" />`);
  }
  
  // Добавить x-default для английской версии
  const englishVersion = alternateVersions.find(r => r.language === 'en');
  if (englishVersion) {
    hrefLangTags.push(`<link rel="alternate" hreflang="x-default" href="${englishVersion.canonical}" />`);
  }
  
  return hrefLangTags.join('\n  ');
}

async function startPreviewServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting preview server...');
    const server = spawn('npx', ['vite', 'preview', '--port', port.toString()], {
      stdio: 'pipe'
    });

    server.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') || output.includes(`localhost:${port}`)) {
        console.log(`✅ Server running on ${baseUrl}`);
        setTimeout(() => resolve(server), 3000);
      }
    });

    server.stderr.on('data', (data) => {
      console.error(`Server error: ${data}`);
    });

    server.on('error', (error) => {
      console.error(`Failed to start server: ${error}`);
      reject(error);
    });

    setTimeout(() => resolve(server), 8000);
  });
}

async function prerenderMultilingualRoutes() {
  let server;
  const allRoutes = generateAllRoutes();
  
  console.log(`📊 Total routes to prerender: ${allRoutes.length}`);
  console.log(`🌍 Languages: ${languages.map(l => l.code).join(', ')}`);

  try {
    server = await startPreviewServer();

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    
    // Установить user agent
    await page.setUserAgent('Mozilla/5.0 (compatible; LocalPDF-Prerenderer/1.0; +https://localpdf.online)');

    console.log('📄 Starting multilingual pre-rendering...');

    for (const route of allRoutes) {
      try {
        console.log(`🔄 [${route.language.toUpperCase()}] Pre-rendering: ${route.path}`);

        // Переходим на оригинальный путь с параметром языка
        const url = `${baseUrl}${route.originalPath}?lang=${route.language}&prerender=true`;
        
        await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });

        // Ждем загрузки React приложения
        await page.waitForSelector('#root > *', { timeout: 15000 });
        
        // Ждем загрузки переводов (важно для мультиязычности)
        await page.waitForTimeout(3000);
        
        // Выполняем JavaScript для установки языка
        await page.evaluate((lang) => {
          // Устанавливаем язык в localStorage
          localStorage.setItem('localpdf-language', lang);
          
          // Устанавливаем атрибут lang в html
          document.documentElement.lang = lang;
          
          // Trigger language change event if available
          if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
          }
        }, route.language);

        // Еще немного ждем после смены языка
        await page.waitForTimeout(2000);

        // Получаем отрендеренный HTML
        const html = await page.content();

        // Создаем директорию если нужно
        const filePath = path.join(distPath, route.fileName);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // Получаем hreflang теги
        const hrefLangTags = generateHrefLangTags(route, allRoutes);

        // Обновляем HTML с правильными мета-тегами
        const updatedHtml = html
          .replace(/<html[^>]*>/, `<html lang="${route.language}">`)
          .replace(/<title>.*?<\/title>/i, `<title>${route.title}</title>`)
          .replace(/(<meta name="description" content=")[^"]*(")/i, `$1${route.description}$2`)
          .replace(/(<link rel="canonical" href=")[^"]*(")/i, `$1${route.canonical}$2`)
          .replace(/(<meta property="og:url" content=")[^"]*(")/i, `$1${route.canonical}$2`)
          .replace(/(<meta property="og:title" content=")[^"]*(")/i, `$1${route.title}$2`)
          .replace(/(<meta property="og:description" content=")[^"]*(")/i, `$1${route.description}$2`)
          .replace(/(<meta name="twitter:title" content=")[^"]*(")/i, `$1${route.title}$2`)
          .replace(/(<meta name="twitter:description" content=")[^"]*(")/i, `$1${route.description}$2`)
          // Добавляем hreflang теги в head
          .replace('</head>', `  ${hrefLangTags}\n</head>`);

        // Сохраняем файл
        fs.writeFileSync(filePath, updatedHtml);
        console.log(`✅ [${route.language.toUpperCase()}] Generated: ${route.fileName}`);

      } catch (error) {
        console.error(`❌ [${route.language.toUpperCase()}] Error pre-rendering ${route.path}:`, error.message);
        
        // Создаем fallback HTML
        const fallbackHtml = createFallbackHTML(route, allRoutes);
        const filePath = path.join(distPath, route.fileName);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, fallbackHtml);
        console.log(`⚠️  [${route.language.toUpperCase()}] Created fallback: ${route.fileName}`);
      }
    }

    await browser.close();
    console.log('🎉 Multilingual pre-rendering completed!');
    console.log(`📁 Generated ${allRoutes.length} pages in ${languages.length} languages`);

  } catch (error) {
    console.error('💥 Pre-rendering failed:', error);
  } finally {
    if (server) {
      server.kill();
      console.log('🛑 Preview server stopped');
    }
  }
}

function createFallbackHTML(route, allRoutes) {
  const hrefLangTags = generateHrefLangTags(route, allRoutes);
  
  return `<!DOCTYPE html>
<html lang="${route.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${route.title}</title>
  <meta name="description" content="${route.description}">
  <link rel="canonical" href="${route.canonical}">
  <meta name="robots" content="index,follow">
  ${hrefLangTags}
  
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${route.title}">
  <meta property="og:description" content="${route.description}">
  <meta property="og:url" content="${route.canonical}">
  <meta property="og:site_name" content="LocalPDF">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${route.title}">
  <meta name="twitter:description" content="${route.description}">
</head>
<body>
  <div id="root">
    <noscript>
      <h1>${route.title.split(' | ')[0]}</h1>
      <p>${route.description}</p>
      <p>This tool requires JavaScript to function. Please enable JavaScript in your browser.</p>
    </noscript>
  </div>
  <script>
    // Set language preference
    localStorage.setItem('localpdf-language', '${route.language}');
    document.documentElement.lang = '${route.language}';
  </script>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;
}

prerenderMultilingualRoutes().catch(console.error);