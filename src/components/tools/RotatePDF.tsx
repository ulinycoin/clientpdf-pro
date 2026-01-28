import React, { useState, useEffect, useCallback } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';
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
import { RotateCw, Repeat, FileStack, CheckCircle2, Files, Scissors, ZoomIn, ZoomOut, Maximize, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

type RotationAngle = 0 | 90 | 180 | 270;
type PageSelection = 'all' | 'specific';

interface RotateUploadedFile extends UploadedFile {
  rotation: RotationAngle;
  previewPage: number;
}

export const RotatePDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFiles, clearSharedFiles, setSharedFile } = useSharedFile();
  const [files, setFiles] = useState<RotateUploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [results, setResults] = useState<Array<{ blob: Blob; filename: string; pages: number; originalSize: number }>>([]);
  const [hasLoadedSharedFiles, setHasLoadedSharedFiles] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);

  // Rotation settings
  const [rotationAngle, setRotationAngle] = useState<RotationAngle>(90);
  const [pageSelection, setPageSelection] = useState<PageSelection>('all');
  const [specificPages, setSpecificPages] = useState('');
  const [zoomScale, setZoomScale] = useState(1);

  const handleFilesSelected = useCallback(async (selectedFiles: File[], replaceExisting = false) => {
    const uploadedFiles: RotateUploadedFile[] = selectedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      name: file.name,
      size: file.size,
      status: 'pending' as const,
      rotation: 0,
      previewPage: 1,
    }));

    setFiles((prev) => replaceExisting ? uploadedFiles : [...prev, ...uploadedFiles]);
    setResults([]);
    setResultSaved(false);

    // Get PDF info for each file
    for (const uploadedFile of uploadedFiles) {
      try {
        const info = await pdfService.getPDFInfo(uploadedFile.file);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id ? { ...f, info, status: 'completed' as const } : f
          )
        );
      } catch {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? { ...f, status: 'error' as const, error: 'Failed to read PDF' }
              : f
          )
        );
      }
    }
  }, []);

  // Auto-load shared files from WelcomeScreen or other tools
  useEffect(() => {
    if (sharedFiles && sharedFiles.files.length > 0 && !hasLoadedSharedFiles) {
      const loadedFiles = sharedFiles.files.map(sf =>
        new File([sf.blob], sf.name, { type: sf.blob.type })
      );
      handleFilesSelected(loadedFiles, true);
      clearSharedFiles();
      setHasLoadedSharedFiles(true);
    }
  }, [sharedFiles, hasLoadedSharedFiles, clearSharedFiles, handleFilesSelected]);

  // Auto-save first result to sharedFile for quick actions
  useEffect(() => {
    if (results.length === 1 && !isProcessing && !resultSaved) {
      setSharedFile(results[0].blob, results[0].filename, 'rotate-pdf');
      setResultSaved(true);
    }
  }, [results, isProcessing, resultSaved, setSharedFile]);


  const handleRotateFile = (id: string, direction: 'cw' | 'ccw') => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        const currentRotation = f.rotation || 0;
        const nextRotation = (direction === 'cw'
          ? (currentRotation + 90) % 360
          : (currentRotation - 90 + 360) % 360) as RotationAngle;
        return { ...f, rotation: nextRotation };
      })
    );
  };

  const handlePageChange = (id: string, delta: number) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== id || !f.info) return f;
        const nextPage = Math.min(Math.max(1, f.previewPage + delta), f.info.pages);
        return { ...f, previewPage: nextPage };
      })
    );
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (files.length <= 1) {
      setResults([]);
    }
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
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    setResultSaved(false);

    try {
      const processedResults = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.status !== 'completed' || !file.info) continue;

        const maxPages = file.info.pages;
        let pagesToRotate: number[] = [];

        if (pageSelection === 'all') {
          pagesToRotate = Array.from({ length: maxPages }, (_, idx) => idx + 1);
        } else {
          pagesToRotate = parsePageNumbers(specificPages, maxPages);
          if (pagesToRotate.length === 0) {
            toast.error(`${t('rotate.invalidPages')} (${file.name})`);
            continue;
          }
        }

        const rotateResult = await pdfService.rotatePDF(
          file.file,
          pageSelection === 'all' ? (file.rotation || rotationAngle) : rotationAngle,
          pagesToRotate,
          (prog) => {
            const overallProgress = (i / files.length) * 100 + (prog / files.length);
            setProgress(overallProgress);
            setProgressMessage(`Processing ${file.name}...`);
          }
        );

        if (rotateResult.success && rotateResult.data) {
          processedResults.push({
            blob: rotateResult.data,
            filename: file.name.replace(/\.pdf$/i, '_rotated.pdf'),
            pages: maxPages,
            originalSize: file.size
          });
        }
      }

      if (processedResults.length > 0) {
        setResults(processedResults);
        toast.success(t('rotate.success'));
      } else {
        toast.error(t('rotate.failed'));
      }
    } catch (error) {
      toast.error(t('rotate.failed'));
      console.error(error);
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const handleDownload = () => {
    if (results.length === 0) return;

    if (results.length === 1) {
      pdfService.downloadFile(results[0].blob, results[0].filename);
    } else {
      setProgress(0);
      setProgressMessage('Creating ZIP archive...');
      pdfService.downloadAsZip(
        results.map(r => ({ blob: r.blob, filename: r.filename })),
        'rotated_pdfs.zip',
        (prog) => setProgress(prog)
      ).then(() => {
        toast.success('ZIP archive downloaded');
      }).catch(() => {
        toast.error('Failed to create ZIP archive');
      });
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResults([]);
    setResultSaved(false);
    setProgress(0);
    setProgressMessage('');
    setSpecificPages('');
    setHasLoadedSharedFiles(false);
  };


  const renderContent = () => {
    if (files.length === 0) return null;

    if (results.length > 0) {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('rotate.success')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {results.length === 1
                ? t('rotate.successDescription')
                : t('split.success.filesCreated', { count: results.length })}
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleDownload}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all gap-2"
            >
              {results.length > 1 ? <FileStack className="w-5 h-5" /> : <Download className="w-5 h-5" />}
              {results.length > 1 ? t('common.downloadAll') : t('common.download')}
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
      <div className="space-y-8">
        <div className="flex flex-col gap-12 max-w-4xl mx-auto">
          {files.map((file, index) => (
            <div key={file.id} className="relative group w-full">
              <Card className="p-8 hover:shadow-2xl transition-all duration-300 relative border-transparent hover:border-ocean-200 dark:hover:border-ocean-800 bg-white dark:bg-privacy-800 shadow-xl overflow-hidden">
                <div className="mb-8 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 relative overflow-hidden group/preview min-h-[600px]">
                  <div
                    className="transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) origin-center shadow-2xl relative"
                    style={{ transform: `rotate(${file.rotation}deg)` }}
                  >
                    <PDFPreview
                      file={file.file}
                      width={450 * zoomScale}
                      height={600 * zoomScale}
                      pageNumber={file.previewPage}
                    />
                  </div>

                  {/* Page Navigation Overlay */}
                  {file.info && file.info.pages > 1 && (
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-12 w-12 rounded-full shadow-lg pointer-events-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border hover:scale-110 transition-transform disabled:opacity-30"
                        onClick={() => handlePageChange(file.id, -1)}
                        disabled={file.previewPage <= 1}
                        title={t('rotate.prevPage')}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-12 w-12 rounded-full shadow-lg pointer-events-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border hover:scale-110 transition-transform disabled:opacity-30"
                        onClick={() => handlePageChange(file.id, 1)}
                        disabled={file.previewPage >= file.info.pages}
                        title={t('rotate.nextPage')}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    </div>
                  )}

                  {/* Individual Rotation Controls Overlay */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover/preview:opacity-100 transition-opacity bg-white/95 dark:bg-gray-800/95 rounded-2xl p-2 backdrop-blur-xl shadow-2xl border border-gray-100 dark:border-gray-700">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 text-ocean-600 dark:text-ocean-400 hover:bg-ocean-50 dark:hover:bg-ocean-900/40 rounded-xl"
                      onClick={() => handleRotateFile(file.id, 'ccw')}
                      title={t('rotate.counterClockwise')}
                    >
                      <RotateCw className="h-5 w-5 transform -scale-x-100" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 text-ocean-600 dark:text-ocean-400 hover:bg-ocean-50 dark:hover:bg-ocean-900/40 rounded-xl"
                      onClick={() => handleRotateFile(file.id, 'cw')}
                      title={t('rotate.clockwise')}
                    >
                      <RotateCw className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Zoom Controls Overlay */}
                  <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover/preview:opacity-100 transition-opacity bg-white/95 dark:bg-gray-800/95 rounded-2xl p-2 backdrop-blur-xl shadow-2xl border border-gray-100 dark:border-gray-700">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                      onClick={() => setZoomScale(prev => Math.max(0.5, prev - 0.25))}
                      title={t('common.zoomOut')}
                    >
                      <ZoomOut className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                      onClick={() => setZoomScale(1)}
                      title={t('common.reset')}
                    >
                      <Maximize className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                      onClick={() => setZoomScale(prev => Math.min(2, prev + 0.25))}
                      title={t('common.zoomIn')}
                    >
                      <ZoomIn className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Page Indicator Overlay */}
                  {file.info && (
                    <div className="absolute bottom-4 left-4 bg-ocean-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg backdrop-blur-md opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center gap-2">
                      <FileStack className="w-4 h-4" />
                      {file.previewPage} / {file.info.pages}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-6">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-xl font-bold truncate text-gray-900 dark:text-gray-100 flex items-center gap-3" title={file.name}>
                      <Badge variant="secondary" className="bg-ocean-100 dark:bg-ocean-900/40 text-ocean-700 dark:text-ocean-300 text-base py-1 px-3 rounded-lg">
                        {index + 1}
                      </Badge>
                      {file.name}
                    </p>
                    {file.info && (
                      <p className="text-sm text-ocean-600 dark:text-ocean-400 font-semibold mt-1 flex items-center gap-2">
                        <Files className="w-4 h-4" />
                        {file.info.pages} {t('common.pages')} • {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>

                  {!isProcessing && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-14 w-14 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl"
                      onClick={() => handleRemoveFile(file.id)}
                    >
                      <Scissors className="h-6 w-6" />
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>

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
            {pageSelection === 'all' ? t('rotate.applyToAll') : t('rotate.selectAngle')}
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {[0, 90, 180, 270].map((angle) => (
              <button
                key={angle}
                onClick={() => {
                  setRotationAngle(angle as RotationAngle);
                  if (pageSelection === 'all') {
                    setFiles(prev => prev.map(f => ({ ...f, rotation: angle as RotationAngle })));
                  }
                }}
                disabled={isProcessing}
                className={`
                  p-2 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1
                  ${rotationAngle === angle
                    ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20 text-ocean-700 dark:text-ocean-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-ocean-200 dark:hover:border-ocean-800 text-gray-600 dark:text-gray-400'
                  }
                `}
              >
                <div className="text-sm font-bold">{angle}°</div>
                <div className="text-[8px] uppercase tracking-wider font-medium opacity-70">
                  {angle === 0 ? 'RESET' : angle === 90 ? 'CW' : angle === 180 ? 'FLIP' : 'CCW'}
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
              {t('rotate.pageNumbersHint', { total: files.length === 1 ? String(files[0].info?.pages || 1) : '?' })}
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
        disabled={isProcessing || files.length === 0}
        className="w-full py-6 text-lg rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
      >
        {isProcessing ? t('common.processing') : (
          <span className="flex items-center gap-2">
            <RotateCw className="w-5 h-5" />
            {t('rotate.rotateButton')}
            {files.length > 1 && ` (${files.length} ${t('common.pages')})`}
          </span>
        )}
      </Button>
    );
  };

  return (
    <ToolLayout
      title={t('tools.rotate-pdf.name')}
      description={t('tools.rotate-pdf.description')}
      hasFiles={files.length > 0}
      onUpload={(newFiles) => handleFilesSelected(newFiles, false)}
      isProcessing={isProcessing}
      maxFiles={10}
      uploadTitle={t('common.selectFiles')}
      uploadDescription={t('upload.multipleFilesAllowed')}
      settings={results.length === 0 ? renderSettings() : null}
      actions={results.length === 0 ? renderActions() : null}
    >
      {renderContent()}
    </ToolLayout>
  );
};
