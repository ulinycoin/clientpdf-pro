import React from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import RelatedTools from '../../components/common/RelatedTools';
import { RotateTool } from '../../components/organisms/RotateTool';

const RotatePDFPage: React.FC = () => {
  const seoData = toolsSEOData.rotate;

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
            Rotate PDF pages 90°, 180°, or 270° for free. Fix document orientation quickly. Private PDF rotation tool that works in your browser.
          </p>
        </header>

        <section className="mb-12">
          <RotateTool />
        </section>

        <RelatedTools currentTool="rotate" className="mb-8" />
      </main>
    </>
  );
};

export default RotatePDFPage;