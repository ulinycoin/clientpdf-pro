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

type ConversionMode = 'formatted' | 'text';
type Quality = 1 | 2 | 3;

export const WordToPDF: React.FC = () => {
  const { t } = useI18n();
  const { setSharedFile: saveSharedFile } = useSharedFile();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<{ blob: Blob; originalSize: number; processedSize: number } | null>(null);

  // Conversion settings
  const [conversionMode, setConversionMode] = useState<ConversionMode>('formatted');
  const [quality, setQuality] = useState<Quality>(2);

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
        },
        { mode: conversionMode, quality }
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
    <div className="word-to-pdf space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('tools.word-to-pdf.name')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('tools.word-to-pdf.description')}
        </p>
      </div>

      {/* Upload Section */}
      {!file && !result && (
        <Card>
          <CardContent className="p-6">
            <FileUpload
              onFilesSelected={handleFileSelected}
              accept=".docx"
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

          {/* Conversion Mode Selection */}
          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t('wordToPdf.conversionMode') || 'Conversion Mode'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Formatted Mode */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  conversionMode === 'formatted'
                    ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-ocean-300 dark:hover:border-ocean-700'
                }`}
              >
                <input
                  type="radio"
                  name="conversionMode"
                  value="formatted"
                  checked={conversionMode === 'formatted'}
                  onChange={() => setConversionMode('formatted')}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {t('wordToPdf.withFormatting') || 'With Formatting'}
                    </span>
                    <span className="text-xs bg-ocean-500 text-white px-2 py-0.5 rounded-full">
                      {t('common.recommended') || 'Recommended'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {t('wordToPdf.formattingDescription') || 'Preserves images, tables, headings, and text styles'}
                  </p>
                </div>
              </label>

              {/* Text Only Mode */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  conversionMode === 'text'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <input
                  type="radio"
                  name="conversionMode"
                  value="text"
                  checked={conversionMode === 'text'}
                  onChange={() => setConversionMode('text')}
                  className="mt-1"
                />
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {t('wordToPdf.textOnly') || 'Text Only'}
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {t('wordToPdf.textDescription') || 'Extracts text only. Smaller file, faster conversion'}
                  </p>
                </div>
              </label>
            </div>

            {/* Quality selector for formatted mode */}
            {conversionMode === 'formatted' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {t('wordToPdf.quality') || 'Output Quality'}
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value) as Quality)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean-500"
                >
                  <option value={1}>{t('wordToPdf.qualityStandard') || 'Standard (faster, smaller file)'}</option>
                  <option value={2}>{t('wordToPdf.qualityHigh') || 'High Quality (balanced)'}</option>
                  <option value={3}>{t('wordToPdf.qualityMax') || 'Maximum (best quality, larger file)'}</option>
                </select>
              </div>
            )}
          </div>

          {/* Convert Button */}
          <Button
            onClick={handleConvert}
            disabled={isProcessing}
            className="mt-6 w-full"
          >
            {isProcessing ? t('common.processing') : t('wordToPdf.convert')}
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

          {/* Preview */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('common.preview')}
            </h3>
            <div className="flex justify-center">
              <PDFPreview blob={result.blob} width={600} height={800} />
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
                onClick={() => handleQuickAction('compress-pdf')}
                variant="outline"
                className="text-sm"
              >
                {t('tools.compress-pdf.name')}
              </Button>
              <Button
                onClick={() => handleQuickAction('protect-pdf')}
                variant="outline"
                className="text-sm"
              >
                {t('tools.protect-pdf.name')}
              </Button>
              <Button
                onClick={() => handleQuickAction('watermark-pdf')}
                variant="outline"
                className="text-sm"
              >
                {t('tools.watermark-pdf.name')}
              </Button>
              <Button
                onClick={() => handleQuickAction('split-pdf')}
                variant="outline"
                className="text-sm"
              >
                {t('tools.split-pdf.name')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
