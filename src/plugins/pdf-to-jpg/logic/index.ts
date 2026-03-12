import type { ToolLogicFunction } from '../../../core/types/contracts';
import { createPdfRasterizer } from '../../../services/pdf/pdf-rasterizer';

export const run: ToolLogicFunction = async ({ inputIds, fs, emitProgress }) => {
    if (inputIds.length === 0) {
        throw new Error('PDF to JPG requires at least one input file');
    }

    const rasterizer = await createPdfRasterizer();
    if (!rasterizer) {
        throw new Error('PDF rasterizer is not supported in this environment (missing canvas support)');
    }

    const outputIds: string[] = [];

    for (let i = 0; i < inputIds.length; i++) {
        const entry = await fs.read(inputIds[i]);
        const blob = await entry.getBlob();

        // Rasterize all pages
        const pageBlobs = await rasterizer.rasterize(blob);

        for (let j = 0; j < pageBlobs.length; j++) {
            const outEntry = await fs.write(pageBlobs[j]);
            outputIds.push(outEntry.id);
        }

        const progress = Math.round(((i + 1) / inputIds.length) * 100);
        emitProgress?.(progress);
    }

    return { outputIds };
};
