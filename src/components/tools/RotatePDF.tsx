import React, { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PDFPreview } from '@/components/common/PDFPreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import pdfService from '@/services/pdfService';
import type { UploadedFile } from '@/types/pdf';
import { RotateCw, Repeat, FileStack, CheckCircle2 } from 'lucide-react';

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
    } catch {
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



  const maxPages = file?.info?.pages || 1;

  const renderContent = () => {
    if (!file) return null;

    if (result) {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('rotate.success')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('rotate.successDescription')}
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleDownload}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {t('common.download')}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
            >
              {t('rotate.rotateAnother')}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Auto-loaded indicator */}
        {loadedFromShared && (
          <div className="bg-ocean-50 dark:bg-ocean-900/20 border border-ocean-200 dark:border-ocean-800 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
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

        {/* File Preview Card */}
        <Card className="overflow-hidden border-ocean-100 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 relative group">
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                <PDFPreview file={file.file} width={160} height={220} />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                    {file.name}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <FileStack className="w-4 h-4" />
                      {file.info?.pages || 0} {t('common.pages')}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 self-center" />
                    <span>{pdfService.formatFileSize(file.size)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    disabled={isProcessing}
                    className="text-error-500 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20"
                  >
                    {t('common.changeFile')}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isProcessing && (
          <div className="mt-8">
            <ProgressBar progress={progress} message={progressMessage} />
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <RotateCw className="w-5 h-5 text-ocean-500" />
          {t('rotate.settings')}
        </h3>

        {/* Rotation Angle */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('rotate.selectAngle')}
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {[90, 180, 270].map((angle) => (
              <button
                key={angle}
                onClick={() => setRotationAngle(angle as RotationAngle)}
                disabled={isProcessing}
                className={`
                  p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2
                  ${rotationAngle === angle
                    ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20 text-ocean-700 dark:text-ocean-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-ocean-200 dark:hover:border-ocean-800 text-gray-600 dark:text-gray-400'
                  }
                `}
              >
                <div className="text-xl font-bold">{angle}°</div>
                <div className="text-[10px] uppercase tracking-wider font-medium opacity-70">
                  {angle === 90 ? 'CW' : angle === 180 ? 'FLIP' : 'CCW'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Page Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('rotate.selectPages')}
          </Label>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => setPageSelection('all')}
              disabled={isProcessing}
              className={`
                p-3 rounded-xl border-2 transition-all flex items-center gap-3 text-left
                ${pageSelection === 'all'
                  ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-ocean-200'
                }
              `}
            >
              <div className={`p-2 rounded-lg ${pageSelection === 'all' ? 'bg-ocean-100 dark:bg-ocean-800 text-ocean-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                <FileStack className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-sm text-gray-900 dark:text-white">{t('rotate.allPages')}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('rotate.rotateAllPages')}</div>
              </div>
            </button>

            <button
              onClick={() => setPageSelection('specific')}
              disabled={isProcessing}
              className={`
                p-3 rounded-xl border-2 transition-all flex items-center gap-3 text-left
                ${pageSelection === 'specific'
                  ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-ocean-200'
                }
              `}
            >
              <div className={`p-2 rounded-lg ${pageSelection === 'specific' ? 'bg-ocean-100 dark:bg-ocean-800 text-ocean-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                <Repeat className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-sm text-gray-900 dark:text-white">{t('rotate.specificPages')}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('rotate.choosePages')}</div>
              </div>
            </button>
          </div>
        </div>

        {/* Specific Pages Input */}
        {pageSelection === 'specific' && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 animate-in slide-in-from-top-2">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              {t('rotate.pageNumbers')}
            </Label>
            <Input
              type="text"
              value={specificPages}
              onChange={(e) => setSpecificPages(e.target.value)}
              placeholder="e.g. 1, 3, 5-10"
              disabled={isProcessing}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
            <p className="text-xs text-gray-500 mt-2">
              {t('rotate.pageNumbersHint', { total: String(maxPages) })}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderActions = () => {
    return (
      <Button
        onClick={handleRotate}
        disabled={isProcessing || !file}
        className="w-full py-6 text-lg rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
      >
        {isProcessing ? t('common.processing') : (
          <span className="flex items-center gap-2">
            <RotateCw className="w-5 h-5" />
            {t('rotate.rotateButton')}
          </span>
        )}
      </Button>
    );
  };

  return (
    <ToolLayout
      title={t('tools.rotate-pdf.name')}
      description={t('tools.rotate-pdf.description')}
      hasFiles={!!file}
      onUpload={handleFileSelected}
      isProcessing={isProcessing}
      maxFiles={1}
      uploadTitle={t('common.selectFile')}
      uploadDescription={t('upload.singleFileAllowed')}
      settings={!result ? renderSettings() : null}
      actions={!result ? renderActions() : null}
    >
      {renderContent()}
    </ToolLayout>
  );
};
