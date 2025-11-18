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
import { Card } from '@/components/ui/card';

export const PDFToWord: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile } = useSharedFile();
  const [file, setFile] = useState<File | null>(sharedFile);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<{ blob: Blob; originalSize: number; processedSize: number } | null>(null);

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
        }
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
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('tools.pdf-to-word.name')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('tools.pdf-to-word.description')}
        </p>
      </div>

      {/* Upload Section */}
      {!file && !result && (
        <FileUpload
          onFilesSelected={handleFileSelected}
          accept=".pdf"
          multiple={false}
          maxFiles={1}
        />
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

          {/* Convert Button */}
          <Button
            onClick={handleConvert}
            disabled={isProcessing}
            className="mt-4 w-full"
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

          {/* Preview of original PDF */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('common.preview')} - Original PDF
            </h3>
            <div className="flex justify-center">
              <PDFPreview file={file} width={600} height={800} />
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
