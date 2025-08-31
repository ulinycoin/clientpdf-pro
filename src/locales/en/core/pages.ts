/**
 * Static pages translations for EN language
 * Contains: FAQ, privacy policy, terms, other static pages
 */

export const pages = {
  faq: {
    title: 'Frequently Asked Questions',
    subtitle: 'Find answers to common questions about LocalPDF',
    sections: {
      general: {
        title: 'General Questions',
        questions: {
          whatIs: {
            question: 'What is LocalPDF?',
            answer: 'LocalPDF is a collection of privacy-first PDF tools that work entirely in your browser. No uploads, no tracking, complete privacy.'
          },
          free: {
            question: 'Is LocalPDF really free?',
            answer: 'Yes! All tools are completely free to use with no registration required. No hidden costs, no premium tiers.'
          },
          account: {
            question: 'Do I need to create an account?',
            answer: 'No account required! Simply visit the website and start using any tool immediately.'
          }
        }
      },
      privacy: {
        title: 'Privacy & Security',
        questions: {
          uploaded: {
            question: 'Are my files uploaded to your servers?',
            answer: 'No! All processing happens locally in your browser. Your files never leave your device.'
          },
          afterUse: {
            question: 'What happens to my files after I use the tools?',
            answer: 'Nothing! Since files are processed locally, they remain on your device only. We never see or store your files.'
          },
          confidential: {
            question: 'Can I use this for confidential documents?',
            answer: 'Absolutely! Since everything happens locally, your confidential documents remain completely private.'
          }
        }
      },
      technical: {
        title: 'Technical Questions',
        questions: {
          browsers: {
            question: 'Which browsers are supported?',
            answer: 'LocalPDF works on all modern browsers:',
            browsers: [
              'Google Chrome (recommended)',
              'Mozilla Firefox',
              'Apple Safari',
              'Microsoft Edge',
              'Opera'
            ]
          },
          offline: {
            question: 'Can I use LocalPDF offline?',
            answer: 'Yes! After the initial page load, you can process files even without an internet connection.'
          },
          fileSize: {
            question: 'Are there file size limits?',
            answer: 'The only limits are based on your device\'s memory and processing power. There are no artificial limits imposed by us.'
          }
        }
      },
      tools: {
        title: 'PDF Tools',
        editText: {
          question: 'Can I edit text in existing PDFs?',
          answer: 'LocalPDF focuses on document manipulation rather than content editing. You can add text, watermarks, merge, split, and rotate PDFs, but editing existing text requires specialized PDF editing software.'
        }
      },
      support: {
        title: 'Support & Contact',
        gettingSupport: {
          title: 'How to get support',
          items: [
            'Check our FAQ section for common questions',
            'Report bugs and issues on our GitHub page',
            'Contact us via email for technical support',
            'Follow us on social media for updates'
          ]
        },
        contact: {
          title: 'Contact Information',
          github: '🐛 Report Issues on GitHub',
          discussions: '💬 Join GitHub Discussions'
        }
      }
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
        github: 'Support & Issues',
        website: 'Website'
      }
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