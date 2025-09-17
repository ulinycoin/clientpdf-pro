// TypeScript types for AddTextTool
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

export interface CanvasState {
  scale: number;
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
  dragStartX: number;
  dragStartY: number;
}

export interface AddTextToolProps {
  files: File[];
  onComplete: (result: Blob) => void;
  onClose: () => void;
  className?: string;
}

export interface PdfViewerState {
  document: any;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
}