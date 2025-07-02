import React from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import RelatedTools from '../../components/common/RelatedTools';
import { SplitTool } from '../../components/organisms/SplitTool';

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
          <SplitTool />
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

        {/* Use Cases Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Common PDF Splitting Use Cases
          </h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">📚 Document Organization</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Extract chapters from books or manuals</li>
                  <li>• Separate contract sections</li>
                  <li>• Create individual invoices from batch files</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">🎓 Academic & Research</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Extract specific research pages</li>
                  <li>• Separate exam questions</li>
                  <li>• Create study materials from textbooks</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">💼 Business Documents</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Extract client-specific pages</li>
                  <li>• Separate proposal sections</li>
                  <li>• Create department-specific reports</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">📋 Legal & Compliance</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Extract evidence documents</li>
                  <li>• Separate case files</li>
                  <li>• Create redacted versions</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How to Use Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            How to Split PDF Files
          </h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <ol className="space-y-4">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                  1
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">Upload Your PDF</h3>
                  <p className="text-gray-600">Click "Choose File" or drag and drop your PDF document into the upload area.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                  2
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">Select Pages to Extract</h3>
                  <p className="text-gray-600">Choose individual pages (e.g., 1,3,5) or page ranges (e.g., 1-5, 10-15) to extract from your PDF.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                  3
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">Split & Download</h3>
                  <p className="text-gray-600">Click "Split PDF" and download your new PDF files containing only the selected pages.</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            PDF Splitting FAQ
          </h2>
          <div className="space-y-4">
            <details className="bg-white rounded-lg shadow-md p-6">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Can I split password-protected PDFs?
              </summary>
              <p className="text-gray-600 mt-3">
                Currently, our tool works with unprotected PDFs. If your PDF is password-protected, you'll need to remove the password first.
              </p>
            </details>
            <details className="bg-white rounded-lg shadow-md p-6">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                What's the maximum file size I can split?
              </summary>
              <p className="text-gray-600 mt-3">
                There's no strict limit, but larger files (100MB+) may take longer to process depending on your device's capabilities.
              </p>
            </details>
            <details className="bg-white rounded-lg shadow-md p-6">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Do split PDFs maintain the original quality?
              </summary>
              <p className="text-gray-600 mt-3">
                Yes! When you split a PDF, the extracted pages maintain 100% of their original quality, formatting, and resolution.
              </p>
            </details>
            <details className="bg-white rounded-lg shadow-md p-6">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Can I split multiple PDFs at once?
              </summary>
              <p className="text-gray-600 mt-3">
                Currently, you can split one PDF at a time. For batch processing, you'll need to repeat the process for each file.
              </p>
            </details>
          </div>
        </section>

        {/* Related Tools */}
        <RelatedTools currentTool="split" className="mb-8" />
      </main>
    </>
  );
};

export default SplitPDFPage;