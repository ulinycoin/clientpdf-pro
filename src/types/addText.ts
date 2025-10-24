export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  isSelected: boolean;
  pageNumber: number;
}

export interface AddTextToolState {
  textElements: TextElement[];
  selectedElementId: string | null;
  currentPage: number;
  totalPages: number;
  scale: number;
  toolMode: 'select' | 'add';
  isProcessing: boolean;
}

export interface UseAddTextToolReturn {
  // State
  textElements: TextElement[];
  selectedElementId: string | null;
  currentPage: number;
  totalPages: number;
  scale: number;
  toolMode: 'select' | 'add';
  isProcessing: boolean;

  // History
  canUndo: boolean;
  canRedo: boolean;

  // Actions
  addTextElement: (x: number, y: number, text?: string) => void;
  updateTextElement: (id: string, updates: Partial<TextElement>) => void;
  deleteTextElement: (id: string) => void;
  selectElement: (id: string) => void;
  moveElement: (id: string, x: number, y: number) => void;

  // Navigation
  goToPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setScale: (scale: number) => void;
  setToolMode: (mode: 'select' | 'add') => void;

  // History
  undo: () => void;
  redo: () => void;

  // File operations
  savePDF: (originalFile: File) => Promise<Blob>;
  reset: () => void;
}
