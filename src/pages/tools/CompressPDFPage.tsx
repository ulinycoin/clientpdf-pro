import React, { useState } from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import { Header, Footer } from '../../components/organisms';
import RelatedTools from '../../components/common/RelatedTools';
import UploadSection from '../../components/molecules/UploadSection';
import CompressionTool from '../../components/organisms/CompressionTool';
import Button from '../../components/atoms/Button';
import { downloadBlob } from '../../utils/fileHelpers';
import { generateFilename } from '../../utils/fileHelpers';
import { useScrollToTop } from '../../hooks/useScrollBehavior';
import { useI18n } from '../../hooks/useI18n';

const CompressPDFPage: React.FC = () => {
  const { t } = useI18n();
  const seoData = toolsSEOData.compress;
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showTool, setShowTool] = useState(false);

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
                supportedFormats="PDF files"
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

        <RelatedTools currentTool="compress" className="mb-8" />

        {/* Benefits Section */}
        <section className="mt-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              {t('pages.tools.compress.benefits.title')}
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl">🗜️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('pages.tools.compress.benefits.smart.title')}</h3>
                <p className="text-gray-600">
                  {t('pages.tools.compress.benefits.smart.description')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 text-2xl">⚙️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('pages.tools.compress.benefits.control.title')}</h3>
                <p className="text-gray-600">
                  {t('pages.tools.compress.benefits.control.description')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 text-2xl">🔒</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('pages.tools.compress.benefits.private.title')}</h3>
                <p className="text-gray-600">
                  {t('pages.tools.compress.benefits.private.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mt-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
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
        </section>

        {/* Technical Details */}
        <section className="mt-16 bg-gray-50 rounded-xl p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              {t('pages.tools.compress.technical.title')}
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('pages.tools.compress.technical.compressed.title')}</h3>
                <ul className="space-y-2 text-gray-600">
                  <li dangerouslySetInnerHTML={{ __html: t('pages.tools.compress.technical.compressed.images') }} />
                  <li dangerouslySetInnerHTML={{ __html: t('pages.tools.compress.technical.compressed.fonts') }} />
                  <li dangerouslySetInnerHTML={{ __html: t('pages.tools.compress.technical.compressed.streams') }} />
                  <li dangerouslySetInnerHTML={{ __html: t('pages.tools.compress.technical.compressed.metadata') }} />
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('pages.tools.compress.technical.quality.title')}</h3>
                <ul className="space-y-2 text-gray-600">
                  <li dangerouslySetInnerHTML={{ __html: t('pages.tools.compress.technical.quality.high') }} />
                  <li dangerouslySetInnerHTML={{ __html: t('pages.tools.compress.technical.quality.good') }} />
                  <li dangerouslySetInnerHTML={{ __html: t('pages.tools.compress.technical.quality.acceptable') }} />
                  <li dangerouslySetInnerHTML={{ __html: t('pages.tools.compress.technical.quality.low') }} />
                </ul>
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

export default CompressPDFPage;
