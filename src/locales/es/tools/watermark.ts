/**
 * Watermark tool translations for ES language
 */

export const watermark = {
title: 'Añadir marca de agua',
description: 'Añadir marcas de agua de texto para proteger documentos',
pageTitle: 'Agregar Marca de Agua a PDF Gratis',
pageDescription: 'Proteja documentos PDF con marcas de agua de texto o gráficas. Rápido, seguro, sin cargas al servidor.',

// WatermarkTool translations
tool: {
  fileSizeUnit: 'MB',
  toolTitle: 'Añadir marca de agua',
  toolDescription: 'Añada marcas de agua de texto para proteger sus documentos',
  
  fileErrors: {
    noFileSelected: 'Por favor seleccione un archivo PDF para añadir marca de agua'
  },
  
  fileInfo: {
    pdfPreview: 'Vista previa PDF'
  },
  
  preview: {
    title: 'Vista previa',
    enterTextPrompt: 'Ingrese texto para vista previa',
    livePreviewDescription: '✨ Vista previa en vivo de la colocación y estilo de la marca de agua',
    previewWillAppear: '🖼️ La vista previa aparecerá cuando ingrese el texto de la marca de agua',
    pageLabel: 'Página 1'
  },
  
  settings: {
    title: 'Configuración de marca de agua',
    
    watermarkText: {
      label: 'Texto de marca de agua *',
      placeholder: 'Ingrese texto (ej: CONFIDENCIAL, BORRADOR)',
      charactersRemaining: 'caracteres'
    },
    
    fontFamily: {
      label: 'Familia de fuente'
    },
    
    fontRecommendation: {
      title: 'Recomendación de fuente',
      supportsCyrillic: '(Soporta cirílico)'
    },
    
    fontSupport: {
      supported: '✅ Esta fuente soporta su texto',
      mayNotSupport: '⚠️ Esta fuente puede no soportar todos los caracteres de su texto'
    },
    
    fontSize: {
      label: 'Tamaño de fuente',
      rangeLabels: {
        small: 'Pequeño (8px)',
        large: 'Grande (144px)'
      }
    },
    
    opacity: {
      label: 'Opacidad',
      rangeLabels: {
        transparent: 'Transparente (5%)',
        opaque: 'Opaco (100%)'
      }
    },
    
    rotation: {
      label: 'Rotación'
    },
    
    position: {
      label: 'Posición',
      positions: {
        center: 'Centro',
        topLeft: 'Arriba izquierda',
        topRight: 'Arriba derecha',
        bottomLeft: 'Abajo izquierda',
        bottomRight: 'Abajo derecha'
      }
    },
    
    textColor: {
      label: 'Color',
      colors: {
        gray: 'Gris',
        red: 'Rojo',
        blue: 'Azul',
        green: 'Verde',
        black: 'Negro',
        orange: 'Naranja'
      }
    }
  },
  
  progress: {
    addingWatermark: 'Añadiendo marca de agua...',
    completed: 'completado'
  },
  
  error: {
    title: 'Error'
  },
  
  privacy: {
    title: 'Privacidad y seguridad',
    description: 'Las marcas de agua se añaden localmente en su navegador. Los PDFs nunca abandonan su dispositivo, garantizando completa confidencialidad y seguridad.'
  },
  
  success: {
    title: '¡Marca de agua añadida exitosamente!',
    description: 'Su PDF con marca de agua ha sido descargado automáticamente.',
    downloadAgain: '📥 Descargar nuevamente'
  },
  
  actions: {
    processAnother: 'Procesar otro archivo',
    cancel: 'Cancelar',
    adding: 'Añadiendo marca de agua...',
    addWatermark: '💧 Añadir marca de agua'
  }
},

// WatermarkPDFPage translations
results: {
  successTitle: '¡Marca de agua añadida exitosamente!',
  successDescription: 'Documento PDF protegido con marca de agua',
  downloadTitle: 'Descargar archivo con marca de agua',
  readyToDownload: 'Listo para descargar',
  addAnotherWatermark: 'Añadir marca de agua a otro archivo'
},

upload: {
  title: 'Subir archivo PDF para añadir marca de agua',
  description: 'Protege tus documentos con marcas de agua de texto o imagen',
  supportedFormats: 'Archivos PDF',
  selectedFile: 'Archivo seleccionado ({count})',
  readyToWatermark: 'Listo para marca de agua',
  removeFile: 'Eliminar archivo',
  startWatermarking: 'Añadir marca de agua 💧'
}
};