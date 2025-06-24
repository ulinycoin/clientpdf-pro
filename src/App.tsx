/**
 * ClientPDF Pro - Client-side PDF processing application
 * 
 * Modern React application for privacy-focused PDF operations.
 * All processing happens locally in the browser - no server uploads.
 * 
 * @license MIT
 * @author ulinycoin
 * @version 0.1.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { MergePDFPage } from './pages/MergePDFPage';
import { SplitPDFPage } from './pages/SplitPDFPage';
import { CompressPDFPage } from './pages/CompressPDFPage';
import { ImagesToPDFPage } from './pages/ImagesToPDFPage';
import { CSVToPDFPage } from './pages/CSVToPDFPage';
import { FAQPage } from './pages/FAQPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { PDFTestComponent } from './components/organisms/PDFTestComponent';

function App() {
  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/merge-pdf" element={<MergePDFPage />} />
            <Route path="/split-pdf" element={<SplitPDFPage />} />
            <Route path="/compress-pdf" element={<CompressPDFPage />} />
            <Route path="/images-to-pdf" element={<ImagesToPDFPage />} />
            <Route path="/csv-to-pdf" element={<CSVToPDFPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            {/* Debug route - only available in development */}
            {import.meta.env.DEV && (
              <Route path="/debug-pdf" element={<PDFTestComponent />} />
            )}
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;