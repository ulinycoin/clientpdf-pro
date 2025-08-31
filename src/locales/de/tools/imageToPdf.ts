/**
 * Images to PDF tool translations for DE language
 * Contains: page metadata, upload zone, tool interface, settings, progress
 * Complete localization following established methodology
 */

export const imageToPdf = {
  // Basic properties for tools grid
  title: 'Bilder zu PDF',
  description: 'Mehrere Bilder zu einem PDF-Dokument kombinieren',
  
  // Page metadata (SEO)
  pageTitle: 'Bilder kostenlos zu PDF konvertieren - LocalPDF',
  pageDescription: 'Konvertieren Sie mehrere Bilder zu einem einzigen PDF-Dokument. Unterstützung für PNG, JPEG und mehr.',
  
  // Upload section (for ImageToPDFToolWrapper)
  uploadTitle: 'Bilder zu PDF',
  uploadSubtitle: 'Mehrere Bilder zu einem PDF-Dokument kombinieren',
  supportedFormats: 'PNG-, JPEG-, GIF-, BMP-, TIFF-Dateien',
  
  // Upload section (for ImageToPDFTool)
  uploadSection: {
    title: 'Bilder hochladen',
    subtitle: 'Mehrere Bilder zu einem PDF-Dokument konvertieren',
    supportedFormats: 'JPG-, PNG-, GIF-, BMP-, WebP-Dateien bis zu 50MB pro Datei'
  },
  
  // Tool interface (for ImageToPDFTool)
  tool: {
    title: 'Bilder zu PDF konvertieren',
    description: 'Mehrere Bilder in ein PDF-Dokument umwandeln',
    
    // File management
    selectedImages: 'Ausgewählte Bilder ({count})',
    clearAll: 'Alle löschen',
    fileInfo: '{count} Dateien • {size}',
    
    // PDF Settings
    pdfSettings: 'PDF-Einstellungen',
    pageSize: 'Seitengröße',
    pageSizeOptions: {
      a4: 'A4 (210 × 297 mm)',
      letter: 'Letter (8,5 × 11 Zoll)',
      auto: 'Automatisch (Bilder anpassen)'
    },
    
    orientation: 'Ausrichtung',
    orientationOptions: {
      portrait: 'Hochformat',
      landscape: 'Querformat'
    },
    
    imageLayout: 'Bild-Layout',
    layoutOptions: {
      fitToPage: 'An Seite anpassen',
      actualSize: 'Originalgröße',
      fitWidth: 'Breite anpassen',
      fitHeight: 'Höhe anpassen'
    },
    
    imageQuality: 'Bildqualität ({quality}%)',
    qualitySlider: {
      lowerSize: 'Kleinere Datei',
      higherQuality: 'Höhere Qualität'
    },
    
    pageMargin: 'Seitenrand ({margin}")',
    marginSlider: {
      noMargin: 'Kein Rand',
      twoInch: '2 Zoll'
    },
    
    background: 'Hintergrund',
    backgroundOptions: {
      white: 'Weiß',
      lightGray: 'Hellgrau',
      gray: 'Grau',
      black: 'Schwarz'
    },
    
    // Progress and conversion
    converting: 'Konvertierung läuft... {progress}%',
    
    // Buttons
    buttons: {
      selectImages: 'Bilder auswählen',
      reset: 'Zurücksetzen',
      converting: 'Konvertiert...',
      createPdf: 'PDF erstellen'
    },
    
    // Help section
    help: {
      title: 'Tipps für die Bild-zu-PDF-Konvertierung:',
      dragDrop: 'Ziehen Sie Bilder einfach direkt in den Upload-Bereich',
      formats: 'Unterstützt JPG-, PNG-, GIF-, BMP- und WebP-Formate',
      layout: 'Wählen Sie, wie Bilder auf PDF-Seiten eingefügt werden (an Seite anpassen, Originalgröße, usw.)',
      quality: 'Passen Sie die Bildqualität an, um Dateigröße und Bildqualität zu optimieren',
      privacy: 'Die gesamte Verarbeitung erfolgt lokal - Ihre Bilder verlassen nie Ihr Gerät'
    }
  },
  
  // Legacy compatibility (from original structure)
  buttons: {
    startConverting: 'Zu PDF konvertieren 📄',
    processing: 'Bilder werden konvertiert...',
    download: 'PDF herunterladen'
  },
  
  messages: {
    processing: 'Bilder werden zu PDF konvertiert...',
    success: 'Bilder erfolgreich konvertiert!',
    error: 'Fehler beim Konvertieren von Bildern zu PDF'
  }
};