import type { PlatformRuntime } from './create-platform';

export interface DownloadOutputsOptions {
  baseName?: string;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read output blob'));
    reader.readAsDataURL(blob);
  });
}

function extensionFromMime(mime: string): string {
  if (mime === 'application/pdf') {
    return 'pdf';
  }
  if (mime === 'text/plain') {
    return 'txt';
  }
  if (mime === 'application/json') {
    return 'json';
  }
  return 'bin';
}

export async function downloadOutputFiles(
  runtime: PlatformRuntime,
  outputIds: string[],
  options: DownloadOutputsOptions = {},
): Promise<number> {
  if (typeof document === 'undefined') {
    throw new Error('Download is available only in browser runtime');
  }

  let count = 0;
  for (let i = 0; i < outputIds.length; i += 1) {
    const outputId = outputIds[i];
    const entry = await runtime.vfs.read(outputId);
    const blob = await entry.getBlob();
    const mime = await entry.getType();
    const ext = extensionFromMime(mime);
    const fileName = options.baseName
      ? `${options.baseName}-${i + 1}.${ext}`
      : `${entry.getName() || outputId}.${ext}`;

    const href = await blobToDataUrl(blob);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = fileName;
    anchor.style.display = 'none';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    count += 1;
  }

  return count;
}
