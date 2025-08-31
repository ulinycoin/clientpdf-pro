/**
 * Extract Text tool translations for FR language
 * Contains: page metadata, upload zone, tool interface, options, progress, results
 * Complete localization following established methodology
 */

export const extractText = {
  // Basic properties for tools grid
  title: 'Extraire le texte',
  description: 'Extraire le contenu textuel des fichiers PDF',
  
  // Page metadata (SEO)
  pageTitle: 'Extraire le texte de PDF gratuitement - LocalPDF',
  pageDescription: 'Extrayez le contenu textuel des fichiers PDF gratuitement. Obtenez du texte propre avec un formatage intelligent.',
  
  // Upload section (for ExtractTextPDFPage)
  uploadTitle: 'Extraire le texte de PDF',
  uploadSubtitle: 'Extrayez tout le contenu textuel des documents PDF en un clic',
  supportedFormats: 'Fichiers PDF jusqu\'à 100 Mo',
  selectedFile: 'Fichier sélectionné',
  readyToExtract: 'Prêt pour l\'extraction de texte',
  removeFile: 'Supprimer le fichier',
  extractTextButton: 'Extraire le texte 📄',
  
  // Main ExtractTextTool interface
  tool: {
    title: 'Outil d\'extraction de texte',
    description: 'Configurez les paramètres d\'extraction de texte pour votre document PDF',
    fileToExtract: 'Fichier pour extraction de texte',
    
    // Extraction options section
    extractionOptions: 'Options d\'extraction',
    smartFormatting: 'Formatage intelligent',
    smartFormattingDesc: 'Améliore automatiquement la structure et la lisibilité du texte extrait',
    
    formattingLevel: 'Niveau de formatage',
    levels: {
      minimal: {
        title: 'Minimal',
        desc: 'Nettoyage de base des espaces et retours à la ligne supplémentaires'
      },
      standard: {
        title: 'Standard',
        desc: 'Restauration des paragraphes et structure de base du document'
      },
      advanced: {
        title: 'Avancé',
        desc: 'Restauration intelligente des titres, listes et formatage'
      }
    },
    
    includeMetadata: 'Inclure les métadonnées du document',
    preserveFormatting: 'Préserver le formatage original',
    pageRange: 'Extraire seulement des pages spécifiques',
    
    pageRangeFields: {
      startPage: 'Page de début',
      endPage: 'Page de fin',
      note: 'Laisser vide pour extraire tout le document'
    },
    
    // Progress states
    extracting: 'Extraction du texte ({progress}%)',
    
    // Success results section
    success: {
      title: 'Texte extrait avec succès !',
      pagesProcessed: 'Pages traitées : {count}',
      textLength: 'Caractères extraits : {length}',
      documentTitle: 'Titre du document : {title}',
      author: 'Auteur : {author}',
      smartFormattingApplied: 'Formatage intelligent appliqué : {level}',
      fileDownloaded: 'Fichier téléchargé automatiquement',
      noTextWarning: 'Aucun texte extractible trouvé dans le document',
      
      // Before/after comparison
      comparisonPreview: 'Aperçu des améliorations',
      before: 'Avant traitement',
      after: 'Après traitement',
      notice: 'Affichage des 200 premiers caractères pour l\'aperçu',
      
      // Regular text preview
      textPreview: 'Aperçu du texte'
    },
    
    // Error handling
    errors: {
      noFileSelected: 'Veuillez sélectionner un fichier PDF pour l\'extraction de texte'
    },
    
    // Info and privacy sections
    infoBox: {
      title: 'Extraction intelligente de texte',
      description: 'Nos algorithmes détectent et préservent automatiquement la structure du document pour une lisibilité maximale.'
    },
    
    privacy: {
      title: 'Protection de la confidentialité',
      description: 'Vos fichiers sont traités localement dans le navigateur. Aucune donnée n\'est envoyée aux serveurs.'
    },
    
    // Button actions
    buttons: {
      extractText: 'Extraire le texte',
      extracting: 'Extraction...'
    }
  },
  
  // Legacy compatibility
  backToTools: 'Retour aux outils',
  fileSizeUnit: 'Mo',
  buttons: {
    extractText: 'Extraire le texte 📄',
    extracting: 'Extraction du texte...',
    download: 'Télécharger le fichier texte',
    backToTools: 'Retour aux outils'
  },
  
  messages: {
    processing: 'Extraction du texte de votre PDF...',
    progress: 'Traitement de la page {current} sur {total}',
    success: 'Extraction du texte terminée avec succès !',
    downloadReady: 'Votre fichier texte est prêt à télécharger',
    error: 'Échec de l\'extraction de texte du PDF',
    noFileSelected: 'Veuillez sélectionner un fichier PDF pour l\'extraction de texte',
    noTextFound: 'Aucun texte trouvé dans ce fichier PDF'
  }
};