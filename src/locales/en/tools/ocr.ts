export const ocr = {
  title: 'OCR PDF',
  aiTitle: 'AI-Enhanced OCR',
  description: 'Extract text from scanned PDF documents',
  pageTitle: 'OCR PDF for Free - LocalPDF',
  pageDescription: 'Extract text from scanned PDF documents using OCR technology. Free PDF OCR tool.',
  uploadTitle: 'OCR PDF Document',
  uploadSubtitle: 'Extract text from scanned PDF files',
  supportedFormats: 'PDF and images up to 50MB',
  buttons: {
    startOCR: 'Start OCR 🔍',
    processing: 'Processing OCR...',
    download: 'Download Text File',
    extractText: 'Extract Text with OCR',
    downloadText: 'Download Text',
    downloadPdf: 'Download PDF',
    downloadDocx: 'Download Word',
    downloadRtf: 'Download RTF',
    downloadJson: 'JSON Data',
    downloadMarkdown: 'Markdown',
    downloadFile: 'Download',
    downloadFormat: 'Choose Download Format',
    processAnother: 'Process Again',
    editText: 'Edit Text'
  },
  messages: {
    processing: 'Performing OCR on your PDF...',
    success: 'OCR completed successfully!',
    error: 'Failed to perform OCR'
  },
  settings: {
    title: 'OCR Settings',
    language: 'OCR Language',
    languageDescription: 'Choose the primary language of your document for better accuracy',
    outputFormat: 'Output Format',
    plainText: 'Plain Text (.txt)',
    plainTextDesc: 'Extract text only',
    searchablePdf: 'Searchable PDF',
    searchablePdfDesc: 'PDF with searchable text layer',
    advancedOptions: 'Advanced Options',
    preserveLayout: 'Preserve Layout',
    preserveLayoutDesc: 'Maintain document structure',
    imagePreprocessing: 'Image Preprocessing',
    imagePreprocessingDesc: 'Enhance image quality'
  },
  fileInfo: {
    title: 'File Information',
    name: 'Name',
    size: 'Size',
    supported: 'File format supported',
    unsupported: 'Unsupported file format'
  },
  results: {
    title: 'Results Summary',
    processingTime: 'Processing Time',
    confidence: 'Confidence',
    wordsFound: 'Words Found',
    successTitle: 'OCR Completed Successfully!',
    successDescription: 'Text has been extracted from your document',
    downloadTitle: 'Download Results',
    readyToDownload: 'Ready to download',
    rotateAnother: 'Process Another Document'
  },
  upload: {
    title: 'OCR Document',
    description: 'Extract text from PDF and images',
    supportedFormats: 'PDF and images up to 50MB',
    selectedFile: 'File Selected for OCR',
    readyToProcess: 'Ready to extract text from your document',
    removeFile: 'Remove file',
    startProcessing: 'Start OCR Processing'
  },
  fileNotSelected: 'No File Selected',
  fileNotSelectedDescription: 'Please select a file to process with OCR.',
  trustIndicators: {
    private: 'Private & Secure',
    quality: 'High Quality OCR'
  },
  editor: {
    title: 'Text Editor',
    stats: {
      confidence: 'Confidence',
      words: 'words',
      lines: 'lines',
      characters: 'characters',
      modified: 'Modified'
    },
    editMode: 'Edit',
    viewMode: 'View',
    showPreview: 'Preview',
    hidePreview: 'Hide Preview',
    preview: 'Preview',
    placeholder: 'Start editing your extracted text...',
    noText: 'No text content',
    undo: 'Undo',
    redo: 'Redo',
    copy: 'Copy',
    save: 'Save',
    saved: 'Saved',
    saveChanges: 'Save Changes',
    allSaved: 'All Saved',
    unsavedChanges: 'Unsaved changes',
    changesSaved: 'Saved',
    downloadTxt: 'Download .txt',
    downloadPdf: 'Download PDF'
  },
  ai: {
    strategies: {
      fast: {
        title: 'Fast Mode',
        description: 'Quick OCR with basic settings',
        reasoning: 'Best for high-quality documents with clear text',
        reasoningNeeded: 'Suitable for excellent quality documents'
      },
      balanced: {
        title: 'Balanced Mode',
        description: 'Good balance of speed and accuracy',
        reasoning: 'Universal mode for most documents'
      },
      accurate: {
        title: 'High Accuracy Mode',
        description: 'Maximum accuracy with full preprocessing',
        reasoning: 'Best for critical documents',
        reasoningNeeded: 'Recommended for low-quality documents'
      },
      multilang: {
        title: 'Multi-Language Mode',
        description: 'Optimized for mixed-language documents',
        reasoning: 'Document contains multiple languages'
      }
    },
    pros: {
      fast: 'Fastest processing time',
      goodForClear: 'Good for clear documents',
      balanced: 'Good accuracy-speed balance',
      preprocessing: 'Includes preprocessing',
      multiLang: 'Supports 2 languages',
      multiLang3: 'Up to 3 languages',
      highAccuracy: 'Highest accuracy',
      fullPreprocessing: 'Full preprocessing',
      goodAccuracy: 'Good accuracy'
    },
    cons: {
      lowerAccuracy: 'Lower accuracy on poor quality',
      singleLanguage: 'Single language only',
      mediumSpeed: 'Medium processing time',
      slowest: 'Slowest processing',
      highCPU: 'High CPU usage',
      slowerProcessing: 'Slower than fast mode',
      moreMemory: 'Uses more memory'
    },
    warnings: {
      lowClarity: {
        message: 'Low image clarity detected',
        suggestion: 'Use High Accuracy mode for better results'
      },
      noise: {
        message: 'Image noise detected',
        suggestion: 'Preprocessing will improve accuracy'
      },
      columns: {
        message: 'Multi-column layout detected',
        suggestion: 'Enable layout preservation'
      }
    }
  }
};