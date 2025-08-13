import React, { useState, useEffect } from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import { Header, Footer } from '../../components/organisms';
import RelatedTools from '../../components/common/RelatedTools';
import PdfToImageTool from '../../components/organisms/PdfToImageTool';
import UploadSection from '../../components/molecules/UploadSection';
import TwitterCardImage from '../../components/TwitterCardImage/TwitterCardImage';
import { useI18n } from '../../hooks/useI18n';

const PDFToImagePage: React.FC = () => {
  const { t } = useI18n();
  const seoData = toolsSEOData.pdfToImage;
  const [files, setFiles] = useState<File[]>([]);
  const [showTool, setShowTool] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      <TwitterCardImage toolId="pdf-to-jpg" />

      <div className="min-h-screen bg-gradient-mesh flex flex-col">
        <Header />

        <main className="flex-grow container mx-auto px-4 pt-20 pb-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('pages.tools.pdfToImage.pageTitle')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('pages.tools.pdfToImage.pageDescription')}
          </p>
        </header>

        <section className="mb-12">
          {!showTool ? (
            <div className="max-w-2xl mx-auto">
              <UploadSection
                onFilesSelected={handleFilesSelected}
                multiple={false}
                accept="application/pdf"
                acceptedTypes={['application/pdf']}
                title={t('pages.tools.pdfToImage.pageTitle')}
                subtitle="Convert PDF pages to high-quality images"
                emoji="📷"
                supportedFormats="PDF files"
              />

              <div className="text-center text-gray-600 mt-6">
                <p className="mb-2">
                  <strong>{t('pages.tools.pdfToImage.steps.upload')}</strong>
                </p>
                <p className="mb-2">
                  <strong>{t('pages.tools.pdfToImage.steps.format')}</strong>
                </p>
                <p>
                  <strong>{t('pages.tools.pdfToImage.steps.download')}</strong>
                </p>
              </div>
            </div>
          ) : (
            <PdfToImageTool
              initialFile={files[0]}
              onClose={handleToolClose}
            />
          )}
        </section>

        <RelatedTools currentTool="pdfToImage" className="mb-8" />
      </main>

      <Footer />
    </div>
    </>
  );
};

export default PDFToImagePage;
