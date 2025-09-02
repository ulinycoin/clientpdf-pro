/**
 * Extract Images from PDF tool translations for DE language
 * Contains: page metadata, upload zone, tool interface, options, progress, results
 * Complete localization following established methodology
 */

export const extractImagesFromPdf = {
  // Basic properties for tools grid
  title: 'Bilder extrahieren',
  description: 'Alle Bilder aus PDF-Dokumenten in Originalqualität extrahieren',
  
  // Page metadata (SEO)
  pageTitle: 'Bilder aus PDF kostenlos extrahieren - LocalPDF',
  pageDescription: 'Extrahieren Sie alle Bilder aus PDF-Dateien kostenlos. Laden Sie Bilder in Originalqualität mit Stapelauswahl und Filteroptionen herunter.',
  
  // Upload section (for ExtractImagesFromPDFPage)
  upload: {
    title: 'Bilder aus PDF extrahieren',
    subtitle: 'Alle eingebetteten Bilder aus PDF-Dokumenten mit erweiterten Filteroptionen extrahieren',
    supportedFormats: 'PDF-Dateien bis 100MB',
    dragAndDrop: 'PDF-Datei hier ablegen oder klicken zum Durchsuchen'
  },
  
  // Main ExtractImagesFromPdfTool interface
  uploadPrompt: 'PDF-Datei hier ablegen oder klicken zum Durchsuchen',
  uploadSubtitle: 'Alle Bilder aus Ihrem PDF-Dokument extrahieren',
  
  // Settings section
  settings: {
    pageSelection: 'Seitenauswahl',
    allPages: 'Alle Seiten',
    specificPages: 'Bestimmte Seiten',
    pageRange: 'Seitenbereich',
    minSize: 'Minimale Bildgröße',
    minSizeDescription: 'Nur Bilder größer als diese Größe extrahieren (Pixel)',
    outputFormat: 'Ausgabeformat',
    original: 'Originalformat beibehalten',
    png: 'In PNG konvertieren',
    jpeg: 'In JPEG konvertieren',
    jpegQuality: 'JPEG-Qualität',
    deduplicateImages: 'Doppelte Bilder entfernen',
    includeVectorImages: 'Vektorbilder einschließen'
  },
  
  // Progress section
  progress: {
    preparing: 'PDF-Dokument wird geladen...',
    extracting: 'Bilder von Seite {current} von {total} werden extrahiert...',
    processing: 'Bilder werden verarbeitet und gefiltert...',
    finalizing: 'Extraktion wird abgeschlossen...',
    complete: 'Extraktion abgeschlossen!'
  },
  
  // Results section
  results: {
    imagesFound: 'Bilder gefunden',
    totalSize: 'Gesamtgröße',
    selectedCount: '{selected} von {total} ausgewählt',
    selectAll: 'Alle auswählen',
    deselectAll: 'Auswahl aufheben',
    downloadSelected: 'Ausgewählte herunterladen',
    downloadAll: 'Alle als ZIP herunterladen',
    imageInfo: 'Seite {pageNumber} • {width}×{height} • {size} • {format}',
    duplicatesRemoved: '{count} Duplikate entfernt',
    gridView: 'Rasteransicht',
    listView: 'Listenansicht'
  },
  
  // Success messages
  success: {
    title: 'Bilder erfolgreich extrahiert!',
    description: '{count} Bilder mit einer Gesamtgröße von {size} MB gefunden',
    extractedInfo: '{count} Bilder von {pages} Seiten extrahiert'
  },
  
  // Error handling
  errors: {
    noImages: 'Keine Bilder in dieser PDF gefunden',
    noImagesDescription: 'Diese PDF enthält keine extrahierbaren Bilder, die Ihren Kriterien entsprechen.',
    extractionFailed: 'Extraktion der Bilder fehlgeschlagen',
    loadingFailed: 'Laden des PDF-Dokuments fehlgeschlagen',
    noFileSelected: 'Bitte wählen Sie eine PDF-Datei zum Extrahieren von Bildern aus',
    processingError: 'Fehler beim Verarbeiten der PDF aufgetreten'
  },
  
  // Buttons
  buttons: {
    extractImages: 'Bilder extrahieren',
    extracting: 'Bilder werden extrahiert...',
    extractAnother: 'Aus anderer PDF extrahieren',
    tryAgain: 'Andere Datei versuchen',
    showSettings: 'Einstellungen anzeigen',
    hideSettings: 'Einstellungen ausblenden'
  },
  
  // Quick steps for StandardToolPageTemplate
  quickSteps: {
    step1: {
      title: 'PDF hochladen',
      description: 'Wählen oder ziehen Sie Ihre PDF-Datei, um die Bildextraktion zu starten'
    },
    step2: {
      title: 'Einstellungen konfigurieren',
      description: 'Legen Sie Mindestbildgröße, Ausgabeformat und andere Extraktionseinstellungen fest'
    },
    step3: {
      title: 'Bilder herunterladen',
      description: 'Vorschau, Auswahl und Download extrahierter Bilder einzeln oder als ZIP'
    }
  },
  
  // Benefits for StandardToolPageTemplate
  benefits: {
    privacy: {
      title: 'Vollständige Privatsphäre',
      description: 'Alle Verarbeitung erfolgt lokal in Ihrem Browser. Keine Dateien werden auf Server hochgeladen.'
    },
    quality: {
      title: 'Originalqualität',
      description: 'Extrahieren Sie Bilder in ihrer ursprünglichen Auflösung und Format ohne Qualitätsverlust.'
    },
    formats: {
      title: 'Mehrere Formate',
      description: 'Unterstützung für JPEG, PNG und andere Bildformate mit Konvertierungsoptionen.'
    },
    batch: {
      title: 'Stapeloperationen',
      description: 'Wählen Sie mehrere Bilder aus und laden Sie sie als praktisches ZIP-Archiv herunter.'
    }
  },
  
  // Legacy compatibility for existing components
  fileSelected: 'Datei ausgewählt',
  readyToExtract: 'Bereit zum Extrahieren von Bildern',
  removeFile: 'Datei entfernen',
  backToTools: 'Zurück zu den Tools',
  processing: 'Bilder aus Ihrer PDF werden extrahiert...',
  downloadReady: 'Ihre Bilder sind zum Download bereit'
};