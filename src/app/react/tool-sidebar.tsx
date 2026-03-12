import { NavLink, useLocation } from 'react-router-dom';
import { LinearIcon } from '../../v6/components/icons/linear-icon';
import { usePlatform } from './platform-context';
import { useStudioStore, type StudioState, type StudioDocument, type PageItem } from '../../v6/components/Studio/studio-store';
import type { StudioSelectedPageRef, StudioToolLaunchContext, StudioToolRouteState } from '../../v6/studio/navigation/studio-tool-context';

const SIDEBAR_TOOL_ORDER: Record<string, number> = {
  'ocr-pdf': 0,
  'word-to-pdf': 1,
  'excel-to-pdf': 2,
  'pdf-to-jpg': 3,
};

function getToolIcon(toolId: string): Parameters<typeof LinearIcon>[0]['name'] {
  switch (toolId) {
    case 'merge-pdf':
      return 'merge';
    case 'split-pdf':
      return 'split';
    case 'compress-pdf':
      return 'compress';
    case 'unlock-pdf':
      return 'unlock';
    case 'delete-pages-pdf':
      return 'delete-pages';
    case 'ocr-pdf':
      return 'ocr';
    case 'pdf-to-jpg':
      return 'image';
    case 'word-to-pdf':
      return 'word';
    case 'encrypt-pdf':
      return 'lock';
    case 'rotate-pdf':
      return 'rotate';
    case 'excel-to-pdf':
      return 'excel';
    case 'pdf-editor':
      return 'pen-tool';
    default:
      return 'tool';
  }
}

function getToolShortLabel(toolId: string): string {
  switch (toolId) {
    case 'merge-pdf':
      return 'MRG';
    case 'split-pdf':
      return 'SPL';
    case 'compress-pdf':
      return 'CMP';
    case 'unlock-pdf':
      return 'UNL';
    case 'delete-pages-pdf':
      return 'DEL';
    case 'ocr-pdf':
      return 'OCR';
    case 'pdf-to-jpg':
      return 'JPG';
    case 'word-to-pdf':
      return 'DOC';
    case 'encrypt-pdf':
      return 'ENC';
    case 'rotate-pdf':
      return 'ROT';
    case 'excel-to-pdf':
      return 'XLS';
    case 'pdf-editor':
      return 'EDT';
    default:
      return 'TOOL';
  }
}

interface ToolSidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function ToolSidebar({ collapsed, onToggleCollapsed }: ToolSidebarProps) {
  const { menu } = usePlatform();
  const location = useLocation();
  const requestInlineTool = useStudioStore((s: StudioState) => s.requestInlineTool);
  const documents = useStudioStore((s: StudioState) => s.documents);
  const selection = useStudioStore((s: StudioState) => s.selection);
  const activeDocumentId = useStudioStore((s: StudioState) => s.activeDocumentId);
  const interactionMode = useStudioStore((s: StudioState) => s.interactionMode);
  const studioViewScale = useStudioStore((s: StudioState) => s.studioViewScale);
  const studioViewPosition = useStudioStore((s: StudioState) => s.studioViewPosition);

  const activeDocument = documents.find((doc: StudioDocument) => doc.id === activeDocumentId) ?? documents[0] ?? null;
  const selectedPages: StudioSelectedPageRef[] = selection
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
      } satisfies StudioSelectedPageRef;
    })
    .filter((value): value is StudioSelectedPageRef => value !== null);

  const selectedInputIds = selectedPages.length > 0
    ? Array.from(new Set(selectedPages.map((page) => page.fileId)))
    : Array.from(new Set((activeDocument?.pages ?? []).map((page: PageItem) => page.fileId)));
  const activeDocumentInputIds = Array.from(new Set((activeDocument?.pages ?? []).map((page: PageItem) => page.fileId)));
  const buildToolNavState = (toolId: string): StudioToolRouteState | undefined => {
    if (location.pathname !== '/studio') {
      return undefined;
    }

    const useDocumentScope = toolId === 'compress-pdf';
    const preloadedFileIds = useDocumentScope ? activeDocumentInputIds : selectedInputIds;
    if (preloadedFileIds.length === 0) {
      return undefined;
    }

    const studioContext: StudioToolLaunchContext = useDocumentScope
      ? {
        mode: 'document',
        documentId: activeDocument?.id ?? null,
        selectedPages: [],
      }
      : {
        mode: selectedPages.length > 0 ? 'page-selection' : 'document',
        documentId: selectedPages.length > 0 ? (selectedPages[0]?.docId ?? null) : (activeDocument?.id ?? null),
        selectedPages,
      };

    return {
      preloadedFileIds,
      source: 'studio',
      studioContext,
      studioReturnContext: {
        activeDocumentId,
        selection,
        interactionMode,
        viewScale: studioViewScale,
        viewPosition: studioViewPosition,
      },
    };
  };
  const orderedMenu = [...menu].sort((a, b) => {
    const aHasOrder = Object.prototype.hasOwnProperty.call(SIDEBAR_TOOL_ORDER, a.toolId);
    const bHasOrder = Object.prototype.hasOwnProperty.call(SIDEBAR_TOOL_ORDER, b.toolId);
    if (aHasOrder && bHasOrder) {
      return SIDEBAR_TOOL_ORDER[a.toolId] - SIDEBAR_TOOL_ORDER[b.toolId];
    }
    if (aHasOrder) {
      return -1;
    }
    if (bHasOrder) {
      return 1;
    }
    return 0;
  });

  return (
    <>
      <div className="brand-header">
        <div className="brand-main">
          <div className="brand-name">{collapsed ? 'LP' : 'LocalPDF'}</div>
          <div className="brand-tagline">Worker-native toolkit</div>
        </div>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <LinearIcon name={collapsed ? 'chevron-right' : 'chevron-left'} className="linear-icon" />
        </button>
      </div>
      <nav className="nav-list" aria-label="Tools">
        <div className="nav-item">
          <NavLink
            to="/studio"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            title="Studio"
            aria-label="Studio"
          >
            <span className="nav-icon" aria-hidden="true">
              <LinearIcon name="tool" className="linear-icon" />
            </span>
            <span className="nav-label">Studio</span>
            <span className="nav-label-short" aria-hidden="true">
              HUB
            </span>
          </NavLink>
        </div>
        {orderedMenu.map((item) => (
          <div key={item.toolId} className="nav-item">
            <NavLink
              to={item.href}
              state={buildToolNavState(item.toolId)}
              onClick={(event) => {
                if (location.pathname === '/studio' && item.toolId === 'compress-pdf') {
                  event.preventDefault();
                  requestInlineTool('compress-pdf');
                }
              }}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              title={item.label}
              aria-label={item.label}
            >
              <span className="nav-icon" aria-hidden="true">
                <LinearIcon name={getToolIcon(item.toolId)} className="linear-icon" />
              </span>
              <span className="nav-label">{item.label}</span>
              <span className="nav-label-short" aria-hidden="true">
                {getToolShortLabel(item.toolId)}
              </span>
            </NavLink>
          </div>
        ))}
      </nav>
    </>
  );
}
