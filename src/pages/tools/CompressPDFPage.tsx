import React from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import RelatedTools from '../../components/common/RelatedTools';
import { Link } from 'react-router-dom';

const CompressPDFPage: React.FC = () => {
  const seoData = toolsSEOData.compress;

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
            Compress PDF Files Free
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compress PDF files to reduce size without losing quality. Free PDF compression tool that works in your browser. No file uploads required.
          </p>
        </header>

        {/* Tool Access Section */}
        <section className="mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">🗜️</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Ready to Compress Your PDF?
              </h2>
              <p className="text-gray-600 mb-6">
                Use our main tool with full functionality including file upload, compression settings, and instant download.
              </p>
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to PDF Compression Tool
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            PDF Compression Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🔒 Secure Compression
              </h3>
              <p className="text-gray-600">
                All compression happens locally in your browser. Your files never leave your device, ensuring complete privacy.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ⚡ Fast Processing
              </h3>
              <p className="text-gray-600">
                Reduce PDF file sizes instantly with our optimized compression algorithm. No waiting for server processing.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🎯 Quality Control
              </h3>
              <p className="text-gray-600">
                Choose compression levels to balance file size and quality. Maintain readability while reducing size.
              </p>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            How PDF Compression Works
          </h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <ol className="space-y-4">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                  1
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">Upload Your PDF</h3>
                  <p className="text-gray-600">Select or drag and drop your PDF file into the compression tool.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                  2
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">Choose Settings</h3>
                  <p className="text-gray-600">Select compression level based on your needs - high compression or maintain quality.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                  3
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">Download Result</h3>
                  <p className="text-gray-600">Get your compressed PDF instantly, ready for sharing or storage.</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* Related Tools */}
        <RelatedTools currentTool="compress" className="mb-8" />
      </main>
    </>
  );
};

export default CompressPDFPage;