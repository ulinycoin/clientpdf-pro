/**
 * Images to PDF tool translations for ES language
 * Contains: page metadata, upload zone, tool interface, settings, progress
 * Complete localization following established methodology
 */

export const imageToPdf = {
  // Basic properties for tools grid
  title: 'Imágenes a PDF',
  description: 'Combinar múltiples imágenes en un documento PDF',
  
  // Page metadata (SEO)
  pageTitle: 'Convertir Imágenes a PDF gratis - LocalPDF',
  pageDescription: 'Convierte múltiples imágenes a un solo documento PDF. Soporte para PNG, JPEG y más.',
  
  // Upload section (for ImageToPDFToolWrapper)
  uploadTitle: 'Imágenes a PDF',
  uploadSubtitle: 'Combinar múltiples imágenes en un documento PDF',
  supportedFormats: 'Archivos PNG, JPEG, GIF, BMP, TIFF',
  
  // Upload section (for ImageToPDFTool)
  uploadSection: {
    title: 'Subir imágenes',
    subtitle: 'Convertir múltiples imágenes en un solo documento PDF',
    supportedFormats: 'Archivos JPG, PNG, GIF, BMP, WebP hasta 50MB cada uno'
  },
  
  // Tool interface (for ImageToPDFTool)
  tool: {
    title: 'Convertir Imágenes a PDF',
    description: 'Transformar múltiples imágenes en un solo documento PDF',
    
    // File management
    selectedImages: 'Imágenes seleccionadas ({count})',
    clearAll: 'Limpiar todo',
    fileInfo: '{count} archivos • {size}',
    
    // PDF Settings
    pdfSettings: 'Configuración PDF',
    pageSize: 'Tamaño de página',
    pageSizeOptions: {
      a4: 'A4 (210 × 297 mm)',
      letter: 'Carta (8,5 × 11 pulg)',
      auto: 'Automático (ajustar imágenes)'
    },
    
    orientation: 'Orientación',
    orientationOptions: {
      portrait: 'Vertical',
      landscape: 'Horizontal'
    },
    
    imageLayout: 'Diseño de imagen',
    layoutOptions: {
      fitToPage: 'Ajustar a página',
      actualSize: 'Tamaño real',
      fitWidth: 'Ajustar ancho',
      fitHeight: 'Ajustar alto'
    },
    
    imageQuality: 'Calidad de imagen ({quality}%)',
    qualitySlider: {
      lowerSize: 'Menor tamaño',
      higherQuality: 'Mayor calidad'
    },
    
    pageMargin: 'Margen de página ({margin}")',
    marginSlider: {
      noMargin: 'Sin margen',
      twoInch: '2 pulgadas'
    },
    
    background: 'Fondo',
    backgroundOptions: {
      white: 'Blanco',
      lightGray: 'Gris claro',
      gray: 'Gris',
      black: 'Negro'
    },
    
    // Progress and conversion
    converting: 'Convirtiendo... {progress}%',
    
    // Buttons
    buttons: {
      selectImages: 'Seleccionar imágenes',
      reset: 'Restablecer',
      converting: 'Convirtiendo...',
      createPdf: 'Crear PDF'
    },
    
    // Help section
    help: {
      title: 'Consejos para la conversión de imágenes a PDF:',
      dragDrop: 'Simplemente arrastra las imágenes directamente al área de subida',
      formats: 'Soporta formatos JPG, PNG, GIF, BMP y WebP',
      layout: 'Elige cómo las imágenes se ajustan en las páginas PDF (ajustar a página, tamaño real, etc.)',
      quality: 'Ajusta la calidad de imagen para equilibrar el tamaño del archivo y la calidad visual',
      privacy: 'Todo el procesamiento ocurre localmente - tus imágenes nunca salen de tu dispositivo'
    }
  },
  
  // Legacy compatibility (from original structure)
  buttons: {
    startConverting: 'Convertir a PDF 📄',
    processing: 'Convirtiendo imágenes...',
    download: 'Descargar PDF'
  },
  
  messages: {
    processing: 'Convirtiendo imágenes a PDF...',
    success: '¡Imágenes convertidas exitosamente!',
    error: 'Error al convertir imágenes a PDF'
  }
};