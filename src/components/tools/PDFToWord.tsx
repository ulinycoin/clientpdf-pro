import React, { useState } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PDFPreview } from '@/components/common/PDFPreview';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import pdfService from '@/services/pdfService';
import type { Tool } from '@/types';
import { HASH_TOOL_MAP } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const PDFToWord: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile } = useSharedFile();
  const [file, setFile] = useState<File | null>(sharedFile);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<{ blob: Blob; originalSize: number; processedSize: number } | null>(null);

  // Conversion options
  const [smartHeadings, setSmartHeadings] = useState(true);

  React.useEffect(() => {
    if (sharedFile) {
      clearSharedFile();
    }
  }, []);

  const handleFileSelected = async (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];

      // Validate PDF
      const isValid = await pdfService.validatePDF(selectedFile);
      if (!isValid) {
        alert(t('pdfToWord.errors.invalidPdf'));
        return;
      }

      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      alert(t('pdfToWord.errors.noFile'));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      const conversionResult = await pdfService.pdfToWord(
        file,
        (prog, msg) => {
          setProgress(prog);
          setProgressMessage(msg);
        },
        { includeImages: false, smartHeadings }
      );

      if (conversionResult.success && conversionResult.blob) {
        setResult({
          blob: conversionResult.blob,
          originalSize: conversionResult.originalSize || 0,
          processedSize: conversionResult.processedSize || 0,
        });
      } else {
        alert(conversionResult.error?.message || t('pdfToWord.errors.conversionFailed'));
      }
    } catch (error) {
      alert(t('pdfToWord.errors.conversionFailed'));
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result?.blob) {
      const fileName = file?.name.replace(/\.pdf$/i, '.docx') || 'converted.docx';
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
    <div className="pdf-to-word space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('tools.pdf-to-word.name')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('tools.pdf-to-word.description')}
        </p>
      </div>

      {/* Upload Section */}
      {!file && !result && (
        <Card>
          <CardContent className="p-6">
            <FileUpload
              onFilesSelected={handleFileSelected}
              accept=".pdf"
              multiple={false}
              maxFiles={1}
            />
          </CardContent>
        </Card>
      )}

      {/* File Info */}
      {file && !result && (
        <Card className="mb-6 p-4">
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
            <Button
              onClick={handleReset}
              variant="ghost"
              className="ml-4 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              {t('common.remove')}
            </Button>
          </div>

          {/* Conversion Options */}
          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t('pdfToWord.options') || 'Conversion Options'}
            </h3>

            {/* Smart Headings */}
            <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-ocean-300 dark:hover:border-ocean-700 transition-all">
              <input
                type="checkbox"
                checked={smartHeadings}
                onChange={(e) => setSmartHeadings(e.target.checked)}
                className="mt-1 w-4 h-4 text-ocean-600 rounded focus:ring-ocean-500"
              />
              <div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {t('pdfToWord.smartHeadings') || 'Smart Headings'}
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {t('pdfToWord.smartHeadingsDescription') || 'Detect headings by font size and apply Word heading styles'}
                </p>
              </div>
            </label>
          </div>

          {/* Convert Button */}
          <Button
            onClick={handleConvert}
            disabled={isProcessing}
            className="mt-6 w-full"
          >
            {isProcessing ? t('common.processing') : t('pdfToWord.convert')}
          </Button>
        </Card>
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
          {/* Document Preview */}
          <Card className="p-6">
            <div className="flex items-center gap-6">
              {/* Word Document Icon */}
              <div className="flex-shrink-0 w-24 h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex flex-col items-center justify-center text-white shadow-lg">
                <svg className="w-12 h-12 mb-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M9.5,11.5L11.5,17H12.5L14.5,11.5H13.5L12,15.5L10.5,11.5H9.5Z" />
                </svg>
                <span className="text-xs font-medium">.DOCX</span>
              </div>

              {/* Document Info */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {file?.name.replace(/\.pdf$/i, '.docx') || 'converted.docx'}
                </h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p>{t('pdfToWord.readyToDownload') || 'Your Word document is ready to download'}</p>
                  <p className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    {t('pdfToWord.conversionComplete') || 'Conversion complete'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <Card className="grid grid-cols-2 gap-4 p-4">
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
          </Card>

          {/* Success Message */}
          <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-600 dark:text-green-400 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-green-800 dark:text-green-200">
                {t('pdfToWord.success')}
              </p>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleDownload}
              className="flex-1"
            >
              {t('common.download')}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
            >
              {t('common.convertAnother')}
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('common.quickActions')}
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Button
                onClick={() => handleQuickAction('word-to-pdf')}
                variant="outline"
                className="text-sm"
              >
                {t('tools.word-to-pdf.name')}
              </Button>
              <Button
                onClick={() => handleQuickAction('merge-pdf')}
                variant="outline"
                className="text-sm"
              >
                {t('tools.merge-pdf.name')}
              </Button>
              <Button
                onClick={() => handleQuickAction('split-pdf')}
                variant="outline"
                className="text-sm"
              >
                {t('tools.split-pdf.name')}
              </Button>
              <Button
                onClick={() => handleQuickAction('compress-pdf')}
                variant="outline"
                className="text-sm"
              >
                {t('tools.compress-pdf.name')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
