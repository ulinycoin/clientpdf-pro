/**
 * Extract Text tool translations for DE language
 * Contains: page metadata, upload zone, tool interface, options, progress, results
 * Complete localization following established methodology
 */

export const extractText = {
  // Basic properties for tools grid
  title: 'Text extrahieren',
  description: 'Textinhalt aus PDF-Dateien extrahieren',
  
  // Page metadata (SEO)
  pageTitle: 'Text aus PDF kostenlos extrahieren - LocalPDF',
  pageDescription: 'Extrahieren Sie Textinhalte kostenlos aus PDF-Dateien. Erhalten Sie Klartext aus PDF-Dokumenten mit intelligenter Formatierung.',
  
  // Upload section (for ExtractTextPDFPage)
  uploadTitle: 'Text aus PDF extrahieren',
  uploadSubtitle: 'Extrahieren Sie mit einem Klick den gesamten Textinhalt aus PDF-Dokumenten',
  supportedFormats: 'PDF-Dateien bis 100MB',
  selectedFile: 'Ausgewählte Datei',
  readyToExtract: 'Bereit für Textextraktion',
  removeFile: 'Datei entfernen',
  extractTextButton: 'Text extrahieren 📄',
  
  // Main ExtractTextTool interface
  tool: {
    title: 'Textextraktions-Tool',
    description: 'Konfigurieren Sie Textextraktionseinstellungen für Ihr PDF-Dokument',
    fileToExtract: 'Datei für Textextraktion',
    
    // Extraction options section
    extractionOptions: 'Extraktionsoptionen',
    smartFormatting: 'Intelligente Formatierung',
    smartFormattingDesc: 'Verbessert automatisch Struktur und Lesbarkeit des extrahierten Texts',
    
    formattingLevel: 'Formatierungsebene',
    levels: {
      minimal: {
        title: 'Minimal',
        desc: 'Grundlegende Bereinigung von zusätzlichen Leerzeichen und Zeilenwechseln'
      },
      standard: {
        title: 'Standard',
        desc: 'Wiederherstellung von Absätzen und grundlegender Dokumentstruktur'
      },
      advanced: {
        title: 'Erweitert',
        desc: 'Intelligente Wiederherstellung von Überschriften, Listen und Formatierung'
      }
    },
    
    includeMetadata: 'Dokumentmetadaten einschließen',
    preserveFormatting: 'Ursprüngliche Formatierung beibehalten',
    pageRange: 'Nur bestimmte Seiten extrahieren',
    
    pageRangeFields: {
      startPage: 'Startseite',
      endPage: 'Endseite',
      note: 'Leer lassen, um das gesamte Dokument zu extrahieren'
    },
    
    // Progress states
    extracting: 'Text wird extrahiert ({progress}%)',
    
    // Success results section
    success: {
      title: 'Text erfolgreich extrahiert!',
      pagesProcessed: 'Verarbeitete Seiten: {count}',
      textLength: 'Extrahierte Zeichen: {length}',
      documentTitle: 'Dokumenttitel: {title}',
      author: 'Autor: {author}',
      smartFormattingApplied: 'Intelligente Formatierung angewendet: {level}',
      fileDownloaded: 'Datei automatisch heruntergeladen',
      noTextWarning: 'Kein extrahierbarer Text im Dokument gefunden',
      
      // Before/after comparison
      comparisonPreview: 'Verbesserungsvorschau',
      before: 'Vor der Verarbeitung',
      after: 'Nach der Verarbeitung',
      notice: 'Zeigt erste 200 Zeichen zur Vorschau',
      
      // Regular text preview
      textPreview: 'Textvorschau'
    },
    
    // Error handling
    errors: {
      noFileSelected: 'Bitte wählen Sie eine PDF-Datei für die Textextraktion'
    },
    
    // Info and privacy sections
    infoBox: {
      title: 'Intelligente Textextraktion',
      description: 'Unsere Algorithmen erkennen und bewahren automatisch die Dokumentstruktur für maximale Lesbarkeit.'
    },
    
    privacy: {
      title: 'Datenschutz',
      description: 'Ihre Dateien werden lokal im Browser verarbeitet. Keine Daten werden an Server gesendet.'
    },
    
    // Button actions
    buttons: {
      extractText: 'Text extrahieren',
      extracting: 'Extrahiere...'
    }
  },
  
  // Legacy compatibility
  backToTools: 'Zurück zu Tools',
  fileSizeUnit: 'MB',
  buttons: {
    extractText: 'Text extrahieren 📄',
    extracting: 'Text wird extrahiert...',
    download: 'Textdatei herunterladen',
    backToTools: 'Zurück zu Tools'
  },
  
  messages: {
    processing: 'Text wird aus Ihrem PDF extrahiert...',
    progress: 'Verarbeitung Seite {current} von {total}',
    success: 'Textextraktion erfolgreich abgeschlossen!',
    downloadReady: 'Ihre Textdatei ist zum Download bereit',
    error: 'Fehler beim Extrahieren von Text aus PDF',
    noFileSelected: 'Bitte wählen Sie eine PDF-Datei zur Textextraktion aus',
    noTextFound: 'Kein Text in dieser PDF-Datei gefunden'
  }
};