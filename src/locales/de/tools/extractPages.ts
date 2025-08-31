/**
 * Extract Pages tool translations for DE language
 * Contains: page metadata, upload zone, tool interface, selection modes, progress, results
 * Complete localization following established methodology
 */

export const extractPages = {
  // Basic properties for tools grid
  title: 'Seiten extrahieren',
  description: 'Bestimmte Seiten in ein neues Dokument extrahieren',
  
  // Page metadata (SEO)
  pageTitle: 'PDF-Seiten kostenlos extrahieren - LocalPDF',
  pageDescription: 'Extrahieren Sie bestimmte Seiten aus PDF-Dateien. Erstellen Sie neue PDFs aus ausgewählten Seitenbereichen.',
  
  // Upload section (for ExtractPagesPDFPage)
  uploadTitle: 'Seiten aus PDF extrahieren',
  uploadSubtitle: 'Wählen Sie bestimmte Seiten aus PDF-Dokument für neue Datei',
  supportedFormats: 'PDF-Dateien bis 100MB',
  selectedFile: 'Ausgewählte Datei',
  readyToExtract: 'Bereit zum Extrahieren von Seiten',
  removeFile: 'Datei entfernen',
  extractPagesButton: 'Seiten extrahieren 📑',
  
  // Main ExtractPagesTool interface
  tool: {
    title: 'PDF-Seiten extrahieren',
    titleLoading: 'PDF-Seiten extrahieren',
    description: 'Seiten zum Extrahieren auswählen aus:',
    fileInfo: {
      totalPages: 'Seiten insgesamt:',
      selected: 'Ausgewählt:',
      loadingFile: 'PDF-Datei wird geladen...',
      noFileAvailable: 'Keine PDF-Datei für Seitenextraktion verfügbar.',
      goBack: 'Zurück'
    },
    
    // Selection modes
    selectionModes: {
      individual: 'Einzeln',
      range: 'Bereich',
      all: 'Alle',
      custom: 'Benutzerdefiniert'
    },
    
    // Selection controls
    individual: {
      description: 'Klicken Sie auf Seitenzahlen unten, um einzelne Seiten auszuwählen:',
      selected: 'Ausgewählt:',
      clearAll: 'Alle löschen'
    },
    
    range: {
      from: 'Von:',
      to: 'Bis:',
      selectRange: 'Bereich auswählen',
      clear: 'Löschen'
    },
    
    all: {
      description: 'Alle {count} Seiten extrahieren (gesamtes Dokument kopieren)',
      selectAllPages: 'Alle Seiten auswählen',
      clear: 'Löschen'
    },
    
    custom: {
      label: 'Seitenbereich (z.B. "1-5, 8, 10-12"):',
      placeholder: '1-5, 8, 10-12',
      parseRange: 'Bereich parsen',
      selected: 'Ausgewählt:',
      clearAll: 'Alle löschen'
    },
    
    // Page grid
    pagesPreview: 'Seitenvorschau',
    pageTooltip: 'Seite {number}',
    pageSelected: 'Seite {number} (ausgewählt)',
    
    // Progress and results
    progress: {
      extracting: 'Seiten werden extrahiert...',
      percentage: '{progress}%'
    },
    
    success: {
      title: 'Seiten erfolgreich extrahiert!',
      extracted: '{extracted} von {total} Seiten extrahiert',
      timing: 'in {time}s'
    },
    
    // Action buttons
    actions: {
      clearSelection: 'Auswahl löschen',
      extractPages: 'Seiten extrahieren',
      extracting: 'Extrahiere...',
      readyToExtract: 'Bereit zum Extrahieren von {count} {pages}'
    },
    
    // Tips section
    tips: {
      title: '💡 Tipps zur Seitenextraktion:',
      items: [
        'Verwenden Sie den "Bereich"-Modus für fortlaufende Seiten (z.B. Seiten 1-10)',
        'Verwenden Sie den "Benutzerdefiniert"-Modus für komplexe Auswahlen (z.B. "1-5, 8, 10-12")',
        'Klicken Sie einzelne Seitenzahlen zum Umschalten der Auswahl',
        'Alle ursprüngliche Formatierung und Qualität wird beibehalten'
      ]
    },
    
    // Error handling
    errors: {
      noFileSelected: 'Bitte wählen Sie eine PDF-Datei für Seitenextraktion'
    }
  },
  
  // Legacy compatibility
  backToTools: 'Zurück zu Tools',
  fileSizeUnit: 'MB',
  buttons: {
    startExtracting: 'Seiten extrahieren 📑',
    processing: 'Seiten werden extrahiert...',
    download: 'Extrahierte Seiten herunterladen',
    backToTools: 'Zurück zu Tools'
  },
  
  messages: {
    processing: 'Seiten werden aus Ihrem PDF extrahiert...',
    success: 'Seiten erfolgreich extrahiert!',
    error: 'Fehler beim Extrahieren der Seiten'
  }
};