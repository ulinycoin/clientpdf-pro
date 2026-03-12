let pdfJsPromise: Promise<typeof import('pdfjs-dist')> | null = null;
let pdfLibPromise: Promise<typeof import('pdf-lib')> | null = null;
let pdfJsWorkerInitialized = false;

export async function getPdfJs(): Promise<typeof import('pdfjs-dist')> {
  if (!pdfJsPromise) {
    pdfJsPromise = import('pdfjs-dist');
  }
  const pdfjs = await pdfJsPromise;
  if (!pdfJsWorkerInitialized) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString();
    pdfJsWorkerInitialized = true;
  }
  return pdfjs;
}

export function getPdfLib(): Promise<typeof import('pdf-lib')> {
  if (!pdfLibPromise) {
    pdfLibPromise = import('pdf-lib');
  }
  return pdfLibPromise;
}
