import { create } from 'zustand';
import type { StudioDocument, DetachedPageItem, PageItem } from './studio-store-types';
import { useUIStore } from './ui-store';
import { useEditSessionStore } from './session-store';

export interface DocumentState {
    documents: StudioDocument[];
    detachedPages: DetachedPageItem[];
    workspaceVersion: number;
    lastExportedVersion: number;

    addDocument: (doc: StudioDocument) => void;
    updateDocument: (id: string, updates: Partial<StudioDocument>) => void;
    removeDocument: (id: string) => void;
    setDocuments: (docs: StudioDocument[]) => void;

    movePage: (sourceDocId: string, pageId: string, targetDocId: string, index?: number) => void;
    detachPage: (docId: string, pageId: string, x: number, y: number) => void;
    attachDetachedPage: (detachedPageId: string, targetDocId: string, index?: number) => void;
    moveDetachedPage: (detachedPageId: string, x: number, y: number) => void;
    removeDetachedPage: (detachedPageId: string) => void;
    removePage: (docId: string, pageId: string) => void;
    updatePage: (docId: string, pageId: string, updates: Partial<PageItem>) => void;

    recountWorkspacePages: () => void;
    markWorkspaceExported: () => void;
    clearDocs: () => void;
}

function normalizeWorkspaceState(docs: StudioDocument[], prevActiveDocId: string | null = null) {
    const uiStore = useUIStore.getState();
    const sessionStore = useEditSessionStore.getState();

    let activeDocIdToUse = uiStore.activeDocumentId;
    if (prevActiveDocId !== null) {
        activeDocIdToUse = prevActiveDocId;
    }

    const documents = docs.filter((doc) => doc.pages.length > 0 || doc.allowEmpty);
    const resolvedActiveDocumentId = documents.some((doc) => doc.id === activeDocIdToUse)
        ? activeDocIdToUse
        : (documents[0]?.id ?? null);

    const existingPageIds = new Set(documents.flatMap((doc) => doc.pages.map((page) => page.id)));

    const selection = uiStore.selection.filter((item) => existingPageIds.has(item.pageId));
    if (selection.length !== uiStore.selection.length) {
        uiStore.setSelection(selection);
    }

    if (resolvedActiveDocumentId !== uiStore.activeDocumentId) {
        uiStore.setActiveDocument(resolvedActiveDocumentId);
    }

    const editSession = sessionStore.editSession;
    if (editSession && !existingPageIds.has(editSession.pageId)) {
        sessionStore.clearEditSession();
    }
}

function commitDocs(state: DocumentState, nextDocs: StudioDocument[], overrides?: Partial<DocumentState>, activeDocOverride?: string | null): DocumentState {
    normalizeWorkspaceState(nextDocs, activeDocOverride);
    return {
        ...state,
        documents: nextDocs,
        ...overrides,
        workspaceVersion: state.workspaceVersion + 1,
    };
}

export const useDocumentStore = create<DocumentState>((set) => ({
    documents: [],
    detachedPages: [],
    workspaceVersion: 0,
    lastExportedVersion: 0,

    addDocument: (doc) => set((state) => {
        const uiStore = useUIStore.getState();
        const nextActiveId = uiStore.activeDocumentId ?? doc.id;
        return commitDocs(state, [...state.documents, doc], {}, nextActiveId);
    }),

    updateDocument: (id, updates) => set((state) => {
        return commitDocs(state, state.documents.map(d => d.id === id ? { ...d, ...updates } : d));
    }),

    removeDocument: (id) => set((state) => {
        const uiStore = useUIStore.getState();
        let nextActive = uiStore.activeDocumentId;
        if (nextActive === id) nextActive = null;
        return commitDocs(state, state.documents.filter(d => d.id !== id), {}, nextActive);
    }),

    setDocuments: (docs) => set((state) => {
        return commitDocs(state, docs);
    }),

    updatePage: (docId, pageId, updates) => set((state) => {
        const nextDocs = state.documents.map(d => d.id === docId ? {
            ...d,
            isModified: true,
            pages: d.pages.map(p => p.id === pageId ? { ...p, ...updates } : p)
        } : d);
        return commitDocs(state, nextDocs);
    }),

    movePage: (sourceDocId, pageId, targetDocId, index) => set((state) => {
        const sourceDoc = state.documents.find(d => d.id === sourceDocId);
        const targetDoc = state.documents.find(d => d.id === targetDocId);
        if (!sourceDoc || !targetDoc) return state;

        const page = sourceDoc.pages.find(p => p.id === pageId);
        if (!page) return state;

        let newSourcePages = sourceDoc.pages.filter(p => p.id !== pageId);
        let newTargetPages: PageItem[];
        let nextDocs: StudioDocument[];

        if (sourceDocId === targetDocId) {
            newTargetPages = [...newSourcePages];
            if (typeof index === 'number') newTargetPages.splice(index, 0, page);
            else newTargetPages.push(page);
            nextDocs = state.documents.map(d => d.id === sourceDocId ? { ...d, pages: newTargetPages, isModified: true } : d);
        } else {
            newTargetPages = [...targetDoc.pages];
            if (typeof index === 'number') newTargetPages.splice(index, 0, page);
            else newTargetPages.push(page);
            nextDocs = state.documents.slice().map(d => {
                if (d.id === sourceDocId) return { ...d, pages: newSourcePages, isModified: true };
                if (d.id === targetDocId) return { ...d, pages: newTargetPages, isModified: true };
                return d;
            });
        }
        return commitDocs(state, nextDocs);
    }),

    detachPage: (docId, pageId, x, y) => set((state) => {
        const sourceDoc = state.documents.find((doc) => doc.id === docId);
        const page = sourceDoc?.pages.find((candidate) => candidate.id === pageId);
        if (!sourceDoc || !page) return state;

        const nextDocs = state.documents.map((doc) => {
            if (doc.id !== docId) return doc;
            return {
                ...doc,
                isModified: true,
                pages: doc.pages.filter((candidate) => candidate.id !== pageId),
            };
        });
        const uiStore = useUIStore.getState();
        uiStore.setSelection(uiStore.selection.filter(item => item.pageId !== pageId));

        return commitDocs(state, nextDocs, { detachedPages: [...state.detachedPages, { ...page, x, y }] });
    }),

    attachDetachedPage: (detachedPageId, targetDocId, index) => set((state) => {
        const detached = state.detachedPages.find((item) => item.id === detachedPageId);
        const targetDoc = state.documents.find((doc) => doc.id === targetDocId);
        if (!detached || !targetDoc) return state;

        const page: PageItem = {
            id: detached.id, fileId: detached.fileId, pageIndex: detached.pageIndex, thumbnailUrl: detached.thumbnailUrl, rotation: detached.rotation,
        };
        const nextDocs = state.documents.map((doc) => {
            if (doc.id !== targetDocId) return doc;
            const pages = [...doc.pages];
            if (typeof index === 'number') pages.splice(index, 0, page);
            else pages.push(page);
            return { ...doc, isModified: true, pages };
        });
        return commitDocs(state, nextDocs, { detachedPages: state.detachedPages.filter(item => item.id !== detachedPageId) });
    }),

    moveDetachedPage: (detachedPageId, x, y) => set((state) => ({
        detachedPages: state.detachedPages.map((item) => item.id === detachedPageId ? { ...item, x, y } : item),
    })),

    removeDetachedPage: (detachedPageId) => set((state) => ({
        detachedPages: state.detachedPages.filter((item) => item.id !== detachedPageId),
    })),

    removePage: (docId, pageId) => set((state) => {
        const nextDocs = state.documents.map((doc) => {
            if (doc.id !== docId) return doc;
            return {
                ...doc,
                isModified: true,
                pages: doc.pages.filter((page) => page.id !== pageId),
            };
        });
        const uiStore = useUIStore.getState();
        uiStore.setSelection(uiStore.selection.filter((item) => item.pageId !== pageId));
        return commitDocs(state, nextDocs);
    }),

    recountWorkspacePages: () => set((state) => commitDocs(state, state.documents)),
    markWorkspaceExported: () => set((state) => ({ lastExportedVersion: state.workspaceVersion })),
    clearDocs: () => set({ documents: [], detachedPages: [], workspaceVersion: 0, lastExportedVersion: 0 }),
}));
