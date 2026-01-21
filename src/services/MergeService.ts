import { PDFDocument } from 'pdf-lib';
import type {
    PDFProcessingResult,
    MergeOptions,
    ProgressCallback
} from '@/types/pdf';

/**
 * Service dedicated to merging PDF files.
 * Extracted from the monolithic PDFService for better maintainability.
 */
export class MergeService {
    /**
     * Merge multiple PDF files into one
     */
    async mergePDFs(
        files: File[],
        onProgress?: ProgressCallback,
        options: MergeOptions = {}
    ): Promise<PDFProcessingResult> {
        const startTime = performance.now();

        try {
            if (files.length < 2) {
                throw new Error('At least 2 files are required for merging');
            }

            onProgress?.(0, 'Starting merge process...');

            // Create new PDF document
            const mergedPdf = await PDFDocument.create();
            let totalOriginalSize = 0;
            let totalPages = 0;

            // Set metadata if provided
            if (options.metadata) {
                if (options.metadata.title) mergedPdf.setTitle(options.metadata.title);
                if (options.metadata.author) mergedPdf.setAuthor(options.metadata.author);
                if (options.metadata.subject) mergedPdf.setSubject(options.metadata.subject);
            }

            // Determine file order
            const fileOrder = options.order ?
                options.order.map(index => files[index]).filter(Boolean) :
                files;

            // Process each file
            for (let i = 0; i < fileOrder.length; i++) {
                const file = fileOrder[i];
                totalOriginalSize += file.size;

                onProgress?.(
                    (i / fileOrder.length) * 80,
                    `Processing ${file.name}...`
                );

                try {
                    // Load PDF
                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

                    // Copy all pages
                    const pageIndices = Array.from(
                        { length: pdf.getPageCount() },
                        (_, i) => i
                    );
                    const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);

                    // Add pages to merged document
                    copiedPages.forEach((page) => {
                        mergedPdf.addPage(page);
                    });

                    totalPages += pdf.getPageCount();
                } catch (error) {
                    console.warn(`Failed to process file ${file.name}:`, error);
                }
            }

            onProgress?.(90, 'Saving merged PDF...');

            // Save merged PDF
            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });

            onProgress?.(100, 'Merge completed!');

            const processingTime = performance.now() - startTime;

            return {
                success: true,
                data: blob,
                metadata: {
                    pageCount: totalPages,
                    originalSize: totalOriginalSize,
                    processedSize: blob.size,
                    processingTime
                }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'MERGE_FAILED',
                    message: error instanceof Error ? error.message : 'PDF merge failed'
                }
            };
        }
    }
}

export const mergeService = new MergeService();
