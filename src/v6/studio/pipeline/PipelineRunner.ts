import { IPipelineRecipe } from './types';

interface PipelineFileEntry {
    getBlob(): Promise<Blob>;
}

interface PipelineFileSystem {
    read(id: string): Promise<PipelineFileEntry>;
}

export class PipelineRunner {
    constructor(private readonly vfs: PipelineFileSystem) { }

    async execute(recipe: IPipelineRecipe): Promise<{ buffer: Uint8Array; fileName: string }> {
        // 1. Gather all unique input file buffers from VFS
        const files: { id: string; buffer: Uint8Array }[] = [];
        for (const inputId of recipe.inputs) {
            const entry = await this.vfs.read(inputId);
            const blob = await entry.getBlob();
            const buffer = await blob.arrayBuffer();
            files.push({ id: inputId, buffer: new Uint8Array(buffer) });
        }

        // 2. Instantiate and run worker
        return new Promise((resolve, reject) => {
            const worker = new Worker(
                new URL('./pipeline.worker.ts', import.meta.url),
                { type: 'module' }
            );

            worker.onmessage = (e) => {
                if (e.data.type === 'SUCCESS') {
                    resolve({
                        buffer: e.data.buffer,
                        fileName: e.data.fileName
                    });
                } else {
                    reject(new Error(e.data.error || 'Pipeline execution failed'));
                }
                worker.terminate();
            };

            worker.onerror = (err) => {
                reject(err);
                worker.terminate();
            };

            // Send data to worker. Node: we can use transferable objects for buffers
            const buffers = files.map(f => f.buffer.buffer);
            worker.postMessage({ recipe, files }, buffers);
        });
    }
}
