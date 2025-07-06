import React, { useState } from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import RelatedTools from '../../components/common/RelatedTools';
import PdfToImageTool from '../../components/organisms/PdfToImageTool';
import FileUploadZone from '../../components/molecules/FileUploadZone';

const PDFToImagePage: React.FC = () => {
  const seoData = toolsSEOData.pdfToImage;
  const [files, setFiles] = useState<File[]>([]);
  const [showTool, setShowTool] = useState(false);

  const handleFilesSelected = (selectedFiles: File[]) => {
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
    if (pdfFiles.length > 0) {
      setFiles(pdfFiles);
      setShowTool(true);
    }
  };

  const handleToolComplete = (result: any) => {
    console.log('PDF to image completed:', result);
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
            Convert PDF to Images Free
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Convert PDF pages to images for free. Export PDF as JPG, PNG, or WEBP. High-quality conversion in your browser.
          </p>
        </header>

        <section className="mb-12">
          {!showTool ? (
            <div className="max-w-2xl mx-auto">
              <FileUploadZone
                onFilesSelected={handleFilesSelected}
                multiple={false}
                accept="application/pdf"
                className="mb-6"
              />
              
              <div className="text-center text-gray-600">
                <p className="mb-2">
                  <strong>Step 1:</strong> Upload your PDF file
                </p>
                <p className="mb-2">
                  <strong>Step 2:</strong> Choose output format (PNG, JPG, WEBP)
                </p>
                <p>
                  <strong>Step 3:</strong> Download your converted images
                </p>
              </div>
            </div>
          ) : (
            <PdfToImageTool 
              files={files} 
              onComplete={handleToolComplete} 
              onClose={handleToolClose} 
            />
          )}
        </section>

        <RelatedTools currentTool="pdfToImage" className="mb-8" />
      </main>
    </>
  );
};

export default PDFToImagePage;