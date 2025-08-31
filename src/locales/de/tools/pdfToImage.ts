/**
 * PDF to Image tool translations for DE language
 * Contains: page metadata, upload zone, tool interface, format options, progress, results
 * Complete localization following established methodology
 */

export const pdfToImage = {
  // Basic properties for tools grid
  title: 'PDF zu Bildern',
  description: 'PDF-Seiten in Bilddateien konvertieren (PNG, JPEG)',
  
  // Page metadata (SEO)
  pageTitle: 'PDF kostenlos zu Bildern konvertieren - LocalPDF',
  pageDescription: 'Konvertieren Sie PDF-Seiten zu PNG- oder JPEG-Bildern. Hochqualitative PDF-zu-Bild-Konvertierung.',
  
  // Upload zone (for PDFToImagePage)
  uploadTitle: 'PDF-Datei hochladen, um sie zu Bildern zu konvertieren',
  uploadSubtitle: 'PDF-Seiten in hochwertige JPG-, PNG- oder WebP-Bilder umwandeln',
  supportedFormats: 'PDF-Dateien',
  selectedFile: 'Ausgewählte Datei ({count})',
  readyToConvert: 'Bereit zur Konvertierung zu Bildern',
  removeFile: 'Datei entfernen',
  fileSizeUnit: 'MB',
  
  // Results section
  results: {
    successTitle: 'PDF erfolgreich zu Bildern konvertiert!',
    successDescription: 'Alle PDF-Seiten wurden zu Bildern konvertiert',
    convertAnotherFile: 'Weitere Datei konvertieren',
    conversionComplete: 'Konvertierung erfolgreich abgeschlossen!',
    processingTitle: 'Konvertierung läuft',
    processingMessage: 'Verarbeite Seite {current} von {total}',
    pagesConverted: 'Seiten konvertiert',
    format: 'Format',
    totalSize: 'Gesamtgröße',
    processingTime: 'Verarbeitungszeit',
    preview: 'Vorschau',
    downloadImages: 'Bilder herunterladen',
    downloadAll: 'Alle Bilder herunterladen ({count})',
    downloadIndividual: 'Einzelne Bilder herunterladen',
    pageLabel: 'Seite {number}',
    seconds: 's'
  },
  
  // Tool interface (for PdfToImageTool)
  tool: {
    title: 'PDF zu Bilder Konverter',
    description: 'PDF-Seiten in hochwertige Bilddateien konvertieren',
    noFileSelected: 'Keine PDF-Datei ausgewählt',
    noFileDescription: 'Bitte wählen Sie eine PDF-Datei aus, um sie zu Bildern zu konvertieren',
    selectFile: 'PDF-Datei auswählen',
    conversionSettingsTitle: 'Konvertierungseinstellungen',
    
    // Format selection
    formatTitle: 'Bildformat',
    formatDescription: 'Ausgabeformat für Bilder wählen',
    formats: {
      png: 'Hohe Qualität mit Transparenzunterstützung (größere Dateien)',
      jpeg: 'Kleinere Dateigrößen, gut für Fotos (keine Transparenz)',
      jpg: 'JPG - Kleinere Größe, gute Qualität',
      webp: 'WebP - Modernes Format, exzellente Kompression'
    },
    
    // Quality settings
    qualityTitle: 'Bildqualität',
    qualityDescription: 'Balance zwischen Dateigröße und Qualität',
    qualities: {
      low: 'Kleinste Dateigröße, grundlegende Qualität',
      medium: 'Ausgewogene Größe und Qualität',
      high: 'Hohe Qualität, größere Dateien',
      maximum: 'Maximale Qualität, größte Dateien'
    },
    
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
    startConversion: 'Zu Bildern konvertieren 🖼️',
    converting: 'Konvertierung läuft...',
    cancel: 'Abbrechen',
    close: 'Schließen',
    backToUpload: 'Zurück zum Upload',
    supportInfo: 'Dateien bis 100MB unterstützt • PNG, JPEG Formate • Hohe Qualität'
  },
  
  // Processing messages
  progress: {
    analyzing: 'PDF-Datei wird analysiert...',
    converting: 'Seiten werden zu Bildern konvertiert...',
    page: 'Seite {current} von {total}',
    finalizing: 'Konvertierung wird abgeschlossen...',
    complete: 'Konvertierung abgeschlossen!'
  },
  
  // Legacy compatibility
  buttons: {
    startConverting: 'Zu Bildern konvertieren 🖼️',
    processing: 'Wird zu Bildern konvertiert...',
    downloadZip: 'Bilder herunterladen (ZIP)'
  },
  
  messages: {
    processing: 'PDF-Seiten werden zu Bildern konvertiert...',
    success: 'Konvertierung erfolgreich abgeschlossen!',
    error: 'Fehler beim Konvertieren von PDF zu Bildern'
  },
  
  // Error handling
  errors: {
    invalidFile: 'Ungültiges PDF-Dateiformat',
    fileTooLarge: 'Dateigröße überschreitet 100MB Limit',
    conversionFailed: 'Fehler beim Konvertieren von PDF zu Bildern',
    noPages: 'Keine Seiten in PDF gefunden',
    invalidPageRange: 'Ungültiger Seitenbereich angegeben'
  }
};