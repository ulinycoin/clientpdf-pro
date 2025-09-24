/**
 * Authority pages translations for EN language
 * Contains: PDF Hub, Guides, Workflows, Comparison, Security pages
 */

export const authority = {
  // PDF Hub Page
  pdfHub: {
    title: 'PDF Hub - Complete PDF Resource Center',
    subtitle: 'Your comprehensive guide to PDF processing, tools, and workflows',
    description: 'Discover professional PDF workflows, security guides, and tool comparisons in our comprehensive resource center.',

    hero: {
      title: 'PDF Processing Hub',
      description: 'Master PDF workflows with our comprehensive guides, security resources, and tool comparisons.',
      stats: {
        tools: 'PDF Tools',
        guides: 'Step-by-Step Guides',
        workflows: 'Professional Workflows',
        industries: 'Industry Solutions'
      }
    },

    sections: {
      guides: {
        title: 'Comprehensive Guides',
        description: 'Step-by-step tutorials for mastering PDF operations',
        cta: 'Explore Guides'
      },
      workflows: {
        title: 'Professional Workflows',
        description: 'Industry-specific PDF processing workflows',
        cta: 'View Workflows'
      },
      comparison: {
        title: 'Tool Comparisons',
        description: 'Choose the right tool for your specific needs',
        cta: 'Compare Tools'
      },
      security: {
        title: 'Security & Privacy',
        description: 'GDPR, HIPAA, and enterprise-grade security guides',
        cta: 'Security Center'
      }
    },

    industries: {
      title: 'Industry Solutions',
      legal: {
        title: 'Legal',
        description: 'Document preparation, compliance, confidentiality'
      },
      healthcare: {
        title: 'Healthcare',
        description: 'HIPAA-compliant medical record processing'
      },
      education: {
        title: 'Education',
        description: 'Educational materials and curriculum development'
      },
      business: {
        title: 'Business',
        description: 'Professional reports and corporate workflows'
      }
    }
  },

  // Guides Page
  guides: {
    title: 'PDF Processing Guides - Step-by-Step Tutorials',
    subtitle: 'Master PDF operations with our comprehensive, beginner-friendly guides',
    description: 'Learn professional PDF processing with detailed, step-by-step guides covering everything from basic operations to advanced workflows.',

    filters: {
      category: 'Category',
      difficulty: 'Difficulty',
      all: 'All',
      allCategories: 'All Categories',
      allLevels: 'All Levels'
    },

    categories: {
      basics: 'PDF Basics',
      advanced: 'Advanced Operations',
      workflows: 'Complete Workflows',
      security: 'Security & Privacy',
      conversion: 'Format Conversion',
      optimization: 'File Optimization'
    },

    difficulties: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced'
    },

    search: 'Search guides...',

    noResults: {
      title: 'No guides found',
      description: 'Try adjusting your filters or search terms.'
    },

    guide: {
      estimatedTime: 'Estimated Time',
      toolsUsed: 'Tools Used',
      steps: 'Guide Steps',
      startGuide: 'Start Guide'
    },

    faq: {
      title: 'Guide Questions',
      howToFollow: {
        question: 'How do I follow a guide step by step?',
        answer: 'Each guide provides detailed steps with links to the specific tools needed. Click "Start Guide" to begin, then follow each step in order for the best results.'
      },
      customize: {
        question: 'Can I customize these guides for my specific needs?',
        answer: 'Absolutely! These guides are templates that you can adapt. Skip steps that don\'t apply to your situation or add additional tools as needed.'
      },
      industry: {
        question: 'Are these guides industry-specific?',
        answer: 'Yes, we\'ve designed guides for different industries including legal, healthcare, business, and education. Each includes industry-specific considerations and best practices.'
      },
      time: {
        question: 'How long do these guides typically take?',
        answer: 'Most guides take 5-20 minutes depending on complexity and the number of documents. Time estimates are provided for each guide to help you plan.'
      }
    }
  },

  // Workflows Page
  workflows: {
    title: 'PDF Workflows - Professional Process Guides',
    subtitle: 'Complete step-by-step workflows for professional PDF document processing',
    description: 'Industry-specific PDF workflows designed for legal, business, healthcare, and educational document processing needs.',

    features: {
      industrySpecific: 'Industry-Specific Guides',
      stepByStep: 'Step-by-Step Process',
      toolIntegration: 'Tool Integration'
    },

    filters: {
      category: 'Category',
      difficulty: 'Difficulty'
    },

    categories: {
      legal: 'Legal',
      business: 'Business',
      healthcare: 'Healthcare',
      education: 'Education'
    },

    workflow: {
      timeEstimate: 'Time Estimate',
      difficulty: 'Difficulty',
      steps: 'Workflow Steps',
      toolsUsed: 'Tools Used',
      startWorkflow: 'Start Workflow',
      useTool: 'Use'
    },

    faq: {
      title: 'Workflow Questions',
      follow: {
        question: 'How do I follow a workflow step by step?',
        answer: 'Each workflow provides detailed steps with links to the specific tools needed. Click "Start Workflow" to begin, then follow each step in order for the best results.'
      },
      customize: {
        question: 'Can I customize these workflows for my specific needs?',
        answer: 'Absolutely! These workflows are templates that you can adapt. Skip steps that don\'t apply to your situation or add additional tools as needed.'
      },
      industry: {
        question: 'Are these workflows industry-specific?',
        answer: 'Yes, we\'ve designed workflows for different industries including legal, healthcare, business, and education. Each includes industry-specific considerations and compliance requirements.'
      },
      time: {
        question: 'How long do these workflows typically take?',
        answer: 'Most workflows take 10-25 minutes depending on complexity and the number of documents. Time estimates are provided for each workflow to help you plan.'
      }
    },

    data: {
      'legal-document-preparation': {
        title: 'Legal Document Preparation',
        description: 'Complete workflow for preparing legal documents with proper security and compliance.',
        steps: [
          {
            title: 'Merge related documents',
            description: 'Combine all related legal documents into a single PDF',
            action: 'Upload and merge all relevant documents'
          },
          {
            title: 'Add legal watermark',
            description: 'Apply confidential or draft watermarks',
            action: 'Add appropriate legal watermarks'
          },
          {
            title: 'Password protect',
            description: 'Secure the document with encryption',
            action: 'Set password and encryption level'
          }
        ]
      },
      'business-report-compilation': {
        title: 'Business Report Compilation',
        description: 'Standard workflow for creating professional business reports from multiple sources.',
        steps: [
          {
            title: 'Convert source documents',
            description: 'Convert Word documents and Excel sheets to PDF',
            action: 'Convert all source files to PDF format'
          },
          {
            title: 'Merge into single report',
            description: 'Combine all PDFs in the correct order',
            action: 'Arrange and merge all sections'
          },
          {
            title: 'Optimize file size',
            description: 'Compress for easy sharing and storage',
            action: 'Reduce file size while maintaining quality'
          }
        ]
      },
      'medical-record-processing': {
        title: 'Medical Record Processing',
        description: 'HIPAA-compliant workflow for processing medical documents.',
        steps: [
          {
            title: 'Extract text from scanned documents',
            description: 'Use OCR to digitize handwritten or scanned records',
            action: 'Process scanned medical documents'
          },
          {
            title: 'Combine patient records',
            description: 'Merge all documents for complete patient file',
            action: 'Create comprehensive patient record'
          },
          {
            title: 'Apply HIPAA-compliant security',
            description: 'Encrypt and protect sensitive medical data',
            action: 'Set strong encryption and access controls'
          }
        ]
      },
      'educational-material-preparation': {
        title: 'Educational Material Preparation',
        description: 'Workflow for creating and organizing educational content.',
        steps: [
          {
            title: 'Convert images to PDFs',
            description: 'Transform charts, diagrams, and handouts to PDF',
            action: 'Convert all visual materials'
          },
          {
            title: 'Add annotations and text',
            description: 'Include instructions and explanations',
            action: 'Add educational annotations'
          },
          {
            title: 'Combine into curriculum',
            description: 'Merge all materials in teaching order',
            action: 'Create complete educational package'
          }
        ]
      }
    }
  },

  // Comparison Page
  comparison: {
    title: 'PDF Tools Comparison - Choose the Right Tool',
    subtitle: 'Compare PDF tools and features to find the perfect solution for your needs',
    description: 'Side-by-side comparison of PDF tools, features, and use cases to help you choose the best solution for your document processing needs.',

    features: {
      featureComparison: 'Feature Comparison',
      useCaseMatching: 'Use Case Matching',
      decisionGuide: 'Decision Guide'
    },

    categories: {
      organization: 'Document Organization Tools',
      security: 'PDF Security Solutions',
      optimization: 'File Optimization Tools',
      conversion: 'Conversion & Processing'
    },

    tool: {
      processingTime: 'Processing Time',
      outputQuality: 'Output Quality',
      privacyLevel: 'Privacy Level',
      keyFeatures: 'Key Features',
      bestFor: 'Best For',
      tryTool: 'Try'
    },

    qualities: {
      high: 'High',
      medium: 'Medium',
      standard: 'Standard',
      maximum: 'Maximum'
    },

    decisionHelper: {
      title: 'Not Sure Which Tool to Choose?',
      defineGoal: {
        title: 'Define Your Goal',
        description: 'What do you want to accomplish with your PDF?'
      },
      checkComplexity: {
        title: 'Check Complexity',
        description: 'How technical are you comfortable getting?'
      },
      considerWorkflow: {
        title: 'Consider Workflow',
        description: 'Will you need multiple tools working together?'
      }
    },

    faq: {
      title: 'Tool Comparison Questions',
      combining: {
        question: 'Which tool should I use for combining multiple documents?',
        answer: 'Use Merge PDF for combining multiple PDF files into one document. It\'s beginner-friendly and handles unlimited files with drag-and-drop ordering.'
      },
      difference: {
        question: 'What\'s the difference between Protect PDF and Watermark PDF?',
        answer: 'Protect PDF adds password encryption and permission controls, while Watermark PDF adds visible text or image marks. Use Protect PDF for security, Watermark PDF for branding or copyright.'
      },
      choose: {
        question: 'How do I choose between different PDF tools for my project?',
        answer: 'Consider your use case, technical difficulty level, and required features. Check the comparison tables above to see which tool best matches your specific needs.'
      },
      security: {
        question: 'Are all tools equally secure and private?',
        answer: 'Yes, all LocalPDF tools process files entirely in your browser with maximum privacy. No files are uploaded to servers, ensuring complete data protection.'
      }
    }
  },

  // Security Page
  security: {
    title: 'PDF Security & Privacy Center',
    subtitle: 'Enterprise-grade security for your PDF documents',
    description: 'Comprehensive security solutions, compliance frameworks, and privacy protection for professional PDF processing.',

    features: {
      privacyFirst: 'Privacy-First Design',
      complianceReady: 'Compliance Ready',
      zeroTrust: 'Zero Trust Architecture'
    },

    tabs: {
      overview: 'Security Overview',
      compliance: 'Compliance',
      tools: 'Security Tools',
      bestPractices: 'Best Practices'
    },

    overview: {
      title: 'LocalPDF Security Architecture',
      clientSide: {
        title: 'Client-Side Processing',
        description: 'All PDF operations happen entirely in your browser - no file uploads, no server processing.'
      },
      zeroKnowledge: {
        title: 'Zero-Knowledge Design',
        description: 'We never see, store, or have access to your documents at any point in the process.'
      },
      privacy: {
        title: 'Maximum Privacy',
        description: 'Your files never leave your device, ensuring complete privacy and security.'
      }
    },

    compliance: {
      title: 'Compliance Frameworks',
      gdpr: {
        title: 'GDPR Compliant',
        description: 'Fully compliant with EU data protection regulations',
        features: ['No data collection', 'No cookies tracking', 'User control', 'Privacy by design']
      },
      hipaa: {
        title: 'HIPAA Ready',
        description: 'Suitable for healthcare document processing',
        features: ['Local processing', 'No PHI exposure', 'Audit trail ready', 'Administrative safeguards']
      },
      sox: {
        title: 'SOX Compatible',
        description: 'Meets financial document security requirements',
        features: ['Document integrity', 'Access controls', 'Audit capabilities', 'Secure processing']
      },
      iso27001: {
        title: 'ISO 27001 Aligned',
        description: 'Follows international security standards',
        features: ['Information security', 'Risk management', 'Continuous improvement', 'Best practices']
      }
    },

    tools: {
      title: 'Security Tools',
      protect: {
        title: 'PDF Protection',
        description: 'Add password encryption and access controls',
        features: ['AES encryption', 'Permission controls', 'Password protection', 'Print restrictions']
      },
      watermark: {
        title: 'Document Watermarking',
        description: 'Add visible security marks to your PDFs',
        features: ['Custom watermarks', 'Text/image marks', 'Transparency control', 'Batch processing']
      },
      redaction: {
        title: 'Content Redaction',
        description: 'Remove sensitive information permanently',
        features: ['Permanent removal', 'Text selection', 'Area redaction', 'Metadata cleaning']
      }
    },

    bestPractices: {
      title: 'Security Best Practices',
      practices: [
        {
          title: 'Use Strong Passwords',
          description: 'When protecting PDFs, use complex passwords with mixed characters'
        },
        {
          title: 'Regular Security Audits',
          description: 'Periodically review document access and sharing permissions'
        },
        {
          title: 'Minimize Data Exposure',
          description: 'Only include necessary information in shared documents'
        },
        {
          title: 'Secure Sharing',
          description: 'Use encrypted channels when sharing sensitive documents'
        }
      ]
    },

    faq: {
      title: 'Security Questions',
      howSecure: {
        question: 'How secure is LocalPDF for confidential documents?',
        answer: 'LocalPDF processes all files locally in your browser - they never leave your device. This makes it ideal for confidential documents as there\'s no risk of data exposure through uploads or cloud processing.'
      },
      compliance: {
        question: 'Is LocalPDF suitable for regulated industries?',
        answer: 'Yes! LocalPDF\'s client-side processing aligns with compliance requirements for GDPR, HIPAA, SOX, and other regulations. Since no data is transmitted or stored, many compliance concerns are eliminated.'
      },
      enterprise: {
        question: 'Can enterprises use LocalPDF for sensitive documents?',
        answer: 'Absolutely. Many enterprises use LocalPDF specifically because of its privacy-first architecture. All processing happens locally, making it suitable for highly sensitive corporate documents.'
      },
      audit: {
        question: 'Does LocalPDF provide audit trails?',
        answer: 'While LocalPDF doesn\'t log user activities (for privacy), the client-side processing can be audited through browser developer tools if needed for compliance documentation.'
      }
    }
  },

  // Common elements
  common: {
    backToHub: 'Back to PDF Hub',
    exploreMore: 'Explore More',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    readMore: 'Read More',
    viewAll: 'View All',
    comingSoon: 'Coming Soon'
  }
};