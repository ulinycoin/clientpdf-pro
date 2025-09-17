/**
 * Excel to PDF tool translations for EN language
 * Contains: page metadata, upload zone, tool interface, conversion options, progress
 * Complete localization following established methodology
 */

export const excelToPdf = {
  // Basic properties for tools grid
  title: 'Excel to PDF',
  description: 'Convert Excel spreadsheets to PDF documents',
  
  // Page metadata (SEO)
  pageTitle: 'Convert Excel to PDF for Free - LocalPDF',
  pageDescription: 'Convert Excel spreadsheets to PDF documents with layout preservation.',
  
  // Upload section
  uploadSection: {
    title: 'Upload Excel File',
    subtitle: 'Convert Excel spreadsheets to PDF with full formatting and data preservation',
    supportedFormats: 'XLSX, XLS files up to 100MB'
  },
  
  // Tool interface
  tool: {
    title: 'Excel to PDF Converter',
    description: 'Convert Excel spreadsheets to PDF documents',
    
    // Features
    features: {
      title: 'Conversion Features:',
      multipleSheets: 'Support for multiple sheets selection',
      preserveFormatting: 'Preserve all formatting and styles',
      customSettings: 'Flexible conversion settings',
      highQuality: 'High-quality PDF output'
    },
    
    // Sheet selection
    sheetSelection: {
      title: 'Select Sheets to Convert',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      selectedSheets: 'Selected sheets ({count})'
    },
    
    // Conversion options
    pageSize: 'Page Size',
    pageSizeOptions: {
      a4: 'A4 (210 × 297 mm)',
      letter: 'Letter (8.5 × 11 in)',
      a3: 'A3 (297 × 420 mm)'
    },
    
    orientation: 'Orientation',
    orientationOptions: {
      portrait: 'Portrait',
      landscape: 'Landscape'
    },
    
    includeSheetNames: 'Include sheet names in PDF',
    
    // Actions
    convertToPdf: 'Convert to PDF 📊',
    converting: 'Converting...',
    
    // Progress
    analyzing: 'Analyzing Excel file...',
    convertingSheet: 'Converting sheet {current} of {total}...'
  },
  
  // Direct tool interface translations (used by ExcelToPDFTool component)
  conversionSettings: 'Conversion Settings',
  fileInformation: 'File Information',
  selectSheets: 'Select Sheets to Convert',
  
  // Settings sections
  pageSetup: 'Page Setup',
  formatting: 'Formatting',
  margins: 'Margins',
  options: 'Options',
  selectAll: 'Select All',
  deselectAll: 'Deselect All',
  rowsColumns: '{rows} rows × {cols} columns',
  pageOrientation: 'Page Orientation',
  portrait: 'Portrait',
  landscape: 'Landscape',
  pageSize: 'Page Size',
  fontSize: 'Font Size',
  outputFormat: 'Output Format',
  singlePdf: 'Single PDF file',
  separatePdfs: 'Separate PDF for each sheet',
  
  // Margin labels
  marginTop: 'Top',
  marginBottom: 'Bottom', 
  marginLeft: 'Left',
  marginRight: 'Right',
  includeSheetNames: 'Include sheet names in PDF',
  convertToPdf: 'Convert to PDF 📊',
  converting: 'Converting...',
  conversionCompleted: 'Conversion Completed!',
  pdfReady: 'Your PDF is ready for download',
  multipleFiles: '{count} files are ready for download',
  file: 'File',
  size: 'Size',
  sheets: 'Sheets',
  languages: 'Languages',
  multiLanguageNote: 'This file contains multiple languages and may require special handling',
  chooseDifferentFile: 'Choose Different File',
  
  // Legacy compatibility
  uploadTitle: 'Excel to PDF',
  uploadSubtitle: 'Convert XLSX files to PDF format',
  supportedFormats: 'XLSX files up to 100MB',
  
  buttons: {
    startConverting: 'Convert to PDF 📊',
    processing: 'Converting Excel...',
    download: 'Download PDF'
  },
  
  messages: {
    processing: 'Converting Excel spreadsheet to PDF...',
    success: 'Spreadsheet converted successfully!',
    error: 'Failed to convert Excel to PDF'
  }
};