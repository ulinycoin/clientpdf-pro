import React from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import RelatedTools from '../../components/common/RelatedTools';
import { Link } from 'react-router-dom';

const PDFToImagePage: React.FC = () => {
  const seoData = toolsSEOData.pdfToImage;

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
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Convert PDF to Images Free
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Convert PDF pages to images for free. Export PDF as JPG, PNG, or WEBP.
          </p>
        </header>

        <section className="mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">🖼️</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Ready to Convert PDF to Images?
              </h2>
              <p className="text-gray-600 mb-6">
                Use our main tool to convert PDF pages to high-quality images.
              </p>
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to PDF to Image Converter
              </Link>
            </div>
          </div>
        </section>

        <RelatedTools currentTool="pdfToImage" className="mb-8" />
      </main>
    </>
  );
};

export default PDFToImagePage;