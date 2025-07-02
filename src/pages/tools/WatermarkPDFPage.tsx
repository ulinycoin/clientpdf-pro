import React from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import RelatedTools from '../../components/common/RelatedTools';
import { WatermarkTool } from '../../components/organisms/WatermarkTool';

const WatermarkPDFPage: React.FC = () => {
  const seoData = toolsSEOData.watermark;

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
          <WatermarkTool />
        </section>

        <RelatedTools currentTool="watermark" className="mb-8" />
      </main>
    </>
  );
};

export default WatermarkPDFPage;