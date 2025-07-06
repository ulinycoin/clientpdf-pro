import React, { useState } from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import RelatedTools from '../../components/common/RelatedTools';
import WatermarkTool from '../../components/organisms/WatermarkTool';
import FileUploadZone from '../../components/molecules/FileUploadZone';

const WatermarkPDFPage: React.FC = () => {
  const seoData = toolsSEOData.watermark;
  const [files, setFiles] = useState<File[]>([]);
  const [showTool, setShowTool] = useState(false);

  const handleFilesUploaded = (uploadedFiles: File[]) => {
    const pdfFiles = uploadedFiles.filter(file => file.type === 'application/pdf');
    if (pdfFiles.length > 0) {
      setFiles(pdfFiles);
      setShowTool(true);
    }
  };

  const handleToolComplete = (result: any) => {
    // Handle completion - could show success message or reset
    console.log('Watermark completed:', result);
  };

  const handleToolClose = () => {
    setShowTool(false);
    setFiles([]);
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
            Add Watermark to PDF Free
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Add text or image watermarks to PDF files for free. Protect your documents with custom watermarks. Secure PDF watermarking in your browser.
          </p>
        </header>

        <section className="mb-12">
          {!showTool ? (
            <div className="max-w-2xl mx-auto">
              <FileUploadZone
                onFilesUploaded={handleFilesUploaded}
                maxFiles={1}
                acceptedTypes={['application/pdf']}
                className="mb-6"
              />
              
              <div className="text-center text-gray-600">
                <p className="mb-2">
                  <strong>Step 1:</strong> Upload your PDF file
                </p>
                <p className="mb-2">
                  <strong>Step 2:</strong> Configure watermark settings
                </p>
                <p>
                  <strong>Step 3:</strong> Download your watermarked PDF
                </p>
              </div>
            </div>
          ) : (
            <WatermarkTool 
              files={files} 
              onComplete={handleToolComplete} 
              onClose={handleToolClose} 
            />
          )}
        </section>

        <RelatedTools currentTool="watermark" className="mb-8" />
      </main>
    </>
  );
};

export default WatermarkPDFPage;