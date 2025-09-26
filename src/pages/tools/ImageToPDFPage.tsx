import React, { useState, useEffect } from 'react';
import { getToolSEOData } from '../../data/seoData';
import { StandardToolPageTemplate } from '../../components/templates';
import ToolUploadZone from '../../components/molecules/ToolUploadZone';
import ImageToPDFTool from '../../components/organisms/ImageToPDFTool';
import RelatedToolsSection from '../../components/organisms/RelatedToolsSection';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useI18n } from '../../hooks/useI18n';
import { useDynamicSEO } from '../../hooks/useDynamicSEO';
import { getCombinedFAQs } from '../../data/faqData';
import { ImageIcon } from 'lucide-react';

const ImageToPDFPage: React.FC = () => {
  const { t, language } = useI18n();
  const seoData = getToolSEOData('imagesToPdf', language);
  const [toolActive, setToolActive] = useState(false);

  // Get FAQ data for SEO schema
  const imageToPDFFAQs = getCombinedFAQs('imagesToPdf');

  // Dynamic SEO updates
  useDynamicSEO('imagesToPdf');

  const {
    files,
    addFiles,
    removeFile,
    clearFiles
  } = useFileUpload({
    acceptedTypes: ['image/*'],
    maxFiles: 100,
    maxSize: 50 * 1024 * 1024 // 50MB per image
  });

  const handleFileSelect = (selectedFiles: File[]) => {
    // The useFileUpload hook now handles image filtering
    if (selectedFiles.length > 0) {
      addFiles(selectedFiles);
      setToolActive(true);
    }
  };

  const handleToolComplete = (result: any) => {
    setToolActive(false);
    clearFiles();
  };

  const handleToolClose = () => {
    setToolActive(false);
  };

  // Auto scroll to upload zone on component mount
  useEffect(() => {
    const scrollToUploadZone = () => {
      const uploadZone = document.getElementById('tool-upload-zone');
      if (uploadZone) {
        const rect = uploadZone.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const headerOffset = 120;
        const targetPosition = rect.top + scrollTop - headerOffset;
        const finalPosition = Math.max(0, targetPosition);

        window.scrollTo({
          top: finalPosition,
          behavior: 'smooth'
        });
      }
    };

    const timer = setTimeout(scrollToUploadZone, 800);
    return () => clearTimeout(timer);
  }, []);

  // Create the tool component based on state
  const toolComponent = !toolActive ? (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Upload Zone */}
      <ToolUploadZone
        onFilesSelected={handleFileSelect}
        title={t('pages.tools.imageToPdf.uploadSection.title') || 'Upload Images'}
        subtitle={t('pages.tools.imageToPdf.uploadSection.subtitle') || 'Convert multiple images into a single PDF document'}
        supportedFormats={t('pages.tools.imageToPdf.uploadSection.supportedFormats') || 'JPG, PNG, GIF, BMP, WebP files up to 50MB each'}
        gradientFrom="violet-500"
        gradientTo="violet-600"
        IconComponent={ImageIcon}
        accept="image/*"
        acceptedTypes={['image/*']}
        multiple={true}
        maxFiles={100}
        maxSize={50 * 1024 * 1024}
        disabled={false}
        toolId="image-to-pdf"
      />
    </div>
  ) : (
    <ImageToPDFTool
      files={files}
      onComplete={handleToolComplete}
      onClose={handleToolClose}
    />
  );

  return (
    <StandardToolPageTemplate
      seoData={seoData}
      toolId="images-to-pdf"
      faqSchema={imageToPDFFAQs.map(faq => ({
        question: faq.question,
        answer: faq.answer
      }))}
      pageTitle={t('pages.tools.imageToPdf.pageTitle') || 'Convert Images to PDF for Free'}
      pageDescription={t('pages.tools.imageToPdf.pageDescription') || 'Convert JPEG, PNG, GIF and other images to PDF documents. Fast, secure, no server uploads.'}
      toolComponent={toolComponent}
      breadcrumbKey="images-to-pdf"
      relatedToolsSection={<RelatedToolsSection currentTool="images-to-pdf" />}
    />
  );
};

export default ImageToPDFPage;
