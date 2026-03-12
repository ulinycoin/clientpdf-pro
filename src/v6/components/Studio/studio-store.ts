import { useStore, type UseBoundStore, type StoreApi } from 'zustand';
import { useDocumentStore, type DocumentState } from './store/document-store';
import { useUIStore, type UIState } from './store/ui-store';
import { useEditSessionStore, type EditSessionState } from './store/session-store';

export * from './store/studio-store-types';

export type StudioState = DocumentState & UIState & EditSessionState & {
    clear: () => void;
};

const combinedStore: StoreApi<StudioState> = {
    getState: (): StudioState => ({
        ...useDocumentStore.getState(),
        ...useUIStore.getState(),
        ...useEditSessionStore.getState(),
        clear: () => {
            useDocumentStore.getState().clearDocs();
            useUIStore.getState().clearUI();
            useEditSessionStore.getState().clearSession();
        }
    }),
    setState: () => { },
    getInitialState: () => combinedStore.getState(),
    subscribe: (listener: (state: StudioState, prevState: StudioState) => void) => {
        let prevState = combinedStore.getState();
        const handleUpdate = () => {
            const nextState = combinedStore.getState();
            listener(nextState, prevState);
            prevState = nextState;
        };
        const unsub1 = useDocumentStore.subscribe(handleUpdate);
        const unsub2 = useUIStore.subscribe(handleUpdate);
        const unsub3 = useEditSessionStore.subscribe(handleUpdate);
        return () => { unsub1(); unsub2(); unsub3(); };
    }
};

export const useStudioStore = (<T>(selector: (state: StudioState) => T): T => {
    return useStore(combinedStore, selector);
}) as UseBoundStore<StoreApi<StudioState>>;

Object.assign(useStudioStore, combinedStore);

declare global {
    interface Window {
        __LOCALPDF_STUDIO_STORE__?: typeof useStudioStore;
    }
}

if (typeof window !== 'undefined' && ((import.meta as any).env?.DEV || window.navigator?.webdriver)) {
    window.__LOCALPDF_STUDIO_STORE__ = useStudioStore;
}
