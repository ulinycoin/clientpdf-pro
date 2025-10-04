/**
 * Merge PDF tool translations for FR language
 * Contains: page metadata, upload zone, file management, processing messages
 */

export const merge = {
  // Basic properties for tools grid
  title: 'Fusionner PDFs',
  description: 'Combiner plusieurs fichiers PDF en un seul document',
  
  // Page metadata (SEO)
  pageTitle: 'Fusionner des fichiers PDF gratuitement - LocalPDF',
  pageDescription: 'Combinez plusieurs fichiers PDF en un seul document gratuitement. Fusion PDF rapide, sécurisée et privée dans votre navigateur. Pas de téléversements, pas d\'inscription requise.',
  
  // Upload zone translations
  uploadTitle: 'Téléverser des fichiers PDF à fusionner',
  uploadSubtitle: 'Combiner plusieurs fichiers PDF en un seul document',
  supportedFormats: 'Fichiers PDF jusqu\'à 100MB chacun',
  
  // File management
  selectedFiles: 'Fichiers sélectionnés',
  readyToMerge: 'Prêt à fusionner',
  removeFile: 'Supprimer le fichier',
  fileSizeUnit: 'MB',
  
  // Processing buttons and states
  buttons: {
    startMerging: 'Fusionner {count} Fichiers 📄',
    merging: 'Fusion des fichiers...',
    download: 'Télécharger le PDF fusionné',
    backToTools: 'Retour aux outils',
    selectMoreFiles: 'Sélectionner plus de fichiers'
  },
  
  // Processing messages
  messages: {
    processing: 'Fusion de vos fichiers PDF...',
    progress: 'Traitement du fichier {current} sur {total}',
    success: 'Fichiers PDF fusionnés avec succès !',
    downloadReady: 'Votre PDF fusionné est prêt au téléchargement',
    error: 'Échec de la fusion des fichiers PDF',
    noFilesSelected: 'Veuillez sélectionner au moins 2 fichiers PDF à fusionner',
    singleFileWarning: 'Veuillez sélectionner plusieurs fichiers à fusionner'
  },
  
  // ModernMergeTool specific translations
  toolTitle: 'Fusionner les fichiers PDF',
  fileCount: {
    single: 'fichier',
    few: 'fichiers', 
    many: 'fichiers'
  },
  processing: 'Fusion des fichiers...',
  processingTitle: 'Fusion en cours',
  processingDescription: 'Traitement des fichiers...',
  orderTitle: 'Ordre des fichiers',
  orderDescription: 'Utilisez les flèches pour changer l\'ordre',
  trustIndicators: {
    private: 'Traitement privé',
    quality: 'Haute qualité'
  },
  controls: {
    moveUp: 'Déplacer vers le haut',
    moveDown: 'Déplacer vers le bas'
  },
  fileCounter: {
    label: 'fichiers',
    scrollHint: '• Faites défiler pour voir tous les fichiers'
  },
  actions: {
    merge: 'Fusionner {count} {fileWord}',
    merging: 'Traitement...',
    cancel: 'Annuler',
    close: 'Fermer'
  },
  progress: 'Progrès',
  
  // Tool-specific content
  howItWorks: {
    title: 'Comment fonctionne la fusion PDF',
    description: 'Notre outil de fusion combine plusieurs documents PDF en préservant la qualité et le formatage',
    steps: [
      'Téléversez plusieurs fichiers PDF depuis votre appareil',
      'Arrangez les fichiers dans l\'ordre préféré',
      'Cliquez sur fusionner pour combiner tous les documents',
      'Téléchargez votre fichier PDF unifié'
    ]
  },
  
  // Benefits specific to merge tool
  benefits: {
    title: 'Pourquoi utiliser notre outil de fusion PDF ?',
    features: [
      'Préserver la qualité et le formatage original',
      'Maintenir les métadonnées et signets du document',
      'Aucune limite de taille ou de quantité de fichiers',
      'Traitement instantané dans votre navigateur'
    ]
  },
  
  // Error handling (consolidated)
  errors: {
    minFiles: 'Sélectionnez au moins 2 fichiers à fusionner',
    processingError: 'Erreur lors du traitement des fichiers',
    unknownError: 'Erreur inconnue',
    errorTitle: 'Erreur de traitement',
    invalidFile: 'Format de fichier PDF invalide',
    fileTooLarge: 'La taille du fichier dépasse la limite de 100MB',
    processingFailed: 'Échec du traitement du fichier PDF',
    noFilesUploaded: 'Aucun fichier téléversé pour la fusion'
  },

  // Detailed unique content for this tool (replaces generic template)
  detailed: {
    title: 'Pourquoi choisir notre outil de fusion PDF ?',
    functionality: {
      title: 'Technologie de fusion avancée',
      description1: 'Notre outil de fusion PDF utilise une technologie de navigateur de pointe pour combiner plusieurs documents PDF en un seul fichier tout en préservant tous les formatages, polices, images et structures de document d\'origine. Contrairement à la simple concaténation de fichiers, notre outil traite intelligemment chaque page pour maintenir une qualité professionnelle.',
      description2: 'Le moteur de fusion gère les fonctionnalités PDF complexes, notamment les polices intégrées, les graphiques vectoriels, les champs de formulaire, les annotations et les signets. Les documents sont traités dans votre navigateur à l\'aide des bibliothèques PDF-lib et pdf.js, assurant la compatibilité avec toutes les normes PDF de 1.4 à 2.0.'
    },
    capabilities: {
      title: 'Traitement intelligent des documents',
      description1: 'Fusionnez un nombre illimité de fichiers PDF sans restrictions sur la taille du document ou le nombre de pages. Réorganisez les pages en faisant glisser les fichiers vers le haut ou vers le bas avant la fusion. Notre traitement intelligent préserve les métadonnées du document, y compris les informations sur l\'auteur, les dates de création et les propriétés personnalisées.',
      description2: 'Traitez des contrats commerciaux, des articles académiques, des factures, des présentations et des rapports en toute confiance. L\'outil conserve les images haute résolution, les mises en page complexes, le texte multi-colonnes, les tableaux et les médias intégrés. Tout le traitement s\'effectue instantanément dans votre navigateur avec un suivi de progression en temps réel.'
    }
  }
};