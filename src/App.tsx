/**
 * ClientPDF Pro - Client-side PDF processing application
 * 🔧 UPDATED: Removed duplicate CSV converter, using only Enhanced version
 * 
 * @license MIT
 * @author ulinycoin
 * @version 0.1.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { MergePDFPage } from './pages/MergePDFPage';
import { SplitPDFPage } from './pages/SplitPDFPage';
import { CompressPDFPage } from './pages/CompressPDFPage';
import { ImagesToPDFPage } from './pages/ImagesToPDFPage';
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
            
            {/* CSV to PDF - Only Enhanced Version */}
            <Route path="/csv-to-pdf" element={<Navigate to="/enhanced-csv-to-pdf" replace />} />
            <Route path="/enhanced-csv-to-pdf" element={<EnhancedCSVToPDFPage />} />
            
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
