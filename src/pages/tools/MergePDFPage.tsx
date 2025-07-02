import React from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import RelatedTools from '../../components/common/RelatedTools';
import MergeTool from '../../components/organisms/MergeTool';

const MergePDFPage: React.FC = () => {
  const seoData = toolsSEOData.merge;

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
            Merge PDF Files Free
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Combine multiple PDF files into one document for free. Fast, secure, and private PDF merging in your browser. No uploads, no registration required.
          </p>
        </header>

        {/* Tool Component */}
        <section className="mb-12">
          <MergeTool 
            files={[]} 
            onComplete={() => {}} 
            onClose={() => {}} 
          />
        </section>

        {/* Features Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Why Choose LocalPDF Merge Tool?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🔒 100% Private
              </h3>
              <p className="text-gray-600">
                Your files never leave your device. All processing happens locally in your browser for maximum privacy and security.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ⚡ Lightning Fast
              </h3>
              <p className="text-gray-600">
                Merge PDFs instantly with our optimized processing engine. No waiting for uploads or downloads from servers.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🆓 Completely Free
              </h3>
              <p className="text-gray-600">
                No limits, no watermarks, no hidden fees. Merge unlimited PDF files for free, forever.
              </p>
            </div>
          </div>
        </section>

        {/* How to Use Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            How to Merge PDF Files
          </h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <ol className="space-y-4">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                  1
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">Upload PDF Files</h3>
                  <p className="text-gray-600">Click "Choose Files" or drag and drop multiple PDF files into the upload area.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                  2
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">Arrange Order</h3>
                  <p className="text-gray-600">Drag and drop files to reorder them. The final PDF will follow this order.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                  3
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">Merge & Download</h3>
                  <p className="text-gray-600">Click "Merge PDFs" and your combined PDF will be ready for download instantly.</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className="bg-white rounded-lg shadow-md p-6">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Is there a limit to how many PDFs I can merge?
              </summary>
              <p className="text-gray-600 mt-3">
                No, there are no limits! You can merge as many PDF files as you want, completely free.
              </p>
            </details>
            <details className="bg-white rounded-lg shadow-md p-6">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Are my files safe when merging PDFs?
              </summary>
              <p className="text-gray-600 mt-3">
                Absolutely! All processing happens in your browser. Your files never get uploaded to any server, ensuring complete privacy.
              </p>
            </details>
            <details className="bg-white rounded-lg shadow-md p-6">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                What file formats are supported?
              </summary>
              <p className="text-gray-600 mt-3">
                Currently, we support PDF files only. The merged output will also be a PDF file.
              </p>
            </details>
          </div>
        </section>

        {/* Related Tools */}
        <RelatedTools currentTool="merge" className="mb-8" />
      </main>
    </>
  );
};

export default MergePDFPage;