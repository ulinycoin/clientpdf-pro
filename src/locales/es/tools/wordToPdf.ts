/**
 * Word to PDF tool translations for ES language
 * Contains: page metadata, upload zone, tool interface, settings, processing messages
 */

export const wordToPdf = {
  // Basic properties for tools grid
  title: 'Word a PDF',
  description: 'Convertir documentos Word a formato PDF',
  
  // Page metadata (SEO)
  pageTitle: 'Convertir Word a PDF gratis - LocalPDF',
  pageDescription: 'Convierte documentos Word a archivos PDF con preservación perfecta del formato. Soporta archivos DOCX, completamente privado y seguro.',
  
  // Upload zone translations  
  uploadTitle: 'Convertir Word a PDF',
  uploadSubtitle: 'Subir documentos DOCX y convertirlos a formato PDF',
  supportedFormats: 'Archivos DOCX hasta 100MB',
  
  // Tool interface translations
  tool: {
    title: 'Convertidor de Word a PDF',
    uploadTitle: 'Seleccionar documento Word',
    uploadSubtitle: 'Elige un archivo DOCX para convertir a PDF',
    supportedFormats: 'Archivos DOCX soportados (hasta 100MB)',
    
    compatibility: {
      msWord: 'Microsoft Word 2007+ (.docx)',
      googleDocs: 'Google Docs exportado como DOCX',
      docWarning: 'Los archivos .doc antiguos no son soportados - use .docx',
      localProcessing: 'Procesado localmente en tu navegador'
    },
    
    preview: {
      title: 'Vista previa PDF',
      description: 'Convierte tu documento para ver la vista previa PDF',
      generating: 'Generando vista previa PDF...',
      waitMessage: 'Por favor espera mientras preparamos tu documento',
      placeholder: 'La vista previa PDF aparecerá aquí',
      uploadPrompt: 'Sube un documento Word para comenzar',
      error: 'Error al generar la vista previa',
      errorTitle: 'Error de vista previa',
      tryAgain: 'Intentar de nuevo',
      zoomOut: 'Alejar zoom',
      zoomIn: 'Acercar zoom'
    },
    
    settings: {
      title: 'Configuración de conversión',
      hide: 'Ocultar',
      show: 'Mostrar',
      pageSetup: {
        title: 'Configuración de página',
        pageSize: 'Tamaño de página',
        pageSizeOptions: {
          a4: 'A4 (210 × 297 mm)',
          letter: 'Carta (8,5 × 11 pulg)',
          a3: 'A3 (297 × 420 mm)'
        }
      },
      margins: {
        title: 'Márgenes (mm)',
        top: 'Superior',
        right: 'Derecha',
        bottom: 'Inferior',
        left: 'Izquierda'
      },
      typography: {
        title: 'Tipografía',
        fontSize: 'Tamaño de fuente',
        fontSizeOptions: {
          small: '10pt (Pequeño)',
          normal11: '11pt',
          normal12: '12pt (Normal)',
          large: '14pt (Grande)',
          extraLarge: '16pt (Extra grande)'
        }
      },
      advanced: {
        title: 'Opciones avanzadas',
        embedFonts: 'Incrustar fuentes para mejor compatibilidad',
        compression: 'Comprimir PDF (tamaño de archivo menor)',
        resetDefaults: 'Restablecer valores predeterminados'
      }
    },
    
    fileInfo: {
      title: 'Información del documento',
      fileName: 'Nombre del archivo',
      fileSize: 'Tamaño del archivo',
      fileType: 'Tipo de archivo',
      microsoftWord: 'Microsoft Word',
      privacyNote: 'Tu documento se procesa localmente - nunca se sube'
    },
    
    buttons: {
      convertToPdf: 'Convertir a PDF',
      converting: 'Convirtiendo...',
      download: 'Descargar PDF',
      chooseDifferent: 'Elegir archivo diferente',
      hidePreview: 'Ocultar vista previa',
      showPreview: 'Mostrar vista previa y descargar'
    },
    
    messages: {
      conversionCompleted: '¡Conversión completada!',
      conversionFailed: 'Conversión fallida',
      processing: 'Convirtiendo documento Word a PDF...',
      noFile: 'Ningún documento Word seleccionado',
      converting: 'Convirtiendo documento a PDF...',
      downloadHint: 'Después de la conversión, usa el botón Descargar en el panel de vista previa',
      processingDescription: 'Procesando tu documento Word...',
      progress: 'Progreso',
      unknownError: 'Ocurrió un error inesperado durante la conversión'
    }
  },
  
  // Processing buttons and states
  buttons: {
    startConverting: 'Convertir a PDF 📄',
    converting: 'Convirtiendo Word...',
    download: 'Descargar PDF',
    backToTools: 'Volver a herramientas',
    selectNewFile: 'Seleccionar nuevo archivo'
  },
  
  // Processing messages
  messages: {
    processing: 'Convirtiendo documento Word a PDF...',
    success: '¡Documento convertido exitosamente!',
    downloadReady: 'Tu PDF está listo para descargar',
    error: 'Error al convertir Word a PDF',
    noFileSelected: 'Por favor selecciona un documento Word para convertir',
    invalidFormat: 'Por favor selecciona un archivo DOCX válido'
  },
  
  // Tool-specific content
  howItWorks: {
    title: 'Cómo funciona la conversión de Word a PDF',
    description: 'Nuestro convertidor transforma documentos Word en archivos PDF profesionales manteniendo el formato',
    steps: [
      'Sube tu archivo DOCX desde tu dispositivo',
      'Ajusta la configuración de conversión si es necesario', 
      'Haz clic en convertir para generar el PDF',
      'Descarga tu archivo PDF convertido'
    ]
  },
  
  // Benefits specific to word to pdf tool
  benefits: {
    title: '¿Por qué usar nuestro convertidor Word a PDF?',
    features: [
      'Preservación perfecta del formato',
      'Mantiene estructura y estilo del documento',
      'Configuración de conversión ajustable',
      'Procesamiento instantáneo en tu navegador'
    ]
  },
  
  // Error handling
  errors: {
    invalidFile: 'Formato de documento Word inválido',
    fileTooLarge: 'El tamaño del archivo excede el límite de 100MB',
    conversionFailed: 'Error al convertir el documento',
    noFileUploaded: 'No se seleccionó ningún documento Word',
    corruptedFile: 'El documento parece estar corrupto',
    unsupportedVersion: 'Por favor usa el formato DOCX (Word 2007+)'
  }
};