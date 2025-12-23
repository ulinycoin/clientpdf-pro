import React, { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useI18n } from '@/hooks/useI18n';
import pdfService from '@/services/pdfService';
import type {
  ImageConversionOptions,
  ImageConversionResult,
  ImageFormat,
  ImageQuality
} from '@/types/image.types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  CheckCircle2,
  FileText,
  Download,
  X,
  Trash2,
  ZoomIn,
  Loader2,
  Minimize2,
  Shield,
  Stamp,
  Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { usePDFThumbnails } from '@/hooks/usePDFThumbnails';
import { useSharedFile } from '@/hooks/useSharedFile';
import { toast } from 'sonner';
import { QUALITY_SETTINGS, type ConvertedImage } from '@/types/image.types';
import { HASH_TOOL_MAP, type Tool } from '@/types';

interface FileWithResult {
  file: File;
  result: ImageConversionResult | null;
  previews: string[];
  progress: number;
  progressMessage: string;
  isProcessing: boolean;
}

export const PDFToImages: React.FC = () => {
  const { t } = useI18n();
  useSharedFile();
  const [files, setFiles] = useState<FileWithResult[]>([]);
  const [focusedFileIndex, setFocusedFileIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Conversion options
  const [format, setFormat] = useState<ImageFormat>('png');
  const [quality, setQuality] = useState<ImageQuality>('medium');
  const [pageSelection, setPageSelection] = useState<'all' | 'range' | 'specific'>('all');
  const [pageRange, setPageRange] = useState({ start: 1, end: 1 });
  const [specificPages, setSpecificPages] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  // Zoom state
  const [zoomedPageNumber, setZoomedPageNumber] = useState<number | null>(null);
  const [zoomedImageSrc, setZoomedImageSrc] = useState<string | null>(null);
  const [isZoomLoading, setIsZoomLoading] = useState(false);

  // Thumbnails hook
  const { thumbnails, isLoading: thumbnailsLoading } = usePDFThumbnails({
    file: files[focusedFileIndex]?.file,
    thumbnailWidth: 200,
    thumbnailHeight: 280,
  });

  // const [qualitySettings, setQualitySettings] = useState<any>(null);

  // useEffect(() => {
  //   import('@/types/image.types').then(module => {
  //     setQualitySettings(module.QUALITY_SETTINGS);
  //   });
  // }, []);

  // Load zoomed image
  useEffect(() => {
    const loadZoomedImage = async () => {
      const currentFile = files[focusedFileIndex]?.file;
      if (zoomedPageNumber !== null && currentFile) {
        setIsZoomLoading(true);
        setZoomedImageSrc(null);
        try {
          const dataUrl = await pdfService.renderPageAsImage(currentFile, zoomedPageNumber, 2.5);
          setZoomedImageSrc(dataUrl);
        } catch (err) {
          console.error('Failed to load zoomed image', err);
          toast.error(t('common.error'));
        } finally {
          setIsZoomLoading(false);
        }
      }
    };
    loadZoomedImage();
  }, [zoomedPageNumber, focusedFileIndex, files, t]);

  const handleFileSelected = (selectedFiles: File[]) => {
    const newFiles: FileWithResult[] = selectedFiles.map(file => ({
      file,
      result: null,
      previews: [],
      progress: 0,
      progressMessage: '',
      isProcessing: false
    }));
    setFiles(prev => [...prev, ...newFiles]);
    if (files.length === 0) setFocusedFileIndex(0);
  };


  const handleReset = () => {
    setFiles([]);
    setIsProcessing(false);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const options: ImageConversionOptions = {
      format,
      quality,
      pages: pageSelection,
      backgroundColor: format === 'jpeg' ? backgroundColor : undefined
    };

    if (pageSelection === 'range') options.pageRange = pageRange;
    else if (pageSelection === 'specific') {
      const pageNumbers = specificPages.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p) && p > 0);
      options.pageNumbers = pageNumbers;
    }

    for (let i = 0; i < files.length; i++) {
      const fileItem = files[i];
      if (fileItem.result) continue;

      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, isProcessing: true } : f));

      try {
        const conversionResult = await pdfService.pdfToImages(
          fileItem.file,
          options,
          (progressUpdate) => {
            setFiles(prev => prev.map((f, idx) => idx === i ? {
              ...f,
              progress: progressUpdate.percentage,
              progressMessage: progressUpdate.message || ''
            } : f));
          }
        );

        const previews = conversionResult.success && conversionResult.images.length > 0
          ? conversionResult.images.slice(0, 5).map(img => img.dataUrl)
          : [];

        setFiles(prev => prev.map((f, idx) => idx === i ? {
          ...f,
          result: conversionResult,
          previews,
          isProcessing: false,
          progress: 100
        } : f));

      } catch (e) {
        console.error('Conversion error:', e);
        const errorResult: ImageConversionResult = {
          success: false, images: [], totalPages: 0, originalSize: fileItem.file.size, convertedSize: 0,
          error: t('pdfToImages.errors.conversionFailed')
        };
        setFiles(prev => prev.map((f, idx) => idx === i ? {
          ...f,
          result: errorResult,
          isProcessing: false
        } : f));
      }
    }
    setIsProcessing(false);
  };

  const handleDownloadZip = async (fileIndex: number) => {
    const fileItem = files[fileIndex];
    if (fileItem?.result?.success) {
      try {
        const zipFilename = `${fileItem.file.name.replace(/\.pdf$/i, '')}_images.zip`;
        await pdfService.downloadImagesAsZip(fileItem.result.images, zipFilename);
      } catch (e) {
        console.error('ZIP error:', e);
        toast.error('Failed to create ZIP');
      }
    }
  };

  const handleDownloadAllAsZip = async () => {
    const allImages: ConvertedImage[] = [];
    files.forEach(f => {
      if (f.result?.success) allImages.push(...f.result.images);
    });
    if (allImages.length) {
      try {
        await pdfService.downloadImagesAsZip(allImages, 'all_converted_images.zip');
      } catch (e) {
        console.error('ZIP error:', e);
        toast.error('Failed to create ZIP');
      }
    }
  };

  const handleQuickAction = async (toolId: Tool) => {
    const focusedFile = files[focusedFileIndex];
    if (!focusedFile?.result?.success || !focusedFile.result.images.length) return;
    window.location.hash = HASH_TOOL_MAP[toolId];
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

    const focusedFile = files[focusedFileIndex];
    if (!focusedFile) return null;

    const completedFiles = files.filter(f => f.result?.success).length;

    return (
      <div className="space-y-6">
        {/* Batch Toolbar & File Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/80 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-100 dark:border-gray-700 sticky top-0 z-20 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar max-w-full pb-1">
            <div className="flex items-center gap-2 bg-ocean-50/50 dark:bg-ocean-900/10 px-3 py-1.5 rounded-lg border border-ocean-100 dark:border-ocean-900/20 mr-2">
              <FileText className="w-4 h-4 text-ocean-600" />
              <span className="text-sm font-semibold text-ocean-900 dark:text-ocean-100 whitespace-nowrap">
                {files.length} {t('common.selectFiles')}
              </span>
            </div>

            {files.map((f, i) => (
              <Button
                key={i}
                variant={i === focusedFileIndex ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFocusedFileIndex(i)}
                className={`flex-shrink-0 h-9 px-3 gap-2 ${i === focusedFileIndex ? 'bg-ocean-100 text-ocean-700 border border-ocean-200' : ''}`}
              >
                <span className="max-w-[120px] truncate text-xs font-medium">{f.file.name}</span>
                {f.result?.success && <CheckCircle2 className="w-3 h-3 text-green-500" />}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('file-upload-input')?.click()}
              className="flex-shrink-0 h-9 px-3 border-dashed border-ocean-300 text-ocean-600 hover:bg-ocean-50"
            >
              <span className="text-xs font-bold">+ {t('common.addFiles')}</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {completedFiles > 0 && (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-2 py-1">
                {completedFiles} / {files.length} {t('common.done')}
              </Badge>
            )}
            <Button
              onClick={handleReset}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 h-9"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">{t('common.clearAll')}</span>
            </Button>
          </div>
        </div>

        {/* Info & Results Bar (if converted) */}
        {focusedFile.result?.success && (
          <div className="flex items-center justify-between p-4 bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-green-900 dark:text-green-100">{t('pdfToImages.success')}</p>
                <p className="text-xs text-green-700/70 dark:text-green-300/70">
                  {focusedFile.result.images.length} {t('pdfToImages.imagesCreated')} • {formatFileSize(focusedFile.result.convertedSize)}
                </p>
              </div>
            </div>
            <Button onClick={() => handleDownloadZip(focusedFileIndex)} size="sm" className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20">
              <Download className="w-4 h-4 mr-2" /> {t('pdfToImages.downloadZip')}
            </Button>
          </div>
        )}

        {focusedFile.isProcessing && (
          <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-3xl border border-ocean-100/50 dark:border-gray-700/50 backdrop-blur-sm">
            <ProgressBar progress={focusedFile.progress} message={focusedFile.progressMessage} />
          </div>
        )}

        {/* Page Grid - Main Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {thumbnailsLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <Card key={i} className="aspect-[1/1.4] animate-pulse bg-gray-100/50 dark:bg-gray-800/50 border-none rounded-2xl" />
            ))
          ) : (
            thumbnails.map((thumb) => (
              <Card
                key={`${focusedFileIndex}-${thumb.pageNumber}`}
                className="relative group overflow-hidden cursor-default transition-all duration-500 border-transparent hover:border-ocean-300 dark:hover:border-ocean-700 hover:shadow-glow/20 bg-white dark:bg-[#18181b] rounded-2xl liquid-glass-card"
              >
                {/* Glass & Glow Effects */}
                <div className="card-glass group-hover:bg-white/50 dark:group-hover:bg-[#1c1c1e]/50 transition-colors" />
                <div className="card-glow group-hover:opacity-100" />

                <div className="relative z-10 w-full h-full flex flex-col">
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 z-20">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9 bg-white/90 dark:bg-black/50 backdrop-blur-md shadow-lg border border-white/20 hover:scale-110 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomedPageNumber(thumb.pageNumber);
                      }}
                    >
                      <ZoomIn className="h-5 w-5 text-ocean-600" />
                    </Button>
                  </div>

                  <div className="p-3 aspect-[1/1.4] flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/30 transition-all duration-500 group-hover:bg-transparent">
                    <img
                      src={thumb.dataUrl}
                      alt={`Page ${thumb.pageNumber}`}
                      className="max-w-full max-h-full object-contain shadow-2xl rounded-sm transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="py-2 text-center text-[10px] font-bold text-gray-400 bg-white/80 dark:bg-gray-800/40 border-t border-gray-100 dark:border-white/5 uppercase tracking-widest backdrop-blur-sm mt-auto">
                    {t('common.page')} {thumb.pageNumber}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {files.some(f => f.result?.success) && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pt-8">
            <div className="flex justify-center">
              <Button onClick={handleDownloadAllAsZip} className="w-full max-w-lg bg-ocean-600 hover:bg-ocean-700 shadow-2xl shadow-ocean-600/30 py-7 text-xl font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Download className="w-6 h-6 mr-3" /> {t('pdfToImages.downloadAll')} (ZIP)
              </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {(['compress-pdf', 'protect-pdf', 'watermark-pdf', 'merge-pdf'] as Tool[]).map((toolId) => (
                <Button
                  key={toolId}
                  onClick={() => handleQuickAction(toolId)}
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2 rounded-xl border-gray-200 dark:border-gray-700 hover:border-ocean-300 dark:hover:border-ocean-700 hover:bg-ocean-50/50 dark:hover:bg-ocean-900/10 transition-all"
                >
                  {toolId === 'compress-pdf' && <Minimize2 className="h-5 w-5 text-ocean-500" />}
                  {toolId === 'protect-pdf' && <Shield className="h-5 w-5 text-ocean-500" />}
                  {toolId === 'watermark-pdf' && <Stamp className="h-5 w-5 text-ocean-500" />}
                  {toolId === 'merge-pdf' && <Layers className="h-5 w-5 text-ocean-500" />}
                  <span className="text-xs font-semibold">{t(`tools.${toolId}.name`)}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{t('pdfToImages.format')}</Label>
        <Select value={format} onValueChange={(v) => setFormat(v as ImageFormat)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="png">PNG</SelectItem>
            <SelectItem value="jpeg">JPEG</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t('pdfToImages.quality')}</Label>
        <Select value={quality} onValueChange={(v) => setQuality(v as ImageQuality)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(QUALITY_SETTINGS).map(([key, settings]) => (
              <SelectItem key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)} ({settings.resolution} DPI)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 border-t pt-4">
        <Label>{t('pdfToImages.pages')}</Label>
        <div className="space-y-2">
          {['all', 'range', 'specific'].map((mode) => (
            <div key={mode} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`page-${mode}`}
                checked={pageSelection === mode}
                onChange={() => setPageSelection(mode as 'all' | 'range' | 'specific')}
                className="text-ocean-600 focus:ring-ocean-500"
              />
              <Label htmlFor={`page-${mode}`} className="cursor-pointer">{t(`pdfToImages.${mode === 'range' ? 'pageRange' : mode === 'specific' ? 'specificPages' : 'allPages'}`)}</Label>
            </div>
          ))}
        </div>

        {pageSelection === 'range' && (
          <div className="flex gap-2">
            <Input type="number" min={1} value={pageRange.start} onChange={(e) => setPageRange(p => ({ ...p, start: parseInt(e.target.value) || 1 }))} placeholder="From" />
            <span className="self-center">-</span>
            <Input type="number" min={1} value={pageRange.end} onChange={(e) => setPageRange(p => ({ ...p, end: parseInt(e.target.value) || 1 }))} placeholder="To" />
          </div>
        )}
        {pageSelection === 'specific' && (
          <Input placeholder="e.g. 1, 3, 5-10" value={specificPages} onChange={(e) => setSpecificPages(e.target.value)} />
        )}
      </div>

      {format === 'jpeg' && (
        <div className="space-y-2 border-t pt-4">
          <Label>{t('pdfToImages.backgroundColor')}</Label>
          <div className="flex items-center gap-2">
            <Input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-10 h-10 p-1" />
            <span className="text-sm text-gray-500">{backgroundColor}</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderActions = () => (
    <Button
      onClick={handleConvert}
      disabled={isProcessing || !files.some(f => !f.result)}
      className="w-full py-6 text-lg font-bold"
    >
      {isProcessing ? t('common.processing') : t('pdfToImages.convert')}
    </Button>
  );

  return (
    <>
      <ToolLayout
        title={t('tools.pdf-to-images.name')}
        description={t('tools.pdf-to-images.description')}
        hasFiles={files.length > 0}
        onUpload={handleFileSelected}
        isProcessing={isProcessing}
        maxFiles={20}
        uploadTitle={t('common.selectFile')}
        uploadDescription={t('upload.multipleFilesAllowed')}
        acceptedTypes=".pdf"
        settings={files.length > 0 ? renderSettings() : null}
        actions={files.length > 0 ? renderActions() : null}
      >
        {renderContent()}
      </ToolLayout>

      {/* Zoom Overlay */}
      {zoomedPageNumber !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="font-bold text-lg">{t('common.page')} {zoomedPageNumber}</span>
              <Button variant="ghost" size="icon" onClick={() => setZoomedPageNumber(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-0">
              {isZoomLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-ocean-500" />
                  <span className="text-sm text-gray-500">{t('common.loading')}</span>
                </div>
              ) : zoomedImageSrc ? (
                <img src={zoomedImageSrc} alt="Zoomed page" className="max-w-full h-auto shadow-lg rounded-lg" />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
