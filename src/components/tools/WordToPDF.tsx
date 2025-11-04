import React, { useState } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PDFPreview } from '@/components/common/PDFPreview';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import pdfService from '@/services/pdfService';
import type { Tool } from '@/types';
import { HASH_TOOL_MAP } from '@/types';

export const WordToPDF: React.FC = () => {
  const { t } = useI18n();
  const { setSharedFile: saveSharedFile } = useSharedFile();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<{ blob: Blob; originalSize: number; processedSize: number } | null>(null);

  const handleFileSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];

      // Validate file type
      if (!selectedFile.name.toLowerCase().endsWith('.docx')) {
        alert(t('wordToPdf.errors.invalidFormat'));
        return;
      }

      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      alert(t('wordToPdf.errors.noFile'));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      const conversionResult = await pdfService.wordToPDF(
        file,
        (prog, msg) => {
          setProgress(prog);
          setProgressMessage(msg);
        }
      );

      if (conversionResult.success && conversionResult.blob) {
        setResult({
          blob: conversionResult.blob,
          originalSize: conversionResult.originalSize || 0,
          processedSize: conversionResult.processedSize || 0,
        });
      } else {
        alert(conversionResult.error?.message || t('wordToPdf.errors.conversionFailed'));
      }
    } catch (error) {
      alert(t('wordToPdf.errors.conversionFailed'));
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result?.blob) {
      const fileName = file?.name.replace(/\.\w+$/, '.pdf') || 'converted.pdf';
      pdfService.downloadFile(result.blob, fileName);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
    setProgressMessage('');
  };

  const handleQuickAction = (toolId: Tool) => {
    if (result?.blob) {
      const fileName = file?.name.replace(/\.\w+$/, '.pdf') || 'converted.pdf';
      saveSharedFile(result.blob, fileName, 'word-to-pdf');
    }
    window.location.hash = HASH_TOOL_MAP[toolId];
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('tools.word-to-pdf.name')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('tools.word-to-pdf.description')}
        </p>
      </div>

      {/* Upload Section */}
      {!file && !result && (
        <FileUpload
          onFilesSelected={handleFileSelected}
          accept=".docx"
          multiple={false}
          maxFiles={1}
        />
      )}

      {/* File Info */}
      {file && !result && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {t('common.selectedFile')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{file.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {formatFileSize(file.size)}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="ml-4 px-4 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              {t('common.remove')}
            </button>
          </div>

          {/* Convert Button */}
          <button
            onClick={handleConvert}
            disabled={isProcessing}
            className="mt-4 w-full px-6 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? t('common.processing') : t('wordToPdf.convert')}
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {isProcessing && (
        <div className="mb-6">
          <ProgressBar progress={progress} message={progressMessage} />
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('common.originalSize')}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatFileSize(result.originalSize)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('common.newSize')}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatFileSize(result.processedSize)}
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('common.preview')}
            </h3>
            <div className="flex justify-center">
              <PDFPreview blob={result.blob} width={600} height={800} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 px-6 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors"
            >
              {t('common.download')}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('common.convertAnother')}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('common.quickActions')}
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => handleQuickAction('compress-pdf')}
                className="px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('tools.compress-pdf.name')}
              </button>
              <button
                onClick={() => handleQuickAction('protect-pdf')}
                className="px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('tools.protect-pdf.name')}
              </button>
              <button
                onClick={() => handleQuickAction('watermark-pdf')}
                className="px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('tools.watermark-pdf.name')}
              </button>
              <button
                onClick={() => handleQuickAction('split-pdf')}
                className="px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('tools.split-pdf.name')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
