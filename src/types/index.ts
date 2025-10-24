// Core types for LocalPDF SPA

// Language types
export type Language = 'en' | 'ru' | 'de' | 'fr' | 'es';

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'ru', 'de', 'fr', 'es'];

// Theme types
export type Theme = 'light' | 'dark';

// Tool types - PDF tools (edit-pdf removed - discontinued)
export type Tool =
  | 'merge-pdf'
  | 'split-pdf'
  | 'compress-pdf'
  | 'protect-pdf'
  | 'ocr-pdf'
  | 'add-text-pdf'
  | 'watermark-pdf'
  | 'rotate-pdf'
  | 'delete-pages-pdf'
  | 'extract-pages-pdf'
  | 'unlock-pdf'
  | 'images-to-pdf'
  | 'pdf-to-images'
  | 'pdf-to-word'
  | 'word-to-pdf'
  | 'sign-pdf'
  | 'flatten-pdf';

// Tool category for grouping
export type ToolCategory = 'core' | 'edit' | 'convert' | 'security';

// Tool tier for performance optimization
export type ToolTier = 1 | 2 | 3;

// Tool configuration
export interface ToolConfig {
  id: Tool;
  name: string;
  category: ToolCategory;
  tier: ToolTier;
  icon: string; // Icon name or component reference
}

// URL context from landing page redirect
export interface URLContext {
  source: 'landing' | 'auto_redirect' | 'direct' | 'sidebar';
  referrer: string | null;
  language: Language;
  utmParams: string | null;
  isFirstVisit: boolean;
}

// File metadata for state management
export interface FileMetadata {
  file: File;
  id: string;
  uploadedAt: number;
}

// User preferences
export interface UserPreferences {
  language: Language;
  theme: Theme;
  sidebarCollapsed: boolean;
  lastTool: Tool | null;
  toolsUsed: Tool[];
}

// Analytics event types
export interface AnalyticsEvent {
  name: string;
  data: Record<string, any>;
  timestamp: number;
}

// Tool hash mapping for URL routing
export const TOOL_HASH_MAP: Record<string, Tool> = {
  'merge': 'merge-pdf',
  'split': 'split-pdf',
  'compress': 'compress-pdf',
  'protect': 'protect-pdf',
  'ocr': 'ocr-pdf',
  'add-text': 'add-text-pdf',
  'watermark': 'watermark-pdf',
  'rotate': 'rotate-pdf',
  'delete-pages': 'delete-pages-pdf',
  'extract-pages': 'extract-pages-pdf',
  'unlock': 'unlock-pdf',
  'images-to-pdf': 'images-to-pdf',
  'pdf-to-images': 'pdf-to-images',
  'pdf-to-word': 'pdf-to-word',
  'word-to-pdf': 'word-to-pdf',
  'sign': 'sign-pdf',
  'flatten': 'flatten-pdf',
};

// Reverse mapping for generating hashes from tools
export const HASH_TOOL_MAP: Record<Tool, string> = Object.fromEntries(
  Object.entries(TOOL_HASH_MAP).map(([hash, tool]) => [tool, hash])
) as Record<Tool, string>;

// Popular tools for preloading
export const POPULAR_TOOLS: Tool[] = [
  'merge-pdf',
  'split-pdf',
  'compress-pdf',
];

// Tool tier classification
export const TOOL_TIERS: Record<Tool, ToolTier> = {
  'merge-pdf': 1,
  'split-pdf': 1,
  'compress-pdf': 1,
  'protect-pdf': 1,
  'ocr-pdf': 1,
  'add-text-pdf': 2,
  'watermark-pdf': 2,
  'rotate-pdf': 2,
  'delete-pages-pdf': 2,
  'extract-pages-pdf': 2,
  'unlock-pdf': 2,
  'images-to-pdf': 3,
  'pdf-to-images': 3,
  'pdf-to-word': 3,
  'word-to-pdf': 3,
  'sign-pdf': 3,
  'flatten-pdf': 3,
};
