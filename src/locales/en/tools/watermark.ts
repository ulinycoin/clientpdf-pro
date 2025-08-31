/**
 * Watermark tool translations for EN language
 * Contains: page metadata, upload zone, tool interface, settings, preview, progress
 * Complete localization following rotate-pdf methodology
 */

export const watermark = {
  // Basic properties for tools grid
  title: 'Add Watermark',
  description: 'Add text or image watermarks to protect documents',
  
  // Page metadata (SEO)
  pageTitle: 'Add Watermark to PDF for Free - LocalPDF',
  pageDescription: 'Add text watermarks to PDF files for protection. Free PDF watermark tool with privacy.',
  
  // Upload section (for WatermarkPDFPage)
  upload: {
    title: 'Add Watermark',
    description: 'Protect your documents with custom watermarks',
    supportedFormats: 'PDF files up to 100MB',
    selectedFile: 'Selected File',
    readyToWatermark: 'Ready to add watermark',
    removeFile: 'Remove file',
    startWatermarking: 'Add Watermark 💧'
  },

  // Results section (for completion state)
  results: {
    successTitle: 'Watermark Added Successfully!',
    successDescription: 'Your PDF is now protected with a watermark',
    downloadTitle: 'Download Protected File',
    readyToDownload: 'Ready for download',
    addAnotherWatermark: 'Add Watermark to Another PDF'
  },
  
  // Main WatermarkTool interface
  tool: {
    toolTitle: 'Watermark Tool',
    toolDescription: 'Configure and add watermark to your PDF document',
    fileSizeUnit: 'MB',
    
    fileInfo: {
      pdfPreview: 'PDF Preview'
    },
    
    preview: {
      title: 'Preview',
      enterTextPrompt: 'Enter watermark text',
      selectImagePrompt: 'Select an image file',
      pageLabel: 'Page 1',
      livePreviewDescription: 'Preview shows approximate watermark placement',
      previewWillAppear: 'Preview will appear after entering text'
    },
    
    settings: {
      title: 'Watermark Settings',
      
      type: {
        label: 'Watermark Type',
        text: 'Text',
        image: 'Image'
      },
      
      watermarkText: {
        label: 'Watermark Text',
        placeholder: 'Enter watermark text...',
        charactersRemaining: 'characters remaining'
      },
      
      fontFamily: {
        label: 'Font Family'
      },
      
      fontSize: {
        label: 'Font Size',
        rangeLabels: {
          small: 'Small',
          large: 'Large'
        }
      },
      
      opacity: {
        label: 'Opacity',
        rangeLabels: {
          transparent: 'Transparent',
          opaque: 'Opaque'
        }
      },
      
      rotation: {
        label: 'Rotation'
      },
      
      position: {
        label: 'Position',
        positions: {
          center: 'Center',
          topLeft: 'Top Left',
          topRight: 'Top Right',
          bottomLeft: 'Bottom Left',
          bottomRight: 'Bottom Right'
        }
      },
      
      textColor: {
        label: 'Text Color',
        colors: {
          gray: 'Gray',
          red: 'Red',
          blue: 'Blue',
          green: 'Green',
          black: 'Black',
          orange: 'Orange'
        }
      },
      
      fontRecommendation: {
        title: 'Font Recommendation',
        supportsCyrillic: '(supports Cyrillic)'
      },
      
      fontSupport: {
        supported: 'Selected font supports your text',
        mayNotSupport: 'Font may not fully support entered characters'
      },
      
      imageFile: {
        label: 'Select Image',
        supportedFormats: 'Supported formats: PNG, JPEG'
      },
      
      imageWidth: {
        label: 'Width (points)'
      },
      
      imageHeight: {
        label: 'Height (points)'
      },
      
      maintainAspectRatio: {
        label: 'Maintain aspect ratio',
        description: 'Keep original image proportions'
      }
    },
    
    progress: {
      addingWatermark: 'Adding Watermark',
      completed: 'completed'
    },
    
    error: {
      title: 'Error'
    },
    
    privacy: {
      title: 'Privacy Protection',
      description: 'Your files are processed locally in the browser. No data is sent to servers.'
    },
    
    success: {
      title: 'Watermark Added Successfully!',
      description: 'Your PDF document is now protected with a watermark',
      download: 'Download Watermarked PDF',
      downloadAgain: 'Download Again'
    },
    
    actions: {
      addWatermark: 'Add Watermark',
      adding: 'Adding...',
      cancel: 'Cancel',
      processAnother: 'Process Another File'
    },
    
    fileErrors: {
      noFileSelected: 'Please select a PDF file to add watermark'
    }
  },
  
  // Legacy compatibility
  uploadTitle: 'Add Watermark to PDF',
  uploadSubtitle: 'Protect your documents with custom watermarks',
  supportedFormats: 'PDF files up to 100MB',
  selectedFile: 'Selected File',
  readyToWatermark: 'Ready to add watermark',
  removeFile: 'Remove file',
  fileSizeUnit: 'MB',
  
  buttons: {
    startWatermarking: 'Add Watermark 💧',
    processing: 'Adding Watermark...',
    download: 'Download Watermarked PDF',
    backToTools: 'Back to Tools'
  },
  
  messages: {
    processing: 'Adding watermark to your PDF...',
    success: 'Watermark added successfully!',
    downloadReady: 'Your watermarked PDF is ready',
    error: 'Failed to add watermark to PDF',
    noFileSelected: 'Please select a PDF file'
  },
  
  errors: {
    invalidFile: 'Invalid PDF file format',
    fileTooLarge: 'File size exceeds 100MB limit',
    processingFailed: 'Failed to add watermark to PDF'
  }
};