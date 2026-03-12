import type { ToolLogicFunction } from '../../../core/types/contracts';
import { createPdfEngine } from '../../../services/pdf/pdf-engine';

export const run: ToolLogicFunction = async ({ inputIds, fs, emitProgress }) => {
  if (inputIds.length === 0) {
    throw new Error('Split PDF requires at least one input file');
  }

  const outputIds: string[] = [];
  const engine = await createPdfEngine();
  for (let i = 0; i < inputIds.length; i += 1) {
    const entry = await fs.read(inputIds[i]);
    const blob = await entry.getBlob();
    const splitParts = await engine.split(blob);
    for (const part of splitParts) {
      const output = await fs.write(part);
      outputIds.push(output.id);
    }

    const progress = Math.round(((i + 1) / inputIds.length) * 100);
    emitProgress?.(progress);
  }

  return { outputIds };
};
