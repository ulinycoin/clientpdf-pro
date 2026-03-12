export class OcrPipelineError extends Error {
  constructor(
    public readonly code:
      | 'OCR_ENGINE_UNAVAILABLE'
      | 'OCR_UNSUPPORTED_INPUT'
      | 'OCR_PDF_RASTERIZER_MISSING'
      | 'OCR_LANGUAGE_PACK_UNAVAILABLE'
      | 'OCR_RECOGNITION_FAILED',
    message: string,
  ) {
    super(message);
  }
}
