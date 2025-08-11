import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Analytics } from '@vercel/analytics/react';
import { I18nProvider } from './hooks/useI18n';
import { HomePage, PrivacyPage, FAQPage, HowToUsePage, NotFoundPage } from './pages';

// Lazy load tool pages for better performance
const MergePDFPage = React.lazy(() => import('./pages/tools/MergePDFPage'));
const SplitPDFPage = React.lazy(() => import('./pages/tools/SplitPDFPage-standardized'));
const CompressPDFPage = React.lazy(() => import('./pages/tools/CompressPDFPage'));
const AddTextPDFPage = React.lazy(() => import('./pages/tools/AddTextPDFPage'));
const WatermarkPDFPage = React.lazy(() => import('./pages/tools/WatermarkPDFPage'));
const RotatePDFPage = React.lazy(() => import('./pages/tools/RotatePDFPage'));
const ExtractPagesPDFPage = React.lazy(() => import('./pages/tools/ExtractPagesPDFPage'));
const ExtractTextPDFPage = React.lazy(() => import('./pages/tools/ExtractTextPDFPage'));
const PDFToImagePage = React.lazy(() => import('./pages/tools/PDFToImagePage'));
const ImageToPDFPage = React.lazy(() => import('./pages/tools/ImageToPDFPage'));
const WordToPDFPage = React.lazy(() => import('./pages/tools/WordToPDFPage'));
const ExcelToPDFPage = React.lazy(() => import('./pages/tools/ExcelToPDFPage'));
const OCRPDFPage = React.lazy(() => import('./pages/tools/OCRPDFPage'));

// Loading component
const LoadingSpinner: React.FC = () => {
  // Используем простой текст здесь, так как провайдер еще не инициализирован
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-mesh">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-secondary-600 text-lg">Loading LocalPDF...</p>
      </div>
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <I18nProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <div className="min-h-screen bg-gradient-mesh no-horizontal-scroll">
            {/* Main content with suspense for lazy loading */}
            <React.Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Home page - English (default) */}
                <Route path="/" element={<HomePage />} />

                {/* Multilingual home pages */}
                <Route path="/de" element={<HomePage />} />
                <Route path="/fr" element={<HomePage />} />
                <Route path="/es" element={<HomePage />} />
                <Route path="/ru" element={<HomePage />} />

                {/* PDF Tools - English (default) URLs */}
                <Route path="/merge-pdf" element={<MergePDFPage />} />
                <Route path="/split-pdf" element={<SplitPDFPage />} />
                <Route path="/compress-pdf" element={<CompressPDFPage />} />
                <Route path="/add-text-pdf" element={<AddTextPDFPage />} />
                <Route path="/watermark-pdf" element={<WatermarkPDFPage />} />
                <Route path="/rotate-pdf" element={<RotatePDFPage />} />
                <Route path="/extract-pages-pdf" element={<ExtractPagesPDFPage />} />
                <Route path="/extract-text-pdf" element={<ExtractTextPDFPage />} />
                <Route path="/pdf-to-image" element={<PDFToImagePage />} />
                <Route path="/images-to-pdf" element={<ImageToPDFPage />} />
                <Route path="/word-to-pdf" element={<WordToPDFPage />} />
                <Route path="/excel-to-pdf" element={<ExcelToPDFPage />} />
                <Route path="/ocr-pdf" element={<OCRPDFPage />} />

                {/* PDF Tools - Multilingual URLs */}
                {/* German (DE) */}
                <Route path="/de/merge-pdf" element={<MergePDFPage />} />
                <Route path="/de/split-pdf" element={<SplitPDFPage />} />
                <Route path="/de/compress-pdf" element={<CompressPDFPage />} />
                <Route path="/de/add-text-pdf" element={<AddTextPDFPage />} />
                <Route path="/de/watermark-pdf" element={<WatermarkPDFPage />} />
                <Route path="/de/rotate-pdf" element={<RotatePDFPage />} />
                <Route path="/de/extract-pages-pdf" element={<ExtractPagesPDFPage />} />
                <Route path="/de/extract-text-pdf" element={<ExtractTextPDFPage />} />
                <Route path="/de/pdf-to-image" element={<PDFToImagePage />} />
                <Route path="/de/images-to-pdf" element={<ImageToPDFPage />} />
                <Route path="/de/word-to-pdf" element={<WordToPDFPage />} />
                <Route path="/de/excel-to-pdf" element={<ExcelToPDFPage />} />
                <Route path="/de/ocr-pdf" element={<OCRPDFPage />} />

                {/* French (FR) */}
                <Route path="/fr/merge-pdf" element={<MergePDFPage />} />
                <Route path="/fr/split-pdf" element={<SplitPDFPage />} />
                <Route path="/fr/compress-pdf" element={<CompressPDFPage />} />
                <Route path="/fr/add-text-pdf" element={<AddTextPDFPage />} />
                <Route path="/fr/watermark-pdf" element={<WatermarkPDFPage />} />
                <Route path="/fr/rotate-pdf" element={<RotatePDFPage />} />
                <Route path="/fr/extract-pages-pdf" element={<ExtractPagesPDFPage />} />
                <Route path="/fr/extract-text-pdf" element={<ExtractTextPDFPage />} />
                <Route path="/fr/pdf-to-image" element={<PDFToImagePage />} />
                <Route path="/fr/images-to-pdf" element={<ImageToPDFPage />} />
                <Route path="/fr/word-to-pdf" element={<WordToPDFPage />} />
                <Route path="/fr/excel-to-pdf" element={<ExcelToPDFPage />} />
                <Route path="/fr/ocr-pdf" element={<OCRPDFPage />} />

                {/* Spanish (ES) */}
                <Route path="/es/merge-pdf" element={<MergePDFPage />} />
                <Route path="/es/split-pdf" element={<SplitPDFPage />} />
                <Route path="/es/compress-pdf" element={<CompressPDFPage />} />
                <Route path="/es/add-text-pdf" element={<AddTextPDFPage />} />
                <Route path="/es/watermark-pdf" element={<WatermarkPDFPage />} />
                <Route path="/es/rotate-pdf" element={<RotatePDFPage />} />
                <Route path="/es/extract-pages-pdf" element={<ExtractPagesPDFPage />} />
                <Route path="/es/extract-text-pdf" element={<ExtractTextPDFPage />} />
                <Route path="/es/pdf-to-image" element={<PDFToImagePage />} />
                <Route path="/es/images-to-pdf" element={<ImageToPDFPage />} />
                <Route path="/es/word-to-pdf" element={<WordToPDFPage />} />
                <Route path="/es/excel-to-pdf" element={<ExcelToPDFPage />} />
                <Route path="/es/ocr-pdf" element={<OCRPDFPage />} />

                {/* Russian (RU) */}
                <Route path="/ru/merge-pdf" element={<MergePDFPage />} />
                <Route path="/ru/split-pdf" element={<SplitPDFPage />} />
                <Route path="/ru/compress-pdf" element={<CompressPDFPage />} />
                <Route path="/ru/add-text-pdf" element={<AddTextPDFPage />} />
                <Route path="/ru/watermark-pdf" element={<WatermarkPDFPage />} />
                <Route path="/ru/rotate-pdf" element={<RotatePDFPage />} />
                <Route path="/ru/extract-pages-pdf" element={<ExtractPagesPDFPage />} />
                <Route path="/ru/extract-text-pdf" element={<ExtractTextPDFPage />} />
                <Route path="/ru/pdf-to-image" element={<PDFToImagePage />} />
                <Route path="/ru/images-to-pdf" element={<ImageToPDFPage />} />
                <Route path="/ru/word-to-pdf" element={<WordToPDFPage />} />
                <Route path="/ru/excel-to-pdf" element={<ExcelToPDFPage />} />
                <Route path="/ru/ocr-pdf" element={<OCRPDFPage />} />

                {/* Information pages - English */}
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/how-to-use" element={<HowToUsePage />} />

                {/* Information pages - Multilingual */}
                <Route path="/de/privacy" element={<PrivacyPage />} />
                <Route path="/de/faq" element={<FAQPage />} />
                <Route path="/fr/privacy" element={<PrivacyPage />} />
                <Route path="/fr/faq" element={<FAQPage />} />
                <Route path="/es/privacy" element={<PrivacyPage />} />
                <Route path="/es/faq" element={<FAQPage />} />
                <Route path="/ru/privacy" element={<PrivacyPage />} />
                <Route path="/ru/faq" element={<FAQPage />} />

                {/* 404 page - professional LocalPDF branded error page */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </React.Suspense>
          </div>

          {/* Vercel Analytics - Privacy-compliant analytics */}
          <Analytics />
        </Router>
      </I18nProvider>
    </HelmetProvider>
  );
}

export default App;
