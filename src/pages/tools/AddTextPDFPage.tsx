import React from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import RelatedTools from '../../components/common/RelatedTools';
import AddTextTool from '../../components/organisms/AddTextTool';

const AddTextPDFPage: React.FC = () => {
  const seoData = toolsSEOData.addText;

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
          <AddTextTool 
            file={null} 
            onComplete={() => {}} 
            onClose={() => {}} 
          />
        </section>

        <RelatedTools currentTool="addText" className="mb-8" />
      </main>
    </>
  );
};

export default AddTextPDFPage;