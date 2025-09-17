export const rotate = {
  // Basic properties for tools grid
  title: 'Seiten drehen',
  description: 'Seiten um 90, 180 oder 270 Grad drehen',
  
  // Page metadata (SEO)
  pageTitle: 'PDF-Seiten Kostenlos Drehen - LocalPDF',
  pageDescription: 'Drehen Sie PDF-Seiten um 90°, 180° oder 270°. Schnelle und sichere PDF-Drehung in Ihrem Browser. 100% privat.',
  
  // Upload zone translations
  uploadTitle: 'PDF-Seiten drehen',
  uploadSubtitle: 'Seiten in die richtige Orientierung drehen',
  supportedFormats: 'PDF-Dateien bis 100MB',
  
  // Upload section - for selected files and actions
  upload: {
    title: 'PDF-Seiten drehen',
    description: 'Seiten in die richtige Orientierung drehen',
    supportedFormats: 'PDF-Dateien bis 100MB',
    selectedFile: 'Datei ausgewählt ({count})',
    readyToRotate: 'Bereit zum Drehen',
    removeFile: 'Datei entfernen',
    startRotating: 'Seiten drehen 🔄'
  },
  
  // Results section - for completed operations
  results: {
    successTitle: 'Seiten erfolgreich gedreht!',
    successDescription: 'Ihre PDF-Datei ist bereit zum Download',
    downloadTitle: 'Gedrehte PDF herunterladen',
    rotateAnother: 'Weitere Datei drehen',
    fileSizeReduced: 'Datei bereit'
  },
  
  // Legacy structure for backwards compatibility
  selectedFile: 'Datei ausgewählt',
  readyToRotate: 'Bereit zum Drehen',
  removeFile: 'Datei entfernen',
  fileSizeUnit: 'MB',
  
  buttons: {
    startRotating: 'Seiten drehen 🔄',
    processing: 'Seiten drehen...',
    download: 'Gedrehte PDF herunterladen'
  },
  
  messages: {
    processing: 'Ihre PDF-Seiten werden gedreht...',
    success: 'Seiten erfolgreich gedreht!',
    error: 'Fehler beim Drehen der PDF-Seiten'
  },
  
  // ModernRotateTool translations
  tool: {
    fileSizeUnit: 'MB',
    pageCount: '{count} Seiten',
    fileNotSelected: 'Keine Datei ausgewählt',
    fileNotSelectedDescription: 'Bitte wählen Sie eine PDF-Datei zum Drehen aus',
    toolTitle: 'PDF-Seiten drehen',
    
    trustIndicators: {
      private: 'Private Verarbeitung',
      quality: 'Hohe Qualität'
    },
    
    rotationAngle: {
      title: 'Drehwinkel wählen',
      description: 'Wählen Sie, um wie viele Grad die Seiten gedreht werden sollen'
    },
    
    rotationOptions: {
      clockwise: {
        label: 'Um 90° im Uhrzeigersinn',
        description: 'Drehung um 90 Grad im Uhrzeigersinn'
      },
      flip: {
        label: 'Um 180° umdrehen',
        description: 'Umdrehung um 180 Grad'
      },
      counterclockwise: {
        label: 'Um 270° gegen den Uhrzeigersinn',
        description: 'Drehung um 270 Grad gegen den Uhrzeigersinn'
      }
    },
    
    pageSelection: {
      title: 'Seitenauswahl',
      description: 'Wählen Sie welche Seiten gedreht werden sollen',
      allPages: {
        label: 'Alle Seiten',
        description: 'Alle Seiten des Dokuments drehen',
        descriptionWithCount: 'Alle {count} Seiten drehen'
      },
      specificPages: {
        label: 'Bestimmte Seiten',
        description: 'Bestimmte Seiten zum Drehen auswählen'
      }
    },
    
    specificPages: {
      inputLabel: 'Seitennummern',
      placeholder: 'z.B.: 1, 3, 5-8',
      helpText: 'Geben Sie Seitennummern durch Kommas getrennt oder Bereiche durch Bindestriche ein'
    },
    
    pageOverview: {
      title: 'Seitenübersicht',
      description: 'Vorschau der Seitenausrichtung im Dokument',
      pageTooltip: 'Seite {pageNumber}: {orientation}',
      portrait: 'Hochformat',
      landscape: 'Querformat',
      portraitOrientation: 'Hochformat-Seiten',
      landscapeOrientation: 'Querformat-Seiten'
    },
    
    processing: {
      title: 'Seiten werden gedreht...',
      analyzing: 'Dokument wird analysiert...',
      rotating: 'Seiten werden gedreht...'
    },
    
    errors: {
      invalidPageNumbers: 'Ungültige Seitennummern',
      rotationFailed: 'Drehung fehlgeschlagen',
      unknownError: 'Unbekannter Fehler',
      processingError: 'Verarbeitungsfehler'
    },
    
    infoBox: {
      title: 'Hilfreiche Informationen',
      description: 'PDF-Seiten werden mit Beibehaltung der Qualität und aller Dokumentelemente gedreht.'
    },
    
    buttons: {
      rotate: 'Um {degrees}° drehen',
      processing: 'Wird verarbeitet...'
    }
  }
};