import type { IFileEntry, IFileSystem } from '../types/contracts';

interface StoredFileRecord {
  id: string;
  blob: Blob;
  name: string;
}

class WebFileEntry implements IFileEntry {
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

export class WebFileSystemAdapter implements IFileSystem {
  private static readonly DB_NAME = 'localpdf-v6';
  private static readonly STORE_NAME = 'files';
  private readonly memoryFallback = new Map<string, StoredFileRecord>();
  private dbPromise: Promise<IDBDatabase> | null = null;

  async write(data: Blob): Promise<IFileEntry> {
    const id = crypto.randomUUID();
    const record: StoredFileRecord = {
      id,
      blob: data,
      name: data instanceof File && data.name ? data.name : `file-${id}`,
    };

    if (!this.isIndexedDbAvailable()) {
      this.memoryFallback.set(id, record);
      return new WebFileEntry(id, record.blob, record.name);
    }

    const db = await this.getDb();
    await this.withStore(db, 'readwrite', (store) => store.put(record));
    return new WebFileEntry(id, record.blob, record.name);
  }

  async read(id: string): Promise<IFileEntry> {
    if (!this.isIndexedDbAvailable()) {
      const fallback = this.memoryFallback.get(id);
      if (!fallback) {
        throw new Error(`File not found: ${id}`);
      }
      return new WebFileEntry(fallback.id, fallback.blob, fallback.name);
    }

    const db = await this.getDb();
    const item = await this.withStore(db, 'readonly', (store) => store.get(id));
    if (!item || typeof item !== 'object') {
      throw new Error(`File not found: ${id}`);
    }
    const record = item as StoredFileRecord;
    return new WebFileEntry(record.id, record.blob, record.name);
  }

  async delete(id: string): Promise<void> {
    if (!this.isIndexedDbAvailable()) {
      this.memoryFallback.delete(id);
      return;
    }

    const db = await this.getDb();
    await this.withStore(db, 'readwrite', (store) => store.delete(id));
  }

  private isIndexedDbAvailable(): boolean {
    return typeof indexedDB !== 'undefined';
  }

  private getDb(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(WebFileSystemAdapter.DB_NAME, 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(WebFileSystemAdapter.STORE_NAME)) {
            db.createObjectStore(WebFileSystemAdapter.STORE_NAME, { keyPath: 'id' });
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
      });
    }
    return this.dbPromise;
  }

  private withStore<T>(
    db: IDBDatabase,
    mode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => IDBRequest<T> | void,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const tx = db.transaction(WebFileSystemAdapter.STORE_NAME, mode);
      const store = tx.objectStore(WebFileSystemAdapter.STORE_NAME);
      const request = callback(store);

      tx.oncomplete = () => {
        if (!request) {
          resolve(undefined as T);
          return;
        }
        resolve(request.result);
      };
      tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'));
      tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'));
    });
  }
}
