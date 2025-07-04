import React, { useState } from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import RelatedTools from '../../components/common/RelatedTools';
import SplitTool from '../../components/organisms/SplitTool';
import FileUploadZone from '../../components/molecules/FileUploadZone';
import { useFileUpload } from '../../hooks/useFileUpload';

const SplitPDFPage: React.FC = () => {
  const seoData = toolsSEOData.split;
  const [toolActive, setToolActive] = useState(false);
  
  const {
    files,
    addFiles,
    removeFile,
    clearFiles
  } = useFileUpload();

  const handleFileSelect = (selectedFiles: File[]) => {
    addFiles(selectedFiles);
    if (selectedFiles.length > 0) {
      setToolActive(true);
    }
  };

  const handleToolComplete = () => {
    setToolActive(false);
    clearFiles();
  };

  const handleToolClose = () => {
    setToolActive(false);
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
        {/* Page Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Split PDF Files Free
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Split PDF files by pages or ranges for free. Extract specific pages from PDF documents. Private and secure PDF splitting in your browser.
          </p>
        </header>

        {/* Tool Section */}
        <section className="mb-12">
          {!toolActive ? (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                Upload PDF to Split
              </h2>
              <FileUploadZone
                onFilesSelected={handleFileSelect}
                accept="application/pdf"
                multiple={false}
                maxSize={100 * 1024 * 1024}
                disabled={false}
              />
              
              {files.length > 0 && (
                <div className="mt-6 bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-red-600 text-lg">📄</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{files[0].name}</p>
                        <p className="text-sm text-gray-500">
                          {(files[0].size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setToolActive(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Splitting
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <SplitTool 
              files={files} 
              onComplete={handleToolComplete} 
              onClose={handleToolClose} 
            />
          )}
        </section>

        {/* Features Section - only show when tool is not active */}
        {!toolActive && (
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
        )}

        {/* Related Tools - only show when tool is not active */}
        {!toolActive && (
          <RelatedTools currentTool="split" className="mb-8" />
        )}
      </main>
    </>
  );
};

export default SplitPDFPage;