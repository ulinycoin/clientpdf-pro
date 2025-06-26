/**
 * ClientPDF Pro - Client-side PDF processing application
 * 🔧 ВОССТАНОВЛЕН: Полный роутинг после исправления MIME проблемы
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
import { EnhancedCSVToPDFPage } from './pages/EnhancedCSVToPDFPage';
import { StyleTestPage } from './pages/StyleTestPage';
import { MIMEDebugPage } from './pages/MIMEDebugPage';
import { EmergencyPage } from './pages/EmergencyPage'; // 🚨 Оставляем для диагностики
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
            
            {/* CSV to PDF Routes */}
            <Route path="/csv-to-pdf" element={<CSVToPDFPage />} />
            <Route path="/enhanced-csv-to-pdf" element={<EnhancedCSVToPDFPage />} />
            
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            
            {/* Debug and Test routes */}
            <Route path="/debug-pdf" element={<PDFTestComponent />} />
            <Route path="/style-test" element={<StyleTestPage />} />
            <Route path="/mime-debug" element={<MIMEDebugPage />} />
            <Route path="/emergency" element={<EmergencyPage />} /> {/* 🚨 Экстренная страница */}
            <Route path="/test-enhanced" element={<EnhancedCSVToPDFPage />} />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;