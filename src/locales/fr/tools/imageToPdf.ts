/**
 * Images to PDF tool translations for FR language
 * Contains: page metadata, upload zone, tool interface, settings, progress
 * Complete localization following established methodology
 */

export const imageToPdf = {
  // Basic properties for tools grid
  title: 'Images vers PDF',
  description: 'Convertir plusieurs images en un seul document PDF',
  
  // Page metadata (SEO)
  pageTitle: 'Convertir Images en PDF gratuitement - LocalPDF',
  pageDescription: 'Convertissez plusieurs images en un seul document PDF. Support pour PNG, JPEG et plus.',
  
  // Upload section (for ImageToPDFToolWrapper)
  uploadTitle: 'Images vers PDF',
  uploadSubtitle: 'Combiner plusieurs images en un document PDF',
  supportedFormats: 'Fichiers PNG, JPEG, GIF, BMP, TIFF',
  
  // Upload section (for ImageToPDFTool)
  uploadSection: {
    title: 'Télécharger des images',
    subtitle: 'Convertir plusieurs images en un seul document PDF',
    supportedFormats: 'Fichiers JPG, PNG, GIF, BMP, WebP jusqu\'à 50MB chacun'
  },
  
  // Tool interface (for ImageToPDFTool)
  tool: {
    title: 'Convertir Images vers PDF',
    description: 'Transformer plusieurs images en un seul document PDF',
    
    // File management
    selectedImages: 'Images sélectionnées ({count})',
    clearAll: 'Tout effacer',
    fileInfo: '{count} fichiers • {size}',
    
    // PDF Settings
    pdfSettings: 'Paramètres PDF',
    pageSize: 'Taille de page',
    pageSizeOptions: {
      a4: 'A4 (210 × 297 mm)',
      letter: 'Lettre (8,5 × 11 po)',
      auto: 'Auto (ajuster aux images)'
    },
    
    orientation: 'Orientation',
    orientationOptions: {
      portrait: 'Portrait',
      landscape: 'Paysage'
    },
    
    imageLayout: 'Disposition d\'image',
    layoutOptions: {
      fitToPage: 'Ajuster à la page',
      actualSize: 'Taille réelle',
      fitWidth: 'Ajuster à la largeur',
      fitHeight: 'Ajuster à la hauteur'
    },
    
    imageQuality: 'Qualité d\'image ({quality}%)',
    qualitySlider: {
      lowerSize: 'Taille réduite',
      higherQuality: 'Qualité supérieure'
    },
    
    pageMargin: 'Marge de page ({margin}")',
    marginSlider: {
      noMargin: 'Aucune marge',
      twoInch: '2 pouces'
    },
    
    background: 'Arrière-plan',
    backgroundOptions: {
      white: 'Blanc',
      lightGray: 'Gris clair',
      gray: 'Gris',
      black: 'Noir'
    },
    
    // Progress and conversion
    converting: 'Conversion en cours... {progress}%',
    
    // Buttons
    buttons: {
      selectImages: 'Sélectionner les images',
      reset: 'Réinitialiser',
      converting: 'Conversion...',
      createPdf: 'Créer PDF'
    },
    
    // Help section
    help: {
      title: 'Conseils pour la conversion d\'images en PDF :',
      dragDrop: 'Glissez simplement les images directement dans la zone de téléchargement',
      formats: 'Prend en charge les formats JPG, PNG, GIF, BMP et WebP',
      layout: 'Choisissez comment les images s\'ajustent aux pages PDF (ajuster à la page, taille réelle, etc.)',
      quality: 'Ajustez la qualité d\'image pour équilibrer la taille du fichier et la qualité visuelle',
      privacy: 'Tout le traitement se fait localement - vos images ne quittent jamais votre appareil'
    }
  },
  
  // Legacy compatibility (from original structure)
  buttons: {
    startConverting: 'Convertir en PDF 📄',
    processing: 'Conversion des images...',
    download: 'Télécharger PDF'
  },
  
  messages: {
    processing: 'Conversion des images en PDF...',
    success: 'Images converties avec succès !',
    error: 'Échec de la conversion des images en PDF'
  }
};