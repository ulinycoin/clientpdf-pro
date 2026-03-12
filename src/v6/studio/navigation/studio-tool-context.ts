export interface StudioSelectedPageRef {
  docId: string;
  pageId: string;
  fileId: string;
  pageIndex: number;
}

export interface StudioToolLaunchContext {
  mode: 'document' | 'page-selection';
  documentId: string | null;
  selectedPages: StudioSelectedPageRef[];
}

export interface StudioReturnContext {
  activeDocumentId: string | null;
  selection: Array<{ docId: string; pageId: string }>;
  interactionMode: 'edit' | 'convert' | null;
  viewScale: number;
  viewPosition: { x: number; y: number };
}

export interface StudioToolResultState {
  toolId: string;
  outputIds: string[];
  studioContext?: StudioToolLaunchContext;
}

export interface StudioToolRouteState {
  preloadedFileIds?: string[];
  source?: 'studio';
  studioContext?: StudioToolLaunchContext;
  studioToolResult?: StudioToolResultState;
  studioReturnContext?: StudioReturnContext;
}
