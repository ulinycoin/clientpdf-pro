import fs from 'fs';
import path from 'path';
import routePaths from '../src/config/routePaths.json';

const baseUrl = 'https://localpdf.online';
const currentDate = new Date().toISOString().slice(0, 10);
const supportedLanguages = ['en', 'de', 'fr', 'es', 'ru'];
const defaultLanguage = 'en';

// Static list of blog posts - reliable for all environments
const BLOG_POSTS = [
  'complete-guide-pdf-merging-2025',
  'how-to-add-text-to-pdf',
  'how-to-convert-excel-to-pdf',
  'how-to-convert-image-to-pdf',
  'how-to-convert-pdf-to-image',
  'how-to-convert-pdf-to-svg',
  'how-to-convert-word-to-pdf',
  'how-to-extract-images-from-pdf',
  'how-to-extract-pages-from-pdf',
  'how-to-extract-text-from-pdf',
  'how-to-rotate-pdf-files',
  'how-to-split-pdf-files',
  'how-to-watermark-pdf-files',
  'ocr-pdf-ultimate-guide',
  'pdf-accessibility-wcag-compliance',
  'pdf-compression-guide',
  'pdf-security-guide',
  'protect-pdf-guide'
];

// Function to get all blog posts from content directory
function getBlogPosts(): { slug: string; language: string; priority: number }[] {
  const blogPosts: { slug: string; language: string; priority: number }[] = [];

  console.log('📝 Using static blog post list for reliable sitemap generation');

  // Generate posts for all languages
  BLOG_POSTS.forEach(slug => {
    supportedLanguages.forEach(lang => {
      // Determine priority based on article type
      let priority = 0.7; // Default blog post priority
      if (slug.includes('guide') || slug.includes('complete-guide')) {
        priority = 0.8; // Higher priority for comprehensive guides
      }
      if (slug.includes('how-to-')) {
        priority = 0.75; // Medium-high priority for how-to articles
      }

      blogPosts.push({ slug, language: lang, priority });
    });
  });

  console.log(`📝 Generated ${blogPosts.length} blog posts across ${supportedLanguages.length} languages`);
  return blogPosts;
}

// Filter for routes that should be in the sitemap (static pages, no wildcards or aliases)
const sitemapRoutes = routePaths.filter((r: any) => !r.hasDynamicPath && r.path !== '*' && r.path !== '/image-to-pdf');

function generateSitemap() {
  // Generate regular page URLs
  const regularUrlEntries = sitemapRoutes.map((route: any) => {
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

  // Generate blog main page URLs
  const blogMainEntries = supportedLanguages.map(lang => {
    const blogUrl = lang === defaultLanguage 
      ? `${baseUrl}/blog`
      : `${baseUrl}/${lang}/blog`;
    
    const alternateLinks = supportedLanguages.map(altLang => {
      const href = altLang === defaultLanguage 
        ? `${baseUrl}/blog`
        : `${baseUrl}/${altLang}/blog`;
      return `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${href}"/>`;
    }).join('\n');

    return `  <url>
    <loc>${blogUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
${alternateLinks}
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/blog"/>
  </url>`;
  }).join('\n');

  // Generate blog post URLs
  const blogPosts = getBlogPosts();
  const blogPostEntries = blogPosts.map(post => {
    const blogUrl = post.language === defaultLanguage 
      ? `${baseUrl}/blog/${post.slug}`
      : `${baseUrl}/${post.language}/blog/${post.slug}`;

    // Find alternate languages for this post
    const alternatesForThisPost = blogPosts.filter(p => p.slug === post.slug);
    const alternateLinks = alternatesForThisPost.map(altPost => {
      const href = altPost.language === defaultLanguage 
        ? `${baseUrl}/blog/${altPost.slug}`
        : `${baseUrl}/${altPost.language}/blog/${altPost.slug}`;
      return `    <xhtml:link rel="alternate" hreflang="${altPost.language}" href="${href}"/>`;
    }).join('\n');

    // Use English version as x-default if available, otherwise the first available
    const defaultPost = alternatesForThisPost.find(p => p.language === defaultLanguage) || alternatesForThisPost[0];
    const xDefaultHref = defaultPost.language === defaultLanguage
      ? `${baseUrl}/blog/${defaultPost.slug}`
      : `${baseUrl}/${defaultPost.language}/blog/${defaultPost.slug}`;

    return `  <url>
    <loc>${blogUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${post.priority}</priority>
${alternateLinks}
    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultHref}"/>
  </url>`;
  }).join('\n');

  const allEntries = [regularUrlEntries, blogMainEntries, blogPostEntries]
    .filter(entries => entries.length > 0)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allEntries}
</urlset>`;
}

function run() {
  const publicPath = path.resolve(process.cwd(), 'public');
  const blogPosts = getBlogPosts();
  const sitemapContent = generateSitemap();

  fs.writeFileSync(path.join(publicPath, 'sitemap.xml'), sitemapContent);
  console.log('✅ Generated comprehensive multilingual sitemap: public/sitemap.xml');

  const oldSitemapPath = path.join(publicPath, 'sitemap-multilingual.xml');
  if (fs.existsSync(oldSitemapPath)) {
    fs.unlinkSync(oldSitemapPath);
    console.log('🗑️ Removed redundant sitemap: public/sitemap-multilingual.xml');
  }

  // Update indexnow-sitemap.xml as well
  const indexNowSitemapPath = path.join(publicPath, 'indexnow-sitemap.xml');
  fs.writeFileSync(indexNowSitemapPath, sitemapContent);
  console.log('✅ Updated IndexNow sitemap: public/indexnow-sitemap.xml');

  const totalStaticPages = sitemapRoutes.length;
  const totalBlogPages = supportedLanguages.length; // Main blog pages for each language
  const totalBlogPosts = blogPosts.length;
  const totalUrls = totalStaticPages + totalBlogPages + totalBlogPosts;

  console.log(`📊 Sitemap generated successfully:`);
  console.log(`   • ${totalStaticPages} static pages`);
  console.log(`   • ${totalBlogPages} blog main pages (${supportedLanguages.length} languages)`);
  console.log(`   • ${totalBlogPosts} blog articles`);
  console.log(`   • ${totalUrls} total URLs`);
  console.log(`   • ${supportedLanguages.length} languages supported`);
}

run();
