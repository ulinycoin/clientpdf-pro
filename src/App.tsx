/**
 * ClientPDF Pro - Client-side PDF processing application
 * 🚀 UPDATED: Integrated Interactive CSV to PDF Editor with dual-mode support
 * 
 * @license MIT
 * @author ulinycoin
 * @version 0.2.0
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

// 🆕 NEW: Interactive CSV to PDF Editor with dual-mode support
import { EnhancedCSVToPDFPageIntegration } from './components/enhanced/EnhancedCSVToPDFPageIntegration';

// Legacy CSV page kept for compatibility
import { EnhancedCSVToPDFPage } from './pages/EnhancedCSVToPDFPage';

import { FAQPage } from './pages/FAQPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';

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
            
            {/* 🚀 CSV to PDF - NEW Interactive Editor with dual-mode support */}
            <Route path="/csv-to-pdf" element={<EnhancedCSVToPDFPageIntegration />} />
            <Route path="/enhanced-csv-to-pdf" element={<EnhancedCSVToPDFPageIntegration />} />
            
            {/* 🔄 Legacy CSV route for compatibility */}
            <Route path="/csv-to-pdf-legacy" element={<EnhancedCSVToPDFPage />} />
            
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;