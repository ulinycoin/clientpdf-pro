import React, { useState } from 'react';
import { toolsSEOData } from '../../data/seoData';
import { StandardToolPageTemplate } from '../../components/templates';
import { ExtractImagesFromPdfTool } from '../../components/organisms/ExtractImagesFromPdfTool';
import { RelatedToolsSection } from '../../components/organisms';
import { ModernUploadZone } from '../../components/molecules';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useI18n } from '../../hooks/useI18n';
import { useDynamicSEO } from '../../hooks/useDynamicSEO';
import { getCombinedFAQs } from '../../data/faqData';
import { Download, CheckCircle, FileImage, Image } from 'lucide-react';
import { ImageExtractionResult } from '../../types/imageExtraction.types';

const ExtractImagesFromPDFPage: React.FC = () => {
  const { t } = useI18n();
  const seoData = toolsSEOData.extractImagesFromPdf;
  const [toolActive, setToolActive] = useState(false);
  const [result, setResult] = useState<ImageExtractionResult | null>(null);

  // Get FAQ data for SEO schema
  const extractImagesFAQs = getCombinedFAQs('extract-images-from-pdf');

  // Dynamic SEO updates
  useDynamicSEO('extract-images-from-pdf');

  const {
    files,
    addFiles,
    removeFile,
    clearFiles
  } = useFileUpload();

  const handleFileSelect = (selectedFiles: File[]) => {
    // Extract Images works with single PDF file
    addFiles([selectedFiles[0]]);
    if (selectedFiles.length > 0) {
      setToolActive(true);
    }
  };

  const handleToolComplete = (result: ImageExtractionResult) => {
    setResult(result);
    setToolActive(false);
  };

  const handleReset = () => {
    setResult(null);
    clearFiles();
    setToolActive(false);
  };

  const handleToolReset = () => {
    // Reset from within the tool - stay in tool mode but clear file
    setResult(null);
    clearFiles();
    // Keep toolActive as true to show upload zone within tool
  };

  const handleToolClose = () => {
    setToolActive(false);
  };

  const quickSteps = [
    {
      title: t('pages.tools.extractImagesFromPdf.quickSteps.step1.title'),
      description: t('pages.tools.extractImagesFromPdf.quickSteps.step1.description'),
      icon: <FileImage className="w-6 h-6" />
    },
    {
      title: t('pages.tools.extractImagesFromPdf.quickSteps.step2.title'), 
      description: t('pages.tools.extractImagesFromPdf.quickSteps.step2.description'),
      icon: <Image className="w-6 h-6" />
    },
    {
      title: t('pages.tools.extractImagesFromPdf.quickSteps.step3.title'),
      description: t('pages.tools.extractImagesFromPdf.quickSteps.step3.description'),
      icon: <Download className="w-6 h-6" />
    }
  ];

  const benefits = [
    {
      title: t('pages.tools.extractImagesFromPdf.benefits.privacy.title'),
      description: t('pages.tools.extractImagesFromPdf.benefits.privacy.description'),
      icon: <CheckCircle className="w-6 h-6 text-green-500" />
    },
    {
      title: t('pages.tools.extractImagesFromPdf.benefits.quality.title'),
      description: t('pages.tools.extractImagesFromPdf.benefits.quality.description'),
      icon: <CheckCircle className="w-6 h-6 text-green-500" />
    },
    {
      title: t('pages.tools.extractImagesFromPdf.benefits.formats.title'),
      description: t('pages.tools.extractImagesFromPdf.benefits.formats.description'),
      icon: <CheckCircle className="w-6 h-6 text-green-500" />
    },
    {
      title: t('pages.tools.extractImagesFromPdf.benefits.batch.title'),
      description: t('pages.tools.extractImagesFromPdf.benefits.batch.description'),
      icon: <CheckCircle className="w-6 h-6 text-green-500" />
    }
  ];

  return (
    <>
      {toolActive ? (
        <ExtractImagesFromPdfTool 
          initialFile={files[0]} 
          onClose={handleToolClose}
          onReset={handleToolReset}
        />
      ) : (
        <StandardToolPageTemplate
          seoData={seoData}
          toolId="extract-images-from-pdf"
          pageTitle={t('pages.tools.extractImagesFromPdf.pageTitle')}
          pageDescription={t('pages.tools.extractImagesFromPdf.pageDescription')}
          breadcrumbKey="extract-images-from-pdf"
          quickSteps={quickSteps}
          benefits={benefits}
          faqs={extractImagesFAQs}
          toolComponent={
            <>
              <ModernUploadZone
                onFilesSelected={handleFileSelect}
                title={t('pages.tools.extractImagesFromPdf.upload.title')}
                subtitle={t('pages.tools.extractImagesFromPdf.upload.subtitle')}
                supportedFormats="PDF files up to 100MB"
                accept="application/pdf"
                acceptedTypes={['application/pdf']}
                icon="🖼️"
              />
              
              {result && result.success && (
                <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-800">
                      {t('pages.tools.extractImagesFromPdf.success.title')}
                    </h3>
                  </div>
                  <p className="text-green-700 mb-4">
                    {t('pages.tools.extractImagesFromPdf.success.description', {
                      count: result.totalImages,
                      size: Math.round(result.totalSize / (1024 * 1024) * 10) / 10
                    })}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {t('pages.tools.extractImagesFromPdf.buttons.extractAnother')}
                    </button>
                  </div>
                </div>
              )}

              {result && !result.success && (
                <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-xl">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    {t('pages.tools.extractImagesFromPdf.error.title')}
                  </h3>
                  <p className="text-red-700 mb-4">{result.error}</p>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {t('pages.tools.extractImagesFromPdf.buttons.tryAgain')}
                  </button>
                </div>
              )}
            </>
          }
        />
      )}

      {!toolActive && (
        <RelatedToolsSection 
          currentTool="extract-images-from-pdf"
          relatedTools={[
            'pdf-to-image',
            'extract-text-pdf', 
            'pdf-to-svg',
            'split-pdf'
          ]}
        />
      )}
    </>
  );
};

export default ExtractImagesFromPDFPage;