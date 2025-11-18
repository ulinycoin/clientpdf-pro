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
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const DeletePagesPDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile, setSharedFile } = useSharedFile();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<Blob | null>(null);
  const [loadedFromShared, setLoadedFromShared] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);
  const [pagesToDelete, setPagesToDelete] = useState('');

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
      const fileName = file?.name.replace(/\.pdf$/i, '_deleted_pages.pdf') || 'deleted_pages.pdf';
      setSharedFile(result, fileName, 'delete-pages-pdf');
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

  const handleDelete = async () => {
    if (!file) return;

    const maxPages = file.info?.pages || 0;
    const pageNumbersToDelete = parsePageNumbers(pagesToDelete, maxPages);

    if (pageNumbersToDelete.length === 0) {
      alert(t('deletePages.invalidPages'));
      return;
    }

    if (pageNumbersToDelete.length >= maxPages) {
      alert(t('deletePages.cannotDeleteAll'));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);
    setResultSaved(false);

    try {
      // Use delete functionality to remove pages
      const deleteResult = await pdfService.deletePDF(
        file.file,
        pageNumbersToDelete,
        (prog, msg) => {
          setProgress(prog);
          setProgressMessage(msg);
        }
      );

      if (deleteResult.success && deleteResult.data) {
        setResult(deleteResult.data);
      } else {
        alert(t('deletePages.failed'));
      }
    } catch (error) {
      alert(t('deletePages.failed'));
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const filename = file.name.replace('.pdf', '_pages-deleted.pdf');
    pdfService.downloadFile(result, filename);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setResultSaved(false);
    setProgress(0);
    setProgressMessage('');
    setLoadedFromShared(false);
    setPagesToDelete('');
  };

  const handleQuickAction = async (toolId: Tool) => {
    if (!result || !file) return;

    const filename = file.name.replace('.pdf', '_pages-deleted.pdf');
    setSharedFile(result, filename, 'delete-pages-pdf');

    // Small delay to ensure state is updated before navigation
    await new Promise(resolve => setTimeout(resolve, 100));
    window.location.hash = HASH_TOOL_MAP[toolId];
  };

  const maxPages = file?.info?.pages || 1;

  return (
    <div className="delete-pages-pdf space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('tools.delete-pages-pdf.name')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('tools.delete-pages-pdf.description')}
        </p>
      </div>

      {/* Upload section */}
      {!file && !result && (
        <Card className="p-6">
          <FileUpload
            accept=".pdf"
            multiple={false}
            onFilesSelected={handleFileSelected}
            maxSizeMB={100}
            disabled={isProcessing}
          />
        </Card>
      )}

      {/* File preview and delete options */}
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
                <Button
                  onClick={handleRemoveFile}
                  variant="ghost"
                  className="text-ocean-600 dark:text-ocean-400 hover:text-ocean-800 dark:hover:text-ocean-200 font-semibold text-sm"
                >
                  ✕ {t('common.close')}
                </Button>
              </div>
            </div>
          )}

          {/* File preview */}
          <Card className="p-6">
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
                <Button
                  onClick={handleRemoveFile}
                  disabled={isProcessing}
                  variant="ghost"
                  className="mt-4 text-sm text-error-500 hover:text-error-600 disabled:opacity-50"
                >
                  {t('common.changeFile')}
                </Button>
              </div>
            </div>
          </Card>

          {/* Delete settings */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {t('deletePages.selectPages')}
            </h2>

            <div className="bg-gray-50 dark:bg-privacy-800 rounded-lg p-4 mb-4">
              <Label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t('deletePages.pagesToDelete')}
              </Label>
              <Input
                type="text"
                value={pagesToDelete}
                onChange={(e) => setPagesToDelete(e.target.value)}
                placeholder="1,3,5-7,10"
                disabled={isProcessing}
                className="w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {t('deletePages.hint', { total: String(maxPages) })}
              </p>
            </div>

            {/* Warning */}
            <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-medium text-warning-700 dark:text-warning-300">
                    {t('deletePages.warning')}
                  </p>
                  <p className="text-sm text-warning-600 dark:text-warning-400 mt-1">
                    {t('deletePages.warningDescription')}
                  </p>
                </div>
              </div>
            </div>

            {/* Delete button */}
            <Button
              onClick={handleDelete}
              disabled={isProcessing || !file || !pagesToDelete}
              className="btn btn-primary w-full text-lg py-3"
            >
              {isProcessing ? t('common.processing') : t('deletePages.deleteButton')}
            </Button>
          </Card>
        </div>
      )}

      {/* Progress */}
      {isProcessing && (
        <Card className="p-6">
          <ProgressBar progress={progress} message={progressMessage} />
        </Card>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-6">
          <Card className="p-8">
            <div className="text-center space-y-4">
              <div className="text-6xl">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('deletePages.success')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('deletePages.successDescription')}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 pt-4">
                <Button
                  onClick={handleDownload}
                  className="btn btn-primary px-8"
                >
                  📥 {t('common.download')}
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="btn btn-secondary"
                >
                  {t('deletePages.deleteAnother')}
                </Button>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('deletePages.quickActions.title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('deletePages.quickActions.description')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Compress */}
              <Button
                onClick={() => handleQuickAction('compress-pdf')}
                variant="outline"
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group h-auto"
              >
                <span className="text-3xl">🗜️</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.compress-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('deletePages.quickActions.compress')}
                  </p>
                </div>
              </Button>

              {/* Protect */}
              <Button
                onClick={() => handleQuickAction('protect-pdf')}
                variant="outline"
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group h-auto"
              >
                <span className="text-3xl">🔒</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.protect-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('deletePages.quickActions.protect')}
                  </p>
                </div>
              </Button>

              {/* Watermark */}
              <Button
                onClick={() => handleQuickAction('watermark-pdf')}
                variant="outline"
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group h-auto"
              >
                <span className="text-3xl">💧</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.watermark-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('deletePages.quickActions.watermark')}
                  </p>
                </div>
              </Button>

              {/* Merge */}
              <Button
                onClick={() => handleQuickAction('merge-pdf')}
                variant="outline"
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group h-auto"
              >
                <span className="text-3xl">📎</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.merge-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('deletePages.quickActions.merge')}
                  </p>
                </div>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
