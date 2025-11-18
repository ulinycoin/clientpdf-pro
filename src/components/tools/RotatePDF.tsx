import React, { useState, useEffect } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PDFPreview } from '@/components/common/PDFPreview';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import pdfService from '@/services/pdfService';
import type { UploadedFile } from '@/types/pdf';
import type { Tool } from '@/types';
import { HASH_TOOL_MAP } from '@/types';

type RotationAngle = 90 | 180 | 270;
type PageSelection = 'all' | 'specific';

export const RotatePDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile, setSharedFile } = useSharedFile();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<Blob | null>(null);
  const [loadedFromShared, setLoadedFromShared] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);

  // Rotation settings
  const [rotationAngle, setRotationAngle] = useState<RotationAngle>(90);
  const [pageSelection, setPageSelection] = useState<PageSelection>('all');
  const [specificPages, setSpecificPages] = useState('');

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
      const fileName = file?.name.replace(/\.pdf$/i, '_rotated.pdf') || 'rotated.pdf';
      setSharedFile(result, fileName, 'rotate-pdf');
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

  const handleRotate = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setResult(null);
    setResultSaved(false);

    try {
      const maxPages = file.info?.pages || 0;
      let pagesToRotate: number[] = [];

      if (pageSelection === 'all') {
        pagesToRotate = Array.from({ length: maxPages }, (_, i) => i + 1);
      } else {
        pagesToRotate = parsePageNumbers(specificPages, maxPages);
        if (pagesToRotate.length === 0) {
          alert(t('rotate.invalidPages'));
          setIsProcessing(false);
          return;
        }
      }

      const rotateResult = await pdfService.rotatePDF(
        file.file,
        rotationAngle,
        pagesToRotate,
        (prog, msg) => {
          setProgress(prog);
          setProgressMessage(msg);
        }
      );

      if (rotateResult.success && rotateResult.data) {
        setResult(rotateResult.data);
      } else {
        alert(t('rotate.failed'));
      }
    } catch (error) {
      alert(t('rotate.failed'));
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const filename = file.name.replace('.pdf', '_rotated.pdf');
    pdfService.downloadFile(result, filename);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setResultSaved(false);
    setProgress(0);
    setProgressMessage('');
    setLoadedFromShared(false);
    setSpecificPages('');
  };

  const handleQuickAction = async (toolId: Tool) => {
    if (!result || !file) return;

    const filename = file.name.replace('.pdf', '_rotated.pdf');
    setSharedFile(result, filename, 'rotate-pdf');

    // Small delay to ensure state is updated before navigation
    await new Promise(resolve => setTimeout(resolve, 100));
    window.location.hash = HASH_TOOL_MAP[toolId];
  };

  const maxPages = file?.info?.pages || 1;

  return (
    <div className="rotate-pdf space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('tools.rotate-pdf.name')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('tools.rotate-pdf.description')}
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

      {/* File preview and rotation options */}
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
                  variant="ghost"
                  onClick={handleRemoveFile}
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
                  variant="ghost"
                  onClick={handleRemoveFile}
                  disabled={isProcessing}
                  className="mt-4 text-sm text-error-500 hover:text-error-600 disabled:opacity-50"
                >
                  {t('common.changeFile')}
                </Button>
              </div>
            </div>
          </Card>

          {/* Rotation settings */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {t('rotate.settings')}
            </h2>

            {/* Rotation angle selector */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                {t('rotate.selectAngle')}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setRotationAngle(90)}
                  disabled={isProcessing}
                  className={`p-6 rounded-xl border-2 transition-all h-auto flex flex-col ${
                    rotationAngle === 90
                      ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
                      : 'border-gray-200 dark:border-privacy-700 hover:border-ocean-300'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-4xl mb-2">↻</div>
                  <div className="font-semibold text-gray-900 dark:text-white">90°</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t('rotate.clockwise')}
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setRotationAngle(180)}
                  disabled={isProcessing}
                  className={`p-6 rounded-xl border-2 transition-all h-auto flex flex-col ${
                    rotationAngle === 180
                      ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
                      : 'border-gray-200 dark:border-privacy-700 hover:border-ocean-300'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-4xl mb-2">⇅</div>
                  <div className="font-semibold text-gray-900 dark:text-white">180°</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t('rotate.upsideDown')}
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setRotationAngle(270)}
                  disabled={isProcessing}
                  className={`p-6 rounded-xl border-2 transition-all h-auto flex flex-col ${
                    rotationAngle === 270
                      ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
                      : 'border-gray-200 dark:border-privacy-700 hover:border-ocean-300'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-4xl mb-2">↺</div>
                  <div className="font-semibold text-gray-900 dark:text-white">270°</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t('rotate.counterClockwise')}
                  </div>
                </Button>
              </div>
            </div>

            {/* Page selection */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                {t('rotate.selectPages')}
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Button
                  variant="outline"
                  onClick={() => setPageSelection('all')}
                  disabled={isProcessing}
                  className={`p-4 rounded-lg border-2 transition-all text-left h-auto flex flex-col items-start ${
                    pageSelection === 'all'
                      ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
                      : 'border-gray-200 dark:border-privacy-700 hover:border-ocean-300'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {t('rotate.allPages')}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t('rotate.rotateAllPages')}
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setPageSelection('specific')}
                  disabled={isProcessing}
                  className={`p-4 rounded-lg border-2 transition-all text-left h-auto flex flex-col items-start ${
                    pageSelection === 'specific'
                      ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
                      : 'border-gray-200 dark:border-privacy-700 hover:border-ocean-300'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {t('rotate.specificPages')}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t('rotate.choosePages')}
                  </div>
                </Button>
              </div>

              {pageSelection === 'specific' && (
                <div className="bg-gray-50 dark:bg-privacy-800 rounded-lg p-4">
                  <Label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('rotate.pageNumbers')}
                  </Label>
                  <Input
                    type="text"
                    value={specificPages}
                    onChange={(e) => setSpecificPages(e.target.value)}
                    placeholder="1,3,5-7,10"
                    disabled={isProcessing}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-privacy-900 border border-gray-300 dark:border-privacy-600 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {t('rotate.pageNumbersHint', { total: String(maxPages) })}
                  </p>
                </div>
              )}
            </div>

            {/* Rotate button */}
            <Button
              onClick={handleRotate}
              disabled={isProcessing || !file}
              className="btn btn-primary w-full text-lg py-3"
            >
              {isProcessing ? t('common.processing') : t('rotate.rotateButton')}
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
                {t('rotate.success')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('rotate.successDescription')}
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
                  className="btn btn-secondary"
                >
                  {t('rotate.rotateAnother')}
                </Button>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('rotate.quickActions.title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('rotate.quickActions.description')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Compress */}
              <Button
                variant="outline"
                onClick={() => handleQuickAction('compress-pdf')}
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group h-auto justify-start"
              >
                <span className="text-3xl">🗜️</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.compress-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('rotate.quickActions.compress')}
                  </p>
                </div>
              </Button>

              {/* Protect */}
              <Button
                variant="outline"
                onClick={() => handleQuickAction('protect-pdf')}
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group h-auto justify-start"
              >
                <span className="text-3xl">🔒</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.protect-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('rotate.quickActions.protect')}
                  </p>
                </div>
              </Button>

              {/* Watermark */}
              <Button
                variant="outline"
                onClick={() => handleQuickAction('watermark-pdf')}
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group h-auto justify-start"
              >
                <span className="text-3xl">💧</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.watermark-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('rotate.quickActions.watermark')}
                  </p>
                </div>
              </Button>

              {/* Split */}
              <Button
                variant="outline"
                onClick={() => handleQuickAction('split-pdf')}
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group h-auto justify-start"
              >
                <span className="text-3xl">✂️</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.split-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('rotate.quickActions.split')}
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
