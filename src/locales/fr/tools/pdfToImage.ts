/**
 * PDF to Image tool translations for FR language
 * Contains: page metadata, upload zone, tool interface, format options, progress, results
 * Complete localization following established methodology
 */

export const pdfToImage = {
  // Basic properties for tools grid
  title: 'PDF vers Images',
  description: 'Convertir les pages PDF en fichiers image (PNG, JPEG)',
  
  // Page metadata (SEO)
  pageTitle: 'Convertir PDF en Images gratuitement - LocalPDF',
  pageDescription: 'Convertissez les pages PDF en images PNG ou JPEG. Conversion PDF vers image de haute qualité.',
  
  // Upload zone (for PDFToImagePage)
  uploadTitle: 'Télécharger un fichier PDF pour le convertir en images',
  uploadSubtitle: 'Transformer les pages PDF en images JPG, PNG ou WebP de haute qualité',
  supportedFormats: 'Fichiers PDF',
  selectedFile: 'Fichier sélectionné ({count})',
  readyToConvert: 'Prêt à convertir en images',
  removeFile: 'Supprimer le fichier',
  fileSizeUnit: 'Mo',
  
  // Results section
  results: {
    successTitle: 'PDF converti avec succès en images !',
    successDescription: 'Toutes les pages PDF ont été converties en images',
    convertAnotherFile: 'Convertir un autre fichier',
    conversionComplete: 'Conversion terminée avec succès !',
    processingTitle: 'Conversion en cours',
    processingMessage: 'Traitement de la page {current} sur {total}',
    pagesConverted: 'Pages converties',
    format: 'Format',
    totalSize: 'Taille totale',
    processingTime: 'Temps de traitement',
    preview: 'Aperçu',
    downloadImages: 'Télécharger les Images',
    downloadAll: 'Télécharger toutes les images ({count})',
    downloadIndividual: 'Télécharger les images individuellement',
    pageLabel: 'Page {number}',
    seconds: 's'
  },
  
  // Tool interface (for PdfToImageTool)
  tool: {
    title: 'Convertisseur PDF vers Images',
    description: 'Convertir les pages PDF en fichiers image de haute qualité',
    noFileSelected: 'Aucun fichier PDF sélectionné',
    noFileDescription: 'Veuillez sélectionner un fichier PDF à convertir en images',
    selectFile: 'Sélectionner un fichier PDF',
    conversionSettingsTitle: 'Paramètres de conversion',
    
    // Format selection
    formatTitle: 'Format d\'image',
    formatDescription: 'Choisir le format de sortie des images',
    formats: {
      png: 'Haute qualité avec support de la transparence (fichiers plus volumineux)',
      jpeg: 'Tailles de fichier plus petites, bon pour les photos (pas de transparence)',
      jpg: 'JPG - Taille réduite, bonne qualité',
      webp: 'WebP - Format moderne, excellente compression'
    },
    
    // Quality settings
    qualityTitle: 'Qualité d\'image',
    qualityDescription: 'Équilibre entre taille de fichier et qualité',
    qualities: {
      low: 'Taille de fichier la plus petite, qualité basique',
      medium: 'Taille et qualité équilibrées',
      high: 'Haute qualité, fichiers plus volumineux',
      maximum: 'Qualité maximale, fichiers les plus volumineux'
    },
    
    // Page selection
    pageSelectionTitle: 'Pages à convertir',
    pageSelection: {
      all: 'Toutes les pages',
      range: 'Plage de pages',
      specific: 'Pages spécifiques'
    },
    pageRangeFrom: 'De la page',
    pageRangeTo: 'À la page',
    specificPagesPlaceholder: 'ex. 1,3,5-10',
    specificPagesHelp: 'Entrez les numéros de page séparés par des virgules',
    
    // Background color
    backgroundTitle: 'Couleur d\'arrière-plan',
    backgroundDescription: 'Couleur d\'arrière-plan pour les zones transparentes',
    
    // Progress and actions
    startConversion: 'Convertir en Images 🖼️',
    converting: 'Conversion en cours...',
    cancel: 'Annuler',
    close: 'Fermer',
    backToUpload: 'Retour au téléchargement',
    supportInfo: 'Fichiers jusqu\'à 100Mo supportés • Formats PNG, JPEG • Haute qualité'
  },
  
  // Processing messages
  progress: {
    analyzing: 'Analyse du fichier PDF...',
    converting: 'Conversion des pages en images...',
    page: 'Page {current} sur {total}',
    finalizing: 'Finalisation de la conversion...',
    complete: 'Conversion terminée !'
  },
  
  // Legacy compatibility
  buttons: {
    startConverting: 'Convertir en Images 🖼️',
    processing: 'Conversion en Images...',
    downloadZip: 'Télécharger les Images (ZIP)'
  },
  
  messages: {
    processing: 'Conversion des pages PDF en images...',
    success: 'Conversion terminée avec succès !',
    error: 'Échec de la conversion PDF vers images'
  },
  
  // Error handling
  errors: {
    invalidFile: 'Format de fichier PDF invalide',
    fileTooLarge: 'La taille du fichier dépasse la limite de 100Mo',
    conversionFailed: 'Échec de la conversion PDF vers images',
    noPages: 'Aucune page trouvée dans le PDF',
    invalidPageRange: 'Plage de pages spécifiée invalide'
  }
};