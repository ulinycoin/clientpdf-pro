import fs from 'fs';
import path from 'path';
import routePaths from '../src/config/routePaths.json';

const baseUrl = 'https://localpdf.online';
const currentDate = new Date().toISOString().slice(0, 10);
const supportedLanguages = ['en', 'de', 'fr', 'es', 'ru'];
const defaultLanguage = 'en';

// Filter for routes that should be in the sitemap (static pages, no wildcards or aliases)
const sitemapRoutes = routePaths.filter((r: any) => !r.hasDynamicPath && r.path !== '*' && r.path !== '/image-to-pdf');

function generateSitemap() {
  const urlEntries = sitemapRoutes.map((route: any) => {
    const primaryLoc = `${baseUrl}${route.path}`;

    const alternateLinks = supportedLanguages.map(lang => {
      let href;
      if (lang === defaultLanguage) {
        href = primaryLoc;
      } else {
        href = route.path === '/' ? `${baseUrl}/${lang}/` : `${baseUrl}/${lang}${route.path}`;
      }
      return `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`;
    }).join('\n');

    const xDefaultHref = primaryLoc;

    return `  <url>
    <loc>${primaryLoc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.path === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${route.isTool ? '0.9' : (route.path === '/' ? '1.0' : '0.7')}</priority>
${alternateLinks}
    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultHref}"/>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;
}

function run() {
  const publicPath = path.resolve(process.cwd(), 'public');
  const sitemapContent = generateSitemap();

  fs.writeFileSync(path.join(publicPath, 'sitemap.xml'), sitemapContent);
  console.log('✅ Generated single multilingual sitemap: public/sitemap.xml');

  const oldSitemapPath = path.join(publicPath, 'sitemap-multilingual.xml');
  if (fs.existsSync(oldSitemapPath)) {
    fs.unlinkSync(oldSitemapPath);
    console.log('🗑️ Removed redundant sitemap: public/sitemap-multilingual.xml');
  }

  console.log(`📊 Sitemap generated with ${sitemapRoutes.length} pages across ${supportedLanguages.length} languages.`);
}

run();
