/**
 * Copyright (c) 2024 LocalPDF Team
 * 
 * This file is part of LocalPDF.
 * 
 * LocalPDF is proprietary software: you may not copy, modify, distribute,
 * or use this software except as expressly permitted under the LocalPDF
 * Source Available License v1.0.
 * 
 * See the LICENSE file in the project root for license terms.
 * For commercial licensing, contact: license@localpdf.online
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { MergePDFPage } from './pages/MergePDFPage';
import { SplitPDFPage } from './pages/SplitPDFPage';
import { CompressPDFPage } from './pages/CompressPDFPage';
import { ImagesToPDFPage } from './pages/ImagesToPDFPage';
import { FAQPage } from './pages/FAQPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/merge-pdf" element={<MergePDFPage />} />
            <Route path="/split-pdf" element={<SplitPDFPage />} />
            <Route path="/compress-pdf" element={<CompressPDFPage />} />
            <Route path="/images-to-pdf" element={<ImagesToPDFPage />} />
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
