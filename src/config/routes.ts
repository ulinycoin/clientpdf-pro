import React from 'react';
import routePaths from './routePaths.json';

// --- Lazy load all page components ---
const HomePage = React.lazy(() => import('../pages/HomePage'));
const PrivacyPage = React.lazy(() => import('../pages/PrivacyPage'));
const FAQPage = React.lazy(() => import('../pages/FAQPage'));
const TermsPage = React.lazy(() => import('../pages/TermsPage'));
const GDPRPage = React.lazy(() => import('../pages/GDPRPage'));
const HowToUsePage = React.lazy(() => import('../pages/HowToUsePage'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));

// Tool Pages
const MergePDFPage = React.lazy(() => import('../pages/tools/MergePDFPage'));
const SplitPDFPage = React.lazy(() => import('../pages/tools/SplitPDFPage'));
const CompressPDFPage = React.lazy(() => import('../pages/tools/CompressPDFPage'));
const AddTextPDFPage = React.lazy(() => import('../pages/tools/AddTextPDFPage'));
const WatermarkPDFPage = React.lazy(() => import('../pages/tools/WatermarkPDFPage'));
const RotatePDFPage = React.lazy(() => import('../pages/tools/RotatePDFPage'));
const ExtractPagesPDFPage = React.lazy(() => import('../pages/tools/ExtractPagesPDFPage'));
const ExtractTextPDFPage = React.lazy(() => import('../pages/tools/ExtractTextPDFPage'));
const ExtractImagesFromPDFPage = React.lazy(() => import('../pages/tools/ExtractImagesFromPDFPage'));
const PDFToImagePage = React.lazy(() => import('../pages/tools/PDFToImagePage'));
const PDFToSvgPage = React.lazy(() => import('../pages/tools/PDFToSvgPage'));
const ImageToPDFPage = React.lazy(() => import('../pages/tools/ImageToPDFPage'));
const WordToPDFPage = React.lazy(() => import('../pages/tools/WordToPDFPage'));
const ExcelToPDFPage = React.lazy(() => import('../pages/tools/ExcelToPDFPage'));
const ProtectPDFPage = React.lazy(() => import('../pages/tools/ProtectPDFPage'));
const OCRPDFPage = React.lazy(() => import('../pages/tools/OCRPDFPage'));
const EditPDFPage = React.lazy(() => import('../pages/tools/EditPDFPage'));

// Authority Pages
const PDFHubPage = React.lazy(() => import('../pages/authority/PDFHubPage'));
const GuidesPage = React.lazy(() => import('../pages/authority/GuidesPage'));
const SecurityPage = React.lazy(() => import('../pages/authority/SecurityPage'));
const WorkflowsPage = React.lazy(() => import('../pages/authority/WorkflowsPage'));
const ComparisonPage = React.lazy(() => import('../pages/authority/ComparisonPage'));

// Documentation Pages
const DocsPage = React.lazy(() => import('../pages/DocsPage'));

// Blog Pages
const BlogPage = React.lazy(() => import('../pages/BlogPage'));
const BlogPostPage = React.lazy(() => import('../pages/BlogPostPage'));
const BlogCategoryPage = React.lazy(() => import('../pages/BlogCategoryPage'));

// --- Map components to paths ---
const componentMap: { [key: string]: React.ComponentType } = {
  '/': HomePage,
  '/privacy': PrivacyPage,
  '/faq': FAQPage,
  '/terms': TermsPage,
  '/gdpr': GDPRPage,
  '/how-to-use': HowToUsePage,
  '/merge-pdf': MergePDFPage,
  '/split-pdf': SplitPDFPage,
  '/compress-pdf': CompressPDFPage,
  '/add-text-pdf': AddTextPDFPage,
  '/watermark-pdf': WatermarkPDFPage,
  '/rotate-pdf': RotatePDFPage,
  '/extract-pages-pdf': ExtractPagesPDFPage,
  '/extract-text-pdf': ExtractTextPDFPage,
  '/extract-images-from-pdf': ExtractImagesFromPDFPage,
  '/pdf-to-image': PDFToImagePage,
  '/pdf-to-svg': PDFToSvgPage,
  '/images-to-pdf': ImageToPDFPage,
  '/image-to-pdf': ImageToPDFPage, // Alias
  '/word-to-pdf': WordToPDFPage,
  '/excel-to-pdf': ExcelToPDFPage,
  '/protect-pdf': ProtectPDFPage,
  '/ocr-pdf': OCRPDFPage,
  '/edit-pdf': EditPDFPage,
  '/pdf-hub': PDFHubPage,
  '/pdf-hub/guides': GuidesPage,
  '/pdf-hub/security': SecurityPage,
  '/pdf-hub/workflows': WorkflowsPage,
  '/pdf-hub/comparison': ComparisonPage,
  '/docs': DocsPage,
  '/docs/:section': DocsPage,
  '/blog': BlogPage,
  '/blog/:slug': BlogPostPage,
  '/blog/category/:category': BlogCategoryPage,
  '*': NotFoundPage,
};

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  isTool?: boolean;
  hasDynamicPath?: boolean;
}

// Combine the paths from JSON with the components
export const routes: RouteConfig[] = routePaths.map(routeInfo => ({
  ...routeInfo,
  component: componentMap[routeInfo.path],
}));

export const supportedLanguages = ['en', 'de', 'fr', 'es', 'ru'];
export const defaultLanguage = 'en';
