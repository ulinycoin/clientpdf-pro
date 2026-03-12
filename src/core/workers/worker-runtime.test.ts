import assert from 'node:assert/strict';
import test from 'node:test';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { GlobalRegistry } from '../registry/global-registry';
import type { IFileEntry, IFileSystem, IToolDefinition } from '../types/contracts';
import { createValidPdfBlob } from '../../shared/test/create-valid-pdf';
import { executeWorkerCommand } from './worker-runtime';

class MemEntry implements IFileEntry {
  constructor(readonly id: string, private readonly blob: Blob) {}
  getBlob(): Promise<Blob> { return Promise.resolve(this.blob); }
  getText(): Promise<string> { return this.blob.text(); }
  getName(): string { return this.id; }
  getSize(): Promise<number> { return Promise.resolve(this.blob.size); }
  getType(): Promise<string> { return Promise.resolve(this.blob.type); }
}

class MemFs implements IFileSystem {
  private readonly entries = new Map<string, Blob>();

  seed(id: string, blob: Blob): void {
    this.entries.set(id, blob);
  }

  async write(data: Blob): Promise<IFileEntry> {
    const id = crypto.randomUUID();
    this.entries.set(id, data);
    return new MemEntry(id, data);
  }

  async read(id: string): Promise<IFileEntry> {
    const blob = this.entries.get(id);
    if (!blob) {
      throw new Error(`Missing file: ${id}`);
    }
    return new MemEntry(id, blob);
  }

  async delete(): Promise<void> {}
}

async function createPdfWithText(text: string): Promise<Blob> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText(text, { x: 64, y: 720, size: 24, font });
  const bytes = await pdf.save();
  const stable = new Uint8Array(bytes.byteLength);
  stable.set(bytes);
  return new Blob([stable.buffer], { type: 'application/pdf' });
}

test('executeWorkerCommand propagates custom error codes', async () => {
  const registry = new GlobalRegistry();
  const tool: IToolDefinition = {
    id: 't1',
    name: 'T1',
    description: 'test',
    uiLoader: async () => ({ default: () => null }),
    logicLoader: async () => ({
      run: async () => {
        const err = new Error('boom') as Error & { code?: string };
        err.code = 'CUSTOM_CODE';
        throw err;
      },
    }),
  };
  registry.register(tool);

  const event = await executeWorkerCommand(
    {
      id: 'cmd-1',
      type: 'COMMAND',
      payload: { type: 'PROCESS_TOOL', payload: { toolId: 't1', inputIds: [] } },
    },
    { registry, fs: new MemFs() },
  );

  assert.equal(event.payload.type, 'ERROR');
  if (event.payload.type === 'ERROR') {
    assert.equal(event.payload.payload.code, 'CUSTOM_CODE');
  }
});

test('executeWorkerCommand returns PAGE_COUNT_RESULT for GET_PDF_PAGE_COUNT', async () => {
  const registry = new GlobalRegistry();
  const fs = new MemFs();
  fs.seed('pdf-1', await createValidPdfBlob(3));

  const event = await executeWorkerCommand(
    {
      id: 'cmd-page-count',
      type: 'COMMAND',
      payload: { type: 'GET_PDF_PAGE_COUNT', payload: { fileId: 'pdf-1' } },
    },
    { registry, fs },
  );

  assert.equal(event.payload.type, 'PAGE_COUNT_RESULT');
  if (event.payload.type === 'PAGE_COUNT_RESULT') {
    assert.equal(event.payload.payload.fileId, 'pdf-1');
    assert.equal(event.payload.payload.pageCount, 3);
  }
});

test('executeWorkerCommand supports GET_PDF_PAGE_COUNT with inline bytes payload', async () => {
  const registry = new GlobalRegistry();
  const blob = await createValidPdfBlob(2);
  const bytes = new Uint8Array(await blob.arrayBuffer());

  const event = await executeWorkerCommand(
    {
      id: 'cmd-page-count-inline',
      type: 'COMMAND',
      payload: { type: 'GET_PDF_PAGE_COUNT', payload: { fileId: 'inline-pdf', bytes, mimeType: 'application/pdf' } },
    },
    { registry, fs: new MemFs() },
  );

  assert.equal(event.payload.type, 'PAGE_COUNT_RESULT');
  if (event.payload.type === 'PAGE_COUNT_RESULT') {
    assert.equal(event.payload.payload.fileId, 'inline-pdf');
    assert.equal(event.payload.payload.pageCount, 2);
  }
});

test('executeWorkerCommand emits DIAGNOSTIC worker stages for GET_PDF_PAGE_COUNT', async () => {
  const registry = new GlobalRegistry();
  const fs = new MemFs();
  fs.seed('pdf-diag', await createValidPdfBlob(1));
  const seenStages: string[] = [];

  const event = await executeWorkerCommand(
    {
      id: 'cmd-page-count-diag',
      type: 'COMMAND',
      payload: { type: 'GET_PDF_PAGE_COUNT', payload: { fileId: 'pdf-diag' } },
    },
    { registry, fs },
    (progressEvent) => {
      if (progressEvent.payload.type === 'DIAGNOSTIC') {
        seenStages.push(progressEvent.payload.payload.stage);
      }
    },
  );

  assert.equal(event.payload.type, 'PAGE_COUNT_RESULT');
  assert.ok(seenStages.includes('WORKER_FS_READ_START'));
  assert.ok(seenStages.includes('WORKER_PARSE_START'));
  assert.ok(seenStages.includes('WORKER_COMMAND_DONE'));
});

test('executeWorkerCommand returns TEXT_LAYER_RESULT for GET_PDF_TEXT_LAYER', async () => {
  const registry = new GlobalRegistry();
  const fs = new MemFs();
  fs.seed('pdf-text-layer', await createPdfWithText('Hello Worker'));

  const event = await executeWorkerCommand(
    {
      id: 'cmd-text-layer',
      type: 'COMMAND',
      payload: { type: 'GET_PDF_TEXT_LAYER', payload: { fileId: 'pdf-text-layer', pageNumber: 1 } },
    },
    { registry, fs },
  );

  assert.equal(event.payload.type, 'TEXT_LAYER_RESULT');
  if (event.payload.type === 'TEXT_LAYER_RESULT') {
    assert.equal(event.payload.payload.fileId, 'pdf-text-layer');
    assert.equal(event.payload.payload.pageNumber, 1);
    assert.ok(event.payload.payload.spans.length > 0);
    const mergedText = event.payload.payload.spans.map((span) => span.text).join(' ');
    assert.match(mergedText, /Hello/);
  }
});

test('executeWorkerCommand applies studio text edits and returns output id', async () => {
  const registry = new GlobalRegistry();
  const fs = new MemFs();
  fs.seed('pdf-edit-source', await createPdfWithText('Original'));

  const event = await executeWorkerCommand(
    {
      id: 'cmd-apply-studio-edits',
      type: 'COMMAND',
      payload: {
        type: 'APPLY_STUDIO_TEXT_EDITS',
        payload: {
          fileId: 'pdf-edit-source',
          pageIndex: 0,
          elements: [
            {
              id: 'e1',
              type: 'text',
              x: 0.1,
              y: 0.1,
              w: 0.3,
              h: 0.06,
              text: 'Updated',
              color: '#000000',
              fontSize: 16,
              fontFamily: 'sora',
              fontWeight: 'normal',
              fontStyle: 'normal',
              textAlign: 'left',
              opacity: 1,
            },
          ],
        },
      },
    },
    { registry, fs },
  );

  assert.equal(event.payload.type, 'STUDIO_TEXT_EDITS_APPLIED');
  if (event.payload.type === 'STUDIO_TEXT_EDITS_APPLIED') {
    assert.equal(event.payload.payload.fileId, 'pdf-edit-source');
    assert.equal(event.payload.payload.pageIndex, 0);
    assert.ok(event.payload.payload.outputId.length > 0);
    assert.equal(typeof event.payload.payload.trueReplaceApplied, 'boolean');
    const outputEntry = await fs.read(event.payload.payload.outputId);
    const outputBlob = await outputEntry.getBlob();
    assert.equal(outputBlob.type, 'application/pdf');
    assert.ok(outputBlob.size > 0);
  }
});

test('executeWorkerCommand rejects invalid studio edit payload', async () => {
  const registry = new GlobalRegistry();
  const fs = new MemFs();
  fs.seed('pdf-edit-invalid', await createPdfWithText('Original'));

  const event = await executeWorkerCommand(
    {
      id: 'cmd-apply-studio-edits-invalid',
      type: 'COMMAND',
      payload: {
        type: 'APPLY_STUDIO_TEXT_EDITS',
        payload: {
          fileId: 'pdf-edit-invalid',
          pageIndex: 0,
          elements: [
            {
              id: 'broken-stroke',
              type: 'stroke',
              points: [0.2, 0.2, 0.4],
              color: '#000000',
              width: 2,
              opacity: 1,
            },
          ],
        },
      },
    },
    { registry, fs },
  );

  assert.equal(event.payload.type, 'ERROR');
  if (event.payload.type === 'ERROR') {
    assert.equal(event.payload.payload.code, 'STUDIO_EDIT_INVALID_PAYLOAD');
  }
});

test('executeWorkerCommand rejects oversized studio edit payload', async () => {
  const registry = new GlobalRegistry();
  const fs = new MemFs();
  fs.seed('pdf-edit-oversized', await createPdfWithText('Original'));

  const tooManyElements = Array.from({ length: 2001 }, (_, index) => ({
    id: `t-${index}`,
    type: 'text' as const,
    x: 0.1,
    y: 0.1,
    w: 0.2,
    h: 0.04,
    text: 'x',
    color: '#000000',
    fontSize: 12,
    fontFamily: 'sora' as const,
    fontWeight: 'normal' as const,
    fontStyle: 'normal' as const,
    textAlign: 'left' as const,
    opacity: 1,
  }));

  const event = await executeWorkerCommand(
    {
      id: 'cmd-apply-studio-edits-oversized',
      type: 'COMMAND',
      payload: {
        type: 'APPLY_STUDIO_TEXT_EDITS',
        payload: {
          fileId: 'pdf-edit-oversized',
          pageIndex: 0,
          elements: tooManyElements,
        },
      },
    },
    { registry, fs },
  );

  assert.equal(event.payload.type, 'ERROR');
  if (event.payload.type === 'ERROR') {
    assert.equal(event.payload.payload.code, 'STUDIO_EDIT_TOO_LARGE');
  }
});
