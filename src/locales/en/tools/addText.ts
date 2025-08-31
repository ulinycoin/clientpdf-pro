/**
 * Add Text tool translations for EN language
 * Contains: page metadata, upload zone, editor interface, toolbar, format panel
 * Complete localization following rotate-pdf methodology
 */

export const addText = {
  // Basic properties for tools grid
  title: 'Add Text',
  description: 'Add text annotations and labels to PDF files',
  
  // Page metadata (SEO)
  pageTitle: 'Add Text to PDF for Free - LocalPDF',
  pageDescription: 'Add text annotations and labels to PDF files. Free PDF text editor with complete privacy protection.',
  
  // Upload zone translations (for AddTextPDFPage)
  uploadTitle: 'Add Text to PDF',
  uploadSubtitle: 'Insert text annotations anywhere in your PDF',
  supportedFormats: 'PDF files up to 100MB',
  selectedFile: 'Selected File',
  readyForEditing: 'Ready for editing',
  removeFile: 'Remove file',
  fileSizeUnit: 'MB',
  editPdf: 'Edit PDF ✏️',
  
  // Main AddTextTool interface
  addTextToPdf: 'Add Text to PDF',
  backToTools: 'Back to Tools',
  noFileSelected: 'No File Selected',
  noFileDescription: 'Please select a PDF file to add text',
  
  textElements: {
    single: 'element',
    multiple: 'elements'
  },
  
  // Toolbar translations
  toolbar: {
    addText: 'Add Text',
    select: 'Select',
    undo: 'Undo',
    redo: 'Redo',
    page: 'Page',
    of: 'of',
    savePdf: 'Save PDF'
  },
  
  // Format Panel translations
  formatPanel: {
    title: 'Formatting',
    selectElementPrompt: 'Select a text element to edit',
    textContent: 'Text Content',
    textPlaceholder: 'Enter your text...',
    fontFamily: 'Font Family',
    fontSize: 'Font Size',
    textColor: 'Text Color',
    position: 'Position',
    preview: 'Preview',
    sampleText: 'Sample Text'
  },
  
  // Status bar and interaction messages
  status: {
    mode: 'Mode',
    addTextMode: 'Add Text',
    selectMode: 'Select Elements',
    selected: 'Selected',
    zoom: 'Zoom',
    clickToEdit: 'Click to edit'
  },
  
  // Processing overlay
  processingTitle: 'Saving PDF',
  processingDescription: 'Adding text and creating new PDF file...',
  
  // Canvas translations
  canvas: {
    loadingPdf: 'Loading PDF...'
  },
  
  // Legacy compatibility
  buttons: {
    startEditing: 'Add Text ✏️',
    processing: 'Adding Text...',
    download: 'Download PDF with Text',
    backToTools: 'Back to Tools'
  },
  
  messages: {
    processing: 'Adding text to your PDF...',
    success: 'Text added successfully!',
    downloadReady: 'Your PDF with added text is ready',
    error: 'Failed to add text to PDF',
    noFileSelected: 'Please select a PDF file'
  },
  
  errors: {
    invalidFile: 'Invalid PDF file format',
    fileTooLarge: 'File size exceeds 100MB limit',
    processingFailed: 'Failed to add text to PDF'
  }
};