import React, { useState, useEffect } from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import { Header, Footer } from '../../components/organisms';
import RelatedTools from '../../components/common/RelatedTools';
import UploadSection from '../../components/molecules/UploadSection';
import RotateTool from '../../components/organisms/RotateTool';
import TwitterCardImage from '../../components/TwitterCardImage/TwitterCardImage';
import Button from '../../components/atoms/Button';
import { downloadBlob } from '../../utils/fileHelpers';
import { generateFilename } from '../../utils/fileHelpers';
import { useI18n } from '../../hooks/useI18n';

const RotatePDFPage: React.FC = () => {
  const { t } = useI18n();
  const seoData = toolsSEOData.rotate;
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showTool, setShowTool] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFilesSelected = (files: File[]) => {
    setUploadedFiles(files);
    setShowTool(true);
  };

  const handleComplete = (result: any) => {
    if (result.success && result.data) {
      const filename = generateFilename(
        uploadedFiles[0]?.name || 'document',
        'rotated',
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
      />
      <TwitterCardImage toolId="rotate-pdf" />

      <div className="min-h-screen bg-gradient-mesh flex flex-col">
        <Header />

        <main className="flex-grow container mx-auto px-4 pt-20 pb-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('pages.tools.rotate.pageTitle')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('pages.tools.rotate.pageDescription')}
          </p>
        </header>

        {!showTool ? (
          <section className="mb-12">
            <div className="max-w-2xl mx-auto">
              <UploadSection
                onFilesSelected={handleFilesSelected}
                acceptedTypes={['.pdf']}
                maxFiles={1}
                title={t('pages.tools.rotate.uploadTitle')}
                subtitle={t('pages.tools.rotate.uploadSubtitle')}
                emoji="🔄"
                supportedFormats="PDF files"
              />

              <div className="mt-8 grid md:grid-cols-2 gap-6 text-sm text-gray-600">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">{t('pages.tools.rotate.features.title')}</h3>
                  <ul className="space-y-1">
                    <li>{t('pages.tools.rotate.features.items.angles')}</li>
                    <li>{t('pages.tools.rotate.features.items.selection')}</li>
                    <li>{t('pages.tools.rotate.features.items.preview')}</li>
                    <li>{t('pages.tools.rotate.features.items.quality')}</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">{t('pages.tools.rotate.privacy.title')}</h3>
                  <ul className="space-y-1">
                    <li>{t('pages.tools.rotate.privacy.items.clientSide')}</li>
                    <li>{t('pages.tools.rotate.privacy.items.noUploads')}</li>
                    <li>{t('pages.tools.rotate.privacy.items.localProcessing')}</li>
                    <li>{t('pages.tools.rotate.privacy.items.instantProcessing')}</li>
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
{t('pages.tools.rotate.buttons.uploadDifferent')}
              </Button>
            </div>

            <RotateTool
              files={uploadedFiles}
              onComplete={handleComplete}
              onClose={handleClose}
            />
          </section>
        )}

        <RelatedTools currentTool="rotate" className="mb-8" />

        {/* Benefits Section */}
        <section className="mt-16 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              {t('pages.tools.rotate.benefits.title')}
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-600 text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('pages.tools.rotate.benefits.instant.title')}</h3>
                <p className="text-gray-600">
                  {t('pages.tools.rotate.benefits.instant.description')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('pages.tools.rotate.benefits.precise.title')}</h3>
                <p className="text-gray-600">
                  {t('pages.tools.rotate.benefits.precise.description')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl">🔒</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('pages.tools.rotate.benefits.private.title')}</h3>
                <p className="text-gray-600">
                  {t('pages.tools.rotate.benefits.private.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mt-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              {t('pages.tools.rotate.howTo.title')}
            </h2>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('pages.tools.rotate.howTo.steps.upload.title')}</h3>
                <p className="text-sm text-gray-600">{t('pages.tools.rotate.howTo.steps.upload.description')}</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('pages.tools.rotate.howTo.steps.select.title')}</h3>
                <p className="text-sm text-gray-600">{t('pages.tools.rotate.howTo.steps.select.description')}</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('pages.tools.rotate.howTo.steps.angle.title')}</h3>
                <p className="text-sm text-gray-600">{t('pages.tools.rotate.howTo.steps.angle.description')}</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-600 font-bold">4</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('pages.tools.rotate.howTo.steps.download.title')}</h3>
                <p className="text-sm text-gray-600">{t('pages.tools.rotate.howTo.steps.download.description')}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
    </>
  );
};

export default RotatePDFPage;
