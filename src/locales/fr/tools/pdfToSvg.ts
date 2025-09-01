/**
 * PDF to SVG tool translations for FR language
 * Contains: page metadata, upload zone, tool interface, conversion options, progress, results
 * Complete localization following established methodology
 */

export const pdfToSvg = {
  // Basic properties for tools grid
  title: 'PDF vers SVG',
  description: 'Convertir les pages PDF en graphiques vectoriels évolutifs (SVG)',
  
  // Page metadata (SEO)
  pageTitle: 'Convertir PDF en SVG gratuitement - LocalPDF',
  pageDescription: 'Convertir les pages PDF en vecteurs SVG. Conversion PDF vers SVG de haute qualité avec graphiques évolutifs.',
  
  // Upload zone (for PDFToSvgPage)
  uploadTitle: 'Télécharger un fichier PDF pour le convertir en SVG',
  uploadSubtitle: 'Transformer les pages PDF en graphiques vectoriels évolutifs',
  supportedFormats: 'Fichiers PDF',
  selectedFile: 'Fichier sélectionné ({count})',
  readyToConvert: 'Prêt à convertir en SVG',
  removeFile: 'Supprimer le fichier',
  fileSizeUnit: 'Mo',
  
  // Results section
  results: {
    successTitle: 'PDF converti avec succès en SVG !',
    successDescription: 'Toutes les pages PDF converties en graphiques vectoriels évolutifs',
    convertAnotherFile: 'Convertir un autre fichier',
    conversionComplete: 'Conversion SVG terminée avec succès !',
    processingTitle: 'Conversion SVG en cours',
    processingMessage: 'Traitement de la page {current} sur {total}',
    pagesConverted: 'Pages converties',
    format: 'Format',
    totalSize: 'Taille totale',
    processingTime: 'Temps de traitement',
    preview: 'Aperçu',
    downloadSvgs: 'Télécharger les fichiers SVG',
    downloadAll: 'Télécharger tous les fichiers SVG ({count})',
    downloadIndividual: 'Télécharger les fichiers SVG individuellement',
    pageLabel: 'Page {number}',
    seconds: 's'
  },
  
  // Tool interface (for PdfToSvgTool)
  tool: {
    title: 'Convertisseur PDF vers SVG',
    description: 'Convertir les pages PDF en graphiques vectoriels évolutifs',
    noFileSelected: 'Aucun fichier PDF sélectionné',
    noFileDescription: 'Veuillez sélectionner un fichier PDF à convertir en SVG',
    selectFile: 'Sélectionner un fichier PDF',
    conversionSettingsTitle: 'Paramètres de conversion',
    
    // Quality settings
    qualityTitle: 'Qualité et résolution',
    qualityDescription: 'Une qualité supérieure produit de meilleurs vecteurs mais des fichiers plus volumineux',
    qualities: {
      low: 'Qualité de base, fichiers plus petits',
      medium: 'Qualité et taille équilibrées',
      high: 'Haute qualité, vecteurs détaillés',
      maximum: 'Qualité maximale, fichiers les plus volumineux'
    },
    
    // Conversion method
    methodTitle: 'Méthode de conversion',
    methodDescription: 'Choisir entre canvas rapide ou extraction vectorielle',
    methods: {
      canvas: 'Conversion basée sur canvas - rapide mais contenu rastérisé',
      vector: 'Extraction vectorielle - plus lente mais vrais vecteurs évolutifs (fonctionnalité future)'
    },
    
    // Advanced options
    advancedTitle: 'Options avancées',
    includeText: 'Inclure les éléments de texte',
    includeTextDesc: 'Préserver le texte comme éléments sélectionnables',
    includeImages: 'Inclure les images',
    includeImagesDesc: 'Intégrer les images dans la sortie SVG',
    
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
    specificPagesHelp: 'Entrer les numéros de page séparés par des virgules',
    
    // Background color
    backgroundTitle: 'Couleur d\'arrière-plan',
    backgroundDescription: 'Couleur d\'arrière-plan pour les zones transparentes',
    
    // Progress and actions
    startConversion: 'Convertir en SVG 📐',
    converting: 'Conversion en cours...',
    cancel: 'Annuler',
    close: 'Fermer',
    backToUpload: 'Retour au téléchargement',
    supportInfo: 'Fichiers jusqu\'à 100 Mo pris en charge • Format SVG • Vecteurs évolutifs'
  },
  
  // Processing messages
  progress: {
    analyzing: 'Analyse du fichier PDF...',
    converting: 'Conversion des pages en SVG...',
    page: 'Page {current} sur {total}',
    finalizing: 'Finalisation de la conversion SVG...',
    complete: 'Conversion SVG terminée !'
  },
  
  // Legacy compatibility
  buttons: {
    startConverting: 'Convertir en SVG 📐',
    processing: 'Conversion en SVG...',
    downloadZip: 'Télécharger les fichiers SVG (ZIP)'
  },
  
  messages: {
    processing: 'Conversion des pages PDF en SVG...',
    success: 'Conversion SVG terminée avec succès !',
    error: 'Échec de la conversion PDF vers SVG'
  },
  
  // Error handling
  errors: {
    invalidFile: 'Format de fichier PDF invalide',
    fileTooLarge: 'La taille du fichier dépasse la limite de 100 Mo',
    conversionFailed: 'Échec de la conversion PDF vers SVG',
    noPages: 'Aucune page trouvée dans le PDF',
    invalidPageRange: 'Plage de pages invalide spécifiée',
    invalidOptions: 'Options de conversion invalides',
    processingError: 'Erreur lors du traitement SVG'
  }
};