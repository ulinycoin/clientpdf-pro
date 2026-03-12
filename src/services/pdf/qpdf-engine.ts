import { QpdfPipelineError } from './qpdf-errors';

export interface EncryptPdfOptions {
  userPassword: string;
  ownerPassword?: string;
  keyLength?: 128 | 256;
  printing?: 'none' | 'low' | 'full';
  modify?: 'none' | 'assembly' | 'form' | 'annotate' | 'all';
  extract?: boolean;
  accessibility?: boolean;
  annotate?: boolean;
  form?: boolean;
  assemble?: boolean;
  modifyOther?: boolean;
  cleartextMetadata?: boolean;
  allowInsecure?: boolean;
}

export interface DecryptPdfOptions {
  password?: string;
}

export interface QpdfEngine {
  encrypt(pdfBlob: Blob, options: EncryptPdfOptions): Promise<Blob>;
  decrypt(pdfBlob: Blob, options?: DecryptPdfOptions): Promise<Blob>;
}

function hasNodeRuntime(): boolean {
  return typeof process !== 'undefined' && Boolean(process.versions?.node);
}

async function dynamicImport<T>(specifier: string): Promise<T> {
  const importer = new Function('s', 'return import(s)') as (s: string) => Promise<T>;
  return importer(specifier);
}

async function runQpdf(args: string[]): Promise<void> {
  if (!hasNodeRuntime()) {
    throw new QpdfPipelineError('PROTECT_QPDF_UNAVAILABLE', 'qpdf is unavailable in browser runtime.');
  }

  const childProcessMod = await dynamicImport<typeof import('node:child_process')>('node:child_process');
  const spawn = childProcessMod.spawn;

  await new Promise<void>((resolve, reject) => {
    const child = spawn('qpdf', args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';

    child.stderr.on('data', (chunk) => {
      stderr += String(chunk);
    });

    child.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') {
        reject(new QpdfPipelineError('PROTECT_QPDF_UNAVAILABLE', 'qpdf binary was not found in PATH.'));
        return;
      }
      reject(new QpdfPipelineError('PROTECT_QPDF_EXECUTION_FAILED', error.message));
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      const message = stderr.trim() || `qpdf exited with code ${code ?? 'unknown'}`;
      reject(new QpdfPipelineError('PROTECT_QPDF_EXECUTION_FAILED', message));
    });
  });
}

function pushBooleanEncryptOption(args: string[], flag: string, value: boolean | undefined): void {
  if (typeof value !== 'boolean') {
    return;
  }
  args.push(`${flag}=${value ? 'y' : 'n'}`);
}

function normalizePrintOption(value: EncryptPdfOptions['printing']): 'none' | 'low' | 'full' | null {
  if (value === 'none' || value === 'low' || value === 'full') {
    return value;
  }
  return null;
}

function normalizeModifyOption(value: EncryptPdfOptions['modify']): 'none' | 'assembly' | 'form' | 'annotate' | 'all' | null {
  if (value === 'none' || value === 'assembly' || value === 'form' || value === 'annotate' || value === 'all') {
    return value;
  }
  return null;
}

export function buildQpdfEncryptArgs(inputPath: string, outputPath: string, options: EncryptPdfOptions): string[] {
  const userPassword = options.userPassword;
  const ownerPassword = options.ownerPassword ?? options.userPassword;
  const keyLength = options.keyLength ?? 256;
  const args: string[] = ['--encrypt', userPassword, ownerPassword, String(keyLength)];

  const printOpt = normalizePrintOption(options.printing);
  if (printOpt) {
    args.push(`--print=${printOpt}`);
  }

  const modifyOpt = normalizeModifyOption(options.modify);
  if (modifyOpt) {
    args.push(`--modify=${modifyOpt}`);
  }

  pushBooleanEncryptOption(args, '--extract', options.extract);
  pushBooleanEncryptOption(args, '--accessibility', options.accessibility);
  pushBooleanEncryptOption(args, '--annotate', options.annotate);
  pushBooleanEncryptOption(args, '--form', options.form);
  pushBooleanEncryptOption(args, '--assemble', options.assemble);
  pushBooleanEncryptOption(args, '--modify-other', options.modifyOther);

  if (options.cleartextMetadata) {
    args.push('--cleartext-metadata');
  }
  if (options.allowInsecure) {
    args.push('--allow-insecure');
  }

  args.push('--', inputPath, outputPath);
  return args;
}

class NodeQpdfEngine implements QpdfEngine {
  async encrypt(pdfBlob: Blob, options: EncryptPdfOptions): Promise<Blob> {
    const userPassword = options.userPassword;
    const ownerPassword = options.ownerPassword ?? options.userPassword;
    const keyLength = options.keyLength ?? 256;

    if (!userPassword && !ownerPassword) {
      throw new QpdfPipelineError('PROTECT_INVALID_OPTIONS', 'Either userPassword or ownerPassword is required for PDF encryption.');
    }
    if (keyLength !== 128 && keyLength !== 256) {
      throw new QpdfPipelineError('PROTECT_INVALID_OPTIONS', `Unsupported keyLength: ${keyLength}.`);
    }

    if (!hasNodeRuntime()) {
      throw new QpdfPipelineError('PROTECT_QPDF_UNAVAILABLE', 'qpdf is unavailable in browser runtime.');
    }

    const fsMod = await dynamicImport<typeof import('node:fs/promises')>('node:fs/promises');
    const pathMod = await dynamicImport<typeof import('node:path')>('node:path');
    const osMod = await dynamicImport<typeof import('node:os')>('node:os');

    const tempDir = await fsMod.mkdtemp(pathMod.join(osMod.tmpdir(), 'localpdf-qpdf-'));
    const inputPath = pathMod.join(tempDir, 'input.pdf');
    const outputPath = pathMod.join(tempDir, 'output.pdf');

    try {
      const inputBytes = new Uint8Array(await pdfBlob.arrayBuffer());
      await fsMod.writeFile(inputPath, inputBytes);

      await runQpdf(buildQpdfEncryptArgs(inputPath, outputPath, {
        ...options,
        userPassword,
        ownerPassword,
        keyLength,
      }));

      const encryptedBytes = await fsMod.readFile(outputPath);
      const normalized = new Uint8Array(encryptedBytes.byteLength);
      normalized.set(encryptedBytes);
      return new Blob([normalized], { type: 'application/pdf' });
    } finally {
      await fsMod.rm(tempDir, { recursive: true, force: true });
    }
  }

  async decrypt(pdfBlob: Blob, options?: DecryptPdfOptions): Promise<Blob> {
    if (!hasNodeRuntime()) {
      throw new QpdfPipelineError('PROTECT_QPDF_UNAVAILABLE', 'qpdf is unavailable in browser runtime.');
    }

    const fsMod = await dynamicImport<typeof import('node:fs/promises')>('node:fs/promises');
    const pathMod = await dynamicImport<typeof import('node:path')>('node:path');
    const osMod = await dynamicImport<typeof import('node:os')>('node:os');

    const tempDir = await fsMod.mkdtemp(pathMod.join(osMod.tmpdir(), 'localpdf-qpdf-'));
    const inputPath = pathMod.join(tempDir, 'input.pdf');
    const outputPath = pathMod.join(tempDir, 'output.pdf');

    try {
      const inputBytes = new Uint8Array(await pdfBlob.arrayBuffer());
      await fsMod.writeFile(inputPath, inputBytes);

      const args: string[] = [];
      if (options?.password) {
        args.push(`--password=${options.password}`);
      }
      args.push('--decrypt', inputPath, outputPath);
      await runQpdf(args);

      const outputBytes = await fsMod.readFile(outputPath);
      const normalized = new Uint8Array(outputBytes.byteLength);
      normalized.set(outputBytes);
      return new Blob([normalized], { type: 'application/pdf' });
    } finally {
      await fsMod.rm(tempDir, { recursive: true, force: true });
    }
  }
}

export async function createQpdfEngine(): Promise<QpdfEngine> {
  return new NodeQpdfEngine();
}
