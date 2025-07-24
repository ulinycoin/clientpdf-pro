// Core layout components
export { default as Header } from './Header';
export { default as Footer } from './Footer';
export { default as ToolsGrid } from './ToolsGrid';
export { default as ToolCard } from './ToolCard';

// PDF Tools - all consistently exported as default
export { default as MergeTool } from './MergeTool';
export { default as CompressionTool } from './CompressionTool';
export { default as SplitTool } from './SplitTool';
export { default as RotateTool } from './RotateTool';
export { default as WatermarkTool } from './WatermarkTool';
export { default as ExtractTextTool } from './ExtractTextTool';
export { default as PdfToImageTool } from './PdfToImageTool';
export { default as ExtractPagesTool } from './ExtractPagesTool';
export { default as ImageToPDFTool } from './ImageToPDFTool';
export { default as OCRTool } from './OCRTool';

// Modular AddTextTool - now correctly points to the modular version
export { default as AddTextTool } from './AddTextTool';

// Shared components
export { ToolContainer } from '../shared';
