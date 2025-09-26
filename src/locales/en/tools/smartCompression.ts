/**
 * Smart Compression AI tool translations for EN language
 * Contains: AI recommendations, predictions, analysis messages, and all Smart Compression features
 */

export const smartCompression = {
  // Basic tool properties
  title: 'Smart PDF Compression',
  description: 'AI-powered intelligent PDF compression with optimization recommendations',

  // Page metadata (SEO)
  pageTitle: 'Smart PDF Compression with AI - LocalPDF',
  pageDescription: 'Compress PDFs intelligently with AI-powered recommendations. Get optimal compression settings, size predictions, and quality forecasts.',

  // AI Analysis states
  analysis: {
    analyzing: 'Analyzing Document...',
    analyzingDescription: 'AI is analyzing {count} document(s) to provide smart compression recommendations',
    failed: 'Analysis Failed',
    retry: 'Retry',
    available: 'Smart Analysis Available',
    availableDescription: 'Upload a PDF file to get AI-powered compression recommendations',
    analyzeButton: 'Analyze Document',
    refreshAnalysis: '🔄 Refresh Analysis',
    completed: 'Analysis completed at {time} • Smart Compression v{version}',
    startMessage: 'Smart Compression Analysis started for {count} file(s)',
    completedMessage: 'Smart Compression Analysis completed in {time}ms',
    failedMessage: 'Smart Compression Analysis failed',
    errorPrefix: 'Smart compression analysis failed:'
  },

  // Main recommendations panel
  recommendations: {
    title: 'Smart Compression Recommendations',
    confidence: '{percent}% confidence',
    potential: '{percent}% compression potential',
    hideDetails: 'Hide Details',
    showDetails: 'Show Details',
    strategies: {
      conservative: 'Minimize quality loss with moderate compression',
      balanced: 'Balance between size reduction and quality preservation',
      aggressive: 'Maximum compression with acceptable quality trade-offs'
    },
    reasoning: {
      qualityFirst: 'Quality-first approach recommended to preserve document integrity',
      balanced: 'Balanced approach provides good compression with minimal quality loss',
      sizeFirst: 'Size-first approach maximizes compression for storage efficiency'
    }
  },

  // Prediction metrics
  predictions: {
    sizeReduction: {
      label: 'Size Reduction',
      estimated: 'New size: {size}'
    },
    processingTime: {
      label: 'Processing Time',
      range: '{min}-{max}s range'
    },
    quality: {
      label: 'Quality Forecast',
      impact: '{percent}% quality impact',
      levels: {
        excellent: 'excellent',
        good: 'good',
        acceptable: 'acceptable',
        degraded: 'degraded',
        poor: 'poor'
      },
      risks: {
        imageQuality: 'Image quality may be reduced',
        downsampling: 'Image resolution will be lowered',
        fonts: 'Font rendering may be affected'
      }
    },
    performance: {
      label: 'Performance',
      cpuIntensive: 'CPU intensive: {intensive}',
      memoryUsage: {
        low: 'low memory',
        medium: 'medium memory',
        high: 'high memory'
      }
    }
  },

  // Compression strategy section
  strategy: {
    title: 'Recommended Strategy',
    applyButton: 'Apply Strategy',
    expectedSavings: 'Expected savings: {savings}',
    levels: {
      conservative: 'conservative',
      balanced: 'balanced',
      aggressive: 'aggressive'
    }
  },

  // Compression presets
  presets: {
    title: 'Compression Presets',
    names: {
      'web-optimized': 'Web Optimized',
      'print-quality': 'Print Quality',
      'maximum-compression': 'Maximum Compression'
    },
    descriptions: {
      'web-optimized': 'Fast loading for web viewing',
      'print-quality': 'High quality for printing',
      'maximum-compression': 'Smallest file size'
    },
    qualityImpact: {
      minimal: 'Minimal',
      low: 'Low',
      medium: 'Medium',
      high: 'High'
    }
  },

  // Content analysis details
  contentAnalysis: {
    title: 'Content Analysis',
    text: 'Text Content',
    images: 'Image Content',
    vectors: 'Vector Graphics',
    quality: 'Current Quality',
    complexity: 'Page Complexity',
    currentCompression: 'Current Compression',
    embeddedFonts: 'Embedded Fonts',
    qualityLevels: {
      high: 'high',
      medium: 'medium',
      low: 'low'
    },
    complexityLevels: {
      simple: 'simple',
      moderate: 'moderate',
      complex: 'complex'
    },
    compressionLevels: {
      none: 'none',
      low: 'low',
      medium: 'medium',
      high: 'high'
    }
  },

  // Warning messages
  warnings: {
    qualityLoss: {
      title: 'Potential quality loss detected',
      suggestion: 'Consider using a more conservative compression level to preserve image quality'
    },
    largeFile: {
      title: 'Large file - processing may take longer',
      suggestion: 'Consider breaking into smaller sections or reducing compression level'
    },
    fonts: {
      title: 'Font subsetting will be applied',
      suggestion: 'Embedded fonts will be optimized. Check text rendering after compression'
    },
    metadata: {
      title: 'Document metadata will be removed',
      suggestion: 'Author, title, and other metadata will be stripped to reduce file size'
    },
    impact: {
      low: 'Low Impact',
      medium: 'Medium Impact',
      high: 'High Impact'
    },
    affectedAreas: 'Affected areas',
    autoFix: 'Auto-fix available'
  },

  // Error messages
  errors: {
    analysisError: 'Failed to analyze document for compression',
    unknownError: 'An unknown error occurred',
    invalidFile: 'Invalid or corrupted PDF file',
    fileTooLarge: 'File too large for analysis',
    processingFailed: 'Compression processing failed'
  }
};