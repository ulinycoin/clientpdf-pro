import React, { useState } from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import RelatedTools from '../../components/common/RelatedTools';
import FileUploadZone from '../../components/molecules/FileUploadZone';
import ExtractPagesTool from '../../components/organisms/ExtractPagesTool';
import Button from '../../components/atoms/Button';
import { downloadFile } from '../../utils/fileHelpers';
import { generateFilename } from '../../utils/fileHelpers';

const ExtractPagesPDFPage: React.FC = () => {
  const seoData = toolsSEOData.extractPages;
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showTool, setShowTool] = useState(false);

  const handleFilesSelected = (files: File[]) => {
    setUploadedFiles(files);
    setShowTool(true);
  };

  const handleComplete = (result: any) => {
    if (result.success && result.blob) {
      const filename = generateFilename(
        uploadedFiles[0]?.name || 'document',
        'extracted-pages',
        'pdf'
      );
      downloadFile(result.blob, filename);
    }
  };

  const handleClose = () => {
    setShowTool(false);
    setUploadedFiles([]);
  };

  const handleReset = () => {
    setShowTool(false);
    setUploadedFiles([]);
  };

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
            Extract PDF Pages Free
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Extract specific pages from PDF documents for free. Create new PDFs from selected pages with full control over page selection.
          </p>
        </header>

        {!showTool ? (
          <section className="mb-12">
            <div className="max-w-2xl mx-auto">
              <FileUploadZone
                onFilesSelected={handleFilesSelected}
                acceptedTypes={['.pdf']}
                maxFiles={1}
                title="Upload PDF to Extract Pages"
                subtitle="Select a PDF file to extract specific pages from"
              />
              
              <div className="mt-8 grid md:grid-cols-2 gap-6 text-sm text-gray-600">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">✨ Key Features:</h3>
                  <ul className="space-y-1">
                    <li>• Extract individual pages or page ranges</li>
                    <li>• Custom page selection (e.g., "1-5, 8, 10-12")</li>
                    <li>• Visual page preview and selection</li>
                    <li>• Preserve original PDF quality</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">🔒 Privacy & Security:</h3>
                  <ul className="space-y-1">
                    <li>• 100% client-side processing</li>
                    <li>• No file uploads to servers</li>
                    <li>• Your data never leaves your device</li>
                    <li>• Instant processing and download</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="mb-12">
            <div className="mb-4 flex justify-center">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex items-center"
              >
                ← Upload Different PDF
              </Button>
            </div>
            
            <ExtractPagesTool
              files={uploadedFiles}
              onComplete={handleComplete}
              onClose={handleClose}
            />
          </section>
        )}

        <RelatedTools currentTool="extractPages" className="mb-8" />

        {/* Benefits Section */}
        <section className="mt-16 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Why Choose Our PDF Page Extractor?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                <p className="text-gray-600">
                  Extract pages instantly with our optimized browser-based processing
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Precise Control</h3>
                <p className="text-gray-600">
                  Select exactly the pages you need with our intuitive selection tools
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl">🔒</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">100% Private</h3>
                <p className="text-gray-600">
                  Your PDFs are processed locally in your browser - never uploaded anywhere
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mt-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              How to Extract PDF Pages
            </h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Upload PDF</h3>
                <p className="text-sm text-gray-600">Drop your PDF file or click to browse</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Select Pages</h3>
                <p className="text-sm text-gray-600">Choose individual pages or ranges</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Extract</h3>
                <p className="text-sm text-gray-600">Click extract to process your selection</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">4</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Download</h3>
                <p className="text-sm text-gray-600">Get your new PDF with selected pages</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default ExtractPagesPDFPage;