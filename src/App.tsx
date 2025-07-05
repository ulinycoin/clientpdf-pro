import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LocalizationProvider } from './components/context/LocalizationProvider';
import LocalizedHeader from './components/molecules/LocalizedHeader';
import HomePage from './pages/HomePage';
import MergePage from './pages/MergePage';
import SplitPage from './pages/SplitPage';
import CompressPage from './pages/CompressPage';
import AddTextPage from './pages/AddTextPage';
import WatermarkPage from './pages/WatermarkPage';
import RotatePage from './pages/RotatePage';
import ExtractPagesPage from './pages/ExtractPagesPage';
import ExtractTextPage from './pages/ExtractTextPage';
import PdfToImagePage from './pages/PdfToImagePage';
import PrivacyPage from './pages/PrivacyPage';
import FAQPage from './pages/FAQPage';
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
                <Route path="/split-pdf" element={<SplitPage />} />
                <Route path="/compress-pdf" element={<CompressPage />} />
                <Route path="/add-text-pdf" element={<AddTextPage />} />
                <Route path="/watermark-pdf" element={<WatermarkPage />} />
                <Route path="/rotate-pdf" element={<RotatePage />} />
                <Route path="/extract-pages-pdf" element={<ExtractPagesPage />} />
                <Route path="/extract-text-pdf" element={<ExtractTextPage />} />
                <Route path="/pdf-to-image" element={<PdfToImagePage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/faq" element={<FAQPage />} />
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