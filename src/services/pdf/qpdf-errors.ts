export class QpdfPipelineError extends Error {
  constructor(
    public readonly code:
      | 'PROTECT_QPDF_UNAVAILABLE'
      | 'PROTECT_QPDF_EXECUTION_FAILED'
      | 'PROTECT_INVALID_OPTIONS',
    message: string,
  ) {
    super(message);
  }
}
