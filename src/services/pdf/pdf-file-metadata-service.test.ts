import assert from 'node:assert/strict';
import test from 'node:test';
import type { IFileEntry, IFileSystem } from '../../core/types/contracts';
import { createValidPdfBlob } from '../../shared/test/create-valid-pdf';
import { PdfFileMetadataService } from './pdf-file-metadata-service';

class MemEntry implements IFileEntry {
  constructor(readonly id: string, private readonly blob: Blob) {}
  getBlob(): Promise<Blob> { return Promise.resolve(this.blob); }
  getText(): Promise<string> { return this.blob.text(); }
  getName(): string { return this.id; }
  getSize(): Promise<number> { return Promise.resolve(this.blob.size); }
  getType(): Promise<string> { return Promise.resolve(this.blob.type); }
}

class MemFs implements IFileSystem {
  private readonly map = new Map<string, Blob>();
  seed(id: string, blob: Blob): void { this.map.set(id, blob); }
  async write(data: Blob): Promise<IFileEntry> { const id = crypto.randomUUID(); this.map.set(id, data); return new MemEntry(id, data); }
  async read(id: string): Promise<IFileEntry> { const b = this.map.get(id); if (!b) throw new Error('missing'); return new MemEntry(id, b); }
  async delete(id: string): Promise<void> { this.map.delete(id); }
}

test('PdfFileMetadataService returns page count', async () => {
  const fs = new MemFs();
  fs.seed('p1', await createValidPdfBlob(3));
  const svc = new PdfFileMetadataService(fs);
  const pages = await svc.getPageCount('p1');
  assert.equal(pages, 3);
});

test('PdfFileMetadataService treats non-PDF as single page', async () => {
  const fs = new MemFs();
  fs.seed('img1', new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' }));
  const svc = new PdfFileMetadataService(fs);
  const pages = await svc.getPageCount('img1');
  assert.equal(pages, 1);
});
