import React, { useState } from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import RelatedTools from '../../components/common/RelatedTools';
import FileUploadZone from '../../components/molecules/FileUploadZone';
import RotateTool from '../../components/organisms/RotateTool';
import Button from '../../components/atoms/Button';
import { downloadFile } from '../../utils/fileHelpers';
import { generateFilename } from '../../utils/fileHelpers';

const RotatePDFPage: React.FC = () => {
  const seoData = toolsSEOData.rotate;
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
        'rotated',
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
            Rotate PDF Pages Free
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Rotate PDF pages 90°, 180°, or 270° for free. Fix document orientation quickly and easily with our browser-based PDF rotation tool.
          </p>
        </header>

        {!showTool ? (
          <section className="mb-12">
            <div className="max-w-2xl mx-auto">
              <FileUploadZone
                onFilesSelected={handleFilesSelected}
                acceptedTypes={['.pdf']}
                maxFiles={1}
                title="Upload PDF to Rotate Pages"
                subtitle="Select a PDF file to rotate its pages"
              />
              
              <div className="mt-8 grid md:grid-cols-2 gap-6 text-sm text-gray-600">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">✨ Key Features:</h3>
                  <ul className="space-y-1">
                    <li>• Rotate pages by 90°, 180°, or 270°</li>
                    <li>• Rotate all pages or select specific ones</li>
                    <li>• Preview pages before rotating</li>
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
            
            <RotateTool
              files={uploadedFiles}
              onComplete={handleComplete}
              onClose={handleClose}
            />
          </section>
        )}

        <RelatedTools currentTool="rotate" className="mb-8" />

        {/* Benefits Section */}
        <section className="mt-16 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Why Choose Our PDF Page Rotator?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-600 text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Rotation</h3>
                <p className="text-gray-600">
                  Rotate pages instantly with our optimized browser-based processing
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Precise Control</h3>
                <p className="text-gray-600">
                  Choose exact rotation angles and select specific pages to rotate
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
              How to Rotate PDF Pages
            </h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Upload PDF</h3>
                <p className="text-sm text-gray-600">Drop your PDF file or click to browse</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Select Pages</h3>
                <p className="text-sm text-gray-600">Choose which pages to rotate</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Choose Angle</h3>
                <p className="text-sm text-gray-600">Select rotation: 90°, 180°, or 270°</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-600 font-bold">4</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Download</h3>
                <p className="text-sm text-gray-600">Get your PDF with rotated pages</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default RotatePDFPage;