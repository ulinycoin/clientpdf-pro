/**
 * Add Text tool translations for FR language
 * Contains: page metadata, upload zone, editor interface, toolbar, format panel
 * Complete localization following rotate-pdf methodology
 */

export const addText = {
  // Basic properties for tools grid
  title: 'Ajouter du texte',
  description: 'Ajouter des annotations de texte et des étiquettes aux fichiers PDF',
  
  // Page metadata (SEO)
  pageTitle: 'Ajouter du texte aux PDF gratuitement - LocalPDF',
  pageDescription: 'Ajoutez des annotations de texte et des étiquettes aux fichiers PDF. Éditeur de texte PDF gratuit avec protection complète de la confidentialité.',
  
  // Upload zone translations (for AddTextPDFPage)
  uploadTitle: 'Ajouter du texte au PDF',
  uploadSubtitle: 'Insérer des annotations de texte n\'importe où dans votre PDF',
  supportedFormats: 'Fichiers PDF jusqu\'à 100 Mo',
  selectedFile: 'Fichier sélectionné',
  readyForEditing: 'Prêt pour l\'édition',
  removeFile: 'Supprimer le fichier',
  fileSizeUnit: 'Mo',
  editPdf: 'Modifier PDF ✏️',
  
  // Main AddTextTool interface
  addTextToPdf: 'Ajouter du texte au PDF',
  backToTools: 'Retour aux outils',
  noFileSelected: 'Aucun fichier sélectionné',
  noFileDescription: 'Veuillez sélectionner un fichier PDF pour ajouter du texte',
  
  textElements: {
    single: 'élément',
    multiple: 'éléments'
  },
  
  // Toolbar translations
  toolbar: {
    addText: 'Ajouter texte',
    select: 'Sélectionner',
    undo: 'Annuler',
    redo: 'Refaire',
    page: 'Page',
    of: 'sur',
    savePdf: 'Sauvegarder PDF'
  },
  
  // Format Panel translations
  formatPanel: {
    title: 'Formatage',
    selectElementPrompt: 'Sélectionnez un élément de texte à modifier',
    textContent: 'Contenu du texte',
    textPlaceholder: 'Entrez votre texte...',
    fontFamily: 'Police',
    fontSize: 'Taille de police',
    textColor: 'Couleur du texte',
    position: 'Position',
    preview: 'Aperçu',
    sampleText: 'Texte d\'exemple'
  },
  
  // Status bar and interaction messages
  status: {
    mode: 'Mode',
    addTextMode: 'Ajouter texte',
    selectMode: 'Sélectionner éléments',
    selected: 'Sélectionné',
    zoom: 'Zoom',
    clickToEdit: 'Cliquer pour modifier'
  },
  
  // Processing overlay
  processingTitle: 'Sauvegarde PDF',
  processingDescription: 'Ajout de texte et création du nouveau fichier PDF...',
  
  // Canvas translations
  canvas: {
    loadingPdf: 'Chargement du PDF...'
  },
  
  // Legacy compatibility
  buttons: {
    startEditing: 'Ajouter du texte ✏️',
    processing: 'Ajout du texte...',
    download: 'Télécharger PDF avec texte',
    backToTools: 'Retour aux outils'
  },
  
  messages: {
    processing: 'Ajout de texte à votre PDF...',
    success: 'Texte ajouté avec succès !',
    downloadReady: 'Votre PDF avec texte ajouté est prêt',
    error: 'Échec de l\'ajout de texte au PDF',
    noFileSelected: 'Veuillez sélectionner un fichier PDF'
  },
  
  errors: {
    invalidFile: 'Format de fichier PDF invalide',
    fileTooLarge: 'La taille du fichier dépasse la limite de 100 Mo',
    processingFailed: 'Échec de l\'ajout de texte au PDF'
  }
};