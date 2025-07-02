import React from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import RelatedTools from '../../components/common/RelatedTools';
import SplitTool from '../../components/organisms/SplitTool';

const SplitPDFPage: React.FC = () => {
  const seoData = toolsSEOData.split;

  return (
    <>
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonical={seoData.canonical}
        structuredData={seoData.structuredData}
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Split PDF Files Free
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Split PDF files by pages or ranges for free. Extract specific pages from PDF documents. Private and secure PDF splitting in your browser.
          </p>
        </header>

        {/* Tool Component */}
        <section className="mb-12">
          <SplitTool 
            file={null} 
            onComplete={() => {}} 
            onClose={() => {}} 
          />
        </section>

        {/* Features Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Advanced PDF Splitting Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                📄 Page Ranges
              </h3>
              <p className="text-gray-600">
                Split by specific page ranges (e.g., 1-5, 10-15) or extract individual pages with precision.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ⚡ Batch Processing
              </h3>
              <p className="text-gray-600">
                Process multiple page ranges at once. Create several PDFs from one source document efficiently.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                👁️ Preview Mode
              </h3>
              <p className="text-gray-600">
                Preview pages before splitting to ensure you're extracting the right content from your PDF.
              </p>
            </div>
          </div>
        </section>

        {/* Related Tools */}
        <RelatedTools currentTool="split" className="mb-8" />
      </main>
    </>
  );
};

export default SplitPDFPage;