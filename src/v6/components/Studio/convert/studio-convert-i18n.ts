export interface StudioConvertMessages {
  emptyTitle: string;
  backToStudio: string;
  selectionScope: string;
  documentScope: string;
  selectedPages: string;
  runOcr: string;
  runPdfToJpg: string;
  runExtractImages: string;
  runCompressPdf: string;
  running: string;
}

const EN_MESSAGES: StudioConvertMessages = {
  emptyTitle: 'Select a document or pages to start Convert mode',
  backToStudio: 'Back to Canvas',
  selectionScope: 'Selection scope',
  documentScope: 'Document scope',
  selectedPages: 'page(s)',
  runOcr: 'Run OCR',
  runPdfToJpg: 'Convert to JPG',
  runExtractImages: 'Extract Images',
  runCompressPdf: 'Compress PDF',
  running: 'Running...',
};

export function getStudioConvertMessages(): StudioConvertMessages {
  return EN_MESSAGES;
}
