import React, { useState } from 'react';
import { toolsSEOData } from '../../data/seoData';
import { StandardToolPageTemplate } from '../../components/templates';
import { ModernSplitTool } from '../../components/organisms';
import { ModernUploadZone } from '../../components/molecules';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useI18n } from '../../hooks/useI18n';
import { useDynamicSEO } from '../../hooks/useDynamicSEO';
import { getCombinedFAQs } from '../../data/faqData';
import { PDFProcessingResult } from '../../types';
import { Download, CheckCircle } from 'lucide-react';

const SplitPDFPage: React.FC = () => {
  const { t } = useI18n();
  const seoData = toolsSEOData.split;
  const [toolActive, setToolActive] = useState(false);
  const [results, setResults] = useState<PDFProcessingResult[] | null>(null);
  const [useZip, setUseZip] = useState(false);

  // Get FAQ data for SEO schema
  const splitFAQs = getCombinedFAQs('split');

  // Dynamic SEO updates
  useDynamicSEO('split');

  const {
    files,
    addFiles,
    removeFile,
    clearFiles
  } = useFileUpload();

  const handleFileSelect = (selectedFiles: File[]) => {
    // Split tool works with single file
    addFiles([selectedFiles[0]]);
    if (selectedFiles.length > 0) {
      setToolActive(true);
    }
  };

  const handleToolComplete = (processedResults: PDFProcessingResult[], options?: { useZip?: boolean }) => {
    setResults(processedResults);
    setUseZip(options?.useZip || false);
    setToolActive(false);
  };

  const handleReset = () => {
    setResults(null);
    setUseZip(false);
    clearFiles();
  };

  const downloadFile = (result: PDFProcessingResult, index: number) => {
    if (result.data && result.success) {
      const blob = result.data as Blob;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename based on page number or range
      const fileName = result.metadata?.pageNumber 
        ? `page-${result.metadata.pageNumber}.pdf`
        : result.metadata?.startPage && result.metadata?.endPage
        ? `pages-${result.metadata.startPage}-${result.metadata.endPage}.pdf`
        : `split-${index + 1}.pdf`;
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      URL.revokeObjectURL(url);
    }
  };

  const downloadAllAsZip = async () => {
    if (!results || results.length === 0) return;

    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    results.filter(r => r.success).forEach((result, index) => {
      if (result.data) {
        const blob = result.data as Blob;
        
        // Generate filename based on page number or range
        const fileName = result.metadata?.pageNumber 
          ? `page-${result.metadata.pageNumber}.pdf`
          : result.metadata?.startPage && result.metadata?.endPage
          ? `pages-${result.metadata.startPage}-${result.metadata.endPage}.pdf`
          : `split-${index + 1}.pdf`;
        
        zip.file(fileName, blob);
      }
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipUrl = URL.createObjectURL(zipBlob);
    
    const link = document.createElement('a');
    link.href = zipUrl;
    link.download = 'split-pdf-pages.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(zipUrl);
  };

  const handleToolClose = () => {
    setToolActive(false);
  };

  // Create the tool component based on state
  const toolComponent = (() => {
    // Show results if we have them
    if (results && results.length > 0) {
      const successResults = results.filter(r => r.success);
      
      return (
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Success Header */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-green-800 dark:text-green-200">
                  PDF успешно разделен!
                </h3>
                <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                  Создано {successResults.length} файлов
                </p>
              </div>
            </div>

            {/* Download Options */}
            {useZip ? (
              <div className="space-y-4">
                <h4 className="font-bold text-black dark:text-white">Скачать все файлы одним архивом:</h4>
                <button
                  onClick={downloadAllAsZip}
                  className="btn-privacy-modern text-lg px-8 py-4 w-full flex items-center justify-center gap-3"
                >
                  <Download className="w-5 h-5" />
                  Скачать ZIP архив ({successResults.length} файлов)
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="font-bold text-black dark:text-white">Скачать файлы по отдельности:</h4>
                <div className="space-y-3">
                  {successResults.map((result, index) => (
                    <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 rounded-xl flex items-center justify-center text-xl">
                          📄
                        </div>
                        <div>
                          <p className="font-black text-black dark:text-white">
                            {result.metadata?.pageNumber 
                              ? `Страница ${result.metadata.pageNumber}.pdf`
                              : result.metadata?.startPage && result.metadata?.endPage
                              ? `Страницы ${result.metadata.startPage}-${result.metadata.endPage}.pdf`
                              : `Файл ${index + 1}.pdf`}
                          </p>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Готово к скачиванию
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadFile(result, index)}
                        className="btn-privacy-modern text-sm px-6 py-3 flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Скачать
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reset Button */}
            <div className="flex justify-center pt-6 mt-6 border-t border-white/20 dark:border-gray-600/20">
              <button
                onClick={handleReset}
                className="btn-privacy-secondary text-lg px-8 py-4"
              >
                Разделить другой файл
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Show tool if active
    if (toolActive) {
      return (
        <ModernSplitTool
          files={files}
          onComplete={handleToolComplete}
          onClose={handleToolClose}
        />
      );
    }

    // Show upload interface
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Upload Zone */}
        <ModernUploadZone
          onFilesSelected={handleFileSelect}
          accept="application/pdf"
          acceptedTypes={['application/pdf']}
          multiple={false}
          maxSize={100 * 1024 * 1024}
          disabled={false}
          title="Загрузите PDF файл для разделения"
          subtitle="Извлекайте отдельные страницы или диапазоны из PDF документов"
          supportedFormats="PDF файлы"
        />
        
        {/* File List & Start Button */}
        {files.length > 0 && (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                ✂️
              </div>
              <div>
                <h3 className="text-xl font-black text-black dark:text-white">
                  Выбранный файл ({files.length})
                </h3>
                <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                  Готов к разделению
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-800 dark:to-red-700 rounded-xl flex items-center justify-center text-xl">
                      📄
                    </div>
                    <div>
                      <p className="font-black text-black dark:text-white">{file.name}</p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {(file.size / 1024 / 1024).toFixed(2)} МБ
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                    title="Удалить файл"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setToolActive(true)}
                className="btn-privacy-modern text-lg px-8 py-4 min-w-[250px] ripple-effect btn-press"
              >
                Разделить PDF файл ✂️
              </button>
            </div>
          </div>
        )}
      </div>
    );
  })();

  return (
    <StandardToolPageTemplate
      seoData={seoData}
      toolId="split-pdf"
      faqSchema={splitFAQs.map(faq => ({
        question: faq.question,
        answer: faq.answer
      }))}
      pageTitle="Разделить PDF файл бесплатно"
      pageDescription="Извлекайте отдельные страницы или диапазоны из PDF документов с полной конфиденциальностью. Быстро, безопасно, без загрузок на сервер."
      toolComponent={toolComponent}
      breadcrumbKey="split-pdf"
    />
  );
};

export default SplitPDFPage;