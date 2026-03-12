import type { ToolLogicFunction } from '../../../core/types/contracts';
import { createPdfEngine } from '../../../services/pdf/pdf-engine';

export const run: ToolLogicFunction = async ({ inputIds, fs, options, emitProgress }) => {
    if (inputIds.length === 0) {
        throw new Error('Delete Pages requires at least one input file');
    }

    const engine = await createPdfEngine();
    const pagesStr = (options?.pages as string) || '';

    // Parse pages (e.g., "1, 3, 5-10")
    const pageIndices: number[] = [];
    const parts = pagesStr.split(',').map(p => p.trim());

    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n.trim(), 10));
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
                    pageIndices.push(i - 1); // 0-indexed
                }
            }
        } else {
            const num = parseInt(part, 10);
            if (!isNaN(num)) {
                pageIndices.push(num - 1); // 0-indexed
            }
        }
    }

    const uniqueIndices = Array.from(new Set(pageIndices));
    const outputIds: string[] = [];

    for (let i = 0; i < inputIds.length; i++) {
        const entry = await fs.read(inputIds[i]);
        const blob = await entry.getBlob();

        const processedBlob = await engine.deletePages(blob, uniqueIndices);

        const outEntry = await fs.write(processedBlob);
        outputIds.push(outEntry.id);

        const progress = Math.round(((i + 1) / inputIds.length) * 100);
        emitProgress?.(progress);
    }

    return { outputIds };
};
