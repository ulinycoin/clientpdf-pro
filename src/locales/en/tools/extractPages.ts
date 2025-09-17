/**
 * Extract Pages tool translations for EN language
 * Contains: page metadata, upload zone, tool interface, selection modes, progress, results
 * Complete localization following established methodology
 */

export const extractPages = {
  // Basic properties for tools grid
  title: 'Extract Pages',
  description: 'Extract specific pages into a new document',
  
  // Page metadata (SEO)
  pageTitle: 'Extract PDF Pages for Free - LocalPDF',
  pageDescription: 'Extract specific pages from PDF files. Create new PDFs from selected page ranges.',
  
  // Upload section (for ExtractPagesPDFPage)
  uploadTitle: 'Extract Pages from PDF',
  uploadSubtitle: 'Select specific pages from PDF document to create a new file',
  supportedFormats: 'PDF files up to 100MB',
  selectedFile: 'Selected File',
  readyToExtract: 'Ready to extract pages',
  removeFile: 'Remove file',
  extractPagesButton: 'Extract Pages 📑',
  
  // Main ExtractPagesTool interface
  tool: {
    title: 'Extract PDF Pages',
    titleLoading: 'Extract PDF Pages',
    description: 'Select pages to extract from:',
    fileInfo: {
      totalPages: 'Total pages:',
      selected: 'Selected:',
      loadingFile: 'Loading PDF file...',
      noFileAvailable: 'No PDF file available for page extraction.',
      goBack: 'Go Back'
    },
    
    // Selection modes
    selectionModes: {
      individual: 'Individual',
      range: 'Range',
      all: 'All',
      custom: 'Custom'
    },
    
    // Selection controls
    individual: {
      description: 'Click on page numbers below to select individual pages:',
      selected: 'Selected:',
      clearAll: 'Clear All'
    },
    
    range: {
      from: 'From:',
      to: 'To:',
      selectRange: 'Select Range',
      clear: 'Clear'
    },
    
    all: {
      description: 'Extract all {count} pages (copy entire document)',
      selectAllPages: 'Select All Pages',
      clear: 'Clear'
    },
    
    custom: {
      label: 'Page Range (e.g., "1-5, 8, 10-12"):',
      placeholder: '1-5, 8, 10-12',
      parseRange: 'Parse Range',
      selected: 'Selected:',
      clearAll: 'Clear All'
    },
    
    // Page grid
    pagesPreview: 'Pages Preview',
    pageTooltip: 'Page {number}',
    pageSelected: 'Page {number} (selected)',
    
    // Progress and results
    progress: {
      extracting: 'Extracting pages...',
      percentage: '{progress}%'
    },
    
    success: {
      title: 'Pages extracted successfully!',
      extracted: 'Extracted {extracted} of {total} pages',
      timing: 'in {time}s'
    },
    
    // Action buttons
    actions: {
      clearSelection: 'Clear Selection',
      extractPages: 'Extract Pages',
      extracting: 'Extracting...',
      readyToExtract: 'Ready to extract {count} {pages}'
    },
    
    // Tips section
    tips: {
      title: '💡 Tips for Page Extraction:',
      items: [
        'Use "Range" mode for continuous pages (e.g., pages 1-10)',
        'Use "Custom" mode for complex selections (e.g., "1-5, 8, 10-12")',
        'Click individual page numbers to toggle selection',
        'All original formatting and quality will be preserved'
      ]
    },
    
    // Error handling
    errors: {
      noFileSelected: 'Please select a PDF file for page extraction'
    }
  },
  
  // Legacy compatibility
  backToTools: 'Back to Tools',
  fileSizeUnit: 'MB',
  buttons: {
    startExtracting: 'Extract Pages 📑',
    processing: 'Extracting Pages...',
    download: 'Download Extracted Pages',
    backToTools: 'Back to Tools'
  },
  
  messages: {
    processing: 'Extracting pages from your PDF...',
    success: 'Pages extracted successfully!',
    error: 'Failed to extract pages'
  }
};