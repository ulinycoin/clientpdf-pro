import React, { useState } from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import RelatedTools from '../../components/common/RelatedTools';
import AddTextTool from '../../components/organisms/AddTextTool';
import FileUploadZone from '../../components/molecules/FileUploadZone';

const AddTextPDFPage: React.FC = () => {
  const seoData = toolsSEOData.addText;
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
    console.log('Add text completed:', result);
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
            Add Text to PDF Free
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Add custom text to PDF files for free. Insert text, signatures, and annotations. Privacy-first PDF text editor that works in your browser.
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
                  <strong>Step 2:</strong> Click on the PDF to add text
                </p>
                <p>
                  <strong>Step 3:</strong> Save your modified PDF
                </p>
              </div>
            </div>
          ) : (
            <AddTextTool 
              files={files} 
              onComplete={handleToolComplete} 
              onClose={handleToolClose} 
            />
          )}
        </section>

        <RelatedTools currentTool="addText" className="mb-8" />
      </main>
    </>
  );
};

export default AddTextPDFPage;