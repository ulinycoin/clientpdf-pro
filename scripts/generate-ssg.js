#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Языки и маршруты для генерации
const languages = ['en', 'de', 'fr', 'es', 'ru'];
const baseRoutes = [
  '/',
  '/merge-pdf',
  '/split-pdf', 
  '/compress-pdf',
  '/add-text-pdf',
  '/watermark-pdf',
  '/rotate-pdf',
  '/extract-pages-pdf',
  '/extract-text-pdf',
  '/pdf-to-image',
  '/images-to-pdf',
  '/word-to-pdf',
  '/excel-to-pdf',
  '/ocr-pdf',
  '/privacy',
  '/terms',
  '/gdpr',
  '/faq'
];

// Генерация всех маршрутов с языками
function generateAllRoutes() {
  const allRoutes = [];
  
  for (const lang of languages) {
    for (const route of baseRoutes) {
      if (lang === 'en') {
        // Английские маршруты без префикса
        allRoutes.push(route === '/' ? '/' : route);
      } else {
        // Маршруты с языковым префиксом
        allRoutes.push(route === '/' ? `/${lang}` : `/${lang}${route}`);
      }
    }
  }
  
  return allRoutes;
}

// Запуск dev сервера
function startDevServer() {
  log('🚀 Starting development server...', 'blue');
  
  const devProcess = execSync('npm run dev > /dev/null 2>&1 &', { 
    stdio: 'pipe',
    shell: true 
  });
  
  // Ждем запуска сервера
  return new Promise((resolve) => {
    setTimeout(() => {
      log('✅ Development server started', 'green');
      resolve();
    }, 5000);
  });
}

// Генерация статических страниц
async function generateStaticPages() {
  log('📄 Generating static pages...', 'blue');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  const routes = generateAllRoutes();
  const distDir = './dist';
  
  // Создаем директории для языков
  for (const lang of languages) {
    if (lang !== 'en') {
      const langDir = path.join(distDir, lang);
      if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir, { recursive: true });
      }
    }
  }
  
  let successCount = 0;
  let failedCount = 0;
  
  for (const route of routes) {
    try {
      log(`Generating: ${route}`, 'yellow');
      
      // Навигация на страницу
      await page.goto(`http://localhost:3000${route}`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      // Ждем загрузки контента
      await page.waitForSelector('#root > *', { timeout: 10000 });
      
      // Ждем загрузки i18n и lazy components
      await page.evaluate(() => {
        return new Promise((resolve) => {
          // Ждем загрузки переводов
          const checkTranslations = () => {
            const hasContent = document.querySelector('#root')?.textContent?.trim();
            if (hasContent && hasContent.length > 100) {
              resolve();
            } else {
              setTimeout(checkTranslations, 500);
            }
          };
          checkTranslations();
        });
      });
      
      // Дополнительная пауза для hydration
      await page.waitForTimeout(3000);
      
      // Получаем полный HTML
      const html = await page.content();
      
      // Определяем путь к файлу
      let filePath;
      if (route === '/') {
        filePath = path.join(distDir, 'index.html');
      } else if (languages.some(lang => route.startsWith(`/${lang}`))) {
        // Многоязычные маршруты (кроме английского)
        const lang = route.match(/^\/([a-z]{2})/)[1];
        const routeWithoutLang = route.replace(/^\/[a-z]{2}/, '') || '/';
        
        if (routeWithoutLang === '/') {
          // Главная страница языка: /de -> /de/index.html
          filePath = path.join(distDir, lang, 'index.html');
        } else {
          // Инструменты: /de/merge-pdf -> /de/merge-pdf.html
          const fileName = routeWithoutLang.substring(1) + '.html';
          filePath = path.join(distDir, lang, fileName);
        }
      } else {
        // Английские маршруты без префикса
        filePath = path.join(distDir, route.substring(1) + '.html');
      }
      
      // Создаем директорию если не существует
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Сохраняем HTML
      fs.writeFileSync(filePath, html, 'utf8');
      
      successCount++;
      log(`✅ Generated: ${filePath}`, 'green');
      
    } catch (error) {
      failedCount++;
      log(`❌ Failed to generate ${route}: ${error.message}`, 'red');
    }
  }
  
  await browser.close();
  
  log(`📊 Generation complete: ${successCount} success, ${failedCount} failed`, successCount > failedCount ? 'green' : 'red');
  
  return { successCount, failedCount };
}

// Остановка dev сервера
function stopDevServer() {
  try {
    execSync('pkill -f "vite.*--port.*3000"', { stdio: 'ignore' });
    log('🛑 Development server stopped', 'yellow');
  } catch (error) {
    // Игнорируем ошибки при остановке
  }
}

// Основная функция
async function main() {
  try {
    log('🏗️  Starting Static Site Generation...', 'blue');
    
    // Сначала собираем обычный build
    log('📦 Building application...', 'blue');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Запускаем dev сервер для рендеринга
    await startDevServer();
    
    // Генерируем статические страницы
    const result = await generateStaticPages();
    
    // Останавливаем dev сервер
    stopDevServer();
    
    if (result.successCount > 0) {
      log('🎉 Static Site Generation completed successfully!', 'green');
      log(`📄 Generated ${result.successCount} static pages`, 'green');
    } else {
      log('❌ Static Site Generation failed', 'red');
      process.exit(1);
    }
    
  } catch (error) {
    log(`💥 Error during SSG: ${error.message}`, 'red');
    stopDevServer();
    process.exit(1);
  }
}

main();