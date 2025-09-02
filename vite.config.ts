import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    // Core-js removal plugin - removes all core-js imports from bundle
    {
      name: 'remove-core-js',
      transform(code, id) {
        // Remove core-js imports from any file
        if (code.includes('core-js')) {
          console.log(`🚫 Removing core-js from: ${id}`);
          const cleanedCode = code
            .replace(/import\s+["']core-js\/[^"']+["'];?\s*/g, '// core-js import removed\n')
            .replace(/import\s+[^"']*from\s+["']core-js\/[^"']+["'];?\s*/g, '// core-js import removed\n')
            .replace(/require\s*\(\s*["']core-js\/[^"']+["']\s*\);?\s*/g, '// core-js require removed\n');
          
          if (cleanedCode !== code) {
            console.log(`✅ Cleaned core-js imports from: ${id.split('/').pop()}`);
            return cleanedCode;
          }
        }
        return null;
      }
    },
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
        const baseRoutes = [
          '/merge-pdf',
          '/split-pdf', 
          '/compress-pdf',
          '/add-text-pdf',
          '/watermark-pdf',
          '/rotate-pdf',
          '/extract-pages-pdf',
          '/extract-text-pdf',
          '/extract-images-from-pdf',
          '/pdf-to-image',
          '/pdf-to-svg',
          '/images-to-pdf',
          '/word-to-pdf',
          '/excel-to-pdf',
          '/ocr-pdf',
          '/privacy',
          '/terms',
          '/gdpr',
          '/faq'
        ];

        // Generate multilingual pages
        const languages = ['en', 'de', 'fr', 'es', 'ru'];
        
        languages.forEach(lang => {
          baseRoutes.forEach(route => {
            const toolKey = route.replace('/', '').replace(/-/g, '');
            let fileName;
            
            if (lang === 'en') {
              // English files in root
              fileName = route.slice(1) + '.html';
            } else {
              // Other languages in subdirectories
              fileName = `${lang}${route}.html`;
            }
            
            this.emitFile({
              type: 'asset',
              fileName,
              source: generatePrerenderedHTML(route, toolKey, lang)
            });
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
      external: (id, parent) => {
        // Completely block ALL core-js modules from entering the bundle
        if (id.includes('core-js')) {
          console.log(`🚫 BLOCKED core-js external: ${id} (from ${parent})`);
          return true;
        }
        // Block commonjs externals 
        if (id.includes('commonjs-external')) {
          console.log(`🚫 BLOCKED commonjs external: ${id}`);
          return true;
        }
        return false;
      },
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
        },
        globals: (id) => {
          // Map ALL core-js modules to window.coreJsStub or safe globals
          if (id.includes('core-js')) {
            console.log(`🔄 Mapping core-js global: ${id}`);
            // Return a safe stub for any core-js module
            return 'window.coreJsStub || {}';
          }
          
          // Static mappings for specific modules
          const staticGlobals = {
            'core-js/internals/define-globalThis-property': 'globalThis',
            'core-js/internals/array-reduce': 'Array.prototype.reduce', 
            'core-js/internals/array-method-is-strict': 'false',
            'core-js/internals/globalThis-this': 'globalThis',
            'core-js/internals/create-non-enumerable-property': '(()=>{})',
            'core-js/internals/environment-v8-version': '""',
            'core-js/internals/regexp-sticky-helpers': '{}',
            'core-js/internals/string-trim': 'String.prototype.trim',
            'core-js/internals/string-trim-forced': '(()=>{})',
            'core-js/internals/array-includes': 'Array.prototype.includes',
            'core-js/internals/is-array': 'Array.isArray',
            'core-js/internals/function-name': '(()=>"")',
            'core-js/internals/export': '(()=>{})',
            'core-js/internals/is-pure': 'false',
            // ES modules
            'core-js/modules/es.promise.js': 'Promise',
            'core-js/modules/es.string.match.js': 'String.prototype.match',
            'core-js/modules/es.string.replace.js': 'String.prototype.replace',
            'core-js/modules/es.array.iterator.js': 'Array.prototype[Symbol.iterator]',
            'core-js/modules/web.dom-collections.iterator.js': 'Array.prototype[Symbol.iterator]'
          };
          
          return staticGlobals[id];
        }
      }
    }
  },

  define: {
    global: 'globalThis',
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.browser': 'true',
    'process.versions': '{}',
    'process.nextTick': 'setTimeout',
    '__dirname': '""',
    '__filename': '""'
  },

  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom', 'react-helmet-async',
      'jspdf', 'pdfjs-dist', 'lucide-react',
      'mammoth', 'stream-browserify', 'buffer', 'util',
      'crypto-browserify', 'path-browserify', 'os-browserify/browser', 
      'events', 'assert', 'url'
    ],
    exclude: [
      'tesseract.js', 
      'core-js',
      '@babel/runtime'
    ]
  },

  resolve: {
    alias: [
      // Standard aliases
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: '@/components', replacement: path.resolve(__dirname, './src/components') },
      { find: '@/services', replacement: path.resolve(__dirname, './src/services') },
      { find: '@/utils', replacement: path.resolve(__dirname, './src/utils') },
      { find: '@/types', replacement: path.resolve(__dirname, './src/types') },
      { find: '@/hooks', replacement: path.resolve(__dirname, './src/hooks') },
      { find: '@/data', replacement: path.resolve(__dirname, './src/data') },
      
      // Prevent Tesseract.js from loading in development
      { find: 'tesseract.js', replacement: path.resolve(__dirname, './src/utils/tesseract-stub.ts') },
      
      // Node.js polyfills for browser - Enhanced
      { find: 'stream', replacement: 'stream-browserify' },
      { find: 'buffer', replacement: 'buffer' },
      { find: 'util', replacement: 'util' },
      { find: 'crypto', replacement: 'crypto-browserify' },
      { find: 'path', replacement: 'path-browserify' },
      { find: 'fs', replacement: path.resolve(__dirname, './src/utils/fs-stub.ts') },
      { find: 'os', replacement: 'os-browserify/browser' },
      { find: 'events', replacement: 'events' },
      { find: 'assert', replacement: 'assert' },
      { find: 'url', replacement: 'url' },
      
      // CATCH-ALL for ALL core-js modules - match any core-js import
      { find: /^core-js\/.*$/, replacement: path.resolve(__dirname, './src/utils/core-js-stubs.ts') },
      
      // Specific core-js modules that still try to load
      { find: 'core-js/modules/es.promise.js', replacement: path.resolve(__dirname, './src/utils/core-js-stubs.ts') },
      { find: 'core-js/modules/es.string.match.js', replacement: path.resolve(__dirname, './src/utils/core-js-stubs.ts') },
      { find: 'core-js/modules/es.string.replace.js', replacement: path.resolve(__dirname, './src/utils/core-js-stubs.ts') },
      { find: 'core-js/modules/es.array.iterator.js', replacement: path.resolve(__dirname, './src/utils/core-js-stubs.ts') }
    ]
  }
});

// Hardcoded multilingual SEO data since we can't load translations at build time
const multilingualSeoData: Record<string, Record<string, any>> = {
  en: {
    'mergepdf': {
      title: "Merge PDF Free - Privacy-First PDF Combiner | LocalPDF",
      description: "Merge PDF files online without uploading to servers. 100% private PDF merger works in your browser. Combine multiple PDFs instantly - no registration required."
    },
    'splitpdf': {
      title: "Split PDF Free - Privacy-First Page Extractor | LocalPDF", 
      description: "Split PDF files without uploading to servers. 100% private PDF splitter works in your browser. Extract specific pages or ranges from PDF documents instantly."
    },
    'compresspdf': {
      title: "Compress PDF Free - Privacy-First Size Reducer | LocalPDF",
      description: "Compress PDF files without uploading to servers. 100% private PDF compressor works in your browser. Reduce file size while maintaining quality instantly."
    },
    'addtextpdf': {
      title: "Add Text to PDF Free - Privacy-First PDF Editor | LocalPDF",
      description: "Add text to PDF files without uploads. 100% private PDF text editor works in your browser. Fill forms and add signatures instantly."
    },
    'watermarkpdf': {
      title: "Add Watermark to PDF Free - PDF Watermark Tool Online",
      description: "Add text or image watermarks to PDF files for free. Protect your documents with custom watermarks. Secure PDF watermarking in your browser."
    },
    'rotatepdf': {
      title: "Rotate PDF Pages Free - Fix PDF Orientation Online",
      description: "Rotate PDF pages 90°, 180°, or 270° for free. Fix document orientation quickly. Private PDF rotation tool that works in your browser."
    },
    'extractpagespdf': {
      title: "Extract PDF Pages Free - Get Specific Pages from PDF",
      description: "Extract specific pages from PDF documents for free. Create new PDFs from selected pages. Fast page extraction in your browser."
    },
    'extracttextpdf': {
      title: "Extract Text from PDF Free - PDF Text Extractor Online",
      description: "Extract text content from PDF files for free. Get plain text from PDF documents. Fast text extraction in your browser without uploads."
    },
    'extractimagesfrompdf': {
      title: "Extract Images from PDF Free - PDF Image Extractor Online",
      description: "Extract images from PDF files for free. Get all images from PDF documents in original quality. Fast image extraction in your browser."
    },
    'pdftoimage': {
      title: "Convert PDF to Images Free - PDF to JPG/PNG Converter",
      description: "Convert PDF pages to images for free. Export PDF as JPG, PNG, or WEBP. High-quality PDF to image conversion in your browser."
    },
    'pdftosvg': {
      title: "Convert PDF to SVG Free - PDF to SVG Converter Online",
      description: "Convert PDF pages to SVG format for free. Get scalable vector graphics from PDF documents. High-quality PDF to SVG conversion in your browser."
    },
    'imagestopdf': {
      title: "Images to PDF Converter Free - JPG/PNG to PDF Online",
      description: "Convert multiple images to PDF for free. Combine JPG, PNG, GIF, WebP images into one PDF document. Privacy-first image to PDF converter in your browser."
    },
    'wordtopdf': {
      title: "Word to PDF Converter Free - DOCX to PDF Online",
      description: "Convert Word documents to PDF for free. Transform DOCX files to PDF format instantly. Privacy-first Word to PDF conversion in your browser."
    },
    'exceltopdf': {
      title: "Excel to PDF Free - Privacy-First XLSX Converter | LocalPDF",
      description: "Convert Excel files to PDF without uploads. 100% private XLSX converter works in your browser. Support for sheets, charts, and formatting."
    },
    'ocrpdf': {
      title: "OCR PDF Free - Extract Text from PDF & Images | LocalPDF",
      description: "Extract text from PDF files and images using advanced OCR. Support for 10+ languages including Russian. 100% private OCR processing."
    },
    'privacy': {
      title: "Privacy Policy - LocalPDF | 100% Private PDF Processing",
      description: "LocalPDF privacy policy. Learn how we protect your privacy with 100% local PDF processing. No uploads, no tracking, no data collection."
    },
    'faq': {
      title: "FAQ - Frequently Asked Questions | LocalPDF",
      description: "Get answers to common questions about LocalPDF. Learn about our privacy-first PDF tools, browser compatibility, and how to use our features."
    },
    'terms': {
      title: "Terms of Service - LocalPDF | Privacy-First PDF Processing",
      description: "LocalPDF Terms of Service. Learn about our service terms, user responsibilities, and privacy-first approach to PDF processing in your browser."
    },
    'gdpr': {
      title: "GDPR Compliance - LocalPDF | Privacy-First PDF Processing",
      description: "Learn about LocalPDF's GDPR compliance. We ensure complete data protection with 100% local processing, no uploads, and full user privacy."
    }
  },
  de: {
    'mergepdf': {
      title: "PDF zusammenführen kostenlos - Datenschutz-erste PDF Combiner | LocalPDF",
      description: "PDF-Dateien online zusammenführen ohne Server-Upload. 100% private PDF-Fusion funktioniert in Ihrem Browser. Mehrere PDFs sofort kombinieren - keine Registrierung erforderlich."
    },
    'splitpdf': {
      title: "PDF aufteilen kostenlos - Datenschutz-erste Seiten-Extraktor | LocalPDF",
      description: "PDF-Dateien ohne Server-Upload aufteilen. 100% private PDF-Aufteilung funktioniert in Ihrem Browser. Spezifische Seiten oder Bereiche aus PDF-Dokumenten sofort extrahieren."
    },
    'compresspdf': {
      title: "PDF komprimieren kostenlos - Datenschutz-erste Größenreduzierer | LocalPDF",
      description: "PDF-Dateien ohne Server-Upload komprimieren. 100% private PDF-Kompression in Ihrem Browser. Dateigröße reduzieren bei gleichbleibender Qualität."
    },
    'addtextpdf': {
      title: "Text zu PDF hinzufügen kostenlos - PDF Editor | LocalPDF",
      description: "Text zu PDF-Dateien ohne Uploads hinzufügen. 100% privater PDF-Texteditor in Ihrem Browser. Formulare ausfüllen und Signaturen sofort hinzufügen."
    },
    'watermarkpdf': {
      title: "Wasserzeichen zu PDF hinzufügen kostenlos - PDF Wasserzeichen Tool",
      description: "Text- oder Bildwasserzeichen kostenlos zu PDF-Dateien hinzufügen. Schützen Sie Ihre Dokumente mit benutzerdefinierten Wasserzeichen. Sicheres PDF-Wasserzeichen in Ihrem Browser."
    },
    'rotatepdf': {
      title: "PDF-Seiten drehen kostenlos - PDF-Ausrichtung korrigieren",
      description: "PDF-Seiten um 90°, 180° oder 270° kostenlos drehen. Dokumentenausrichtung schnell korrigieren. Privates PDF-Rotations-Tool in Ihrem Browser."
    },
    'extractpagespdf': {
      title: "PDF-Seiten extrahieren kostenlos - Bestimmte Seiten aus PDF",
      description: "Bestimmte Seiten aus PDF-Dokumenten kostenlos extrahieren. Neue PDFs aus ausgewählten Seiten erstellen. Schnelle Seitenextraktion in Ihrem Browser."
    },
    'extracttextpdf': {
      title: "Text aus PDF extrahieren kostenlos - PDF Text Extractor",
      description: "Textinhalt aus PDF-Dateien kostenlos extrahieren. Klartext aus PDF-Dokumenten erhalten. Schnelle Textextraktion in Ihrem Browser ohne Uploads."
    },
    'pdftoimage': {
      title: "PDF in Bilder umwandeln kostenlos - PDF zu JPG/PNG Konverter",
      description: "PDF-Seiten kostenlos in Bilder umwandeln. PDF als JPG, PNG oder WEBP exportieren. Hochwertige PDF-zu-Bild-Konvertierung in Ihrem Browser."
    },
    'imagestopdf': {
      title: "Bilder zu PDF Konverter kostenlos - JPG/PNG zu PDF",
      description: "Mehrere Bilder kostenlos zu PDF konvertieren. JPG, PNG, GIF, WebP-Bilder in ein PDF-Dokument kombinieren. Datenschutz-erster Bild-zu-PDF-Konverter in Ihrem Browser."
    },
    'wordtopdf': {
      title: "Word zu PDF Konverter kostenlos - DOCX zu PDF",
      description: "Word-Dokumente kostenlos zu PDF konvertieren. DOCX-Dateien sofort in PDF-Format umwandeln. Datenschutz-erste Word-zu-PDF-Konvertierung in Ihrem Browser."
    },
    'exceltopdf': {
      title: "Excel zu PDF kostenlos - XLSX Konverter | LocalPDF",
      description: "Excel-Dateien ohne Uploads zu PDF konvertieren. 100% privater XLSX-Konverter in Ihrem Browser. Unterstützung für Tabellen, Diagramme und Formatierung."
    },
    'ocrpdf': {
      title: "OCR PDF kostenlos - Text aus PDF & Bildern extrahieren | LocalPDF",
      description: "Text aus PDF-Dateien und Bildern mit fortschrittlicher OCR extrahieren. Unterstützung für 10+ Sprachen einschließlich Deutsch. 100% private OCR-Verarbeitung."
    },
    'privacy': {
      title: "Datenschutzerklärung - LocalPDF | 100% Private PDF-Verarbeitung",
      description: "LocalPDF Datenschutzerklärung. Erfahren Sie, wie wir Ihre Privatsphäre mit 100% lokaler PDF-Verarbeitung schützen. Keine Uploads, kein Tracking, keine Datensammlung."
    },
    'faq': {
      title: "FAQ - Häufig gestellte Fragen | LocalPDF",
      description: "Antworten auf häufige Fragen zu LocalPDF. Erfahren Sie mehr über unsere datenschutzfokussierten PDF-Tools, Browser-Kompatibilität und Funktionen."
    },
    'terms': {
      title: "Nutzungsbedingungen - LocalPDF | Datenschutz-erste PDF-Verarbeitung",
      description: "LocalPDF Nutzungsbedingungen. Erfahren Sie mehr über unsere Servicebedingungen, Nutzerverantwortlichkeiten und datenschutzorientierten Ansatz zur PDF-Verarbeitung."
    },
    'gdpr': {
      title: "DSGVO-Konformität - LocalPDF | Datenschutz-erste PDF-Verarbeitung",
      description: "Erfahren Sie mehr über LocalPDFs DSGVO-Konformität. Wir gewährleisten vollständigen Datenschutz mit 100% lokaler Verarbeitung, ohne Uploads und mit vollständiger Benutzerprivatsphäre."
    }
  },
  fr: {
    'mergepdf': {
      title: "Fusionner PDF gratuit - Combinateur PDF sécurisé | LocalPDF",
      description: "Fusionnez des fichiers PDF en ligne sans téléchargement sur serveur. Fusion PDF 100% privée dans votre navigateur. Combinez plusieurs PDFs instantanément - sans inscription."
    },
    'splitpdf': {
      title: "Diviser PDF gratuit - Extracteur de pages sécurisé | LocalPDF",
      description: "Divisez des fichiers PDF sans téléchargement sur serveur. Division PDF 100% privée dans votre navigateur. Extrayez des pages spécifiques instantanément."
    },
    'compresspdf': {
      title: "Compresser PDF gratuit - Réducteur de taille sécurisé | LocalPDF",
      description: "Compressez des fichiers PDF sans téléchargement sur serveur. Compression PDF 100% privée dans votre navigateur. Réduisez la taille en maintenant la qualité."
    },
    'addtextpdf': {
      title: "Ajouter du texte au PDF gratuit - Éditeur PDF | LocalPDF",
      description: "Ajoutez du texte aux fichiers PDF sans téléchargements. Éditeur de texte PDF 100% privé dans votre navigateur. Remplissez des formulaires et ajoutez des signatures instantanément."
    },
    'watermarkpdf': {
      title: "Ajouter filigrane au PDF gratuit - Outil de filigrane PDF",
      description: "Ajoutez des filigranes de texte ou d'image aux fichiers PDF gratuitement. Protégez vos documents avec des filigranes personnalisés. Filigrane PDF sécurisé dans votre navigateur."
    },
    'rotatepdf': {
      title: "Faire pivoter les pages PDF gratuit - Corriger l'orientation PDF",
      description: "Faites pivoter les pages PDF de 90°, 180° ou 270° gratuitement. Corrigez l'orientation des documents rapidement. Outil de rotation PDF privé dans votre navigateur."
    },
    'extractpagespdf': {
      title: "Extraire des pages PDF gratuit - Obtenir des pages spécifiques du PDF",
      description: "Extrayez des pages spécifiques des documents PDF gratuitement. Créez de nouveaux PDFs à partir de pages sélectionnées. Extraction rapide de pages dans votre navigateur."
    },
    'extracttextpdf': {
      title: "Extraire le texte du PDF gratuit - Extracteur de texte PDF",
      description: "Extrayez le contenu textuel des fichiers PDF gratuitement. Obtenez du texte brut des documents PDF. Extraction rapide de texte dans votre navigateur sans téléchargements."
    },
    'pdftoimage': {
      title: "Convertir PDF en images gratuit - Convertisseur PDF vers JPG/PNG",
      description: "Convertissez les pages PDF en images gratuitement. Exportez PDF en JPG, PNG ou WEBP. Conversion PDF vers image de haute qualité dans votre navigateur."
    },
    'imagestopdf': {
      title: "Convertisseur d'images vers PDF gratuit - JPG/PNG vers PDF",
      description: "Convertissez plusieurs images en PDF gratuitement. Combinez des images JPG, PNG, GIF, WebP en un document PDF. Convertisseur image vers PDF axé sur la confidentialité dans votre navigateur."
    },
    'wordtopdf': {
      title: "Convertisseur Word vers PDF gratuit - DOCX vers PDF",
      description: "Convertissez des documents Word en PDF gratuitement. Transformez les fichiers DOCX au format PDF instantanément. Conversion Word vers PDF axée sur la confidentialité dans votre navigateur."
    },
    'exceltopdf': {
      title: "Excel vers PDF gratuit - Convertisseur XLSX | LocalPDF",
      description: "Convertissez les fichiers Excel en PDF sans téléchargements. Convertisseur XLSX 100% privé dans votre navigateur. Support pour les feuilles, graphiques et formatage."
    },
    'ocrpdf': {
      title: "OCR PDF gratuit - Extraire le texte du PDF et des images | LocalPDF",
      description: "Extrayez le texte des fichiers PDF et des images avec OCR avancé. Support pour 10+ langues incluant le français. Traitement OCR 100% privé."
    },
    'privacy': {
      title: "Politique de confidentialité - LocalPDF | Traitement PDF 100% privé",
      description: "Politique de confidentialité LocalPDF. Découvrez comment nous protégeons votre vie privée avec un traitement PDF 100% local. Pas de téléchargements, pas de suivi, pas de collecte de données."
    },
    'faq': {
      title: "FAQ - Questions fréquemment posées | LocalPDF",
      description: "Obtenez des réponses aux questions courantes sur LocalPDF. Découvrez nos outils PDF axés sur la confidentialité, la compatibilité des navigateurs et les fonctionnalités."
    },
    'terms': {
      title: "Conditions d'utilisation - LocalPDF | Traitement PDF axé sur la confidentialité",
      description: "Conditions d'utilisation LocalPDF. Découvrez nos conditions de service, responsabilités des utilisateurs et approche axée sur la confidentialité du traitement PDF."
    },
    'gdpr': {
      title: "Conformité RGPD - LocalPDF | Traitement PDF axé sur la confidentialité",
      description: "Découvrez la conformité RGPD de LocalPDF. Nous garantissons une protection complète des données avec un traitement 100% local, sans téléversements et avec une confidentialité utilisateur complète."
    }
  },
  es: {
    'mergepdf': {
      title: "Combinar PDF gratis - Combinador PDF privado | LocalPDF",
      description: "Combine archivos PDF en línea sin subir a servidores. Fusión PDF 100% privada en su navegador. Combine múltiples PDFs al instante - sin registro requerido."
    },
    'splitpdf': {
      title: "Dividir PDF gratis - Extractor de páginas privado | LocalPDF",
      description: "Divida archivos PDF sin subir a servidores. División PDF 100% privada en su navegador. Extraiga páginas específicas al instante."
    },
    'compresspdf': {
      title: "Comprimir PDF gratis - Reductor de tamaño privado | LocalPDF",
      description: "Comprima archivos PDF sin subir a servidores. Compresión PDF 100% privada en su navegador. Reduzca el tamaño manteniendo la calidad."
    },
    'addtextpdf': {
      title: "Añadir texto al PDF gratis - Editor PDF | LocalPDF",
      description: "Añada texto a archivos PDF sin subidas. Editor de texto PDF 100% privado en su navegador. Rellene formularios y añada firmas al instante."
    },
    'watermarkpdf': {
      title: "Añadir marca de agua al PDF gratis - Herramienta de marca de agua PDF",
      description: "Añada marcas de agua de texto o imagen a archivos PDF gratis. Proteja sus documentos con marcas de agua personalizadas. Marca de agua PDF segura en su navegador."
    },
    'rotatepdf': {
      title: "Rotar páginas PDF gratis - Corregir orientación PDF",
      description: "Rote páginas PDF 90°, 180° o 270° gratis. Corrija la orientación del documento rápidamente. Herramienta de rotación PDF privada en su navegador."
    },
    'extractpagespdf': {
      title: "Extraer páginas PDF gratis - Obtener páginas específicas del PDF",
      description: "Extraiga páginas específicas de documentos PDF gratis. Cree nuevos PDFs de páginas seleccionadas. Extracción rápida de páginas en su navegador."
    },
    'extracttextpdf': {
      title: "Extraer texto del PDF gratis - Extractor de texto PDF",
      description: "Extraiga contenido de texto de archivos PDF gratis. Obtenga texto plano de documentos PDF. Extracción rápida de texto en su navegador sin subidas."
    },
    'pdftoimage': {
      title: "Convertir PDF a imágenes gratis - Convertidor PDF a JPG/PNG",
      description: "Convierta páginas PDF a imágenes gratis. Exporte PDF como JPG, PNG o WEBP. Conversión PDF a imagen de alta calidad en su navegador."
    },
    'imagestopdf': {
      title: "Convertidor de imágenes a PDF gratis - JPG/PNG a PDF",
      description: "Convierta múltiples imágenes a PDF gratis. Combine imágenes JPG, PNG, GIF, WebP en un documento PDF. Convertidor imagen a PDF centrado en privacidad en su navegador."
    },
    'wordtopdf': {
      title: "Convertidor Word a PDF gratis - DOCX a PDF",
      description: "Convierta documentos Word a PDF gratis. Transforme archivos DOCX a formato PDF al instante. Conversión Word a PDF centrada en privacidad en su navegador."
    },
    'exceltopdf': {
      title: "Excel a PDF gratis - Convertidor XLSX | LocalPDF",
      description: "Convierta archivos Excel a PDF sin subidas. Convertidor XLSX 100% privado en su navegador. Soporte para hojas, gráficos y formato."
    },
    'ocrpdf': {
      title: "OCR PDF gratis - Extraer texto de PDF e imágenes | LocalPDF",
      description: "Extraiga texto de archivos PDF e imágenes usando OCR avanzado. Soporte para 10+ idiomas incluyendo español. Procesamiento OCR 100% privado."
    },
    'privacy': {
      title: "Política de privacidad - LocalPDF | Procesamiento PDF 100% privado",
      description: "Política de privacidad de LocalPDF. Aprenda cómo protegemos su privacidad con procesamiento PDF 100% local. Sin subidas, sin seguimiento, sin recopilación de datos."
    },
    'faq': {
      title: "FAQ - Preguntas frecuentes | LocalPDF",
      description: "Obtenga respuestas a preguntas comunes sobre LocalPDF. Conozca nuestras herramientas PDF centradas en la privacidad, compatibilidad del navegador y características."
    },
    'terms': {
      title: "Términos de Servicio - LocalPDF | Procesamiento PDF centrado en la privacidad",
      description: "Términos de Servicio de LocalPDF. Conozca nuestras condiciones de servicio, responsabilidades del usuario y enfoque centrado en la privacidad del procesamiento PDF."
    },
    'gdpr': {
      title: "Cumplimiento GDPR - LocalPDF | Procesamiento PDF centrado en privacidad",
      description: "Conozca el cumplimiento GDPR de LocalPDF. Garantizamos protección completa de datos con procesamiento 100% local, sin cargas y con privacidad completa del usuario."
    }
  },
  ru: {
    'mergepdf': {
      title: "Объединить PDF бесплатно - Приватный объединитель PDF | LocalPDF",
      description: "Объединяйте PDF файлы онлайн без загрузки на серверы. 100% приватное объединение PDF в вашем браузере. Комбинируйте несколько PDF мгновенно - без регистрации."
    },
    'splitpdf': {
      title: "Разделить PDF бесплатно - Приватный экстрактор страниц | LocalPDF",
      description: "Разделяйте PDF файлы без загрузки на серверы. 100% приватное разделение PDF в вашем браузере. Извлекайте конкретные страницы мгновенно."
    },
    'compresspdf': {
      title: "Сжать PDF бесплатно - Приватный компрессор PDF | LocalPDF",
      description: "Сжимайте PDF файлы без загрузки на серверы. 100% приватное сжатие PDF в вашем браузере. Уменьшайте размер с сохранением качества."
    },
    'addtextpdf': {
      title: "Добавить текст в PDF бесплатно - PDF редактор | LocalPDF",
      description: "Добавляйте текст в PDF файлы без загрузок. 100% приватный PDF текстовый редактор в вашем браузере. Заполняйте формы и добавляйте подписи мгновенно."
    },
    'watermarkpdf': {
      title: "Добавить водяной знак в PDF бесплатно - Инструмент водяных знаков PDF",
      description: "Добавляйте текстовые или графические водяные знаки в PDF файлы бесплатно. Защищайте документы пользовательскими водяными знаками. Безопасные водяные знаки PDF в вашем браузере."
    },
    'rotatepdf': {
      title: "Повернуть страницы PDF бесплатно - Исправить ориентацию PDF",
      description: "Поворачивайте страницы PDF на 90°, 180° или 270° бесплатно. Быстро исправляйте ориентацию документа. Приватный инструмент поворота PDF в вашем браузере."
    },
    'extractpagespdf': {
      title: "Извлечь страницы PDF бесплатно - Получить конкретные страницы из PDF",
      description: "Извлекайте конкретные страницы из PDF документов бесплатно. Создавайте новые PDF из выбранных страниц. Быстрое извлечение страниц в вашем браузере."
    },
    'extracttextpdf': {
      title: "Извлечь текст из PDF бесплатно - Экстрактор текста PDF",
      description: "Извлекайте текстовое содержимое из PDF файлов бесплатно. Получайте простой текст из PDF документов. Быстрое извлечение текста в вашем браузере без загрузок."
    },
    'pdftoimage': {
      title: "Конвертировать PDF в изображения бесплатно - PDF в JPG/PNG конвертер",
      description: "Конвертируйте страницы PDF в изображения бесплатно. Экспортируйте PDF как JPG, PNG или WEBP. Высококачественная конвертация PDF в изображения в вашем браузере."
    },
    'imagestopdf': {
      title: "Конвертер изображений в PDF бесплатно - JPG/PNG в PDF",
      description: "Конвертируйте несколько изображений в PDF бесплатно. Объединяйте JPG, PNG, GIF, WebP изображения в один PDF документ. Приватный конвертер изображений в PDF в вашем браузере."
    },
    'wordtopdf': {
      title: "Конвертер Word в PDF бесплатно - DOCX в PDF",
      description: "Конвертируйте Word документы в PDF бесплатно. Преобразуйте DOCX файлы в формат PDF мгновенно. Приватная конвертация Word в PDF в вашем браузере."
    },
    'exceltopdf': {
      title: "Excel в PDF бесплатно - XLSX конвертер | LocalPDF",
      description: "Конвертируйте Excel файлы в PDF без загрузок. 100% приватный XLSX конвертер в вашем браузере. Поддержка листов, диаграмм и форматирования."
    },
    'ocrpdf': {
      title: "OCR PDF бесплатно - Извлечь текст из PDF и изображений | LocalPDF",
      description: "Извлекайте текст из PDF файлов и изображений с помощью продвинутого OCR. Поддержка 10+ языков включая русский. 100% приватная OCR обработка."
    },
    'privacy': {
      title: "Политика конфиденциальности - LocalPDF | 100% приватная обработка PDF",
      description: "Политика конфиденциальности LocalPDF. Узнайте, как мы защищаем вашу конфиденциальность с помощью 100% локальной обработки PDF. Без загрузок, без отслеживания, без сбора данных."
    },
    'faq': {
      title: "FAQ - Часто задаваемые вопросы | LocalPDF",
      description: "Получите ответы на общие вопросы о LocalPDF. Узнайте о наших PDF инструментах, ориентированных на конфиденциальность, совместимости браузеров и функциях."
    },
    'terms': {
      title: "Условия использования - LocalPDF | PDF обработка с защитой конфиденциальности",
      description: "Условия использования LocalPDF. Узнайте о наших условиях обслуживания, обязанностях пользователей и подходе к обработке PDF с защитой конфиденциальности."
    },
    'gdpr': {
      title: "Соответствие GDPR - LocalPDF | PDF обработка с защитой конфиденциальности",
      description: "Узнайте о соответствии LocalPDF требованиям GDPR. Мы гарантируем полную защиту данных с 100% локальной обработкой, без загрузок и с полной конфиденциальностью пользователей."
    }
  }
};

function generatePrerenderedHTML(route: string, toolKey: string, language: string = 'en') {
  // Fallback SEO data mapping (English as fallback)
  const fallbackSeoData: Record<string, any> = {
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
    'extractimagesfrompdf': {
      title: "Extract Images from PDF Free - PDF Image Extractor Online",
      description: "Extract images from PDF files for free. Get all images from PDF documents in original quality. Fast image extraction in your browser.",
      canonical: "https://localpdf.online/extract-images-from-pdf"
    },
    'pdftoimage': {
      title: "Convert PDF to Images Free - PDF to JPG/PNG Converter",
      description: "Convert PDF pages to images for free. Export PDF as JPG, PNG, or WEBP. High-quality PDF to image conversion in your browser.",
      canonical: "https://localpdf.online/pdf-to-image"
    },
    'pdftosvg': {
      title: "Convert PDF to SVG Free - PDF to SVG Converter Online",
      description: "Convert PDF pages to SVG format for free. Get scalable vector graphics from PDF documents. High-quality PDF to SVG conversion in your browser.",
      canonical: "https://localpdf.online/pdf-to-svg"
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
    },
    'terms': {
      title: "Terms of Service - LocalPDF | Privacy-First PDF Processing",
      description: "LocalPDF Terms of Service. Learn about our service terms, user responsibilities, and privacy-first approach to PDF processing in your browser.",
      canonical: "https://localpdf.online/terms"
    },
    'gdpr': {
      title: "GDPR Compliance - LocalPDF | Privacy-First PDF Processing",
      description: "Learn about LocalPDF's GDPR compliance. We ensure complete data protection with 100% local processing, no uploads, and full user privacy.",
      canonical: "https://localpdf.online/gdpr"
    }
  };

  // Get SEO data from multilingual data or fallback
  const languageData = multilingualSeoData[language] || multilingualSeoData['en'];
  const toolData = languageData[toolKey] || languageData['mergepdf'] || fallbackSeoData[toolKey] || fallbackSeoData['mergepdf'];
  
  const baseUrl = language === 'en' ? 'https://localpdf.online' : `https://localpdf.online/${language}`;
  const pageData = {
    title: toolData.title,
    description: toolData.description,
    canonical: `${baseUrl}${route}`
  };
  
  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <!-- Critical polyfills MUST come first -->
  <script>
    // Fix for 'global is not defined' - must be first!
    if (typeof global === 'undefined') {
      window.global = globalThis;
    }
    if (typeof process === 'undefined') {
      window.process = { env: { NODE_ENV: 'production' }, browser: true };
    }
    
    // Global core-js stub - MUST be available before any modules load
    window.coreJsStub = {
      __esModule: true,
      default: {},
      // ES modules stubs
      Promise: Promise,
      'es.promise.js': Promise,
      'es.string.match.js': String.prototype.match,
      'es.string.replace.js': String.prototype.replace,
      'es.array.iterator.js': Array.prototype[Symbol.iterator],
      'web.dom-collections.iterator.js': Array.prototype[Symbol.iterator],
      'es.string.starts-with.js': String.prototype.startsWith,
      'es.array.reduce.js': Array.prototype.reduce,
      'es.string.ends-with.js': String.prototype.endsWith,
      'es.string.split.js': String.prototype.split,
      'es.string.trim.js': String.prototype.trim,
      'es.array.index-of.js': Array.prototype.indexOf,
      'es.string.includes.js': String.prototype.includes,
      'es.array.reverse.js': Array.prototype.reverse,
      'es.regexp.to-string.js': RegExp.prototype.toString
    };
    console.log('🔄 Global coreJsStub initialized');
    
    
    // Core-js runtime protection - intercept import() calls
    (function() {
      const originalImport = window.__dynamicImportHandler__;
      const coreJsStub = {
        default: Promise.resolve(),
        __esModule: true,
        PromiseStub: Promise,
        arrayIterator: Array.prototype[Symbol.iterator],
        stringMatch: String.prototype.match,
        stringReplace: String.prototype.replace,
        arrayReduce: Array.prototype.reduce,
        stringEndsWith: String.prototype.endsWith
      };
      
      // Override dynamic imports for core-js
      if (typeof originalImport === 'function') {
        window.__dynamicImportHandler__ = function(url) {
          if (url && url.includes && url.includes('core-js')) {
            console.log('🔄 Blocked core-js import:', url);
            return Promise.resolve(coreJsStub);
          }
          return originalImport.apply(this, arguments);
        };
      }
      
      // Catch ES import errors
      window.addEventListener('error', function(e) {
        if (e.message && e.message.includes && e.message.includes('core-js')) {
          console.log('🔄 Suppressed core-js error:', e.message);
          e.preventDefault();
          return false;
        }
      });
    })();
    
    // Hide Vercel toolbar for production users
    (function() {
      function hideVercelToolbar() {
        const toolbar = document.querySelector('[data-vercel-toolbar]') || 
                       document.querySelector('[class*="vercel-toolbar"]') ||
                       document.querySelector('iframe[src*="vercel.live"]');
        if (toolbar) {
          toolbar.style.display = 'none';
          toolbar.remove();
        }
      }
      
      // Hide immediately if already present
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideVercelToolbar);
      } else {
        hideVercelToolbar();
      }
      
      // Hide if appears later
      setTimeout(hideVercelToolbar, 1000);
      setTimeout(hideVercelToolbar, 3000);
    })();
  </script>
  
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
  <meta name="twitter:creator" content="@localpdf">
  <meta name="twitter:site" content="@localpdf">
  
  <!-- Security headers -->
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  
  <script type="module" crossorigin src="/assets/index-5d1cc039.js"></script>
  <link rel="stylesheet" href="/assets/index-76a4743d.css">
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
    { url: '/terms', name: 'terms', priority: '0.3', changefreq: 'yearly' },
    { url: '/gdpr', name: 'gdpr', priority: '0.3', changefreq: 'yearly' },
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
