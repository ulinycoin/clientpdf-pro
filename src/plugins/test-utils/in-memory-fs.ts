import type { IFileEntry, IFileSystem } from '../../core/types/contracts';

class MemoryFileEntry implements IFileEntry {
  constructor(readonly id: string, private readonly blob: Blob, private readonly name: string) {}

  getBlob(): Promise<Blob> {
    return Promise.resolve(this.blob);
  }

  getText(): Promise<string> {
    return this.blob.text();
  }

  getName(): string {
    return this.name;
  }

  getSize(): Promise<number> {
    return Promise.resolve(this.blob.size);
  }

  getType(): Promise<string> {
    return Promise.resolve(this.blob.type);
  }
}

export class InMemoryFileSystem implements IFileSystem {
  private readonly store = new Map<string, { blob: Blob; name: string }>();
  private idCounter = 0;

  seed(id: string, blob: Blob): void {
    this.store.set(id, {
      blob,
      name: blob instanceof File && blob.name ? blob.name : id,
    });
  }

  async write(data: Blob): Promise<IFileEntry> {
    this.idCounter += 1;
    const id = `out-${this.idCounter}`;
    const name = data instanceof File && data.name ? data.name : id;
    this.store.set(id, { blob: data, name });
    return new MemoryFileEntry(id, data, name);
  }

  async read(id: string): Promise<IFileEntry> {
    const record = this.store.get(id);
    if (!record) {
      throw new Error(`Missing file: ${id}`);
    }
    return new MemoryFileEntry(id, record.blob, record.name);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
