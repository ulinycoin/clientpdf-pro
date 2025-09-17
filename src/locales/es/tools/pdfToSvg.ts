/**
 * PDF to SVG tool translations for ES language
 * Contains: page metadata, upload zone, tool interface, conversion options, progress, results
 * Complete localization following established methodology
 */

export const pdfToSvg = {
  // Basic properties for tools grid
  title: 'PDF a SVG',
  description: 'Convertir páginas PDF a gráficos vectoriales escalables (SVG)',
  
  // Page metadata (SEO)
  pageTitle: 'Convertir PDF a SVG gratis - LocalPDF',
  pageDescription: 'Convertir páginas PDF a vectores SVG. Conversión PDF a SVG de alta calidad con gráficos escalables.',
  
  // Upload zone (for PDFToSvgPage)
  uploadTitle: 'Subir archivo PDF para convertir a SVG',
  uploadSubtitle: 'Transformar páginas PDF en gráficos vectoriales escalables',
  supportedFormats: 'Archivos PDF',
  selectedFile: 'Archivo seleccionado ({count})',
  readyToConvert: 'Listo para convertir a SVG',
  removeFile: 'Eliminar archivo',
  fileSizeUnit: 'MB',
  
  // Results section
  results: {
    successTitle: '¡PDF convertido exitosamente a SVG!',
    successDescription: 'Todas las páginas PDF convertidas a gráficos vectoriales escalables',
    convertAnotherFile: 'Convertir otro archivo',
    conversionComplete: '¡Conversión SVG completada exitosamente!',
    processingTitle: 'Conversión SVG en progreso',
    processingMessage: 'Procesando página {current} de {total}',
    pagesConverted: 'Páginas convertidas',
    format: 'Formato',
    totalSize: 'Tamaño total',
    processingTime: 'Tiempo de procesamiento',
    preview: 'Vista previa',
    downloadSvgs: 'Descargar archivos SVG',
    downloadAll: 'Descargar todos los archivos SVG ({count})',
    downloadIndividual: 'Descargar archivos SVG individuales',
    pageLabel: 'Página {number}',
    seconds: 's'
  },
  
  // Tool interface (for PdfToSvgTool)
  tool: {
    title: 'Convertidor PDF a SVG',
    description: 'Convertir páginas PDF a gráficos vectoriales escalables',
    noFileSelected: 'No se ha seleccionado archivo PDF',
    noFileDescription: 'Por favor selecciona un archivo PDF para convertir a SVG',
    selectFile: 'Seleccionar archivo PDF',
    conversionSettingsTitle: 'Configuraciones de conversión',
    
    // Quality settings
    qualityTitle: 'Calidad y resolución',
    qualityDescription: 'Mayor calidad produce mejores vectores pero archivos más grandes',
    qualities: {
      low: 'Calidad básica, archivos más pequeños',
      medium: 'Calidad y tamaño equilibrados',
      high: 'Alta calidad, vectores detallados',
      maximum: 'Calidad máxima, archivos más grandes'
    },
    
    // Conversion method
    methodTitle: 'Método de conversión',
    methodDescription: 'Elegir entre canvas rápido o extracción vectorial',
    methods: {
      canvas: 'Conversión basada en canvas - rápida pero contenido rasterizado',
      vector: 'Extracción vectorial - más lenta pero vectores escalables reales (función futura)'
    },
    
    // Advanced options
    advancedTitle: 'Opciones avanzadas',
    includeText: 'Incluir elementos de texto',
    includeTextDesc: 'Preservar texto como elementos seleccionables',
    includeImages: 'Incluir imágenes',
    includeImagesDesc: 'Incrustar imágenes en la salida SVG',
    
    // Page selection
    pageSelectionTitle: 'Páginas a convertir',
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
    backgroundTitle: 'Color de fondo',
    backgroundDescription: 'Color de fondo para áreas transparentes',
    
    // Progress and actions
    startConversion: 'Convertir a SVG 📐',
    converting: 'Convirtiendo...',
    cancel: 'Cancelar',
    close: 'Cerrar',
    backToUpload: 'Volver a subir',
    supportInfo: 'Archivos hasta 100MB soportados • Formato SVG • Vectores escalables'
  },
  
  // Processing messages
  progress: {
    analyzing: 'Analizando archivo PDF...',
    converting: 'Convirtiendo páginas a SVG...',
    page: 'Página {current} de {total}',
    finalizing: 'Finalizando conversión SVG...',
    complete: '¡Conversión SVG completada!'
  },
  
  // Legacy compatibility
  buttons: {
    startConverting: 'Convertir a SVG 📐',
    processing: 'Convirtiendo a SVG...',
    downloadZip: 'Descargar archivos SVG (ZIP)'
  },
  
  messages: {
    processing: 'Convirtiendo páginas PDF a SVG...',
    success: '¡Conversión SVG completada exitosamente!',
    error: 'Falló la conversión PDF a SVG'
  },
  
  // Error handling
  errors: {
    invalidFile: 'Formato de archivo PDF inválido',
    fileTooLarge: 'El tamaño del archivo excede el límite de 100MB',
    conversionFailed: 'Falló la conversión PDF a SVG',
    noPages: 'No se encontraron páginas en el PDF',
    invalidPageRange: 'Rango de páginas inválido especificado',
    invalidOptions: 'Opciones de conversión inválidas',
    processingError: 'Error durante el procesamiento SVG'
  }
};