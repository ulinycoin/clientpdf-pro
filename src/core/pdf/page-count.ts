type PdfLibModule = typeof import('pdf-lib');

let pdfLibModulePromise: Promise<PdfLibModule> | null = null;

function loadPdfLib(): Promise<PdfLibModule> {
  if (!pdfLibModulePromise) {
    pdfLibModulePromise = import('pdf-lib');
  }
  return pdfLibModulePromise;
}

export async function warmupPdfLib(): Promise<void> {
  await loadPdfLib();
}

export async function getPdfPageCountFromBytes(bytes: Uint8Array, mimeType?: string): Promise<number> {
  if (mimeType && mimeType !== 'application/pdf') {
    return 1;
  }
  const { PDFDocument } = await loadPdfLib();
  const doc = await PDFDocument.load(bytes);
  return doc.getPageCount();
}
