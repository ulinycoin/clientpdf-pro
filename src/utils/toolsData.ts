// Central source of truth for PDF tools data
// This file provides tool definitions that can be imported by any component

export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  operationType: string;
  featured?: boolean;
  primary?: boolean;
  category: 'core' | 'advanced' | 'conversion' | 'enhancement';
}

// Base tool definitions (without translations) - IDs match existing translation keys
export const TOOL_DEFINITIONS = [
  // Core PDF Operations
  {
    id: 'merge',
    icon: 'MERGE',
    operationType: 'merge',
    featured: true,
    category: 'core' as const
  },
  {
    id: 'split',
    icon: 'SPLIT',
    operationType: 'split',
    primary: true,
    category: 'core' as const
  },
  {
    id: 'compress',
    icon: 'COMPRESS',
    operationType: 'compress',
    category: 'core' as const
  },
  {
    id: 'rotate',
    icon: 'ROTATE',
    operationType: 'rotate',
    category: 'core' as const
  },
  
  // Advanced PDF Operations
  {
    id: 'watermark',
    icon: 'WATERMARK',
    operationType: 'watermark',
    category: 'enhancement' as const
  },
  {
    id: 'extractText',
    icon: 'EXTRACT_TEXT',
    operationType: 'extract-text',
    category: 'advanced' as const
  },
  {
    id: 'extractPages',
    icon: 'EXTRACT_PAGES',
    operationType: 'extract-pages',
    category: 'advanced' as const
  },
  {
    id: 'addText',
    icon: 'ADD_TEXT',
    operationType: 'add-text',
    featured: true,
    category: 'enhancement' as const
  },
  
  // Conversion Tools
  {
    id: 'pdfToImage',
    icon: 'PDF_TO_IMAGE',
    operationType: 'pdf-to-image',
    category: 'conversion' as const
  },
  {
    id: 'pdfToSvg',
    icon: 'PDF_TO_SVG',
    operationType: 'pdf-to-svg',
    category: 'conversion' as const
  },
  {
    id: 'imageToPdf',
    icon: 'IMAGE_TO_PDF',
    operationType: 'images-to-pdf',
    primary: true,
    category: 'conversion' as const
  },
  {
    id: 'excelToPdf',
    icon: 'EXCEL_TO_PDF',
    operationType: 'excel-to-pdf',
    category: 'conversion' as const
  },
  {
    id: 'wordToPdf',
    icon: 'WORD_TO_PDF',
    operationType: 'word-to-pdf',
    category: 'conversion' as const
  }
  
  // Special Tools temporarily disabled
  // OCR tool disabled until Tesseract.js issues are resolved
  // {
  //   id: 'ocr',
  //   icon: 'OCR', 
  //   operationType: 'ocr-pdf',
  //   featured: true,
  //   category: 'advanced' as const
  // }
];

// Get total count of available tools
export const getToolsCount = (): number => {
  return TOOL_DEFINITIONS.length;
};

// Get tools by category
export const getToolsByCategory = (category: Tool['category']) => {
  return TOOL_DEFINITIONS.filter(tool => tool.category === category);
};

// Check if tool exists
export const isValidTool = (toolId: string): boolean => {
  return TOOL_DEFINITIONS.some(tool => tool.id === toolId);
};