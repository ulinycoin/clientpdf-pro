import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    // Pre-render plugin for SEO
    {
      name: 'seo-prerender',
      generateBundle() {
        // Generate static HTML for key pages
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: generateSitemap()
        });
      }
    }
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/data': path.resolve(__dirname, './src/data'),
    }
  },

  server: {
    host: true,
    port: 3000
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom', 'react-helmet-async'],

          // PDF processing (split large libraries)
          'pdf-lib-vendor': ['pdf-lib'],
          'jspdf-vendor': ['jspdf'],
          'pdfjs-vendor': ['pdfjs-dist'],

          // Heavy processing tools
          'word-vendor': ['mammoth'],
          'ocr-vendor': ['tesseract.js'],
          'excel-vendor': ['xlsx'],

          // UI and utilities
          'ui-vendor': ['lucide-react'],
          'utils-vendor': ['franc']
        }
      }
    },
    target: 'es2020',
    minify: 'esbuild',
    chunkSizeWarningLimit: 600
  },

  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom', 'react-helmet-async',
      'pdf-lib', 'jspdf', 'pdfjs-dist', 'lucide-react',
      'mammoth', 'tesseract.js'
    ]
  }
});

function generateSitemap() {
  const baseUrl = 'https://localpdf.online';
  const currentDate = new Date().toISOString().slice(0, 10);
  const languages = ['en', 'de', 'fr', 'es', 'ru'];

  const pages = [
    { url: '/', name: 'Главная', priority: '1.0', changefreq: 'weekly' },
    { url: '/merge-pdf', name: 'merge-pdf', priority: '0.9', changefreq: 'monthly' },
    { url: '/split-pdf', name: 'split-pdf', priority: '0.9', changefreq: 'monthly' },
    { url: '/compress-pdf', name: 'compress-pdf', priority: '0.9', changefreq: 'monthly' },
    { url: '/add-text-pdf', name: 'add-text-pdf', priority: '0.8', changefreq: 'monthly' },
    { url: '/watermark-pdf', name: 'watermark-pdf', priority: '0.8', changefreq: 'monthly' },
    { url: '/rotate-pdf', name: 'rotate-pdf', priority: '0.8', changefreq: 'monthly' },
    { url: '/extract-pages-pdf', name: 'extract-pages-pdf', priority: '0.8', changefreq: 'monthly' },
    { url: '/extract-text-pdf', name: 'extract-text-pdf', priority: '0.8', changefreq: 'monthly' },
    { url: '/pdf-to-image', name: 'pdf-to-image', priority: '0.8', changefreq: 'monthly' },
    { url: '/images-to-pdf', name: 'images-to-pdf', priority: '0.8', changefreq: 'monthly' },
    { url: '/word-to-pdf', name: 'word-to-pdf', priority: '0.8', changefreq: 'monthly' },
    { url: '/excel-to-pdf', name: 'excel-to-pdf', priority: '0.8', changefreq: 'monthly' },
    { url: '/ocr-pdf', name: 'ocr-pdf', priority: '0.8', changefreq: 'monthly' },
    { url: '/privacy', name: 'privacy', priority: '0.3', changefreq: 'yearly' },
    { url: '/faq', name: 'faq', priority: '0.6', changefreq: 'monthly' }
  ];

  // Generate hreflang links for a given page
  const generateHreflangLinks = (basePage: string) => {
    return languages.map(lang => {
      const href = lang === 'en' 
        ? `${baseUrl}${basePage}`
        : `${baseUrl}/${lang}${basePage}`;
      return `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`;
    }).join('\n');
  };

  // Generate entries per page (not per language)
  let sitemapEntries = [];

  for (const page of pages) {
    const canonicalUrl = `${baseUrl}${page.url}`;
    
    sitemapEntries.push(`  <!-- ${page.name} -->
  <url>
    <loc>${canonicalUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
${generateHreflangLinks(page.url)}
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
        
${sitemapEntries.join('\n\n')}

</urlset>`;
}
