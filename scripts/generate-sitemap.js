#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const baseUrl = 'https://localpdf.online';
const currentDate = new Date().toISOString().slice(0, 10);

const pages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/merge-pdf', priority: '0.9', changefreq: 'monthly' },
  { url: '/split-pdf', priority: '0.9', changefreq: 'monthly' },
  { url: '/compress-pdf', priority: '0.9', changefreq: 'monthly' },
  { url: '/add-text-pdf', priority: '0.8', changefreq: 'monthly' },
  { url: '/watermark-pdf', priority: '0.8', changefreq: 'monthly' },
  { url: '/rotate-pdf', priority: '0.8', changefreq: 'monthly' },
  { url: '/extract-pages-pdf', priority: '0.8', changefreq: 'monthly' },
  { url: '/extract-text-pdf', priority: '0.8', changefreq: 'monthly' },
  { url: '/pdf-to-image', priority: '0.8', changefreq: 'monthly' },
  { url: '/images-to-pdf', priority: '0.8', changefreq: 'monthly' },
  { url: '/word-to-pdf', priority: '0.8', changefreq: 'monthly' },
  { url: '/excel-to-pdf', priority: '0.8', changefreq: 'monthly' },
  { url: '/ocr-pdf', priority: '0.8', changefreq: 'monthly' },
  { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { url: '/faq', priority: '0.6', changefreq: 'monthly' }
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}

</urlset>`;

// Write to both public and dist directories
const publicPath = path.join(process.cwd(), 'public', 'sitemap.xml');
const distPath = path.join(process.cwd(), 'dist', 'sitemap.xml');

fs.writeFileSync(publicPath, sitemap);
console.log('✅ Generated sitemap.xml in public/');

if (fs.existsSync(path.dirname(distPath))) {
  fs.writeFileSync(distPath, sitemap);
  console.log('✅ Generated sitemap.xml in dist/');
}

console.log(`📊 Generated sitemap with ${pages.length} pages`);
