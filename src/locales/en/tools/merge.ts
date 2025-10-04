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
  fileCounter: {
    label: 'files',
    scrollHint: '• Scroll to view all files'
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
  },

  // Detailed unique content for this tool (replaces generic template)
  detailed: {
    title: 'Why Choose Our PDF Merger?',
    functionality: {
      title: 'Advanced Merging Technology',
      description1: 'Our PDF merger uses cutting-edge browser-based technology to combine multiple PDF documents into a single file while preserving all original formatting, fonts, images, and document structure. Unlike simple file concatenation, our tool intelligently processes each page to maintain professional quality.',
      description2: 'The merging engine handles complex PDF features including embedded fonts, vector graphics, form fields, annotations, and bookmarks. Documents are processed in your browser using PDF-lib and pdf.js libraries, ensuring compatibility with all PDF standards from 1.4 to 2.0.'
    },
    capabilities: {
      title: 'Intelligent Document Processing',
      description1: 'Merge unlimited PDF files without restrictions on document size or page count. Reorder pages by dragging files up or down before merging. Our smart processing preserves document metadata, including author information, creation dates, and custom properties.',
      description2: 'Process business contracts, academic papers, invoices, presentations, and reports with confidence. The tool maintains high-resolution images, complex layouts, multi-column text, tables, and embedded media. All processing happens instantly in your browser with real-time progress tracking.'
    }
  }
};