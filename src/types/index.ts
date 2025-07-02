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

export interface PDFProcessingResult<T = any> {
  success: boolean;
  data?: T;
  error?: ProcessingError;
  progress?: ProcessingProgress;
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

export type ProgressCallback = (progress: number, message?: string) => void;

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
export interface FileUploadProps extends BaseComponentProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
}

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

// Progress bar types
export interface ProgressBarProps extends BaseComponentProps {
  progress: number;
  max?: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Button types
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}