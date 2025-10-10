// src/types/editPDF.types.ts

// === PAGE OPERATIONS ===
export interface PageOperation {
  id: string;
  type: 'rotate' | 'delete' | 'duplicate' | 'reorder' | 'extract' | 'insertBlank';
  pageIndex: number;
  targetIndex?: number;      // For reorder
  rotation?: 90 | 180 | 270; // For rotate
  pageFormat?: 'A4' | 'Letter'; // For insertBlank
  timestamp: number;
}

export interface PageState {
  index: number;
  originalIndex: number;
  rotation: number;
  isSelected: boolean;
  isDeleted: boolean;
  thumbnail?: string; // Base64 encoded image
  externalPDF?: { // For pages from merged PDFs
    file: File;
    pageIndex: number;
  };
}

// === ANNOTATIONS ===
export type AnnotationElement =
  | TextElement
  | LineElement
  | ArrowElement
  | RectangleElement
  | CircleElement
  | HighlightElement
  | StampElement
  | FreeDrawElement;

export interface BaseElement {
  id: string;
  pageNumber: number;
  x: number;
  y: number;
  createdAt: number;
  modifiedAt: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  isBold: boolean;
  isItalic: boolean;
  rotation: number;
  opacity: number;
}

export interface LineElement extends BaseElement {
  type: 'line';
  x2: number;
  y2: number;
  color: string;
  strokeWidth: number;
  strokeType: 'solid' | 'dashed' | 'dotted';
}

export interface ArrowElement extends BaseElement {
  type: 'arrow';
  x2: number;
  y2: number;
  color: string;
  strokeWidth: number;
  strokeType: 'solid' | 'dashed' | 'dotted';
  arrowStyle: 'single' | 'double' | 'reverse';
  headType: 'triangle' | 'circle' | 'square';
}

export interface RectangleElement extends BaseElement {
  type: 'rectangle';
  width: number;
  height: number;
  strokeColor: string;
  fillColor?: string;
  strokeWidth: number;
  opacity: number;
}

export interface CircleElement extends BaseElement {
  type: 'circle';
  radius: number;
  strokeColor: string;
  fillColor?: string;
  strokeWidth: number;
  opacity: number;
}

export interface HighlightElement extends BaseElement {
  type: 'highlight';
  width: number;
  height: number;
  color: string;
  opacity: number; // 30-50%
}

export interface StampElement extends BaseElement {
  type: 'stamp';
  stampType: 'APPROVED' | 'CONFIDENTIAL' | 'DRAFT' | 'REVIEWED' | 'REJECTED' | 'CUSTOM';
  text: string;
  color: string;
  fontSize: number;
  rotation: number;
}

export interface FreeDrawElement extends BaseElement {
  type: 'freeDraw';
  points: Array<{ x: number; y: number }>;
  color: string;
  strokeWidth: number;
  smoothing: number;
}

// === DESIGN ===
export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  opacity: number;     // 0-100
  angle: number;       // 0-360
  color: string;
  fontSize: number;
  position: 'center' | 'diagonal' | 'custom';
  customX?: number;
  customY?: number;
  applyToPages: 'all' | 'selected' | number[];
}

export interface PageNumberConfig {
  enabled: boolean;
  format: string;      // "Page {n} of {total}"
  position: 'top-left' | 'top-center' | 'top-right' |
            'middle-left' | 'middle-center' | 'middle-right' |
            'bottom-left' | 'bottom-center' | 'bottom-right';
  fontSize: number;
  fontFamily: string;
  color: string;
  startNumber: number; // Default: 1
  applyToPages: 'all' | 'odd' | 'even' | number[];
}

export interface BackgroundConfig {
  enabled: boolean;
  type: 'color' | 'gradient' | 'image';
  color?: string;
  gradient?: {
    type: 'linear' | 'radial';
    colors: string[];
    angle?: number;
  };
  image?: {
    dataUrl: string;
    fit: 'cover' | 'contain' | 'fill';
  };
  applyToPages: 'all' | 'odd' | 'even' | number[];
}

// === METADATA ===
export interface MetadataConfig {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
}

// === EDIT STATE ===
export interface EditPDFState {
  // File
  originalFile: File | null;
  pdfDoc: any | null; // PDFDocument from pdf-lib

  // Pages
  pages: PageState[];
  operations: PageOperation[];

  // Annotations
  annotations: AnnotationElement[];
  selectedAnnotationId: string | null;

  // Design
  watermark: WatermarkConfig;
  pageNumbers: PageNumberConfig;
  background: BackgroundConfig;

  // Metadata
  metadata: MetadataConfig;

  // UI State
  currentTab: 'pages' | 'annotate' | 'design' | 'tools';
  currentPage: number;
  zoom: number;

  // History
  history: EditPDFState[];
  historyIndex: number;

  // Processing
  isProcessing: boolean;
  processingMessage?: string;
  error?: string;
}

// === AI RECOMMENDATIONS ===
export interface AISuggestion {
  type: string;
  title: string;
  description: string;
  confidence: number;
  impact?: string;
  action: () => void;
  data?: any;
}

export interface EditRecommendations {
  pages: {
    suggestions: AISuggestion[];
    warnings: string[];
  };
  annotate: {
    suggestions: AISuggestion[];
    warnings: string[];
  };
  design: {
    suggestions: AISuggestion[];
    warnings: string[];
  };
  tools: {
    suggestions: AISuggestion[];
    warnings: string[];
  };
  overview: string;
  timestamp: Date;
}
