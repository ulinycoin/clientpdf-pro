// Core PDF Types
export interface PDFFile extends File {
  readonly type: 'application/pdf';
}

export interface PDFProcessingResult<T = Blob> {
  success: boolean;
  data?: T;
  error?: PDFError;
  metadata?: OperationMetadata;
}

export interface PDFError {
  message: string;
  code: string;
  cause?: unknown;
}

export interface OperationMetadata {
  originalSize?: number;
  processedSize?: number;
  processingTime?: number;
  pageCount?: number;
  [key: string]: unknown;
}

// Progress Callback
export type ProgressCallback = (progress: number, message?: string) => void;

// Merge Tool Types
export interface MergeToolProps {
  files: File[];
  onComplete: (result: PDFProcessingResult) => void;
  onClose: () => void;
  className?: string;
}

export interface MergeOptions {
  order?: number[];
  bookmarks?: boolean;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    [key: string]: unknown;
  };
}

// Compression Tool Types
export interface CompressionToolProps {
  files: File[];
  onComplete: (result: PDFProcessingResult) => void;
  onClose: () => void;
  className?: string;
}

export interface CompressionOptions {
  quality: number; // 0.1 to 1.0
  imageCompression?: boolean;
  removeMetadata?: boolean;
  optimizeForWeb?: boolean;
}

// Component Props Types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface ProgressBarProps {
  value: number; // 0 to 100
  variant?: 'default' | 'success' | 'warning' | 'error';
  animated?: boolean;
  showText?: boolean;
  className?: string;
}

export interface ToolCardProps {
  title: string;
  description: string;
  icon: string;
  operationType?: string;
  disabled?: boolean;
  comingSoon?: boolean;
  onClick: (operationType?: string) => void;
  className?: string;
}

export interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  disabled?: boolean;
  className?: string;
}

// Hook Types
export interface UseFileUploadResult {
  files: File[];
  isDragging: boolean;
  addFiles: (newFiles: File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  handleDragOver: (event: React.DragEvent) => void;
  handleDragLeave: (event: React.DragEvent) => void;
  handleDrop: (event: React.DragEvent) => void;
}

export interface UseCompressionResult {
  compress: (file: File, options: CompressionOptions) => Promise<PDFProcessingResult>;
  isCompressing: boolean;
  progress: number;
  error: string | null;
}