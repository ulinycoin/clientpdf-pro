// Icon component types
export interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

// Export all other type modules
export * from './addText.types';
export * from './image.types';
export * from './pageExtraction.types';
export * from './ocr.types';
export * from './smartMerge.types';

// Common PDF processing types
export interface PDFFile {
  file: File;
  id: string;
  name: string;
  size: number;
}

export interface ProcessingProgress {
  current: number;
  total: number;
  message?: string;
}

export interface ProcessingError {
  code: string;
  message: string;
  details?: string;
}

// Main PDF processing result interface - single definition
export interface PDFProcessingResult<T = Blob> {
  success: boolean;
  data?: T;
  error?: ProcessingError;
  progress?: ProcessingProgress;
  metadata?: {
    pageCount?: number;
    originalSize?: number;
    processedSize?: number;
    processingTime?: number;
    [key: string]: unknown;
  };
}

// Legacy alias for compatibility
export type ProcessingResult<T = Blob> = PDFProcessingResult<T>;

// Hook result types for backwards compatibility
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

// ToolCard legacy compatibility
export interface ToolCardProps {
  title: string;
  description: string;
  icon: string;
  operationType?: string;
  disabled?: boolean;
  comingSoon?: boolean;
  onClick?: (operationType?: string) => void;
  className?: string;
}

// PDF Service types
export interface PDFFileInfo {
  pages: number;
  originalSize: number;
  dimensions: { width: number; height: number };
}

export interface MergeOptions {
  order?: number[];
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
  };
}

export interface CompressionOptions {
  quality?: number;
  imageQuality?: number;
}

// Legacy alias
export type CompressionSettings = CompressionOptions;

export type ProgressCallback = (progress: number, message?: string) => void;

// PDF Error type
export interface PDFError {
  code: string;
  message: string;
  details?: string;
}

// Tool types
export type ToolType =
  | 'merge'
  | 'split'
  | 'compress'
  | 'add-text'
  | 'watermark'
  | 'rotate'
  | 'extract-pages'
  | 'extract-text'
  | 'pdf-to-image';

// Common component types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// File upload types
export interface FileUploadZoneProps extends BaseComponentProps {
  onFilesSelected?: (files: File[]) => void;
  onFileUpload?: (files: File[]) => void; // Legacy alias
  accept?: string;
  acceptedTypes?: string[]; // New prop for multiple types
  multiple?: boolean;
  maxFiles?: number; // New prop for max files
  maxSize?: number;
  disabled?: boolean; // Add disabled prop
}

// Legacy alias
export type FileUploadProps = FileUploadZoneProps;

// FileList types
export interface FileItem {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  error?: string;
}

export interface FileListProps extends BaseComponentProps {
  files: FileItem[];
  onRemoveFile: (id: string) => void;
  onRetryFile: (id: string) => void;
  showProgress?: boolean;
  allowReorder?: boolean;
}

// Progress bar types - FIXED
export interface ProgressBarProps extends BaseComponentProps {
  progress?: number;
  value?: number; // Allow both progress and value props
  max?: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean; // Add animated prop
  color?: string; // Add color prop
  label?: string; // Add label prop
}

// Button types
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean; // Add missing fullWidth prop
  onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  // Accessibility props
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  title?: string;
  id?: string;
  role?: string;
}

// Tool Props - ALL TOOLS
export interface AddTextToolProps {
  files?: File[];
  file?: File | null; // Support both
  onComplete?: (result: Blob) => void;
  onClose?: () => void;
  className?: string; // Add missing className prop
}

export interface MergeToolProps extends BaseComponentProps {
  files: File[];
  onComplete: (result: PDFProcessingResult) => void;
  onClose: () => void;
}

export interface CompressionToolProps extends BaseComponentProps {
  files?: File[];
  file?: File | null;
  onComplete?: (result: Blob) => void;
  onClose?: () => void;
}

export interface ExtractPagesToolProps extends BaseComponentProps {
  files?: File[];
  file?: File | null;
  onComplete?: (result: PDFProcessingResult<Blob[]>) => void;
  onClose?: () => void;
}

export interface ExtractTextToolProps extends BaseComponentProps {
  files?: File[];
  file?: File | null;
  onComplete?: (result: PDFProcessingResult<string>) => void;
  onClose?: () => void;
}

export interface PdfToImageToolProps extends BaseComponentProps {
  files?: File[];
  file?: File | null;
  onComplete?: (result: PDFProcessingResult<Blob[]>) => void;
  onClose?: () => void;
}

export interface RotateToolProps extends BaseComponentProps {
  files?: File[];
  file?: File | null;
  onComplete?: (result: PDFProcessingResult<Blob>) => void;
  onClose?: () => void;
}

export interface SplitToolProps extends BaseComponentProps {
  files?: File[];
  file?: File | null;
  onComplete?: (result: PDFProcessingResult<Blob[]>) => void;
  onClose?: () => void;
}

export interface WatermarkToolProps extends BaseComponentProps {
  files?: File[];
  file?: File | null;
  onComplete?: (result: PDFProcessingResult<Blob>) => void;
  onClose?: () => void;
}

// Rotation types
export type RotationTypes = 'radians' | 'degrees';
