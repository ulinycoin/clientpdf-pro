import type { IFileMetadataService, IFileSystem } from '../../core/types/contracts';
import { getPdfPageCountFromBytes, warmupPdfLib } from '../../core/pdf/page-count';

export class PdfFileMetadataService implements IFileMetadataService {
  constructor(private readonly fs: IFileSystem) {}

  static async warmup(): Promise<void> {
    await warmupPdfLib();
  }

  static async getPageCountFromBytes(bytes: Uint8Array, mimeType?: string): Promise<number> {
    return getPdfPageCountFromBytes(bytes, mimeType);
  }

  async getPageCount(fileId: string): Promise<number> {
    const entry = await this.fs.read(fileId);
    const type = await entry.getType();
    if (type !== 'application/pdf') {
      // Non-PDF inputs are treated as single-page assets for limit checks.
      return 1;
    }
    const blob = await entry.getBlob();
    const bytes = new Uint8Array(await blob.arrayBuffer());
    return PdfFileMetadataService.getPageCountFromBytes(bytes, type);
  }
}
