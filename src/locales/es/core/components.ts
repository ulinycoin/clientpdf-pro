/**
 * Component translations for ES language
 * Contains: reusable UI components like upload zones, file cards, etc.
 */

export const components = {
  modernUploadZone: {
    dropActive: 'Suelta los archivos aquí',
    selectFiles: 'Seleccionar archivos',
    uploadFiles: 'Subir archivos',
    private: '100% Privado',
    instantProcessing: 'Procesamiento instantáneo',
    fileSizeMB: 'MB',
    accessibility: {
      selectFiles: 'Selecciona archivos para subir',
    },
  },
  fileUploadZone: {
    dropActive: 'Suelta los archivos aquí',
    chooseFiles: 'Elegir archivos PDF',
    dragAndDrop: 'Arrastra y suelta archivos aquí o haz clic para seleccionar',
    maxFileSize: 'Máx. {size} por archivo',
    selectFiles: 'Seleccionar archivos',
    trustFeatures: {
      private: '100% Privado',
      fast: 'Rápido',
      free: 'Gratis',
    },
    trustMessage: 'Los archivos nunca salen de tu dispositivo • El procesamiento ocurre localmente en el navegador',
    alerts: {
      unsupportedFiles: '{count} archivo(s) omitidos debido a formato no compatible. Formatos compatibles: {formats}',
      fileLimit: 'Solo se seleccionaron los primeros {count} archivos.',
    },
    accessibility: {
      uploadArea: 'Área de carga de archivos - haz clic para seleccionar archivos o arrastra y suelta',
      selectFiles: 'Selecciona archivos para cargar',
    },
  },
  relatedTools: {
    title: 'Herramientas PDF relacionadas',
    subtitle: 'También podrías necesitar:',
    viewAllTools: 'Ver todas las herramientas PDF',
    toolNames: {
      merge: 'Combinar PDFs',
      split: 'Dividir PDF',
      compress: 'Comprimir PDF',
      addText: 'Añadir texto',
      watermark: 'Añadir marca de agua',
      rotate: 'Rotar páginas',
      extractPages: 'Extraer páginas',
      extractText: 'Extraer texto',
      pdfToImage: 'PDF a imágenes',
      'word-to-pdf': 'Word a PDF',
      'excel-to-pdf': 'Excel a PDF',
      'images-to-pdf': 'Imágenes a PDF',
    },
    toolDescriptions: {
      merge: 'Combinar múltiples archivos PDF en uno',
      split: 'Dividir PDF en archivos separados',
      compress: 'Reducir el tamaño del archivo PDF',
      addText: 'Añadir texto y anotaciones',
      watermark: 'Añadir marcas de agua para proteger PDFs',
      rotate: 'Rotar páginas PDF',
      extractPages: 'Extraer páginas específicas',
      extractText: 'Obtener contenido de texto de PDFs',
      pdfToImage: 'Convertir PDF a imágenes',
      'word-to-pdf': 'Convertir documentos Word a PDF',
      'excel-to-pdf': 'Convertir hojas de Excel a PDF',
      'images-to-pdf': 'Convertir imágenes a formato PDF',
    },
  }
};