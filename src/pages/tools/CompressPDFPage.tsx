import React from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import RelatedTools from '../../components/common/RelatedTools';
import { CompressionTool } from '../../components/organisms/CompressionTool';

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

        {/* Tool Component */}
        <section className="mb-12">
          <CompressionTool />
        </section>

        {/* Compression Benefits */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Why Compress Your PDFs?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl mb-3">📧</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Email Attachments
              </h3>
              <p className="text-gray-600 text-sm">
                Reduce file size to meet email attachment limits and send documents faster.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl mb-3">💾</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Save Storage
              </h3>
              <p className="text-gray-600 text-sm">
                Free up valuable disk space by compressing large PDF archives and documents.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Faster Uploads
              </h3>
              <p className="text-gray-600 text-sm">
                Upload documents to websites, cloud storage, and services much faster.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Mobile Friendly
              </h3>
              <p className="text-gray-600 text-sm">
                Smaller files load faster on mobile devices and use less data.
              </p>
            </div>
          </div>
        </section>

        {/* Compression Levels */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Smart Compression Options
          </h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌿</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Light Compression</h3>
                <p className="text-gray-600 mb-3">Minimal size reduction while preserving maximum quality</p>
                <div className="text-sm text-gray-500">
                  <div>• 10-30% size reduction</div>
                  <div>• Perfect for high-quality prints</div>
                  <div>• Ideal for professional documents</div>
                </div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚖️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Balanced Compression</h3>
                <p className="text-gray-600 mb-3">Optimal balance between file size and quality</p>
                <div className="text-sm text-gray-500">
                  <div>• 30-60% size reduction</div>
                  <div>• Great for most use cases</div>
                  <div>• Recommended for sharing</div>
                </div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🗜️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Maximum Compression</h3>
                <p className="text-gray-600 mb-3">Smallest file size for web and mobile use</p>
                <div className="text-sm text-gray-500">
                  <div>• 60-80% size reduction</div>
                  <div>• Perfect for web uploads</div>
                  <div>• Great for email attachments</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Use Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            How to Compress PDF Files
          </h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <ol className="space-y-4">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                  1
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">Upload Your PDF</h3>
                  <p className="text-gray-600">Select your PDF file using the upload button or drag and drop it into the compression area.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                  2
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">Choose Compression Level</h3>
                  <p className="text-gray-600">Select from Light, Balanced, or Maximum compression based on your quality and size requirements.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                  3
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">Compress & Download</h3>
                  <p className="text-gray-600">Click "Compress PDF" and download your optimized file with reduced size but maintained quality.</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* Compression Tips */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            PDF Compression Tips & Best Practices
          </h2>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">💡 Optimization Tips</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• Use Maximum compression for web viewing</li>
                  <li>• Choose Light compression for printing</li>
                  <li>• Balanced works great for email sharing</li>
                  <li>• Test different levels for best results</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">⚠️ What to Consider</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• Higher compression = smaller file size</li>
                  <li>• Text quality is usually well preserved</li>
                  <li>• Image-heavy PDFs compress more</li>
                  <li>• Always keep an original copy</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            PDF Compression FAQ
          </h2>
          <div className="space-y-4">
            <details className="bg-white rounded-lg shadow-md p-6">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                How much can I compress a PDF file?
              </summary>
              <p className="text-gray-600 mt-3">
                Compression rates vary based on content. Image-heavy PDFs can often be reduced by 60-80%, while text-only documents may only compress by 10-30%.
              </p>
            </details>
            <details className="bg-white rounded-lg shadow-md p-6">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Will compression affect PDF quality?
              </summary>
              <p className="text-gray-600 mt-3">
                Our smart compression algorithms preserve text quality while optimizing images. You can choose the compression level that best balances size and quality for your needs.
              </p>
            </details>
            <details className="bg-white rounded-lg shadow-md p-6">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Is there a file size limit for compression?
              </summary>
              <p className="text-gray-600 mt-3">
                No strict limits! However, very large files (100MB+) may take longer to process depending on your device's performance.
              </p>
            </details>
            <details className="bg-white rounded-lg shadow-md p-6">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Can I compress password-protected PDFs?
              </summary>
              <p className="text-gray-600 mt-3">
                Currently, our tool works with unprotected PDFs. You'll need to remove password protection before compression.
              </p>
            </details>
          </div>
        </section>

        {/* Related Tools */}
        <RelatedTools currentTool="compress" className="mb-8" />
      </main>
    </>
  );
};

export default CompressPDFPage;