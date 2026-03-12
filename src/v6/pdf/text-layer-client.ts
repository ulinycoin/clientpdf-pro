import { IWorkerCommand } from '../../core/public/contracts';
import { TextLayerSpan } from '../components/Studio/editor-types';

export async function requestTextLayerSpans(
    runtime: any,
    fileId: string,
    pageNumber: number,
    signal?: AbortSignal,
): Promise<TextLayerSpan[]> {
    const command: IWorkerCommand = {
        id: crypto.randomUUID(),
        type: 'COMMAND',
        payload: {
            type: 'GET_PDF_TEXT_LAYER',
            payload: { fileId, pageNumber },
        },
    };
    const finalEvent = await runtime.workerOrchestrator.dispatch(command, undefined, signal);
    if (finalEvent.payload.type === 'TEXT_LAYER_RESULT') {
        return finalEvent.payload.payload.spans;
    }
    if (finalEvent.payload.type === 'ERROR') {
        const error = new Error(finalEvent.payload.payload.message) as Error & { code?: string };
        error.code = finalEvent.payload.payload.code;
        throw error;
    }
    throw new Error('Unexpected worker response for text layer request');
}

export async function requestTextLayerSpansFallback(
    runtime: any,
    fileId: string,
    pageNumber: number,
): Promise<TextLayerSpan[]> {
    void runtime;
    void fileId;
    void pageNumber;
    return [];
}
