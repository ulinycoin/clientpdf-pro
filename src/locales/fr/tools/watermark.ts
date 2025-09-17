/**
 * Watermark tool translations for FR language
 * Contains: page metadata, upload zone, tool interface, settings, preview, progress
 * Complete localization following rotate-pdf methodology
 */

export const watermark = {
  // Basic properties for tools grid
  title: 'Ajouter filigrane',
  description: 'Ajouter des filigranes de texte pour protéger les documents',
  
  // Page metadata (SEO)
  pageTitle: 'Ajouter des filigranes aux PDF gratuitement - LocalPDF',
  pageDescription: 'Ajoutez des filigranes de texte aux fichiers PDF pour la protection. Outil de filigrane PDF gratuit avec confidentialité.',
  
  // Upload section (for WatermarkPDFPage)
  upload: {
    title: 'Ajouter filigrane',
    description: 'Protégez vos documents avec des filigranes personnalisés',
    supportedFormats: 'Fichiers PDF jusqu\'à 100 Mo',
    selectedFile: 'Fichier sélectionné',
    readyToWatermark: 'Prêt à ajouter un filigrane',
    removeFile: 'Supprimer le fichier',
    startWatermarking: 'Ajouter filigrane 💧'
  },

  // Results section (for completion state)
  results: {
    successTitle: 'Filigrane ajouté avec succès !',
    successDescription: 'Votre PDF est maintenant protégé avec un filigrane',
    downloadTitle: 'Télécharger le fichier protégé',
    readyToDownload: 'Prêt pour le téléchargement',
    addAnotherWatermark: 'Ajouter filigrane à un autre PDF'
  },
  
  // Main WatermarkTool interface
  tool: {
    toolTitle: 'Outil de filigrane',
    toolDescription: 'Configurer et ajouter un filigrane à votre document PDF',
    fileSizeUnit: 'Mo',
    
    fileInfo: {
      pdfPreview: 'Aperçu PDF'
    },
    
    preview: {
      title: 'Aperçu',
      enterTextPrompt: 'Entrer le texte du filigrane',
      pageLabel: 'Page 1',
      livePreviewDescription: 'L\'aperçu montre le placement approximatif du filigrane',
      previewWillAppear: 'L\'aperçu apparaîtra après la saisie du texte'
    },
    
    settings: {
      title: 'Paramètres du filigrane',
      
      watermarkText: {
        label: 'Texte du filigrane',
        placeholder: 'Entrer le texte du filigrane...',
        charactersRemaining: 'caractères restants'
      },
      
      fontFamily: {
        label: 'Famille de police'
      },
      
      fontSize: {
        label: 'Taille de police',
        rangeLabels: {
          small: 'Petite',
          large: 'Grande'
        }
      },
      
      opacity: {
        label: 'Opacité',
        rangeLabels: {
          transparent: 'Transparent',
          opaque: 'Opaque'
        }
      },
      
      rotation: {
        label: 'Rotation'
      },
      
      position: {
        label: 'Position',
        positions: {
          center: 'Centre',
          topLeft: 'Haut Gauche',
          topRight: 'Haut Droite',
          bottomLeft: 'Bas Gauche',
          bottomRight: 'Bas Droite'
        }
      },
      
      textColor: {
        label: 'Couleur du texte',
        colors: {
          gray: 'Gris',
          red: 'Rouge',
          blue: 'Bleu',
          green: 'Vert',
          black: 'Noir',
          orange: 'Orange'
        }
      },
      
      fontRecommendation: {
        title: 'Recommandation de police',
        supportsCyrillic: '(supporte le cyrillique)'
      },
      
      fontSupport: {
        supported: 'La police sélectionnée supporte votre texte',
        mayNotSupport: 'La police pourrait ne pas supporter complètement les caractères saisis'
      }
    },
    
    progress: {
      addingWatermark: 'Ajout du filigrane',
      completed: 'terminé'
    },
    
    error: {
      title: 'Erreur'
    },
    
    privacy: {
      title: 'Protection de la confidentialité',
      description: 'Vos fichiers sont traités localement dans le navigateur. Aucune donnée n\'est envoyée aux serveurs.'
    },
    
    success: {
      title: 'Filigrane ajouté avec succès !',
      description: 'Votre document PDF est maintenant protégé avec un filigrane',
      downloadAgain: 'Télécharger à nouveau'
    },
    
    actions: {
      addWatermark: 'Ajouter filigrane',
      adding: 'Ajout...',
      cancel: 'Annuler',
      processAnother: 'Traiter un autre fichier'
    },
    
    fileErrors: {
      noFileSelected: 'Veuillez sélectionner un fichier PDF pour ajouter un filigrane'
    }
  },
  
  // Legacy compatibility
  uploadTitle: 'Ajouter un filigrane au PDF',
  uploadSubtitle: 'Protégez vos documents avec des filigranes personnalisés',
  supportedFormats: 'Fichiers PDF jusqu\'à 100 Mo',
  selectedFile: 'Fichier sélectionné',
  readyToWatermark: 'Prêt à ajouter un filigrane',
  removeFile: 'Supprimer le fichier',
  fileSizeUnit: 'Mo',
  
  buttons: {
    startWatermarking: 'Ajouter filigrane 💧',
    processing: 'Ajout du filigrane...',
    download: 'Télécharger PDF avec filigrane',
    backToTools: 'Retour aux outils'
  },
  
  messages: {
    processing: 'Ajout du filigrane à votre PDF...',
    success: 'Filigrane ajouté avec succès !',
    downloadReady: 'Votre PDF avec filigrane est prêt',
    error: 'Échec de l\'ajout du filigrane au PDF',
    noFileSelected: 'Veuillez sélectionner un fichier PDF'
  },
  
  errors: {
    invalidFile: 'Format de fichier PDF invalide',
    fileTooLarge: 'La taille du fichier dépasse la limite de 100 Mo',
    processingFailed: 'Échec de l\'ajout du filigrane au PDF'
  }
};