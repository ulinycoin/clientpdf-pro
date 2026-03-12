import assert from 'node:assert/strict';
import test from 'node:test';
import type { IFileEntry, IFileSystem } from '../types/contracts';
import { VfsQuotaExceededError, VirtualFileSystem } from './virtual-file-system';

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
  private counter = 0;
  async write(data: Blob): Promise<IFileEntry> {
    this.counter += 1;
    const id = `f-${this.counter}`;
    this.map.set(id, data);
    return new MemEntry(id, data);
  }
  async read(id: string): Promise<IFileEntry> {
    const blob = this.map.get(id);
    if (!blob) throw new Error(`Missing file: ${id}`);
    return new MemEntry(id, blob);
  }
  async delete(id: string): Promise<void> { this.map.delete(id); }
}

test('VirtualFileSystem cleans temp scope files after cleanupScope', async () => {
  const vfs = new VirtualFileSystem(new MemFs());
  const a = await vfs.writeTemp('scope-1', new Blob([new Uint8Array([1])]));
  const b = await vfs.writeTemp('scope-1', new Blob([new Uint8Array([2])]));

  await vfs.read(a.id);
  await vfs.read(b.id);
  await vfs.cleanupScope('scope-1');

  await assert.rejects(() => vfs.read(a.id), /Missing file/);
  await assert.rejects(() => vfs.read(b.id), /Missing file/);
});

test('VirtualFileSystem cleanupScope is no-op for unknown scope', async () => {
  const vfs = new VirtualFileSystem(new MemFs());
  await vfs.cleanupScope('unknown');
  assert.ok(true);
});

test('VirtualFileSystem enforces total quota', async () => {
  const vfs = new VirtualFileSystem(new MemFs(), { maxTotalBytes: 2 });
  await vfs.write(new Blob([new Uint8Array([1, 2])]));
  await assert.rejects(
    () => vfs.write(new Blob([new Uint8Array([3])])),
    (error) => error instanceof VfsQuotaExceededError && /total quota/.test(error.message),
  );
});

test('VirtualFileSystem enforces temp quota and recovers after cleanup', async () => {
  const vfs = new VirtualFileSystem(new MemFs(), { maxTempBytes: 2, maxTotalBytes: 10 });
  await vfs.writeTemp('scope-2', new Blob([new Uint8Array([1, 2])]));
  await assert.rejects(
    () => vfs.writeTemp('scope-2', new Blob([new Uint8Array([3])])),
    (error) => error instanceof VfsQuotaExceededError && /temp quota/.test(error.message),
  );

  await vfs.cleanupScope('scope-2');
  const recovered = await vfs.writeTemp('scope-2', new Blob([new Uint8Array([9])]));
  await vfs.read(recovered.id);
  const usage = vfs.getQuotaUsage();
  assert.equal(usage.tempBytes, 1);
});
