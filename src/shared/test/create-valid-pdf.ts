import { PDFDocument } from 'pdf-lib';

export async function createValidPdfBlob(pageCount = 1): Promise<Blob> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i += 1) {
    doc.addPage([400, 400]);
  }
  const bytes = await doc.save();
  const normalized = new Uint8Array(bytes.byteLength);
  normalized.set(bytes);
  return new Blob([normalized], { type: 'application/pdf' });
}
