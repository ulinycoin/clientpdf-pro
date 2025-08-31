/**
 * Images to PDF tool translations for EN language
 * Contains: page metadata, upload zone, tool interface, settings, progress
 * Complete localization following established methodology
 */

export const imageToPdf = {
  // Basic properties for tools grid
  title: 'Images to PDF',
  description: 'Convert multiple images into a single PDF document',
  
  // Page metadata (SEO)
  pageTitle: 'Convert Images to PDF for Free - LocalPDF',
  pageDescription: 'Convert multiple images to a single PDF document. Support for PNG, JPEG, and more.',
  
  // Upload section (for ImageToPDFToolWrapper)
  uploadTitle: 'Images to PDF',
  uploadSubtitle: 'Combine multiple images into one PDF document',
  supportedFormats: 'PNG, JPEG, GIF, BMP, TIFF files',
  
  // Upload section (for ImageToPDFTool)
  uploadSection: {
    title: 'Upload Images',
    subtitle: 'Convert multiple images into a single PDF document',
    supportedFormats: 'JPG, PNG, GIF, BMP, WebP files up to 50MB each'
  },
  
  // Tool interface (for ImageToPDFTool)
  tool: {
    title: 'Convert Images to PDF',
    description: 'Transform multiple images into a single PDF document',
    
    // File management
    selectedImages: 'Selected Images ({count})',
    clearAll: 'Clear All',
    fileInfo: '{count} files • {size}',
    
    // PDF Settings
    pdfSettings: 'PDF Settings',
    pageSize: 'Page Size',
    pageSizeOptions: {
      a4: 'A4 (210 × 297 mm)',
      letter: 'Letter (8.5 × 11 in)',
      auto: 'Auto (fit images)'
    },
    
    orientation: 'Orientation',
    orientationOptions: {
      portrait: 'Portrait',
      landscape: 'Landscape'
    },
    
    imageLayout: 'Image Layout',
    layoutOptions: {
      fitToPage: 'Fit to Page',
      actualSize: 'Actual Size',
      fitWidth: 'Fit Width',
      fitHeight: 'Fit Height'
    },
    
    imageQuality: 'Image Quality ({quality}%)',
    qualitySlider: {
      lowerSize: 'Lower Size',
      higherQuality: 'Higher Quality'
    },
    
    pageMargin: 'Page Margin ({margin}")',
    marginSlider: {
      noMargin: 'No Margin',
      twoInch: '2 Inch'
    },
    
    background: 'Background',
    backgroundOptions: {
      white: 'White',
      lightGray: 'Light Gray',
      gray: 'Gray',
      black: 'Black'
    },
    
    // Progress and conversion
    converting: 'Converting... {progress}%',
    
    // Buttons
    buttons: {
      selectImages: 'Select Images',
      reset: 'Reset',
      converting: 'Converting...',
      createPdf: 'Create PDF'
    },
    
    // Help section
    help: {
      title: 'Tips for Image to PDF Conversion:',
      dragDrop: 'Simply drag images directly into the upload area',
      formats: 'Supports JPG, PNG, GIF, BMP, and WebP formats',
      layout: 'Choose how images fit on PDF pages (fit to page, actual size, etc.)',
      quality: 'Adjust image quality to balance file size and visual quality',
      privacy: 'All processing happens locally - your images never leave your device'
    }
  },
  
  // Legacy compatibility (from original structure)
  buttons: {
    startConverting: 'Convert to PDF 📄',
    processing: 'Converting Images...',
    download: 'Download PDF'
  },
  
  messages: {
    processing: 'Converting images to PDF...',
    success: 'Images converted successfully!',
    error: 'Failed to convert images to PDF'
  }
};