/**
 * Word to PDF tool translations for FR language
 * Contains: page metadata, upload zone, tool interface, settings, processing messages
 */

export const wordToPdf = {
  // Basic properties for tools grid
  title: 'Word vers PDF',
  description: 'Convertir des documents Word en format PDF',
  
  // Page metadata (SEO)
  pageTitle: 'Convertir Word en PDF gratuitement - LocalPDF',
  pageDescription: 'Convertissez des documents Word en fichiers PDF avec une préservation parfaite du formatage. Supporte les fichiers DOCX, entièrement privé et sécurisé.',
  
  // Upload zone translations  
  uploadTitle: 'Convertir Word en PDF',
  uploadSubtitle: 'Télécharger des documents DOCX et les convertir en format PDF',
  supportedFormats: 'Fichiers DOCX jusqu\'à 100 Mo',
  
  // Tool interface translations
  tool: {
    title: 'Convertisseur Word vers PDF',
    uploadTitle: 'Sélectionner un document Word',
    uploadSubtitle: 'Choisir un fichier DOCX à convertir en PDF',
    supportedFormats: 'Fichiers DOCX supportés (jusqu\'à 100 Mo)',
    
    compatibility: {
      msWord: 'Microsoft Word 2007+ (.docx)',
      googleDocs: 'Google Docs exporté en DOCX',
      docWarning: 'Les fichiers .doc anciens ne sont pas supportés - utilisez .docx',
      localProcessing: 'Traité localement dans votre navigateur'
    },
    
    preview: {
      title: 'Aperçu PDF',
      description: 'Convertissez votre document pour voir l\'aperçu PDF',
      generating: 'Génération de l\'aperçu PDF...',
      waitMessage: 'Veuillez patienter pendant que nous préparons votre document',
      placeholder: 'L\'aperçu PDF apparaîtra ici',
      uploadPrompt: 'Téléchargez un document Word pour commencer',
      error: 'Échec de la génération de l\'aperçu',
      errorTitle: 'Erreur d\'aperçu',
      tryAgain: 'Réessayer',
      zoomOut: 'Zoom arrière',
      zoomIn: 'Zoom avant'
    },
    
    settings: {
      title: 'Paramètres de conversion',
      hide: 'Masquer',
      show: 'Afficher',
      pageSetup: {
        title: 'Mise en page',
        pageSize: 'Format de page',
        pageSizeOptions: {
          a4: 'A4 (210 × 297 mm)',
          letter: 'Lettre (8,5 × 11 po)',
          a3: 'A3 (297 × 420 mm)'
        }
      },
      margins: {
        title: 'Marges (mm)',
        top: 'Haut',
        right: 'Droite',
        bottom: 'Bas',
        left: 'Gauche'
      },
      typography: {
        title: 'Typographie',
        fontSize: 'Taille de police',
        fontSizeOptions: {
          small: '10pt (Petit)',
          normal11: '11pt',
          normal12: '12pt (Normal)',
          large: '14pt (Grand)',
          extraLarge: '16pt (Très grand)'
        }
      },
      advanced: {
        title: 'Options avancées',
        embedFonts: 'Incorporer les polices pour une meilleure compatibilité',
        compression: 'Compresser le PDF (taille de fichier plus petite)',
        resetDefaults: 'Restaurer les valeurs par défaut'
      }
    },
    
    fileInfo: {
      title: 'Informations du document',
      fileName: 'Nom du fichier',
      fileSize: 'Taille du fichier',
      fileType: 'Type de fichier',
      microsoftWord: 'Microsoft Word',
      privacyNote: 'Votre document est traité localement - jamais téléchargé'
    },
    
    buttons: {
      convertToPdf: 'Convertir en PDF',
      converting: 'Conversion en cours...',
      download: 'Télécharger le PDF',
      chooseDifferent: 'Choisir un autre fichier',
      hidePreview: 'Masquer l\'aperçu',
      showPreview: 'Afficher l\'aperçu et télécharger'
    },
    
    messages: {
      conversionCompleted: 'Conversion terminée !',
      conversionFailed: 'Échec de la conversion',
      processing: 'Conversion du document Word en PDF...',
      noFile: 'Aucun document Word sélectionné',
      converting: 'Conversion du document en PDF...',
      downloadHint: 'Après la conversion, utilisez le bouton Télécharger dans le panneau d\'aperçu',
      processingDescription: 'Traitement de votre document Word...',
      progress: 'Progrès',
      unknownError: 'Une erreur inattendue s\'est produite lors de la conversion'
    }
  },
  
  // Processing buttons and states
  buttons: {
    startConverting: 'Convertir en PDF 📄',
    converting: 'Conversion de Word...',
    download: 'Télécharger le PDF',
    backToTools: 'Retour aux outils',
    selectNewFile: 'Sélectionner un nouveau fichier'
  },
  
  // Processing messages
  messages: {
    processing: 'Conversion du document Word en PDF...',
    success: 'Document converti avec succès !',
    downloadReady: 'Votre PDF est prêt au téléchargement',
    error: 'Échec de la conversion Word vers PDF',
    noFileSelected: 'Veuillez sélectionner un document Word à convertir',
    invalidFormat: 'Veuillez sélectionner un fichier DOCX valide'
  },
  
  // Tool-specific content
  howItWorks: {
    title: 'Comment fonctionne la conversion Word vers PDF',
    description: 'Notre convertisseur transforme les documents Word en fichiers PDF professionnels tout en préservant le formatage',
    steps: [
      'Téléchargez votre fichier DOCX depuis votre appareil',
      'Ajustez les paramètres de conversion si nécessaire', 
      'Cliquez sur convertir pour générer le PDF',
      'Téléchargez votre fichier PDF converti'
    ]
  },
  
  // Benefits specific to word to pdf tool
  benefits: {
    title: 'Pourquoi utiliser notre convertisseur Word vers PDF ?',
    features: [
      'Préservation parfaite du formatage',
      'Maintient la structure et le style du document',
      'Paramètres de conversion ajustables',
      'Traitement instantané dans votre navigateur'
    ]
  },
  
  // Error handling
  errors: {
    invalidFile: 'Format de document Word invalide',
    fileTooLarge: 'La taille du fichier dépasse la limite de 100 Mo',
    conversionFailed: 'Échec de la conversion du document',
    noFileUploaded: 'Aucun document Word sélectionné',
    corruptedFile: 'Le document semble être corrompu',
    unsupportedVersion: 'Veuillez utiliser le format DOCX (Word 2007+)'
  }
};