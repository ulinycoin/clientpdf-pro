import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useStudioStore, type PageItem, type StudioDocument, type StudioState } from '../../v6/components/Studio/studio-store';
import { LinearIcon } from '../../v6/components/icons/linear-icon';
import { usePlatform } from './platform-context';
import { PipelineRunner } from '../../v6/studio/pipeline/PipelineRunner';
import type { IPipelineRecipe } from '../../v6/studio/pipeline/types';

const DEFAULT_MARKETING_SITE_URL = 'http://127.0.0.1:4321';

interface StudioTopNavProps {
  telemetryEnabled: boolean;
  onToggleTelemetry: () => void;
  telemetryOpen: boolean;
}

function canExportAsSourceFile(pages: PageItem[]): { fileId: string } | null {
  if (pages.length === 0) {
    return null;
  }
  const sourceFileId = pages[0].fileId;
  for (let index = 0; index < pages.length; index += 1) {
    const page = pages[index];
    if (page.fileId !== sourceFileId) {
      return null;
    }
    if ((page.rotation % 360) !== 0) {
      return null;
    }
    if (page.pageIndex !== index) {
      return null;
    }
  }
  return { fileId: sourceFileId };
}

export function StudioTopNav({ telemetryEnabled, onToggleTelemetry, telemetryOpen }: StudioTopNavProps) {
  const location = useLocation();
  const { runtime } = usePlatform();
  const [deleteArmedDocId, setDeleteArmedDocId] = useState<string | null>(null);
  const documents = useStudioStore((s: StudioState) => s.documents);
  const workspaceVersion = useStudioStore((s: StudioState) => s.workspaceVersion);
  const lastExportedVersion = useStudioStore((s: StudioState) => s.lastExportedVersion);
  const activeDocumentId = useStudioStore((s: StudioState) => s.activeDocumentId);
  const addDocument = useStudioStore((s: StudioState) => s.addDocument);
  const removeDocument = useStudioStore((s: StudioState) => s.removeDocument);
  const setActiveDocument = useStudioStore((s: StudioState) => s.setActiveDocument);
  const setSelection = useStudioStore((s: StudioState) => s.setSelection);
  const requestInlineTool = useStudioStore((s: StudioState) => s.requestInlineTool);
  const markWorkspaceExported = useStudioStore((s: StudioState) => s.markWorkspaceExported);

  const activeDocument = useMemo(
    () => documents.find((doc: StudioDocument) => doc.id === activeDocumentId) ?? null,
    [activeDocumentId, documents],
  );
  const hasActivePages = (activeDocument?.pages.length ?? 0) > 0;
  const hasWorkspaceChanges = documents.some((doc: StudioDocument) => Boolean(doc.isModified))
    || workspaceVersion !== lastExportedVersion;
  const marketingSiteUrl = import.meta.env.DEV
    ? (import.meta.env.VITE_MARKETING_SITE_URL?.trim() || DEFAULT_MARKETING_SITE_URL)
    : '/';
  const deleteButtonCopy = activeDocument && deleteArmedDocId === activeDocument.id
    ? 'Confirm Delete'
    : 'Delete Space';

  useEffect(() => {
    if (!activeDocument || deleteArmedDocId !== activeDocument.id) {
      setDeleteArmedDocId(null);
    }
  }, [activeDocument, deleteArmedDocId]);

  const exportDocument = async (doc: StudioDocument, fileName: string): Promise<void> => {
    const directSource = canExportAsSourceFile(doc.pages);
    if (directSource) {
      const entry = await runtime.vfs.read(directSource.fileId);
      const blob = await entry.getBlob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      markWorkspaceExported();
      return;
    }

    const sequence = doc.pages.map((page: PageItem) => ({
      sourceFileId: page.fileId,
      pageIndex: page.pageIndex,
      rotation: page.rotation,
    }));
    if (sequence.length === 0) {
      return;
    }

    const recipe: IPipelineRecipe = {
      inputs: Array.from(new Set(sequence.map((item) => item.sourceFileId))),
      operations: [{ type: 'reorder', sequence }],
      outputName: fileName,
    };

    const runner = new PipelineRunner(runtime.vfs);
    const result = await runner.execute(recipe);
    const pdfBuffer = new ArrayBuffer(result.buffer.byteLength);
    new Uint8Array(pdfBuffer).set(result.buffer);
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    markWorkspaceExported();
  };

  const handleCreateSpace = (): void => {
    const maxY = documents.reduce((acc, doc) => Math.max(acc, doc.y + 120), 80);
    const name = `Workspace ${documents.length + 1}`;
    const nextDocId = crypto.randomUUID();
    addDocument({
      id: nextDocId,
      name: name,
      x: 100,
      y: documents.length > 0 ? maxY + 40 : 100,
      pages: [],
      allowEmpty: true,
      includeInExport: true,
      isModified: true,
    });
    setActiveDocument(nextDocId);
  };

  const handleDeleteSpace = (): void => {
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

  const handleDownload = () => {
    if (!activeDocument || activeDocument.pages.length === 0) {
      return;
    }

    setTimeout(async () => {
      const userInput = window.prompt('Enter file name for export:', activeDocument.name);
      if (userInput === null) return;

      const fileName = userInput.trim() || activeDocument.name;
      const safeName = fileName.replace(/[<>:"/\\|?*]/g, '_').slice(0, 64) || 'Workspace';

      try {
        await exportDocument(activeDocument, `${safeName}.pdf`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Export failed';
        console.error(message);
      }
    }, 50);
  };

  const handleBackToSite = (): void => {
    const leavingEditWorkspace = location.pathname === '/studio/edit';
    const shouldConfirm = hasWorkspaceChanges || leavingEditWorkspace;
    if (shouldConfirm && !window.confirm('Leave LocalPDF and return to the website? Unsaved changes may be lost.')) {
      return;
    }
    window.location.assign(marketingSiteUrl);
  };

  return (
    <header className="studio-top-nav" aria-label="Studio top navigation">
      <div className="studio-top-nav-left">
        <a href={marketingSiteUrl} className="studio-logo">
          <div className="studio-logo-text">
            <div className="studio-logo-title">LocalPDF</div>
            <div className="studio-logo-subtitle">Studio</div>
          </div>
        </a>
      </div>

      <div className="studio-top-nav-center" aria-live="polite" />

      <div className="studio-top-nav-right">
        <button
          type="button"
          className="studio-tab-btn"
          onClick={handleBackToSite}
          title="Website"
        >
          <span>Website</span>
        </button>
        <button
          type="button"
          className="studio-tab-btn"
          onClick={handleCreateSpace}
          title="Create workspace"
        >
          <span>New Space</span>
        </button>
        <button
          type="button"
          className="studio-tab-btn"
          onClick={handleDeleteSpace}
          disabled={!activeDocument}
          title={!activeDocument ? 'No active workspace' : deleteButtonCopy}
        >
          <span>{deleteButtonCopy}</span>
        </button>
        <button
          type="button"
          className="studio-tab-btn"
          onClick={() => { void handleDownload(); }}
          disabled={!hasActivePages}
          title={!hasActivePages ? 'No pages in active workspace' : 'Download active workspace'}
        >
          <LinearIcon name="download" className="linear-icon" />
          <span>Download</span>
        </button>
        {telemetryEnabled && (
          <button
            type="button"
            className="studio-tab-btn"
            onClick={onToggleTelemetry}
            aria-expanded={telemetryOpen}
          >
            <LinearIcon name={telemetryOpen ? 'chevron-up' : 'chevron-down'} className="linear-icon" />
            <span>Telemetry</span>
          </button>
        )}
      </div>
    </header >
  );
}
