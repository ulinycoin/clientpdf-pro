import { PDFDocument, degrees } from 'pdf-lib';
import type { IPipelineRecipe } from './types';

interface PipelineInputFile {
    id: string;
    buffer: Uint8Array;
}

interface PipelineWorkerRequest {
    recipe: IPipelineRecipe;
    files: PipelineInputFile[];
}

type PipelineWorkerResponse =
    | { type: 'SUCCESS'; buffer: Uint8Array; fileName: string }
    | { type: 'ERROR'; error: string };

type WorkerScope = {
    onmessage: ((event: MessageEvent<PipelineWorkerRequest>) => void | Promise<void>) | null;
    postMessage: (message: PipelineWorkerResponse, transfer?: Transferable[]) => void;
};

const workerScope = self as unknown as WorkerScope;

workerScope.onmessage = async (e: MessageEvent<PipelineWorkerRequest>) => {
    const { recipe, files } = e.data;

    try {
        const outputDoc = await PDFDocument.create();
        const sourceDocs = new Map<string, PDFDocument>();

        // 1. Load all source documents
        for (const file of files) {
            const doc = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
            sourceDocs.set(file.id, doc);
        }

        // 2. Simple Reorder/Merge execution (The base of Studio operations)
        // For now, let's implement the 'reorder' operation as it covers merge/split.
        const reorderOp = recipe.operations.find((op) => op.type === 'reorder');

        if (reorderOp) {
            for (const item of reorderOp.sequence) {
                const srcDoc = sourceDocs.get(item.sourceFileId);
                if (srcDoc) {
                    const [copiedPage] = await outputDoc.copyPages(srcDoc, [item.pageIndex]);

                    // Apply rotation from the sequence item or separate op
                    const rotation = item.rotation ?? 0;
                    if (rotation !== 0) {
                        copiedPage.setRotation(degrees(rotation));
                    }

                    outputDoc.addPage(copiedPage);
                }
            }
        }

        const pdfBytes = await outputDoc.save();

        const successMessage: PipelineWorkerResponse = {
            type: 'SUCCESS',
            buffer: pdfBytes,
            fileName: recipe.outputName
        };
        workerScope.postMessage(successMessage, [pdfBytes.buffer as ArrayBuffer]);

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Pipeline execution failed';
        const failureMessage: PipelineWorkerResponse = { type: 'ERROR', error: errorMessage };
        workerScope.postMessage(failureMessage);
    }
};
