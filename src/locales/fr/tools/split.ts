/**
 * Split PDF tool translations for FR language
 * Contains: page metadata, upload zone, split options, processing messages
 * Complete localization following rotate-pdf methodology
 */

export const split = {
  // Basic properties for tools grid
  title: 'Diviser PDF',
  description: 'Diviser des PDF en pages ou plages séparées',
  
  // Page metadata (SEO)
  pageTitle: 'Diviser des fichiers PDF gratuitement - LocalPDF',
  pageDescription: 'Divisez des fichiers PDF par pages ou plages gratuitement. Extrayez des pages spécifiques de documents PDF. Division PDF privée et sécurisée dans votre navigateur.',
  
  // Upload section (like rotate had)
  upload: {
    title: 'Diviser un fichier PDF',
    description: 'Diviser le PDF en pages séparées',
    supportedFormats: 'Fichiers PDF jusqu\'à 100 Mo',
    selectedFile: 'Fichier sélectionné',
    readyToSplit: 'Prêt à diviser',
    removeFile: 'Supprimer le fichier',
    startSplitting: 'Commencer la division ✂️'
  },
  
  // Upload zone translations (for SplitPDFPage)
  uploadTitle: 'Diviser un fichier PDF',
  uploadSubtitle: 'Diviser le PDF en pages séparées', 
  supportedFormats: 'Fichiers PDF jusqu\'à 100 Mo',
  selectedFile: 'Fichier sélectionné',
  readyToSplit: 'Prêt à diviser',
  removeFile: 'Supprimer le fichier',
  fileSizeUnit: 'Mo',
  
  // Results section (comprehensive results handling)
  results: {
    successTitle: 'Division PDF terminée !',
    successDescription: '{count} fichiers créés',
    downloadAllZip: 'Télécharger tout en ZIP',
    downloadAllZipDescription: 'Télécharger {count} fichiers en archive ZIP',
    downloadIndividually: 'Télécharger individuellement',
    pageFileName: 'Page {pageNumber}.pdf',
    rangeFileName: 'Pages {startPage}-{endPage}.pdf', 
    genericFileName: 'Fichier divisé {index}.pdf',
    fileReady: 'Prêt pour le téléchargement',
    splitAnother: 'Diviser un autre PDF'
  },
  
  // Modern tool-specific section (comprehensive like ModernSplitTool)
  tool: {
    toolTitle: 'Outil de division PDF',
    fileNotSelected: 'Aucun fichier sélectionné',
    fileNotSelectedDescription: 'Veuillez sélectionner un fichier PDF à diviser',
    fileSizeUnit: 'Mo',
    
    trustIndicators: {
      private: 'Traitement privé',
      quality: 'Préservation de la qualité'
    },
    
    modes: {
      title: 'Méthode de division',
      description: 'Choisissez comment diviser votre document PDF',
      all: {
        title: 'Toutes les pages',
        description: 'Chaque page dans un fichier PDF séparé',
        shortDescription: 'Chaque page séparément'
      },
      range: {
        title: 'Plage de pages',
        description: 'Extraire une plage spécifique de pages',
        shortDescription: 'Pages {startPage} à {endPage}'
      },
      specific: {
        title: 'Pages spécifiques',
        description: 'Sélectionner des pages spécifiques à extraire',
        shortDescription: 'Pages sélectionnées séparément'
      }
    },
    
    rangeInputs: {
      title: 'Configuration de la plage',
      description: 'Spécifiez les pages à extraire',
      fromPage: 'De la page',
      toPage: 'À la page'
    },
    
    specificInputs: {
      title: 'Pages spécifiques',
      description: 'Entrez les numéros de page séparés par des virgules',
      placeholder: 'Exemple : 1, 3, 5-7, 10',
      helpText: 'Utilisez des virgules pour séparer et des tirets pour les plages'
    },
    
    zipOption: {
      title: 'Télécharger en archive ZIP',
      description: 'Regrouper tous les fichiers dans une seule archive ZIP pour plus de commodité'
    },
    
    processingTitle: 'Division du PDF',
    processingAnalyzing: 'Analyse de la structure du PDF...',
    processingSplitting: 'Création de fichiers séparés...',
    
    progress: {
      label: 'Progression'
    },
    
    buttons: {
      split: 'Diviser PDF',
      processing: 'Division...',
      cancel: 'Annuler',
      back: 'Retour',
      close: 'Fermer'
    },
    
    errors: {
      startPageTooLarge: 'La page de début ne peut pas être supérieure à la page de fin',
      invalidPageNumbers: 'Veuillez entrer des numéros de page valides',
      splittingFailed: 'Erreur de division : {error}',
      unknownError: 'Une erreur inattendue s\'est produite',
      processingError: 'Erreur de traitement'
    }
  },
  
  // Legacy compatibility
  buttons: {
    startSplitting: 'Commencer la division',
    splitting: 'Division du PDF...',
    downloadFiles: 'Télécharger les fichiers divisés',
    downloadZip: 'Télécharger en ZIP',
    backToTools: 'Retour aux outils'
  },
  
  messages: {
    processing: 'Division de votre fichier PDF...',
    progress: 'Traitement de la page {current} sur {total}',
    success: 'PDF divisé avec succès !',
    downloadReady: 'Vos fichiers divisés sont prêts au téléchargement',
    error: 'Échec de la division du fichier PDF',
    noFileSelected: 'Veuillez sélectionner un fichier PDF à diviser',
    invalidRange: 'Plage de pages spécifiée invalide',
    filesCreated: '{count} fichiers créés à partir de votre PDF'
  },
  
  options: {
    title: 'Options de division',
    splitByPages: 'Diviser par pages',
    splitByRanges: 'Diviser par plages personnalisées',
    allPages: 'Chaque page comme fichier séparé',
    customRanges: 'Plages de pages personnalisées',
    pageRange: 'Plage de pages (ex: 1-5, 7, 10-12)',
    rangeHelp: 'Entrez des plages comme: 1-3, 5, 7-10'
  },
  
  howItWorks: {
    title: 'Comment fonctionne la division PDF',
    description: 'Notre outil de division sépare les pages PDF en préservant la qualité et la mise en forme originales',
    steps: [
      'Téléversez votre fichier PDF de votre appareil',
      'Choisissez comment vous voulez diviser le document',
      'Spécifiez les plages de pages ou sélectionnez toutes les pages',
      'Téléchargez les fichiers individuels ou en archive ZIP'
    ]
  },
  
  errors: {
    invalidFile: 'Format de fichier PDF invalide',
    fileTooLarge: 'La taille du fichier dépasse la limite de 100 Mo',
    processingFailed: 'Échec du traitement du fichier PDF',
    invalidPageRange: 'Format de plage de pages invalide',
    pageOutOfRange: 'Le numéro de page dépasse la longueur du document'
  }
};