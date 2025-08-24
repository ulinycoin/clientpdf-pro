import React, { useState } from 'react';
import { toolsSEOData } from '../../data/seoData';
import { StandardToolPageTemplate } from '../../components/templates';
import { ModernRotateTool } from '../../components/organisms';
import { ModernUploadZone } from '../../components/molecules';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useI18n } from '../../hooks/useI18n';
import { useDynamicSEO } from '../../hooks/useDynamicSEO';
import { getCombinedFAQs } from '../../data/faqData';
import { PDFProcessingResult } from '../../types';
import { Download, CheckCircle, RefreshCw } from 'lucide-react';

const RotatePDFPage: React.FC = () => {
  const { t } = useI18n();
  const seoData = toolsSEOData.rotate;
  const [toolActive, setToolActive] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);

  // Get FAQ data for SEO schema
  const rotateFAQs = getCombinedFAQs('rotate');

  // Dynamic SEO updates
  useDynamicSEO('rotate');

  const {
    files,
    addFiles,
    removeFile,
    clearFiles
  } = useFileUpload();

  const handleFileSelect = (selectedFiles: File[]) => {
    // Rotation tool works with single file
    addFiles([selectedFiles[0]]);
    if (selectedFiles.length > 0) {
      setToolActive(true);
    }
  };

  const handleToolComplete = (result: any) => {
    // ModernRotateTool passes PDFProcessingResult, not Blob directly
    if (result && result.success && result.data) {
      setResult(result.data as Blob);
    } else if (result instanceof Blob) {
      // Fallback if it's already a Blob
      setResult(result);
    }
    setToolActive(false);
  };

  const handleReset = () => {
    setResult(null);
    clearFiles();
  };

  const downloadFile = () => {
    if (result && result instanceof Blob) {
      try {
        const url = URL.createObjectURL(result);
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename for rotated file
        const originalName = files[0]?.name || 'document';
        const baseName = originalName.replace(/\.pdf$/i, '');
        const fileName = `${baseName}_rotated.pdf`;
        
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    } else {
      console.error('No valid blob result available for download');
    }
  };

  const handleToolClose = () => {
    setToolActive(false);
  };

  // Create the tool component based on state
  const toolComponent = (() => {
    // Show results if we have them
    if (result) {
      const originalSize = files[0]?.size || 0;
      const rotatedSize = result.size;
      
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
                  PDF успешно повернут!
                </h3>
                <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                  Ориентация страниц изменена
                </p>
              </div>
            </div>

            {/* Download Section */}
            <div className="space-y-4">
              <h4 className="font-bold text-black dark:text-white">Скачать повернутый файл:</h4>
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-800 dark:to-orange-700 rounded-xl flex items-center justify-center text-xl">
                    🔄
                  </div>
                  <div>
                    <p className="font-black text-black dark:text-white">
                      {files[0]?.name ? files[0].name.replace(/\.pdf$/i, '_rotated.pdf') : 'rotated.pdf'}
                    </p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {rotatedSize > 0 ? `${(rotatedSize / 1024 / 1024).toFixed(2)} МБ` : 'Готово к скачиванию'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={downloadFile}
                  className="btn-privacy-modern text-sm px-6 py-3 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Скачать
                </button>
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-center pt-6 mt-6 border-t border-white/20 dark:border-gray-600/20">
              <button
                onClick={handleReset}
                className="btn-privacy-secondary text-lg px-8 py-4"
              >
                Повернуть другой файл
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Show tool if active
    if (toolActive) {
      return (
        <ModernRotateTool
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
          title="Загрузите PDF файл для поворота"
          subtitle="Поворачивайте страницы PDF документов на 90°, 180° или 270°"
          supportedFormats="PDF файлы"
        />
        
        {/* File List & Start Button */}
        {files.length > 0 && (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                🔄
              </div>
              <div>
                <h3 className="text-xl font-black text-black dark:text-white">
                  Выбранный файл ({files.length})
                </h3>
                <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                  Готов к повороту
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-800 dark:to-orange-700 rounded-xl flex items-center justify-center text-xl">
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
                Повернуть PDF файл 🔄
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
      toolId="rotate-pdf"
      faqSchema={rotateFAQs.map(faq => ({
        question: faq.question,
        answer: faq.answer
      }))}
      pageTitle="Повернуть PDF страницы бесплатно"
      pageDescription="Поворачивайте страницы PDF документов на 90°, 180° или 270°. Исправьте ориентацию страниц быстро и бесплатно."
      toolComponent={toolComponent}
      breadcrumbKey="rotate-pdf"
    />
  );
};

export default RotatePDFPage;