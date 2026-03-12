export interface StudioEditMessages {
  selectPageTitle: string;
  backToCanvas: string;
  switchToManualMode: string;
  switchToSelectTextMode: string;
  selectText: string;
  text: string;
  textFontFamily: string;
  textFontSize: string;
  textColor: string;
  textBackgroundColor: string;
  links: string;
  forms: string;
  watermark: string;
  protect: string;
  images: string;
  sign: string;
  whiteout: string;
  annotate: string;
  annotateUnderline: string;
  annotateHighlight: string;
  annotateMarker: string;
  annotatePen: string;
  annotatePenSize: string;
  annotateCustomColor: string;
  whiteoutCustomColor: string;
  shapeRectangle: string;
  shapeLine: string;
  shapeArrow: string;
  shapeThickness: string;
  shapes: string;
  undo: string;
  redo: string;
  undoSave: string;
  redoSave: string;
  delete: string;
  save: string;
  saving: string;
  saveSelection: string;
  back: string;
  page: string;
  selection: string;
  noTextLayer: string;
  changesApplied: string;
  changesAppliedSelection: string;
  partialSaveFailed: string;
  saveFailed: string;
  unsavedConfirm: string;
  overflowWarning: string;
  statusIdle: string;
  statusHover: string;
  statusSelected: string;
  statusEditing: string;
  statusSaving: string;
  statusSaved: string;
  statusError: string;
  dirty: string;
  saveReverted: string;
  protectPasswordRequired: string;
  protectUnavailable: string;
}

const EN_MESSAGES: StudioEditMessages = {
  selectPageTitle: 'Select a page to start Edit mode',
  backToCanvas: 'Back to Canvas',
  switchToManualMode: 'Switch to Manual Mode',
  switchToSelectTextMode: 'Switch to Select Text Mode',
  selectText: 'Select Text',
  text: 'Text',
  textFontFamily: 'Font',
  textFontSize: 'Size',
  textColor: 'Color',
  textBackgroundColor: 'Background',
  links: 'Links',
  forms: 'Forms',
  watermark: 'Watermark',
  protect: 'Protect',
  images: 'Images',
  sign: 'Sign',
  whiteout: 'Whiteout',
  annotate: 'Annotate',
  annotateUnderline: 'Underline',
  annotateHighlight: 'Highlight',
  annotateMarker: 'Marker',
  annotatePen: 'Pen',
  annotatePenSize: 'Pen size',
  annotateCustomColor: 'Custom',
  whiteoutCustomColor: 'Custom color',
  shapeRectangle: 'Rectangle',
  shapeLine: 'Line',
  shapeArrow: 'Arrow',
  shapeThickness: 'Thickness',
  shapes: 'Shapes',
  undo: 'Undo',
  redo: 'Redo',
  undoSave: 'Undo Save',
  redoSave: 'Redo Save',
  delete: 'Delete',
  save: 'Save',
  saving: 'Saving...',
  saveSelection: 'Save all selected pages',
  back: 'Back',
  page: 'Page',
  selection: 'Selection',
  noTextLayer: 'Inline editing is unavailable: no text layer found.',
  changesApplied: 'Changes applied to PDF page.',
  changesAppliedSelection: 'Changes applied to selected pages:',
  partialSaveFailed: 'Some selected pages failed to save.',
  saveFailed: 'Failed to save changes.',
  unsavedConfirm: 'You have unsaved changes. Leave without saving?',
  overflowWarning: 'Text overflowed available width. Font size was reduced to fit.',
  statusIdle: 'idle',
  statusHover: 'hover',
  statusSelected: 'selected',
  statusEditing: 'editing',
  statusSaving: 'saving',
  statusSaved: 'saved',
  statusError: 'error',
  dirty: 'dirty',
  saveReverted: 'Saved changes reverted.',
  protectPasswordRequired: 'Password is required unless restrictions-only mode is enabled.',
  protectUnavailable: 'Protect PDF requires qpdf (Node/Desktop runtime). Current browser runtime is not supported.',
};

export function getStudioEditMessages(): StudioEditMessages {
  return EN_MESSAGES;
}
