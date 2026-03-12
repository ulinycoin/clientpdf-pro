import type { ToolLogicFunction } from '../../../core/types/contracts';
import type { QpdfEngine } from '../../../services/pdf/qpdf-engine';
import { createQpdfEngine } from '../../../services/pdf/qpdf-engine';
import { QpdfPipelineError } from '../../../services/pdf/qpdf-errors';

type PrintingPermission = 'none' | 'low' | 'full';

function getStringOption(options: Record<string, unknown> | undefined, key: string): string {
  const value = options?.[key];
  return typeof value === 'string' ? value.trim() : '';
}

function getBooleanOption(options: Record<string, unknown> | undefined, key: string, defaultValue: boolean): boolean {
  const value = options?.[key];
  return typeof value === 'boolean' ? value : defaultValue;
}

function getPrintingOption(options: Record<string, unknown> | undefined): PrintingPermission {
  const value = options?.printing;
  if (value === 'none' || value === 'low' || value === 'full') {
    return value;
  }
  return 'full';
}

function getKeyLength(options: Record<string, unknown> | undefined): 128 | 256 {
  const raw = Number(options?.keyLength);
  return raw === 128 ? 128 : 256;
}

function hasNodeRuntime(): boolean {
  return typeof process !== 'undefined' && Boolean(process.versions?.node);
}

interface PdfLibEncryptDoc {
  encrypt(options: {
    userPassword: string;
    ownerPassword: string;
    permissions: {
      printing: boolean;
      modifying: boolean;
      copying: boolean;
      annotating: boolean;
      fillingForms: boolean;
      contentAccessibility: boolean;
      documentAssembly: boolean;
    };
  }): Promise<void>;
  save(options?: { useObjectStreams?: boolean }): Promise<Uint8Array>;
}

interface PdfLibPlusEncryptModule {
  PDFDocument: {
    load(data: ArrayBuffer | Uint8Array): Promise<PdfLibEncryptDoc>;
  };
}

async function encryptInBrowserWithPdfLibPlus(inputBlob: Blob, config: {
  userPassword: string;
  ownerPassword: string;
  allowCopying: boolean;
  allowModifying: boolean;
  allowAnnotating: boolean;
  allowFillingForms: boolean;
  allowAccessibility: boolean;
  allowDocumentAssembly: boolean;
  printing: PrintingPermission;
}): Promise<Blob> {
  const mod = await import('pdf-lib-plus-encrypt') as unknown as PdfLibPlusEncryptModule;
  const inputBytes = new Uint8Array(await inputBlob.arrayBuffer());
  const pdfDoc = await mod.PDFDocument.load(inputBytes);
  await pdfDoc.encrypt({
    userPassword: config.userPassword,
    ownerPassword: config.ownerPassword,
    permissions: {
      printing: config.printing !== 'none',
      modifying: config.allowModifying,
      copying: config.allowCopying,
      annotating: config.allowAnnotating,
      fillingForms: config.allowFillingForms,
      contentAccessibility: config.allowAccessibility,
      documentAssembly: config.allowDocumentAssembly,
    },
  });
  const encryptedBytes = await pdfDoc.save({ useObjectStreams: false });
  const normalized = new Uint8Array(encryptedBytes.byteLength);
  normalized.set(encryptedBytes);
  return new Blob([normalized], { type: 'application/pdf' });
}

export async function runProtectPdf(
  params: Parameters<ToolLogicFunction>[0],
  engineFactory: () => Promise<QpdfEngine>,
): Promise<{ outputIds: string[] }> {
  const { inputIds, fs, options, emitProgress } = params;
  if (inputIds.length === 0) {
    throw new Error('Protect PDF requires at least one input file');
  }

  const permissionsOnly = getBooleanOption(options, 'permissionsOnly', false);
  const userPassword = permissionsOnly ? '' : getStringOption(options, 'userPassword');
  const ownerPasswordInput = getStringOption(options, 'ownerPassword');
  const ownerPassword = ownerPasswordInput || userPassword || 'owner-only-restrictions';
  const keyLength = getKeyLength(options);
  const printing = getPrintingOption(options);
  const allowCopying = getBooleanOption(options, 'copying', false);
  const allowModifying = getBooleanOption(options, 'modifying', false);
  const allowAnnotating = getBooleanOption(options, 'annotating', false);
  const allowFillingForms = getBooleanOption(options, 'fillingForms', true);
  const allowAccessibility = getBooleanOption(options, 'contentAccessibility', true);
  const allowDocumentAssembly = getBooleanOption(options, 'documentAssembly', false);

  if (!permissionsOnly && !userPassword) {
    throw new QpdfPipelineError('PROTECT_INVALID_OPTIONS', 'Encryption password is required.');
  }

  const engine = await engineFactory();
  const outputIds: string[] = [];
  const nodeRuntime = hasNodeRuntime();

  for (let i = 0; i < inputIds.length; i += 1) {
    const entry = await fs.read(inputIds[i]);
    const inputBlob = await entry.getBlob();
    const encryptedBlob = nodeRuntime
      ? await engine.encrypt(inputBlob, {
        userPassword,
        ownerPassword,
        keyLength,
        printing,
        modify: allowModifying ? 'all' : 'none',
        extract: allowCopying,
        accessibility: allowAccessibility,
        annotate: allowAnnotating,
        form: allowFillingForms,
        assemble: allowDocumentAssembly,
        modifyOther: allowModifying,
      })
      : await encryptInBrowserWithPdfLibPlus(inputBlob, {
        userPassword,
        ownerPassword,
        allowCopying,
        allowModifying,
        allowAnnotating,
        allowFillingForms,
        allowAccessibility,
        allowDocumentAssembly,
        printing,
      });
    const output = await fs.write(encryptedBlob);
    outputIds.push(output.id);

    const progress = Math.round(((i + 1) / inputIds.length) * 100);
    emitProgress?.(progress);
  }

  return { outputIds };
}

export const run: ToolLogicFunction = async (params) => runProtectPdf(params, createQpdfEngine);
