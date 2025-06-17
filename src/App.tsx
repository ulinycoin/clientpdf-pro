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
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;