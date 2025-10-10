/**
 * Static pages translations for EN language
 * Contains: FAQ, privacy policy, terms, other static pages
 */

export const pages = {
  faq: {
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about LocalPDF - privacy-first PDF tools',
    searchPlaceholder: 'Search for answers...',
    searchNoResults: 'No questions found. Try different keywords or',
    searchContactLink: 'contact our support',

    // Popular questions section (Top 4-5 most important)
    popular: {
      title: 'Most Popular Questions',
      subtitle: 'Quick answers to what users ask most'
    },

    // Categories with questions
    categories: {
      privacy: {
        id: 'privacy',
        title: 'Privacy & Security',
        icon: '🔒',
        description: 'Learn how we protect your data and ensure complete privacy',
        questions: [
          {
            id: 'files-uploaded',
            question: 'Are my PDF files uploaded to your servers?',
            answer: 'No, absolutely not! All PDF processing happens <strong>100% locally in your browser</strong>. Your files never leave your device - they are not uploaded to our servers or any cloud service. This ensures complete privacy and security for your sensitive documents.',
            keywords: ['upload', 'server', 'cloud', 'privacy', 'local'],
            relatedTools: ['/merge-pdf', '/split-pdf', '/compress-pdf'],
            relatedPages: ['/privacy', '/gdpr'],
            popular: true
          },
          {
            id: 'data-collection',
            question: 'What data do you collect about me?',
            answer: 'We collect <strong>minimal anonymous analytics</strong> to improve our service: page views, browser type, and country-level location. We <strong>never collect</strong>: file names, file contents, personal information, or processing history. Read our complete <a href="/privacy">Privacy Policy</a> for details.',
            keywords: ['data', 'collect', 'analytics', 'tracking', 'gdpr'],
            relatedPages: ['/privacy', '/gdpr', '/terms'],
            popular: true
          },
          {
            id: 'confidential-docs',
            question: 'Can I process confidential or sensitive documents?',
            answer: 'Yes! LocalPDF is <strong>perfect for confidential documents</strong> because everything is processed locally. Your sensitive files (contracts, financial reports, legal documents) never leave your computer. Unlike online services that upload files to servers, we process everything in your browser.',
            keywords: ['confidential', 'sensitive', 'secure', 'legal', 'financial'],
            relatedTools: ['/protect-pdf', '/watermark-pdf'],
            relatedPages: ['/privacy', '/gdpr']
          },
          {
            id: 'after-processing',
            question: 'What happens to my files after processing?',
            answer: 'Files are <strong>automatically cleared from browser memory</strong> when you close the page or navigate away. Since processing is local, there are no files stored on servers. You have complete control - download your results and close the page when done.',
            keywords: ['delete', 'remove', 'clear', 'storage', 'cache'],
            relatedPages: ['/privacy']
          },
          {
            id: 'internet-required',
            question: 'Do I need an internet connection to use LocalPDF?',
            answer: 'Only for the <strong>initial page load</strong>. After that, you can process PDFs completely offline! The processing libraries are loaded into your browser, so you can work without internet. Perfect for working with sensitive documents on airplanes or in secure environments.',
            keywords: ['offline', 'internet', 'connection', 'network'],
            popular: true
          }
        ]
      },

      features: {
        id: 'features',
        title: 'Features & Tools',
        icon: '🛠️',
        description: 'Explore our PDF tools and their capabilities',
        questions: [
          {
            id: 'available-tools',
            question: 'What PDF tools are available?',
            answer: 'LocalPDF offers <strong>15+ professional PDF tools</strong>: <a href="/merge-pdf">Merge PDF</a>, <a href="/split-pdf">Split PDF</a>, <a href="/compress-pdf">Compress PDF</a>, <a href="/protect-pdf">Password Protect</a>, <a href="/watermark-pdf">Add Watermark</a>, <a href="/add-text-pdf">Add Text</a>, <a href="/rotate-pdf">Rotate Pages</a>, <a href="/ocr-pdf">OCR Text Recognition</a>, <a href="/extract-pages-pdf">Extract Pages</a>, <a href="/extract-text-pdf">Extract Text</a>, <a href="/extract-images-from-pdf">Extract Images</a>, <a href="/pdf-to-image">PDF to Image</a>, <a href="/image-to-pdf">Image to PDF</a>, <a href="/word-to-pdf">Word to PDF</a>, and more!',
            keywords: ['tools', 'features', 'available', 'list', 'capabilities'],
            relatedTools: ['/merge-pdf', '/split-pdf', '/compress-pdf', '/ocr-pdf'],
            popular: true
          },
          {
            id: 'edit-existing-text',
            question: 'Can I edit existing text in my PDFs?',
            answer: 'LocalPDF focuses on <strong>document manipulation</strong> (merge, split, compress) rather than content editing. You can <a href="/add-text-pdf">add new text</a>, <a href="/watermark-pdf">add watermarks</a>, and <a href="/ocr-pdf">extract text with OCR</a>, but editing existing text requires specialized PDF editors. We recommend tools like Adobe Acrobat or PDF-XChange Editor for text editing.',
            keywords: ['edit', 'text', 'modify', 'change', 'content'],
            relatedTools: ['/add-text-pdf', '/watermark-pdf', '/ocr-pdf']
          },
          {
            id: 'browser-extension',
            question: 'Is there a browser extension for LocalPDF?',
            answer: 'Yes! Install our <strong>free Chrome extension</strong> for quick access to PDF tools directly from your browser. Right-click any PDF → "Open with LocalPDF" → Process instantly. <a href="https://chromewebstore.google.com/detail/localpdf/mjidkeobnlijdjmioniboflmoelmckfl" target="_blank" rel="noopener noreferrer">Download Chrome Extension →</a>',
            keywords: ['extension', 'chrome', 'browser', 'plugin', 'addon'],
            relatedPages: ['/how-to-use'],
            popular: true
          },
          {
            id: 'file-size-limits',
            question: 'Are there file size limits?',
            answer: 'No artificial limits! The only constraints are your <strong>device\'s RAM and processing power</strong>. Most modern computers can handle PDFs up to 100-200 MB easily. Large files (500+ MB) may take longer to process. Since everything is local, there are no server upload limits.',
            keywords: ['limit', 'size', 'maximum', 'large', 'big'],
            relatedTools: ['/compress-pdf']
          },
          {
            id: 'batch-processing',
            question: 'Can I process multiple PDFs at once?',
            answer: 'Yes! Most tools support <strong>batch processing</strong>. For example, <a href="/merge-pdf">Merge PDF</a> can combine dozens of files, <a href="/compress-pdf">Compress PDF</a> can optimize multiple PDFs, and <a href="/protect-pdf">Protect PDF</a> can password-protect multiple files simultaneously. Upload multiple files and process them all at once.',
            keywords: ['batch', 'multiple', 'bulk', 'many', 'several'],
            relatedTools: ['/merge-pdf', '/compress-pdf', '/protect-pdf']
          }
        ]
      },

      technical: {
        id: 'technical',
        title: 'Technical Questions',
        icon: '💻',
        description: 'Browser compatibility, performance, and technical details',
        questions: [
          {
            id: 'supported-browsers',
            question: 'Which browsers are supported?',
            answer: 'LocalPDF works on <strong>all modern browsers</strong>: <ul><li><strong>Google Chrome</strong> (recommended - best performance)</li><li><strong>Mozilla Firefox</strong></li><li><strong>Microsoft Edge</strong></li><li><strong>Apple Safari</strong></li><li><strong>Opera</strong></li></ul>We recommend updating to the latest browser version for optimal performance.',
            keywords: ['browser', 'chrome', 'firefox', 'safari', 'edge'],
            relatedPages: ['/how-to-use']
          },
          {
            id: 'processing-speed',
            question: 'Why is processing slow for large PDFs?',
            answer: 'Processing speed depends on your <strong>device hardware</strong> and <strong>PDF complexity</strong>. Large files (100+ MB) or PDFs with many images require more RAM and CPU. Tips for faster processing: <ul><li>Close other browser tabs</li><li>Use <a href="/compress-pdf">Compress PDF</a> first to reduce file size</li><li>Process fewer files at once</li><li>Upgrade browser to latest version</li></ul>',
            keywords: ['slow', 'performance', 'speed', 'fast', 'optimize'],
            relatedTools: ['/compress-pdf']
          },
          {
            id: 'mobile-support',
            question: 'Can I use LocalPDF on mobile devices?',
            answer: 'Yes! LocalPDF works on <strong>mobile browsers</strong> (iOS Safari, Chrome Android), but performance may be limited due to device RAM. For best experience on mobile: <ul><li>Process smaller files (< 50 MB)</li><li>Use simpler tools (<a href="/rotate-pdf">Rotate</a>, <a href="/extract-pages-pdf">Extract Pages</a>)</li><li>Avoid heavy tools (OCR, large merges) on older phones</li></ul>',
            keywords: ['mobile', 'phone', 'tablet', 'ios', 'android'],
            relatedTools: ['/rotate-pdf', '/extract-pages-pdf']
          },
          {
            id: 'file-formats',
            question: 'What file formats are supported?',
            answer: 'LocalPDF supports: <ul><li><strong>PDF files</strong> - all versions, encrypted PDFs (with password)</li><li><strong>Images</strong> - JPG, PNG, WebP, TIFF (<a href="/image-to-pdf">Image to PDF</a>)</li><li><strong>Documents</strong> - DOCX, DOC (<a href="/word-to-pdf">Word to PDF</a>), XLSX (<a href="/excel-to-pdf">Excel to PDF</a>)</li></ul>All conversions happen locally with no file uploads.',
            keywords: ['format', 'type', 'supported', 'convert', 'compatibility'],
            relatedTools: ['/image-to-pdf', '/word-to-pdf', '/pdf-to-image']
          }
        ]
      },

      account: {
        id: 'account',
        title: 'Account & Pricing',
        icon: '💰',
        description: 'Free to use, no registration required',
        questions: [
          {
            id: 'is-free',
            question: 'Is LocalPDF really free?',
            answer: '<strong>Yes, 100% free!</strong> All tools are completely free with no hidden costs, no premium tiers, no subscriptions. We believe privacy-first tools should be accessible to everyone. Our project is <strong>open source</strong> and supported by the community. <a href="https://github.com/ulinycoin/clientpdf-pro" target="_blank" rel="noopener noreferrer">View source code on GitHub →</a>',
            keywords: ['free', 'cost', 'price', 'premium', 'subscription'],
            popular: true
          },
          {
            id: 'account-required',
            question: 'Do I need to create an account?',
            answer: 'No! <strong>Zero registration required</strong>. Simply visit any tool page and start processing PDFs immediately. No email, no password, no personal information needed. This is part of our privacy-first philosophy - we don\'t want your data because we don\'t collect it.',
            keywords: ['account', 'registration', 'signup', 'login', 'email']
          },
          {
            id: 'how-we-make-money',
            question: 'How does LocalPDF make money if it\'s free?',
            answer: 'LocalPDF is an <strong>open source project</strong> with minimal server costs (since processing is local). We may add optional features in the future (like cloud sync for settings), but all core PDF tools will remain free forever. The project is community-supported and focused on providing privacy-first tools.',
            keywords: ['money', 'revenue', 'business', 'monetization', 'ads']
          }
        ]
      },

      support: {
        id: 'support',
        title: 'Support & Contact',
        icon: '📞',
        description: 'Get help and contact our team',
        questions: [
          {
            id: 'get-support',
            question: 'How do I get support or report bugs?',
            answer: 'Multiple ways to get help: <ul><li><strong>Email</strong>: <a href="mailto:support@localpdf.online">support@localpdf.online</a> (technical support)</li><li><strong>GitHub</strong>: <a href="https://github.com/ulinycoin/clientpdf-pro/issues" target="_blank" rel="noopener noreferrer">Report bugs and issues</a></li><li><strong>GitHub Discussions</strong>: <a href="https://github.com/ulinycoin/clientpdf-pro/discussions" target="_blank" rel="noopener noreferrer">Ask questions and share feedback</a></li></ul>',
            keywords: ['support', 'help', 'bug', 'issue', 'contact'],
            relatedPages: ['/terms']
          },
          {
            id: 'contribute',
            question: 'Can I contribute to LocalPDF?',
            answer: 'Absolutely! LocalPDF is <strong>open source</strong>. Ways to contribute: <ul><li><strong>Code</strong>: Submit pull requests on <a href="https://github.com/ulinycoin/clientpdf-pro" target="_blank" rel="noopener noreferrer">GitHub</a></li><li><strong>Translations</strong>: Help translate to more languages</li><li><strong>Bug reports</strong>: Report issues you find</li><li><strong>Feature ideas</strong>: Suggest new tools</li><li><strong>Documentation</strong>: Improve guides and docs</li></ul>',
            keywords: ['contribute', 'open source', 'github', 'developer', 'help']
          }
        ]
      }
    },

    // Related links section
    relatedLinks: {
      title: 'Still have questions?',
      subtitle: 'Explore more resources',
      links: {
        privacy: {
          title: 'Privacy Policy',
          description: 'Learn how we protect your data',
          url: '/privacy'
        },
        gdpr: {
          title: 'GDPR Compliance',
          description: 'Our commitment to data protection',
          url: '/gdpr'
        },
        terms: {
          title: 'Terms of Service',
          description: 'Usage guidelines and policies',
          url: '/terms'
        },
        docs: {
          title: 'Documentation',
          description: 'Detailed guides and tutorials',
          url: '/docs'
        }
      }
    },

    // Contact section
    contact: {
      title: 'Contact Information',
      description: 'Need personalized help? Reach out to our team',
      company: 'SIA "Ul-coin"',
      regNumber: 'Reg.Nr. 50203429241',
      email: 'support@localpdf.online',
      emailContact: 'contact@localpdf.online',
      github: 'GitHub Issues',
      website: 'localpdf.online'
    }
  },

  privacy: {
    title: 'Privacy Policy',
    subtitle: 'Your privacy is our top priority. Learn how LocalPDF protects your data.',
    lastUpdated: 'Last updated: August 30, 2025',
    sections: {
      commitment: {
        title: 'Our Privacy Commitment',
        content: 'At LocalPDF, privacy isn\'t just a feature—it\'s the foundation of everything we build. Your files are processed entirely in your browser, ensuring complete privacy and security.'
      },
      simpleAnswer: {
        title: 'The Simple Answer',
        main: 'Your files NEVER leave your device. Everything happens locally in your browser.',
        sub: 'No uploads, no servers, no data collection. Your documents stay private, always.'
      },
      whatWeDont: {
        title: 'What We DON\'T Do',
        noDataCollection: {
          title: 'No Data Collection',
          items: [
            'We don\'t collect personal information',
            'We don\'t track your activity',
            'We don\'t store usage analytics',
            'We don\'t build user profiles',
            'We don\'t use tracking cookies'
          ]
        },
        noFileAccess: {
          title: 'No File Access',
          items: [
            'We never see your files',
            'Files are not uploaded to servers',
            'No temporary storage on our end',
            'Documents never leave your device',
            'Zero access to file contents'
          ]
        }
      },
      howItWorks: {
        title: 'How LocalPDF Actually Works',
        clientSide: {
          title: 'Client-Side Processing',
          description: 'All PDF operations happen directly in your web browser using advanced JavaScript libraries.',
          items: [
            'Files are processed using PDF.js (Mozilla\'s PDF library)',
            'All operations run in your browser\'s memory',
            'No data transmission to external servers',
            'Results are generated locally on your device'
          ]
        },
        process: {
          title: 'Step-by-Step Process',
          steps: [
            'You select files from your device',
            'Files are loaded into browser memory only',
            'JavaScript processes your PDFs locally',
            'Results are generated and available for download',
            'Files are automatically cleared when you leave the page'
          ]
        }
      },
      analytics: {
        title: 'Analytics & Tracking',
        description: 'We use minimal, privacy-respecting analytics to improve our service. Here\'s exactly what we track:',
        whatWeTrack: {
          title: 'What We Track (Anonymous Only)',
          items: [
            'Page views (which tools are popular)',
            'General browser information (for compatibility)',
            'Approximate location (country level only)',
            'No personal identification data',
            'No file processing data'
          ]
        },
        protections: {
          title: 'Privacy Protections',
          items: [
            'All analytics are anonymized',
            'No IP address logging',
            'No cross-site tracking',
            'No third-party advertising networks',
            'You can opt-out using browser settings'
          ]
        }
      },
      compliance: {
        title: 'International Compliance',
        gdpr: {
          title: 'GDPR Compliant',
          description: 'Fully compliant with EU privacy regulations'
        },
        ccpa: {
          title: 'CCPA Compliant',
          description: 'Meets California privacy standards'
        },
        global: {
          title: 'Global Privacy',
          description: 'Adheres to international privacy best practices'
        }
      },
      summary: {
        title: 'The Bottom Line',
        main: 'LocalPDF gives you complete control over your data. We built it this way because we believe privacy is a fundamental right.',
        sub: 'Questions about privacy? We\'re always happy to explain our approach in detail.'
      }
    }
  },

  terms: {
    title: 'Terms of Service',
    subtitle: 'Simple and transparent terms for using LocalPDF tools',
    lastUpdated: 'Last updated: August 30, 2025',
    sections: {
      introduction: {
        title: 'Welcome to LocalPDF',
        content: 'By using LocalPDF, you agree to these terms. We keep them simple and fair because privacy and transparency matter to us.'
      },
      acceptance: {
        title: 'Acceptance of Terms',
        content: 'By accessing and using LocalPDF, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our service.'
      },
      serviceDescription: {
        title: 'Our Service',
        content: 'LocalPDF provides free, browser-based PDF tools that process your documents entirely on your device.',
        features: {
          title: 'What we provide:',
          list: [
            'PDF merging, splitting, and compression',
            'Text and watermark addition',
            'PDF rotation and page extraction',
            'Format conversion tools',
            'Complete client-side processing'
          ]
        }
      },
      usageRules: {
        title: 'Usage Guidelines',
        allowed: {
          title: 'Allowed Uses',
          items: [
            'Personal document processing',
            'Commercial and business use',
            'Educational purposes',
            'Any legal document manipulation'
          ]
        },
        prohibited: {
          title: 'Prohibited Uses',
          items: [
            'Processing illegal content',
            'Attempting to reverse engineer',
            'Overloading our infrastructure',
            'Violating applicable laws'
          ]
        }
      },
      privacy: {
        title: 'Privacy & Your Data',
        localProcessing: 'All your documents are processed locally in your browser - they never leave your device.',
        noDataCollection: 'We don\'t collect, store, or have access to your files or personal data.',
        privacyPolicyLink: 'Read our full Privacy Policy →'
      },
      intellectualProperty: {
        title: 'Intellectual Property',
        openSource: {
          title: 'Open Source',
          content: 'LocalPDF is open source software. You can view, contribute to, and fork our code.',
          githubLink: 'View source code on GitHub →'
        },
        userContent: {
          title: 'Your Content',
          content: 'You retain all rights to your documents. We never claim ownership or access to your files.'
        }
      },
      disclaimers: {
        title: 'Disclaimers',
        asIs: 'LocalPDF is provided "as is" without any warranties or guarantees.',
        noWarranties: 'While we strive for reliability, we cannot guarantee uninterrupted service or error-free operation.',
        limitations: [
          'No warranty of merchantability or fitness',
          'No guarantee of data accuracy or integrity',
          'Service may be temporarily unavailable',
          'Features may change or be discontinued'
        ]
      },
      liability: {
        title: 'Limitation of Liability',
        limitation: 'We are not liable for any damages arising from your use of LocalPDF.',
        maxLiability: 'Our maximum liability is limited to the amount you paid for the service (which is zero, since it\'s free).'
      },
      changes: {
        title: 'Changes to Terms',
        notification: 'We may update these terms occasionally. Significant changes will be communicated through our website.',
        effective: 'Continued use of LocalPDF after changes constitutes acceptance of new terms.'
      },
      contact: {
        title: 'Contact Us',
        description: 'Questions about these terms? We\'re here to help.',
        company: 'SIA "Ul-coin"',
        regNumber: 'Reg.Nr. 50203429241',
        email: 'support@localpdf.online',
        emailContact: 'contact@localpdf.online',
        github: 'Support & Issues',
        website: 'Website'
      }
    }
  },

  howToUse: {
    title: 'How to Use LocalPDF',
    subtitle: 'Complete guide to using LocalPDF\'s powerful PDF tools. Learn how to merge, split, compress, edit, and convert PDFs with complete privacy and security.',
    quickStart: {
      title: 'Quick Start Guide',
      steps: {
        upload: { title: 'Upload Files', description: 'Drag & drop or click to select your PDF files' },
        choose: { title: 'Choose Tool', description: 'Select from 15+ powerful PDF processing tools' },
        configure: { title: 'Configure', description: 'Adjust settings and options as needed' },
        download: { title: 'Download', description: 'Process and download your result instantly' }
      },
      keyBenefits: {
        title: 'Key Benefits',
        description: 'All processing happens in your browser - no uploads, no registration, no tracking. Your files never leave your device, ensuring complete privacy and security.'
      }
    },
    tools: {
      title: 'PDF Tools Guide',
      merge: {
        title: 'Merge PDF Files',
        description: 'Combine multiple PDF files into one document.',
        steps: [
          'Upload multiple PDF files (drag & drop or click to select)',
          'Reorder files by dragging them in the list',
          'Click "Merge PDFs" to combine them',
          'Download your merged PDF file'
        ],
        tip: 'You can merge up to 20 PDF files at once. The final order will match your arrangement in the file list.'
      },
      split: {
        title: 'Split PDF Files',
        description: 'Extract specific pages or split PDFs into separate files.',
        steps: [
          'Upload a single PDF file',
          'Choose split method (by page range, every X pages, or custom ranges)',
          'Specify page numbers or ranges (e.g., "1-5, 8, 10-12")',
          'Click "Split PDF" and download individual files'
        ],
        tip: 'Use preview mode to see page thumbnails before splitting. Supports complex ranges like "1-3, 7, 15-20".'
      },
      compress: {
        title: 'Compress PDF Files',
        description: 'Reduce PDF file size while maintaining quality.',
        steps: [
          'Upload a PDF file',
          'Adjust quality level (10%-100%)',
          'Enable image compression, metadata removal, or web optimization',
          'Click "Compress PDF" and download the smaller file'
        ],
        tip: '80% quality usually provides the best balance between file size and visual quality. Enable image compression for maximum savings.'
      },
      addText: {
        title: 'Add Text to PDFs',
        description: 'Insert custom text, signatures, and annotations.',
        steps: [
          'Upload a PDF file',
          'Click on the PDF preview where you want to add text',
          'Type your text and adjust font, size, and color',
          'Position and resize text boxes as needed',
          'Save your modified PDF'
        ],
        tip: 'Use different colors and fonts for signatures, stamps, or annotations. Text boxes can be moved and resized after creation.'
      },
      additional: {
        title: 'Add Watermarks & More',
        description: 'LocalPDF includes 5 additional powerful tools for comprehensive PDF editing.',
        features: {
          watermarks: 'Add text or image watermarks',
          rotate: 'Fix page orientation',
          extract: 'Create new PDFs from selected pages',
          extractText: 'Get text content from PDFs',
          convert: 'Convert pages to PNG/JPEG'
        },
        tip: 'All tools work the same way: Upload → Configure → Process → Download. Each tool has specific options tailored to its function.'
      }
    },
    tips: {
      title: 'Advanced Tips & Tricks',
      performance: {
        title: 'Performance Tips',
        items: [
          'Close other browser tabs for large files (>50MB)',
          'Use Chrome or Firefox for best performance',
          'Enable hardware acceleration in browser settings',
          'Process very large files in smaller batches'
        ]
      },
      keyboard: {
        title: 'Keyboard Shortcuts',
        items: [
          'Ctrl+O - Open file dialog',
          'Ctrl+S - Save/download result',
          'Ctrl+Z - Undo last action',
          'Tab - Navigate interface elements'
        ]
      },
      mobile: {
        title: 'Mobile Usage',
        items: [
          'All tools work on smartphones and tablets',
          'Use landscape orientation for better UI',
          'Touch and pinch gestures supported',
          'Files can be opened from cloud storage apps'
        ]
      },
      troubleshooting: {
        title: 'Troubleshooting',
        items: [
          'Refresh page if tool becomes unresponsive',
          'Clear browser cache for persistent issues',
          'Ensure JavaScript is enabled',
          'Update browser to latest version'
        ]
      }
    },
    formats: {
      title: 'File Format Support',
      input: {
        title: 'Supported Input',
        items: [
          'PDF files (any version)',
          'Multi-page documents',
          'Text and image PDFs',
          'Forms and annotations',
          'Files up to 100MB'
        ]
      },
      output: {
        title: 'Output Formats',
        items: [
          'PDF (processed documents)',
          'PNG (high quality images)',
          'JPEG (compressed images)',
          'WEBP (modern format)',
          'TXT (extracted text)'
        ]
      },
      limitations: {
        title: 'Limitations',
        items: [
          'Maximum file size: 100MB',
          'Password-protected files not supported',
          'Some complex PDF structures may fail',
          'Scanned PDFs: limited text extraction'
        ]
      }
    },
    privacy: {
      title: 'Privacy & Security Guide',
      whatWeDo: {
        title: 'What LocalPDF Does',
        items: [
          'Processes files entirely in your browser',
          'Uses client-side JavaScript for all operations',
          'Automatically clears files from memory',
          'Works completely offline after first load',
          'Open source and transparent'
        ]
      },
      whatWeNeverDo: {
        title: 'What LocalPDF Never Does',
        items: [
          'Upload files to servers',
          'Store or cache your documents',
          'Track user behavior or collect analytics',
          'Require accounts or registration',
          'Use cookies for tracking'
        ]
      },
      perfectFor: 'Perfect for confidential documents: Since all processing is local, LocalPDF is ideal for sensitive documents, legal files, financial records, or any confidential PDFs.'
    },
    help: {
      title: 'Need Additional Help?',
      documentation: {
        title: 'Documentation',
        description: 'Comprehensive guides and tutorials for all PDF tools',
        link: 'View FAQ'
      },
      community: {
        title: 'Community Support',
        description: 'Get help from the LocalPDF community',
        link: 'Join Discussions'
      },
      issues: {
        title: 'Report Issues',
        description: 'Found a bug or have a suggestion?',
        link: 'Report Issue'
      },
      footer: 'LocalPDF is open source software maintained by the community. Your feedback helps us improve the tools for everyone.'
    }
  },

  notFound: {
    title: 'Page Not Found',
    subtitle: 'The page you are looking for does not exist',
    description: 'The requested page could not be found. Please check the URL and try again, or explore our popular PDF tools below.',
    message: 'The requested page could not be found. Please check the URL and try again.',
    backHome: 'Return to Home',
    backToTools: 'Browse PDF Tools',
    suggestions: {
      title: 'Popular PDF Tools:',
      merge: 'Merge PDFs',
      split: 'Split PDFs',
      compress: 'Compress PDFs',
      convert: 'Convert Images to PDF'
    }
  },

  // Tools section (for FAQ tools section compatibility)
  tools: {}
};
