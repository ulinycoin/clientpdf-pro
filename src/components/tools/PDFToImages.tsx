import React, { useState } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useI18n } from '@/hooks/useI18n';
import pdfService from '@/services/pdfService';
import type {
  ImageConversionOptions,
  ImageConversionResult,
  ImageFormat,
  ImageQuality,
  QUALITY_SETTINGS
} from '@/types/image.types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckCircle2, FileText, Download, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  const [files, setFiles] = useState<FileWithResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Conversion options
  const [format, setFormat] = useState<ImageFormat>('png');
  const [quality, setQuality] = useState<ImageQuality>('medium');
  const [pageSelection, setPageSelection] = useState<'all' | 'range' | 'specific'>('all');
  const [pageRange, setPageRange] = useState({ start: 1, end: 1 });
  const [specificPages, setSpecificPages] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  // Dynamic quality settings
  const [qualitySettings, setQualitySettings] = useState<any>(null);
  React.useEffect(() => {
    import('@/types/image.types').then(module => {
      setQualitySettings(module.QUALITY_SETTINGS);
    });
  }, []);

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
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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
      if (fileItem.result) continue; // Skip if already done

      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, isProcessing: true } : f));

      try {
        // Mock delay for UI if needed, but pdfToImages is async
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

      } catch (error) {
        console.error(error);
        const errorResult: ImageConversionResult = {
          success: false, images: [], totalPages: 0, originalSize: fileItem.file.size, convertedSize: 0,
          error: error instanceof Error ? error.message : t('pdfToImages.errors.conversionFailed')
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
      } catch (e) { alert('Failed to create ZIP'); }
    }
  };

  const handleDownloadAllAsZip = async () => {
    const allImages: any[] = [];
    files.forEach(f => {
      if (f.result?.success) allImages.push(...f.result.images);
    });
    if (allImages.length) {
      try {
        await pdfService.downloadImagesAsZip(allImages, 'all_converted_images.zip');
      } catch (e) { alert('Failed to create ZIP'); }
    }
  };

  const handleReset = () => {
    setFiles([]);
    setIsProcessing(false);
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
      <div className="space-y-4">
        {files.map((fileItem, index) => (
          <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white truncate pr-2">{fileItem.file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(fileItem.file.size)}</p>
                  </div>
                  {!fileItem.result && !fileItem.isProcessing && (
                    <Button onClick={() => handleRemoveFile(index)} variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {fileItem.isProcessing && (
                  <div className="mt-2">
                    <ProgressBar progress={fileItem.progress} message={fileItem.progressMessage} />
                  </div>
                )}

                {fileItem.result && (
                  <div className="mt-3">
                    {fileItem.result.success ? (
                      <div className="space-y-3">
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> {fileItem.result.totalPages} pages converted
                        </Badge>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {fileItem.previews.map((src, i) => (
                            <img key={i} src={src} className="h-16 w-auto rounded border shadow-sm" alt="preview" />
                          ))}
                        </div>
                        <Button onClick={() => handleDownloadZip(index)} size="sm" variant="outline" className="w-full sm:w-auto">
                          <Download className="w-4 h-4 mr-2" /> Download ZIP
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-red-500">{fileItem.result.error}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {files.some(f => f.result?.success) && (
          <div className="pt-4 border-t">
            <Button onClick={handleDownloadAllAsZip} className="w-full bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" /> Download Everything (ZIP)
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Format */}
      <div className="space-y-2">
        <Label>{t('pdfToImages.format')}</Label>
        <Select value={format} onValueChange={(v: any) => setFormat(v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="png">PNG</SelectItem>
            <SelectItem value="jpeg">JPEG</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quality */}
      <div className="space-y-2">
        <Label>{t('pdfToImages.quality')}</Label>
        <Select value={quality} onValueChange={(v: any) => setQuality(v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {qualitySettings && Object.entries(qualitySettings).map(([key, settings]: any) => (
              <SelectItem key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)} ({settings.resolution} DPI)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Page Selection */}
      <div className="space-y-3 border-t pt-4">
        <Label>{t('pdfToImages.pages')}</Label>
        <div className="space-y-2">
          {['all', 'range', 'specific'].map((mode) => (
            <div key={mode} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`page-${mode}`}
                checked={pageSelection === mode}
                onChange={() => setPageSelection(mode as any)}
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

      {/* JPEG Background */}
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
      {isProcessing ? t('common.processing') : t('common.convert')}
    </Button>
  );

  return (
    <ToolLayout
      title={t('tools.pdf-to-images.name')}
      description={t('tools.pdf-to-images.description')}
      hasFiles={files.length > 0}
      onUpload={handleFileSelected}
      isProcessing={isProcessing}
      maxFiles={20}
      uploadTitle={t('common.selectFile')}
      uploadDescription={t('upload.multipleFilesAllowed')}
      accept=".pdf"
      settings={files.length > 0 ? renderSettings() : null}
      actions={files.length > 0 ? renderActions() : null}
    >
      {renderContent()}
    </ToolLayout>
  );
};
