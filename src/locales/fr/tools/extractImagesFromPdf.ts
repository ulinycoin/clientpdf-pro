/**
 * Extract Images from PDF tool translations for FR language
 * Contains: page metadata, upload zone, tool interface, options, progress, results
 * Complete localization following established methodology
 */

export const extractImagesFromPdf = {
  // Basic properties for tools grid
  title: 'Extraire les images du PDF',
  description: 'Extraire toutes les images des documents PDF en qualité originale',
  
  // Page metadata (SEO)
  pageTitle: 'Extraire les images du PDF gratuitement - LocalPDF',
  pageDescription: 'Extrayez toutes les images des fichiers PDF gratuitement. Téléchargez les images en qualité originale avec sélection par lots et options de filtrage.',
  
  // Upload section (for ExtractImagesFromPDFPage)
  upload: {
    title: 'Extraire les images du PDF',
    subtitle: 'Extraire toutes les images intégrées des documents PDF avec des options de filtrage avancées',
    supportedFormats: 'Fichiers PDF jusqu\'à 100MB',
    dragAndDrop: 'Déposez votre fichier PDF ici ou cliquez pour parcourir'
  },
  
  // Main ExtractImagesFromPdfTool interface
  uploadPrompt: 'Déposez votre fichier PDF ici ou cliquez pour parcourir',
  uploadSubtitle: 'Extraire toutes les images de votre document PDF',
  
  // Settings section
  settings: {
    pageSelection: 'Sélection des pages',
    allPages: 'Toutes les pages',
    specificPages: 'Pages spécifiques',
    pageRange: 'Plage de pages',
    minSize: 'Taille minimale d\'image',
    minSizeDescription: 'Extraire uniquement les images plus grandes que cette taille (pixels)',
    outputFormat: 'Format de sortie',
    original: 'Conserver le format original',
    png: 'Convertir en PNG',
    jpeg: 'Convertir en JPEG',
    jpegQuality: 'Qualité JPEG',
    deduplicateImages: 'Supprimer les images en double',
    includeVectorImages: 'Inclure les images vectorielles'
  },
  
  // Progress section
  progress: {
    preparing: 'Chargement du document PDF...',
    extracting: 'Extraction des images de la page {current} sur {total}...',
    processing: 'Traitement et filtrage des images...',
    finalizing: 'Finalisation de l\'extraction...',
    complete: 'Extraction terminée !'
  },
  
  // Results section
  results: {
    imagesFound: 'images trouvées',
    totalSize: 'Taille totale',
    selectedCount: '{selected} sur {total} sélectionnées',
    selectAll: 'Tout sélectionner',
    deselectAll: 'Tout désélectionner',
    downloadSelected: 'Télécharger la sélection',
    downloadAll: 'Télécharger tout en ZIP',
    imageInfo: 'Page {pageNumber} • {width}×{height} • {size} • {format}',
    duplicatesRemoved: '{count} doublons supprimés',
    gridView: 'Vue en grille',
    listView: 'Vue en liste'
  },
  
  // Success messages
  success: {
    title: 'Images extraites avec succès !',
    description: '{count} images trouvées avec une taille totale de {size} MB',
    extractedInfo: '{count} images extraites de {pages} pages'
  },
  
  // Error handling
  errors: {
    noImages: 'Aucune image trouvée dans ce PDF',
    noImagesDescription: 'Ce PDF ne contient aucune image extractible correspondant à vos critères.',
    extractionFailed: 'Échec de l\'extraction des images',
    loadingFailed: 'Échec du chargement du document PDF',
    noFileSelected: 'Veuillez sélectionner un fichier PDF pour extraire les images',
    processingError: 'Une erreur s\'est produite lors du traitement du PDF'
  },
  
  // Buttons
  buttons: {
    extractImages: 'Extraire les images',
    extracting: 'Extraction en cours...',
    extractAnother: 'Extraire d\'un autre PDF',
    tryAgain: 'Essayer un autre fichier',
    showSettings: 'Afficher les paramètres',
    hideSettings: 'Masquer les paramètres'
  },
  
  // Quick steps for StandardToolPageTemplate
  quickSteps: {
    step1: {
      title: 'Télécharger le PDF',
      description: 'Sélectionnez ou glissez-déposez votre fichier PDF pour commencer l\'extraction d\'images'
    },
    step2: {
      title: 'Configurer les paramètres',
      description: 'Définissez la taille minimale d\'image, le format de sortie et autres préférences d\'extraction'
    },
    step3: {
      title: 'Télécharger les images',
      description: 'Prévisualisez, sélectionnez et téléchargez les images extraites individuellement ou en ZIP'
    }
  },
  
  // Benefits for StandardToolPageTemplate
  benefits: {
    privacy: {
      title: 'Confidentialité totale',
      description: 'Tout le traitement se fait localement dans votre navigateur. Aucun fichier n\'est téléchargé sur les serveurs.'
    },
    quality: {
      title: 'Qualité originale',
      description: 'Extrayez les images dans leur résolution et format d\'origine sans perte de qualité.'
    },
    formats: {
      title: 'Formats multiples',
      description: 'Support pour JPEG, PNG et autres formats d\'image avec options de conversion.'
    },
    batch: {
      title: 'Opérations par lots',
      description: 'Sélectionnez plusieurs images et téléchargez-les comme archive ZIP pratique.'
    }
  },
  
  // Legacy compatibility for existing components
  fileSelected: 'Fichier sélectionné',
  readyToExtract: 'Prêt à extraire les images',
  removeFile: 'Supprimer le fichier',
  backToTools: 'Retour aux outils',
  processing: 'Extraction des images de votre PDF...',
  downloadReady: 'Vos images sont prêtes à télécharger'
};