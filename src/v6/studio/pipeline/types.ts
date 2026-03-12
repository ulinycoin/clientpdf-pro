export type Operation =
    | { type: 'rotate'; pageIndices: number[]; angle: 90 | 180 | 270 }
    | { type: 'delete'; pageIndices: number[] }
    | { type: 'reorder'; sequence: { sourceFileId: string; pageIndex: number; rotation?: number }[] }
    | { type: 'compress'; level: 'low' | 'medium' | 'high' };

export interface IPipelineRecipe {
    inputs: string[]; // Virtual File IDs
    operations: Operation[];
    outputName: string;
}

export interface PipelineResult {
    fileId: string;
    size: number;
    pageCount: number;
}
