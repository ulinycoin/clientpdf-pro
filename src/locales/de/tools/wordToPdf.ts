/**
 * Word to PDF tool translations for DE language
 * Contains: page metadata, upload zone, tool interface, settings, processing messages
 */

export const wordToPdf = {
  // Basic properties for tools grid
  title: 'Word zu PDF',
  description: 'Word-Dokumente in PDF-Format konvertieren',
  
  // Page metadata (SEO)
  pageTitle: 'Word kostenlos zu PDF konvertieren - LocalPDF',
  pageDescription: 'Konvertieren Sie Word-Dokumente in PDF-Dateien mit perfekter Formatierungsbewahrung. Unterstützt DOCX-Dateien, vollständig privat und sicher.',
  
  // Upload zone translations  
  uploadTitle: 'Word zu PDF konvertieren',
  uploadSubtitle: 'DOCX-Dokumente hochladen und in PDF-Format konvertieren',
  supportedFormats: 'DOCX-Dateien bis 100MB',
  
  // Tool interface translations
  tool: {
    title: 'Word zu PDF Konverter',
    uploadTitle: 'Word-Dokument auswählen',
    uploadSubtitle: 'Wählen Sie eine DOCX-Datei zur PDF-Konvertierung',
    supportedFormats: 'DOCX-Dateien werden unterstützt (bis 100MB)',
    
    compatibility: {
      msWord: 'Microsoft Word 2007+ (.docx)',
      googleDocs: 'Google Docs als DOCX exportiert',
      docWarning: 'Legacy .doc-Dateien werden nicht unterstützt - verwenden Sie .docx',
      localProcessing: 'Lokal in Ihrem Browser verarbeitet'
    },
    
    preview: {
      title: 'PDF-Vorschau',
      description: 'Konvertieren Sie Ihr Dokument, um die PDF-Vorschau zu sehen',
      generating: 'PDF-Vorschau wird generiert...',
      waitMessage: 'Bitte warten Sie, während wir Ihr Dokument vorbereiten',
      placeholder: 'PDF-Vorschau wird hier erscheinen',
      uploadPrompt: 'Laden Sie ein Word-Dokument hoch, um zu beginnen',
      error: 'Vorschau konnte nicht generiert werden',
      errorTitle: 'Vorschau-Fehler',
      tryAgain: 'Erneut versuchen',
      zoomOut: 'Herauszoomen',
      zoomIn: 'Hineinzoomen'
    },
    
    settings: {
      title: 'Konvertierungseinstellungen',
      hide: 'Ausblenden',
      show: 'Anzeigen',
      pageSetup: {
        title: 'Seiteneinrichtung',
        pageSize: 'Seitengröße',
        pageSizeOptions: {
          a4: 'A4 (210 × 297 mm)',
          letter: 'Letter (8,5 × 11 Zoll)',
          a3: 'A3 (297 × 420 mm)'
        }
      },
      margins: {
        title: 'Seitenränder (mm)',
        top: 'Oben',
        right: 'Rechts',
        bottom: 'Unten',
        left: 'Links'
      },
      typography: {
        title: 'Typografie',
        fontSize: 'Schriftgröße',
        fontSizeOptions: {
          small: '10pt (Klein)',
          normal11: '11pt',
          normal12: '12pt (Normal)',
          large: '14pt (Groß)',
          extraLarge: '16pt (Sehr groß)'
        }
      },
      advanced: {
        title: 'Erweiterte Optionen',
        embedFonts: 'Schriftarten für bessere Kompatibilität einbetten',
        compression: 'PDF komprimieren (kleinere Dateigröße)',
        resetDefaults: 'Auf Standardwerte zurücksetzen'
      }
    },
    
    fileInfo: {
      title: 'Dokumentinformationen',
      fileName: 'Dateiname',
      fileSize: 'Dateigröße',
      fileType: 'Dateityp',
      microsoftWord: 'Microsoft Word',
      privacyNote: 'Ihr Dokument wird lokal verarbeitet - niemals hochgeladen'
    },
    
    buttons: {
      convertToPdf: 'Zu PDF konvertieren',
      converting: 'Konvertierung läuft...',
      download: 'PDF herunterladen',
      chooseDifferent: 'Andere Datei wählen',
      hidePreview: 'Vorschau ausblenden',
      showPreview: 'Vorschau anzeigen & herunterladen'
    },
    
    messages: {
      conversionCompleted: 'Konvertierung abgeschlossen!',
      conversionFailed: 'Konvertierung fehlgeschlagen',
      processing: 'Word-Dokument wird zu PDF konvertiert...',
      noFile: 'Kein Word-Dokument ausgewählt',
      converting: 'Dokument wird zu PDF konvertiert...',
      downloadHint: 'Nach der Konvertierung verwenden Sie den Download-Button im Vorschau-Panel',
      processingDescription: 'Verarbeitung Ihres Word-Dokuments...',
      progress: 'Fortschritt',
      unknownError: 'Ein unerwarteter Fehler ist bei der Konvertierung aufgetreten'
    }
  },
  
  // Processing buttons and states
  buttons: {
    startConverting: 'Zu PDF konvertieren 📄',
    converting: 'Word wird konvertiert...',
    download: 'PDF herunterladen',
    backToTools: 'Zurück zu den Tools',
    selectNewFile: 'Neue Datei auswählen'
  },
  
  // Processing messages
  messages: {
    processing: 'Word-Dokument wird zu PDF konvertiert...',
    success: 'Dokument erfolgreich konvertiert!',
    downloadReady: 'Ihre PDF ist zum Download bereit',
    error: 'Fehler beim Konvertieren von Word zu PDF',
    noFileSelected: 'Bitte wählen Sie ein Word-Dokument zur Konvertierung',
    invalidFormat: 'Bitte wählen Sie eine gültige DOCX-Datei'
  },
  
  // Tool-specific content
  howItWorks: {
    title: 'So funktioniert die Word zu PDF Konvertierung',
    description: 'Unser Konverter wandelt Word-Dokumente in professionelle PDF-Dateien um und behält dabei die Formatierung bei',
    steps: [
      'Laden Sie Ihre DOCX-Datei von Ihrem Gerät hoch',
      'Passen Sie die Konvertierungseinstellungen bei Bedarf an', 
      'Klicken Sie auf Konvertieren, um die PDF zu erstellen',
      'Laden Sie Ihre konvertierte PDF-Datei herunter'
    ]
  },
  
  // Benefits specific to word to pdf tool
  benefits: {
    title: 'Warum unseren Word zu PDF Konverter verwenden?',
    features: [
      'Perfekte Formatierungsbewahrung',
      'Behält Dokumentstruktur und Gestaltung bei',
      'Einstellbare Konvertierungsoptionen',
      'Sofortige Verarbeitung in Ihrem Browser'
    ]
  },
  
  // Error handling
  errors: {
    invalidFile: 'Ungültiges Word-Dokumentformat',
    fileTooLarge: 'Dateigröße überschreitet 100MB-Limit',
    conversionFailed: 'Fehler beim Konvertieren des Dokuments',
    noFileUploaded: 'Kein Word-Dokument ausgewählt',
    corruptedFile: 'Dokument scheint beschädigt zu sein',
    unsupportedVersion: 'Bitte verwenden Sie das DOCX-Format (Word 2007+)'
  }
};