/**
 * Excel to PDF tool translations for FR language
 * Contains: page metadata, upload zone, tool interface, conversion options, progress
 * Complete localization following established methodology
 */

export const excelToPdf = {
  // Basic properties for tools grid
  title: 'Excel vers PDF',
  description: 'Convertir des feuilles de calcul Excel en documents PDF',
  
  // Page metadata (SEO)
  pageTitle: 'Convertir Excel en PDF gratuitement - LocalPDF',
  pageDescription: 'Convertissez des feuilles de calcul Excel en documents PDF avec préservation de la mise en page.',
  
  // Upload section
  uploadSection: {
    title: 'Télécharger un fichier Excel',
    subtitle: 'Convertir des feuilles de calcul Excel en PDF avec préservation complète du formatage et des données',
    supportedFormats: 'Fichiers XLSX, XLS jusqu\'à 100 Mo'
  },
  
  // Tool interface
  tool: {
    title: 'Convertisseur Excel vers PDF',
    description: 'Convertir des feuilles de calcul Excel en documents PDF',
    
    // Features
    features: {
      title: 'Fonctionnalités de conversion :',
      multipleSheets: 'Support pour sélection de feuilles multiples',
      preserveFormatting: 'Préserver tous les formatages et styles',
      customSettings: 'Paramètres de conversion flexibles',
      highQuality: 'Sortie PDF haute qualité'
    },
    
    // Sheet selection
    sheetSelection: {
      title: 'Sélectionner les feuilles à convertir',
      selectAll: 'Tout sélectionner',
      deselectAll: 'Tout désélectionner',
      selectedSheets: 'Feuilles sélectionnées ({count})'
    },
    
    // Conversion options
    pageSize: 'Taille de page',
    pageSizeOptions: {
      a4: 'A4 (210 × 297 mm)',
      letter: 'Lettre (8,5 × 11 po)',
      a3: 'A3 (297 × 420 mm)'
    },
    
    orientation: 'Orientation',
    orientationOptions: {
      portrait: 'Portrait',
      landscape: 'Paysage'
    },
    
    includeSheetNames: 'Inclure les noms de feuilles dans le PDF',
    
    // Actions
    convertToPdf: 'Convertir en PDF 📊',
    converting: 'Conversion en cours...',
    
    // Progress
    analyzing: 'Analyse du fichier Excel...',
    convertingSheet: 'Conversion de la feuille {current} sur {total}...'
  },
  
  // Direct tool interface translations (used by ExcelToPDFTool component)
  conversionSettings: 'Paramètres de conversion',
  fileInformation: 'Informations sur le fichier',
  selectSheets: 'Sélectionner les feuilles à convertir',
  selectAll: 'Tout sélectionner',
  deselectAll: 'Tout désélectionner',
  rowsColumns: '{rows} lignes × {cols} colonnes',
  pageOrientation: 'Orientation de la page',
  portrait: 'Portrait',
  landscape: 'Paysage',
  pageSize: 'Taille de page',
  fontSize: 'Taille de police',
  
  // Settings sections
  pageSetup: 'Mise en page',
  formatting: 'Formatage',
  margins: 'Marges',
  options: 'Options',
  
  // Margin labels
  marginTop: 'Haut',
  marginBottom: 'Bas',
  marginLeft: 'Gauche',
  marginRight: 'Droite',
  
  outputFormat: 'Format de sortie',
  singlePdf: 'Fichier PDF unique',
  separatePdfs: 'PDF séparé pour chaque feuille',
  includeSheetNames: 'Inclure les noms de feuilles dans le PDF',
  convertToPdf: 'Convertir en PDF 📊',
  converting: 'Conversion en cours...',
  conversionCompleted: 'Conversion terminée !',
  pdfReady: 'Votre PDF est prêt à être téléchargé',
  multipleFiles: '{count} fichiers sont prêts à être téléchargés',
  file: 'Fichier',
  size: 'Taille',
  sheets: 'Feuilles',
  languages: 'Langues',
  multiLanguageNote: 'Ce fichier contient plusieurs langues et peut nécessiter un traitement spécial',
  chooseDifferentFile: 'Choisir un autre fichier',
  
  // Legacy compatibility
  uploadTitle: 'Excel vers PDF',
  uploadSubtitle: 'Convertir les fichiers XLSX au format PDF',
  supportedFormats: 'Fichiers XLSX jusqu\'à 100 Mo',
  
  buttons: {
    startConverting: 'Convertir en PDF 📊',
    processing: 'Conversion d\'Excel...',
    download: 'Télécharger le PDF'
  },
  
  messages: {
    processing: 'Conversion de la feuille de calcul Excel en PDF...',
    success: 'Feuille de calcul convertie avec succès !',
    error: 'Échec de la conversion Excel vers PDF'
  }
};