import { PDFDocument } from 'pdf-lib';
import type {
    PDFProcessingResult,
    ProgressCallback
} from '@/types/pdf';

/**
 * Service dedicated to splitting PDF files.
 * Extracted from the monolithic PDFService for better maintainability.
 */
export class SplitService {
    /**
     * Split PDF into multiple files
     */
    async splitPDF(
        file: File,
        mode: 'pages' | 'range' | 'intervals' | 'custom',
        options: { pages?: number[]; start?: number; end?: number; interval?: number },
        onProgress?: ProgressCallback
    ): Promise<PDFProcessingResult<Blob[]>> {
        const startTime = performance.now();

        try {
            onProgress?.(0, 'Loading PDF...');

            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const totalPages = pdfDoc.getPageCount();

            onProgress?.(10, 'Analyzing PDF structure...');

            const results: Blob[] = [];

            if (mode === 'pages') {
                // Split into individual pages
                onProgress?.(20, 'Splitting into individual pages...');

                for (let i = 0; i < totalPages; i++) {
                    const newPdf = await PDFDocument.create();
                    const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
                    newPdf.addPage(copiedPage);

                    const pdfBytes = await newPdf.save();
                    results.push(new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }));

                    onProgress?.(
                        20 + ((i + 1) / totalPages) * 70,
                        `Processing page ${i + 1} of ${totalPages}...`
                    );
                }
            } else if (mode === 'range' && options.start && options.end) {
                // Extract page range
                const start = Math.max(1, options.start);
                const end = Math.min(totalPages, options.end);

                onProgress?.(20, `Extracting pages ${start}-${end}...`);

                const newPdf = await PDFDocument.create();
                const pageIndices = Array.from(
                    { length: end - start + 1 },
                    (_, i) => start - 1 + i
                );

                const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
                copiedPages.forEach((page) => newPdf.addPage(page));

                onProgress?.(80, 'Saving extracted pages...');

                const pdfBytes = await newPdf.save();
                results.push(new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }));
            } else if (mode === 'intervals' && options.interval) {
                // Split by intervals
                const interval = options.interval;
                const numChunks = Math.ceil(totalPages / interval);

                onProgress?.(20, `Splitting into ${numChunks} files...`);

                for (let i = 0; i < numChunks; i++) {
                    const startPage = i * interval;
                    const endPage = Math.min((i + 1) * interval, totalPages);

                    const newPdf = await PDFDocument.create();
                    const pageIndices = Array.from(
                        { length: endPage - startPage },
                        (_, j) => startPage + j
                    );

                    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
                    copiedPages.forEach((page) => newPdf.addPage(page));

                    const pdfBytes = await newPdf.save();
                    results.push(new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }));

                    onProgress?.(
                        20 + ((i + 1) / numChunks) * 70,
                        `Creating file ${i + 1} of ${numChunks}...`
                    );
                }
            } else if (mode === 'custom' && options.pages && options.pages.length > 0) {
                // Extract specific pages
                const pages = options.pages;
                onProgress?.(20, `Extracting ${pages.length} specific pages...`);

                for (let i = 0; i < pages.length; i++) {
                    const pageIndex = pages[i] - 1; // Convert to 0-based index

                    if (pageIndex >= 0 && pageIndex < totalPages) {
                        const newPdf = await PDFDocument.create();
                        const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex]);
                        newPdf.addPage(copiedPage);

                        const pdfBytes = await newPdf.save();
                        results.push(new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }));
                    }

                    onProgress?.(
                        20 + ((i + 1) / pages.length) * 70,
                        `Extracting page ${pages[i]} (${i + 1} of ${pages.length})...`
                    );
                }
            }

            onProgress?.(100, 'Split completed!');

            const processingTime = performance.now() - startTime;

            return {
                success: true,
                data: results,
                metadata: {
                    pageCount: totalPages,
                    originalSize: file.size,
                    processedSize: results.reduce((sum, blob) => sum + blob.size, 0),
                    processingTime,
                    filesCreated: results.length,
                }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'SPLIT_FAILED',
                    message: error instanceof Error ? error.message : 'PDF split failed'
                }
            };
        }
    }
}

export const splitService = new SplitService();
