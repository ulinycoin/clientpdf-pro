/**
 * Extract Text tool translations for ES language
 * Contains: page metadata, upload zone, tool interface, options, progress, results
 * Complete localization following established methodology
 */

export const extractText = {
  // Basic properties for tools grid
  title: 'Extraer texto',
  description: 'Extraer contenido de texto de archivos PDF',
  
  // Page metadata (SEO)
  pageTitle: 'Extraer texto de PDF gratis - LocalPDF',
  pageDescription: 'Extrae contenido de texto de archivos PDF gratis. Obtén texto limpio con formato inteligente.',
  
  // Upload section (for ExtractTextPDFPage)
  uploadTitle: 'Extraer texto de PDF',
  uploadSubtitle: 'Extrae todo el contenido de texto de documentos PDF con un clic',
  supportedFormats: 'Archivos PDF hasta 100MB',
  selectedFile: 'Archivo seleccionado',
  readyToExtract: 'Listo para extracción de texto',
  removeFile: 'Eliminar archivo',
  extractTextButton: 'Extraer texto 📄',
  
  // Main ExtractTextTool interface
  tool: {
    title: 'Herramienta de extracción de texto',
    description: 'Configure las opciones de extracción de texto para su documento PDF',
    fileToExtract: 'Archivo para extracción de texto',
    
    // Extraction options section
    extractionOptions: 'Opciones de extracción',
    smartFormatting: 'Formato inteligente',
    smartFormattingDesc: 'Mejora automáticamente la estructura y legibilidad del texto extraído',
    
    formattingLevel: 'Nivel de formato',
    levels: {
      minimal: {
        title: 'Mínimo',
        desc: 'Limpieza básica de espacios adicionales y saltos de línea'
      },
      standard: {
        title: 'Estándar',
        desc: 'Restauración de párrafos y estructura básica del documento'
      },
      advanced: {
        title: 'Avanzado',
        desc: 'Restauración inteligente de títulos, listas y formato'
      }
    },
    
    includeMetadata: 'Incluir metadatos del documento',
    preserveFormatting: 'Preservar formato original',
    pageRange: 'Extraer solo páginas específicas',
    
    pageRangeFields: {
      startPage: 'Página inicial',
      endPage: 'Página final',
      note: 'Dejar vacío para extraer todo el documento'
    },
    
    // Progress states
    extracting: 'Extrayendo texto ({progress}%)',
    
    // Success results section
    success: {
      title: '¡Texto extraído exitosamente!',
      pagesProcessed: 'Páginas procesadas: {count}',
      textLength: 'Caracteres extraídos: {length}',
      documentTitle: 'Título del documento: {title}',
      author: 'Autor: {author}',
      smartFormattingApplied: 'Formato inteligente aplicado: {level}',
      fileDownloaded: 'Archivo descargado automáticamente',
      noTextWarning: 'No se encontró texto extraíble en el documento',
      
      // Before/after comparison
      comparisonPreview: 'Vista previa de mejoras',
      before: 'Antes del procesamiento',
      after: 'Después del procesamiento',
      notice: 'Mostrando los primeros 200 caracteres para vista previa',
      
      // Regular text preview
      textPreview: 'Vista previa del texto'
    },
    
    // Error handling
    errors: {
      noFileSelected: 'Por favor selecciona un archivo PDF para extracción de texto'
    },
    
    // Info and privacy sections
    infoBox: {
      title: 'Extracción inteligente de texto',
      description: 'Nuestros algoritmos detectan y preservan automáticamente la estructura del documento para máxima legibilidad.'
    },
    
    privacy: {
      title: 'Protección de privacidad',
      description: 'Tus archivos se procesan localmente en el navegador. No se envían datos a servidores.'
    },
    
    // Button actions
    buttons: {
      extractText: 'Extraer texto',
      extracting: 'Extrayendo...'
    }
  },
  
  // Legacy compatibility
  fileSizeUnit: 'MB',
  backToTools: 'Volver a herramientas',
  buttons: {
    extractText: 'Extraer texto 📄',
    extracting: 'Extrayendo texto...',
    download: 'Descargar archivo de texto',
    backToTools: 'Volver a herramientas'
  },
  
  messages: {
    processing: 'Extrayendo texto de tu PDF...',
    progress: 'Procesando página {current} de {total}',
    success: '¡Extracción de texto completada exitosamente!',
    downloadReady: 'Tu archivo de texto está listo para descargar',
    error: 'Error al extraer texto del PDF',
    noFileSelected: 'Por favor selecciona un archivo PDF para extracción de texto',
    noTextFound: 'No se encontró texto en este archivo PDF'
  }
};