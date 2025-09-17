/**
 * Extract Pages tool translations for ES language
 * Contains: page metadata, upload zone, tool interface, selection modes, progress, results
 * Complete localization following established methodology
 */

export const extractPages = {
  // Basic properties for tools grid
  title: 'Extraer páginas',
  description: 'Extraer páginas específicas en un nuevo documento',
  
  // Page metadata (SEO)
  pageTitle: 'Extraer páginas PDF gratis - LocalPDF',
  pageDescription: 'Extrae páginas específicas de archivos PDF. Crea nuevos PDF a partir de rangos de páginas seleccionados.',
  
  // Upload section (for ExtractPagesPDFPage)
  uploadTitle: 'Extraer páginas de PDF',
  uploadSubtitle: 'Selecciona páginas específicas del documento PDF para crear un nuevo archivo',
  supportedFormats: 'Archivos PDF hasta 100MB',
  selectedFile: 'Archivo seleccionado',
  readyToExtract: 'Listo para extraer páginas',
  removeFile: 'Eliminar archivo',
  extractPagesButton: 'Extraer páginas 📑',
  
  // Main ExtractPagesTool interface
  tool: {
    title: 'Extraer páginas PDF',
    titleLoading: 'Extraer páginas PDF',
    description: 'Seleccionar páginas para extraer de:',
    fileInfo: {
      totalPages: 'Total de páginas:',
      selected: 'Seleccionadas:',
      loadingFile: 'Cargando archivo PDF...',
      noFileAvailable: 'No hay archivo PDF disponible para extracción de páginas.',
      goBack: 'Volver'
    },
    
    // Selection modes
    selectionModes: {
      individual: 'Individual',
      range: 'Rango',
      all: 'Todas',
      custom: 'Personalizado'
    },
    
    // Selection controls
    individual: {
      description: 'Haz clic en los números de página de abajo para seleccionar páginas individuales:',
      selected: 'Seleccionadas:',
      clearAll: 'Limpiar todo'
    },
    
    range: {
      from: 'Desde:',
      to: 'Hasta:',
      selectRange: 'Seleccionar rango',
      clear: 'Limpiar'
    },
    
    all: {
      description: 'Extraer todas las {count} páginas (copiar documento completo)',
      selectAllPages: 'Seleccionar todas las páginas',
      clear: 'Limpiar'
    },
    
    custom: {
      label: 'Rango de páginas (ej. "1-5, 8, 10-12"):',
      placeholder: '1-5, 8, 10-12',
      parseRange: 'Analizar rango',
      selected: 'Seleccionadas:',
      clearAll: 'Limpiar todo'
    },
    
    // Page grid
    pagesPreview: 'Vista previa de páginas',
    pageTooltip: 'Página {number}',
    pageSelected: 'Página {number} (seleccionada)',
    
    // Progress and results
    progress: {
      extracting: 'Extrayendo páginas...',
      percentage: '{progress}%'
    },
    
    success: {
      title: '¡Páginas extraídas exitosamente!',
      extracted: 'Extraídas {extracted} de {total} páginas',
      timing: 'en {time}s'
    },
    
    // Action buttons
    actions: {
      clearSelection: 'Limpiar selección',
      extractPages: 'Extraer páginas',
      extracting: 'Extrayendo...',
      readyToExtract: 'Listo para extraer {count} {pages}'
    },
    
    // Tips section
    tips: {
      title: '💡 Consejos para extracción de páginas:',
      items: [
        'Usa el modo "Rango" para páginas continuas (ej. páginas 1-10)',
        'Usa el modo "Personalizado" para selecciones complejas (ej. "1-5, 8, 10-12")',
        'Haz clic en números de página individuales para alternar selección',
        'Todo el formato y calidad original se preservará'
      ]
    },
    
    // Error handling
    errors: {
      noFileSelected: 'Por favor selecciona un archivo PDF para extracción de páginas'
    }
  },
  
  // Legacy compatibility
  backToTools: 'Volver a herramientas',
  fileSizeUnit: 'MB',
  buttons: {
    startExtracting: 'Extraer páginas 📑',
    processing: 'Extrayendo páginas...',
    download: 'Descargar páginas extraídas',
    backToTools: 'Volver a herramientas'
  },
  
  messages: {
    processing: 'Extrayendo páginas de tu PDF...',
    success: '¡Páginas extraídas exitosamente!',
    error: 'Error al extraer páginas'
  }
};