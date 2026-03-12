import type { IFileEntry, IFileSystem } from '../types/contracts';

export class VfsQuotaExceededError extends Error {
  code = 'VFS_QUOTA_EXCEEDED';
}

export interface VfsQuotaPolicy {
  maxTotalBytes?: number;
  maxTempBytes?: number;
}

export class VirtualFileSystem {
  private readonly tempByScope = new Map<string, Set<string>>();
  private readonly fileSizes = new Map<string, number>();
  private readonly tempFileIds = new Set<string>();
  private totalBytes = 0;
  private tempBytes = 0;

  constructor(
    private readonly fs: IFileSystem,
    private readonly quota: VfsQuotaPolicy = {},
  ) {}

  async write(blob: Blob): Promise<IFileEntry> {
    this.ensureQuota(blob.size, false);
    const entry = await this.fs.write(blob);
    this.registerFile(entry.id, blob.size, false);
    return entry;
  }

  async writeTemp(scopeId: string, blob: Blob): Promise<IFileEntry> {
    this.ensureQuota(blob.size, true);
    const entry = await this.fs.write(blob);
    this.registerFile(entry.id, blob.size, true);
    const bucket = this.tempByScope.get(scopeId) ?? new Set<string>();
    bucket.add(entry.id);
    this.tempByScope.set(scopeId, bucket);
    return entry;
  }

  read(id: string): Promise<IFileEntry> {
    return this.fs.read(id);
  }

  async delete(id: string): Promise<void> {
    await this.fs.delete(id);
    this.unregisterFile(id);
  }

  async cleanupScope(scopeId: string): Promise<void> {
    const bucket = this.tempByScope.get(scopeId);
    if (!bucket) {
      return;
    }
    for (const id of bucket) {
      await this.delete(id);
    }
    this.tempByScope.delete(scopeId);
  }

  getQuotaUsage(): { totalBytes: number; tempBytes: number } {
    return {
      totalBytes: this.totalBytes,
      tempBytes: this.tempBytes,
    };
  }

  private ensureQuota(incomingBytes: number, isTemp: boolean): void {
    if (this.quota.maxTotalBytes !== undefined && this.totalBytes + incomingBytes > this.quota.maxTotalBytes) {
      throw new VfsQuotaExceededError('VFS total quota exceeded');
    }
    if (isTemp && this.quota.maxTempBytes !== undefined && this.tempBytes + incomingBytes > this.quota.maxTempBytes) {
      throw new VfsQuotaExceededError('VFS temp quota exceeded');
    }
  }

  private registerFile(id: string, size: number, isTemp: boolean): void {
    this.fileSizes.set(id, size);
    this.totalBytes += size;
    if (isTemp) {
      this.tempFileIds.add(id);
      this.tempBytes += size;
    }
  }

  private unregisterFile(id: string): void {
    const size = this.fileSizes.get(id);
    if (size === undefined) {
      return;
    }
    this.totalBytes -= size;
    if (this.tempFileIds.has(id)) {
      this.tempFileIds.delete(id);
      this.tempBytes -= size;
    }
    this.fileSizes.delete(id);
  }
}
