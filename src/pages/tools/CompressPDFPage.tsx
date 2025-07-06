import React, { useState } from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import RelatedTools from '../../components/common/RelatedTools';
import FileUploadZone from '../../components/molecules/FileUploadZone';
import CompressionTool from '../../components/organisms/CompressionTool';
import Button from '../../components/atoms/Button';
import { downloadFile } from '../../utils/fileHelpers';
import { generateFilename } from '../../utils/fileHelpers';

const CompressPDFPage: React.FC = () => {
  const seoData = toolsSEOData.compress;
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
        'compressed',
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
            Compress PDF Files Free
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compress PDF files to reduce size without losing quality. Free PDF compression tool that works in your browser with customizable quality settings.
          </p>
        </header>

        {!showTool ? (
          <section className="mb-12">
            <div className="max-w-2xl mx-auto">
              <FileUploadZone
                onFilesSelected={handleFilesSelected}
                acceptedTypes={['.pdf']}
                maxFiles={1}
                title="Upload PDF to Compress"
                subtitle="Select a PDF file to reduce its size"
              />
              
              <div className="mt-8 grid md:grid-cols-2 gap-6 text-sm text-gray-600">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">✨ Key Features:</h3>
                  <ul className="space-y-1">
                    <li>• Adjustable quality settings (10% - 100%)</li>
                    <li>• Image compression optimization</li>
                    <li>• Remove metadata for smaller files</li>
                    <li>• Web optimization for faster loading</li>
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
            
            <CompressionTool
              files={uploadedFiles}
              onComplete={handleComplete}
              onClose={handleClose}
            />
          </section>
        )}

        <RelatedTools currentTool="compress" className="mb-8" />

        {/* Benefits Section */}
        <section className="mt-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Why Choose Our PDF Compressor?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl">🗜️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Compression</h3>
                <p className="text-gray-600">
                  Advanced algorithms reduce file size while preserving document quality and readability
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 text-2xl">⚙️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Full Control</h3>
                <p className="text-gray-600">
                  Adjust quality levels, image compression, and web optimization to meet your needs
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 text-2xl">🔒</span>
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
              How PDF Compression Works
            </h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Upload PDF</h3>
                <p className="text-sm text-gray-600">Drop your PDF file or click to browse</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Adjust Settings</h3>
                <p className="text-sm text-gray-600">Choose quality level and compression options</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Compress</h3>
                <p className="text-sm text-gray-600">Watch real-time progress as file is optimized</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold">4</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Download</h3>
                <p className="text-sm text-gray-600">Get your compressed PDF with reduced file size</p>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Details */}
        <section className="mt-16 bg-gray-50 rounded-xl p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Compression Techniques
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What Gets Compressed:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• <strong>Images:</strong> JPEG compression with quality control</li>
                  <li>• <strong>Fonts:</strong> Subset unused characters and optimize encoding</li>
                  <li>• <strong>Streams:</strong> Remove redundant data and compress content</li>
                  <li>• <strong>Metadata:</strong> Optional removal of creation info and properties</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality vs. Size:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• <strong>90-100%:</strong> Near-lossless quality, moderate compression</li>
                  <li>• <strong>70-90%:</strong> Good quality, significant size reduction</li>
                  <li>• <strong>50-70%:</strong> Acceptable quality, maximum compression</li>
                  <li>• <strong>Below 50%:</strong> Noticeable quality loss, smallest files</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default CompressPDFPage;