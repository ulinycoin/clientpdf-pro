export interface PageItem {
    id: string;
    fileId: string;
    pageIndex: number;
    thumbnailUrl: string;
    rotation: number;
}

export interface DetachedPageItem extends PageItem {
    x: number;
    y: number;
}

export interface StudioDocument {
    id: string;
    name: string;
    pages: PageItem[];
    x: number;
    y: number;
    isModified?: boolean;
    allowEmpty?: boolean;
    includeInExport?: boolean;
}

export type StudioInteractionMode = 'edit' | 'convert' | null;
export type StudioOperationScope = 'selection' | 'document';
export type StudioEditToolId = 'text' | 'sign' | 'annotate' | 'whiteout' | 'shapes' | 'forms' | 'watermark' | 'protect';

export interface StudioEditSession {
    docId: string;
    pageId: string;
    pageIndex: number;
    sourceFileId: string;
    workingFileId: string;
    activeTool: StudioEditToolId | null;
    startedAt: number;
}

export interface SaveCheckpointEntry {
    docId: string;
    pageId: string;
    pageIndex: number;
    prevFileId: string;
    prevThumbnailUrl: string;
    nextFileId: string;
    nextThumbnailUrl: string;
}

export interface SaveCheckpoint {
    entries: SaveCheckpointEntry[];
}
