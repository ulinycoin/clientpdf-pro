import React from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import RelatedTools from '../../components/common/RelatedTools';
import CompressionTool from '../../components/organisms/CompressionTool';

const CompressPDFPage: React.FC = () => {
  const seoData = toolsSEOData.compress;

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
            Compress PDF Files Free
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compress PDF files to reduce size without losing quality. Free PDF compression tool that works in your browser. No file uploads required.
          </p>
        </header>

        {/* Tool Component */}
        <section className="mb-12">
          <CompressionTool 
            file={null} 
            onComplete={() => {}} 
            onClose={() => {}} 
          />
        </section>

        {/* Related Tools */}
        <RelatedTools currentTool="compress" className="mb-8" />
      </main>
    </>
  );
};

export default CompressPDFPage;