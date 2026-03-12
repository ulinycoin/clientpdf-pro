import type { ToolLogicFunction } from '../../../core/types/contracts';
import type { QpdfEngine } from '../../../services/pdf/qpdf-engine';
import { createQpdfEngine } from '../../../services/pdf/qpdf-engine';
import { QpdfPipelineError } from '../../../services/pdf/qpdf-errors';

function getStringOption(options: Record<string, unknown> | undefined, key: string): string {
  const value = options?.[key];
  return typeof value === 'string' ? value : '';
}

function getKeyLength(options: Record<string, unknown> | undefined): 128 | 256 {
  const raw = Number(options?.keyLength);
  return raw === 128 ? 128 : 256;
}

export async function runEncryptPdf(
  params: Parameters<ToolLogicFunction>[0],
  engineFactory: () => Promise<QpdfEngine>,
): Promise<{ outputIds: string[] }> {
  const { inputIds, fs, options, emitProgress } = params;
  if (inputIds.length === 0) {
    throw new Error('Encrypt PDF requires at least one input file');
  }

  const userPassword = getStringOption(options, 'userPassword');
  const ownerPassword = getStringOption(options, 'ownerPassword');
  const keyLength = getKeyLength(options);

  if (!userPassword) {
    throw new QpdfPipelineError('PROTECT_INVALID_OPTIONS', 'Encryption password is required.');
  }

  const engine = await engineFactory();
  const outputIds: string[] = [];

  for (let i = 0; i < inputIds.length; i += 1) {
    const entry = await fs.read(inputIds[i]);
    const inputBlob = await entry.getBlob();
    const encryptedBlob = await engine.encrypt(inputBlob, {
      userPassword,
      ownerPassword: ownerPassword || userPassword,
      keyLength,
    });
    const output = await fs.write(encryptedBlob);
    outputIds.push(output.id);

    const progress = Math.round(((i + 1) / inputIds.length) * 100);
    emitProgress?.(progress);
  }

  return { outputIds };
}

export const run: ToolLogicFunction = async (params) => runEncryptPdf(params, createQpdfEngine);
