/**
 * Compress PDF tool translations for ES language
 * Contains: page metadata, upload zone, compression options, processing messages
 * Complete localization following rotate-pdf methodology
 */

export const compress = {
  // Basic properties for tools grid
  title: 'Comprimir PDF',
  description: 'Reducir el tamaño del archivo PDF sin perder calidad',
  
  // Page metadata (SEO)
  pageTitle: 'Comprimir archivos PDF gratis - LocalPDF',
  pageDescription: 'Reducir el tamaño del archivo PDF sin perder calidad. Herramienta de compresión PDF gratuita con protección de privacidad. Algoritmos de compresión inteligentes.',
  
  // Upload section (like rotate had)
  upload: {
    title: 'Comprimir archivo PDF',
    description: 'Reducir el tamaño del archivo manteniendo la calidad',
    supportedFormats: 'Archivos PDF hasta 100MB',
    selectedFile: 'Archivo seleccionado',
    readyToCompress: 'Listo para comprimir',
    removeFile: 'Eliminar archivo',
    compressPdfFile: 'Comprimir archivo PDF 🗜️'
  },
  
  // Upload zone translations (for CompressPDFPage)
  uploadTitle: 'Comprimir archivo PDF',
  uploadSubtitle: 'Reducir el tamaño del archivo manteniendo la calidad', 
  supportedFormats: 'Archivos PDF hasta 100MB',
  selectedFile: 'Archivo seleccionado',
  readyToCompress: 'Listo para comprimir',
  removeFile: 'Eliminar archivo',
  compressPdfFile: 'Comprimir archivo PDF 🗜️',
  fileSizeUnit: 'MB',
  
  // Results section (like rotate had)
  results: {
    successTitle: '¡Compresión PDF completada!',
    downloadCompressed: 'Descargar PDF comprimido',
    download: 'Descargar',
    compressAnother: 'Comprimir otro PDF',
    sizeReduced: 'Tamaño reducido de',
    to: 'a',
    readyForDownload: 'Su PDF comprimido está listo para descargar'
  },
  
  // Modern tool-specific section (comprehensive like rotate.tool)
  toolTitle: 'Herramienta de compresión PDF',
  noFileTitle: 'Ningún archivo seleccionado',
  noFileMessage: 'Por favor seleccione un archivo PDF para comprimir',
  backButton: 'Atrás',
  closeButton: 'Cerrar',
  currentSize: 'Tamaño actual',
  estimatedSavings: 'ahorro estimado',
  forecastedSaving: 'estimado basado en análisis del archivo',
  
  trustIndicators: {
    privateProcessing: 'Procesamiento privado',
    intelligentCompression: 'Compresión inteligente'
  },
  
  qualitySettings: {
    title: 'Configuración de calidad',
    subtitle: 'Elija el equilibrio correcto entre calidad y tamaño de archivo',
    qualityLevel: 'Nivel de calidad',
    smallerSize: 'Tamaño más pequeño',
    betterQuality: 'Mejor calidad',
    qualityLabels: {
      maxCompression: 'Compresión máxima',
      highCompression: 'Compresión alta',
      mediumCompression: 'Compresión media', 
      optimal: 'Óptimo',
      highQuality: 'Alta calidad'
    }
  },
  
  previewCards: {
    maxCompression: {
      title: 'Compresión máxima',
      subtitle: 'Tamaño de archivo más pequeño'
    },
    optimal: {
      title: 'Equilibrio óptimo',
      subtitle: 'Mejor relación calidad/tamaño'
    },
    highQuality: {
      title: 'Alta calidad',
      subtitle: 'Mejor calidad visual'
    }
  },
  
  advancedSettings: {
    title: 'Configuración avanzada',
    subtitle: 'Ajustar finamente las opciones de compresión',
    compressImages: {
      title: 'Comprimir imágenes',
      description: 'Optimizar imágenes para un tamaño de archivo más pequeño'
    },
    removeMetadata: {
      title: 'Eliminar metadatos',
      description: 'Eliminar propiedades del documento y comentarios'
    },
    optimizeForWeb: {
      title: 'Optimizar para web',
      description: 'Preparar PDF para visualización rápida en línea'
    }
  },
  
  processing: {
    title: 'Comprimiendo su PDF',
    startingMessage: 'Iniciando proceso de compresión...',
    defaultMessage: 'Procesando su archivo PDF...',
    progressLabel: 'Progreso'
  },
  
  errors: {
    selectFile: 'Por favor seleccione un archivo PDF para comprimir',
    compressionError: 'Error al comprimir el archivo PDF',
    unknownError: 'Ocurrió un error inesperado',
    processingError: 'Error de procesamiento'
  },
  
  infoBox: {
    title: 'Cómo funciona',
    description: 'Nuestros algoritmos de compresión inteligentes analizan su PDF y aplican configuraciones óptimas para reducir el tamaño del archivo mientras preservan la calidad visual. Sus archivos se procesan localmente para máxima privacidad.'
  },
  
  actions: {
    compress: 'Comprimir PDF',
    compressing: 'Comprimiendo...',
    cancel: 'Cancelar',
    back: 'Atrás'
  },
  
  // Legacy compatibility keys (for old CompressionTool)
  starting: 'Iniciando proceso de compresión...',
  failed: 'Error al comprimir el archivo PDF',
  fileToCompress: 'Archivo a comprimir',
  smaller: 'más pequeño',
  estimated: 'estimado',
  settings: {
    title: 'Configuración de compresión',
    qualityLevel: 'Nivel de calidad',
    smallerFile: 'Archivo más pequeño',
    betterQuality: 'Mejor calidad',
    compressImages: 'Comprimir imágenes',
    removeMetadata: 'Eliminar metadatos',
    optimizeForWeb: 'Optimizar para web'
  },
  howItWorks: 'Cómo funciona',
  howItWorksDescription: 'Los algoritmos inteligentes reducen el tamaño del archivo optimizando imágenes, fuentes y eliminando datos innecesarios',
  compressing: 'Comprimiendo PDF...',
  
  // Additional results keys used by CompressPDFPage
  successTitle: '¡Compresión PDF completada!',
  downloadCompressed: 'Descargar PDF comprimido',
  download: 'Descargar',
  compressAnother: 'Comprimir otro PDF',
  sizeReduced: 'Tamaño reducido de',
  to: 'a',
  readyForDownload: 'Su PDF comprimido está listo para descargar'
};