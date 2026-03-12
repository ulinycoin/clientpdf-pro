import type { ToolLogicFunction } from '../../../core/types/contracts';
import { createPdfEngine } from '../../../services/pdf/pdf-engine';

export const run: ToolLogicFunction = async ({ inputIds, fs, emitProgress }) => {
  if (inputIds.length === 0) {
    throw new Error('Merge PDF requires at least one input file');
  }

  const inputs: Blob[] = [];
  for (let i = 0; i < inputIds.length; i += 1) {
    const entry = await fs.read(inputIds[i]);
    const blob = await entry.getBlob();
    inputs.push(blob);

    const progress = Math.round(((i + 1) / inputIds.length) * 90);
    emitProgress?.(progress);
  }

  const engine = await createPdfEngine();
  const mergedBlob = await engine.merge(inputs);
  const outputEntry = await fs.write(mergedBlob);
  emitProgress?.(100);
  return { outputIds: [outputEntry.id] };
};
