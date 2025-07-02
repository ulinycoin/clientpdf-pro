import React from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import RelatedTools from '../../components/common/RelatedTools';
import { ExtractPagesTool } from '../../components/organisms/ExtractPagesTool';

const ExtractPagesPDFPage: React.FC = () => {
  const seoData = toolsSEOData.extractPages;

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
            Extract PDF Pages Free
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Extract specific pages from PDF documents for free. Create new PDFs from selected pages. Fast page extraction in your browser.
          </p>
        </header>

        <section className="mb-12">
          <ExtractPagesTool />
        </section>

        <RelatedTools currentTool="extractPages" className="mb-8" />
      </main>
    </>
  );
};

export default ExtractPagesPDFPage;