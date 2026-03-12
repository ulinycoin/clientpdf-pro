export interface CompressOptions {
    quality: 'low' | 'medium' | 'high';
}

export interface ICompressEngine {
    compress(pdfBlob: Blob, options?: CompressOptions): Promise<Blob>;
}

export class PdfLibCompressEngine implements ICompressEngine {
    async compress(pdfBlob: Blob, options: CompressOptions = { quality: 'medium' }): Promise<Blob> {
        const { PDFDocument } = await import('pdf-lib');
        const bytes = new Uint8Array(await pdfBlob.arrayBuffer());
        const doc = await PDFDocument.load(bytes);

        // Basic compression in pdf-lib is achieved by saving with useObjectStreams.
        // Quality levels here are mostly placeholders for more complex logic (like image downsampling)
        // which would require additional libraries or manual image processing.
        // For V6 initial migration, we perform a clean re-save.

        const useObjectStreams = options.quality !== 'low'; // 'low' quality set here implies more aggressive but we use it as a trigger

        const compressedBytes = await doc.save({
            useObjectStreams: useObjectStreams,
            addDefaultPage: false,
        });

        return new Blob([compressedBytes as any], { type: 'application/pdf' });
    }
}

export async function createCompressEngine(): Promise<ICompressEngine> {
    return new PdfLibCompressEngine();
}
