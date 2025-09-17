/**
 * Extract Text tool translations for EN language
 * Contains: page metadata, upload zone, tool interface, options, progress, results
 * Complete localization following established methodology
 */

export const extractText = {
  // Basic properties for tools grid
  title: 'Extract Text',
  description: 'Extract text content from PDF files',
  
  // Page metadata (SEO)
  pageTitle: 'Extract Text from PDF Free - LocalPDF',
  pageDescription: 'Extract text content from PDF files for free. Get plain text from PDF documents with smart formatting. Privacy-first text extraction in your browser.',
  
  // Upload section (for ExtractTextPDFPage)
  uploadTitle: 'Extract Text from PDF',
  uploadSubtitle: 'Extract all text content from PDF documents with one click',
  supportedFormats: 'PDF files up to 100MB',
  selectedFile: 'Selected File',
  readyToExtract: 'Ready for text extraction',
  removeFile: 'Remove file',
  extractTextButton: 'Extract Text 📄',
  
  // Main ExtractTextTool interface
  tool: {
    title: 'Text Extraction Tool',
    description: 'Configure text extraction settings for your PDF document',
    fileToExtract: 'File for text extraction',
    
    // Extraction options section
    extractionOptions: 'Extraction Options',
    smartFormatting: 'Smart Formatting',
    smartFormattingDesc: 'Automatically improves structure and readability of extracted text',
    
    formattingLevel: 'Formatting Level',
    levels: {
      minimal: {
        title: 'Minimal',
        desc: 'Basic cleanup of extra spaces and line breaks'
      },
      standard: {
        title: 'Standard',
        desc: 'Restore paragraphs and basic document structure'
      },
      advanced: {
        title: 'Advanced',
        desc: 'Intelligent restoration of headings, lists, and formatting'
      }
    },
    
    includeMetadata: 'Include document metadata',
    preserveFormatting: 'Preserve original formatting',
    pageRange: 'Extract only specific pages',
    
    pageRangeFields: {
      startPage: 'Start Page',
      endPage: 'End Page',
      note: 'Leave empty to extract entire document'
    },
    
    // Progress states
    extracting: 'Extracting text ({progress}%)',
    
    // Success results section
    success: {
      title: 'Text successfully extracted!',
      pagesProcessed: 'Pages processed: {count}',
      textLength: 'Characters extracted: {length}',
      documentTitle: 'Document title: {title}',
      author: 'Author: {author}',
      smartFormattingApplied: 'Smart formatting applied: {level}',
      fileDownloaded: 'File automatically downloaded',
      noTextWarning: 'No extractable text found in document',
      
      // Before/after comparison
      comparisonPreview: 'Improvement preview',
      before: 'Before processing',
      after: 'After processing',
      notice: 'Showing first 200 characters for preview',
      
      // Regular text preview
      textPreview: 'Text preview'
    },
    
    // Error handling
    errors: {
      noFileSelected: 'Please select a PDF file for text extraction'
    },
    
    // Info and privacy sections
    infoBox: {
      title: 'Smart Text Extraction',
      description: 'Our algorithms automatically detect and preserve document structure for maximum readability.'
    },
    
    privacy: {
      title: 'Privacy Protection',
      description: 'Your files are processed locally in the browser. No data is sent to servers.'
    },
    
    // Button actions
    buttons: {
      extractText: 'Extract Text',
      extracting: 'Extracting...'
    }
  },
  
  // Legacy compatibility
  backToTools: 'Back to Tools',
  fileSizeUnit: 'MB',
  buttons: {
    extractText: 'Extract Text 📄',
    extracting: 'Extracting Text...',
    download: 'Download Text File',
    backToTools: 'Back to Tools'
  },
  
  messages: {
    processing: 'Extracting text from your PDF...',
    progress: 'Processing page {current} of {total}',
    success: 'Text extraction completed successfully!',
    downloadReady: 'Your text file is ready for download',
    error: 'Failed to extract text from PDF',
    noFileSelected: 'Please select a PDF file to extract text from',
    noTextFound: 'No text found in this PDF file'
  }
};