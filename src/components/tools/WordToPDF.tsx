import React, { useState } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import pdfService from '@/services/pdfService';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import JSZip from 'jszip';
import { PDFPreview } from '@/components/common/PDFPreview';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  RotateCw,
  FileStack,
  FileText,
  Download,
  Archive,
  Loader2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Maximize,
  ZoomIn,
  ZoomOut,
  Scissors,
  PenTool
} from 'lucide-react';

type ConversionMode = 'formatted' | 'text';
type Quality = 1 | 2 | 3;

interface FileStatus {
  file: File;
  id: string;
  isProcessing: boolean;
  isCompleted: boolean;
  error?: string;
  progress: number;
  previewBlob?: Blob;
  rotation: number;
  previewPage: number;
  pages?: number;
  result?: {
    blob: Blob;
    originalSize: number;
    processedSize: number;
    pageCount: number;
  };
}

export const WordToPDF: React.FC = () => {
  const { t } = useI18n();
  const { setSharedFile } = useSharedFile();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [conversionMode, setConversionMode] = useState<ConversionMode>('formatted');
  const [quality, setQuality] = useState<Quality>(2);
  const [zoomScale, setZoomScale] = useState(1);

  const handleFileSelected = (selectedFiles: File[]) => {
    const newFiles: FileStatus[] = selectedFiles
      .filter(file => {
        const name = file.name.toLowerCase();
        return name.endsWith('.docx') || name.endsWith('.doc');
      })
      .map(file => ({
        file,
        id: Math.random().toString(36).substring(7),
        isProcessing: false,
        isCompleted: false,
        progress: 0,
        rotation: 0,
        previewPage: 1
      }));

    if (newFiles.length < selectedFiles.length) {
      alert(t('wordToPdf.errors.invalidFormat'));
    }

    setFiles(prev => [...prev, ...newFiles]);

    // Background preview generation
    newFiles.forEach(async (fileStatus) => {
      try {
        const result = await pdfService.wordToPDF(fileStatus.file, () => { }, { mode: conversionMode, quality: 1 });
        if (result.success && result.data) {
          setFiles(prev => prev.map(f => f.id === fileStatus.id ? {
            ...f,
            previewBlob: result.data,
            pages: result.metadata?.pageCount || 1
          } : f));
        }
      } catch (err) {
        console.error('Background preview conversion failed:', err);
      }
    });
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const processFile = async (fileStatus: FileStatus): Promise<FileStatus> => {
    try {
      const result = await pdfService.wordToPDF(
        fileStatus.file,
        (progress) => {
          setFiles(prev => prev.map(f => f.id === fileStatus.id ? { ...f, progress } : f));
        },
        { mode: conversionMode, quality }
      );

      if (result.success && result.data) {
        let finalBlob = result.data;

        // Apply rotation if needed
        if (fileStatus.rotation !== 0) {
          const pageCount = result.metadata?.pageCount || 1;
          const rotateResult = await pdfService.rotatePDF(
            finalBlob,
            fileStatus.rotation as any,
            Array.from({ length: pageCount }, (_, i) => i + 1)
          );
          if (rotateResult.success && rotateResult.data) {
            finalBlob = rotateResult.data;
          }
        }

        return {
          ...fileStatus,
          isProcessing: false,
          isCompleted: true,
          progress: 100,
          result: {
            blob: finalBlob,
            originalSize: result.metadata?.originalSize || 0,
            processedSize: finalBlob.size,
            pageCount: result.metadata?.pageCount || 1,
          }
        };
      } else {
        return {
          ...fileStatus,
          isProcessing: false,
          error: result.error?.message || t('wordToPdf.errors.conversionFailed')
        };
      }
    } catch {
      return {
        ...fileStatus,
        isProcessing: false,
        error: t('wordToPdf.errors.conversionFailed')
      };
    }
  };

  const handleConvertAll = async () => {
    setIsProcessingAll(true);

    // Reset statuses for non-completed files
    setFiles(prev => prev.map(f => f.isCompleted ? f : { ...f, isProcessing: true, error: undefined, progress: 0 }));

    const updatedFiles = [...files];
    for (let i = 0; i < updatedFiles.length; i++) {
      if (updatedFiles[i].isCompleted) continue;

      const processed = await processFile(updatedFiles[i]);
      updatedFiles[i] = processed;

      setFiles([...updatedFiles]);
    }

    setIsProcessingAll(false);
  };

  const downloadFile = (fileStatus: FileStatus) => {
    if (fileStatus.result?.blob) {
      const fileName = fileStatus.file.name.replace(/\.(docx|doc)$/i, '.pdf');
      pdfService.downloadFile(fileStatus.result.blob, fileName);
    }
  };

  const downloadAllAsZip = async () => {
    const completedFiles = files.filter(f => f.isCompleted && f.result?.blob);
    if (completedFiles.length === 0) return;

    const zip = new JSZip();
    completedFiles.forEach(f => {
      const fileName = f.file.name.replace(/\.(docx|doc)$/i, '.pdf');
      zip.file(fileName, f.result!.blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    pdfService.downloadFile(content, 'converted_files.zip');
  };

  const handleReset = () => {
    setFiles([]);
    setIsProcessingAll(false);
  };

  const handleRotateFile = (id: string, direction: 'cw' | 'ccw') => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        const delta = direction === 'cw' ? 90 : -90;
        let newRotation = (f.rotation + delta) % 360;
        if (newRotation < 0) newRotation += 360;
        return { ...f, rotation: newRotation };
      })
    );
  };

  const handlePageChange = (id: string, delta: number) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== id || !f.pages) return f;
        const nextPage = Math.min(Math.max(1, f.previewPage + delta), f.pages);
        return { ...f, previewPage: nextPage };
      })
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const renderContent = () => {
    if (files.length === 0) return null;

    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-12 max-w-4xl mx-auto">
          {files.map((file, index) => (
            <div key={file.id} className="relative group w-full">
              <Card className="p-8 hover:shadow-2xl transition-all duration-300 relative border-transparent hover:border-ocean-200 dark:hover:border-ocean-800 bg-white dark:bg-privacy-800 shadow-xl overflow-hidden">
                <div className="mb-8 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 relative overflow-hidden group/preview min-h-[600px]">
                  {file.previewBlob ? (
                    <div
                      className="transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) origin-center shadow-2xl relative"
                      style={{ transform: `rotate(${file.rotation}deg)` }}
                    >
                      <PDFPreview
                        blob={file.previewBlob}
                        width={450 * zoomScale}
                        height={600 * zoomScale}
                        pageNumber={file.previewPage}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-4 text-gray-400">
                      <Loader2 className="w-12 h-12 animate-spin text-ocean-500" />
                      <p className="text-sm font-medium">{t('common.generatingPreview') || 'Generating visual preview...'}</p>
                    </div>
                  )}

                  {file.pages && file.pages > 1 && (
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-12 w-12 rounded-full shadow-lg pointer-events-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border hover:scale-110 transition-transform disabled:opacity-30"
                        onClick={() => handlePageChange(file.id, -1)}
                        disabled={file.previewPage <= 1}
                        title={t('common.prevPage') || 'Previous page'}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-12 w-12 rounded-full shadow-lg pointer-events-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border hover:scale-110 transition-transform disabled:opacity-30"
                        onClick={() => handlePageChange(file.id, 1)}
                        disabled={file.previewPage >= file.pages}
                        title={t('common.nextPage') || 'Next page'}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    </div>
                  )}

                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover/preview:opacity-100 transition-opacity bg-white/95 dark:bg-gray-800/95 rounded-2xl p-2 backdrop-blur-xl shadow-2xl border border-gray-100 dark:border-gray-700">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 text-ocean-600 dark:text-ocean-400 hover:bg-ocean-50 dark:hover:bg-ocean-900/40 rounded-xl"
                      onClick={() => handleRotateFile(file.id, 'ccw')}
                    >
                      <RotateCw className="h-5 w-5 transform -scale-x-100" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 text-ocean-600 dark:text-ocean-400 hover:bg-ocean-50 dark:hover:bg-ocean-900/40 rounded-xl"
                      onClick={() => handleRotateFile(file.id, 'cw')}
                    >
                      <RotateCw className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover/preview:opacity-100 transition-opacity bg-white/95 dark:bg-gray-800/95 rounded-2xl p-2 backdrop-blur-xl shadow-2xl border border-gray-100 dark:border-gray-700">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                      onClick={() => setZoomScale(prev => Math.max(0.5, prev - 0.25))}
                    >
                      <ZoomOut className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                      onClick={() => setZoomScale(1)}
                    >
                      <Maximize className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                      onClick={() => setZoomScale(prev => Math.min(2, prev + 0.25))}
                    >
                      <ZoomIn className="h-5 w-5" />
                    </Button>
                  </div>

                  {file.pages && (
                    <div className="absolute bottom-4 left-4 bg-ocean-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg backdrop-blur-md opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center gap-2">
                      <FileStack className="w-4 h-4" />
                      {file.previewPage} / {file.pages}
                    </div>
                  )}

                  {file.isProcessing && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50">
                      <div className="flex flex-col items-center gap-4 w-64">
                        <Loader2 className="w-12 h-12 animate-spin text-ocean-600" />
                        <Progress value={file.progress} className="h-2 w-full" />
                        <p className="text-sm font-bold text-ocean-700 dark:text-ocean-300">
                          {Math.round(file.progress)}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-6">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="text-xl font-bold truncate text-gray-900 dark:text-gray-100 flex items-center gap-3" title={file.file.name}>
                      <Badge variant="secondary" className="bg-ocean-100 dark:bg-ocean-900/40 text-ocean-700 dark:text-ocean-300 text-base py-1 px-3 rounded-lg">
                        {index + 1}
                      </Badge>
                      {file.file.name}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-ocean-600 dark:text-ocean-400 font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {file.pages ? `${file.pages} ${t('common.pages')}` : formatFileSize(file.file.size)}
                      </p>
                      {file.isCompleted && file.result && (
                        <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200">
                          {t('common.success')} • {formatFileSize(file.result.processedSize)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {file.isCompleted && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-14 w-14 text-ocean-600 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 rounded-2xl"
                          onClick={() => {
                            if (file.result?.blob) {
                              const fileName = file.file.name.replace(/\.(docx|doc)$/i, '.pdf');
                              setSharedFile(file.result.blob, fileName, 'word-to-pdf');
                              window.location.hash = '#edit-pdf';
                            }
                          }}
                          title={t('wordToPdf.editResult')}
                        >
                          <PenTool className="h-6 w-6" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-14 w-14 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-2xl"
                          onClick={() => downloadFile(file)}
                        >
                          <Download className="h-6 w-6" />
                        </Button>
                      </>
                    )}
                    {!isProcessingAll && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-14 w-14 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl"
                        onClick={() => removeFile(file.id)}
                      >
                        <Scissors className="h-6 w-6" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {files.some(f => f.isCompleted) && files.length > 1 && (
          <div className="flex justify-center pt-8">
            <Button onClick={downloadAllAsZip} size="lg" className="bg-ocean-600 hover:bg-ocean-700 h-16 px-8 text-lg font-bold rounded-2xl shadow-xl">
              <Archive className="w-6 h-6 mr-3" />
              {t('common.downloadAll') || 'Download all as ZIP'}
            </Button>
          </div>
        )}

        {!isProcessingAll && files.length < 10 && (
          <div className="flex justify-center pt-4 max-w-4xl mx-auto w-full">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files) handleFileSelected(Array.from(e.target.files));
                e.target.value = '';
              }}
              accept=".docx,.doc"
              multiple
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-dashed border-2 hover:border-ocean-500 hover:text-ocean-600 h-24 w-full rounded-2xl transition-all bg-gray-50/50 dark:bg-gray-900/30 text-lg font-medium"
            >
              <Plus className="w-6 h-6 mr-3" />
              {t('common.addFiles') || 'Add more files'}
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>{t('wordToPdf.conversionMode')}</Label>
        <div className="grid grid-cols-1 gap-3">
          <div onClick={() => !isProcessingAll && setConversionMode('formatted')} className={`cursor-pointer border-2 rounded-lg p-3 transition-all ${conversionMode === 'formatted' ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'} ${isProcessingAll ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="font-semibold text-sm">{t('wordToPdf.withFormatting')}</div>
            <div className="text-[10px] text-gray-500 mt-1">{t('wordToPdf.formattingDescription')}</div>
          </div>
          <div onClick={() => !isProcessingAll && setConversionMode('text')} className={`cursor-pointer border-2 rounded-lg p-3 transition-all ${conversionMode === 'text' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'} ${isProcessingAll ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="font-semibold text-sm">{t('wordToPdf.textOnly')}</div>
            <div className="text-[10px] text-gray-500 mt-1">{t('wordToPdf.textDescription')}</div>
          </div>
        </div>
      </div>

      {conversionMode === 'formatted' && (
        <div className="space-y-2">
          <Label className="text-sm">{t('wordToPdf.quality')}</Label>
          <Select disabled={isProcessingAll} value={quality.toString()} onValueChange={(v) => setQuality(parseInt(v) as Quality)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">{t('wordToPdf.qualityStandard')}</SelectItem>
              <SelectItem value="2">{t('wordToPdf.qualityHigh')}</SelectItem>
              <SelectItem value="3">{t('wordToPdf.qualityMax')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );

  const renderActions = () => (
    <div className="space-y-3">
      <Button
        onClick={handleConvertAll}
        disabled={isProcessingAll || files.length === 0 || files.every(f => f.isCompleted)}
        className="w-full py-6 text-lg font-bold shadow-lg"
      >
        {isProcessingAll ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {t('common.processing')}</>
        ) : (
          t('wordToPdf.convert')
        )}
      </Button>
      {files.some(f => f.isCompleted) && !isProcessingAll && (
        <Button variant="outline" onClick={handleReset} className="w-full">
          {t('common.convertAnother')}
        </Button>
      )}
    </div>
  );

  return (
    <ToolLayout
      title={t('tools.word-to-pdf.name')}
      description={t('tools.word-to-pdf.description')}
      hasFiles={files.length > 0}
      onUpload={handleFileSelected}
      isProcessing={isProcessingAll}
      maxFiles={10}
      uploadTitle={t('common.selectFiles') || 'Select Word Files'}
      uploadDescription={t('upload.multipleFilesAllowed') || 'Supports up to 10 .docx files'}
      acceptedTypes=".docx"
      settings={files.length > 0 ? renderSettings() : null}
      actions={files.length > 0 ? renderActions() : null}
    >
      {renderContent()}
    </ToolLayout>
  );
};
