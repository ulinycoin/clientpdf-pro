/**
 * Compress PDF tool translations for DE language
 * Contains: page metadata, upload zone, compression options, processing messages
 * Complete localization following rotate-pdf methodology
 */

export const compress = {
  // Basic properties for tools grid
  title: 'PDF komprimieren',
  description: 'PDF-Dateigröße reduzieren ohne Qualitätsverlust',
  
  // Page metadata (SEO)
  pageTitle: 'PDF-Dateien kostenlos komprimieren - LocalPDF',
  pageDescription: 'PDF-Dateigröße reduzieren ohne Qualitätsverlust. Kostenloses PDF-Komprimierungstool mit Datenschutz. Intelligente Komprimierungsalgorithmen.',
  
  // Upload section (like rotate had)
  upload: {
    title: 'PDF-Datei komprimieren',
    description: 'Dateigröße reduzieren bei erhaltener Qualität',
    supportedFormats: 'PDF-Dateien bis 100MB',
    selectedFile: 'Ausgewählte Datei',
    readyToCompress: 'Bereit zum Komprimieren',
    removeFile: 'Datei entfernen',
    compressPdfFile: 'PDF-Datei komprimieren 🗜️'
  },
  
  // Upload zone translations (for CompressPDFPage)
  uploadTitle: 'PDF-Datei komprimieren',
  uploadSubtitle: 'Dateigröße reduzieren bei erhaltener Qualität', 
  supportedFormats: 'PDF-Dateien bis 100MB',
  selectedFile: 'Ausgewählte Datei',
  readyToCompress: 'Bereit zum Komprimieren',
  removeFile: 'Datei entfernen',
  compressPdfFile: 'PDF-Datei komprimieren 🗜️',
  fileSizeUnit: 'MB',
  
  // Results section (like rotate had)
  results: {
    successTitle: 'PDF-Komprimierung abgeschlossen!',
    downloadCompressed: 'Komprimierte PDF herunterladen',
    download: 'Herunterladen',
    compressAnother: 'Weitere PDF komprimieren',
    sizeReduced: 'Größe reduziert von',
    to: 'auf',
    readyForDownload: 'Ihre komprimierte PDF ist zum Download bereit'
  },
  
  // Modern tool-specific section (comprehensive like rotate.tool)
  toolTitle: 'PDF-Komprimierungstool',
  noFileTitle: 'Keine Datei ausgewählt',
  noFileMessage: 'Bitte wählen Sie eine PDF-Datei zum Komprimieren',
  backButton: 'Zurück',
  closeButton: 'Schließen',
  currentSize: 'Aktuelle Größe',
  estimatedSavings: 'geschätzte Einsparung',
  forecastedSaving: 'geschätzt basierend auf Dateianalyse',
  
  trustIndicators: {
    privateProcessing: 'Private Verarbeitung',
    intelligentCompression: 'Intelligente Komprimierung'
  },
  
  qualitySettings: {
    title: 'Qualitätseinstellungen',
    subtitle: 'Wählen Sie die richtige Balance zwischen Qualität und Dateigröße',
    qualityLevel: 'Qualitätsstufe',
    smallerSize: 'Kleinere Größe',
    betterQuality: 'Bessere Qualität',
    qualityLabels: {
      maxCompression: 'Maximale Komprimierung',
      highCompression: 'Hohe Komprimierung',
      mediumCompression: 'Mittlere Komprimierung', 
      optimal: 'Optimal',
      highQuality: 'Hohe Qualität'
    }
  },
  
  previewCards: {
    maxCompression: {
      title: 'Maximale Komprimierung',
      subtitle: 'Kleinste Dateigröße'
    },
    optimal: {
      title: 'Optimale Balance',
      subtitle: 'Bestes Qualitäts-/Größenverhältnis'
    },
    highQuality: {
      title: 'Hohe Qualität',
      subtitle: 'Beste visuelle Qualität'
    }
  },
  
  advancedSettings: {
    title: 'Erweiterte Einstellungen',
    subtitle: 'Komprimierungsoptionen feinabstimmen',
    compressImages: {
      title: 'Bilder komprimieren',
      description: 'Bilder für kleinere Dateigröße optimieren'
    },
    removeMetadata: {
      title: 'Metadaten entfernen',
      description: 'Dokumenteigenschaften und Kommentare entfernen'
    },
    optimizeForWeb: {
      title: 'Für Web optimieren',
      description: 'PDF für schnelle Online-Anzeige vorbereiten'
    }
  },
  
  processing: {
    title: 'Ihre PDF wird komprimiert',
    startingMessage: 'Komprimierungsprozess wird gestartet...',
    defaultMessage: 'Ihre PDF-Datei wird verarbeitet...',
    progressLabel: 'Fortschritt'
  },
  
  errors: {
    selectFile: 'Bitte wählen Sie eine PDF-Datei zum Komprimieren',
    compressionError: 'PDF-Datei konnte nicht komprimiert werden',
    unknownError: 'Ein unerwarteter Fehler ist aufgetreten',
    processingError: 'Verarbeitungsfehler'
  },
  
  infoBox: {
    title: 'Wie es funktioniert',
    description: 'Unsere intelligenten Komprimierungsalgorithmen analysieren Ihre PDF und wenden optimale Einstellungen an, um die Dateigröße zu reduzieren und dabei die visuelle Qualität zu erhalten. Ihre Dateien werden lokal für maximale Privatsphäre verarbeitet.'
  },
  
  actions: {
    compress: 'PDF komprimieren',
    compressing: 'Komprimiere...',
    cancel: 'Abbrechen',
    back: 'Zurück'
  },
  
  // Legacy compatibility keys (for old CompressionTool)
  starting: 'Komprimierungsprozess wird gestartet...',
  failed: 'PDF-Datei konnte nicht komprimiert werden',
  fileToCompress: 'Zu komprimierende Datei',
  smaller: 'kleiner',
  estimated: 'geschätzt',
  settings: {
    title: 'Komprimierungseinstellungen',
    qualityLevel: 'Qualitätsstufe',
    smallerFile: 'Kleinere Datei',
    betterQuality: 'Bessere Qualität',
    compressImages: 'Bilder komprimieren',
    removeMetadata: 'Metadaten entfernen',
    optimizeForWeb: 'Für Web optimieren'
  },
  howItWorks: 'Wie es funktioniert',
  howItWorksDescription: 'Intelligente Algorithmen reduzieren die Dateigröße durch Optimierung von Bildern, Schriften und das Entfernen unnötiger Daten',
  compressing: 'PDF wird komprimiert...',
  
  // Additional results keys used by CompressPDFPage
  successTitle: 'PDF-Komprimierung abgeschlossen!',
  downloadCompressed: 'Komprimierte PDF herunterladen',
  download: 'Herunterladen',
  compressAnother: 'Weitere PDF komprimieren',
  sizeReduced: 'Größe reduziert von',
  to: 'auf',
  readyForDownload: 'Ihre komprimierte PDF ist zum Download bereit'
};