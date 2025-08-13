import React, { useState, useEffect } from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import { Header, Footer } from '../../components/organisms';
import RelatedTools from '../../components/common/RelatedTools';
import FAQSection from '../../components/common/FAQSection';
import AddTextTool from '../../components/organisms/AddTextTool';
import UploadSection from '../../components/molecules/UploadSection';
import TwitterCardImage from '../../components/TwitterCardImage/TwitterCardImage';
import { useI18n } from '../../hooks/useI18n';
import { getCombinedFAQs } from '../../data/faqData';

const AddTextPDFPage: React.FC = () => {
  const { t } = useI18n();
  const seoData = toolsSEOData.addText;
  const [files, setFiles] = useState<File[]>([]);
  const [showTool, setShowTool] = useState(false);

  // Get FAQ data for SEO schema
  const addTextFAQs = getCombinedFAQs('add-text');

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
        faqSchema={addTextFAQs.map(faq => ({
          question: faq.question,
          answer: faq.answer
        }))}
      />
      <TwitterCardImage toolId="add-text-pdf" />

      <div className="min-h-screen bg-gradient-mesh flex flex-col">
        <Header />

        <main className="flex-grow container mx-auto px-4 pt-20 pb-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('pages.tools.addText.pageTitle')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('pages.tools.addText.pageDescription')}
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
                title={t('pages.tools.addText.pageTitle')}
                subtitle="Add text overlays to your PDF documents"
                emoji="✏️"
                supportedFormats="PDF files"
              />

              <div className="text-center text-gray-600 mt-6">
                <p className="mb-2">
                  <strong>{t('pages.tools.addText.steps.upload')}</strong>
                </p>
                <p className="mb-2">
                  <strong>{t('pages.tools.addText.steps.click')}</strong>
                </p>
                <p>
                  <strong>{t('pages.tools.addText.steps.save')}</strong>
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

        {/* How-to Section - only show when tool is not active */}
        {!showTool && (
          <section className="mb-12">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                  How to Add Text to PDF
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">📄</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Upload PDF</h3>
                    <p className="text-gray-600 text-sm">
                      Select your PDF file to add text overlays
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">✏️</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Add Text</h3>
                    <p className="text-gray-600 text-sm">
                      Click anywhere on PDF to add text, customize font and color
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">💾</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Download</h3>
                    <p className="text-gray-600 text-sm">
                      Save your PDF with added text instantly
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FAQ Section - only show when tool is not active */}
        {!showTool && (
          <FAQSection
            title="Frequently Asked Questions about Adding Text to PDF"
            faqs={addTextFAQs}
            className="mb-8"
            defaultOpen={false}
          />
        )}

        {/* Related Tools - only show when tool is not active */}
        {!showTool && (
          <RelatedTools currentTool="addText" className="mb-8" />
        )}
      </main>

      <Footer />
    </div>
    </>
  );
};

export default AddTextPDFPage;
