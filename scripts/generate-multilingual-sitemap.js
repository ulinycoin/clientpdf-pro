#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const baseUrl = 'https://localpdf.online';
const currentDate = new Date().toISOString().slice(0, 10);

// Поддерживаемые языки
const languages = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'ru', name: 'Russian' }
];

// Основные страницы с приоритетами
const pages = [
  { url: '/', priority: '1.0', changefreq: 'weekly', key: 'home' },
  { url: '/merge-pdf', priority: '0.9', changefreq: 'monthly', key: 'merge' },
  { url: '/split-pdf', priority: '0.9', changefreq: 'monthly', key: 'split' },
  { url: '/compress-pdf', priority: '0.9', changefreq: 'monthly', key: 'compress' },
  { url: '/add-text-pdf', priority: '0.8', changefreq: 'monthly', key: 'addText' },
  { url: '/watermark-pdf', priority: '0.8', changefreq: 'monthly', key: 'watermark' },
  { url: '/rotate-pdf', priority: '0.8', changefreq: 'monthly', key: 'rotate' },
  { url: '/extract-pages-pdf', priority: '0.8', changefreq: 'monthly', key: 'extractPages' },
  { url: '/extract-text-pdf', priority: '0.8', changefreq: 'monthly', key: 'extractText' },
  { url: '/pdf-to-image', priority: '0.8', changefreq: 'monthly', key: 'pdfToImage' },
  { url: '/images-to-pdf', priority: '0.8', changefreq: 'monthly', key: 'imagesToPdf' },
  { url: '/word-to-pdf', priority: '0.8', changefreq: 'monthly', key: 'wordToPdf' },
  { url: '/excel-to-pdf', priority: '0.8', changefreq: 'monthly', key: 'excelToPdf' },
  { url: '/ocr-pdf', priority: '0.8', changefreq: 'monthly', key: 'ocrPdf' },
  { url: '/privacy', priority: '0.3', changefreq: 'yearly', key: 'privacy' },
  { url: '/faq', priority: '0.6', changefreq: 'monthly', key: 'faq' }
];

// Функция для генерации альтернативных ссылок для каждой страницы
function generateAlternateLinks(page) {
  return languages.map(lang => {
    const url = lang.code === 'en' ? page.url : `/${lang.code}${page.url}`;
    return `    <xhtml:link rel="alternate" hreflang="${lang.code}" href="${baseUrl}${url}"/>`;
  }).join('\n');
}

// Функция для генерации мультиязычного sitemap
function generateMultilingualSitemap() {
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

`;

  // Генерируем URL для каждого языка
  for (const page of pages) {
    for (const lang of languages) {
      const url = lang.code === 'en' ? page.url : `/${lang.code}${page.url}`;
      const alternateLinks = generateAlternateLinks(page);
      
      sitemap += `  <url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
${alternateLinks}
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${pages.find(p => p.key === page.key).url}"/>
  </url>
`;
    }
  }

  sitemap += `</urlset>`;
  return sitemap;
}

// Функция для генерации простого sitemap (как есть сейчас)
function generateSimpleSitemap() {
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

`;

  // Только английские URL (как текущий sitemap)
  for (const page of pages) {
    sitemap += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  }

  sitemap += `</urlset>`;
  return sitemap;
}

// Основная функция
function generateSitemaps() {
  const publicPath = path.join(process.cwd(), 'public');
  const distPath = path.join(process.cwd(), 'dist');

  // Генерируем мультиязычный sitemap
  const multilingualSitemap = generateMultilingualSitemap();
  const simpleSitemap = generateSimpleSitemap();

  // Сохраняем мультиязычный sitemap
  fs.writeFileSync(path.join(publicPath, 'sitemap-multilingual.xml'), multilingualSitemap);
  console.log('✅ Generated multilingual sitemap: public/sitemap-multilingual.xml');
  
  // Обновляем основной sitemap (пока оставляем простой для совместимости)
  fs.writeFileSync(path.join(publicPath, 'sitemap.xml'), simpleSitemap);
  console.log('✅ Updated main sitemap: public/sitemap.xml');

  // Копируем в dist если существует
  if (fs.existsSync(distPath)) {
    fs.writeFileSync(path.join(distPath, 'sitemap-multilingual.xml'), multilingualSitemap);
    fs.writeFileSync(path.join(distPath, 'sitemap.xml'), simpleSitemap);
    console.log('✅ Copied sitemaps to dist/');
  }

  console.log(`📊 Generated sitemaps with:`);
  console.log(`   - ${pages.length} base pages`);
  console.log(`   - ${languages.length} languages`);
  console.log(`   - ${pages.length * languages.length} total multilingual URLs`);
}

// Запускаем генерацию
generateSitemaps();