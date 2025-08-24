// Central export file for all pages
export { default as HomePage } from './HomePage';
export { default as PrivacyPage } from './PrivacyPage';
export { default as FAQPage } from './FAQPage';
export { default as HowToUsePage } from './HowToUsePage';
export { default as NotFoundPage } from './NotFoundPage';

// Tool pages exports (lazy loaded in App.tsx)
export { default as MergePDFPage } from './tools/MergePDFPage';
export { default as SplitPDFPage } from './tools/SplitPDFPage';
export { default as CompressPDFPage } from './tools/CompressPDFPage';
export { default as AddTextPDFPage } from './tools/AddTextPDFPage';
export { default as WatermarkPDFPage } from './tools/WatermarkPDFPage';
export { default as RotatePDFPage } from './tools/RotatePDFPage';
export { default as ExtractPagesPDFPage } from './tools/ExtractPagesPDFPage';
export { default as ExtractTextPDFPage } from './tools/ExtractTextPDFPage';
export { default as PDFToImagePage } from './tools/PDFToImagePage';