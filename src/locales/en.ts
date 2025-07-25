// src/locales/en.ts
import { Translations } from '../types/i18n';

export const en: Translations = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    close: 'Close',
    save: 'Save',
    download: 'Download',
    upload: 'Upload',
    delete: 'Delete',
    clear: 'Clear',
    preview: 'Preview',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    continue: 'Continue',
    finish: 'Finish',
    file: 'File',
    files: 'Files',
    size: 'Size',
    name: 'Name',
    type: 'Type',
    format: 'Format',
    quality: 'Quality',
    pages: 'Pages',
    page: 'Page',
    processing: 'Processing',
    processed: 'Processed',
    ready: 'Ready',
    complete: 'Complete',
    remove: 'Remove',
    clearAll: 'Clear All',
    or: 'or',
  },

  header: {
    title: 'LocalPDF',
    subtitle: 'Privacy-First PDF Tools',
    navigation: {
      privacy: 'Privacy',
      faq: 'FAQ',
      github: 'GitHub',
    },
    badges: {
      tools: 'PDF Tools',
      private: '100% Private',
      activeTools: 'Active tools',
      privateProcessing: '100% private processing',
    },
    mobileMenu: {
      toggle: 'Toggle mobile menu',
      privacyPolicy: 'Privacy Policy',
      githubRepository: 'GitHub Repository',
    },
  },

  home: {
    hero: {
      title: 'LocalPDF',
      subtitle: 'Privacy-First PDF Tools',
      description: 'Professional PDF processing tools that work entirely in your browser',
      descriptionSecondary: 'No uploads • No tracking • No limits • Completely free forever',
      features: {
        privacy: {
          title: 'Your files never leave your device',
          subtitle: '100% local processing',
        },
        speed: {
          title: 'Lightning fast processing',
          subtitle: 'No server delays',
        },
        free: {
          title: 'Completely free, no limits',
          subtitle: 'Open source forever',
        },
      },
      trustIndicators: {
        noRegistration: 'No registration required',
        worksOffline: 'Works offline',
        openSource: 'Open source',
      },
    },
    upload: {
      title: 'Get Started in Seconds',
      description: 'Upload your PDF files to begin processing, or choose "Images to PDF" to convert images',
      dragDrop: 'Drag and drop files here',
      selectFiles: 'Select files',
      maxSize: 'Max file size: 100MB',
      supportedFormats: 'Supported formats: PDF',
      ready: 'Ready for processing',
      pdfDocument: 'PDF document',
    },
    tools: {
      title: 'Complete PDF toolkit',
      subtitle: 'Choose the right tool for your needs. All operations are performed locally in your browser.',
      whyChoose: {
        title: 'Why Choose LocalPDF?',
        description: 'Built with privacy and performance in mind',
        stats: {
          tools: 'PDF tools',
          toolsDesc: 'Complete toolkit',
          privacy: 'Privacy',
          privacyDesc: 'Local processing',
          dataCollection: 'Data collection',
          dataCollectionDesc: 'No tracking',
          usageLimits: 'Usage limits',
          usageLimitsDesc: 'Free forever',
        },
        features: {
          noRegistration: 'No registration required',
          fastProcessing: 'Lightning fast processing',
          secureProcessing: 'Secure processing',
          worksOffline: 'Works offline',
        },
      },
      trustMessage: 'Your files never leave your device',
    },
  },

  tools: {
    merge: {
      title: 'Merge PDFs',
      description: 'Combine multiple PDF files into one document',
    },
    split: {
      title: 'Split PDF',
      description: 'Split PDF into separate pages or ranges',
    },
    compress: {
      title: 'Compress PDF',
      description: 'Reduce PDF file size while maintaining quality',
    },
    addText: {
      title: 'Add Text',
      description: 'Add text annotations and comments to PDF',
    },
    watermark: {
      title: 'Add Watermark',
      description: 'Add text watermarks to protect documents',
    },
    rotate: {
      title: 'Rotate Pages',
      description: 'Rotate pages 90, 180, or 270 degrees',
    },
    extractPages: {
      title: 'Extract Pages',
      description: 'Extract specific pages into a new document',
    },
    extractText: {
      title: 'Extract Text',
      description: 'Extract text content from PDF files',
    },
    pdfToImage: {
      title: 'PDF to Images',
      description: 'Convert PDF pages to PNG or JPEG',
    },
    imageToPdf: {
      title: 'Images to PDF',
      description: 'Combine multiple images into PDF document',
    },
    wordToPdf: {
      title: 'Word to PDF',
      description: 'Convert Word documents (.docx) to PDF format',
    },
    ocr: {
      title: 'OCR Recognition',
      description: 'Extract text from scanned PDFs and images',
    },
  },

  errors: {
    fileNotSupported: 'File format not supported',
    fileTooLarge: 'File size exceeds the maximum limit',
    processingFailed: 'Processing failed. Please try again.',
    noFilesSelected: 'No files selected',
    invalidFormat: 'Invalid file format',
    networkError: 'Network error occurred',
    unknownError: 'An unknown error occurred',
  },

  footer: {
    description: 'Made with ❤️ for privacy-conscious users worldwide',
    links: {
      privacy: 'Privacy',
      faq: 'FAQ',
      github: 'GitHub',
    },
    copyright: 'No tracking • No ads • No data collection',
  },

  components: {
    relatedTools: {
      title: 'Related PDF Tools',
      subtitle: 'You might also want to:',
      viewAllTools: 'View all PDF tools',
      toolNames: {
        merge: 'Merge PDFs',
        split: 'Split PDFs',
        compress: 'Compress PDFs',
        addText: 'Add Text',
        watermark: 'Add Watermark',
        rotate: 'Rotate Pages',
        extractPages: 'Extract Pages',
        extractText: 'Extract Text',
        pdfToImage: 'PDF to Images',
      },
      toolDescriptions: {
        merge: 'Combine multiple PDF files into one',
        split: 'Split PDF into separate files',
        compress: 'Reduce PDF file size',
        addText: 'Add text and annotations',
        watermark: 'Add watermarks to protect PDFs',
        rotate: 'Rotate PDF pages',
        extractPages: 'Extract specific pages',
        extractText: 'Get text content from PDFs',
        pdfToImage: 'Convert PDF to images',
      },
      actions: {
        merge: {
          split: 'split your merged PDF',
          compress: 'compress the merged file',
          extractPages: 'extract specific pages',
        },
        split: {
          merge: 'merge split files back',
          rotate: 'rotate split pages',
          extractPages: 'extract more pages',
        },
        compress: {
          merge: 'merge compressed files',
          split: 'split compressed PDF',
          watermark: 'add watermarks',
        },
        addText: {
          watermark: 'add watermarks',
          rotate: 'rotate annotated pages',
          extractText: 'extract all text',
        },
        watermark: {
          addText: 'add more text',
          compress: 'compress watermarked PDF',
          rotate: 'rotate watermarked pages',
        },
        rotate: {
          addText: 'add text to rotated pages',
          watermark: 'add watermarks',
          split: 'split rotated PDF',
        },
        extractPages: {
          merge: 'merge extracted pages',
          rotate: 'rotate extracted pages',
          pdfToImage: 'convert pages to images',
        },
        extractText: {
          addText: 'add more text',
          extractPages: 'extract specific pages',
          pdfToImage: 'convert to images',
        },
        pdfToImage: {
          extractPages: 'extract more pages',
          extractText: 'get text content',
          rotate: 'rotate before converting',
        },
      },
    },
    fileUploadZone: {
      dropActive: 'Drop files here',
      chooseFiles: 'Choose PDF files',
      dragAndDrop: 'Drag and drop files here or click to select',
      maxFileSize: 'Max {size} per file',
      selectFiles: 'Select Files',
      trustFeatures: {
        private: '100% Private',
        fast: 'Fast',
        free: 'Free',
      },
      trustMessage: 'Files never leave your device • Processing happens locally in browser',
      alerts: {
        unsupportedFiles: '{count} file(s) skipped due to unsupported format. Supported formats: {formats}',
        fileLimit: 'Only first {count} files selected.',
      },
      accessibility: {
        uploadArea: 'File upload area - click to select files or drag and drop',
        selectFiles: 'Select files to upload',
      },
    },
  },

  pages: {
    privacy: {
      title: 'Privacy Policy',
      subtitle: 'Your privacy is our top priority',
    },
    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know about LocalPDF',
    },
    notFound: {
      title: 'Page Not Found',
      description: "Oops! The page you're looking for seems to have vanished into the digital void. But don't worry – our powerful PDF tools are still here to help you!",
      backHome: 'Back to Home',
    },
    tools: {
      merge: {
        pageTitle: 'Merge PDF Files Free',
        pageDescription: 'Combine multiple PDF files into one document for free. Fast, secure, and private PDF merging in your browser. No uploads, no registration required.',
        uploadTitle: 'Upload PDF Files to Merge',
        buttons: {
          remove: 'Remove',
          startMerging: 'Start Merging ({count} files)',
        },
        features: {
          title: 'Why Choose LocalPDF Merge Tool?',
          private: {
            title: '🔒 100% Private',
            description: 'Your files never leave your device. All processing happens locally in your browser for maximum privacy and security.',
          },
          fast: {
            title: '⚡ Lightning Fast',
            description: 'Merge PDFs instantly with our optimized processing engine. No waiting for uploads or downloads from servers.',
          },
          free: {
            title: '🆓 Completely Free',
            description: 'No limits, no watermarks, no hidden fees. Merge unlimited PDF files for free, forever.',
          },
        },
        howTo: {
          title: 'How to Merge PDF Files',
          steps: {
            upload: {
              title: 'Upload PDF Files',
              description: 'Click "Choose Files" or drag and drop multiple PDF files into the upload area.',
            },
            arrange: {
              title: 'Arrange Order',
              description: 'Drag and drop files to reorder them. The final PDF will follow this order.',
            },
            download: {
              title: 'Merge & Download',
              description: 'Click "Merge PDFs" and your combined PDF will be ready for download instantly.',
            },
          },
        },
      },
      compress: {
        pageTitle: 'Compress PDF Files Free',
        pageDescription: 'Compress PDF files to reduce size without losing quality. Free PDF compression tool that works in your browser with customizable quality settings.',
        uploadTitle: 'Upload PDF to Compress',
        uploadSubtitle: 'Select a PDF file to reduce its size',
        buttons: {
          uploadDifferent: '← Upload Different PDF',
        },
        features: {
          title: '✨ Key Features:',
          items: {
            qualitySettings: '• Adjustable quality settings (10% - 100%)',
            imageOptimization: '• Image compression optimization',
            removeMetadata: '• Remove metadata for smaller files',
            webOptimization: '• Web optimization for faster loading',
          },
        },
        privacy: {
          title: '🔒 Privacy & Security:',
          items: {
            clientSide: '• 100% client-side processing',
            noUploads: '• No file uploads to servers',
            localProcessing: '• Your data never leaves your device',
            instantProcessing: '• Instant processing and download',
          },
        },
        benefits: {
          title: 'Why Choose Our PDF Compressor?',
          smart: {
            title: 'Smart Compression',
            description: 'Advanced algorithms reduce file size while preserving document quality and readability',
          },
          control: {
            title: 'Full Control',
            description: 'Adjust quality levels, image compression, and web optimization to meet your needs',
          },
          private: {
            title: '100% Private',
            description: 'Your PDFs are processed locally in your browser - never uploaded anywhere',
          },
        },
        howTo: {
          title: 'How PDF Compression Works',
          steps: {
            upload: {
              title: 'Upload PDF',
              description: 'Drop your PDF file or click to browse',
            },
            settings: {
              title: 'Adjust Settings',
              description: 'Choose quality level and compression options',
            },
            compress: {
              title: 'Compress',
              description: 'Watch real-time progress as file is optimized',
            },
            download: {
              title: 'Download',
              description: 'Get your compressed PDF with reduced file size',
            },
          },
        },
        technical: {
          title: 'Compression Techniques',
          compressed: {
            title: 'What Gets Compressed:',
            images: '• **Images:** JPEG compression with quality control',
            fonts: '• **Fonts:** Subset unused characters and optimize encoding',
            streams: '• **Streams:** Remove redundant data and compress content',
            metadata: '• **Metadata:** Optional removal of creation info and properties',
          },
          quality: {
            title: 'Quality vs. Size:',
            high: '• **90-100%:** Near-lossless quality, moderate compression',
            good: '• **70-90%:** Good quality, significant size reduction',
            acceptable: '• **50-70%:** Acceptable quality, maximum compression',
            low: '• **Below 50%:** Noticeable quality loss, smallest files',
          },
        },
      },
      split: {
        pageTitle: 'Split PDF Files Free',
        pageDescription: 'Split PDF files by pages or ranges for free. Extract specific pages from PDF documents. Private and secure PDF splitting in your browser.',
        uploadTitle: 'Upload PDF to Split',
        buttons: {
          startSplitting: 'Start Splitting',
        },
        features: {
          title: 'Advanced PDF Splitting Features',
          pageRanges: {
            title: '📄 Page Ranges',
            description: 'Split by specific page ranges (e.g., 1-5, 10-15) or extract individual pages with precision.',
          },
          batchProcessing: {
            title: '⚡ Batch Processing',
            description: 'Process multiple page ranges at once. Create several PDFs from one source document efficiently.',
          },
          previewMode: {
            title: '👁️ Preview Mode',
            description: 'Preview pages before splitting to ensure you\'re extracting the right content from your PDF.',
          },
        },
      },
      imageToPdf: {
        seo: {
          title: 'Images to PDF Converter - Free Online Tool | LocalPDF',
          description: 'Convert multiple images (JPEG, PNG, GIF, WebP) to PDF format instantly. Privacy-first image to PDF converter that works entirely in your browser. No uploads required.',
        },
        breadcrumbs: {
          home: 'Home',
          imageToPdf: 'Images to PDF',
        },
        pageTitle: 'Images to PDF Converter',
        pageDescription: 'Convert multiple images into a single PDF document with customizable layout options. Supports JPEG, PNG, GIF, and WebP formats with complete privacy protection.',
        uploadSection: {
          title: 'Drop images here or click to browse',
          subtitle: 'Combine multiple images into a single PDF document',
          supportedFormats: 'JPEG, PNG, GIF, WebP',
        },
        tool: {
          title: 'Images to PDF Converter',
          description: 'Combine multiple images into a single PDF document with custom layout options',
          selectedImages: 'Selected Images ({count})',
          clearAll: 'Clear All',
          pdfSettings: 'PDF Settings',
          pageSize: 'Page Size',
          pageSizeOptions: {
            a4: 'A4 (210 × 297 mm)',
            letter: 'Letter (8.5 × 11 in)',
            auto: 'Auto (fit content)'
          },
          orientation: 'Orientation',
          orientationOptions: {
            portrait: 'Portrait',
            landscape: 'Landscape'
          },
          imageLayout: 'Image Layout',
          layoutOptions: {
            fitToPage: 'Fit to Page',
            actualSize: 'Actual Size',
            fitWidth: 'Fit Width',
            fitHeight: 'Fit Height'
          },
          imageQuality: 'Image Quality ({quality}%)',
          qualitySlider: {
            lowerSize: 'Lower size',
            higherQuality: 'Higher quality'
          },
          pageMargin: 'Page Margin ({margin} inch)',
          marginSlider: {
            noMargin: 'No margin',
            twoInch: '2 inch'
          },
          background: 'Background',
          backgroundOptions: {
            white: 'White',
            lightGray: 'Light Gray',
            gray: 'Gray',
            black: 'Black'
          },
          fileInfo: '{count} image{plural} selected • Total size: {size}',
          converting: 'Converting images to PDF... {progress}%',
          buttons: {
            reset: 'Reset',
            createPdf: 'Create PDF',
            converting: 'Converting...'
          },
          help: {
            title: 'How to Use Images to PDF',
            dragDrop: 'Simply drag your images into the upload area or click to browse',
            formats: 'Supports JPEG, PNG, GIF, and WebP image formats',
            layout: 'Choose page size, orientation, and how images fit on each page',
            quality: 'Adjust image quality to balance file size and visual quality',
            privacy: 'All processing happens locally - your images never leave your device'
          }
        },
        features: {
          title: 'Why Choose Our Images to PDF Converter?',
          private: {
            title: '100% Private',
            description: 'All image processing happens locally in your browser. Your images never leave your device.',
          },
          formats: {
            title: 'Multiple Formats',
            description: 'Support for JPEG, PNG, GIF, and WebP image formats with high-quality conversion.',
          },
          customizable: {
            title: 'Customizable',
            description: 'Control page size, orientation, image layout, quality, and margins for perfect results.',
          },
          fast: {
            title: 'Fast Processing',
            description: 'Lightning-fast conversion powered by modern browser technology. No waiting for uploads.',
          },
          free: {
            title: 'Completely Free',
            description: 'No registration, no limits, no watermarks. Use our tool as many times as you need.',
          },
          crossPlatform: {
            title: 'Cross-Platform',
            description: 'Works on any device with a modern browser. Desktop, tablet, or mobile - we\'ve got you covered.',
          },
        },
        howTo: {
          title: 'How to Convert Images to PDF',
          steps: {
            upload: {
              title: 'Upload Images',
              description: 'Drag and drop your images or click to browse. Select multiple images in JPEG, PNG, GIF, or WebP format.',
            },
            customize: {
              title: 'Customize Settings',
              description: 'Choose page size, orientation, image layout, quality, and margins to create the perfect PDF.',
            },
            download: {
              title: 'Download PDF',
              description: 'Click "Create PDF" and your converted document will be ready for download in seconds.',
            },
          },
        },
      },
      wordToPdf: {
        seo: {
          title: 'Word to PDF Converter - Convert DOCX to PDF Online Free | LocalPDF',
          description: 'Convert Word documents (.docx) to PDF format for free. Fast, secure, and private Word to PDF conversion that works entirely in your browser.',
          keywords: 'word to pdf, docx to pdf, convert word to pdf, document converter, free pdf converter',
          structuredData: {
            name: 'Word to PDF Converter',
            description: 'Convert Word documents (.docx) to PDF format online for free',
            permissions: 'No file upload required',
          },
        },
        breadcrumbs: {
          home: 'Home',
          wordToPdf: 'Word to PDF',
        },
        pageTitle: 'Word to PDF Converter',
        pageDescription: 'Convert your Word documents (.docx) to PDF format quickly and securely. All processing happens locally in your browser - no file uploads required.',
        howTo: {
          title: 'How to Convert Word to PDF',
          steps: {
            choose: {
              title: 'Choose File',
              description: 'Select your Word document (.docx file)',
            },
            convert: {
              title: 'Convert',
              description: 'Automatic conversion starts immediately',
            },
            download: {
              title: 'Download',
              description: 'Your PDF file downloads automatically',
            },
          },
        },
        features: {
          title: 'Why Choose Our Word to PDF Converter?',
          privacy: {
            title: '🔒 Privacy First',
            description: 'Your documents never leave your device. All conversion happens locally in your browser.',
          },
          fast: {
            title: '⚡ Fast & Free',
            description: 'Instant conversion with no file size limits or watermarks. Completely free to use.',
          },
          compatible: {
            title: '📱 Works Everywhere',
            description: 'Compatible with all devices and browsers. No software installation required.',
          },
          quality: {
            title: '✨ High Quality',
            description: 'Preserves original formatting, fonts, and layout for professional results.',
          },
        },
      },
      ocr: {
        seo: {
          title: 'OCR Text Recognition - Extract Text from PDF & Images | LocalPDF',
          description: 'Extract text from PDF files and images using advanced OCR technology. Enhanced support for Russian and 10+ other languages with complete privacy protection.',
          keywords: 'OCR, text recognition, PDF to text, image to text, extract text, Russian OCR, Tesseract',
        },
        breadcrumbs: {
          home: 'Home',
          ocr: 'OCR Text Recognition',
        },
        pageTitle: 'OCR Text Recognition',
        pageDescription: 'Extract text from PDF files and images using advanced OCR technology. Enhanced support for Russian and 10+ other languages with automatic detection.',
        features: {
          private: {
            title: '100% Private',
            description: 'All processing happens in your browser',
          },
          russian: {
            title: 'Russian Support',
            description: 'Enhanced recognition for Cyrillic text',
          },
          fast: {
            title: 'Fast & Accurate',
            description: 'Advanced Tesseract.js technology',
          },
        },
        languages: {
          title: 'Supported Languages',
          items: {
            russian: 'Russian',
            english: 'English',
            german: 'German',
            french: 'French',
            spanish: 'Spanish',
            italian: 'Italian',
            polish: 'Polish',
            ukrainian: 'Ukrainian',
            dutch: 'Dutch',
            portuguese: 'Portuguese',
          },
        },
      },
      extractPages: {
        pageTitle: 'Extract PDF Pages Free',
        pageDescription: 'Extract specific pages from PDF documents for free. Create new PDFs from selected pages with full control over page selection.',
        uploadTitle: 'Upload PDF to Extract Pages',
        uploadSubtitle: 'Select a PDF file to extract specific pages from',
        buttons: {
          uploadDifferent: '← Upload Different PDF',
        },
        features: {
          title: '✨ Key Features:',
          items: {
            individual: '• Extract individual pages or page ranges',
            custom: '• Custom page selection (e.g., "1-5, 8, 10-12")',
            preview: '• Visual page preview and selection',
            quality: '• Preserve original PDF quality',
          },
        },
        privacy: {
          title: '🔒 Privacy & Security:',
          items: {
            clientSide: '• 100% client-side processing',
            noUploads: '• No file uploads to servers',
            localProcessing: '• Your data never leaves your device',
            instantProcessing: '• Instant processing and download',
          },
        },
        benefits: {
          title: 'Why Choose Our PDF Page Extractor?',
          fast: {
            title: 'Lightning Fast',
            description: 'Extract pages instantly with our optimized browser-based processing',
          },
          precise: {
            title: 'Precise Control',
            description: 'Select exactly the pages you need with our intuitive selection tools',
          },
          private: {
            title: '100% Private',
            description: 'Your PDFs are processed locally in your browser - never uploaded anywhere',
          },
        },
        howTo: {
          title: 'How to Extract PDF Pages',
          steps: {
            upload: {
              title: 'Upload PDF',
              description: 'Drop your PDF file or click to browse',
            },
            select: {
              title: 'Select Pages',
              description: 'Choose individual pages or ranges',
            },
            extract: {
              title: 'Extract',
              description: 'Click extract to process your selection',
            },
            download: {
              title: 'Download',
              description: 'Get your new PDF with selected pages',
            },
          },
        },
      },
      extractText: {
        pageTitle: 'Extract Text from PDF Free',
        pageDescription: 'Extract text content from PDF files for free. Get plain text from PDF documents with smart formatting. Privacy-first text extraction in your browser.',
        steps: {
          upload: 'Step 1: Upload your PDF file',
          choose: 'Step 2: Choose extraction options (smart formatting recommended)',
          download: 'Step 3: Download extracted text as .txt file',
        },
        tool: {
          title: 'Extract Text',
          description: 'Extract and intelligently format text content from your PDF',
          fileToExtract: 'File to extract text from:',
          extractionOptions: 'Extraction Options:',
          smartFormatting: 'Enable Smart Formatting (Recommended)',
          smartFormattingDesc: 'Automatically clean up text, fix line breaks, detect headings, and improve readability',
          formattingLevel: 'Formatting Level:',
          levels: {
            minimal: {
              title: 'Minimal',
              desc: 'Basic cleanup - merge broken words, remove extra spaces'
            },
            standard: {
              title: 'Standard',
              desc: 'Recommended - paragraphs, headings, lists, clean formatting'
            },
            advanced: {
              title: 'Advanced',
              desc: 'Maximum - all features plus enhanced structure detection'
            }
          },
          includeMetadata: 'Include document metadata (title, author, creation date)',
          preserveFormatting: 'Preserve page formatting (include page numbers and separators)',
          pageRange: 'Extract specific page range (default: all pages)',
          pageRangeFields: {
            startPage: 'Start Page',
            endPage: 'End Page',
            note: 'Leave end page empty or equal to start page to extract a single page'
          },
          extracting: 'Extracting text... {progress}%',
          success: {
            title: 'Text Extraction Complete!',
            pagesProcessed: 'Pages processed: {count}',
            textLength: 'Text length: {length} characters',
            documentTitle: 'Document title: {title}',
            author: 'Author: {author}',
            smartFormattingApplied: 'Smart Formatting Applied ({level})',
            fileDownloaded: 'File automatically downloaded as .txt',
            noTextWarning: 'This PDF may contain scanned images without extractable text',
            comparisonPreview: 'Formatting Improvement Preview:',
            before: 'Before (Raw):',
            after: 'After (Smart Formatted):',
            notice: '↑ Notice the improved formatting, merged words, and better structure!',
            textPreview: 'Extracted Text Preview:'
          },
          infoBox: {
            title: 'Smart Text Extraction',
            description: 'Using PDF.js with intelligent formatting to extract clean, readable text. Smart formatting automatically fixes common PDF text issues like broken words, messy line breaks, and poor structure.'
          },
          privacy: {
            title: 'Privacy & Security',
            description: 'Text extraction and formatting happen locally in your browser. Your PDF content never leaves your device, ensuring complete privacy and security.'
          },
          buttons: {
            extractText: 'Extract Text',
            extracting: 'Extracting Text...'
          }
        }
      },
      addText: {
        pageTitle: 'Add Text to PDF Free',
        pageDescription: 'Add custom text to PDF files for free. Insert text, signatures, and annotations. Privacy-first PDF text editor that works in your browser.',
        steps: {
          upload: 'Step 1: Upload your PDF file',
          click: 'Step 2: Click on the PDF to add text',
          save: 'Step 3: Save your modified PDF',
        },
      },
      rotate: {
        pageTitle: 'Rotate PDF Pages Free',
        pageDescription: 'Rotate PDF pages 90°, 180°, or 270° for free. Fix document orientation quickly and easily with our browser-based PDF rotation tool.',
        uploadTitle: 'Upload PDF to Rotate Pages',
        uploadSubtitle: 'Select a PDF file to rotate its pages',
        buttons: {
          uploadDifferent: '← Upload Different PDF',
        },
        features: {
          title: '✨ Key Features:',
          items: {
            angles: '• Rotate pages by 90°, 180°, or 270°',
            selection: '• Rotate all pages or select specific ones',
            preview: '• Preview pages before rotating',
            quality: '• Preserve original PDF quality',
          },
        },
        privacy: {
          title: '🔒 Privacy & Security:',
          items: {
            clientSide: '• 100% client-side processing',
            noUploads: '• No file uploads to servers',
            localProcessing: '• Your data never leaves your device',
            instantProcessing: '• Instant processing and download',
          },
        },
        benefits: {
          title: 'Why Choose Our PDF Page Rotator?',
          instant: {
            title: 'Instant Rotation',
            description: 'Rotate pages instantly with our optimized browser-based processing',
          },
          precise: {
            title: 'Precise Control',
            description: 'Choose exact rotation angles and select specific pages to rotate',
          },
          private: {
            title: '100% Private',
            description: 'Your PDFs are processed locally in your browser - never uploaded anywhere',
          },
        },
        howTo: {
          title: 'How to Rotate PDF Pages',
          steps: {
            upload: {
              title: 'Upload PDF',
              description: 'Drop your PDF file or click to browse',
            },
            select: {
              title: 'Select Pages',
              description: 'Choose which pages to rotate',
            },
            angle: {
              title: 'Choose Angle',
              description: 'Select rotation: 90°, 180°, or 270°',
            },
            download: {
              title: 'Download',
              description: 'Get your PDF with rotated pages',
            },
          },
        },
      },
      watermark: {
        pageTitle: 'Add Watermark to PDF Free',
        pageDescription: 'Add text or image watermarks to PDF files for free. Protect your documents with custom watermarks. Secure PDF watermarking in your browser.',
        steps: {
          upload: 'Step 1: Upload your PDF file',
          configure: 'Step 2: Configure watermark settings',
          download: 'Step 3: Download your watermarked PDF',
        },
      },
      pdfToImage: {
        pageTitle: 'Convert PDF to Images Free',
        pageDescription: 'Convert PDF pages to images for free. Export PDF as JPG, PNG, or WEBP. High-quality conversion in your browser.',
        steps: {
          upload: 'Step 1: Upload your PDF file',
          format: 'Step 2: Choose output format (PNG, JPG, WEBP)',
          download: 'Step 3: Download your converted images',
        },
      },
    },
  },
};
