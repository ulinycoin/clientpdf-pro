import type { PDFPageProxy } from 'pdfjs-dist/types/src/display/api';
import { getPdfJs } from '../../services/pdf/pdf-loader';

export class ThumbnailService {
    private static readonly MIN_THUMBNAIL_WIDTH_PX = 1400;
    private static readonly MIN_RENDER_SCALE = 1;
    private static readonly MAX_RENDER_SCALE = 4;

    private static createCanvasFactory() {
        return {
            create: (width: number, height: number) => {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const context = canvas.getContext('2d');
                if (!context) {
                    throw new Error('Canvas factory failed to get 2d context');
                }
                return { canvas, context };
            },
            reset: (target: { canvas: HTMLCanvasElement }, width: number, height: number) => {
                target.canvas.width = width;
                target.canvas.height = height;
            },
            destroy: (target: { canvas: HTMLCanvasElement }) => {
                target.canvas.width = 0;
                target.canvas.height = 0;
            },
        };
    }

    static async generateThumbnail(pdfBuffer: ArrayBuffer, pageIndex: number): Promise<string> {
        // Use a copy to avoid detachment issues if called multiple times, 
        // though calling this in a loop is still inefficient.
        const pdfjs = await getPdfJs();
        const verbosity = (pdfjs as unknown as { VerbosityLevel?: { ERRORS?: number } }).VerbosityLevel?.ERRORS ?? 0;
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(pdfBuffer.slice(0)), verbosity });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(pageIndex + 1);
        const thumb = await this.generateThumbnailFromPage(page);
        await pdf.destroy();
        return thumb;
    }

    static async generateThumbnailFromPage(page: PDFPageProxy): Promise<string> {
        const baseViewport = page.getViewport({ scale: 1 });
        const scaleFromWidth = ThumbnailService.MIN_THUMBNAIL_WIDTH_PX / Math.max(1, baseViewport.width);
        const renderScale = Math.min(
            ThumbnailService.MAX_RENDER_SCALE,
            Math.max(ThumbnailService.MIN_RENDER_SCALE, scaleFromWidth),
        );
        const viewport = page.getViewport({ scale: renderScale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = 'high';
            await (page as unknown as { render: (params: Record<string, unknown>) => { promise: Promise<void> } }).render({
                canvasContext: context,
                viewport,
                canvas,
                annotationMode: 0,
                canvasFactory: ThumbnailService.createCanvasFactory(),
            }).promise;
            return canvas.toDataURL('image/png');
        }

        throw new Error('Canvas context not available');
    }
}
