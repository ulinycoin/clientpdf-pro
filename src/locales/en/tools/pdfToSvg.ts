/**
 * PDF to SVG tool translations for EN language
 * Contains: page metadata, upload zone, tool interface, conversion options, progress, results
 * Complete localization following established methodology
 */

export const pdfToSvg = {
  // Basic properties for tools grid
  title: 'PDF to SVG',
  description: 'Convert PDF pages to scalable vector graphics (SVG)',
  
  // Page metadata (SEO)
  pageTitle: 'Convert PDF to SVG for Free - LocalPDF',
  pageDescription: 'Convert PDF pages to SVG vectors. High-quality PDF to SVG conversion with scalable graphics.',
  
  // Upload zone (for PDFToSvgPage)
  uploadTitle: 'Upload PDF file to convert to SVG',
  uploadSubtitle: 'Transform PDF pages into scalable vector graphics',
  supportedFormats: 'PDF files',
  selectedFile: 'Selected file ({count})',
  readyToConvert: 'Ready to convert to SVG',
  removeFile: 'Remove file',
  fileSizeUnit: 'MB',
  
  // Results section
  results: {
    successTitle: 'PDF successfully converted to SVG!',
    successDescription: 'All PDF pages converted to scalable vector graphics',
    convertAnotherFile: 'Convert another file',
    conversionComplete: 'SVG conversion completed successfully!',
    processingTitle: 'SVG conversion in progress',
    processingMessage: 'Processing page {current} of {total}',
    pagesConverted: 'Pages converted',
    format: 'Format',
    totalSize: 'Total size',
    processingTime: 'Processing time',
    preview: 'Preview',
    downloadSvgs: 'Download SVG Files',
    downloadAll: 'Download all SVG files ({count})',
    downloadIndividual: 'Download individual SVG files',
    pageLabel: 'Page {number}',
    seconds: 's'
  },
  
  // Tool interface (for PdfToSvgTool)
  tool: {
    title: 'PDF to SVG Converter',
    description: 'Convert PDF pages to scalable vector graphics',
    noFileSelected: 'No PDF file selected',
    noFileDescription: 'Please select a PDF file to convert to SVG',
    selectFile: 'Select PDF file',
    conversionSettingsTitle: 'Conversion Settings',
    
    // Quality settings
    qualityTitle: 'Quality & Resolution',
    qualityDescription: 'Higher quality produces better vectors but larger files',
    qualities: {
      low: 'Basic quality, smaller files',
      medium: 'Balanced quality and size',
      high: 'High quality, detailed vectors',
      maximum: 'Maximum quality, largest files'
    },
    
    // Conversion method
    methodTitle: 'Conversion Method',
    methodDescription: 'Choose between fast canvas or vector extraction',
    methods: {
      canvas: 'Canvas-based conversion - fast but rasterized content',
      vector: 'Vector extraction - slower but true scalable vectors (future feature)'
    },
    
    // Advanced options
    advancedTitle: 'Advanced Options',
    includeText: 'Include Text Elements',
    includeTextDesc: 'Preserve text as selectable elements',
    includeImages: 'Include Images',
    includeImagesDesc: 'Embed images in SVG output',
    
    // Page selection
    pageSelectionTitle: 'Pages to Convert',
    pageSelection: {
      all: 'All pages',
      range: 'Page range',
      specific: 'Specific pages'
    },
    pageRangeFrom: 'From page',
    pageRangeTo: 'To page',
    specificPagesPlaceholder: 'e.g., 1,3,5-10',
    specificPagesHelp: 'Enter page numbers separated by commas',
    
    // Background color
    backgroundTitle: 'Background Color',
    backgroundDescription: 'Background color for transparent areas',
    
    // Progress and actions
    startConversion: 'Convert to SVG 📐',
    converting: 'Converting...',
    cancel: 'Cancel',
    close: 'Close',
    backToUpload: 'Back to Upload',
    supportInfo: 'Files up to 100MB supported • SVG format • Scalable vectors'
  },
  
  // Processing messages
  progress: {
    analyzing: 'Analyzing PDF file...',
    converting: 'Converting pages to SVG...',
    page: 'Page {current} of {total}',
    finalizing: 'Finalizing SVG conversion...',
    complete: 'SVG conversion complete!'
  },
  
  // Legacy compatibility
  buttons: {
    startConverting: 'Convert to SVG 📐',
    processing: 'Converting to SVG...',
    downloadZip: 'Download SVG Files (ZIP)'
  },
  
  messages: {
    processing: 'Converting PDF pages to SVG...',
    success: 'SVG conversion completed successfully!',
    error: 'Failed to convert PDF to SVG'
  },
  
  // Error handling
  errors: {
    invalidFile: 'Invalid PDF file format',
    fileTooLarge: 'File size exceeds 100MB limit',
    conversionFailed: 'Failed to convert PDF to SVG',
    noPages: 'No pages found in PDF',
    invalidPageRange: 'Invalid page range specified',
    invalidOptions: 'Invalid conversion options',
    processingError: 'Error during SVG processing'
  }
};