/**
 * Add Text tool translations for DE language
 * Contains: page metadata, upload zone, editor interface, toolbar, format panel
 * Complete localization following rotate-pdf methodology
 */

export const addText = {
  // Basic properties for tools grid
  title: 'Text hinzufügen',
  description: 'Textannotationen und Beschriftungen zu PDF-Dateien hinzufügen',
  
  // Page metadata (SEO)
  pageTitle: 'Text zu PDF kostenlos hinzufügen - LocalPDF',
  pageDescription: 'Textannotationen und Beschriftungen zu PDF-Dateien hinzufügen. Kostenloser PDF-Texteditor mit vollständigem Datenschutz.',
  
  // Upload zone translations (for AddTextPDFPage)
  uploadTitle: 'Text zu PDF hinzufügen',
  uploadSubtitle: 'Textannotationen überall in Ihrem PDF einfügen',
  supportedFormats: 'PDF-Dateien bis 100MB',
  selectedFile: 'Ausgewählte Datei',
  readyForEditing: 'Bereit zur Bearbeitung',
  removeFile: 'Datei entfernen',
  fileSizeUnit: 'MB',
  editPdf: 'PDF bearbeiten ✏️',
  
  // Main AddTextTool interface
  addTextToPdf: 'Text zu PDF hinzufügen',
  backToTools: 'Zurück zu Tools',
  noFileSelected: 'Keine Datei ausgewählt',
  noFileDescription: 'Bitte wählen Sie eine PDF-Datei zum Hinzufügen von Text',
  
  textElements: {
    single: 'Element',
    multiple: 'Elemente'
  },
  
  // Toolbar translations
  toolbar: {
    addText: 'Text hinzufügen',
    select: 'Auswählen',
    undo: 'Rückgängig',
    redo: 'Wiederholen',
    page: 'Seite',
    of: 'von',
    savePdf: 'PDF speichern'
  },
  
  // Format Panel translations
  formatPanel: {
    title: 'Formatierung',
    selectElementPrompt: 'Wählen Sie ein Textelement zur Bearbeitung',
    textContent: 'Textinhalt',
    textPlaceholder: 'Geben Sie Ihren Text ein...',
    fontFamily: 'Schriftart',
    fontSize: 'Schriftgröße',
    textColor: 'Textfarbe',
    position: 'Position',
    preview: 'Vorschau',
    sampleText: 'Beispieltext'
  },
  
  // Status bar and interaction messages
  status: {
    mode: 'Modus',
    addTextMode: 'Text hinzufügen',
    selectMode: 'Elemente auswählen',
    selected: 'Ausgewählt',
    zoom: 'Zoom',
    clickToEdit: 'Klicken zum Bearbeiten'
  },
  
  // Processing overlay
  processingTitle: 'PDF speichern',
  processingDescription: 'Text hinzufügen und neue PDF-Datei erstellen...',
  
  // Canvas translations
  canvas: {
    loadingPdf: 'PDF wird geladen...'
  },
  
  // Legacy compatibility
  buttons: {
    startEditing: 'Text hinzufügen ✏️',
    processing: 'Text wird hinzugefügt...',
    download: 'PDF mit Text herunterladen',
    backToTools: 'Zurück zu Tools'
  },
  
  messages: {
    processing: 'Text wird zu Ihrem PDF hinzugefügt...',
    success: 'Text erfolgreich hinzugefügt!',
    downloadReady: 'Ihr PDF mit hinzugefügtem Text ist bereit',
    error: 'Fehler beim Hinzufügen von Text zum PDF',
    noFileSelected: 'Bitte wählen Sie eine PDF-Datei'
  },
  
  errors: {
    invalidFile: 'Ungültiges PDF-Dateiformat',
    fileTooLarge: 'Dateigröße überschreitet 100MB-Limit',
    processingFailed: 'Fehler beim Hinzufügen von Text zum PDF'
  }
};