import { useEffect, useState } from 'react';
import { useStudioStore, PageItem, StudioDocument as StudioDoc, StudioState } from './studio-store';
import { LinearIcon } from '../icons/linear-icon';
import { IPipelineRecipe } from '../../studio/pipeline/types';
import { PipelineRunner } from '../../studio/pipeline/PipelineRunner';
import { usePlatform } from '../../../app/react/platform-context';

interface ReorderItem {
    sourceFileId: string;
    pageIndex: number;
    rotation: number;
}

export function StudioActionBar() {
    const { runtime } = usePlatform();
    const [deleteArmedDocId, setDeleteArmedDocId] = useState<string | null>(null);
    const addDocument = useStudioStore((s: StudioState) => s.addDocument);
    const removeDocument = useStudioStore((s: StudioState) => s.removeDocument);
    const setActiveDocument = useStudioStore((s: StudioState) => s.setActiveDocument);
    const setSelection = useStudioStore((s: StudioState) => s.setSelection);
    const requestInlineTool = useStudioStore((s: StudioState) => s.requestInlineTool);
    const updateDocument = useStudioStore((s: StudioState) => s.updateDocument);
    const activeDocumentId = useStudioStore((s: StudioState) => s.activeDocumentId);
    const markWorkspaceExported = useStudioStore((s: StudioState) => s.markWorkspaceExported);
    const documents = useStudioStore((s: StudioState) => s.documents);
    const activeDocument = documents.find((doc) => doc.id === activeDocumentId) ?? null;
    const hasDocuments = documents.length > 0;
    const hasActivePages = (activeDocument?.pages.length ?? 0) > 0;
    const deleteButtonCopy = activeDocument && deleteArmedDocId === activeDocument.id
        ? 'Confirm Delete'
        : 'Delete Space';

    useEffect(() => {
        if (!activeDocument || deleteArmedDocId !== activeDocument.id) {
            setDeleteArmedDocId(null);
        }
    }, [activeDocument, deleteArmedDocId]);

    const exportDocuments = async (docs: StudioDoc[], fileName: string) => {
        if (docs.length === 0) {
            return;
        }
        const sequence: ReorderItem[] = [];
        docs.forEach((doc: StudioDoc) => {
            doc.pages.forEach((page: PageItem) => {
                sequence.push({
                    sourceFileId: page.fileId,
                    pageIndex: page.pageIndex,
                    rotation: page.rotation
                });
            });
        });
        if (sequence.length === 0) {
            return;
        }

        const recipe: IPipelineRecipe = {
            inputs: Array.from(new Set(sequence.map((s) => s.sourceFileId))),
            operations: [
                { type: 'reorder', sequence }
            ],
            outputName: fileName
        };

        try {
            const runner = new PipelineRunner(runtime.vfs);
            const result = await runner.execute(recipe);

            const pdfBuffer = new ArrayBuffer(result.buffer.byteLength);
            new Uint8Array(pdfBuffer).set(result.buffer);
            const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            markWorkspaceExported();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown export error';
            console.error('Export failed:', message);
        }
    };

    const handleExportActive = () => {
        if (!activeDocument || activeDocument.pages.length === 0) {
            return;
        }

        setTimeout(async () => {
            const userInput = window.prompt('Enter file name for export:', activeDocument.name);
            if (userInput === null) return;

            const fileName = userInput.trim() || activeDocument.name;
            const safeName = fileName.replace(/[<>:"/\\|?*]/g, '_').slice(0, 64) || 'Workspace';
            await exportDocuments([activeDocument], `${safeName}.pdf`);
        }, 50);
    };

    const handleCreateSpace = () => {
        const maxY = documents.reduce((acc, doc) => Math.max(acc, doc.y + 120), 80);
        const name = `Workspace ${documents.length + 1}`;
        const nextDocId = crypto.randomUUID();
        addDocument({
            id: nextDocId,
            name: name,
            x: 100,
            y: hasDocuments ? maxY + 40 : 100,
            pages: [],
            allowEmpty: true,
            includeInExport: true,
            isModified: true,
        });
        setActiveDocument(nextDocId);
    };

    const handleRenameActiveSpace = () => {
        if (!activeDocument) return;
        setTimeout(() => {
            const userInput = window.prompt('Enter new name for the workspace:', activeDocument.name);
            if (userInput !== null) {
                const newName = userInput.trim();
                if (newName) {
                    updateDocument(activeDocument.id, { name: newName });
                }
            }
        }, 50);
    };

    const handleDeleteActiveSpace = () => {
        if (!activeDocument) {
            return;
        }
        if (deleteArmedDocId !== activeDocument.id) {
            setDeleteArmedDocId(activeDocument.id);
            return;
        }
        setDeleteArmedDocId(null);
        removeDocument(activeDocument.id);
        setSelection([]);
        requestInlineTool(null);
    };

    return (
        <div className="studio-action-bar animate-slide-up">
            <div className="studio-action-stack">
                <button className="studio-space-btn" onClick={handleCreateSpace}>
                    <LinearIcon name="tool" className="linear-icon" />
                    <span>New Space</span>
                </button>
                <button className="studio-space-btn" onClick={handleRenameActiveSpace} disabled={!activeDocument}>
                    <LinearIcon name="edit" className="linear-icon" />
                    <span>Rename</span>
                </button>
                <button className="studio-space-btn studio-space-btn-danger" onClick={handleDeleteActiveSpace} disabled={!activeDocument}>
                    <LinearIcon name="delete-pages" className="linear-icon" />
                    <span>{deleteButtonCopy}</span>
                </button>
                <button className="export-btn" onClick={handleExportActive} disabled={!hasActivePages}>
                    <LinearIcon name="download" className="linear-icon" />
                    <span>Download Selected Area</span>
                </button>
            </div>
        </div>
    );
}
