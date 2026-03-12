import { create } from 'zustand';
import type { StudioEditSession, StudioEditToolId, SaveCheckpoint } from './studio-store-types';
import type { AnyCommand } from './command-manager';

export interface EditSessionState {
    editSession: StudioEditSession | null;
    saveUndoStack: SaveCheckpoint[];
    saveRedoStack: SaveCheckpoint[];

    commandUndoStack: AnyCommand[];
    commandRedoStack: AnyCommand[];

    startEditSession: (session: {
        docId: string; pageId: string; pageIndex: number; fileId: string; initialTool?: StudioEditToolId | null;
    }) => void;
    updateEditSessionTool: (tool: StudioEditToolId | null) => void;
    syncEditSessionTarget: (target: { docId: string; pageId: string; pageIndex: number; workingFileId: string }) => void;
    clearEditSession: () => void;

    pushSaveUndo: (checkpoint: SaveCheckpoint) => void;
    popSaveUndo: () => SaveCheckpoint | null;
    pushSaveRedo: (checkpoint: SaveCheckpoint) => void;
    popSaveRedo: () => SaveCheckpoint | null;

    pushCommandUndo: (command: AnyCommand) => void;
    popCommandUndo: () => AnyCommand | null;
    pushCommandRedo: (command: AnyCommand) => void;
    popCommandRedo: () => AnyCommand | null;

    clearSaveStacks: () => void;
    clearSession: () => void;
}

export const useEditSessionStore = create<EditSessionState>((set) => ({
    editSession: null,
    saveUndoStack: [],
    saveRedoStack: [],
    commandUndoStack: [],
    commandRedoStack: [],

    startEditSession: ({ docId, pageId, pageIndex, fileId, initialTool = null }) => set({
        editSession: {
            docId, pageId, pageIndex, sourceFileId: fileId, workingFileId: fileId, activeTool: initialTool, startedAt: Date.now(),
        },
    }),
    updateEditSessionTool: (tool) => set((state) => {
        if (!state.editSession) return state;
        return { editSession: { ...state.editSession, activeTool: tool } };
    }),
    syncEditSessionTarget: (target) => set((state) => {
        if (!state.editSession) return state;
        return { editSession: { ...state.editSession, docId: target.docId, pageId: target.pageId, pageIndex: target.pageIndex, workingFileId: target.workingFileId } };
    }),
    clearEditSession: () => set({ editSession: null }),

    pushSaveUndo: (checkpoint) => set((state) => ({ saveUndoStack: [...state.saveUndoStack, checkpoint], saveRedoStack: [] })),
    popSaveUndo: () => {
        let out: SaveCheckpoint | null = null;
        set((state) => {
            if (state.saveUndoStack.length === 0) return state;
            const nextStack = [...state.saveUndoStack];
            out = nextStack.pop() ?? null;
            return { saveUndoStack: nextStack };
        });
        return out;
    },
    pushSaveRedo: (checkpoint) => set((state) => ({ saveRedoStack: [...state.saveRedoStack, checkpoint] })),
    popSaveRedo: () => {
        let out: SaveCheckpoint | null = null;
        set((state) => {
            if (state.saveRedoStack.length === 0) return state;
            const nextStack = [...state.saveRedoStack];
            out = nextStack.pop() ?? null;
            return { saveRedoStack: nextStack };
        });
        return out;
    },

    pushCommandUndo: (command) => set((state) => ({ commandUndoStack: [...state.commandUndoStack, command], commandRedoStack: [] })),
    popCommandUndo: () => {
        let out: AnyCommand | null = null;
        set((state) => {
            if (state.commandUndoStack.length === 0) return state;
            const nextStack = [...state.commandUndoStack];
            out = nextStack.pop() ?? null;
            return { commandUndoStack: nextStack };
        });
        return out;
    },
    pushCommandRedo: (command) => set((state) => ({ commandRedoStack: [...state.commandRedoStack, command] })),
    popCommandRedo: () => {
        let out: AnyCommand | null = null;
        set((state) => {
            if (state.commandRedoStack.length === 0) return state;
            const nextStack = [...state.commandRedoStack];
            out = nextStack.pop() ?? null;
            return { commandRedoStack: nextStack };
        });
        return out;
    },

    clearSaveStacks: () => set({ saveUndoStack: [], saveRedoStack: [], commandUndoStack: [], commandRedoStack: [] }),
    clearSession: () => set({ editSession: null, saveUndoStack: [], saveRedoStack: [], commandUndoStack: [], commandRedoStack: [] }),
}));
