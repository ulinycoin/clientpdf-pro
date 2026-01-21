import { PDFDocument, PDFDict, PDFName } from 'pdf-lib';
import type {
    PDFProcessingResult,
    ProgressCallback,
    CompressionAnalysis
} from '@/types/pdf';

/**
 * Service dedicated to compressing and analyzing PDF files.
 * Extracted from the monolithic PDFService for better maintainability.
 */
export class CompressionService {
    /**
     * Compress PDF with specified quality level
     */
    async compressPDF(
        file: File,
        quality: 'low' | 'medium' | 'high',
        onProgress?: ProgressCallback
    ): Promise<PDFProcessingResult> {
        const startTime = performance.now();

        try {
            onProgress?.(0, 'Loading PDF...');

            const arrayBuffer = await file.arrayBuffer();
            const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const pageCount = sourcePdf.getPageCount();

            onProgress?.(10, 'Analyzing PDF structure...');

            // Create a new PDF to remove encryption and unneeded data
            const pdfDoc = await PDFDocument.create();

            onProgress?.(20, 'Remapping pages...');

            // Copy all pages
            const pages = await pdfDoc.copyPages(sourcePdf, Array.from({ length: pageCount }, (_, i) => i));
            pages.forEach(page => pdfDoc.addPage(page));

            onProgress?.(40, 'Cleaning metadata...');

            // Remove metadata to reduce size
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setKeywords([]);
            pdfDoc.setProducer('');
            pdfDoc.setCreator('');

            onProgress?.(70, 'Optimizing and saving PDF...');

            // Save with optimization
            const pdfBytes = await pdfDoc.save({
                useObjectStreams: true,
                addDefaultPage: false,
                objectsPerTick: quality === 'low' ? 100 : 50,
            });

            onProgress?.(90, 'Calculating results...');

            const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });

            // Calculate compression ratio
            const ratioValue = (1 - blob.size / file.size) * 100;
            const compressionRatio = ratioValue > 0 ? parseFloat(ratioValue.toFixed(1)) : 0;

            onProgress?.(100, 'Compression completed!');

            const processingTime = performance.now() - startTime;

            return {
                success: true,
                data: blob,
                metadata: {
                    pageCount,
                    originalSize: file.size,
                    processedSize: blob.size,
                    processingTime,
                    compressionRatio,
                }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'COMPRESSION_FAILED',
                    message: error instanceof Error ? error.message : 'PDF compression failed'
                }
            };
        }
    }

    /**
     * Analyze PDF for compression potential
     */
    async analyzeCompression(file: File): Promise<CompressionAnalysis> {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const pageCount = pdfDoc.getPageCount();
            const fileSize = file.size;

            let imageCount = 0;

            // Sample first 5 pages to guess content type
            const pagesToSample = Math.min(pageCount, 5);
            const pages = pdfDoc.getPages();

            for (let i = 0; i < pagesToSample; i++) {
                const page = pages[i];
                const resources = page.node.Resources();

                if (resources instanceof PDFDict) {
                    const xObjects = resources.get(PDFName.of('XObject'));
                    if (xObjects instanceof PDFDict) {
                        const keys = xObjects.keys();
                        for (const key of keys) {
                            const ref = xObjects.get(key);
                            const obj = pdfDoc.context.lookup(ref);
                            if (!obj) continue;
                            if (obj instanceof PDFDict || (obj && 'dict' in obj && obj.dict instanceof PDFDict)) {
                                const dict = obj instanceof PDFDict ? obj : (obj as { dict: PDFDict }).dict;
                                if (dict && typeof dict.get === 'function') {
                                    const subtype = dict.get(PDFName.of('Subtype'));
                                    if (subtype && subtype.toString() === '/Image') {
                                        imageCount++;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            const estimatedTotalImages = Math.round(imageCount * (pageCount / pagesToSample));
            const avgFileSize = fileSize / pageCount;

            const isImageHeavy = estimatedTotalImages > pageCount || (fileSize > 5 * 1024 * 1024 && estimatedTotalImages > 0);

            const insights: Array<{ key: string; params?: Record<string, string | number> }> = [];
            let recommendedQuality: 'low' | 'medium' | 'high' = 'medium';
            let savingPotential: 'high' | 'medium' | 'low' = 'medium';

            if (isImageHeavy) {
                insights.push({ key: 'smartCompression.insights.imageCount', params: { count: estimatedTotalImages } });
                if (fileSize > 10 * 1024 * 1024) {
                    recommendedQuality = 'low';
                    savingPotential = 'high';
                    insights.push({ key: 'smartCompression.insights.largeImages' });
                } else {
                    recommendedQuality = 'medium';
                    savingPotential = 'medium';
                }
            } else {
                insights.push({ key: 'smartCompression.insights.mostlyText' });
                if (avgFileSize > 500 * 1024) {
                    recommendedQuality = 'medium';
                    savingPotential = 'medium';
                    insights.push({ key: 'smartCompression.insights.highDensity' });
                } else {
                    recommendedQuality = 'high';
                    savingPotential = 'low';
                    insights.push({ key: 'smartCompression.insights.efficient' });
                }
            }

            return {
                isImageHeavy,
                recommendedQuality,
                savingPotential,
                insights
            };

        } catch (error) {
            return {
                isImageHeavy: false,
                recommendedQuality: 'medium',
                savingPotential: 'medium',
                insights: [{ key: 'smartCompression.insights.standard' }]
            };
        }
    }
}

export const compressionService = new CompressionService();
