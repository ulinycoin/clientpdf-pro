/**
 * Compress PDF tool translations for FR language
 * Contains: page metadata, upload zone, compression options, processing messages
 * Complete localization following rotate-pdf methodology
 */

export const compress = {
  // Basic properties for tools grid
  title: 'Compresser PDF',
  description: 'Réduire la taille du fichier PDF sans perdre la qualité',
  
  // Page metadata (SEO)
  pageTitle: 'Compresser des fichiers PDF gratuitement - LocalPDF',
  pageDescription: 'Réduire la taille du fichier PDF sans perdre la qualité. Outil de compression PDF gratuit avec protection de la confidentialité. Algorithmes de compression intelligents.',
  
  // Upload section (like rotate had)
  upload: {
    title: 'Compresser un fichier PDF',
    description: 'Réduire la taille du fichier tout en conservant la qualité',
    supportedFormats: 'Fichiers PDF jusqu\'à 100 Mo',
    selectedFile: 'Fichier sélectionné',
    readyToCompress: 'Prêt à compresser',
    removeFile: 'Supprimer le fichier',
    compressPdfFile: 'Compresser le fichier PDF 🗜️'
  },
  
  // Upload zone translations (for CompressPDFPage)
  uploadTitle: 'Compresser un fichier PDF',
  uploadSubtitle: 'Réduire la taille du fichier tout en conservant la qualité', 
  supportedFormats: 'Fichiers PDF jusqu\'à 100 Mo',
  selectedFile: 'Fichier sélectionné',
  readyToCompress: 'Prêt à compresser',
  removeFile: 'Supprimer le fichier',
  compressPdfFile: 'Compresser le fichier PDF 🗜️',
  fileSizeUnit: 'Mo',
  
  // Results section (like rotate had)
  results: {
    successTitle: 'Compression PDF terminée !',
    downloadCompressed: 'Télécharger le PDF compressé',
    download: 'Télécharger',
    compressAnother: 'Compresser un autre PDF',
    sizeReduced: 'Taille réduite de',
    to: 'à',
    readyForDownload: 'Votre PDF compressé est prêt pour le téléchargement'
  },
  
  // Modern tool-specific section (comprehensive like rotate.tool)
  toolTitle: 'Outil de compression PDF',
  noFileTitle: 'Aucun fichier sélectionné',
  noFileMessage: 'Veuillez sélectionner un fichier PDF à compresser',
  backButton: 'Retour',
  closeButton: 'Fermer',
  currentSize: 'Taille actuelle',
  estimatedSavings: 'économies estimées',
  forecastedSaving: 'estimé d\'après l\'analyse du fichier',
  
  trustIndicators: {
    privateProcessing: 'Traitement privé',
    intelligentCompression: 'Compression intelligente'
  },
  
  qualitySettings: {
    title: 'Paramètres de qualité',
    subtitle: 'Choisissez le bon équilibre entre qualité et taille de fichier',
    qualityLevel: 'Niveau de qualité',
    smallerSize: 'Taille plus petite',
    betterQuality: 'Meilleure qualité',
    qualityLabels: {
      maxCompression: 'Compression maximale',
      highCompression: 'Compression élevée',
      mediumCompression: 'Compression moyenne', 
      optimal: 'Optimal',
      highQuality: 'Haute qualité'
    }
  },
  
  previewCards: {
    maxCompression: {
      title: 'Compression maximale',
      subtitle: 'Taille de fichier la plus petite'
    },
    optimal: {
      title: 'Équilibre optimal',
      subtitle: 'Meilleur rapport qualité/taille'
    },
    highQuality: {
      title: 'Haute qualité',
      subtitle: 'Meilleure qualité visuelle'
    }
  },
  
  advancedSettings: {
    title: 'Paramètres avancés',
    subtitle: 'Ajustez finement les options de compression',
    compressImages: {
      title: 'Compresser les images',
      description: 'Optimiser les images pour une taille de fichier plus petite'
    },
    removeMetadata: {
      title: 'Supprimer les métadonnées',
      description: 'Supprimer les propriétés du document et les commentaires'
    },
    optimizeForWeb: {
      title: 'Optimiser pour le web',
      description: 'Préparer le PDF pour un affichage en ligne rapide'
    }
  },
  
  processing: {
    title: 'Compression de votre PDF',
    startingMessage: 'Démarrage du processus de compression...',
    defaultMessage: 'Traitement de votre fichier PDF...',
    progressLabel: 'Progression'
  },
  
  errors: {
    selectFile: 'Veuillez sélectionner un fichier PDF à compresser',
    compressionError: 'Échec de la compression du fichier PDF',
    unknownError: 'Une erreur inattendue s\'est produite',
    processingError: 'Erreur de traitement'
  },
  
  infoBox: {
    title: 'Comment ça marche',
    description: 'Nos algorithmes de compression intelligents analysent votre PDF et appliquent des paramètres optimaux pour réduire la taille du fichier tout en préservant la qualité visuelle. Vos fichiers sont traités localement pour une confidentialité maximale.'
  },
  
  actions: {
    compress: 'Compresser PDF',
    compressing: 'Compression...',
    cancel: 'Annuler',
    back: 'Retour'
  },
  
  // Legacy compatibility keys (for old CompressionTool)
  starting: 'Démarrage du processus de compression...',
  failed: 'Échec de la compression du fichier PDF',
  fileToCompress: 'Fichier à compresser',
  smaller: 'plus petit',
  estimated: 'estimé',
  settings: {
    title: 'Paramètres de compression',
    qualityLevel: 'Niveau de qualité',
    smallerFile: 'Fichier plus petit',
    betterQuality: 'Meilleure qualité',
    compressImages: 'Compresser les images',
    removeMetadata: 'Supprimer les métadonnées',
    optimizeForWeb: 'Optimiser pour le web'
  },
  howItWorks: 'Comment ça marche',
  howItWorksDescription: 'Les algorithmes intelligents réduisent la taille du fichier en optimisant les images, les polices et en supprimant les données inutiles',
  compressing: 'Compression du PDF...',
  
  // Additional results keys used by CompressPDFPage
  successTitle: 'Compression PDF terminée !',
  downloadCompressed: 'Télécharger le PDF compressé',
  download: 'Télécharger',
  compressAnother: 'Compresser un autre PDF',
  sizeReduced: 'Taille réduite de',
  to: 'à',
  readyForDownload: 'Votre PDF compressé est prêt pour le téléchargement'
};