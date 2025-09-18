/**
 * Extract Images from PDF tool translations for ES language
 * Contains: page metadata, upload zone, tool interface, options, progress, results
 * Complete localization following established methodology
 */

export const extractImagesFromPdf = {
  // Basic properties for tools grid
  title: 'Extraer imágenes del PDF',
  description: 'Extraer todas las imágenes de documentos PDF en calidad original',
  
  // Page metadata (SEO)
  pageTitle: 'Extraer imágenes de PDF gratis - LocalPDF',
  pageDescription: 'Extrae todas las imágenes de archivos PDF gratis. Descarga imágenes en calidad original con selección por lotes y opciones de filtrado.',
  
  // Upload section (for ExtractImagesFromPDFPage)
  upload: {
    title: 'Extraer imágenes de PDF',
    subtitle: 'Extraer todas las imágenes incrustadas de documentos PDF con opciones avanzadas de filtrado',
    supportedFormats: 'Archivos PDF hasta 100MB',
    dragAndDrop: 'Arrastra tu archivo PDF aquí o haz clic para explorar'
  },
  
  // Main ExtractImagesFromPdfTool interface
  uploadPrompt: 'Arrastra tu archivo PDF aquí o haz clic para explorar',
  uploadSubtitle: 'Extraer todas las imágenes de tu documento PDF',
  
  // Settings section
  settings: {
    pageSelection: 'Selección de páginas',
    allPages: 'Todas las páginas',
    specificPages: 'Páginas específicas',
    pageRange: 'Rango de páginas',
    minSize: 'Tamaño mínimo de imagen',
    minSizeDescription: 'Solo extraer imágenes más grandes que este tamaño (píxeles)',
    outputFormat: 'Formato de salida',
    original: 'Mantener formato original',
    png: 'Convertir a PNG',
    jpeg: 'Convertir a JPEG',
    jpegQuality: 'Calidad JPEG',
    deduplicateImages: 'Eliminar imágenes duplicadas',
    includeVectorImages: 'Incluir imágenes vectoriales'
  },
  
  // Progress section
  progress: {
    preparing: 'Cargando documento PDF...',
    extracting: 'Extrayendo imágenes de la página {current} de {total}...',
    processing: 'Procesando y filtrando imágenes...',
    finalizing: 'Finalizando extracción...',
    complete: '¡Extracción completada!'
  },
  
  // Results section
  results: {
    imagesFound: 'imágenes encontradas',
    totalSize: 'Tamaño total',
    selectedCount: '{selected} de {total} seleccionadas',
    selectAll: 'Seleccionar todo',
    deselectAll: 'Deseleccionar todo',
    downloadSelected: 'Descargar seleccionadas',
    downloadAll: 'Descargar todo como ZIP',
    imageInfo: 'Página {pageNumber} • {width}×{height} • {size} • {format}',
    duplicatesRemoved: '{count} duplicados eliminados',
    gridView: 'Vista de cuadrícula',
    listView: 'Vista de lista'
  },
  
  // Success messages
  success: {
    title: '¡Imágenes extraídas exitosamente!',
    description: 'Se encontraron {count} imágenes con un tamaño total de {size} MB',
    extractedInfo: '{count} imágenes extraídas de {pages} páginas'
  },
  
  // Error handling
  errors: {
    noImages: 'No se encontraron imágenes en este PDF',
    noImagesDescription: 'Este PDF no contiene imágenes extraíbles que coincidan con tus criterios.',
    extractionFailed: 'Falló la extracción de imágenes',
    loadingFailed: 'Falló la carga del documento PDF',
    noFileSelected: 'Por favor selecciona un archivo PDF para extraer imágenes',
    processingError: 'Ocurrió un error al procesar el PDF'
  },
  
  // Buttons
  buttons: {
    extractImages: 'Extraer imágenes',
    extracting: 'Extrayendo imágenes...',
    extractAnother: 'Extraer de otro PDF',
    tryAgain: 'Intentar otro archivo',
    showSettings: 'Mostrar configuración',
    hideSettings: 'Ocultar configuración'
  },
  
  // Quick steps for StandardToolPageTemplate
  quickSteps: {
    step1: {
      title: 'Subir PDF',
      description: 'Selecciona o arrastra tu archivo PDF para comenzar la extracción de imágenes'
    },
    step2: {
      title: 'Configurar ajustes',
      description: 'Establece el tamaño mínimo de imagen, formato de salida y otras preferencias de extracción'
    },
    step3: {
      title: 'Descargar imágenes',
      description: 'Previsualiza, selecciona y descarga imágenes extraídas individualmente o como ZIP'
    }
  },
  
  // Benefits for StandardToolPageTemplate
  benefits: {
    privacy: {
      title: 'Privacidad completa',
      description: 'Todo el procesamiento ocurre localmente en tu navegador. No se suben archivos a servidores.'
    },
    quality: {
      title: 'Calidad original',
      description: 'Extrae imágenes en su resolución y formato original sin pérdida de calidad.'
    },
    formats: {
      title: 'Múltiples formatos',
      description: 'Soporte para JPEG, PNG y otros formatos de imagen con opciones de conversión.'
    },
    batch: {
      title: 'Operaciones por lotes',
      description: 'Selecciona múltiples imágenes y descárgalas como un archivo ZIP conveniente.'
    }
  },
  
  // Legacy compatibility for existing components
  fileSelected: 'Archivo seleccionado',
  readyToExtract: 'Listo para extraer imágenes',
  removeFile: 'Eliminar archivo',
  backToTools: 'Volver a herramientas',
  processing: 'Extrayendo imágenes de tu PDF...',
  downloadReady: 'Tus imágenes están listas para descargar'
};