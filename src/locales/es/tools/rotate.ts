/**
 * Rotate tool translations for ES language
 */

export const rotate = {
  // Basic properties for tools grid
  title: 'Rotar páginas',
  description: 'Rotar páginas 90, 180 o 270 grados',
  
  // Page metadata (SEO)
  pageTitle: 'Rotar páginas PDF gratis - LocalPDF',
  pageDescription: 'Rote páginas PDF 90°, 180° o 270°. Rotación PDF rápida y segura en su navegador. 100% privado.',
  
  // Upload zone translations
  uploadTitle: 'Rotar páginas PDF',
  uploadSubtitle: 'Rotar páginas a la orientación correcta',
  supportedFormats: 'Archivos PDF hasta 100MB',
  
  // Upload section - for selected files and actions
  upload: {
    title: 'Rotar páginas PDF',
    description: 'Rotar páginas a la orientación correcta',
    supportedFormats: 'Archivos PDF hasta 100MB',
    selectedFile: 'Archivo seleccionado ({count})',
    readyToRotate: 'Listo para rotar',
    removeFile: 'Eliminar archivo',
    startRotating: 'Rotar páginas 🔄'
  },
  
  // Results section - for completed operations
  results: {
    successTitle: '¡Páginas rotadas exitosamente!',
    successDescription: 'Su archivo PDF está listo para descargar',
    downloadTitle: 'Descargar PDF rotado',
    rotateAnother: 'Rotar otro archivo',
    fileSizeReduced: 'Archivo listo'
  },
  
  // Legacy structure for backwards compatibility
  selectedFile: 'Archivo seleccionado',
  readyToRotate: 'Listo para rotar',
  removeFile: 'Eliminar archivo',
  fileSizeUnit: 'MB',
  
  buttons: {
    startRotating: 'Rotar páginas 🔄',
    processing: 'Rotando páginas...',
    download: 'Descargar PDF rotado'
  },
  
  messages: {
    processing: 'Rotando sus páginas PDF...',
    success: '¡Páginas rotadas exitosamente!',
    error: 'Error al rotar las páginas PDF'
  },

  // ModernRotateTool translations
  tool: {
    fileSizeUnit: 'MB',
    pageCount: '{count} páginas',
    fileNotSelected: 'Ningún archivo seleccionado',
    fileNotSelectedDescription: 'Por favor seleccione un archivo PDF para rotar',
    toolTitle: 'Rotar páginas PDF',
  
    
    trustIndicators: {
      private: 'Procesamiento privado',
      quality: 'Alta calidad'
    },
    
    rotationAngle: {
      title: 'Seleccionar ángulo de rotación',
      description: 'Elija cuántos grados rotar las páginas'
    },
    
    rotationOptions: {
      clockwise: {
        label: '90° sentido horario',
        description: 'Rotar 90 grados en sentido horario'
      },
      flip: {
        label: '180° voltear',
        description: 'Voltear 180 grados'
      },
      counterclockwise: {
        label: '270° sentido antihorario',
        description: 'Rotar 270 grados en sentido antihorario'
      }
    },
  
    
    pageSelection: {
      title: 'Selección de páginas',
      description: 'Elija qué páginas rotar',
      allPages: {
        label: 'Todas las páginas',
        description: 'Rotar todas las páginas del documento',
        descriptionWithCount: 'Rotar todas las {count} páginas'
      },
      specificPages: {
        label: 'Páginas específicas',
        description: 'Seleccionar páginas específicas para rotar'
      }
    },
    
    specificPages: {
      inputLabel: 'Números de páginas',
      placeholder: 'ej: 1, 3, 5-8',
      helpText: 'Ingrese números de páginas separados por comas o rangos con guiones'
    },
  
    
    pageOverview: {
      title: 'Vista general de páginas',
      description: 'Vista previa de orientaciones de páginas en el documento',
      pageTooltip: 'Página {pageNumber}: {orientation}',
      portrait: 'vertical',
      landscape: 'horizontal',
      portraitOrientation: 'Páginas verticales',
      landscapeOrientation: 'Páginas horizontales'
    },
    
    processing: {
      title: 'Rotando páginas...',
      analyzing: 'Analizando documento...',
      rotating: 'Rotando páginas...'
    },
    
    errors: {
      invalidPageNumbers: 'Números de páginas inválidos',
      rotationFailed: 'Fallo en la rotación',
      unknownError: 'Error desconocido',
      processingError: 'Error de procesamiento'
    },
    
    infoBox: {
      title: 'Información útil',
      description: 'Las páginas PDF serán rotadas manteniendo la calidad y todos los elementos del documento.'
    },
    
    buttons: {
      rotate: 'Rotar {degrees}°',
      processing: 'Procesando...'
    }
  }
};