/**
 * Word to PDF tool translations for EN language
 * Contains: page metadata, upload zone, tool interface, settings, processing messages
 */

export const wordToPdf = {
  // Basic properties for tools grid
  title: 'Word to PDF',
  description: 'Convert Word documents to PDF format',
  
  // Page metadata (SEO)
  pageTitle: 'Convert Word to PDF for Free - LocalPDF',
  pageDescription: 'Convert Word documents to PDF files with perfect formatting preservation. Supports DOCX files, completely private and secure.',
  
  // Upload zone translations  
  uploadTitle: 'Convert Word to PDF',
  uploadSubtitle: 'Upload DOCX documents and convert them to PDF format',
  supportedFormats: 'DOCX files up to 100MB',
  
  // Tool interface translations
  tool: {
    title: 'Word to PDF Converter',
    uploadTitle: 'Select Word Document',
    uploadSubtitle: 'Choose a DOCX file to convert to PDF',
    supportedFormats: 'DOCX files supported (up to 100MB)',
    
    compatibility: {
      msWord: 'Microsoft Word 2007+ (.docx)',
      googleDocs: 'Google Docs exported as DOCX',
      docWarning: 'Legacy .doc files not supported - use .docx',
      localProcessing: 'Processed locally in your browser'
    },
    
    preview: {
      title: 'PDF Preview',
      description: 'Convert your document to see the PDF preview',
      generating: 'Generating PDF preview...',
      waitMessage: 'Please wait while we prepare your document',
      placeholder: 'PDF preview will appear here',
      uploadPrompt: 'Upload a Word document to get started',
      error: 'Failed to generate preview',
      errorTitle: 'Preview Error',
      tryAgain: 'Try again',
      zoomOut: 'Zoom out',
      zoomIn: 'Zoom in'
    },
    
    settings: {
      title: 'Conversion Settings',
      hide: 'Hide',
      show: 'Show',
      pageSetup: {
        title: 'Page Setup',
        pageSize: 'Page Size',
        pageSizeOptions: {
          a4: 'A4 (210 × 297 mm)',
          letter: 'Letter (8.5 × 11 in)',
          a3: 'A3 (297 × 420 mm)'
        }
      },
      margins: {
        title: 'Margins (mm)',
        top: 'Top',
        right: 'Right',
        bottom: 'Bottom',
        left: 'Left'
      },
      typography: {
        title: 'Typography',
        fontSize: 'Font Size',
        fontSizeOptions: {
          small: '10pt (Small)',
          normal11: '11pt',
          normal12: '12pt (Normal)', 
          large: '14pt (Large)',
          extraLarge: '16pt (Extra Large)'
        }
      },
      advanced: {
        title: 'Advanced Options',
        embedFonts: 'Embed fonts for better compatibility',
        compression: 'Compress PDF (smaller file size)',
        resetDefaults: 'Reset to defaults'
      }
    },
    
    fileInfo: {
      title: 'Document Information',
      fileName: 'File Name',
      fileSize: 'File Size',
      fileType: 'File Type',
      microsoftWord: 'Microsoft Word',
      privacyNote: 'Your document is processed locally - never uploaded'
    },
    
    buttons: {
      convertToPdf: 'Convert to PDF',
      converting: 'Converting...',
      download: 'Download PDF',
      chooseDifferent: 'Choose Different File',
      hidePreview: 'Hide Preview',
      showPreview: 'Show Preview & Download'
    },
    
    messages: {
      conversionCompleted: 'Conversion Completed!',
      conversionFailed: 'Conversion Failed',
      processing: 'Converting Word document to PDF...',
      noFile: 'No Word document selected',
      converting: 'Converting document to PDF...',
      downloadHint: 'After conversion, use Download button in preview panel',
      processingDescription: 'Processing your Word document...',
      progress: 'Progress',
      unknownError: 'An unexpected error occurred during conversion'
    }
  },
  
  // Processing buttons and states
  buttons: {
    startConverting: 'Convert to PDF 📄',
    converting: 'Converting Word...',
    download: 'Download PDF',
    backToTools: 'Back to Tools',
    selectNewFile: 'Select New File'
  },
  
  // Processing messages
  messages: {
    processing: 'Converting Word document to PDF...',
    success: 'Document converted successfully!',
    downloadReady: 'Your PDF is ready for download',
    error: 'Failed to convert Word to PDF',
    noFileSelected: 'Please select a Word document to convert',
    invalidFormat: 'Please select a valid DOCX file'
  },
  
  // Tool-specific content
  howItWorks: {
    title: 'How Word to PDF Conversion Works',
    description: 'Our converter transforms Word documents into professional PDF files while maintaining formatting',
    steps: [
      'Upload your DOCX file from your device',
      'Adjust conversion settings if needed', 
      'Click convert to generate PDF',
      'Download your converted PDF file'
    ]
  },
  
  // Benefits specific to word to pdf tool
  benefits: {
    title: 'Why Use Our Word to PDF Converter?',
    features: [
      'Perfect formatting preservation',
      'Maintains document structure and styling',
      'Adjustable conversion settings',
      'Instant processing in your browser'
    ]
  },
  
  // Error handling
  errors: {
    invalidFile: 'Invalid Word document format',
    fileTooLarge: 'File size exceeds 100MB limit',
    conversionFailed: 'Failed to convert document',
    noFileUploaded: 'No Word document selected',
    corruptedFile: 'Document appears to be corrupted',
    unsupportedVersion: 'Please use DOCX format (Word 2007+)'
  }
};