import type { ToolLogicFunction } from '../../../core/types/contracts';
import type { QpdfEngine } from '../../../services/pdf/qpdf-engine';
import { createQpdfEngine } from '../../../services/pdf/qpdf-engine';

function getStringOption(options: Record<string, unknown> | undefined, key: string): string {
  const value = options?.[key];
  return typeof value === 'string' ? value : '';
}

export async function runUnlockPdf(
  params: Parameters<ToolLogicFunction>[0],
  engineFactory: () => Promise<QpdfEngine>,
): Promise<{ outputIds: string[] }> {
  const { inputIds, fs, options, emitProgress } = params;
  if (inputIds.length === 0) {
    throw new Error('Unlock PDF requires at least one input file');
  }

  const password = getStringOption(options, 'password');
  const engine = await engineFactory();
  const outputIds: string[] = [];

  for (let i = 0; i < inputIds.length; i += 1) {
    const entry = await fs.read(inputIds[i]);
    const inputBlob = await entry.getBlob();
    const unlockedBlob = await engine.decrypt(inputBlob, { password: password || undefined });
    const output = await fs.write(unlockedBlob);
    outputIds.push(output.id);

    const progress = Math.round(((i + 1) / inputIds.length) * 100);
    emitProgress?.(progress);
  }

  return { outputIds };
}

export const run: ToolLogicFunction = async (params) => runUnlockPdf(params, createQpdfEngine);
