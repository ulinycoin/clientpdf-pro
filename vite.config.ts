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
          'jspdf-vendor': ['jspdf', 'jspdf-autotable'],
          'pdfjs-vendor': ['pdfjs-dist'],

          // Heavy processing tools
          'word-vendor': ['mammoth', 'html2canvas'],
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
      'mammoth', 'html2canvas', 'tesseract.js'
    ]
  }
});

function generateSitemap() {
  const baseUrl = 'https://localpdf.online';
  const currentDate = new Date().toISOString().slice(0, 10);

  const pages = [
    { url: '', priority: '1.0', changefreq: 'weekly' },
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
    { url: '/privacy', priority: '0.6', changefreq: 'yearly' },
    { url: '/faq', priority: '0.7', changefreq: 'monthly' },
    { url: '/how-to-use', priority: '0.6', changefreq: 'monthly' }
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}
