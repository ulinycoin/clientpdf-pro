import type { RunnerExecuteResult } from '../../core/public/contracts';

export function toUserMessage(result: RunnerExecuteResult): string {
  if (result.type === 'TOOL_RESULT') {
    const count = result.outputIds.length;
    return count === 1 ? 'Done. 1 file generated.' : `Done. ${count} files generated.`;
  }

  if (result.type === 'TOOL_ACCESS_DENIED') {
    if (result.reason === 'ENTITLEMENT_REQUIRED') {
      return result.details ?? 'Access denied. Required permission is missing for this tool.';
    }
    return result.details ?? 'Limit exceeded. Reduce file size/pages or upgrade your plan.';
  }

  switch (result.code) {
    case 'WORKER_TIMEOUT':
      return 'Processing timed out. Try smaller files or split the task.';
    case 'WORKER_CRASH':
      return 'Processing worker crashed. Please retry.';
    case 'PAGE_COUNT_CHECK_TIMEOUT':
      return 'File validation timed out while reading page count. Try a smaller PDF or retry.';
    case 'VFS_QUOTA_EXCEEDED':
      return 'Storage quota exceeded. Remove temporary files or lower input size.';
    case 'OCR_PDF_RASTERIZER_MISSING':
      return 'PDF rasterizer is unavailable in this runtime. OCR for PDF requires canvas/pdf.js support.';
    case 'OCR_ENGINE_UNAVAILABLE':
      return 'OCR engine is unavailable in this runtime.';
    case 'OCR_UNSUPPORTED_INPUT':
      return 'OCR input format is not supported by the current engine.';
    case 'OCR_LANGUAGE_PACK_UNAVAILABLE':
      return result.message || 'Requested OCR language pack is unavailable. Try another language.';
    case 'OCR_RECOGNITION_FAILED':
      return result.message || 'OCR recognition failed.';
    case 'PROTECT_QPDF_UNAVAILABLE':
      return 'PDF protection engine (qpdf) is unavailable in this runtime.';
    case 'PROTECT_INVALID_OPTIONS':
      return result.message || 'Protection settings are invalid.';
    case 'PROTECT_QPDF_EXECUTION_FAILED':
      return result.message || 'qpdf failed to process the file. Verify the password and retry.';
    default:
      return result.message || 'Processing failed due to an unexpected error.';
  }
}
