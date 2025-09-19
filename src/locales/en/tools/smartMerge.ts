/**
 * Smart Merge AI tool translations for EN language
 * Contains: AI recommendations, predictions, analysis messages, and all Smart Merge features
 */

export const smartMerge = {
  // Basic tool properties
  title: 'Smart PDF Merge',
  description: 'AI-powered intelligent PDF merging with optimization recommendations',

  // Page metadata (SEO)
  pageTitle: 'Smart PDF Merge with AI - LocalPDF',
  pageDescription: 'Merge PDFs intelligently with AI-powered recommendations. Get optimal file order, quality predictions, and smart metadata suggestions.',

  // AI Analysis states
  analysis: {
    analyzing: 'Analyzing Documents...',
    analyzingDescription: 'AI is analyzing {count} documents to provide smart recommendations',
    failed: 'Analysis Failed',
    retry: 'Retry',
    available: 'Smart Analysis Available',
    availableDescription: 'Add 2 or more PDF files to get AI-powered merge recommendations',
    analyzeButton: 'Analyze Documents',
    refreshAnalysis: '🔄 Refresh Analysis',
    completed: 'Analysis completed in {time} • Smart Merge v{version}',
    startMessage: 'Smart Merge Analysis started for {count} files',
    completedMessage: 'Smart Merge Analysis completed in {time}ms',
    failedMessage: 'Smart Merge Analysis failed',
    errorPrefix: 'Smart merge analysis failed:'
  },

  // Main recommendations panel
  recommendations: {
    title: 'Smart Merge Recommendations',
    confidence: '{percent}% confidence',
    documentsAnalyzed: '{count} documents analyzed',
    hideDetails: 'Hide Details',
    showDetails: 'Show Details'
  },

  // Prediction metrics
  predictions: {
    processingTime: {
      label: 'Processing Time',
      estimated: '{time}s',
      range: '{min}-{max}s range'
    },
    resultSize: {
      label: 'Result Size',
      compression: '{percent}% vs input'
    },
    quality: {
      label: 'Quality',
      score: '{score}/100 score',
      levels: {
        excellent: 'excellent',
        good: 'good',
        acceptable: 'acceptable',
        poor: 'poor'
      }
    },
    performance: {
      label: 'Performance',
      browserLoad: '{percent}% browser load',
      memoryUsage: {
        low: 'low',
        medium: 'medium',
        high: 'high'
      }
    }
  },

  // Suggested order section
  order: {
    title: 'Recommended Order',
    reasoning: 'Order optimized based on document content and relationships',
    applyButton: 'Apply Suggested Order',
    navigationScore: 'Navigation Score: {score}/100',
    algorithms: {
      'content-based': 'content-based',
      'chronological': 'chronological',
      'alphabetical': 'alphabetical',
      'size-based': 'size-based'
    },
    reasoningTexts: {
      contentBased: 'Order optimized based on document content and relationships',
      chronological: 'Documents arranged in chronological order by creation date',
      alphabetical: 'Documents arranged alphabetically by filename',
      sizeBased: 'Documents arranged by file size for optimal processing'
    }
  },

  // Warning messages
  warnings: {
    sizeMismatch: {
      title: 'Documents have different page sizes',
      suggestion: 'Consider using size normalization or check if documents are compatible'
    },
    orientationMismatch: {
      title: 'Documents have different orientations (portrait/landscape)',
      suggestion: 'Mixed orientations may affect readability in the merged document'
    },
    qualityVariance: {
      title: 'Significant quality differences between documents',
      suggestion: 'Consider improving quality of low-quality documents before merging'
    },
    largeFile: {
      title: 'Large merged file size expected',
      suggestion: 'Consider compressing documents or processing in smaller batches'
    },
    autoFix: 'Auto-fix this issue'
  },

  // Metadata section
  metadata: {
    title: 'Smart Metadata',
    confidence: '{percent}% confidence',
    applyButton: 'Apply Metadata',
    fields: {
      title: 'Title',
      subject: 'Subject',
      keywords: 'Keywords',
      author: 'Author'
    },
    generated: {
      defaultTitle: 'Merged Document',
      completeDocument: '{name} - Complete Document',
      mergedCollection: '{name} - Merged Collection',
      subjectCollection: 'Collection of {types} documents',
      subjectDefault: 'Merged PDF document collection',
      authorDefault: 'LocalPDF Smart Merge',
      reasoningRelated: 'Generated based on {count} documents with related content',
      reasoningMixed: 'Generated based on {count} documents with mixed content',
      keywordMerged: 'merged',
      keywordCollection: 'collection',
      keywordMultiDocument: 'multi-document',
      keywordDocument: 'document'
    }
  },

  // Advanced settings
  settings: {
    title: 'Optimized Settings',
    applyButton: 'Apply Optimized Settings',
    fields: {
      bookmarks: 'Bookmarks:',
      quality: 'Quality:',
      pageNumbers: 'Page Numbers:',
      annotations: 'Annotations:'
    },
    values: {
      preserve: 'Preserve',
      remove: 'Remove',
      continuous: 'continuous',
      separate: 'separate',
      merge: 'merge',
      qualityBalance: 'balance',
      qualityPreserveBest: 'preserve best'
    }
  },

  // Document analysis results
  documentAnalysis: {
    analyzing: 'Analyzing document {current}/{total}: {name}',
    analyzingFailed: 'Failed to analyze {name}',
    fallbackCreated: 'Created fallback analysis for {name}',
    orientation: {
      portrait: 'portrait',
      landscape: 'landscape',
      mixed: 'mixed'
    },
    quality: {
      high: 'high',
      medium: 'medium',
      low: 'low'
    },
    type: {
      text: 'text',
      scanned: 'scanned',
      mixed: 'mixed',
      presentation: 'presentation'
    },
    compression: {
      none: 'none',
      low: 'low',
      medium: 'medium',
      high: 'high'
    },
    textDensity: {
      low: 'low',
      medium: 'medium',
      high: 'high'
    }
  },

  // Compatibility analysis
  compatibility: {
    pageSizeConsistency: {
      uniform: 'uniform',
      similar: 'similar',
      mixed: 'mixed'
    },
    qualityVariance: {
      low: 'low',
      medium: 'medium',
      high: 'high'
    },
    formatConsistency: {
      identical: 'identical',
      compatible: 'compatible',
      problematic: 'problematic'
    }
  },

  // Content analysis
  contentAnalysis: {
    documentTypes: {
      contract: 'contract',
      invoice: 'invoice',
      report: 'report',
      presentation: 'presentation',
      manual: 'manual',
      form: 'form'
    },
    relatedDocuments: 'Related documents detected',
    duplicateContent: 'Potential duplicate content found'
  },

  // Performance predictions
  performancePredictions: {
    processingStrategy: {
      parallel: 'parallel',
      sequential: 'sequential',
      hybrid: 'hybrid'
    },
    recommendations: {
      batchSize: 'Recommended batch size: {size} files',
      sequentialProcessing: 'Sequential processing recommended for large files',
      hybridProcessing: 'Hybrid processing recommended',
      parallelProcessing: 'Parallel processing suitable'
    }
  },

  // Error messages
  errors: {
    analysisError: 'Error during smart merge analysis',
    noFiles: 'No files provided for analysis',
    insufficientFiles: 'At least 2 files required for smart merge analysis',
    processingFailed: 'Smart merge processing failed',
    unknownError: 'An unknown error occurred during analysis',
    timeoutError: 'Analysis timed out - try with fewer files'
  },

  // Success messages
  success: {
    analysisComplete: 'Smart merge analysis completed successfully',
    recommendationsApplied: 'Recommendations applied successfully',
    orderApplied: 'Suggested order applied',
    metadataApplied: 'Smart metadata applied',
    settingsApplied: 'Optimized settings applied'
  },

  // Progress indicators
  progress: {
    analyzing: 'Analyzing...',
    generatingRecommendations: 'Generating recommendations...',
    calculatingPredictions: 'Calculating predictions...',
    optimizingSettings: 'Optimizing settings...',
    preparingResults: 'Preparing results...'
  },

  // File size formatting
  fileSize: {
    bytes: 'B',
    kilobytes: 'KB',
    megabytes: 'MB',
    gigabytes: 'GB'
  },

  // Trust indicators
  trustIndicators: {
    aiPowered: 'AI-Powered Analysis',
    privacyFirst: 'Privacy-First Processing',
    accuratePredictions: 'Accurate Predictions',
    optimizedResults: 'Optimized Results'
  }
};