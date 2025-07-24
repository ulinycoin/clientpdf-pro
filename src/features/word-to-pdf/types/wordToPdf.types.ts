// Basic types for Word to PDF conversion

export interface DocumentContent {
  paragraphs: Paragraph[];
  metadata: DocumentMetadata;
}

export interface Paragraph {
  text: string;
  formatting: TextFormatting;
  language?: string;
  alignment: 'left' | 'center' | 'right' | 'justify';
}

export interface TextFormatting {
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
}

export interface DocumentMetadata {
  title?: string;
  author?: string;
  language?: string;
  pageCount?: number;
  isCyrillic?: boolean;
  detectedLanguages?: string[];
}

export interface ConversionSettings {
  pageSize: 'A4' | 'Letter' | 'A3';
  embedFonts: boolean;
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  fontSize?: number;
  compression?: boolean;
}

export interface ConversionResult {
  success: boolean;
  pdfBytes?: Uint8Array;
  error?: string;
  metadata?: DocumentMetadata;
}
