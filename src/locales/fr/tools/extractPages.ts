/**
 * Extract Pages tool translations for FR language
 * Contains: page metadata, upload zone, tool interface, selection modes, progress, results
 * Complete localization following established methodology
 */

export const extractPages = {
  // Basic properties for tools grid
  title: 'Extraire des pages',
  description: 'Extraire des pages spécifiques en un nouveau document',
  
  // Page metadata (SEO)
  pageTitle: 'Extraire des pages PDF gratuitement - LocalPDF',
  pageDescription: 'Extrayez des pages spécifiques de fichiers PDF. Créez de nouveaux PDF à partir de plages de pages sélectionnées.',
  
  // Upload section (for ExtractPagesPDFPage)
  uploadTitle: 'Extraire des pages de PDF',
  uploadSubtitle: 'Sélectionnez des pages spécifiques du document PDF pour créer un nouveau fichier',
  supportedFormats: 'Fichiers PDF jusqu\'à 100 Mo',
  selectedFile: 'Fichier sélectionné',
  readyToExtract: 'Prêt à extraire les pages',
  removeFile: 'Supprimer le fichier',
  extractPagesButton: 'Extraire les pages 📑',
  
  // Main ExtractPagesTool interface
  tool: {
    title: 'Extraire les pages PDF',
    titleLoading: 'Extraire les pages PDF',
    description: 'Sélectionner les pages à extraire de :',
    fileInfo: {
      totalPages: 'Pages totales :',
      selected: 'Sélectionnées :',
      loadingFile: 'Chargement du fichier PDF...',
      noFileAvailable: 'Aucun fichier PDF disponible pour l\'extraction de pages.',
      goBack: 'Retour'
    },
    
    // Selection modes
    selectionModes: {
      individual: 'Individuel',
      range: 'Plage',
      all: 'Toutes',
      custom: 'Personnalisé'
    },
    
    // Selection controls
    individual: {
      description: 'Cliquez sur les numéros de page ci-dessous pour sélectionner des pages individuelles :',
      selected: 'Sélectionnées :',
      clearAll: 'Tout effacer'
    },
    
    range: {
      from: 'De :',
      to: 'À :',
      selectRange: 'Sélectionner la plage',
      clear: 'Effacer'
    },
    
    all: {
      description: 'Extraire toutes les {count} pages (copier tout le document)',
      selectAllPages: 'Sélectionner toutes les pages',
      clear: 'Effacer'
    },
    
    custom: {
      label: 'Plage de pages (ex. "1-5, 8, 10-12") :',
      placeholder: '1-5, 8, 10-12',
      parseRange: 'Analyser la plage',
      selected: 'Sélectionnées :',
      clearAll: 'Tout effacer'
    },
    
    // Page grid
    pagesPreview: 'Aperçu des pages',
    pageTooltip: 'Page {number}',
    pageSelected: 'Page {number} (sélectionnée)',
    
    // Progress and results
    progress: {
      extracting: 'Extraction des pages...',
      percentage: '{progress}%'
    },
    
    success: {
      title: 'Pages extraites avec succès !',
      extracted: '{extracted} pages extraites sur {total}',
      timing: 'en {time}s'
    },
    
    // Action buttons
    actions: {
      clearSelection: 'Effacer la sélection',
      extractPages: 'Extraire les pages',
      extracting: 'Extraction...',
      readyToExtract: 'Prêt à extraire {count} {pages}'
    },
    
    // Tips section
    tips: {
      title: '💡 Conseils pour l\'extraction de pages :',
      items: [
        'Utilisez le mode "Plage" pour les pages continues (ex. pages 1-10)',
        'Utilisez le mode "Personnalisé" pour les sélections complexes (ex. "1-5, 8, 10-12")',
        'Cliquez sur les numéros de page individuels pour basculer la sélection',
        'Tout le formatage et la qualité d\'origine seront préservés'
      ]
    },
    
    // Error handling
    errors: {
      noFileSelected: 'Veuillez sélectionner un fichier PDF pour l\'extraction de pages'
    }
  },
  
  // Legacy compatibility
  backToTools: 'Retour aux outils',
  fileSizeUnit: 'Mo',
  buttons: {
    startExtracting: 'Extraire les pages 📑',
    processing: 'Extraction des pages...',
    download: 'Télécharger les pages extraites',
    backToTools: 'Retour aux outils'
  },
  
  messages: {
    processing: 'Extraction des pages de votre PDF...',
    success: 'Pages extraites avec succès !',
    error: 'Échec de l\'extraction des pages'
  }
};