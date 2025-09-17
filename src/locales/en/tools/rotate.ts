export const rotate = {
  // Basic properties for tools grid
  title: 'Rotate Pages',
  description: 'Rotate pages 90, 180, or 270 degrees',
  
  // Page metadata (SEO)
  pageTitle: 'Rotate PDF Pages for Free - LocalPDF',
  pageDescription: 'Rotate PDF pages by 90°, 180°, or 270°. Fast and secure PDF rotation in your browser. 100% private.',
  
  // Upload zone translations
  uploadTitle: 'Rotate PDF Pages',
  uploadSubtitle: 'Rotate pages to the correct orientation',
  supportedFormats: 'PDF files up to 100MB',
  
  // Upload section - for selected files and actions
  upload: {
    title: 'Rotate PDF Pages',
    description: 'Rotate pages to the correct orientation',
    supportedFormats: 'PDF files up to 100MB',
    selectedFile: 'Selected File ({count})',
    readyToRotate: 'Ready to rotate',
    removeFile: 'Remove file',
    startRotating: 'Rotate Pages 🔄'
  },
  
  // Results section - for completed operations
  results: {
    successTitle: 'Pages rotated successfully!',
    successDescription: 'Your PDF file is ready for download',
    downloadTitle: 'Download Rotated PDF',
    rotateAnother: 'Rotate Another File',
    fileSizeReduced: 'File ready'
  },
  
  // Legacy structure for backwards compatibility
  selectedFile: 'Selected File',
  readyToRotate: 'Ready to rotate',
  removeFile: 'Remove file',
  fileSizeUnit: 'MB',
  
  buttons: {
    startRotating: 'Rotate Pages 🔄',
    processing: 'Rotating Pages...',
    download: 'Download Rotated PDF'
  },
  
  messages: {
    processing: 'Rotating your PDF pages...',
    success: 'Pages rotated successfully!',
    error: 'Failed to rotate PDF pages'
  },

  // ModernRotateTool translations
  tool: {
    fileSizeUnit: 'MB',
    pageCount: '{count} pages',
    fileNotSelected: 'No file selected',
    fileNotSelectedDescription: 'Please select a PDF file to rotate',
    toolTitle: 'Rotate PDF Pages',
    
    trustIndicators: {
      private: 'Private processing',
      quality: 'High quality'
    },
    
    rotationAngle: {
      title: 'Select rotation angle',
      description: 'Choose how many degrees to rotate the pages'
    },
    
    rotationOptions: {
      clockwise: {
        label: '90° clockwise',
        description: 'Rotate 90 degrees clockwise'
      },
      flip: {
        label: '180° flip',
        description: 'Flip 180 degrees'
      },
      counterclockwise: {
        label: '270° counterclockwise',
        description: 'Rotate 270 degrees counterclockwise'
      }
    },
    
    pageSelection: {
      title: 'Page selection',
      description: 'Choose which pages to rotate',
      allPages: {
        label: 'All pages',
        description: 'Rotate all pages in the document',
        descriptionWithCount: 'Rotate all {count} pages'
      },
      specificPages: {
        label: 'Specific pages',
        description: 'Select specific pages to rotate'
      }
    },
    
    specificPages: {
      inputLabel: 'Page numbers',
      placeholder: 'e.g.: 1, 3, 5-8',
      helpText: 'Enter page numbers separated by commas or ranges with dashes'
    },
    
    pageOverview: {
      title: 'Page overview',
      description: 'Preview of page orientations in the document',
      pageTooltip: 'Page {pageNumber}: {orientation}',
      portrait: 'portrait',
      landscape: 'landscape',
      portraitOrientation: 'Portrait pages',
      landscapeOrientation: 'Landscape pages'
    },
    
    processing: {
      title: 'Rotating pages...',
      analyzing: 'Analyzing document...',
      rotating: 'Rotating pages...'
    },
    
    errors: {
      invalidPageNumbers: 'Invalid page numbers',
      rotationFailed: 'Rotation failed',
      unknownError: 'Unknown error',
      processingError: 'Processing error'
    },
    
    infoBox: {
      title: 'Helpful information',
      description: 'PDF pages will be rotated while maintaining quality and all document elements.'
    },
    
    buttons: {
      rotate: 'Rotate {degrees}°',
      processing: 'Processing...'
    }
  }
};