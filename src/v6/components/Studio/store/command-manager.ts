import type { SaveCheckpointEntry } from './studio-store-types';

export type CommandType = 'APPLY_TEXT_EDITS';

export interface BaseCommand {
    id: string;
    type: CommandType;
    timestamp: number;
}

export interface ApplyTextEditsCommand extends BaseCommand {
    type: 'APPLY_TEXT_EDITS';
    payload: {
        entries: SaveCheckpointEntry[];
    };
}

export type AnyCommand = ApplyTextEditsCommand;

export const CommandExecutor = {
    execute: (command: AnyCommand, updatePage: (docId: string, pageId: string, patch: any) => void) => {
        if (command.type === 'APPLY_TEXT_EDITS') {
            for (const entry of command.payload.entries) {
                updatePage(entry.docId, entry.pageId, {
                    fileId: entry.nextFileId,
                    pageIndex: entry.pageIndex,
                    thumbnailUrl: entry.nextThumbnailUrl,
                });
            }
        }
    },
    undo: (command: AnyCommand, updatePage: (docId: string, pageId: string, patch: any) => void) => {
        if (command.type === 'APPLY_TEXT_EDITS') {
            for (const entry of command.payload.entries) {
                updatePage(entry.docId, entry.pageId, {
                    fileId: entry.prevFileId,
                    pageIndex: entry.pageIndex,
                    thumbnailUrl: entry.prevThumbnailUrl,
                });
            }
        }
    }
};
