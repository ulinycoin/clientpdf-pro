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
    home: 'Home',
    free: 'Free',
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
      pageDescription: 'Combine multiple PDF files into a single document. Drag, drop, reorder pages and merge PDFs instantly in your browser.',
      howTo: {
        title: 'How to Merge PDF Files',
        steps: {
          upload: {
            title: 'Upload PDF Files',
            description: 'Select multiple PDF files from your device or drag and drop them into the upload area.',
          },
          configure: {
            title: 'Arrange Pages',
            description: 'Reorder pages by dragging them. Preview how your merged PDF will look.',
          },
          download: {
            title: 'Download Merged PDF',
            description: 'Get your combined PDF file with all pages in the order you specified.',
          },
        },
      },
      features: {
        title: 'Why choose our PDF merge tool?',
        privacy: {
          title: '100% Private & Secure',
          description: 'Your files never leave your device. All processing happens locally in your browser for maximum privacy and security.',
        },
        fast: {
          title: 'Lightning Fast Processing',
          description: 'Merge PDF files instantly without waiting for uploads or downloads. Works offline too.',
        },
        quality: {
          title: 'Perfect Page Order',
          description: 'Drag and drop to arrange pages exactly how you want them in the final merged document.',
        },
        free: {
          title: 'Completely Free',
          description: 'No limits, no watermarks, no hidden fees. Merge unlimited PDF files for free, forever.',
        },
      },
      faqTitle: 'Frequently Asked Questions about PDF Merging',
    },
    split: {
      title: 'Split PDF',
      description: 'Split PDF into separate pages or ranges',
      pageTitle: 'Split PDF Files Free',
      pageDescription: 'Split PDF files by pages or ranges for free. Extract specific pages from PDF documents. Private and secure PDF splitting in your browser.',
      uploadTitle: 'Upload PDF to Split',
      buttons: {
        startSplitting: 'Start Splitting',
      },
      seo: {
        title: 'Split PDF Files Free - Extract Pages Online | LocalPDF',
        description: 'Split PDF files by pages or ranges for free. Extract specific pages from PDF documents. Private and secure PDF splitting in your browser.',
        keywords: 'split pdf, extract pdf pages, pdf page extractor, pdf splitter free, divide pdf',
      },
      breadcrumbs: {
        home: 'Home',
        split: 'Split PDF',
      },
      howTo: {
        title: 'How to Split PDF Files',
        steps: {
          upload: {
            title: 'Upload PDF',
            description: 'Click "Choose File" or drag and drop your PDF document into the upload area.',
            icon: '📤',
          },
          configure: {
            title: 'Select Pages',
            description: 'Choose which pages to extract - individual pages, page ranges, or multiple sections.',
            icon: '✂️',
          },
          download: {
            title: 'Download Pages',
            description: 'Your split PDF pages will be ready for download instantly.',
            icon: '📥',
          },
        },
      },
      features: {
        title: 'Why Choose Our PDF Splitter?',
        privacy: {
          title: '100% Private',
          description: 'Your PDF is processed locally in your browser. No uploads to servers, complete privacy guaranteed.',
        },
        fast: {
          title: 'Lightning Fast',
          description: 'Instant PDF splitting with our optimized engine. No waiting for uploads or processing queues.',
        },
        quality: {
          title: 'High Quality',
          description: 'Preserve original PDF quality and formatting. Split pages maintain perfect clarity and structure.',
        },
        free: {
          title: 'Completely Free',
          description: 'Split unlimited PDFs for free. No registration, no watermarks, no hidden limitations.',
        },
      },
      faqTitle: 'Frequently Asked Questions about PDF Splitting',
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
    excelToPdf: {
      title: 'Excel to PDF',
      description: 'Convert Excel spreadsheets (.xlsx, .xls) to PDF format',
      pageTitle: 'Excel to PDF Converter',
      pageDescription: 'Convert your Excel files (.xlsx, .xls) to PDF format with support for multiple sheets, wide tables, and international text. All processing happens locally.',
      howToTitle: 'How to Convert Excel to PDF',
      uploadTitle: 'Upload Excel File',
      uploadDescription: 'Select your Excel file (.xlsx or .xls) from your device. Files are processed locally for maximum privacy.',
      configureTitle: 'Configure Settings',
      configureDescription: 'Choose which sheets to convert, set orientation, and adjust formatting options to match your needs.',
      downloadTitle: 'Download PDF',
      downloadDescription: 'Get your converted PDF files instantly. Each sheet can be saved as a separate PDF or combined into one.',
      featuresTitle: 'Why Choose LocalPDF Excel Converter?',
      privacyTitle: '100% Private & Secure',
      privacyDescription: 'Your Excel files never leave your device. All conversion happens locally in your browser for maximum privacy and security.',
      fastTitle: 'Lightning Fast Processing',
      fastDescription: 'Convert Excel files to PDF instantly without waiting for uploads or downloads. Works offline too.',
      multiFormatTitle: 'Multiple Formats Support',
      multiFormatDescription: 'Works with both .xlsx and .xls files. Supports multiple sheets, complex formulas, and international text.',
      freeTitle: 'Completely Free',
      freeDescription: 'No limits, no watermarks, no hidden fees. Convert unlimited Excel files to PDF for free, forever.',
      // Tool component translations
      chooseExcelFile: 'Choose Excel File',
      dragDropSubtitle: 'Click here or drag and drop your Excel spreadsheet',
      supportedFormats: 'Supports Excel files (.xlsx, .xls) up to 100MB',
      multipleSheets: 'Multiple sheets support',
      complexFormulas: 'Complex formulas and formatting',
      internationalText: 'International text and languages',
      localProcessing: 'Processing happens locally in your browser',
      conversionCompleted: 'Conversion Completed!',
      pdfReady: 'PDF is ready for download',
      multipleFiles: '{count} PDF files generated',
      fileInformation: 'File Information',
      file: 'File',
      size: 'Size',
      sheets: 'Sheets',
      languages: 'Languages',
      multiLanguageNote: 'Multiple languages detected. Appropriate fonts will be loaded automatically.',
      chooseDifferentFile: 'Choose Different File',
      conversionSettings: 'Conversion Settings',
      selectSheets: 'Select Sheets',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      rowsColumns: '{rows} rows × {columns} columns',
      pageOrientation: 'Page Orientation',
      portrait: 'Portrait',
      landscape: 'Landscape',
      pageSize: 'Page Size',
      fontSize: 'Font Size',
      outputFormat: 'Output Format',
      singlePdf: 'Single PDF file',
      separatePdfs: 'Separate PDF files',
      includeSheetNames: 'Include Sheet Names',
      convertToPdf: 'Convert to PDF',
      converting: 'Converting...',
      faqTitle: 'Frequently Asked Questions about Excel to PDF Conversion',
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
        'word-to-pdf': 'Word to PDF',
        'excel-to-pdf': 'Excel to PDF',
        'images-to-pdf': 'Images to PDF',
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
        'word-to-pdf': 'Convert Word documents to PDF',
        'excel-to-pdf': 'Convert Excel spreadsheets to PDF',
        'images-to-pdf': 'Convert images to PDF format',
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
        'excel-to-pdf': {
          'word-to-pdf': 'convert documents to PDF',
          'images-to-pdf': 'convert images to PDF',
          merge: 'merge multiple PDFs',
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
      lastUpdated: 'Last Updated: July 20, 2025',
      sections: {
        commitment: {
          title: 'Our Privacy Commitment',
          content: 'LocalPDF is designed with privacy as the foundation. We believe your documents and data should remain yours and yours alone. This Privacy Policy explains how LocalPDF protects your privacy and ensures your data never leaves your device.'
        },
        simpleAnswer: {
          title: 'The Simple Answer',
          main: 'LocalPDF does not collect, store, transmit, or have access to any of your data, files, or personal information.',
          sub: 'All PDF processing happens entirely within your web browser. Your files never leave your device.'
        },
        whatWeDont: {
          title: 'What We DON\'T Do',
          noDataCollection: {
            title: 'No Data Collection',
            items: ['No personal information', 'No usage tracking', 'No analytics cookies', 'No user accounts']
          },
          noFileAccess: {
            title: 'No File Access',
            items: ['No server uploads', 'No file storage', 'No document copies', 'No processing history']
          }
        },
        howItWorks: {
          title: 'How LocalPDF Works',
          clientSide: {
            title: 'Client-Side Processing',
            description: 'All PDF operations happen directly in your web browser using:',
            items: ['JavaScript PDF libraries (pdf-lib, PDF.js, jsPDF)', 'Web Workers for performance optimization', 'Local memory for temporary processing', 'Your device\'s resources exclusively']
          },
          process: {
            title: 'The Complete Process',
            steps: [
              'You select a PDF file from your device',
              'File loads into browser memory (never uploaded)',
              'Processing happens locally using JavaScript',
              'Result is generated in your browser',
              'You download the processed file directly',
              'All data is cleared from memory when you close the page'
            ]
          }
        },
        analytics: {
          title: 'Privacy-First Analytics',
          description: 'LocalPDF uses Vercel Analytics to understand how our tools are used and improve user experience. Our analytics approach maintains our privacy-first philosophy:',
          whatWeTrack: {
            title: 'What We Track (Anonymously)',
            items: ['Page visits - which tools are most popular', 'Tool usage - basic metrics like file processing counts', 'Performance data - loading times and errors', 'General location - country/region only (for language optimization)']
          },
          protections: {
            title: 'Privacy Protections',
            items: ['No cookies - analytics work without tracking cookies', 'No personal data - we never see your files or personal information', 'IP anonymization - your exact IP address is never stored', 'DNT respected - we honor "Do Not Track" browser settings', 'GDPR compliant - all analytics are privacy-regulation compliant']
          }
        },
        compliance: {
          title: 'International Privacy Compliance',
          gdpr: {
            title: 'GDPR',
            description: 'Fully compliant - no personal data processed'
          },
          ccpa: {
            title: 'CCPA',
            description: 'Compliant - no data collection or sale'
          },
          global: {
            title: 'Global',
            description: 'Privacy-first design ensures worldwide compliance'
          }
        },
        summary: {
          title: 'Summary',
          main: 'LocalPDF is designed to be completely private by default. Your files, data, and privacy are protected because we simply don\'t collect, store, or transmit any of your information.',
          sub: 'This isn\'t just a policy promise—it\'s built into the fundamental architecture of how LocalPDF works.'
        }
      }
    },
    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know about LocalPDF',
      sections: {
        general: {
          title: 'General Questions',
          questions: {
            whatIs: {
              question: 'What is LocalPDF?',
              answer: 'LocalPDF is a free, privacy-first web application that provides 12 powerful PDF tools for merging, splitting, compressing, editing, and converting PDF files. All processing happens entirely in your browser - no uploads, no registration, no tracking.'
            },
            free: {
              question: 'Is LocalPDF really free?',
              answer: 'Yes! LocalPDF is completely free to use with no limitations, ads, or hidden fees. We believe essential PDF tools should be accessible to everyone.'
            },
            account: {
              question: 'Do I need to create an account?',
              answer: 'No account required! Simply visit LocalPDF and start using any tool immediately.'
            }
          }
        },
        privacy: {
          title: 'Privacy & Security',
          questions: {
            uploaded: {
              question: 'Are my files uploaded to your servers?',
              answer: 'No! This is LocalPDF\'s core feature - all processing happens in your browser. Your files never leave your device. We cannot see, access, or store your documents.'
            },
            afterUse: {
              question: 'What happens to my files after I use LocalPDF?',
              answer: 'Your files are processed in your browser\'s memory and automatically cleared when you close the page or navigate away. Nothing is stored permanently.'
            },
            confidential: {
              question: 'Is LocalPDF safe for confidential documents?',
              answer: 'Yes! Since all processing is local and we don\'t collect any data, LocalPDF is ideal for confidential, sensitive, or private documents.'
            }
          }
        },
        technical: {
          title: 'Technical Questions',
          questions: {
            browsers: {
              question: 'What browsers support LocalPDF?',
              answer: 'LocalPDF works on all modern browsers:',
              browsers: ['Chrome 90+', 'Firefox 90+', 'Safari 14+', 'Edge 90+']
            },
            fileSize: {
              question: 'What\'s the maximum file size I can process?',
              answer: 'LocalPDF can handle files up to 100MB. For very large files, processing may take longer depending on your device\'s performance.'
            },
            offline: {
              question: 'Does LocalPDF work offline?',
              answer: 'Yes! After your first visit, LocalPDF works offline. Your browser caches the application, so you can use it without an internet connection.'
            }
          }
        },
        tools: {
          title: 'PDF Tools',
          editText: {
            question: 'Can I edit existing text in PDFs?',
            answer: 'Currently, LocalPDF allows adding new text to PDFs but not editing existing text. You can add text overlays, signatures, notes, and annotations.'
          }
        },
        support: {
          title: 'Still Need Help?',
          gettingSupport: {
            title: 'Getting Support',
            items: ['GitHub Issues: Technical problems and bug reports', 'GitHub Discussions: General questions and community help', 'Documentation: Complete guides and tutorials']
          },
          contact: {
            title: 'Contact Information',
            github: 'Report Issues on GitHub',
            discussions: 'Join Community Discussions'
          }
        }
      }
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
      excelToPdf: {
        seo: {
          title: 'Excel to PDF Converter - Convert XLSX to PDF Online Free | LocalPDF',
          description: 'Convert Excel files (.xlsx, .xls) to PDF format for free. Support for multiple sheets, wide tables, and international languages. Fast, secure, and private.',
          keywords: 'excel to pdf, xlsx to pdf, xls to pdf, spreadsheet to pdf, table to pdf, excel converter',
          structuredData: {
            name: 'Excel to PDF Converter',
            description: 'Convert Excel spreadsheets to PDF format online for free',
            permissions: 'No file upload required',
          },
        },
        breadcrumbs: {
          home: 'Home',
          excelToPdf: 'Excel to PDF',
        },
        pageTitle: 'Excel to PDF Converter',
        pageDescription: 'Convert your Excel files (.xlsx, .xls) to PDF format with support for multiple sheets, wide tables, and international text. All processing happens locally.',
        howTo: {
          title: 'How to Convert Excel to PDF',
          steps: {
            upload: {
              title: 'Upload Excel File',
              description: 'Select your Excel file (.xlsx or .xls) from your device. Files are processed locally for maximum privacy.',
            },
            configure: {
              title: 'Configure Settings',
              description: 'Choose which sheets to convert, set orientation, and adjust formatting options to match your needs.',
            },
            download: {
              title: 'Download PDF',
              description: 'Get your converted PDF files instantly. Each sheet can be saved as a separate PDF or combined into one.',
            },
          },
        },
        features: {
          title: 'Why Choose LocalPDF Excel Converter?',
          privacy: {
            title: '100% Private & Secure',
            description: 'Your Excel files never leave your device. All conversion happens locally in your browser for maximum privacy and security.',
          },
          fast: {
            title: 'Lightning Fast Processing',
            description: 'Convert Excel files to PDF instantly without waiting for uploads or downloads. Works offline too.',
          },
          multiFormat: {
            title: 'Multiple Formats Support',
            description: 'Works with both .xlsx and .xls files. Supports multiple sheets, complex formulas, and international text.',
          },
          free: {
            title: 'Completely Free',
            description: 'No limits, no watermarks, no hidden fees. Convert unlimited Excel files to PDF for free, forever.',
          },
        },
        steps: {
          upload: 'Step 1: Upload your Excel file (.xlsx or .xls)',
          configure: 'Step 2: Select sheets and configure conversion settings',
          download: 'Step 3: Download your converted PDF files',
        },
      },
    },
  },

  // Errors and messages
  errors: {
    fileNotSupported: 'File format not supported',
    fileTooLarge: 'File size too large',
    processingFailed: 'Processing failed',
    noFilesSelected: 'No files selected',
    invalidFormat: 'Invalid file format',
    networkError: 'Network error',
    unknownError: 'Unknown error occurred',
  },

  // Footer
  footer: {
    description: 'LocalPDF - Privacy-first PDF tools that work entirely in your browser',
    links: {
      privacy: 'Privacy Policy',
      faq: 'FAQ',
      github: 'GitHub',
    },
    copyright: '© 2024 LocalPDF. All rights reserved.',
  },

  // Components
  components: {
    relatedTools: {
      title: 'Related Tools',
      subtitle: 'Discover other helpful PDF tools to enhance your workflow',
      viewAllTools: 'View All Tools',
      toolNames: {
        merge: 'Merge PDF',
        split: 'Split PDF',
        compress: 'Compress PDF',
        addText: 'Add Text',
        watermark: 'Watermark PDF',
        rotate: 'Rotate PDF',
        extractPages: 'Extract Pages',
        extractText: 'Extract Text',
        pdfToImage: 'PDF to Image',
        'word-to-pdf': 'Word to PDF',
        'excel-to-pdf': 'Excel to PDF',
        'images-to-pdf': 'Images to PDF',
      },
      toolDescriptions: {
        merge: 'Combine multiple PDF files into one document',
        split: 'Split PDF files into separate pages or sections',
        compress: 'Reduce PDF file size while maintaining quality',
        addText: 'Add custom text, signatures, and annotations',
        watermark: 'Add text or image watermarks to protect documents',
        rotate: 'Rotate PDF pages to fix orientation',
        extractPages: 'Extract specific pages from PDF documents',
        extractText: 'Extract text content from PDF files',
        pdfToImage: 'Convert PDF pages to image formats',
      },
      actions: {
        merge: {
          split: 'Need to split instead? Try our split tool',
          compress: 'Large merged file? Compress it now',
          extractPages: 'Extract specific pages from merged PDF',
        },
        split: {
          merge: 'Want to merge instead? Use our merge tool',
          rotate: 'Rotate pages after splitting',
          extractPages: 'Extract specific pages only',
        },
        compress: {
          merge: 'Merge compressed files together',
          split: 'Split compressed PDF into parts',
          watermark: 'Add watermark to compressed PDF',
        },
        addText: {
          watermark: 'Add watermark for extra protection',
          rotate: 'Rotate pages with added text',
          extractText: 'Extract text from modified PDF',
        },
        watermark: {
          addText: 'Add more text to watermarked PDF',
          compress: 'Compress watermarked PDF file',
          rotate: 'Rotate watermarked pages',
        },
        rotate: {
          addText: 'Add text to rotated pages',
          watermark: 'Add watermark to rotated PDF',
          split: 'Split rotated PDF into parts',
        },
        extractPages: {
          merge: 'Merge extracted pages with other PDFs',
          rotate: 'Rotate extracted pages',
          pdfToImage: 'Convert extracted pages to images',
        },
        extractText: {
          addText: 'Add new text to PDF',
          extractPages: 'Extract specific pages only',
          pdfToImage: 'Convert PDF to images',
        },
        pdfToImage: {
          extractPages: 'Extract specific pages first',
          extractText: 'Extract text before converting',
          rotate: 'Rotate pages before conversion',
        },
        'excel-to-pdf': {
          'word-to-pdf': 'Also convert Word documents',
          'images-to-pdf': 'Combine with images',
          merge: 'Merge with other PDFs',
        },
      },
    },
    fileUploadZone: {
      dropActive: 'Drop files here',
      chooseFiles: 'Choose Files',
      dragAndDrop: 'Drag and drop files here',
      maxFileSize: 'Max file size: 100MB',
      selectFiles: 'Select Files',
      trustFeatures: {
        private: 'Private',
        fast: 'Fast',
        free: 'Free',
      },
      trustMessage: '100% privacy • No uploads • No limits',
      alerts: {
        unsupportedFiles: 'Some files are not supported',
        fileLimit: 'File size limit exceeded',
      },
      accessibility: {
        uploadArea: 'File upload area',
        selectFiles: 'Select files for upload',
      },
    },
  },
};
export default en;
