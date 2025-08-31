/**
 * Excel to PDF tool translations for ES language
 * Contains: page metadata, upload zone, tool interface, conversion options, progress
 * Complete localization following established methodology
 */

export const excelToPdf = {
  // Basic properties for tools grid
  title: 'Excel a PDF',
  description: 'Convertir hojas de cálculo Excel en documentos PDF',
  
  // Page metadata (SEO)
  pageTitle: 'Convertir Excel a PDF gratis - LocalPDF',
  pageDescription: 'Convertir hojas de cálculo Excel en documentos PDF con preservación del diseño.',
  
  // Upload section
  uploadSection: {
    title: 'Subir archivo Excel',
    subtitle: 'Convertir hojas de cálculo Excel a PDF con preservación completa del formato y datos',
    supportedFormats: 'Archivos XLSX, XLS hasta 100MB'
  },
  
  // Tool interface
  tool: {
    title: 'Convertidor Excel a PDF',
    description: 'Convertir hojas de cálculo Excel en documentos PDF',
    
    // Features
    features: {
      title: 'Características de conversión:',
      multipleSheets: 'Soporte para selección de múltiples hojas',
      preserveFormatting: 'Preservar todo el formato y estilos',
      customSettings: 'Configuraciones de conversión flexibles',
      highQuality: 'Salida PDF de alta calidad'
    },
    
    // Sheet selection
    sheetSelection: {
      title: 'Seleccionar hojas a convertir',
      selectAll: 'Seleccionar todo',
      deselectAll: 'Deseleccionar todo',
      selectedSheets: 'Hojas seleccionadas ({count})'
    },
    
    // Conversion options
    pageSize: 'Tamaño de página',
    pageSizeOptions: {
      a4: 'A4 (210 × 297 mm)',
      letter: 'Carta (8.5 × 11 pulgadas)',
      a3: 'A3 (297 × 420 mm)'
    },
    
    orientation: 'Orientación',
    orientationOptions: {
      portrait: 'Vertical',
      landscape: 'Horizontal'
    },
    
    includeSheetNames: 'Incluir nombres de hojas en PDF',
    
    // Actions
    convertToPdf: 'Convertir a PDF 📊',
    converting: 'Convirtiendo...',
    
    // Progress
    analyzing: 'Analizando archivo Excel...',
    convertingSheet: 'Convirtiendo hoja {current} de {total}...'
  },
  
  // Direct tool interface translations (used by ExcelToPDFTool component)
  conversionSettings: 'Configuración de conversión',
  fileInformation: 'Información del archivo',
  selectSheets: 'Seleccionar hojas a convertir',
  selectAll: 'Seleccionar todo',
  deselectAll: 'Deseleccionar todo',
  rowsColumns: '{rows} filas × {cols} columnas',
  pageOrientation: 'Orientación de página',
  portrait: 'Vertical',
  landscape: 'Horizontal',
  pageSize: 'Tamaño de página',
  fontSize: 'Tamaño de fuente',
  
  // Settings sections
  pageSetup: 'Configurar página',
  formatting: 'Formato',
  margins: 'Márgenes',
  options: 'Opciones',
  
  // Margin labels
  marginTop: 'Superior',
  marginBottom: 'Inferior',
  marginLeft: 'Izquierda',
  marginRight: 'Derecha',
  
  outputFormat: 'Formato de salida',
  singlePdf: 'Archivo PDF único',
  separatePdfs: 'PDF separado para cada hoja',
  includeSheetNames: 'Incluir nombres de hojas en PDF',
  convertToPdf: 'Convertir a PDF 📊',
  converting: 'Convirtiendo...',
  conversionCompleted: '¡Conversión completada!',
  pdfReady: 'Tu PDF está listo para descargar',
  multipleFiles: '{count} archivos están listos para descargar',
  file: 'Archivo',
  size: 'Tamaño',
  sheets: 'Hojas',
  languages: 'Idiomas',
  multiLanguageNote: 'Este archivo contiene múltiples idiomas y puede requerir manejo especial',
  chooseDifferentFile: 'Elegir otro archivo',
  
  // Legacy compatibility
  uploadTitle: 'Excel a PDF',
  uploadSubtitle: 'Convertir archivos XLSX a formato PDF',
  supportedFormats: 'Archivos XLSX hasta 100MB',
  
  buttons: {
    startConverting: 'Convertir a PDF 📊',
    processing: 'Convirtiendo Excel...',
    download: 'Descargar PDF'
  },
  
  messages: {
    processing: 'Convirtiendo hoja de cálculo Excel a PDF...',
    success: '¡Hoja de cálculo convertida exitosamente!',
    error: 'Error al convertir Excel a PDF'
  }
};