import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Analytics } from '@vercel/analytics/react';
import { I18nProvider } from './hooks/useI18n';
import { HomePage, PrivacyPage, FAQPage, HowToUsePage, NotFoundPage } from './pages';
import Breadcrumbs from './components/common/Breadcrumbs';

// Lazy load tool pages for better performance
const MergePDFPage = React.lazy(() => import('./pages/tools/MergePDFPage'));
const SplitPDFPage = React.lazy(() => import('./pages/tools/SplitPDFPage'));
const CompressPDFPage = React.lazy(() => import('./pages/tools/CompressPDFPage'));
const AddTextPDFPage = React.lazy(() => import('./pages/tools/AddTextPDFPage'));
const WatermarkPDFPage = React.lazy(() => import('./pages/tools/WatermarkPDFPage'));
const RotatePDFPage = React.lazy(() => import('./pages/tools/RotatePDFPage'));
const ExtractPagesPDFPage = React.lazy(() => import('./pages/tools/ExtractPagesPDFPage'));
const ExtractTextPDFPage = React.lazy(() => import('./pages/tools/ExtractTextPDFPage'));
const PDFToImagePage = React.lazy(() => import('./pages/tools/PDFToImagePage'));
const ImageToPDFPage = React.lazy(() => import('./pages/tools/ImageToPDFPage'));
const WordToPDFPage = React.lazy(() => import('./pages/tools/WordToPDFPage'));
const OCRPDFPage = React.lazy(() => import('./pages/tools/OCRPDFPage'));
const EnhancedPDFProcessorPage = React.lazy(() => import('./pages/EnhancedPDFProcessorPage'));

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
          <div className="min-h-screen bg-gradient-mesh">
            {/* Main content with suspense for lazy loading */}
            <React.Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Home page */}
                <Route path="/" element={<HomePage />} />

                {/* PDF Tools - SEO-optimized URLs */}
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
                <Route path="/ocr-pdf" element={<OCRPDFPage />} />

                {/* Demo page */}
                <Route path="/demo" element={<EnhancedPDFProcessorPage />} />

                {/* Information pages */}
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/how-to-use" element={<HowToUsePage />} />

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
