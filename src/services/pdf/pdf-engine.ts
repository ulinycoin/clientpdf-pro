export interface PdfEngine {
  merge(blobs: Blob[]): Promise<Blob>;
  split(blob: Blob): Promise<Blob[]>;
  rotate(blob: Blob, degrees: number): Promise<Blob>;
  deletePages(blob: Blob, pageIndices: number[]): Promise<Blob>;
}

class FallbackPdfEngine implements PdfEngine {
  async merge(blobs: Blob[]): Promise<Blob> {
    const parts: BlobPart[] = [];
    for (const blob of blobs) {
      parts.push(await blob.arrayBuffer());
    }
    return new Blob(parts, { type: 'application/pdf' });
  }

  async split(blob: Blob): Promise<Blob[]> {
    // Fallback behavior keeps one output. Real page split requires pdf-lib.
    return [blob];
  }

  async rotate(blob: Blob): Promise<Blob> {
    // Fallback does nothing to the bytes
    return blob;
  }

  async deletePages(blob: Blob): Promise<Blob> {
    // Fallback does nothing to the bytes
    return blob;
  }
}

class PdfLibEngine implements PdfEngine {
  async rotate(blob: Blob, degrees: number): Promise<Blob> {
    const { PDFDocument, degrees: pdfLibDegrees } = await import('pdf-lib');
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const doc = await PDFDocument.load(bytes);
    const pages = doc.getPages();

    for (const page of pages) {
      const currentRotation = page.getRotation().angle;
      page.setRotation(pdfLibDegrees(currentRotation + degrees));
    }

    const out = await doc.save();
    return new Blob([out as any], { type: 'application/pdf' });
  }

  async merge(blobs: Blob[]): Promise<Blob> {
    const { PDFDocument } = await import('pdf-lib');
    const target = await PDFDocument.create();

    for (const blob of blobs) {
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const src = await PDFDocument.load(bytes);
      const pages = await target.copyPages(src, src.getPageIndices());
      for (const page of pages) {
        target.addPage(page);
      }
    }

    const out = await target.save();
    const normalized = new Uint8Array(out.byteLength);
    normalized.set(out);
    return new Blob([normalized], { type: 'application/pdf' });
  }

  async split(blob: Blob): Promise<Blob[]> {
    const { PDFDocument } = await import('pdf-lib');
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const src = await PDFDocument.load(bytes);
    const output: Blob[] = [];

    for (const index of src.getPageIndices()) {
      const doc = await PDFDocument.create();
      const [page] = await doc.copyPages(src, [index]);
      doc.addPage(page);
      const out = await doc.save();
      const normalized = new Uint8Array(out.byteLength);
      normalized.set(out);
      output.push(new Blob([normalized], { type: 'application/pdf' }));
    }

    return output;
  }

  async deletePages(blob: Blob, pageIndices: number[]): Promise<Blob> {
    const { PDFDocument } = await import('pdf-lib');
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const doc = await PDFDocument.load(bytes);

    // Crucial: remove pages from highest index to lowest to avoid index shifting
    const sortedIndices = [...pageIndices].sort((a, b) => b - a);

    for (const index of sortedIndices) {
      if (index >= 0 && index < doc.getPageCount()) {
        doc.removePage(index);
      }
    }

    const out = await doc.save();
    return new Blob([out as any], { type: 'application/pdf' });
  }
}

export async function createPdfEngine(): Promise<PdfEngine> {
  try {
    await import('pdf-lib');
    return new PdfLibEngine();
  } catch {
    return new FallbackPdfEngine();
  }
}
