/**
 * Split PDF tool translations for EN language
 * Contains: page metadata, upload zone, split options, processing messages
 */

export const split = {
  // Basic properties for tools grid
  title: 'PDF aufteilen',
  description: 'PDF-Dateien in separate Seiten oder Bereiche aufteilen',
  
  // Page metadata (SEO)
  pageTitle: 'Split PDF Files for Free - LocalPDF',
  pageDescription: 'Split PDF files into separate pages or custom ranges. Free PDF splitter tool with complete privacy protection. No uploads required.',
  
  // Upload zone translations (legacy flat structure)
  uploadTitle: 'PDF zum Aufteilen hochladen',
  uploadSubtitle: 'PDF-Seiten in einzelne Dokumente aufteilen',
  uploadDescription: 'PDF-Seiten in einzelne Dokumente aufteilen',
  supportedFormats: 'PDF-Dateien bis zu 100MB',
  
  // Upload zone (nested structure for components)
  upload: {
    title: 'PDF-Datei zum Aufteilen hochladen',
    description: 'Einzelne Seiten oder Bereiche aus PDF-Dokumenten extrahieren',
    supportedFormats: 'PDF-Dateien bis zu 100MB',
    selectedFile: 'Ausgewählte Datei ({count})',
    readyToSplit: 'Bereit zum Aufteilen',
    removeFile: 'Datei entfernen',
    startSplitting: 'PDF-Datei aufteilen ✂️'
  },
  
  // File management
  selectedFile: 'Ausgewählte Datei',
  readyToSplit: 'Bereit zum Aufteilen',
  removeFile: 'Datei entfernen',
  fileSizeUnit: 'MB',
  
  // Split options
  options: {
    title: 'Split Options',
    splitByPages: 'Split by Pages',
    splitByRanges: 'Split by Custom Ranges',
    allPages: 'Every page as separate file',
    customRanges: 'Custom page ranges',
    pageRange: 'Page Range (e.g. 1-5, 7, 10-12)',
    rangeHelp: 'Enter ranges like: 1-3, 5, 7-10'
  },
  
  // Processing buttons and states
  buttons: {
    startSplitting: 'Split PDF =�',
    splitting: 'Splitting PDF...',
    downloadFiles: 'Download Split Files',
    downloadZip: 'Download as ZIP',
    backToTools: 'Back to Tools'
  },
  
  // Processing messages
  messages: {
    processing: 'Splitting your PDF file...',
    progress: 'Processing page {current} of {total}',
    success: 'PDF split successfully!',
    downloadReady: 'Your split files are ready for download',
    error: 'Failed to split PDF file',
    noFileSelected: 'Please select a PDF file to split',
    invalidRange: 'Invalid page range specified',
    filesCreated: '{count} files created from your PDF'
  },
  
  // Results display (for SplitPDFPage)
  results: {
    successTitle: 'PDF erfolgreich aufgeteilt!',
    successDescription: '{count} Dateien erstellt',
    downloadAllZip: 'Alle als ZIP herunterladen',
    downloadAllZipDescription: 'ZIP-Archiv herunterladen ({count} Dateien)',
    downloadIndividually: 'Dateien einzeln herunterladen:',
    pageFileName: 'Seite {pageNumber}.pdf',
    rangeFileName: 'Seiten {startPage}-{endPage}.pdf',
    genericFileName: 'Datei {index}.pdf',
    fileReady: 'Download bereit',
    splitAnother: 'Weitere Datei aufteilen'
  },
  
  // Tool info
  howItWorks: {
    title: 'How PDF Splitting Works',
    description: 'Our split tool separates PDF pages while preserving original quality and formatting',
    steps: [
      'Upload your PDF file from your device',
      'Choose how you want to split the document',
      'Specify page ranges or select all pages',
      'Download individual files or as ZIP archive'
    ]
  },
  
  // ModernSplitTool specific translations
  tool: {
    fileNotSelected: 'Keine Datei ausgewählt',
    fileNotSelectedDescription: 'Bitte wählen Sie eine PDF-Datei zum Aufteilen',
    toolTitle: 'PDF-Datei Aufteiler',
    trustIndicators: {
      private: 'Private Verarbeitung',
      quality: 'Hohe Qualität'
    },
    modes: {
      title: 'Aufteilungsmodus',
      description: 'Wählen Sie, wie die PDF aufgeteilt werden soll',
      all: {
        title: 'In einzelne Seiten aufteilen',
        description: 'Jede Seite wird zu einer separaten PDF-Datei',
        shortDescription: 'Jede Seite wird zu einer separaten PDF-Datei'
      },
      range: {
        title: 'Seitenbereich extrahieren',
        description: 'Einen bestimmten Seitenbereich auswählen',
        shortDescription: 'Seiten {startPage}-{endPage} werden in eine Datei extrahiert'
      },
      specific: {
        title: 'Bestimmte Seiten extrahieren',
        description: 'Seitenzahlen durch Kommas getrennt angeben',
        shortDescription: 'Ausgewählte Seiten werden zu einzelnen Dateien'
      }
    },
    rangeInputs: {
      title: 'Seitenbereich',
      description: 'Start- und Endseite angeben',
      fromPage: 'Von Seite',
      toPage: 'Bis Seite'
    },
    specificInputs: {
      title: 'Bestimmte Seiten',
      description: 'Seitenzahlen durch Kommas getrennt eingeben',
      placeholder: 'z.B.: 1, 3, 5-7, 10',
      helpText: 'Verwenden Sie Kommas zur Trennung und Bindestriche für Bereiche (z.B.: 1, 3, 5-7)'
    },
    zipOption: {
      title: 'Als ZIP-Archiv verpacken',
      description: 'Empfohlen bei Aufteilung in 5+ Seiten'
    },
    progress: {
      title: 'Aufteilung läuft',
      analyzing: 'PDF-Datei wird analysiert...',
      splitting: 'Seiten werden aufgeteilt...',
      label: 'Fortschritt'
    },
    errors: {
      startPageTooLarge: 'Startseite kann nicht größer als Endseite sein',
      invalidPageNumbers: 'Bitte geben Sie gültige Seitenzahlen ein',
      splittingFailed: 'Aufteilung fehlgeschlagen: {error}',
      unknownError: 'Fehler beim Aufteilen der PDF',
      processingError: 'Verarbeitungsfehler'
    },
    buttons: {
      split: 'PDF aufteilen',
      back: 'Zurück',
      close: 'Schließen',
      cancel: 'Abbrechen',
      processing: 'Verarbeitung...'
    },
    fileSizeUnit: 'MB'
  },
  
  // Error handling (legacy)
  errors: {
    invalidFile: 'Ungültiges PDF-Dateiformat',
    fileTooLarge: 'Dateigröße überschreitet 100MB-Limit',
    processingFailed: 'Verarbeitung der PDF-Datei fehlgeschlagen',
    invalidPageRange: 'Ungültiges Seitenbereich-Format',
    pageOutOfRange: 'Seitenzahl überschreitet Dokumentlänge'
  }
};