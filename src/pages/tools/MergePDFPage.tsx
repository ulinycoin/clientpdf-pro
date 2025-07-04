import React, { useState } from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import RelatedTools from '../../components/common/RelatedTools';
import MergeTool from '../../components/organisms/MergeTool';
import FileUploadZone from '../../components/molecules/FileUploadZone';
import { useFileUpload } from '../../hooks/useFileUpload';

const MergePDFPage: React.FC = () => {
  const seoData = toolsSEOData.merge;
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
            Merge PDF Files Free
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Combine multiple PDF files into one document for free. Fast, secure, and private PDF merging in your browser. No uploads, no registration required.
          </p>
        </header>

        {/* Tool Section */}
        <section className="mb-12">
          {!toolActive ? (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                Upload PDF Files to Merge
              </h2>
              <FileUploadZone
                onFilesSelected={handleFileSelect}
                accept="application/pdf"
                multiple={true}
                maxSize={100 * 1024 * 1024}
                disabled={false}
              />
              
              {files.length > 0 && (
                <div className="mt-6 space-y-3">
                  {files.map((file, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <span className="text-red-600 text-lg">📄</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setToolActive(true)}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Start Merging ({files.length} files)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <MergeTool 
              files={files} 
              onComplete={handleToolComplete} 
              onClose={handleToolClose} 
            />
          )}
        </section>

        {/* Features Section - only show when tool is not active */}
        {!toolActive && (
          <>
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
          </>
        )}

        {/* Related Tools - only show when tool is not active */}
        {!toolActive && (
          <RelatedTools currentTool="merge" className="mb-8" />
        )}
      </main>
    </>
  );
};

export default MergePDFPage;