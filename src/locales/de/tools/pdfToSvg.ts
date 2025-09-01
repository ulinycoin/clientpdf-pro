/**
 * PDF to SVG tool translations for DE language
 * Contains: page metadata, upload zone, tool interface, conversion options, progress, results
 * Complete localization following established methodology
 */

export const pdfToSvg = {
  // Basic properties for tools grid
  title: 'PDF zu SVG',
  description: 'PDF-Seiten in skalierbare Vektorgrafiken (SVG) konvertieren',
  
  // Page metadata (SEO)
  pageTitle: 'PDF zu SVG kostenlos konvertieren - LocalPDF',
  pageDescription: 'PDF-Seiten in SVG-Vektoren konvertieren. Hochwertige PDF-zu-SVG-Konvertierung mit skalierbaren Grafiken.',
  
  // Upload zone (for PDFToSvgPage)
  uploadTitle: 'PDF-Datei hochladen, um sie in SVG zu konvertieren',
  uploadSubtitle: 'PDF-Seiten in skalierbare Vektorgrafiken umwandeln',
  supportedFormats: 'PDF-Dateien',
  selectedFile: 'Ausgewählte Datei ({count})',
  readyToConvert: 'Bereit zur SVG-Konvertierung',
  removeFile: 'Datei entfernen',
  fileSizeUnit: 'MB',
  
  // Results section
  results: {
    successTitle: 'PDF erfolgreich in SVG konvertiert!',
    successDescription: 'Alle PDF-Seiten in skalierbare Vektorgrafiken konvertiert',
    convertAnotherFile: 'Weitere Datei konvertieren',
    conversionComplete: 'SVG-Konvertierung erfolgreich abgeschlossen!',
    processingTitle: 'SVG-Konvertierung läuft',
    processingMessage: 'Bearbeitung von Seite {current} von {total}',
    pagesConverted: 'Seiten konvertiert',
    format: 'Format',
    totalSize: 'Gesamtgröße',
    processingTime: 'Verarbeitungszeit',
    preview: 'Vorschau',
    downloadSvgs: 'SVG-Dateien herunterladen',
    downloadAll: 'Alle SVG-Dateien herunterladen ({count})',
    downloadIndividual: 'Einzelne SVG-Dateien herunterladen',
    pageLabel: 'Seite {number}',
    seconds: 's'
  },
  
  // Tool interface (for PdfToSvgTool)
  tool: {
    title: 'PDF zu SVG Konverter',
    description: 'PDF-Seiten in skalierbare Vektorgrafiken konvertieren',
    noFileSelected: 'Keine PDF-Datei ausgewählt',
    noFileDescription: 'Bitte wählen Sie eine PDF-Datei für die SVG-Konvertierung aus',
    selectFile: 'PDF-Datei auswählen',
    conversionSettingsTitle: 'Konvertierungseinstellungen',
    
    // Quality settings
    qualityTitle: 'Qualität & Auflösung',
    qualityDescription: 'Höhere Qualität erzeugt bessere Vektoren, aber größere Dateien',
    qualities: {
      low: 'Grundlegende Qualität, kleinere Dateien',
      medium: 'Ausgewogene Qualität und Größe',
      high: 'Hohe Qualität, detaillierte Vektoren',
      maximum: 'Maximale Qualität, größte Dateien'
    },
    
    // Conversion method
    methodTitle: 'Konvertierungsmethode',
    methodDescription: 'Wählen zwischen schnellem Canvas oder Vektorextraktion',
    methods: {
      canvas: 'Canvas-basierte Konvertierung - schnell, aber rasterisierter Inhalt',
      vector: 'Vektorextraktion - langsamer, aber echte skalierbare Vektoren (zukünftiges Feature)'
    },
    
    // Advanced options
    advancedTitle: 'Erweiterte Optionen',
    includeText: 'Textelemente einschließen',
    includeTextDesc: 'Text als auswählbare Elemente erhalten',
    includeImages: 'Bilder einschließen',
    includeImagesDesc: 'Bilder in SVG-Ausgabe einbetten',
    
    // Page selection
    pageSelectionTitle: 'Zu konvertierende Seiten',
    pageSelection: {
      all: 'Alle Seiten',
      range: 'Seitenbereich',
      specific: 'Bestimmte Seiten'
    },
    pageRangeFrom: 'Von Seite',
    pageRangeTo: 'Bis Seite',
    specificPagesPlaceholder: 'z.B. 1,3,5-10',
    specificPagesHelp: 'Seitenzahlen durch Kommas getrennt eingeben',
    
    // Background color
    backgroundTitle: 'Hintergrundfarbe',
    backgroundDescription: 'Hintergrundfarbe für transparente Bereiche',
    
    // Progress and actions
    startConversion: 'In SVG konvertieren 📐',
    converting: 'Konvertierung läuft...',
    cancel: 'Abbrechen',
    close: 'Schließen',
    backToUpload: 'Zurück zum Upload',
    supportInfo: 'Dateien bis 100MB unterstützt • SVG-Format • Skalierbare Vektoren'
  },
  
  // Processing messages
  progress: {
    analyzing: 'PDF-Datei wird analysiert...',
    converting: 'Seiten werden in SVG konvertiert...',
    page: 'Seite {current} von {total}',
    finalizing: 'SVG-Konvertierung wird abgeschlossen...',
    complete: 'SVG-Konvertierung abgeschlossen!'
  },
  
  // Legacy compatibility
  buttons: {
    startConverting: 'In SVG konvertieren 📐',
    processing: 'Konvertierung zu SVG...',
    downloadZip: 'SVG-Dateien herunterladen (ZIP)'
  },
  
  messages: {
    processing: 'PDF-Seiten werden in SVG konvertiert...',
    success: 'SVG-Konvertierung erfolgreich abgeschlossen!',
    error: 'Fehler bei der PDF-zu-SVG-Konvertierung'
  },
  
  // Error handling
  errors: {
    invalidFile: 'Ungültiges PDF-Dateiformat',
    fileTooLarge: 'Dateigröße überschreitet das 100MB-Limit',
    conversionFailed: 'PDF-zu-SVG-Konvertierung fehlgeschlagen',
    noPages: 'Keine Seiten in der PDF gefunden',
    invalidPageRange: 'Ungültiger Seitenbereich angegeben',
    invalidOptions: 'Ungültige Konvertierungsoptionen',
    processingError: 'Fehler bei der SVG-Verarbeitung'
  }
};