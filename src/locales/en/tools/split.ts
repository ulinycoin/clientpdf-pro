/**
 * Split PDF tool translations for EN language
 * Contains: page metadata, upload zone, split options, processing messages
 */

export const split = {
  // Basic properties for tools grid
  title: 'Split PDF',
  description: 'Split PDF into separate pages or ranges',
  
  // Page metadata (SEO)
  pageTitle: 'Split PDF Files for Free - LocalPDF',
  pageDescription: 'Split PDF files into separate pages or custom ranges. Free PDF splitter tool with complete privacy protection. No uploads required.',
  
  // Upload zone translations (legacy flat structure)
  uploadTitle: 'Split PDF File',
  uploadSubtitle: 'Separate PDF pages into individual documents', 
  uploadDescription: 'Separate PDF pages into individual documents',
  supportedFormats: 'PDF files up to 100MB',
  
  // Upload zone (nested structure for components)
  upload: {
    title: 'Upload PDF file to split',
    description: 'Extract individual pages or ranges from PDF documents',
    supportedFormats: 'PDF files up to 100MB',
    selectedFile: 'Selected file ({count})',
    readyToSplit: 'Ready to split',
    removeFile: 'Remove file',
    startSplitting: 'Split PDF File ✂️'
  },
  
  // File management
  selectedFile: 'Selected File',
  readyToSplit: 'Ready to split',
  removeFile: 'Remove file',
  fileSizeUnit: 'MB',
  
  // Split options
  options: {
    title: 'Split Options',
    splitByPages: 'Split by Pages',
    splitByRanges: 'Split by Custom Ranges',
    allPages: 'Every page as separate file',
    customRanges: 'Custom page ranges',
    pageRange: 'Page Range (e.g. 1-5, 7, 10-12)',
    rangeHelp: 'Enter ranges like: 1-3, 5, 7-10'
  },
  
  // Processing buttons and states
  buttons: {
    startSplitting: 'Split PDF =�',
    splitting: 'Splitting PDF...',
    downloadFiles: 'Download Split Files',
    downloadZip: 'Download as ZIP',
    backToTools: 'Back to Tools'
  },
  
  // Processing messages
  messages: {
    processing: 'Splitting your PDF file...',
    progress: 'Processing page {current} of {total}',
    success: 'PDF split successfully!',
    downloadReady: 'Your split files are ready for download',
    error: 'Failed to split PDF file',
    noFileSelected: 'Please select a PDF file to split',
    invalidRange: 'Invalid page range specified',
    filesCreated: '{count} files created from your PDF'
  },
  
  // Results display (for SplitPDFPage)
  results: {
    successTitle: 'PDF successfully split!',
    successDescription: '{count} files created',
    downloadAllZip: 'Download all as ZIP',
    downloadAllZipDescription: 'Download ZIP archive ({count} files)',
    downloadIndividually: 'Download files individually:',
    pageFileName: 'Page {pageNumber}.pdf',
    rangeFileName: 'Pages {startPage}-{endPage}.pdf',
    genericFileName: 'File {index}.pdf',
    fileReady: 'Ready for download',
    splitAnother: 'Split another file'
  },
  
  // Tool info
  howItWorks: {
    title: 'How PDF Splitting Works',
    description: 'Our split tool separates PDF pages while preserving original quality and formatting',
    steps: [
      'Upload your PDF file from your device',
      'Choose how you want to split the document',
      'Specify page ranges or select all pages',
      'Download individual files or as ZIP archive'
    ]
  },
  
  // ModernSplitTool specific translations
  tool: {
    fileNotSelected: 'No file selected',
    fileNotSelectedDescription: 'Please select a PDF file to split',
    toolTitle: 'PDF File Splitter',
    trustIndicators: {
      private: 'Private Processing',
      quality: 'High Quality'
    },
    modes: {
      title: 'Split Mode',
      description: 'Choose how to split the PDF',
      all: {
        title: 'Split into individual pages',
        description: 'Each page becomes a separate PDF file',
        shortDescription: 'Each page becomes a separate PDF file'
      },
      range: {
        title: 'Extract page range',
        description: 'Select a specific range of pages',
        shortDescription: 'Pages {startPage}-{endPage} will be extracted into one file'
      },
      specific: {
        title: 'Extract specific pages',
        description: 'Specify page numbers separated by commas',
        shortDescription: 'Selected pages will become individual files'
      }
    },
    rangeInputs: {
      title: 'Page Range',
      description: 'Specify start and end pages',
      fromPage: 'From Page',
      toPage: 'To Page'
    },
    specificInputs: {
      title: 'Specific Pages',
      description: 'Enter page numbers separated by commas',
      placeholder: 'e.g: 1, 3, 5-7, 10',
      helpText: 'Use commas to separate and dashes for ranges (e.g: 1, 3, 5-7)'
    },
    zipOption: {
      title: 'Package as ZIP archive',
      description: 'Recommended when splitting into 5+ pages'
    },
    progress: {
      title: 'Splitting in progress',
      analyzing: 'Analyzing PDF file...',
      splitting: 'Splitting pages...',
      label: 'Progress'
    },
    errors: {
      startPageTooLarge: 'Start page cannot be larger than end page',
      invalidPageNumbers: 'Please enter valid page numbers',
      splittingFailed: 'Splitting failed: {error}',
      unknownError: 'Error splitting PDF',
      processingError: 'Processing error'
    },
    buttons: {
      split: 'Split PDF',
      back: 'Back',
      close: 'Close',
      cancel: 'Cancel',
      processing: 'Processing...'
    },
    fileSizeUnit: 'MB'
  },
  
  // Error handling (legacy)
  errors: {
    invalidFile: 'Invalid PDF file format',
    fileTooLarge: 'File size exceeds 100MB limit',
    processingFailed: 'Failed to process PDF file',
    invalidPageRange: 'Invalid page range format',
    pageOutOfRange: 'Page number exceeds document length'
  }
};