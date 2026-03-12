import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudioStore, type PageItem, type StudioDocument, type StudioState } from './studio-store';

export function StudioModeSwitcher() {
    const navigate = useNavigate();
    const documents = useStudioStore((s: StudioState) => s.documents);
    const selection = useStudioStore((s: StudioState) => s.selection);
    const activeDocumentId = useStudioStore((s: StudioState) => s.activeDocumentId);
    const interactionMode = useStudioStore((s: StudioState) => s.interactionMode);
    const setInteractionMode = useStudioStore((s: StudioState) => s.setInteractionMode);
    const setSelection = useStudioStore((s: StudioState) => s.setSelection);
    const startEditSession = useStudioStore((s: StudioState) => s.startEditSession);

    const activeDocument = useMemo(
        () => documents.find((doc: StudioDocument) => doc.id === activeDocumentId) ?? null,
        [activeDocumentId, documents],
    );
    const selectedPages = useMemo(() => {
        return selection
            .map((selected) => {
                const doc = documents.find((candidate: StudioDocument) => candidate.id === selected.docId);
                const page = doc?.pages.find((candidatePage: PageItem) => candidatePage.id === selected.pageId);
                if (!doc || !page) {
                    return null;
                }
                return {
                    docId: doc.id,
                    pageId: page.id,
                    fileId: page.fileId,
                    pageIndex: page.pageIndex,
                };
            })
            .filter((item) => item !== null);
    }, [documents, selection]);
    const hasActivePages = (activeDocument?.pages.length ?? 0) > 0;
    const hasTargetSelection = selectedPages.length > 0;
    const hasEditTarget = hasTargetSelection || hasActivePages;

    useEffect(() => {
        if (!hasEditTarget && interactionMode !== null) {
            setInteractionMode(null);
        }
    }, [hasEditTarget, interactionMode, setInteractionMode]);

    return (
        <div className="studio-segmented" role="tablist" aria-label="Mode">
            <button
                type="button"
                className={`studio-segment-btn ${hasEditTarget && interactionMode === 'edit' ? 'active' : ''}`}
                onClick={() => {
                    if (!hasEditTarget) {
                        return;
                    }
                    let targetDocId: string | null = null;
                    let targetPage: PageItem | null = null;
                    if (hasTargetSelection) {
                        const selected = selectedPages[0];
                        const doc = selected ? documents.find((candidate) => candidate.id === selected.docId) : null;
                        const page = selected ? doc?.pages.find((candidate) => candidate.id === selected.pageId) : null;
                        if (doc && page) {
                            targetDocId = doc.id;
                            targetPage = page;
                        }
                    }
                    if (!targetPage && activeDocument?.pages[0]) {
                        targetDocId = activeDocument.id;
                        targetPage = activeDocument.pages[0];
                        setSelection([{ docId: activeDocument.id, pageId: activeDocument.pages[0].id }]);
                    }
                    if (targetDocId && targetPage) {
                        const sessionPayload = {
                            docId: targetDocId,
                            pageId: targetPage.id,
                            pageIndex: targetPage.pageIndex,
                            fileId: targetPage.fileId,
                            initialTool: null,
                        };

                        const params = new URLSearchParams(window.location.search);
                        const useInplace = params.get('inplace_edit') === '1';

                        if (useInplace) {
                            startEditSession(sessionPayload);
                            useStudioStore.getState().setActiveEditPageId(targetPage.id);
                            setSelection([]);
                        } else {
                            startEditSession(sessionPayload);
                            setInteractionMode('edit');
                            navigate('/studio/edit');
                        }
                    } else {
                        setInteractionMode('edit');
                    }
                }}
                disabled={!hasEditTarget}
                title={!hasEditTarget ? 'Select a document or page first' : 'Edit mode'}
            >
                Edit
            </button>
            <button
                type="button"
                className={`studio-segment-btn ${hasEditTarget && interactionMode === 'convert' ? 'active' : ''}`}
                onClick={() => {
                    if (!hasEditTarget) {
                        return;
                    }
                    setInteractionMode('convert');
                    navigate('/studio/convert');
                }}
                disabled={!hasEditTarget}
                title={!hasEditTarget ? 'Select a document first' : 'Convert mode'}
            >
                Convert
            </button>
        </div>
    );
}
