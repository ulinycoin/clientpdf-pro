/**
 * PDF to Image tool translations for ES language
 * Contains: page metadata, upload zone, tool interface, format options, progress, results
 * Complete localization following established methodology
 */

export const pdfToImage = {
  // Basic properties for tools grid
  title: 'PDF a Imágenes',
  description: 'Convertir páginas PDF a archivos de imagen (PNG, JPEG)',
  
  // Page metadata (SEO)
  pageTitle: 'Convertir PDF a Imágenes Gratis - LocalPDF',
  pageDescription: 'Convierte páginas PDF a imágenes PNG o JPEG. Conversión de PDF a imagen de alta calidad.',
  
  // Upload zone (for PDFToImagePage)
  uploadTitle: 'Subir archivo PDF para convertir a imágenes',
  uploadSubtitle: 'Transformar páginas PDF en imágenes JPG, PNG o WebP de alta calidad',
  supportedFormats: 'Archivos PDF',
  selectedFile: 'Archivo seleccionado ({count})',
  readyToConvert: 'Listo para convertir a imágenes',
  removeFile: 'Eliminar archivo',
  fileSizeUnit: 'MB',
  
  // Results section
  results: {
    successTitle: '¡PDF convertido exitosamente a imágenes!',
    successDescription: 'Todas las páginas PDF se han convertido a imágenes',
    convertAnotherFile: 'Convertir otro archivo',
    conversionComplete: '¡Conversión completada exitosamente!',
    processingTitle: 'Conversión en progreso',
    processingMessage: 'Procesando página {current} de {total}',
    pagesConverted: 'Páginas convertidas',
    format: 'Formato',
    totalSize: 'Tamaño total',
    processingTime: 'Tiempo de procesamiento',
    preview: 'Vista previa',
    downloadImages: 'Descargar Imágenes',
    downloadAll: 'Descargar todas las imágenes ({count})',
    downloadIndividual: 'Descargar imágenes individuales',
    pageLabel: 'Página {number}',
    seconds: 's'
  },
  
  // Tool interface (for PdfToImageTool)
  tool: {
    title: 'Conversor PDF a Imágenes',
    description: 'Convertir páginas PDF a archivos de imagen de alta calidad',
    noFileSelected: 'Ningún archivo PDF seleccionado',
    noFileDescription: 'Por favor selecciona un archivo PDF para convertir a imágenes',
    selectFile: 'Seleccionar archivo PDF',
    conversionSettingsTitle: 'Configuración de conversión',
    
    // Format selection
    formatTitle: 'Formato de Imagen',
    formatDescription: 'Elegir formato de imagen de salida',
    formats: {
      png: 'Alta calidad con soporte de transparencia (archivos más grandes)',
      jpeg: 'Tamaños de archivo más pequeños, bueno para fotos (sin transparencia)',
      jpg: 'JPG - Tamaño menor, buena calidad',
      webp: 'WebP - Formato moderno, excelente compresión'
    },
    
    // Quality settings
    qualityTitle: 'Calidad de Imagen',
    qualityDescription: 'Balance entre tamaño de archivo y calidad',
    qualities: {
      low: 'Tamaño de archivo más pequeño, calidad básica',
      medium: 'Tamaño y calidad equilibrados',
      high: 'Alta calidad, archivos más grandes',
      maximum: 'Calidad máxima, archivos más grandes'
    },
    
    // Page selection
    pageSelectionTitle: 'Páginas a Convertir',
    pageSelection: {
      all: 'Todas las páginas',
      range: 'Rango de páginas',
      specific: 'Páginas específicas'
    },
    pageRangeFrom: 'Desde página',
    pageRangeTo: 'Hasta página',
    specificPagesPlaceholder: 'ej. 1,3,5-10',
    specificPagesHelp: 'Ingresa números de página separados por comas',
    
    // Background color
    backgroundTitle: 'Color de Fondo',
    backgroundDescription: 'Color de fondo para áreas transparentes',
    
    // Progress and actions
    startConversion: 'Convertir a Imágenes 🖼️',
    converting: 'Convirtiendo...',
    cancel: 'Cancelar',
    close: 'Cerrar',
    backToUpload: 'Volver a Subir',
    supportInfo: 'Archivos hasta 100MB soportados • Formatos PNG, JPEG • Alta calidad'
  },
  
  // Processing messages
  progress: {
    analyzing: 'Analizando archivo PDF...',
    converting: 'Convirtiendo páginas a imágenes...',
    page: 'Página {current} de {total}',
    finalizing: 'Finalizando conversión...',
    complete: '¡Conversión completa!'
  },
  
  // Legacy compatibility
  buttons: {
    startConverting: 'Convertir a Imágenes 🖼️',
    processing: 'Convirtiendo a Imágenes...',
    downloadZip: 'Descargar Imágenes (ZIP)'
  },
  
  messages: {
    processing: 'Convirtiendo páginas PDF a imágenes...',
    success: '¡Conversión completada exitosamente!',
    error: 'Error al convertir PDF a imágenes'
  },
  
  // Error handling
  errors: {
    invalidFile: 'Formato de archivo PDF inválido',
    fileTooLarge: 'El tamaño del archivo excede el límite de 100MB',
    conversionFailed: 'Error al convertir PDF a imágenes',
    noPages: 'No se encontraron páginas en el PDF',
    invalidPageRange: 'Rango de páginas especificado inválido'
  }
};