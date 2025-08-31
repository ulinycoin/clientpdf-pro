import React, { useState } from 'react';
import { toolsSEOData } from '../../data/seoData';
import { StandardToolPageTemplate } from '../../components/templates';
import { ModernUploadZone } from '../../components/molecules';
import { RelatedToolsSection } from '../../components/organisms';
import ExcelToPDFTool from '../../components/organisms/ExcelToPDFTool';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useI18n } from '../../hooks/useI18n';
import { useDynamicSEO } from '../../hooks/useDynamicSEO';
import { getCombinedFAQs } from '../../data/faqData';

const ExcelToPDFPage: React.FC = () => {
  const { t } = useI18n();
  const seoData = toolsSEOData.excelToPdf;
  const [toolActive, setToolActive] = useState(false);
  const [localFiles, setLocalFiles] = useState<File[]>([]);

  // Get FAQ data for SEO schema
  const excelToPdfFAQs = getCombinedFAQs('excel-to-pdf');

  // Dynamic SEO updates
  useDynamicSEO('excel-to-pdf');

  const {
    files,
    addFiles,
    removeFile,
    clearFiles
  } = useFileUpload();

  const handleFileSelect = (selectedFiles: File[]) => {
    // Filter only Excel files
    const excelFiles = selectedFiles.filter(file => 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel'
    );
    if (excelFiles.length > 0) {
      setLocalFiles([excelFiles[0]]); // Use local state instead
      setToolActive(true);
    }
  };

  const handleToolComplete = (result: any) => {
    setToolActive(false);
    setLocalFiles([]);
  };

  const handleToolClose = () => {
    setToolActive(false);
  };

  // Create the tool component based on state
  const toolComponent = !toolActive ? (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Upload Zone */}
      <ModernUploadZone
        onFilesSelected={handleFileSelect}
        accept=".xlsx,.xls"
        acceptedTypes={['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']}
        multiple={false}
        maxSize={100 * 1024 * 1024}
        disabled={false}
        title={t('pages.tools.excelToPdf.uploadSection.title') || 'Upload Excel File'}
        subtitle={t('pages.tools.excelToPdf.uploadSection.subtitle') || 'Convert Excel spreadsheets to PDF with full formatting and data preservation'}
        supportedFormats={t('pages.tools.excelToPdf.uploadSection.supportedFormats') || 'XLSX, XLS files up to 100MB'}
        icon="📊"
      />
      
      {/* Features Info */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-6 shadow-lg">
        <h4 className="text-lg font-black text-black dark:text-white mb-4">
          {t('pages.tools.excelToPdf.tool.features.title') || 'Conversion Features:'}
        </h4>
        <div className="grid gap-3">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-seafoam-500 rounded-full"></span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('pages.tools.excelToPdf.tool.features.multipleSheets') || 'Support for multiple sheets selection'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-seafoam-500 rounded-full"></span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('pages.tools.excelToPdf.tool.features.preserveFormatting') || 'Preserve all formatting and styles'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-seafoam-500 rounded-full"></span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('pages.tools.excelToPdf.tool.features.customSettings') || 'Flexible conversion settings'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-seafoam-500 rounded-full"></span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('pages.tools.excelToPdf.tool.features.highQuality') || 'High-quality PDF output'}
            </span>
          </div>
        </div>
        
        {/* File status indicator */}
        {localFiles.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/20 dark:border-gray-600/20">
            <div className="text-sm text-center text-green-600 dark:text-green-400 font-medium">
              ✅ {localFiles.length} Excel file loaded: {localFiles[0]?.name}
            </div>
          </div>
        )}
      </div>
    </div>
  ) : (
    <ExcelToPDFTool
      files={localFiles}
      onComplete={handleToolComplete}
      onClose={handleToolClose}
    />
  );

  return (
    <StandardToolPageTemplate
      seoData={seoData}
      toolId="excel-to-pdf"
      faqSchema={excelToPdfFAQs.map(faq => ({
        question: faq.question,
        answer: faq.answer
      }))}
      pageTitle={t('pages.tools.excelToPdf.pageTitle') || 'Convert Excel to PDF for Free'}
      pageDescription={t('pages.tools.excelToPdf.pageDescription') || 'Convert Excel spreadsheets (XLS, XLSX) to PDF documents. Preserve formatting and layout.'}
      toolComponent={toolComponent}
      breadcrumbKey="excel-to-pdf"
      relatedToolsSection={<RelatedToolsSection currentTool="excel-to-pdf" />}
    />
  );
};

export default ExcelToPDFPage;
