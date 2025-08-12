import React, { useState } from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import { Header, Footer } from '../../components/organisms';
import RelatedTools from '../../components/common/RelatedTools';
import FAQSection from '../../components/common/FAQSection';
import UploadSection from '../../components/molecules/UploadSection';
import CompressionTool from '../../components/organisms/CompressionTool';
import Button from '../../components/atoms/Button';
import { downloadBlob } from '../../utils/fileHelpers';
import { generateFilename } from '../../utils/fileHelpers';
import { useScrollToTop } from '../../hooks/useScrollBehavior';
import { useI18n } from '../../hooks/useI18n';
// import { getCombinedFAQs } from '../../data/faqData';

const CompressPDFPage: React.FC = () => {
  const { t } = useI18n();
  const seoData = toolsSEOData.compress;
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showTool, setShowTool] = useState(false);

  // Get FAQ data from translations
  const compressFAQs = t('pages.tools.compress.faq.items');

  // Scroll to top when component mounts using custom hook
  useScrollToTop();

  const handleFilesSelected = (files: File[]) => {
    setUploadedFiles(files);
    setShowTool(true);
  };

  const handleComplete = (result: any) => {
    if (result.success && result.data) {
      const filename = generateFilename(
        uploadedFiles[0]?.name || 'document',
        'compressed',
        'pdf'
      );
      downloadBlob(result.data, filename);
    }
  };

  const handleClose = () => {
    setShowTool(false);
    setUploadedFiles([]);
  };

  const handleReset = () => {
    setShowTool(false);
    setUploadedFiles([]);
  };

  return (
    <>
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonical={seoData.canonical}
        structuredData={seoData.structuredData}
        faqSchema={compressFAQs.map(faq => ({
          question: faq.question,
          answer: faq.answer
        }))}
      />

      <div className="min-h-screen bg-gradient-mesh flex flex-col">
        <Header />

        <main className="flex-grow container mx-auto px-4 pt-20 pb-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('pages.tools.compress.pageTitle')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('pages.tools.compress.pageDescription')}
            </p>
          </header>

        {!showTool ? (
          <section className="mb-12">
            <div className="max-w-2xl mx-auto">
              <UploadSection
                onFilesSelected={handleFilesSelected}
                acceptedTypes={['.pdf']}
                maxFiles={1}
                title={t('pages.tools.compress.uploadTitle')}
                subtitle={t('pages.tools.compress.uploadSubtitle')}
                emoji="🗜️"
                supportedFormats={t('common.pdfFiles')}
              />

              <div className="mt-8 grid md:grid-cols-2 gap-6 text-sm text-gray-600">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">{t('pages.tools.compress.features.title')}</h3>
                  <ul className="space-y-1">
                    <li>{t('pages.tools.compress.features.items.qualitySettings')}</li>
                    <li>{t('pages.tools.compress.features.items.imageOptimization')}</li>
                    <li>{t('pages.tools.compress.features.items.removeMetadata')}</li>
                    <li>{t('pages.tools.compress.features.items.webOptimization')}</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">{t('pages.tools.compress.privacy.title')}</h3>
                  <ul className="space-y-1">
                    <li>{t('pages.tools.compress.privacy.items.clientSide')}</li>
                    <li>{t('pages.tools.compress.privacy.items.noUploads')}</li>
                    <li>{t('pages.tools.compress.privacy.items.localProcessing')}</li>
                    <li>{t('pages.tools.compress.privacy.items.instantProcessing')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="mb-12">
            <div className="mb-4 flex justify-center">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex items-center"
              >
{t('pages.tools.compress.buttons.uploadDifferent')}
              </Button>
            </div>

            <CompressionTool
              files={uploadedFiles}
              onComplete={handleComplete}
              onClose={handleClose}
            />
          </section>
        )}

        {/* How-to Section */}
        <section className="mt-12 mb-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                {t('pages.tools.compress.howTo.title')}
              </h2>

              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('pages.tools.compress.howTo.steps.upload.title')}</h3>
                  <p className="text-sm text-gray-600">{t('pages.tools.compress.howTo.steps.upload.description')}</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('pages.tools.compress.howTo.steps.settings.title')}</h3>
                  <p className="text-sm text-gray-600">{t('pages.tools.compress.howTo.steps.settings.description')}</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('pages.tools.compress.howTo.steps.compress.title')}</h3>
                  <p className="text-sm text-gray-600">{t('pages.tools.compress.howTo.steps.compress.description')}</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 font-bold">4</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('pages.tools.compress.howTo.steps.download.title')}</h3>
                  <p className="text-sm text-gray-600">{t('pages.tools.compress.howTo.steps.download.description')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          title={t('pages.tools.compress.faqTitle')}
          faqs={compressFAQs}
          className="mb-8"
          defaultOpen={false}
        />

        <RelatedTools currentTool="compress" className="mb-8" />
      </main>

      <Footer />
    </div>
    </>
  );
};

export default CompressPDFPage;
