import assert from 'node:assert/strict';
import test from 'node:test';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { extractPdfTextLayerSpans } from './pdf-text-layer-extractor';

async function createSimplePdfBytes(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText('LocalPDF text layer smoke', { x: 72, y: 700, size: 24, font });
  const bytes = await doc.save();
  const stable = new Uint8Array(bytes.byteLength);
  stable.set(bytes);
  return stable;
}

test('extractPdfTextLayerSpans does not detach input bytes', async () => {
  const bytes = await createSimplePdfBytes();
  const beforeLength = bytes.byteLength;
  const beforeHeader = Array.from(bytes.slice(0, 8));

  await extractPdfTextLayerSpans(bytes, 1);

  assert.equal(bytes.byteLength, beforeLength);
  assert.deepEqual(Array.from(bytes.slice(0, 8)), beforeHeader);
});
