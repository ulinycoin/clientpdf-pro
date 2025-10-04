/**
 * Merge PDF tool translations for DE language
 * Contains: page metadata, upload zone, file management, processing messages
 */

export const merge = {
  // Basic properties for tools grid
  title: 'PDFs zusammenführen',
  description: 'Mehrere PDF-Dateien zu einem Dokument kombinieren',
  
  // Page metadata (SEO)
  pageTitle: 'PDF-Dateien kostenlos zusammenführen - LocalPDF',
  pageDescription: 'Kombinieren Sie mehrere PDF-Dateien kostenlos zu einem Dokument. Schnelles, sicheres und privates PDF-Zusammenführen in Ihrem Browser. Keine Uploads, keine Registrierung erforderlich.',
  
  // Upload zone translations
  uploadTitle: 'PDF-Dateien zum Zusammenführen hochladen',
  uploadSubtitle: 'Mehrere PDF-Dateien zu einem Dokument kombinieren',
  supportedFormats: 'PDF-Dateien bis 100MB pro Datei',
  
  // File management
  selectedFiles: 'Ausgewählte Dateien',
  readyToMerge: 'Bereit zum Zusammenführen',
  removeFile: 'Datei entfernen',
  fileSizeUnit: 'MB',
  
  // Processing buttons and states
  buttons: {
    startMerging: '{count} Dateien zusammenführen 📄',
    merging: 'Dateien werden zusammengeführt...',
    download: 'Zusammengeführte PDF herunterladen',
    backToTools: 'Zurück zu den Tools',
    selectMoreFiles: 'Weitere Dateien auswählen'
  },
  
  // Processing messages
  messages: {
    processing: 'Ihre PDF-Dateien werden zusammengeführt...',
    progress: 'Verarbeite Datei {current} von {total}',
    success: 'PDF-Dateien erfolgreich zusammengeführt!',
    downloadReady: 'Ihre zusammengeführte PDF ist bereit zum Download',
    error: 'Fehler beim Zusammenführen der PDF-Dateien',
    noFilesSelected: 'Bitte wählen Sie mindestens 2 PDF-Dateien zum Zusammenführen aus',
    singleFileWarning: 'Bitte wählen Sie mehrere Dateien zum Zusammenführen aus'
  },
  
  // ModernMergeTool specific translations
  toolTitle: 'PDF-Dateien zusammenführen',
  fileCount: {
    single: 'Datei',
    few: 'Dateien', 
    many: 'Dateien'
  },
  processing: 'Dateien werden zusammengeführt...',
  processingTitle: 'Zusammenführung läuft',
  processingDescription: 'Dateien werden verarbeitet...',
  orderTitle: 'Dateireihenfolge',
  orderDescription: 'Verwenden Sie Pfeile, um die Reihenfolge zu ändern',
  trustIndicators: {
    private: 'Private Verarbeitung',
    quality: 'Hohe Qualität'
  },
  controls: {
    moveUp: 'Nach oben verschieben',
    moveDown: 'Nach unten verschieben'
  },
  fileCounter: {
    label: 'Dateien',
    scrollHint: '• Scrollen, um alle Dateien anzuzeigen'
  },
  actions: {
    merge: '{count} {fileWord} zusammenführen',
    merging: 'Verarbeitung...',
    cancel: 'Abbrechen',
    close: 'Schließen'
  },
  progress: 'Fortschritt',
  
  // Tool-specific content
  howItWorks: {
    title: 'So funktioniert das PDF-Zusammenführen',
    description: 'Unser Zusammenführungs-Tool kombiniert mehrere PDF-Dokumente unter Beibehaltung von Qualität und Formatierung',
    steps: [
      'Laden Sie mehrere PDF-Dateien von Ihrem Gerät hoch',
      'Ordnen Sie die Dateien in der gewünschten Reihenfolge an',
      'Klicken Sie auf Zusammenführen, um alle Dokumente zu kombinieren',
      'Laden Sie Ihre einheitliche PDF-Datei herunter'
    ]
  },
  
  // Benefits specific to merge tool
  benefits: {
    title: 'Warum unseren PDF-Merger verwenden?',
    features: [
      'Ursprüngliche Qualität und Formatierung beibehalten',
      'Dokument-Metadaten und Lesezeichen erhalten',
      'Keine Dateigröße oder Anzahl-Limits',
      'Sofortige Verarbeitung in Ihrem Browser'
    ]
  },
  
  // Error handling (consolidated)
  errors: {
    minFiles: 'Wählen Sie mindestens 2 Dateien zum Zusammenführen aus',
    processingError: 'Fehler beim Verarbeiten der Dateien',
    unknownError: 'Unbekannter Fehler aufgetreten',
    errorTitle: 'Verarbeitungsfehler',
    invalidFile: 'Ungültiges PDF-Dateiformat',
    fileTooLarge: 'Dateigröße überschreitet 100MB-Limit',
    processingFailed: 'Fehler beim Verarbeiten der PDF-Datei',
    noFilesUploaded: 'Keine Dateien zum Zusammenführen hochgeladen'
  },

  // Detailed unique content for this tool (replaces generic template)
  detailed: {
    title: 'Warum unseren PDF-Zusammenführer wählen?',
    functionality: {
      title: 'Fortschrittliche Zusammenführungstechnologie',
      description1: 'Unser PDF-Zusammenführer nutzt modernste Browser-Technologie, um mehrere PDF-Dokumente zu einer einzigen Datei zu kombinieren und dabei alle ursprünglichen Formatierungen, Schriftarten, Bilder und Dokumentstrukturen beizubehalten. Im Gegensatz zur einfachen Dateiverkettung verarbeitet unser Tool intelligent jede Seite, um professionelle Qualität zu gewährleisten.',
      description2: 'Die Zusammenführungs-Engine verarbeitet komplexe PDF-Funktionen einschließlich eingebetteter Schriftarten, Vektorgrafiken, Formularfelder, Annotationen und Lesezeichen. Dokumente werden in Ihrem Browser mithilfe der PDF-lib und pdf.js-Bibliotheken verarbeitet und gewährleisten Kompatibilität mit allen PDF-Standards von 1.4 bis 2.0.'
    },
    capabilities: {
      title: 'Intelligente Dokumentenverarbeitung',
      description1: 'Führen Sie unbegrenzt viele PDF-Dateien ohne Einschränkungen bei Dokumentgröße oder Seitenanzahl zusammen. Ordnen Sie Seiten durch Ziehen von Dateien nach oben oder unten vor dem Zusammenführen neu an. Unsere intelligente Verarbeitung bewahrt Dokument-Metadaten, einschließlich Autoreninformationen, Erstellungsdaten und benutzerdefinierten Eigenschaften.',
      description2: 'Verarbeiten Sie Geschäftsverträge, wissenschaftliche Arbeiten, Rechnungen, Präsentationen und Berichte mit Vertrauen. Das Tool behält hochauflösende Bilder, komplexe Layouts, mehrspaltigen Text, Tabellen und eingebettete Medien bei. Die gesamte Verarbeitung erfolgt sofort in Ihrem Browser mit Echtzeit-Fortschrittsanzeige.'
    }
  }
};