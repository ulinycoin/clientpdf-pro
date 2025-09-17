/**
 * Merge PDF tool translations for EN language
 * Contains: page metadata, upload zone, file management, processing messages
 */

export const merge = {
  // Basic properties for tools grid
  title: 'Merge PDFs',
  description: 'Combine multiple PDF files into one document',
  
  // Page metadata (SEO)
  pageTitle: 'Merge PDF Files for Free - LocalPDF',
  pageDescription: 'Merge multiple PDF files into one document for free. Combine PDFs quickly and securely in your browser. No uploads required, complete privacy guaranteed.',
  
  // Upload zone translations
  uploadTitle: 'Merge PDF Files',
  uploadSubtitle: 'Combine multiple PDF documents into a single file',
  supportedFormats: 'PDF files up to 100MB each',
  
  // File management
  selectedFiles: 'Selected Files',
  readyToMerge: 'Ready to merge',
  removeFile: 'Remove file',
  fileSizeUnit: 'MB',
  
  // Processing buttons and states
  buttons: {
    startMerging: 'Merge {count} Files 📄',
    merging: 'Merging Files...',
    download: 'Download Merged PDF',
    backToTools: 'Back to Tools',
    selectMoreFiles: 'Select More Files'
  },
  
  // Processing messages
  messages: {
    processing: 'Merging your PDF files...',
    progress: 'Processing file {current} of {total}',
    success: 'PDF files merged successfully!',
    downloadReady: 'Your merged PDF is ready for download',
    error: 'Failed to merge PDF files',
    noFilesSelected: 'Please select at least 2 PDF files to merge',
    singleFileWarning: 'Please select multiple files to merge'
  },
  
  // ModernMergeTool specific translations
  toolTitle: 'PDF File Merger',
  fileCount: {
    single: 'file',
    few: 'files', 
    many: 'files'
  },
  processing: 'Merging files...',
  processingTitle: 'Merging in Progress',
  processingDescription: 'Processing files...',
  orderTitle: 'File Order',
  orderDescription: 'Use arrows to change file order',
  trustIndicators: {
    private: 'Private Processing',
    quality: 'High Quality'
  },
  controls: {
    moveUp: 'Move up',
    moveDown: 'Move down'
  },
  actions: {
    merge: 'Merge {count} {fileWord}',
    merging: 'Processing...',
    cancel: 'Cancel',
    close: 'Close'
  },
  progress: 'Progress',
  
  // Tool-specific content
  howItWorks: {
    title: 'How PDF Merging Works',
    description: 'Our merge tool combines multiple PDF documents while preserving quality and formatting',
    steps: [
      'Upload multiple PDF files from your device',
      'Arrange files in your preferred order',
      'Click merge to combine all documents',
      'Download your unified PDF file'
    ]
  },
  
  // Benefits specific to merge tool
  benefits: {
    title: 'Why Use Our PDF Merger?',
    features: [
      'Preserve original quality and formatting',
      'Maintain document metadata and bookmarks',
      'No file size or quantity limits',
      'Instant processing in your browser'
    ]
  },
  
  // Error handling (consolidated)
  errors: {
    minFiles: 'Please select at least 2 files to merge',
    processingError: 'Error processing files',
    unknownError: 'Unknown error',
    errorTitle: 'Processing Error',
    invalidFile: 'Invalid PDF file format',
    fileTooLarge: 'File size exceeds 100MB limit',
    processingFailed: 'Failed to process PDF file',
    noFilesUploaded: 'No files uploaded for merging'
  }
};