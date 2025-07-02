import React from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import RelatedTools from '../../components/common/RelatedTools';
import { PdfToImageTool } from '../../components/organisms/PdfToImageTool';

const PDFToImagePage: React.FC = () => {
  const seoData = toolsSEOData.pdfToImage;

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
            Convert PDF pages to images for free. Export PDF as JPG, PNG, or WEBP. High-quality PDF to image conversion in your browser.
          </p>
        </header>

        <section className="mb-12">
          <PdfToImageTool />
        </section>

        <RelatedTools currentTool="pdfToImage" className="mb-8" />
      </main>
    </>
  );
};

export default PDFToImagePage;