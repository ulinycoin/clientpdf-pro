/**
 * Watermark tool translations for DE language
 * Contains: page metadata, upload zone, tool interface, settings, preview, progress
 * Complete localization following rotate-pdf methodology
 */

export const watermark = {
  // Basic properties for tools grid
  title: 'Wasserzeichen hinzufügen',
  description: 'Text-Wasserzeichen zum Schutz von Dokumenten hinzufügen',
  
  // Page metadata (SEO)
  pageTitle: 'Wasserzeichen zu PDF kostenlos hinzufügen - LocalPDF',
  pageDescription: 'Fügen Sie Text-Wasserzeichen zu PDF-Dateien zum Schutz hinzu. Kostenloses PDF-Wasserzeichen-Tool mit Datenschutz.',
  
  // Upload section (for WatermarkPDFPage)
  upload: {
    title: 'Wasserzeichen hinzufügen',
    description: 'Schützen Sie Ihre Dokumente mit benutzerdefinierten Wasserzeichen',
    supportedFormats: 'PDF-Dateien bis 100MB',
    selectedFile: 'Ausgewählte Datei',
    readyToWatermark: 'Bereit zum Hinzufügen von Wasserzeichen',
    removeFile: 'Datei entfernen',
    startWatermarking: 'Wasserzeichen hinzufügen 💧'
  },

  // Results section (for completion state)
  results: {
    successTitle: 'Wasserzeichen erfolgreich hinzugefügt!',
    successDescription: 'Ihr PDF ist jetzt mit einem Wasserzeichen geschützt',
    downloadTitle: 'Geschützte Datei herunterladen',
    readyToDownload: 'Bereit zum Herunterladen',
    addAnotherWatermark: 'Wasserzeichen zu anderem PDF hinzufügen'
  },
  
  // Main WatermarkTool interface
  tool: {
    toolTitle: 'Wasserzeichen-Tool',
    toolDescription: 'Konfigurieren und Wasserzeichen zu Ihrem PDF-Dokument hinzufügen',
    fileSizeUnit: 'MB',
    
    fileInfo: {
      pdfPreview: 'PDF-Vorschau'
    },
    
    preview: {
      title: 'Vorschau',
      enterTextPrompt: 'Wasserzeichen-Text eingeben',
      pageLabel: 'Seite 1',
      livePreviewDescription: 'Vorschau zeigt ungefähre Wasserzeichen-Platzierung',
      previewWillAppear: 'Vorschau erscheint nach Texteingabe'
    },
    
    settings: {
      title: 'Wasserzeichen-Einstellungen',
      
      watermarkText: {
        label: 'Wasserzeichen-Text',
        placeholder: 'Wasserzeichen-Text eingeben...',
        charactersRemaining: 'verbleibende Zeichen'
      },
      
      fontFamily: {
        label: 'Schriftfamilie'
      },
      
      fontSize: {
        label: 'Schriftgröße',
        rangeLabels: {
          small: 'Klein',
          large: 'Groß'
        }
      },
      
      opacity: {
        label: 'Deckkraft',
        rangeLabels: {
          transparent: 'Transparent',
          opaque: 'Undurchsichtig'
        }
      },
      
      rotation: {
        label: 'Drehung'
      },
      
      position: {
        label: 'Position',
        positions: {
          center: 'Mitte',
          topLeft: 'Oben Links',
          topRight: 'Oben Rechts',
          bottomLeft: 'Unten Links',
          bottomRight: 'Unten Rechts'
        }
      },
      
      textColor: {
        label: 'Textfarbe',
        colors: {
          gray: 'Grau',
          red: 'Rot',
          blue: 'Blau',
          green: 'Grün',
          black: 'Schwarz',
          orange: 'Orange'
        }
      },
      
      fontRecommendation: {
        title: 'Schrift-Empfehlung',
        supportsCyrillic: '(unterstützt Kyrillisch)'
      },
      
      fontSupport: {
        supported: 'Gewählte Schrift unterstützt Ihren Text',
        mayNotSupport: 'Schrift unterstützt möglicherweise nicht alle eingegebenen Zeichen'
      }
    },
    
    progress: {
      addingWatermark: 'Wasserzeichen hinzufügen',
      completed: 'abgeschlossen'
    },
    
    error: {
      title: 'Fehler'
    },
    
    privacy: {
      title: 'Datenschutz',
      description: 'Ihre Dateien werden lokal im Browser verarbeitet. Keine Daten werden an Server gesendet.'
    },
    
    success: {
      title: 'Wasserzeichen erfolgreich hinzugefügt!',
      description: 'Ihr PDF-Dokument ist jetzt mit einem Wasserzeichen geschützt',
      downloadAgain: 'Erneut herunterladen'
    },
    
    actions: {
      addWatermark: 'Wasserzeichen hinzufügen',
      adding: 'Hinzufügen...',
      cancel: 'Abbrechen',
      processAnother: 'Andere Datei verarbeiten'
    },
    
    fileErrors: {
      noFileSelected: 'Bitte wählen Sie eine PDF-Datei zum Hinzufügen eines Wasserzeichens'
    }
  },
  
  // Legacy compatibility
  uploadTitle: 'Wasserzeichen zu PDF hinzufügen',
  uploadSubtitle: 'Schützen Sie Ihre Dokumente mit benutzerdefinierten Wasserzeichen',
  supportedFormats: 'PDF-Dateien bis 100MB',
  selectedFile: 'Ausgewählte Datei',
  readyToWatermark: 'Bereit zum Hinzufügen von Wasserzeichen',
  removeFile: 'Datei entfernen',
  fileSizeUnit: 'MB',
  
  buttons: {
    startWatermarking: 'Wasserzeichen hinzufügen 💧',
    processing: 'Wasserzeichen wird hinzugefügt...',
    download: 'PDF mit Wasserzeichen herunterladen',
    backToTools: 'Zurück zu Tools'
  },
  
  messages: {
    processing: 'Wasserzeichen wird zu Ihrem PDF hinzugefügt...',
    success: 'Wasserzeichen erfolgreich hinzugefügt!',
    downloadReady: 'Ihr PDF mit Wasserzeichen ist bereit',
    error: 'Fehler beim Hinzufügen von Wasserzeichen zum PDF',
    noFileSelected: 'Bitte wählen Sie eine PDF-Datei'
  },
  
  errors: {
    invalidFile: 'Ungültiges PDF-Dateiformat',
    fileTooLarge: 'Dateigröße überschreitet 100MB-Limit',
    processingFailed: 'Fehler beim Hinzufügen von Wasserzeichen zum PDF'
  }
};