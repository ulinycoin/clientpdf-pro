import assert from 'node:assert/strict';
import test from 'node:test';
import type { IFileEntry } from '../../core/types/contracts';
import { FilePreviewService } from './preview-service';

function createEntry(params: { id: string; name: string; blob: Blob; type: string }): IFileEntry {
  return {
    id: params.id,
    async getBlob() {
      return params.blob;
    },
    async getText() {
      return '';
    },
    getName() {
      return params.name;
    },
    async getSize() {
      return params.blob.size;
    },
    async getType() {
      return params.type;
    },
  };
}

test('FilePreviewService caches preview by fileId', async () => {
  const service = new FilePreviewService(5);
  let readCount = 0;

  const originalCreateObjectUrl = (URL as any).createObjectURL;
  const originalRevokeObjectUrl = (URL as any).revokeObjectURL;
  (URL as any).createObjectURL = () => 'blob:test-cached';
  (URL as any).revokeObjectURL = () => {};

  try {
    const runtime = {
      vfs: {
        async read(fileId: string) {
          readCount += 1;
          assert.equal(fileId, 'file-1');
          return createEntry({
            id: 'file-1',
            name: 'image.png',
            blob: new Blob(['x'], { type: 'image/png' }),
            type: 'image/png',
          });
        },
      },
    } as any;

    const first = await service.getPreview(runtime, 'file-1');
    const second = await service.getPreview(runtime, 'file-1');

    assert.equal(readCount, 1);
    assert.equal(first.thumbnailUrl, 'blob:test-cached');
    assert.equal(second.thumbnailUrl, 'blob:test-cached');
  } finally {
    (URL as any).createObjectURL = originalCreateObjectUrl;
    (URL as any).revokeObjectURL = originalRevokeObjectUrl;
    service.clear();
  }
});

test('FilePreviewService evicts oldest preview and revokes object URL', async () => {
  const service = new FilePreviewService(1);
  const createdUrls: string[] = [];
  const revokedUrls: string[] = [];

  const originalCreateObjectUrl = (URL as any).createObjectURL;
  const originalRevokeObjectUrl = (URL as any).revokeObjectURL;
  (URL as any).createObjectURL = () => {
    const next = `blob:test-${createdUrls.length + 1}`;
    createdUrls.push(next);
    return next;
  };
  (URL as any).revokeObjectURL = (url: string) => {
    revokedUrls.push(url);
  };

  try {
    const runtime = {
      vfs: {
        async read(fileId: string) {
          return createEntry({
            id: fileId,
            name: `${fileId}.png`,
            blob: new Blob(['x'], { type: 'image/png' }),
            type: 'image/png',
          });
        },
      },
    } as any;

    await service.getPreview(runtime, 'file-1');
    await service.getPreview(runtime, 'file-2');

    assert.equal(createdUrls.length, 2);
    assert.deepEqual(revokedUrls, ['blob:test-1']);
  } finally {
    (URL as any).createObjectURL = originalCreateObjectUrl;
    (URL as any).revokeObjectURL = originalRevokeObjectUrl;
    service.clear();
  }
});
