import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { requestTextLayerSpansFallback } from './text-layer-client';

async function createPdfWithTextBytes(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText('INLINE EDIT SAMPLE', { x: 80, y: 700, size: 24, font });
  return await doc.save();
}

test('requestTextLayerSpansFallback returns no synthetic spans for text PDFs', async () => {
  const bytes = await createPdfWithTextBytes();
  const runtime = {
    vfs: {
      async read() {
        return {
          async getBlob() {
            const arrayBuffer = Uint8Array.from(bytes).buffer as ArrayBuffer;
            return new Blob([arrayBuffer], { type: 'application/pdf' });
          },
        };
      },
    },
  };

  const spans = await requestTextLayerSpansFallback(runtime, 'file-1', 1);

  assert.deepEqual(spans, []);
});
