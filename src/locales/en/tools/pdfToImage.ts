/**
 * PDF to Image tool translations for EN language
 * Contains: page metadata, upload zone, tool interface, format options, progress, results
 * Complete localization following established methodology
 */

export const pdfToImage = {
  // Basic properties for tools grid
  title: 'PDF to Images',
  description: 'Convert PDF pages to image files (PNG, JPEG)',
  
  // Page metadata (SEO)
  pageTitle: 'Convert PDF to Images for Free - LocalPDF',
  pageDescription: 'Convert PDF pages to PNG or JPEG images. High-quality PDF to image conversion.',
  
  // Upload zone (for PDFToImagePage)
  uploadTitle: 'Upload PDF file to convert to images',
  uploadSubtitle: 'Transform PDF pages into high-quality JPG, PNG or WebP images',
  supportedFormats: 'PDF files',
  selectedFile: 'Selected file ({count})',
  readyToConvert: 'Ready to convert to images',
  removeFile: 'Remove file',
  fileSizeUnit: 'MB',
  
  // Results section
  results: {
    successTitle: 'PDF successfully converted to images!',
    successDescription: 'All PDF pages converted to images',
    convertAnotherFile: 'Convert another file',
    conversionComplete: 'Conversion completed successfully!',
    processingTitle: 'Conversion in progress',
    processingMessage: 'Processing page {current} of {total}',
    pagesConverted: 'Pages converted',
    format: 'Format',
    totalSize: 'Total size',
    processingTime: 'Processing time',
    preview: 'Preview',
    downloadImages: 'Download Images',
    downloadAll: 'Download all images ({count})',
    downloadIndividual: 'Download individual images',
    pageLabel: 'Page {number}',
    seconds: 's'
  },
  
  // Tool interface (for PdfToImageTool)
  tool: {
    title: 'PDF to Images Converter',
    description: 'Convert PDF pages to high-quality image files',
    noFileSelected: 'No PDF file selected',
    noFileDescription: 'Please select a PDF file to convert to images',
    selectFile: 'Select PDF file',
    conversionSettingsTitle: 'Conversion Settings',
    
    // Format selection
    formatTitle: 'Image Format',
    formatDescription: 'Choose output image format',
    formats: {
      png: 'High quality with transparency support (larger files)',
      jpeg: 'Smaller file sizes, good for photos (no transparency)',
      jpg: 'JPG - Smaller size, good quality',
      webp: 'WebP - Modern format, excellent compression'
    },
    
    // Quality settings
    qualityTitle: 'Image Quality',
    qualityDescription: 'Balance between file size and quality',
    qualities: {
      low: 'Smallest file size, basic quality',
      medium: 'Balanced size and quality',
      high: 'High quality, larger files',
      maximum: 'Maximum quality, largest files'
    },
    
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
    startConversion: 'Convert to Images 🖼️',
    converting: 'Converting...',
    cancel: 'Cancel',
    close: 'Close',
    backToUpload: 'Back to Upload',
    supportInfo: 'Files up to 100MB supported • PNG, JPEG formats • High quality'
  },
  
  // Processing messages
  progress: {
    analyzing: 'Analyzing PDF file...',
    converting: 'Converting pages to images...',
    page: 'Page {current} of {total}',
    finalizing: 'Finalizing conversion...',
    complete: 'Conversion complete!'
  },
  
  // Legacy compatibility
  buttons: {
    startConverting: 'Convert to Images 🖼️',
    processing: 'Converting to Images...',
    downloadZip: 'Download Images (ZIP)'
  },
  
  messages: {
    processing: 'Converting PDF pages to images...',
    success: 'Conversion completed successfully!',
    error: 'Failed to convert PDF to images'
  },
  
  // Error handling
  errors: {
    invalidFile: 'Invalid PDF file format',
    fileTooLarge: 'File size exceeds 100MB limit',
    conversionFailed: 'Failed to convert PDF to images',
    noPages: 'No pages found in PDF',
    invalidPageRange: 'Invalid page range specified'
  }
};