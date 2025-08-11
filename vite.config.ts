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
        // Generate sitemap
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: generateSitemap()
        });

        // Generate pre-rendered HTML pages with proper SEO tags
        const routes = [
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
          '/faq'
        ];

        routes.forEach(route => {
          const toolKey = route.replace('/', '').replace(/-/g, '');
          const fileName = route.slice(1) + '.html';
          
          this.emitFile({
            type: 'asset',
            fileName,
            source: generatePrerenderedHTML(route, toolKey)
          });
        });
      }
    }
  ],


  server: {
    host: true,
    port: 3000
  },

  build: {
    target: 'es2020',
    minify: 'esbuild',
    chunkSizeWarningLimit: 500,
    sourcemap: false,
    
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Core React dependencies
            if (id.includes('react') && !id.includes('router')) {
              return 'react-vendor';
            }
            if (id.includes('react-router') || id.includes('react-helmet')) {
              return 'router-vendor';
            }
            
            // Heavy PDF processing libraries
            if (id.includes('pdf-lib')) {
              return 'pdf-lib-vendor';
            }
            if (id.includes('jspdf')) {
              return 'jspdf-vendor';
            }
            if (id.includes('pdfjs')) {
              return 'pdfjs-vendor';
            }
            
            // Document processing - avoid bundling Tesseract.js 
            if (id.includes('mammoth')) {
              return 'word-vendor';
            }
            if (id.includes('xlsx')) {
              return 'excel-vendor';
            }
            
            // UI components
            if (id.includes('lucide')) {
              return 'ui-vendor';
            }
            
            // Language detection and utilities
            if (id.includes('franc')) {
              return 'utils-vendor';
            }
            
            // All other dependencies
            return 'vendor';
          }
        }
      }
    }
  },

  define: {
    global: 'globalThis',
    'process.env': {}
  },

  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom', 'react-helmet-async',
      'pdf-lib', 'jspdf', 'pdfjs-dist', 'lucide-react',
      'mammoth'
    ],
    exclude: ['tesseract.js']
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/data': path.resolve(__dirname, './src/data'),
      // Prevent Tesseract.js from loading in development
      'tesseract.js': path.resolve(__dirname, './src/utils/tesseract-stub.ts')
    }
  }
});

function generatePrerenderedHTML(route: string, toolKey: string) {
  // SEO data mapping
  const seoData: Record<string, any> = {
    'mergepdf': {
      title: "Merge PDF Free - Privacy-First PDF Combiner | LocalPDF",
      description: "Merge PDF files online without uploading to servers. 100% private PDF merger works in your browser. Combine multiple PDFs instantly - no registration required.",
      canonical: "https://localpdf.online/merge-pdf"
    },
    'splitpdf': {
      title: "Split PDF Free - Privacy-First Page Extractor | LocalPDF", 
      description: "Split PDF files without uploading to servers. 100% private PDF splitter works in your browser. Extract specific pages or ranges from PDF documents instantly.",
      canonical: "https://localpdf.online/split-pdf"
    },
    'compresspdf': {
      title: "Compress PDF Free - Privacy-First Size Reducer | LocalPDF",
      description: "Compress PDF files without uploading to servers. 100% private PDF compressor works in your browser. Reduce file size while maintaining quality instantly.", 
      canonical: "https://localpdf.online/compress-pdf"
    },
    'addtextpdf': {
      title: "Add Text to PDF Free - Privacy-First PDF Editor | LocalPDF",
      description: "Add text to PDF files without uploads. 100% private PDF text editor works in your browser. Fill forms and add signatures instantly.",
      canonical: "https://localpdf.online/add-text-pdf"
    },
    'watermarkpdf': {
      title: "Add Watermark to PDF Free - PDF Watermark Tool Online",
      description: "Add text or image watermarks to PDF files for free. Protect your documents with custom watermarks. Secure PDF watermarking in your browser.",
      canonical: "https://localpdf.online/watermark-pdf"
    },
    'rotatepdf': {
      title: "Rotate PDF Pages Free - Fix PDF Orientation Online",
      description: "Rotate PDF pages 90°, 180°, or 270° for free. Fix document orientation quickly. Private PDF rotation tool that works in your browser.",
      canonical: "https://localpdf.online/rotate-pdf"
    },
    'extractpagespdf': {
      title: "Extract PDF Pages Free - Get Specific Pages from PDF",
      description: "Extract specific pages from PDF documents for free. Create new PDFs from selected pages. Fast page extraction in your browser.",
      canonical: "https://localpdf.online/extract-pages-pdf"
    },
    'extracttextpdf': {
      title: "Extract Text from PDF Free - PDF Text Extractor Online",
      description: "Extract text content from PDF files for free. Get plain text from PDF documents. Fast text extraction in your browser without uploads.",
      canonical: "https://localpdf.online/extract-text-pdf"
    },
    'pdftoimage': {
      title: "Convert PDF to Images Free - PDF to JPG/PNG Converter",
      description: "Convert PDF pages to images for free. Export PDF as JPG, PNG, or WEBP. High-quality PDF to image conversion in your browser.",
      canonical: "https://localpdf.online/pdf-to-image"
    },
    'imagestopdf': {
      title: "Images to PDF Converter Free - JPG/PNG to PDF Online",
      description: "Convert multiple images to PDF for free. Combine JPG, PNG, GIF, WebP images into one PDF document. Privacy-first image to PDF converter in your browser.",
      canonical: "https://localpdf.online/images-to-pdf"
    },
    'wordtopdf': {
      title: "Word to PDF Converter Free - DOCX to PDF Online",
      description: "Convert Word documents to PDF for free. Transform DOCX files to PDF format instantly. Privacy-first Word to PDF conversion in your browser.",
      canonical: "https://localpdf.online/word-to-pdf"
    },
    'exceltopdf': {
      title: "Excel to PDF Free - Privacy-First XLSX Converter | LocalPDF",
      description: "Convert Excel files to PDF without uploads. 100% private XLSX converter works in your browser. Support for sheets, charts, and formatting.",
      canonical: "https://localpdf.online/excel-to-pdf"
    },
    'ocrpdf': {
      title: "OCR PDF Free - Extract Text from PDF & Images | LocalPDF",
      description: "Extract text from PDF files and images using advanced OCR. Support for 10+ languages including Russian. 100% private OCR processing.",
      canonical: "https://localpdf.online/ocr-pdf"
    },
    'privacy': {
      title: "Privacy Policy - LocalPDF | 100% Private PDF Processing",
      description: "LocalPDF privacy policy. Learn how we protect your privacy with 100% local PDF processing. No uploads, no tracking, no data collection.",
      canonical: "https://localpdf.online/privacy"
    },
    'faq': {
      title: "FAQ - Frequently Asked Questions | LocalPDF",
      description: "Get answers to common questions about LocalPDF. Learn about our privacy-first PDF tools, browser compatibility, and how to use our features.",
      canonical: "https://localpdf.online/faq"
    }
  };

  const pageData = seoData[toolKey] || seoData['mergepdf'];
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageData.title}</title>
  <meta name="description" content="${pageData.description}">
  <link rel="canonical" href="${pageData.canonical}">
  
  <!-- Hreflang tags -->
  <link rel="alternate" hreflang="en" href="https://localpdf.online${route}">
  <link rel="alternate" hreflang="de" href="https://localpdf.online/de${route}">
  <link rel="alternate" hreflang="fr" href="https://localpdf.online/fr${route}">
  <link rel="alternate" hreflang="es" href="https://localpdf.online/es${route}">
  <link rel="alternate" hreflang="ru" href="https://localpdf.online/ru${route}">
  <link rel="alternate" hreflang="x-default" href="https://localpdf.online${route}">
  
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${pageData.title}">
  <meta property="og:description" content="${pageData.description}">
  <meta property="og:url" content="${pageData.canonical}">
  <meta property="og:site_name" content="LocalPDF">
  <meta property="og:image" content="https://localpdf.online/og-image.png">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${pageData.title}">
  <meta name="twitter:description" content="${pageData.description}">
  <meta name="twitter:image" content="https://localpdf.online/og-image.png">
  
  <!-- Security headers -->
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  
  <script type="module" crossorigin src="/assets/index.js"></script>
  <link rel="stylesheet" href="/assets/index.css">
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
}

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
