import { PDFDocument, degrees } from 'pdf-lib';
import type {
    PDFProcessingResult,
    ProgressCallback
} from '@/types/pdf';

/**
 * Service dedicated to PDF page manipulations (extracting, deleting, rotating).
 * Extracted from the monolithic PDFService for better maintainability.
 */
export class PageManipulationService {
    /**
     * Extract PDF pages
     */
    async extractPDF(
        file: File,
        pagesToExtract: number[],
        onProgress?: ProgressCallback
    ): Promise<PDFProcessingResult> {
        const startTime = performance.now();

        try {
            onProgress?.(0, 'Loading PDF...');

            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const totalPages = pdfDoc.getPageCount();

            // Validate page numbers
            const validPages = pagesToExtract.filter(p => p >= 1 && p <= totalPages);
            if (validPages.length === 0) {
                throw new Error('No valid pages to extract');
            }

            onProgress?.(20, `Extracting ${validPages.length} pages...`);

            // Create new document with extracted pages
            const newPdfDoc = await PDFDocument.create();

            let copiedCount = 0;
            for (const pageNum of validPages) {
                const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNum - 1]);
                newPdfDoc.addPage(copiedPage);

                copiedCount++;
                const progress = 20 + (copiedCount / validPages.length) * 60;
                onProgress?.(progress, `Extracting page ${copiedCount}/${validPages.length}...`);
            }

            onProgress?.(80, 'Saving PDF...');

            const pdfBytes = await newPdfDoc.save();
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

            const processingTime = performance.now() - startTime;
            onProgress?.(100, 'Completed!');

            return {
                success: true,
                data: blob,
                metadata: {
                    pageCount: validPages.length,
                    originalSize: file.size,
                    processedSize: blob.size,
                    compressionRatio: blob.size / file.size,
                    processingTime
                }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'EXTRACT_FAILED',
                    message: error instanceof Error ? error.message : 'Extract pages failed'
                }
            };
        }
    }

    /**
     * Delete PDF pages
     */
    async deletePDF(
        file: File,
        pagesToDelete: number[],
        onProgress?: ProgressCallback
    ): Promise<PDFProcessingResult> {
        const startTime = performance.now();

        try {
            onProgress?.(0, 'Loading PDF...');

            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const totalPages = pdfDoc.getPageCount();

            // Calculate pages to keep
            const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);
            const pagesToKeep = allPages.filter(p => !pagesToDelete.includes(p));

            if (pagesToKeep.length === 0) {
                throw new Error('Cannot delete all pages');
            }

            onProgress?.(20, `Removing ${pagesToDelete.length} pages...`);

            // Create new document with only pages to keep
            const newPdfDoc = await PDFDocument.create();

            let copiedCount = 0;
            for (const pageNum of pagesToKeep) {
                const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNum - 1]);
                newPdfDoc.addPage(copiedPage);

                copiedCount++;
                const progress = 20 + (copiedCount / pagesToKeep.length) * 60;
                onProgress?.(progress, `Copying page ${copiedCount}/${pagesToKeep.length}...`);
            }

            onProgress?.(80, 'Saving PDF...');

            const pdfBytes = await newPdfDoc.save();
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

            const processingTime = performance.now() - startTime;
            onProgress?.(100, 'Completed!');

            return {
                success: true,
                data: blob,
                metadata: {
                    pageCount: pagesToKeep.length,
                    originalSize: file.size,
                    processedSize: blob.size,
                    compressionRatio: blob.size / file.size,
                    processingTime
                }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'DELETE_FAILED',
                    message: error instanceof Error ? error.message : 'Delete pages failed'
                }
            };
        }
    }

    /**
     * Rotate PDF pages
     */
    async rotatePDF(
        file: File | Blob,
        angle: 0 | 90 | 180 | 270,
        pages: number[],
        onProgress?: ProgressCallback
    ): Promise<PDFProcessingResult> {
        const startTime = performance.now();

        try {
            onProgress?.(0, 'Loading PDF...');

            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const totalPages = pdfDoc.getPageCount();

            // Validate page numbers
            const validPages = pages.filter(p => p >= 1 && p <= totalPages);

            if (validPages.length === 0) {
                throw new Error('No valid pages to rotate');
            }

            onProgress?.(20, `Rotating ${validPages.length} pages...`);

            // Rotate pages (pdf-lib uses degrees)
            let rotatedCount = 0;
            for (const pageNum of validPages) {
                const page = pdfDoc.getPage(pageNum - 1); // 0-indexed
                const currentRotation = page.getRotation().angle;
                const newRotation = (currentRotation + angle) % 360;
                page.setRotation(degrees(newRotation));

                rotatedCount++;
                const progress = 20 + (rotatedCount / validPages.length) * 60;
                onProgress?.(progress, `Rotated ${rotatedCount}/${validPages.length} pages...`);
            }

            onProgress?.(80, 'Saving PDF...');

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

            const processingTime = performance.now() - startTime;
            onProgress?.(100, 'Completed!');

            return {
                success: true,
                data: blob,
                metadata: {
                    pageCount: totalPages,
                    originalSize: (file as File).size || blob.size,
                    processedSize: blob.size,
                    compressionRatio: blob.size / ((file as File).size || blob.size),
                    processingTime
                }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'ROTATE_FAILED',
                    message: error instanceof Error ? error.message : 'Rotate PDF failed'
                }
            };
        }
    }
    /**
     * Remove ALL images from PDF
     */
    async removeImages(
        file: File,
        onProgress?: ProgressCallback
    ): Promise<PDFProcessingResult<Blob>> {
        const startTime = performance.now();

        try {
            onProgress?.(0, 'Loading PDF...');

            const arrayBuffer = await file.arrayBuffer();
            const { PDFDocument, PDFName, PDFDict, PDFArray } = await import('pdf-lib');
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const pages = pdfDoc.getPages();
            const totalPages = pages.length;

            onProgress?.(10, 'Processing pages...');

            for (let i = 0; i < totalPages; i++) {
                const page = pages[i];
                const resources = page.node.Resources();

                if (resources instanceof PDFDict) {
                    const xObjects = resources.get(PDFName.of('XObject'));

                    if (xObjects instanceof PDFDict) {
                        const keysToRemove: any[] = [];

                        const xObjectKeys = xObjects.keys();
                        for (const key of xObjectKeys) {
                            const ref = xObjects.get(key);
                            const obj = pdfDoc.context.lookup(ref);
                            if (!obj) continue;

                            if (obj instanceof PDFDict) {
                                const subtype = obj.get(PDFName.of('Subtype'));
                                if (subtype === PDFName.of('Image')) {
                                    keysToRemove.push(key);
                                }
                            } else if (obj instanceof PDFArray) {
                                // Unlikely
                            } else {
                                if (obj && 'dict' in (obj as any) && (obj as any).dict instanceof PDFDict) {
                                    const subtype = (obj as any).dict.get(PDFName.of('Subtype'));
                                    if (subtype === PDFName.of('Image')) {
                                        keysToRemove.push(key);
                                    }
                                }
                            }
                        }

                        for (const key of keysToRemove) {
                            xObjects.delete(key);
                        }
                    }
                }

                onProgress?.(
                    10 + ((i + 1) / totalPages) * 80,
                    `Processed page ${i + 1} of ${totalPages}...`
                );
            }

            onProgress?.(90, 'Saving PDF...');

            const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

            const processingTime = performance.now() - startTime;
            onProgress?.(100, 'Removal completed!');

            return {
                success: true,
                data: blob,
                metadata: {
                    pageCount: totalPages,
                    originalSize: file.size,
                    processedSize: blob.size,
                    processingTime,
                    filesCreated: 1
                }
            };

        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'REMOVE_IMAGES_FAILED',
                    message: error instanceof Error ? error.message : 'Image removal failed'
                }
            };
        }
    }
    /**
     * Remove specific images from specific pages
     */
    async removeSelectedImages(
        file: File,
        imagesToRemoveByPage: Map<number, Set<string>>,
        onProgress?: ProgressCallback
    ): Promise<PDFProcessingResult<Blob>> {
        const startTime = performance.now();

        try {
            onProgress?.(0, 'Loading PDF...');

            const arrayBuffer = await file.arrayBuffer();
            const { PDFDocument, PDFName, PDFDict } = await import('pdf-lib');
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const pages = pdfDoc.getPages();
            const totalPages = pages.length;

            onProgress?.(10, 'Analysing images...');

            const imageCountByPage = new Map<number, number>();

            for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
                const pageNumber = pageIndex + 1;
                const page = pages[pageIndex];
                const resources = page.node.Resources();

                if (!imagesToRemoveByPage.has(pageNumber)) {
                    continue; // Skip pages with no images to remove
                }

                if (resources instanceof PDFDict) {
                    const xObjects = resources.get(PDFName.of('XObject'));

                    if (xObjects instanceof PDFDict) {
                        const keysToRemove: any[] = [];

                        const xObjectKeys = xObjects.keys();
                        for (const key of xObjectKeys) {
                            const ref = xObjects.get(key);
                            const obj = pdfDoc.context.lookup(ref);

                            const dict = obj instanceof PDFDict ? obj : (obj && 'dict' in (obj as any) && (obj as any).dict instanceof PDFDict) ? (obj as any).dict : null;

                            if (dict) {
                                const subtype = dict.get(PDFName.of('Subtype'));

                                if (subtype && subtype.toString() === '/Image') {
                                    if (!imageCountByPage.has(pageNumber)) {
                                        imageCountByPage.set(pageNumber, 0);
                                    }
                                    const imgIndex = imageCountByPage.get(pageNumber)! + 1;
                                    imageCountByPage.set(pageNumber, imgIndex);

                                    const expectedFilename = `page${pageNumber}_img${imgIndex}.jpg`;
                                    const expectedFilenamePng = `page${pageNumber}_img${imgIndex}.png`;

                                    const shouldRemove = imagesToRemoveByPage.get(pageNumber)!.has(expectedFilename) ||
                                        imagesToRemoveByPage.get(pageNumber)!.has(expectedFilenamePng);

                                    if (shouldRemove) {
                                        keysToRemove.push(key);
                                    }
                                }
                            }
                        }

                        for (const key of keysToRemove) {
                            xObjects.delete(key);
                        }
                    }
                }

                onProgress?.(
                    10 + ((pageIndex + 1) / totalPages) * 80,
                    `Processed page ${pageNumber} of ${totalPages}...`
                );
            }

            onProgress?.(90, 'Saving PDF...');

            const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

            const processingTime = performance.now() - startTime;
            onProgress?.(100, 'Removal completed!');

            return {
                success: true,
                data: blob,
                metadata: {
                    pageCount: totalPages,
                    originalSize: file.size,
                    processedSize: blob.size,
                    processingTime,
                    filesCreated: 1
                }
            };

        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'REMOVE_IMAGES_FAILED',
                    message: error instanceof Error ? error.message : 'Image removal failed'
                }
            };
        }
    }
    /**
     * Reorder and rotate pages within a PDF
     */
    async organizePDF(
        file: File,
        pageOperations: Array<{
            originalPageNumber: number;
            newPosition: number;
            rotation: number;
        }>,
        onProgress?: ProgressCallback
    ): Promise<PDFProcessingResult> {
        try {
            onProgress?.(0, 'Loading PDF...');
            const arrayBuffer = await file.arrayBuffer();
            const { PDFDocument, degrees } = await import('pdf-lib');
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

            onProgress?.(20, 'Creating new layout...');
            const newPdf = await PDFDocument.create();

            // We need to keep track of source documents to copy pages from
            // In this version, we're only working with one source file
            const sourcePdf = pdfDoc;

            for (let i = 0; i < pageOperations.length; i++) {
                const operation = pageOperations[i];
                onProgress?.(
                    20 + (i / pageOperations.length) * 60,
                    `Processing page ${i + 1} of ${pageOperations.length}...`
                );

                // Get source page (pdf-lib uses 0-based indexing)
                const sourcePageIndex = operation.originalPageNumber - 1;

                if (sourcePageIndex < 0 || sourcePageIndex >= sourcePdf.getPageCount()) {
                    console.warn(`Invalid page number: ${operation.originalPageNumber}`);
                    continue;
                }

                // Copy page to new document
                const [copiedPage] = await newPdf.copyPages(sourcePdf, [sourcePageIndex]);

                // Apply rotation if needed
                if (operation.rotation !== 0) {
                    const currentRotation = copiedPage.getRotation().angle;
                    copiedPage.setRotation(degrees(currentRotation + operation.rotation));
                }

                // Add page to new document
                newPdf.addPage(copiedPage);
            }

            onProgress?.(85, 'Finalizing document...');

            // Save the new PDF
            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });

            onProgress?.(100, 'Complete!');

            return {
                success: true,
                data: blob,
                metadata: {
                    pageCount: newPdf.getPageCount(),
                    originalSize: file.size,
                    processedSize: blob.size,
                    processingTime: 0,
                },
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'ORGANIZE_FAILED',
                    message: error instanceof Error ? error.message : 'Organize PDF failed'
                }
            };
        }
    }
}

export const pageManipulationService = new PageManipulationService();
