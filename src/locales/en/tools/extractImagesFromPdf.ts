/**
 * Extract Images from PDF tool translations for EN language
 * Contains: page metadata, upload zone, tool interface, options, progress, results
 * Complete localization following established methodology
 */

export const extractImagesFromPdf = {
  // Basic properties for tools grid
  title: 'Extract Images',
  description: 'Extract all images from PDF documents in original quality',
  
  // Page metadata (SEO)
  pageTitle: 'Extract Images from PDF Free - LocalPDF',
  pageDescription: 'Extract all images from PDF files for free. Download images in original quality with batch selection and filtering options.',
  
  // Upload section (for ExtractImagesFromPDFPage)
  upload: {
    title: 'Extract Images from PDF',
    subtitle: 'Extract all embedded images from PDF documents with advanced filtering options',
    supportedFormats: 'PDF files up to 100MB',
    dragAndDrop: 'Drop your PDF file here or click to browse'
  },
  
  // Main ExtractImagesFromPdfTool interface
  uploadPrompt: 'Drop your PDF file here or click to browse',
  uploadSubtitle: 'Extract all images from your PDF document',
  
  // Settings section
  settings: {
    pageSelection: 'Page Selection',
    allPages: 'All pages',
    specificPages: 'Specific pages',
    pageRange: 'Page range',
    minSize: 'Minimum Image Size',
    minSizeDescription: 'Only extract images larger than this size (pixels)',
    outputFormat: 'Output Format',
    original: 'Keep original format',
    png: 'Convert to PNG',
    jpeg: 'Convert to JPEG',
    jpegQuality: 'JPEG Quality',
    deduplicateImages: 'Remove duplicate images',
    includeVectorImages: 'Include vector images'
  },
  
  // Progress section
  progress: {
    preparing: 'Loading PDF document...',
    extracting: 'Extracting images from page {current} of {total}...',
    processing: 'Processing and filtering images...',
    finalizing: 'Finalizing extraction...',
    complete: 'Extraction complete!'
  },
  
  // Results section
  results: {
    imagesFound: 'images found',
    totalSize: 'Total size',
    selectedCount: '{selected} of {total} selected',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    downloadSelected: 'Download Selected',
    downloadAll: 'Download All as ZIP',
    imageInfo: 'Page {pageNumber} • {width}×{height} • {size} • {format}',
    duplicatesRemoved: '{count} duplicates removed',
    gridView: 'Grid View',
    listView: 'List View'
  },
  
  // Success messages
  success: {
    title: 'Images extracted successfully!',
    description: 'Found {count} images with total size of {size} MB',
    extractedInfo: 'Extracted {count} images from {pages} pages'
  },
  
  // Error handling
  errors: {
    noImages: 'No images found in this PDF',
    noImagesDescription: "This PDF doesn't contain any extractable images matching your criteria.",
    extractionFailed: 'Failed to extract images',
    loadingFailed: 'Failed to load PDF document',
    noFileSelected: 'Please select a PDF file to extract images from',
    processingError: 'An error occurred while processing the PDF'
  },
  
  // Buttons
  buttons: {
    extractImages: 'Extract Images',
    extracting: 'Extracting Images...',
    extractAnother: 'Extract from Another PDF',
    tryAgain: 'Try Another File',
    showSettings: 'Show Settings',
    hideSettings: 'Hide Settings'
  },
  
  // Quick steps for StandardToolPageTemplate
  quickSteps: {
    step1: {
      title: 'Upload PDF',
      description: 'Select or drag & drop your PDF file to start image extraction'
    },
    step2: {
      title: 'Configure Settings',
      description: 'Set minimum image size, output format, and other extraction preferences'
    },
    step3: {
      title: 'Download Images',
      description: 'Preview, select, and download extracted images individually or as ZIP'
    }
  },
  
  // Benefits for StandardToolPageTemplate
  benefits: {
    privacy: {
      title: 'Complete Privacy',
      description: 'All processing happens locally in your browser. No files are uploaded to servers.'
    },
    quality: {
      title: 'Original Quality',
      description: 'Extract images in their original resolution and format with no quality loss.'
    },
    formats: {
      title: 'Multiple Formats',
      description: 'Support for JPEG, PNG, and other image formats with conversion options.'
    },
    batch: {
      title: 'Batch Operations',
      description: 'Select multiple images and download them as a convenient ZIP archive.'
    }
  },
  
  // Legacy compatibility for existing components
  fileSelected: 'File selected',
  readyToExtract: 'Ready to extract images',
  removeFile: 'Remove file',
  backToTools: 'Back to tools',
  processing: 'Extracting images from your PDF...',
  downloadReady: 'Your images are ready for download'
};