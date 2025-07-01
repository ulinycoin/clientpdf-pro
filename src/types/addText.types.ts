// Add Text Tool Types
export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: { r: number; g: number; b: number };
  fontFamily: 'Helvetica' | 'Times-Roman' | 'Courier';
  pageNumber: number;
  opacity: number;
  rotation: number;
  isBold: boolean;
  isItalic: boolean;
  textAlign: 'left' | 'center' | 'right';
  maxWidth?: number;
  createdAt: number;
}

export interface AddTextOptions {
  elements: TextElement[];
  defaultFontSize: number;
  defaultColor: { r: number; g: number; b: number };
  defaultFont: 'Helvetica' | 'Times-Roman' | 'Courier';
  defaultOpacity: number;
}

export interface AddTextResult {
  success: boolean;
  data?: Blob;
  error?: string;
  metadata?: {
    originalSize: number;
    finalSize: number;
    pageCount: number;
    textElementsAdded: number;
    processingTime: number;
  };
}

export interface PageDimensions {
  width: number;
  height: number;
  scale: number;
}

export interface TextEditingState {
  isEditing: boolean;
  elementId: string | null;
  tempText: string;
  position: { x: number; y: number };
}

export interface UndoRedoState {
  history: TextElement[][];
  currentIndex: number;
  maxHistorySize: number;
}

export interface AddTextToolProps {
  files: File[];
  onComplete: (result: AddTextResult) => void;
  onClose: () => void;
  className?: string;
}

// Canvas interaction types
export interface CanvasInteraction {
  isDragging: boolean;
  dragElementId: string | null;
  dragStartPos: { x: number; y: number };
  dragOffset: { x: number; y: number };
}

// Font options
export interface FontOption {
  value: 'Helvetica' | 'Times-Roman' | 'Courier';
  label: string;
  preview: string;
}

// Text formatting presets
export interface TextPreset {
  name: string;
  fontSize: number;
  color: { r: number; g: number; b: number };
  fontFamily: 'Helvetica' | 'Times-Roman' | 'Courier';
  isBold: boolean;
  isItalic: boolean;
}

// Validation
export interface TextElementValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
