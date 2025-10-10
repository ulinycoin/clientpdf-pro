import React, { useState } from 'react';
import { getToolSEOData } from '../../data/seoData';
import { StandardToolPageTemplate } from '../../components/templates';
import { EditPDFTool } from '../../components/organisms';
import { ModernUploadZone } from '../../components/molecules';
import { SemanticContent } from '../../components/molecules/SemanticContent';
import { useI18n } from '../../hooks/useI18n';
import { useDynamicSEO } from '../../hooks/useDynamicSEO';
import { useEntity } from '../../components/providers/EntityProvider';

const EditPDFPage: React.FC = () => {
  const { t, language } = useI18n();
  let seoData = getToolSEOData('edit-pdf', language);

  // Fallback if SEO data is not available
  if (!seoData) {
    seoData = {
      title: t('tools.edit.pageTitle') || 'Edit PDF - LocalPDF',
      description: t('tools.edit.pageDescription') || 'Edit PDF documents online for free',
      keywords: ['edit pdf', 'pdf editor', 'modify pdf'],
      canonical: `https://localpdf.online${language === 'en' ? '' : '/' + language}/edit-pdf`,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Edit PDF',
        description: t('tools.edit.description') || 'Edit PDF documents',
        url: `https://localpdf.online/edit-pdf`,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web Browser',
        isAccessibleForFree: true,
        inLanguage: language,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: ['Edit PDF pages', 'Add annotations', 'Apply watermarks'],
        softwareVersion: '1.0.0',
        applicationSubCategory: 'PDF Tools',
      },
      openGraph: {
        title: 'Edit PDF - LocalPDF',
        description: 'Edit PDF documents online',
        type: 'website',
        url: `https://localpdf.online/edit-pdf`,
      },
    };
  }

  const [file, setFile] = useState<File | null>(null);
  const { entity } = useEntity();

  // Dynamic SEO updates
  useDynamicSEO('edit');

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleReset = () => {
    setFile(null);
  };

  const toolComponent = !file ? (
    <div className="max-w-4xl mx-auto">
      <ModernUploadZone
        onFilesSelected={handleFileSelect}
        accept={{ 'application/pdf': ['.pdf'] }}
        maxFiles={1}
        maxSize={100 * 1024 * 1024} // 100MB
        toolName="edit-pdf"
      />

      <SemanticContent className="mt-12">
        <div className="prose dark:prose-invert max-w-none">
          <h2>{t('tools.edit.features.title')}</h2>
          <ul>
            <li>{t('tools.edit.features.pages')}</li>
            <li>{t('tools.edit.features.annotate')}</li>
            <li>{t('tools.edit.features.design')}</li>
            <li>{t('tools.edit.features.tools')}</li>
          </ul>
        </div>
      </SemanticContent>
    </div>
  ) : (
    <EditPDFTool
      file={file}
      onClose={handleReset}
    />
  );

  return (
    <StandardToolPageTemplate
      seoData={seoData}
      toolId="edit-pdf"
      pageTitle={t('tools.edit.title')}
      pageDescription={t('tools.edit.description')}
      toolComponent={toolComponent}
      breadcrumbKey="edit-pdf"
    />
  );
};

export default EditPDFPage;
