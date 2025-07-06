import React, { useState } from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import RelatedTools from '../../components/common/RelatedTools';
import ExtractTextTool from '../../components/organisms/ExtractTextTool';
import FileUploadZone from '../../components/molecules/FileUploadZone';

const ExtractTextPDFPage: React.FC = () => {
  const seoData = toolsSEOData.extractText;
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
    console.log('Extract text completed:', result);
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
            Extract Text from PDF Free
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Extract text content from PDF files for free. Get plain text from PDF documents with smart formatting. Privacy-first text extraction in your browser.
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
                  <strong>Step 2:</strong> Choose extraction options (smart formatting recommended)
                </p>
                <p>
                  <strong>Step 3:</strong> Download extracted text as .txt file
                </p>
              </div>
            </div>
          ) : (
            <ExtractTextTool 
              files={files} 
              onComplete={handleToolComplete} 
              onClose={handleToolClose} 
            />
          )}
        </section>

        <RelatedTools currentTool="extractText" className="mb-8" />
      </main>
    </>
  );
};

export default ExtractTextPDFPage;