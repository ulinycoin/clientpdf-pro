// Page Extraction Types
export interface PageExtractionOptions {
  selectedPages: number[];
  outputFileName?: string;
}

export interface PageExtractionResult {
  success: boolean;
  blob?: Blob;
  extractedPageCount?: number;
  originalPageCount?: number;
  error?: string;
  processingTime?: number;
}

export interface PageInfo {
  pageNumber: number;
  selected: boolean;
  width?: number;
  height?: number;
}

export interface PageRange {
  start: number;
  end: number;
}

export interface ExtractPagesState {
  file: File | null;
  pages: PageInfo[];
  totalPages: number;
  selectedPages: number[];
  isProcessing: boolean;
  result: PageExtractionResult | null;
  error: string | null;
  progress: number;
}

export interface PageSelectionMode {
  type: 'individual' | 'range' | 'all' | 'custom';
  label: string;
  description: string;
}

// Props interface for ExtractPagesTool component
export interface ExtractPagesToolProps {
  files: File[];
  onComplete: (result: PageExtractionResult) => void;
  onClose: () => void;
  className?: string;
}

export const PAGE_SELECTION_MODES: PageSelectionMode[] = [
  {
    type: 'individual',
    label: 'Individual Pages',
    description: 'Select specific pages manually'
  },
  {
    type: 'range',
    label: 'Page Range',
    description: 'Select a continuous range of pages'
  },
  {
    type: 'all',
    label: 'All Pages',
    description: 'Extract all pages (copy entire document)'
  },
  {
    type: 'custom',
    label: 'Custom Selection',
    description: 'Advanced page selection with multiple ranges'
  }
];

// Error types specific to page extraction
export class PageExtractionError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_PAGES' | 'NO_PAGES_SELECTED' | 'EXTRACTION_FAILED' | 'INVALID_RANGE',
    public originalError?: Error
  ) {
    super(message);
    this.name = 'PageExtractionError';
  }
}
