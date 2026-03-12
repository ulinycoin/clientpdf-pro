declare module 'pdfjs-dist/build/pdf.mjs' {
  export function getDocument(params: {
    data: ArrayBuffer | Uint8Array;
    disableWorker: boolean;
    verbosity?: number;
  }): { promise: Promise<any> };

  export const GlobalWorkerOptions: {
    workerSrc?: string;
  };

  export const VerbosityLevel: {
    ERRORS?: number;
  };
}
