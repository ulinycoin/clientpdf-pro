import React from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import RelatedTools from '../../components/common/RelatedTools';
import ExtractTextTool from '../../components/organisms/ExtractTextTool';

const ExtractTextPDFPage: React.FC = () => {
  const seoData = toolsSEOData.extractText;

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
            Extract text content from PDF files for free. Get plain text from PDF documents. Fast text extraction in your browser without uploads.
          </p>
        </header>

        <section className="mb-12">
          <ExtractTextTool 
            file={null} 
            onComplete={() => {}} 
            onClose={() => {}} 
          />
        </section>

        <RelatedTools currentTool="extractText" className="mb-8" />
      </main>
    </>
  );
};

export default ExtractTextPDFPage;