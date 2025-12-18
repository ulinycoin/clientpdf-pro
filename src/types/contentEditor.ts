import * as pdfjsLib from 'pdfjs-dist';

export interface TextElement {
    id: string;
    text: string;
    x: number; // Percentage 0-100 (Center X)
    y: number; // Percentage 0-100 (Center Y)
    fontSize: number;
    fontFamily: string;
    color: string;
    opacity: number;
    rotation: number;
    bold: boolean;
    italic: boolean;
    isSelected: boolean;
    pageNumber: number;

    // For Edit mode (covering original text)
    originalRect?: {
        x: number; // Percentage
        y: number; // Percentage
        w: number; // Percentage
        h: number; // Percentage
    };
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    horizontalScaling?: number; // 1.0 = 100%
}

export interface ContentEditorState {
    textElements: TextElement[];
    selectedElementId: string | null;
    currentPage: number;
    totalPages: number;
    scale: number;
    toolMode: 'select' | 'add' | 'edit';
    isProcessing: boolean;
}

export interface UseContentEditorReturn {
    // State
    textElements: TextElement[];
    selectedElementId: string | null;
    currentPage: number;
    totalPages: number;
    scale: number;
    toolMode: 'select' | 'add' | 'edit';
    isProcessing: boolean;

    // History
    canUndo: boolean;
    canRedo: boolean;

    // Actions
    addTextElement: (x: number, y: number, text?: string, initialProps?: Partial<TextElement>) => string;
    updateTextElement: (id: string, updates: Partial<TextElement>) => void;
    deleteTextElement: (id: string) => void;
    selectElement: (id: string | null) => void;
    moveElement: (id: string, x: number, y: number) => void;
    finishMovement: () => void;

    // Navigation
    goToPage: (page: number) => void;
    setTotalPages: (total: number) => void;
    setScale: (scale: number) => void;
    setToolMode: (mode: 'select' | 'add' | 'edit') => void;

    // History
    undo: () => void;
    redo: () => void;

    // Smart Detection
    detectTextAt: (pdfDocument: pdfjsLib.PDFDocumentProxy, pageNumber: number, xPercent: number, yPercent: number) => Promise<{
        text: string;
        x: number;
        y: number;
        width: number;
        height: number;
        fontSize: number;
        fontFamily: string;
        bold: boolean;
        italic: boolean;
    } | null>;

    // File operations
    savePDF: (originalFile: File) => Promise<Blob>;
    reset: () => void;
}
