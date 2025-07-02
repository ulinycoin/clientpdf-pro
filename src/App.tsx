import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { HomePage, PrivacyPage, FAQPage, NotFoundPage } from './pages';
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

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {/* Breadcrumbs for navigation */}
          <Breadcrumbs />
          
          {/* Main content with suspense for lazy loading */}
          <React.Suspense 
            fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
              </div>
            }
          >
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
              
              {/* Information pages */}
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/faq" element={<FAQPage />} />
              
              {/* Additional SEO pages */}
              <Route path="/how-to-use" element={<HomePage />} />
              
              {/* 404 page - professional LocalPDF branded error page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </React.Suspense>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;