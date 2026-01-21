import { PDFDocument, PDFName, PDFDict } from 'pdf-lib';
import type {
    PDFProcessingResult,
    ProgressCallback,
    ExtractedImage
} from '@/types/pdf';

/**
 * Service dedicated to extracting raw images from PDF files.
 * Extracted from the monolithic PDFService for better maintainability.
 */
export class ImageExtractionService {
    /**
     * Extract images from PDF using pdf-lib
     */
    async extractImages(
        file: File,
        onProgress?: ProgressCallback
    ): Promise<PDFProcessingResult<ExtractedImage[]>> {
        const startTime = performance.now();

        try {
            onProgress?.(0, 'Loading PDF...');

            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const pages = pdfDoc.getPages();
            const totalPages = pages.length;

            const images: ExtractedImage[] = [];
            let imageCount = 0;

            onProgress?.(10, 'Extracting images...');

            for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
                const page = pages[pageIndex];
                const resources = page.node.Resources();

                if (resources && resources instanceof PDFDict) {
                    const xObjects = resources.get(PDFName.of('XObject'));

                    if (xObjects && xObjects instanceof PDFDict) {
                        const xObjectKeys = xObjects.keys();

                        for (const key of xObjectKeys) {
                            try {
                                const ref = xObjects.get(key);
                                const xObject = pdfDoc.context.lookup(ref);

                                if (xObject instanceof PDFDict || (xObject && 'dict' in xObject && xObject.dict instanceof PDFDict)) {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const dict = xObject instanceof PDFDict ? xObject : (xObject as any).dict;
                                    const subtype = dict.get(PDFName.of('Subtype'));

                                    // Check if it's an image
                                    if (subtype && subtype.toString() === '/Image') {
                                        // Get image properties
                                        const width = dict.get(PDFName.of('Width'));
                                        const height = dict.get(PDFName.of('Height'));

                                        if (!width || !height) continue;

                                        // Extract numeric values safely
                                        let w = 0;
                                        let h = 0;

                                        // Manual extraction from PDF object components
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const extractNum = (obj: any): number => {
                                            if (typeof obj === 'number') return obj;
                                            if (obj && typeof obj.asNumber === 'function') return obj.asNumber();
                                            if (obj && typeof obj.numberValue === 'function') return obj.numberValue();
                                            if (obj && obj.value !== undefined) return Number(obj.value);
                                            if (obj && obj.num !== undefined) return Number(obj.num);
                                            return 0;
                                        };

                                        w = extractNum(width);
                                        h = extractNum(height);

                                        // Validate dimensions
                                        if (!w || !h || w <= 0 || h <= 0 || !Number.isFinite(w) || !Number.isFinite(h)) continue;
                                        if (w > 10000 || h > 10000) continue; // Skip likely error objects

                                        // Get raw image data
                                        let imageData: Uint8Array | null = null;
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        if ('stream' in xObject && (xObject as any).stream) {
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            imageData = (xObject as any).stream.contents;
                                        } else if ('contents' in xObject) {
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            imageData = (xObject as any).contents;
                                        }

                                        if (imageData && imageData.length > 0) {
                                            const filter = dict.get(PDFName.of('Filter'));
                                            let mimeType = 'image/png';
                                            let ext = 'png';

                                            // Check if it's JPEG
                                            if (filter && filter.toString().includes('DCTDecode')) {
                                                mimeType = 'image/jpeg';
                                                ext = 'jpg';
                                            }

                                            imageCount++;
                                            const format = ext === 'jpg' ? 'jpg' : 'png';
                                            images.push({
                                                id: `${pageIndex}_${imageCount}`,
                                                pageNumber: pageIndex + 1,
                                                width: w,
                                                height: h,
                                                mimeType,
                                                extension: ext,
                                                format: format as 'jpg' | 'png',
                                                filename: `image_${pageIndex + 1}_${imageCount}.${ext}`,
                                                data: imageData,
                                                size: imageData.length
                                            });
                                        }
                                    }
                                }
                            } catch (e) {
                                console.warn('Failed to extract object', key.toString(), e);
                            }
                        }
                    }
                }

                onProgress?.(
                    10 + ((pageIndex + 1) / totalPages) * 90,
                    `Analyzed page ${pageIndex + 1}/${totalPages}...`
                );
            }

            const processingTime = performance.now() - startTime;

            return {
                success: true,
                data: images,
                metadata: {
                    pageCount: totalPages,
                    originalSize: file.size,
                    processedSize: 0, // Not applicable for extraction
                    processingTime,
                    imagesExtracted: images.length
                }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'EXTRACTION_FAILED',
                    message: error instanceof Error ? error.message : 'Image extraction failed'
                }
            };
        }
    }
}

export const imageExtractionService = new ImageExtractionService();
