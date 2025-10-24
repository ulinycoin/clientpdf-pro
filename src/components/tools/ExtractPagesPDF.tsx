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

export const ExtractPagesPDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile, setSharedFile } = useSharedFile();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<Blob | null>(null);
  const [loadedFromShared, setLoadedFromShared] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);
  const [pagesToExtract, setPagesToExtract] = useState('');

  // Auto-load file from shared state
  useEffect(() => {
    if (sharedFile && !file && !result) {
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

      pdfService.getPDFInfo(sharedFileObj).then((info) => {
        setFile((prev) => (prev ? { ...prev, info, status: 'completed' } : null));
      }).catch(() => {
        setFile((prev) =>
          prev ? { ...prev, status: 'error', error: 'Failed to read PDF' } : null
        );
      });

      clearSharedFile();
    }
  }, [sharedFile, file, result, clearSharedFile]);

  // Auto-save result to sharedFile when processing is complete
  useEffect(() => {
    if (result && !isProcessing && !resultSaved) {
      const fileName = file?.name.replace(/\.pdf$/i, '_extracted_pages.pdf') || 'extracted_pages.pdf';
      setSharedFile(result, fileName, 'extract-pages-pdf');
      setResultSaved(true);
    }
  }, [result, isProcessing, resultSaved, file?.name, setSharedFile]);

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

  const parsePageNumbers = (input: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const parts = input.split(',').map(p => p.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
            pages.add(i);
          }
        }
      } else {
        const pageNum = parseInt(part);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
          pages.add(pageNum);
        }
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleExtract = async () => {
    if (!file) return;

    const maxPages = file.info?.pages || 0;
    const pageNumbers = parsePageNumbers(pagesToExtract, maxPages);

    if (pageNumbers.length === 0) {
      alert(t('extractPages.invalidPages'));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);
    setResultSaved(false);

    try {
      // Use split functionality with custom pages
      const extractResult = await pdfService.extractPDF(
        file.file,
        pageNumbers,
        (prog, msg) => {
          setProgress(prog);
          setProgressMessage(msg);
        }
      );

      if (extractResult.success && extractResult.data) {
        setResult(extractResult.data);
      } else {
        alert(t('extractPages.failed'));
      }
    } catch (error) {
      alert(t('extractPages.failed'));
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const filename = file.name.replace('.pdf', '_extracted.pdf');
    pdfService.downloadFile(result, filename);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setResultSaved(false);
    setProgress(0);
    setProgressMessage('');
    setLoadedFromShared(false);
    setPagesToExtract('');
  };

  const handleQuickAction = async (toolId: Tool) => {
    if (!result || !file) return;

    const filename = file.name.replace('.pdf', '_extracted.pdf');
    setSharedFile(result, filename, 'extract-pages-pdf');

    // Small delay to ensure state is updated before navigation
    await new Promise(resolve => setTimeout(resolve, 100));
    window.location.hash = HASH_TOOL_MAP[toolId];
  };

  const maxPages = file?.info?.pages || 1;

  return (
    <div className="extract-pages-pdf space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('tools.extract-pages-pdf.name')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('tools.extract-pages-pdf.description')}
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

      {/* File preview and extract options */}
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
                      {t('common.autoLoaded')}
                    </p>
                    <p className="text-sm text-ocean-600 dark:text-ocean-400">
                      {t('common.autoLoadedDescription')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
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
              {t('common.filePreview')}
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
                    <span className="font-medium">{t('common.totalPages')}:</span>{' '}
                    {file.info?.pages || 0}
                  </p>
                  <p>
                    <span className="font-medium">{t('common.fileSize')}:</span>{' '}
                    {pdfService.formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={handleRemoveFile}
                  disabled={isProcessing}
                  className="mt-4 text-sm text-error-500 hover:text-error-600 disabled:opacity-50"
                >
                  {t('common.changeFile')}
                </button>
              </div>
            </div>
          </div>

          {/* Extract settings */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {t('extractPages.selectPages')}
            </h2>

            <div className="bg-gray-50 dark:bg-privacy-800 rounded-lg p-4 mb-4">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t('extractPages.pagesToExtract')}
              </label>
              <input
                type="text"
                value={pagesToExtract}
                onChange={(e) => setPagesToExtract(e.target.value)}
                placeholder="1,3,5-7,10"
                disabled={isProcessing}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-privacy-900 border border-gray-300 dark:border-privacy-600 focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {t('extractPages.hint', { total: String(maxPages) })}
              </p>
            </div>

            {/* Info */}
            <div className="bg-ocean-50 dark:bg-ocean-900/20 border border-ocean-200 dark:border-ocean-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <p className="font-medium text-ocean-700 dark:text-ocean-300">
                    {t('extractPages.info')}
                  </p>
                  <p className="text-sm text-ocean-600 dark:text-ocean-400 mt-1">
                    {t('extractPages.infoDescription')}
                  </p>
                </div>
              </div>
            </div>

            {/* Extract button */}
            <button
              onClick={handleExtract}
              disabled={isProcessing || !file || !pagesToExtract}
              className="btn btn-primary w-full text-lg py-3"
            >
              {isProcessing ? t('common.processing') : t('extractPages.extractButton')}
            </button>
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
          <div className="card p-8">
            <div className="text-center space-y-4">
              <div className="text-6xl">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('extractPages.success')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('extractPages.successDescription')}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 pt-4">
                <button
                  onClick={handleDownload}
                  className="btn btn-primary px-8"
                >
                  📥 {t('common.download')}
                </button>
                <button
                  onClick={handleReset}
                  className="btn btn-secondary"
                >
                  {t('extractPages.extractAnother')}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('extractPages.quickActions.title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('extractPages.quickActions.description')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                    {t('extractPages.quickActions.compress')}
                  </p>
                </div>
              </button>

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
                    {t('extractPages.quickActions.protect')}
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
                    {t('extractPages.quickActions.watermark')}
                  </p>
                </div>
              </button>

              {/* Merge */}
              <button
                onClick={() => handleQuickAction('merge-pdf')}
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group"
              >
                <span className="text-3xl">📎</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.merge-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('extractPages.quickActions.merge')}
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
