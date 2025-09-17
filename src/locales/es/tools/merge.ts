/**
 * Merge PDF tool translations for ES language
 * Contains: page metadata, upload zone, file management, processing messages
 */

export const merge = {
  // Basic properties for tools grid
  title: 'Combinar PDFs',
  description: 'Combinar múltiples archivos PDF en un solo documento',
  
  // Page metadata (SEO)
  pageTitle: 'Combinar archivos PDF gratis - LocalPDF',
  pageDescription: 'Combina múltiples archivos PDF en un solo documento gratis. Combinación rápida, segura y privada de PDF en tu navegador. Sin subidas, sin registro requerido.',
  
  // Upload zone translations
  uploadTitle: 'Subir archivos PDF para combinar',
  uploadSubtitle: 'Combinar múltiples archivos PDF en un solo documento',
  supportedFormats: 'Archivos PDF hasta 100MB cada uno',
  
  // File management
  selectedFiles: 'Archivos seleccionados',
  readyToMerge: 'Listo para combinar',
  removeFile: 'Eliminar archivo',
  fileSizeUnit: 'MB',
  
  // Processing buttons and states
  buttons: {
    startMerging: 'Combinar {count} Archivos 📄',
    merging: 'Combinando archivos...',
    download: 'Descargar PDF combinado',
    backToTools: 'Volver a herramientas',
    selectMoreFiles: 'Seleccionar más archivos'
  },
  
  // Processing messages
  messages: {
    processing: 'Combinando tus archivos PDF...',
    progress: 'Procesando archivo {current} de {total}',
    success: '¡Archivos PDF combinados exitosamente!',
    downloadReady: 'Tu PDF combinado está listo para descargar',
    error: 'Error al combinar archivos PDF',
    noFilesSelected: 'Por favor selecciona al menos 2 archivos PDF para combinar',
    singleFileWarning: 'Por favor selecciona múltiples archivos para combinar'
  },
  
  // ModernMergeTool specific translations
  toolTitle: 'Combinar archivos PDF',
  fileCount: {
    single: 'archivo',
    few: 'archivos', 
    many: 'archivos'
  },
  processing: 'Combinando archivos...',
  processingTitle: 'Combinación en progreso',
  processingDescription: 'Procesando archivos...',
  orderTitle: 'Orden de archivos',
  orderDescription: 'Usa las flechas para cambiar el orden',
  trustIndicators: {
    private: 'Procesamiento privado',
    quality: 'Alta calidad'
  },
  controls: {
    moveUp: 'Mover hacia arriba',
    moveDown: 'Mover hacia abajo'
  },
  actions: {
    merge: 'Combinar {count} {fileWord}',
    merging: 'Procesando...',
    cancel: 'Cancelar',
    close: 'Cerrar'
  },
  progress: 'Progreso',
  
  // Tool-specific content
  howItWorks: {
    title: 'Cómo funciona la combinación de PDF',
    description: 'Nuestra herramienta de combinación une múltiples documentos PDF preservando la calidad y el formato',
    steps: [
      'Sube múltiples archivos PDF desde tu dispositivo',
      'Organiza los archivos en tu orden preferido',
      'Haz clic en combinar para unir todos los documentos',
      'Descarga tu archivo PDF unificado'
    ]
  },
  
  // Benefits specific to merge tool
  benefits: {
    title: '¿Por qué usar nuestro combinador de PDF?',
    features: [
      'Preservar la calidad y formato original',
      'Mantener metadatos y marcadores del documento',
      'Sin límites de tamaño o cantidad de archivos',
      'Procesamiento instantáneo en tu navegador'
    ]
  },
  
  // Error handling (consolidated)
  errors: {
    minFiles: 'Selecciona al menos 2 archivos para combinar',
    processingError: 'Error al procesar archivos',
    unknownError: 'Error desconocido',
    errorTitle: 'Error de procesamiento',
    invalidFile: 'Formato de archivo PDF inválido',
    fileTooLarge: 'El tamaño del archivo excede el límite de 100MB',
    processingFailed: 'Error al procesar el archivo PDF',
    noFilesUploaded: 'No hay archivos subidos para combinar'
  }
};