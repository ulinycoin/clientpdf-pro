/**
 * Compress PDF tool translations for EN language
 * Contains: page metadata, upload zone, compression options, processing messages
 * Complete localization following rotate-pdf methodology
 */

export const compress = {
  // Basic properties for tools grid
  title: 'Compress PDF',
  description: 'Reduce PDF file size without losing quality',
  
  // Page metadata (SEO)
  pageTitle: 'Compress PDF Files for Free - LocalPDF',
  pageDescription: 'Reduce PDF file size without losing quality. Free PDF compression tool with privacy protection. Smart compression algorithms.',
  
  // Upload section (like rotate had)
  upload: {
    title: 'Compress PDF File',
    description: 'Reduce file size while maintaining quality',
    supportedFormats: 'PDF files up to 100MB',
    selectedFile: 'Selected File',
    readyToCompress: 'Ready to compress',
    removeFile: 'Remove file',
    compressPdfFile: 'Compress PDF File 🗜️'
  },
  
  // Upload zone translations (for CompressPDFPage)
  uploadTitle: 'Compress PDF File',
  uploadSubtitle: 'Reduce file size while maintaining quality', 
  supportedFormats: 'PDF files up to 100MB',
  selectedFile: 'Selected File',
  readyToCompress: 'Ready to compress',
  removeFile: 'Remove file',
  compressPdfFile: 'Compress PDF File 🗜️',
  fileSizeUnit: 'MB',

  // Smart AI Recommendations
  smartRecommendations: {
    title: 'Smart AI Recommendations',
    description: 'Get AI-powered optimization suggestions for better compression results'
  },
  
  // Results section (like rotate had)
  results: {
    successTitle: 'PDF Compression Complete!',
    downloadCompressed: 'Download Compressed PDF',
    download: 'Download',
    compressAnother: 'Compress Another PDF',
    sizeReduced: 'Size reduced from',
    to: 'to',
    readyForDownload: 'Your compressed PDF is ready for download'
  },
  
  // Modern tool-specific section (comprehensive like rotate.tool)
  toolTitle: 'PDF Compression Tool',
  noFileTitle: 'No File Selected',
  noFileMessage: 'Please select a PDF file to compress',
  backButton: 'Back',
  closeButton: 'Close',
  currentSize: 'Current size',
  estimatedSavings: 'estimated savings',
  forecastedSaving: 'estimated based on file analysis',
  
  trustIndicators: {
    privateProcessing: 'Private Processing',
    intelligentCompression: 'Intelligent Compression'
  },
  
  qualitySettings: {
    title: 'Quality Settings',
    subtitle: 'Choose the right balance between quality and file size',
    qualityLevel: 'Quality Level',
    smallerSize: 'Smaller Size',
    betterQuality: 'Better Quality',
    qualityLabels: {
      maxCompression: 'Max Compression',
      highCompression: 'High Compression',
      mediumCompression: 'Medium Compression', 
      optimal: 'Optimal',
      highQuality: 'High Quality'
    }
  },
  
  previewCards: {
    maxCompression: {
      title: 'Max Compression',
      subtitle: 'Smallest file size'
    },
    optimal: {
      title: 'Optimal Balance',
      subtitle: 'Best quality/size ratio'
    },
    highQuality: {
      title: 'High Quality',
      subtitle: 'Best visual quality'
    }
  },
  
  advancedSettings: {
    title: 'Advanced Settings',
    subtitle: 'Fine-tune compression options',
    compressImages: {
      title: 'Compress Images',
      description: 'Optimize images for smaller file size'
    },
    removeMetadata: {
      title: 'Remove Metadata',
      description: 'Strip document properties and comments'
    },
    optimizeForWeb: {
      title: 'Optimize for Web',
      description: 'Prepare PDF for fast online viewing'
    }
  },
  
  processing: {
    title: 'Compressing Your PDF',
    startingMessage: 'Starting compression process...',
    defaultMessage: 'Processing your PDF file...',
    progressLabel: 'Progress'
  },
  
  errors: {
    selectFile: 'Please select a PDF file to compress',
    compressionError: 'Failed to compress PDF file',
    unknownError: 'An unexpected error occurred',
    processingError: 'Processing Error'
  },
  
  infoBox: {
    title: 'How It Works',
    description: 'Our smart compression algorithms analyze your PDF and apply optimal settings to reduce file size while preserving visual quality. Your files are processed locally for maximum privacy.'
  },
  
  actions: {
    compress: 'Compress PDF',
    compressing: 'Compressing...',
    cancel: 'Cancel',
    back: 'Back'
  },
  
  // Legacy compatibility keys (for old CompressionTool)
  starting: 'Starting compression process...',
  failed: 'Failed to compress PDF file',
  fileToCompress: 'File to compress',
  smaller: 'smaller',
  estimated: 'estimated',
  settings: {
    title: 'Compression Settings',
    qualityLevel: 'Quality Level',
    smallerFile: 'Smaller File',
    betterQuality: 'Better Quality',
    compressImages: 'Compress Images',
    removeMetadata: 'Remove Metadata',
    optimizeForWeb: 'Optimize for Web'
  },
  howItWorks: 'How It Works',
  howItWorksDescription: 'Smart algorithms reduce file size by optimizing images, fonts, and removing unnecessary data',
  compressing: 'Compressing PDF...',
  
  // Additional results keys used by CompressPDFPage
  successTitle: 'PDF Compression Complete!',
  downloadCompressed: 'Download Compressed PDF',
  download: 'Download',
  compressAnother: 'Compress Another PDF',
  sizeReduced: 'Size reduced from',
  to: 'to',
  readyForDownload: 'Your compressed PDF is ready for download'
};