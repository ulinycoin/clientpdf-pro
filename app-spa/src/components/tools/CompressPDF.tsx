import React, { useState, useEffect } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PDFPreview } from '@/components/common/PDFPreview';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import pdfService from '@/services/pdfService';
import type { UploadedFile } from '@/types/pdf';
import type { Tool } from '@/types';
import { HASH_TOOL_MAP } from '@/types';

type CompressionQuality = 'low' | 'medium' | 'high';

export const CompressPDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile, setSharedFile: saveSharedFile } = useSharedFile();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [quality, setQuality] = useState<CompressionQuality>('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<{ blob: Blob; metadata: any } | null>(null);
  const [loadedFromShared, setLoadedFromShared] = useState(false);

  // Auto-load file from shared state
  useEffect(() => {
    if (sharedFile && !file && !result) {
      // Convert Blob to File
      const sharedFileObj = new File([sharedFile.blob], sharedFile.name, {
        type: 'application/pdf',
      });

      const uploadedFile: UploadedFile = {
        id: `${Date.now()}`,
        file: sharedFileObj,
        name: sharedFile.name,
        size: sharedFileObj.size,
        status: 'pending',
      };

      setFile(uploadedFile);
      setLoadedFromShared(true);

      // Get PDF info
      pdfService.getPDFInfo(sharedFileObj).then((info) => {
        setFile((prev) => (prev ? { ...prev, info, status: 'completed' } : null));
      }).catch(() => {
        setFile((prev) =>
          prev ? { ...prev, status: 'error', error: 'Failed to read PDF' } : null
        );
      });

      // Clear shared file after loading
      clearSharedFile();
    }
  }, [sharedFile, file, result, clearSharedFile]);

  const handleFileSelected = async (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    if (!selectedFile) return;

    const uploadedFile: UploadedFile = {
      id: `${Date.now()}`,
      file: selectedFile,
      name: selectedFile.name,
      size: selectedFile.size,
      status: 'pending',
    };

    setFile(uploadedFile);

    // Get PDF info
    try {
      const info = await pdfService.getPDFInfo(selectedFile);
      setFile((prev) => (prev ? { ...prev, info, status: 'completed' } : null));
    } catch (error) {
      setFile((prev) =>
        prev ? { ...prev, status: 'error', error: 'Failed to read PDF' } : null
      );
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setResult(null);
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      const result = await pdfService.compressPDF(file.file, quality, (prog, msg) => {
        setProgress(prog);
        setProgressMessage(msg);
      });

      if (result.success && result.data) {
        setResult({ blob: result.data, metadata: result.metadata });
      } else {
        alert(result.error?.message || 'Compression failed');
      }
    } catch (error) {
      alert('An error occurred during compression');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result?.blob) {
      const filename = file?.name.replace('.pdf', '_compressed.pdf') || 'compressed.pdf';
      pdfService.downloadFile(result.blob, filename);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
    setProgressMessage('');
  };

  const handleQuickAction = (toolId: Tool) => {
    // Save the compressed PDF to shared state for the next tool
    if (result?.blob) {
      const filename = file?.name.replace('.pdf', '_compressed.pdf') || 'compressed.pdf';
      saveSharedFile(result.blob, filename, 'compress-pdf');
    }
    // Navigate to the selected tool
    window.location.hash = HASH_TOOL_MAP[toolId];
  };

  // Quality presets
  const qualityPresets: Array<{
    id: CompressionQuality;
    icon: string;
    reduction: string;
    description: string;
  }> = [
    {
      id: 'low',
      icon: '🗜️',
      reduction: '~70%',
      description: t('compress.quality.low.description'),
    },
    {
      id: 'medium',
      icon: '⚖️',
      reduction: '~50%',
      description: t('compress.quality.medium.description'),
    },
    {
      id: 'high',
      icon: '✨',
      reduction: '~30%',
      description: t('compress.quality.high.description'),
    },
  ];

  return (
    <div className="compress-pdf space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('tools.compress-pdf.name')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('tools.compress-pdf.description')}
        </p>
      </div>

      {/* Upload section */}
      {!file && !result && (
        <div className="card p-6">
          <FileUpload
            accept=".pdf"
            multiple={false}
            onFilesSelected={handleFileSelected}
            maxSizeMB={100}
            disabled={isProcessing}
          />
        </div>
      )}

      {/* File preview and quality selector */}
      {file && !result && (
        <div className="space-y-6">
          {/* Auto-loaded indicator */}
          {loadedFromShared && (
            <div className="bg-ocean-50 dark:bg-ocean-900/20 border border-ocean-200 dark:border-ocean-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <p className="font-medium text-ocean-700 dark:text-ocean-300">
                      {t('compress.autoLoaded.title')}
                    </p>
                    <p className="text-sm text-ocean-600 dark:text-ocean-400">
                      {t('compress.autoLoaded.description')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    clearSharedFile();
                    setFile(null);
                    setLoadedFromShared(false);
                  }}
                  className="text-ocean-600 dark:text-ocean-400 hover:text-ocean-800 dark:hover:text-ocean-200 font-semibold text-sm"
                >
                  ✕ {t('common.close')}
                </button>
              </div>
            </div>
          )}

          {/* File preview */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {t('compress.filePreview')}
            </h2>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <PDFPreview file={file.file} width={160} height={220} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  {file.name}
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    <span className="font-medium">{t('compress.originalSize')}:</span>{' '}
                    {pdfService.formatFileSize(file.size)}
                  </p>
                  {file.info && (
                    <p>
                      <span className="font-medium">{t('compress.pages')}:</span>{' '}
                      {file.info.pages}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleRemoveFile}
                  disabled={isProcessing}
                  className="mt-4 text-sm text-error-500 hover:text-error-600 disabled:opacity-50"
                >
                  {t('compress.changeFile')}
                </button>
              </div>
            </div>
          </div>

          {/* Quality selector */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {t('compress.selectQuality')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {qualityPresets.map((preset) => {
                const isSelected = quality === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setQuality(preset.id)}
                    disabled={isProcessing}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
                        : 'border-gray-200 dark:border-privacy-700 hover:border-ocean-300 dark:hover:border-ocean-700'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-4xl">{preset.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3
                            className={`font-semibold ${
                              isSelected
                                ? 'text-ocean-600 dark:text-ocean-400'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {t(`compress.quality.${preset.id}.name`)}
                          </h3>
                          <span
                            className={`text-sm font-bold ${
                              isSelected
                                ? 'text-ocean-600 dark:text-ocean-400'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {preset.reduction}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {preset.description}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="mt-3 flex items-center justify-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-ocean-100 dark:bg-ocean-900/40 text-ocean-600 dark:text-ocean-400 text-xs font-medium">
                          ✓ {t('compress.selected')}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Compress button */}
            <div className="mt-6">
              <button
                onClick={handleCompress}
                disabled={isProcessing || !file}
                className="btn btn-primary w-full text-lg py-3"
              >
                {isProcessing ? t('common.processing') : t('compress.compressButton')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      {isProcessing && (
        <div className="card p-6">
          <ProgressBar progress={progress} message={progressMessage} />
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Success card */}
          <div className="card p-8">
            <div className="text-center space-y-4">
              <div className="text-6xl">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('compress.success.title')}
              </h2>
              <div className="text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  {t('compress.success.originalSize')}:{' '}
                  <span className="font-semibold">
                    {pdfService.formatFileSize(result.metadata?.originalSize || 0)}
                  </span>
                </p>
                <p>
                  {t('compress.success.compressedSize')}:{' '}
                  <span className="font-semibold text-success-600 dark:text-success-400">
                    {pdfService.formatFileSize(result.metadata?.processedSize || 0)}
                  </span>
                </p>
                <p className="text-lg font-bold text-success-600 dark:text-success-400">
                  {t('compress.success.saved')}:{' '}
                  {result.metadata?.compressionRatio
                    ? `${result.metadata.compressionRatio}%`
                    : 'N/A'}
                </p>
                <p className="text-sm">
                  {t('compress.success.time')}:{' '}
                  {pdfService.formatTime(result.metadata?.processingTime || 0)}
                </p>
              </div>

              {/* Primary actions */}
              <div className="flex gap-3 justify-center mt-6 pt-4">
                <button onClick={handleDownload} className="btn btn-primary px-8">
                  📥 {t('common.download')}
                </button>
                <button onClick={handleReset} className="btn btn-secondary">
                  {t('compress.compressAnother')}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('compress.quickActions.title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('compress.quickActions.description')}
            </p>

            {/* Action buttons grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Protect */}
              <button
                onClick={() => handleQuickAction('protect-pdf')}
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group"
              >
                <span className="text-3xl">🔒</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.protect-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('compress.quickActions.protect')}
                  </p>
                </div>
              </button>

              {/* Merge */}
              <button
                onClick={() => handleQuickAction('merge-pdf')}
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group"
              >
                <span className="text-3xl">📑</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.merge-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('compress.quickActions.merge')}
                  </p>
                </div>
              </button>

              {/* Split */}
              <button
                onClick={() => handleQuickAction('split-pdf')}
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group"
              >
                <span className="text-3xl">✂️</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.split-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('compress.quickActions.split')}
                  </p>
                </div>
              </button>

              {/* Watermark */}
              <button
                onClick={() => handleQuickAction('watermark-pdf')}
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group"
              >
                <span className="text-3xl">💧</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.watermark-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('compress.quickActions.watermark')}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
