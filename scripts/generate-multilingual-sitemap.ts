import fs from 'fs';
import path from 'path';
import routePaths from '../src/config/routePaths.json';
import blogPostsData from '../src/data/blogPosts';

const baseUrl = 'https://localpdf.online';
const currentDate = new Date().toISOString().slice(0, 10);
const supportedLanguages = ['en', 'de', 'fr', 'es', 'ru'];
const defaultLanguage = 'en';

// Enhanced page priorities based on importance and traffic potential
const PAGE_PRIORITIES = {
  homepage: 1.0,
  primary_tools: 0.9,      // merge, split, compress
  secondary_tools: 0.8,    // other PDF tools
  blog_main: 0.8,
  featured_blog: 0.85,
  regular_blog: 0.7,
  static_pages: 0.6,       // privacy, faq, etc.
  guide_blog: 0.8,
  howto_blog: 0.75
};

// Change frequencies for different page types
const CHANGE_FREQUENCIES = {
  homepage: 'weekly',
  tools: 'monthly',
  blog_main: 'weekly',
  blog_posts: 'monthly',
  static_pages: 'yearly'
};

// Primary tools that get higher priority
const PRIMARY_TOOLS = ['/merge-pdf', '/split-pdf', '/compress-pdf'];

// Get actual file modification dates for lastmod (when available)
function getLastModifiedDate(filePath: string): string {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime.toISOString().slice(0, 10);
  } catch {
    return currentDate;
  }
}

// Function to get all blog posts from embedded blog data
function getBlogPosts(): { slug: string; language: string; priority: number }[] {
  const blogPosts: { slug: string; language: string; priority: number }[] = [];

  console.log('📝 Using embedded blog data for comprehensive sitemap generation');

  // Generate posts from actual blog data with enhanced priority system
  blogPostsData.forEach(post => {
    // Enhanced priority determination
    let priority = PAGE_PRIORITIES.regular_blog;

    if (post.featured) {
      priority = PAGE_PRIORITIES.featured_blog;
    } else if (post.title.includes('Guide') || post.title.includes('Complete') || post.title.includes('Ultimate')) {
      priority = PAGE_PRIORITIES.guide_blog;
    } else if (post.title.includes('How to') || post.slug.includes('how-to-') || post.title.includes('Tutorial')) {
      priority = PAGE_PRIORITIES.howto_blog;
    }

    blogPosts.push({
      slug: post.slug,
      language: post.language,
      priority
    });
  });

  console.log(`📝 Generated ${blogPosts.length} blog posts from embedded data`);
  return blogPosts;
}

// Filter for routes that should be in the sitemap (static pages, no wildcards or aliases)
const sitemapRoutes = routePaths.filter((r: any) => !r.hasDynamicPath && r.path !== '*' && r.path !== '/image-to-pdf');

function generateSitemap() {
  // Generate regular page URLs with enhanced metadata
  const regularUrlEntries = sitemapRoutes.map((route: any) => {
    const primaryLoc = `${baseUrl}${route.path}`;

    // Enhanced priority calculation
    let priority: number;
    if (route.path === '/') {
      priority = PAGE_PRIORITIES.homepage;
    } else if (route.isTool) {
      priority = PRIMARY_TOOLS.includes(route.path)
        ? PAGE_PRIORITIES.primary_tools
        : PAGE_PRIORITIES.secondary_tools;
    } else {
      priority = PAGE_PRIORITIES.static_pages;
    }

    // Enhanced change frequency
    let changefreq: string;
    if (route.path === '/') {
      changefreq = CHANGE_FREQUENCIES.homepage;
    } else if (route.isTool) {
      changefreq = CHANGE_FREQUENCIES.tools;
    } else {
      changefreq = CHANGE_FREQUENCIES.static_pages;
    }

    // Get lastmod date based on file modification or current date
    const lastmod = getLastModifiedDate(path.join(process.cwd(), 'src/pages', route.path + '.tsx')) || currentDate;

    // Generate hreflang links for all supported languages
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
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
${alternateLinks}
    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultHref}"/>
  </url>`;
  }).join('\n');

  // Generate blog main page URLs with enhanced metadata
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

    // Blog pages get updated weekly with new content
    const blogLastmod = getLastModifiedDate(path.join(process.cwd(), 'src/data/blogPosts.ts')) || currentDate;

    return `  <url>
    <loc>${blogUrl}</loc>
    <lastmod>${blogLastmod}</lastmod>
    <changefreq>${CHANGE_FREQUENCIES.blog_main}</changefreq>
    <priority>${PAGE_PRIORITIES.blog_main.toFixed(1)}</priority>
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

    // Blog posts lastmod based on blog data modification date
    const postLastmod = getLastModifiedDate(path.join(process.cwd(), 'src/data/blogPosts.ts')) || currentDate;

    return `  <url>
    <loc>${blogUrl}</loc>
    <lastmod>${postLastmod}</lastmod>
    <changefreq>${CHANGE_FREQUENCIES.blog_posts}</changefreq>
    <priority>${post.priority.toFixed(1)}</priority>
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
