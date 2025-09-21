/**
 * Documentation translations for EN language
 * Contains: navigation, sections, meta data, and content translations
 */

export const docs = {
  // Page meta and navigation
  title: 'Documentation',
  description: 'Complete documentation for LocalPDF - Privacy-first PDF tools with multilingual support and AI optimization',

  meta: {
    title: 'LocalPDF Documentation - {section}',
    description: 'Complete documentation for LocalPDF - Privacy-first PDF tools, architecture, libraries, and AI optimization guide',
    keywords: 'LocalPDF, documentation, PDF tools, React, TypeScript, privacy-first, AI optimization, multilingual'
  },

  // Navigation
  navigation: {
    title: 'Documentation',
    quickLinks: 'Quick Links',
    github: 'GitHub Repository',
    website: 'Main Website'
  },

  // Section names
  sections: {
    overview: 'Overview',
    tools: 'PDF Tools',
    libraries: 'Libraries',
    architecture: 'Architecture',
    aiOptimization: 'AI Optimization',
    multilingual: 'Multilingual'
  },

  // Overview section
  overview: {
    title: 'Project Overview',
    stats: {
      tools: 'PDF Tools',
      languages: 'Languages',
      aiTraffic: 'AI Traffic'
    }
  },

  // Tools section
  tools: {
    title: 'PDF Tools',
    description: 'LocalPDF offers 16 comprehensive PDF processing tools, all working client-side for complete privacy.',
    multilingual: 'Multilingual',
    techStack: 'Tech Stack',
    implementation: 'Implementation',
    tryTool: 'Try Tool',
    viewSource: 'View Source'
  },

  // Libraries section
  libraries: {
    title: 'Core Libraries',
    description: 'LocalPDF is built on top of proven, open-source libraries for reliable PDF processing.',
    purpose: 'Purpose',
    features: 'Features',
    files: 'Implementation Files'
  },

  // Architecture section
  architecture: {
    title: 'System Architecture',
    description: 'LocalPDF follows a modern, privacy-first architecture with client-side processing and zero server uploads.',

    layers: {
      presentation: 'Presentation Layer',
      presentationDesc: 'React components with glassmorphism design',
      business: 'Business Logic',
      businessDesc: 'PDF processing and AI features',
      data: 'Data Layer',
      dataDesc: 'Local browser storage, no server uploads'
    },

    components: {
      title: 'Component Structure'
    },

    performance: {
      title: 'Performance Metrics',
      buildSystem: 'Build System',
      loadTime: 'Load Time',
      privacy: 'Privacy Level'
    },

    techStack: {
      title: 'Technology Stack'
    },

    dataFlow: {
      title: 'Data Flow',
      upload: 'File Upload',
      uploadDesc: 'Drag & drop files to browser',
      process: 'Processing',
      processDesc: 'Client-side PDF manipulation',
      manipulate: 'Manipulation',
      manipulateDesc: 'Apply operations (merge, split, etc.)',
      download: 'Download',
      downloadDesc: 'Download processed files'
    },

    privacy: {
      title: 'Privacy Architecture',
      description: 'LocalPDF processes everything in your browser - no files are ever uploaded to servers.',
      noUpload: 'No server uploads',
      localProcessing: '100% local processing',
      gdprCompliant: 'GDPR compliant'
    }
  },

  // AI Optimization section
  aiOptimization: {
    title: 'AI Optimization',
    description: 'LocalPDF is optimized for the AI-first search era with 68.99% of traffic coming from AI crawlers like ChatGPT.',

    stats: {
      indexedPages: 'Indexed Pages',
      successRate: 'Success Rate',
      aiDominant: 'AI Traffic Dominant'
    },

    crawlerStats: {
      title: 'Crawler Traffic Distribution'
    },

    features: {
      title: 'AI-Friendly Features'
    },

    approach: {
      title: 'AI-First Approach',
      description: 'Our documentation and content structure is specifically optimized for AI understanding and indexing.',
      tip: 'All content includes structured data for better AI comprehension'
    }
  },

  // Multilingual section
  multilingual: {
    title: 'Multilingual Support',
    description: 'LocalPDF supports 5 languages with complete translations for all tools and interfaces.',
    toolsTranslated: 'tools translated',
    viewExample: 'View Example'
  },

  // Error states
  notFound: {
    title: 'Section Not Found',
    description: 'The requested documentation section could not be found.'
  }
};