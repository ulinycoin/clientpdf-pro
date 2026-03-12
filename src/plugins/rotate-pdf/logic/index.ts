import type { ToolLogicFunction } from '../../../core/types/contracts';
import { createPdfEngine } from '../../../services/pdf/pdf-engine';

export const run: ToolLogicFunction = async ({ inputIds, fs, options, emitProgress }) => {
    if (inputIds.length === 0) {
        throw new Error('Rotate PDF requires at least one input file');
    }

    const engine = await createPdfEngine();
    const degrees = Number(options?.degrees) || 90;
    const outputIds: string[] = [];

    for (let i = 0; i < inputIds.length; i++) {
        const entry = await fs.read(inputIds[i]);
        const blob = await entry.getBlob();

        const rotatedBlob = await engine.rotate(blob, degrees);

        const outEntry = await fs.write(rotatedBlob);
        outputIds.push(outEntry.id);

        const progress = Math.round(((i + 1) / inputIds.length) * 100);
        emitProgress?.(progress);
    }

    return { outputIds };
};
