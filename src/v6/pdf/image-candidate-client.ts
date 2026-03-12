import type { PlatformRuntime } from '../../app/platform/create-platform';
import type { IWorkerCommand, WorkerPdfImageCandidate } from '../../core/public/contracts';

export async function requestPdfImageCandidates(
  runtime: PlatformRuntime,
  fileId: string,
  pageNumber: number,
  signal?: AbortSignal,
): Promise<WorkerPdfImageCandidate[]> {
  const command: IWorkerCommand = {
    id: crypto.randomUUID(),
    type: 'COMMAND',
    payload: {
      type: 'GET_PDF_IMAGE_CANDIDATES',
      payload: { fileId, pageNumber },
    },
  };
  const finalEvent = await runtime.workerOrchestrator.dispatch(command, undefined, signal);
  if (finalEvent.payload.type === 'IMAGE_CANDIDATES_RESULT') {
    return finalEvent.payload.payload.candidates;
  }
  if (finalEvent.payload.type === 'ERROR') {
    throw new Error(finalEvent.payload.payload.message);
  }
  throw new Error('Unexpected worker response for image candidates');
}
