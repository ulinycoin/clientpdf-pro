import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LocalizationProvider } from './components/context/LocalizationProvider';
import LocalizedHeader from './components/molecules/LocalizedHeader';
import HomePage from './pages/HomePage';
import MergePage from './pages/MergePage';
import SplitPDFPage from './pages/tools/SplitPDFPage';
import CompressPDFPage from './pages/tools/CompressPDFPage';
import AddTextPDFPage from './pages/tools/AddTextPDFPage';
import WatermarkPDFPage from './pages/tools/WatermarkPDFPage';
import RotatePDFPage from './pages/tools/RotatePDFPage';
import ExtractPagesPDFPage from './pages/tools/ExtractPagesPDFPage';
import ExtractTextPDFPage from './pages/tools/ExtractTextPDFPage';
import PDFToImagePage from './pages/tools/PDFToImagePage';
import PrivacyPage from './pages/PrivacyPage';
import FAQPage from './pages/FAQPage';
import NotFoundPage from './pages/NotFoundPage';
import Footer from './components/organisms/Footer';

function App() {
  return (
    <HelmetProvider>
      <LocalizationProvider namespaces={['common', 'tools']}>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <LocalizedHeader />
            
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/merge-pdf" element={<MergePage />} />
                <Route path="/split-pdf" element={<SplitPDFPage />} />
                <Route path="/compress-pdf" element={<CompressPDFPage />} />
                <Route path="/add-text-pdf" element={<AddTextPDFPage />} />
                <Route path="/watermark-pdf" element={<WatermarkPDFPage />} />
                <Route path="/rotate-pdf" element={<RotatePDFPage />} />
                <Route path="/extract-pages-pdf" element={<ExtractPagesPDFPage />} />
                <Route path="/extract-text-pdf" element={<ExtractTextPDFPage />} />
                <Route path="/pdf-to-image" element={<PDFToImagePage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            
            <Footer />
          </div>
        </Router>
      </LocalizationProvider>
    </HelmetProvider>
  );
}

export default App;