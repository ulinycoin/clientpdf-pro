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

export const FlattenPDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile, setSharedFile: saveSharedFile } = useSharedFile();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<{ blob: Blob; metadata: any } | null>(null);
  const [loadedFromShared, setLoadedFromShared] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);

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

  // Auto-save result to sharedFile when processing is complete
  useEffect(() => {
    if (result?.blob && !isProcessing && !resultSaved) {
      const fileName = file?.name.replace(/\.pdf$/i, '_flattened.pdf') || 'flattened.pdf';
      saveSharedFile(result.blob, fileName, 'flatten-pdf');
      setResultSaved(true);
    }
  }, [result, isProcessing, resultSaved, file?.name, saveSharedFile]);

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
    setResultSaved(false);
  };

  const handleFlatten = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setResult(null);
    setResultSaved(false);

    try {
      const result = await pdfService.flattenPDF(file.file, (prog, msg) => {
        setProgress(prog);
        setProgressMessage(msg);
      });

      if (result.success && result.data) {
        setResult({ blob: result.data, metadata: result.metadata });
      } else {
        alert(result.error?.message || 'Flattening failed');
      }
    } catch (error) {
      alert('An error occurred during flattening');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result?.blob) {
      const filename = file?.name.replace('.pdf', '_flattened.pdf') || 'flattened.pdf';
      pdfService.downloadFile(result.blob, filename);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setResultSaved(false);
    setProgress(0);
    setProgressMessage('');
  };

  const handleQuickAction = (toolId: Tool) => {
    if (result?.blob) {
      const filename = file?.name.replace('.pdf', '_flattened.pdf') || 'flattened.pdf';
      saveSharedFile(result.blob, filename, 'flatten-pdf');
    }
    window.location.hash = HASH_TOOL_MAP[toolId];
  };

  return (
    <div className="flatten-pdf space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('tools.flatten-pdf.name')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('tools.flatten-pdf.description')}
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

      {/* File preview and action button */}
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
                      {t('flatten.autoLoaded.title')}
                    </p>
                    <p className="text-sm text-ocean-600 dark:text-ocean-400">
                      {t('flatten.autoLoaded.description')}
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
              {t('flatten.filePreview')}
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
                    <span className="font-medium">{t('flatten.originalSize')}:</span>{' '}
                    {pdfService.formatFileSize(file.size)}
                  </p>
                  {file.info && (
                    <p>
                      <span className="font-medium">{t('flatten.pages')}:</span>{' '}
                      {file.info.pages}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleRemoveFile}
                  disabled={isProcessing}
                  className="mt-4 text-sm text-error-500 hover:text-error-600 disabled:opacity-50"
                >
                  {t('flatten.changeFile')}
                </button>
              </div>
            </div>
          </div>

          {/* Flatten button */}
          <div className="card p-6">
            <div className="mt-6">
              <button
                onClick={handleFlatten}
                disabled={isProcessing || !file}
                className="btn btn-primary w-full text-lg py-3"
              >
                {isProcessing ? t('common.processing') : t('flatten.flattenButton')}
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
                {t('flatten.success.title')}
              </h2>
              <div className="text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  {t('flatten.success.originalSize')}:{' '}
                  <span className="font-semibold">
                    {pdfService.formatFileSize(result.metadata?.originalSize || 0)}
                  </span>
                </p>
                <p>
                  {t('flatten.success.processedSize')}:{' '}
                  <span className="font-semibold text-success-600 dark:text-success-400">
                    {pdfService.formatFileSize(result.metadata?.processedSize || 0)}
                  </span>
                </p>
                <p className="text-sm">
                  {t('flatten.success.time')}:{' '}
                  {pdfService.formatTime(result.metadata?.processingTime || 0)}
                </p>
              </div>

              {/* Primary actions */}
              <div className="flex gap-3 justify-center mt-6 pt-4">
                <button onClick={handleDownload} className="btn btn-primary px-8">
                  📥 {t('common.download')}
                </button>
                <button onClick={handleReset} className="btn btn-secondary">
                  {t('flatten.flattenAnother')}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('flatten.quickActions.title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('flatten.quickActions.description')}
            </p>

            {/* Action buttons grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                    {t('flatten.quickActions.protect')}
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
                    {t('flatten.quickActions.merge')}
                  </p>
                </div>
              </button>

              {/* Compress */}
              <button
                onClick={() => handleQuickAction('compress-pdf')}
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group"
              >
                <span className="text-3xl">🗜️</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.compress-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('flatten.quickActions.compress')}
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
