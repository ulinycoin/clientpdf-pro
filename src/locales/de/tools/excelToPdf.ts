/**
 * Excel to PDF tool translations for DE language
 * Contains: page metadata, upload zone, tool interface, conversion options, progress
 * Complete localization following established methodology
 */

export const excelToPdf = {
  // Basic properties for tools grid
  title: 'Excel zu PDF',
  description: 'Excel-Tabellen in PDF-Dokumente konvertieren',
  
  // Page metadata (SEO)
  pageTitle: 'Excel zu PDF kostenlos konvertieren - LocalPDF',
  pageDescription: 'Excel-Tabellen mit Layoutbeibehaltung in PDF-Dokumente konvertieren.',
  
  // Upload section
  uploadSection: {
    title: 'Excel-Datei hochladen',
    subtitle: 'Excel-Tabellen mit vollständiger Formatierung und Datenbeibehaltung in PDF konvertieren',
    supportedFormats: 'XLSX, XLS Dateien bis zu 100MB'
  },
  
  // Tool interface
  tool: {
    title: 'Excel zu PDF Konverter',
    description: 'Excel-Tabellen in PDF-Dokumente konvertieren',
    
    // Features
    features: {
      title: 'Konvertierungsfeatures:',
      multipleSheets: 'Unterstützung für Auswahl mehrerer Blätter',
      preserveFormatting: 'Alle Formatierungen und Stile beibehalten',
      customSettings: 'Flexible Konvertierungseinstellungen',
      highQuality: 'Hochwertige PDF-Ausgabe'
    },
    
    // Sheet selection
    sheetSelection: {
      title: 'Zu konvertierende Blätter auswählen',
      selectAll: 'Alle auswählen',
      deselectAll: 'Alle abwählen',
      selectedSheets: 'Ausgewählte Blätter ({count})'
    },
    
    // Conversion options
    pageSize: 'Seitengröße',
    pageSizeOptions: {
      a4: 'A4 (210 × 297 mm)',
      letter: 'Letter (8.5 × 11 Zoll)',
      a3: 'A3 (297 × 420 mm)'
    },
    
    orientation: 'Ausrichtung',
    orientationOptions: {
      portrait: 'Hochformat',
      landscape: 'Querformat'
    },
    
    includeSheetNames: 'Blattnamen in PDF einschließen',
    
    // Actions
    convertToPdf: 'Zu PDF konvertieren 📊',
    converting: 'Konvertierung läuft...',
    
    // Progress
    analyzing: 'Excel-Datei wird analysiert...',
    convertingSheet: 'Blatt {current} von {total} wird konvertiert...'
  },
  
  // Direct tool interface translations (used by ExcelToPDFTool component)
  conversionSettings: 'Konvertierungseinstellungen',
  fileInformation: 'Datei-Informationen',
  selectSheets: 'Zu konvertierende Blätter auswählen',
  selectAll: 'Alle auswählen',
  deselectAll: 'Alle abwählen',
  rowsColumns: '{rows} Zeilen × {cols} Spalten',
  pageOrientation: 'Seitenausrichtung',
  portrait: 'Hochformat',
  landscape: 'Querformat',
  pageSize: 'Seitengröße',
  fontSize: 'Schriftgröße',
  
  // Settings sections
  pageSetup: 'Seite einrichten',
  formatting: 'Formatierung',
  margins: 'Ränder',
  options: 'Optionen',
  
  // Margin labels
  marginTop: 'Oben',
  marginBottom: 'Unten',
  marginLeft: 'Links',
  marginRight: 'Rechts',
  
  outputFormat: 'Ausgabeformat',
  singlePdf: 'Einzelne PDF-Datei',
  separatePdfs: 'Separate PDF für jedes Blatt',
  includeSheetNames: 'Blattnamen in PDF einschließen',
  convertToPdf: 'Zu PDF konvertieren 📊',
  converting: 'Konvertierung läuft...',
  conversionCompleted: 'Konvertierung abgeschlossen!',
  pdfReady: 'Ihre PDF ist zum Download bereit',
  multipleFiles: '{count} Dateien sind zum Download bereit',
  file: 'Datei',
  size: 'Größe',
  sheets: 'Blätter',
  languages: 'Sprachen',
  multiLanguageNote: 'Diese Datei enthält mehrere Sprachen und erfordert möglicherweise spezielle Behandlung',
  chooseDifferentFile: 'Andere Datei wählen',
  
  // Legacy compatibility
  uploadTitle: 'Excel zu PDF',
  uploadSubtitle: 'XLSX-Dateien in PDF-Format konvertieren',
  supportedFormats: 'XLSX-Dateien bis zu 100MB',
  
  buttons: {
    startConverting: 'Zu PDF konvertieren 📊',
    processing: 'Excel wird konvertiert...',
    download: 'PDF herunterladen'
  },
  
  messages: {
    processing: 'Excel-Tabelle wird zu PDF konvertiert...',
    success: 'Tabelle erfolgreich konvertiert!',
    error: 'Fehler beim Konvertieren von Excel zu PDF'
  }
};