/**
 * Rotate PDF tool translations for French language
 */

export const rotate = {
  // Basic properties for tools grid
  title: 'Pivoter les pages',
  description: 'Pivoter les pages de 90, 180 ou 270 degrés',
  
  // Page metadata (SEO)
  pageTitle: 'Pivoter les pages PDF gratuitement - LocalPDF',
  pageDescription: 'Faites pivoter les pages PDF de 90°, 180° ou 270°. Rotation PDF rapide et sécurisée dans votre navigateur. 100% privé.',
  
  // Upload zone translations
  uploadTitle: 'Pivoter les pages PDF',
  uploadSubtitle: 'Faire pivoter les pages vers la bonne orientation',
  supportedFormats: 'Fichiers PDF jusqu\'à 100MB',
  
  // Upload section - for selected files and actions
  upload: {
    title: 'Pivoter les pages PDF',
    description: 'Faire pivoter les pages vers la bonne orientation',
    supportedFormats: 'Fichiers PDF jusqu\'à 100MB',
    selectedFile: 'Fichier sélectionné ({count})',
    readyToRotate: 'Prêt à pivoter',
    removeFile: 'Supprimer le fichier',
    startRotating: 'Pivoter les pages 🔄'
  },
  
  // Results section - for completed operations
  results: {
    successTitle: 'Pages pivotées avec succès !',
    successDescription: 'Votre fichier PDF est prêt à télécharger',
    downloadTitle: 'Télécharger le PDF pivoté',
    rotateAnother: 'Pivoter un autre fichier',
    fileSizeReduced: 'Fichier prêt'
  },
  
  // Legacy structure for backwards compatibility
  selectedFile: 'Fichier sélectionné',
  readyToRotate: 'Prêt à pivoter',
  removeFile: 'Supprimer le fichier',
  fileSizeUnit: 'MB',
  
  buttons: {
    startRotating: 'Pivoter les pages 🔄',
    processing: 'Rotation des pages...',
    download: 'Télécharger le PDF pivoté'
  },
  
  messages: {
    processing: 'Rotation de vos pages PDF...',
    success: 'Pages pivotées avec succès !',
    error: 'Échec de la rotation des pages PDF'
  },

  // ModernRotateTool translations
  tool: {
    fileSizeUnit: 'MB',
    pageCount: '{count} pages',
    fileNotSelected: 'Aucun fichier sélectionné',
    fileNotSelectedDescription: 'Veuillez sélectionner un fichier PDF à faire pivoter',
    toolTitle: 'Pivoter les pages PDF',
    
    trustIndicators: {
      private: 'Traitement privé',
      quality: 'Haute qualité'
    },
    
    rotationAngle: {
      title: 'Sélectionner l\'angle de rotation',
      description: 'Choisissez de combien de degrés faire pivoter les pages'
    },
    
    rotationOptions: {
      clockwise: {
        label: '90° sens horaire',
        description: 'Pivoter de 90 degrés dans le sens horaire'
      },
      flip: {
        label: '180° retourner',
        description: 'Retourner de 180 degrés'
      },
      counterclockwise: {
        label: '270° sens antihoraire',
        description: 'Pivoter de 270 degrés dans le sens antihoraire'
      }
    },
    
    pageSelection: {
      title: 'Sélection de pages',
      description: 'Choisissez quelles pages faire pivoter',
      allPages: {
        label: 'Toutes les pages',
        description: 'Faire pivoter toutes les pages du document',
        descriptionWithCount: 'Faire pivoter toutes les {count} pages'
      },
      specificPages: {
        label: 'Pages spécifiques',
        description: 'Sélectionner des pages spécifiques à faire pivoter'
      }
    },
    
    specificPages: {
      inputLabel: 'Numéros de pages',
      placeholder: 'ex: 1, 3, 5-8',
      helpText: 'Entrez les numéros de pages séparés par des virgules ou des plages avec des tirets'
    },
    
    pageOverview: {
      title: 'Aperçu des pages',
      description: 'Aperçu des orientations de pages dans le document',
      pageTooltip: 'Page {pageNumber}: {orientation}',
      portrait: 'portrait',
      landscape: 'paysage',
      portraitOrientation: 'Pages portrait',
      landscapeOrientation: 'Pages paysage'
    },
    
    processing: {
      title: 'Rotation des pages...',
      analyzing: 'Analyse du document...',
      rotating: 'Rotation des pages...'
    },
    
    errors: {
      invalidPageNumbers: 'Numéros de pages invalides',
      rotationFailed: 'Échec de la rotation',
      unknownError: 'Erreur inconnue',
      processingError: 'Erreur de traitement'
    },
    
    infoBox: {
      title: 'Informations utiles',
      description: 'Les pages PDF seront pivotées en conservant la qualité et tous les éléments du document.'
    },
    
    buttons: {
      rotate: 'Pivoter de {degrees}°',
      processing: 'Traitement...'
    }
  }
};