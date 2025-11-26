import React, { useState } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useI18n } from '@/hooks/useI18n';
import pdfService from '@/services/pdfService';
import type {
  ImageConversionOptions,
  ImageConversionResult,
  ImageFormat,
  ImageQuality,
  QUALITY_SETTINGS,
  FORMAT_DESCRIPTIONS,
  ConvertedImage
} from '@/types/image.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

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

  // Conversion options (shared across all files)
  const [format, setFormat] = useState<ImageFormat>('png');
  const [quality, setQuality] = useState<ImageQuality>('medium');
  const [pageSelection, setPageSelection] = useState<'all' | 'range' | 'specific'>('all');
  const [pageRange, setPageRange] = useState({ start: 1, end: 1 });
  const [specificPages, setSpecificPages] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

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

    // Prepare conversion options
    const options: ImageConversionOptions = {
      format,
      quality,
      pages: pageSelection,
      backgroundColor: format === 'jpeg' ? backgroundColor : undefined
    };

    // Add page-specific options
    if (pageSelection === 'range') {
      options.pageRange = pageRange;
    } else if (pageSelection === 'specific') {
      const pageNumbers = specificPages
        .split(',')
        .map(p => parseInt(p.trim()))
        .filter(p => !isNaN(p) && p > 0);
      options.pageNumbers = pageNumbers;
    }

    // Process each file sequentially
    for (let i = 0; i < files.length; i++) {
      const fileItem = files[i];

      // Skip if already processed
      if (fileItem.result) continue;

      // Mark file as processing
      setFiles(prev => prev.map((f, idx) =>
        idx === i ? { ...f, isProcessing: true } : f
      ));

      try {
        // Convert PDF to images
        const conversionResult = await pdfService.pdfToImages(
          fileItem.file,
          options,
          (progressUpdate) => {
            setFiles(prev => prev.map((f, idx) =>
              idx === i ? {
                ...f,
                progress: progressUpdate.percentage,
                progressMessage: progressUpdate.message || ''
              } : f
            ));
          }
        );

        // Create preview URLs for successful conversions
        const previews = conversionResult.success && conversionResult.images.length > 0
          ? conversionResult.images.slice(0, 5).map(img => img.dataUrl)
          : [];

        // Update file with result
        setFiles(prev => prev.map((f, idx) =>
          idx === i ? {
            ...f,
            result: conversionResult,
            previews,
            isProcessing: false,
            progress: 100
          } : f
        ));

      } catch (error) {
        console.error('PDF to Image conversion failed:', error);

        const errorResult: ImageConversionResult = {
          success: false,
          images: [],
          totalPages: 0,
          originalSize: fileItem.file.size,
          convertedSize: 0,
          error: error instanceof Error ? error.message : t('pdfToImages.errors.conversionFailed')
        };

        setFiles(prev => prev.map((f, idx) =>
          idx === i ? {
            ...f,
            result: errorResult,
            isProcessing: false
          } : f
        ));
      }
    }

    setIsProcessing(false);
  };

  const handleDownloadSingle = (fileIndex: number, imageIndex: number) => {
    const fileItem = files[fileIndex];
    if (fileItem?.result?.success && fileItem.result.images[imageIndex]) {
      pdfService.downloadImage(fileItem.result.images[imageIndex]);
    }
  };

  const handleDownloadAll = (fileIndex: number) => {
    const fileItem = files[fileIndex];
    if (fileItem?.result?.success && fileItem.result.images.length > 0) {
      pdfService.downloadAllImages(fileItem.result.images);
    }
  };

  const handleDownloadZip = async (fileIndex: number) => {
    const fileItem = files[fileIndex];
    if (fileItem?.result?.success && fileItem.result.images.length > 0) {
      try {
        const baseName = fileItem.file.name.replace(/\.pdf$/i, '');
        const zipFilename = `${baseName}_images.zip`;
        await pdfService.downloadImagesAsZip(fileItem.result.images, zipFilename);
      } catch (error) {
        console.error('Failed to download ZIP:', error);
        alert(t('pdfToImages.errors.zipFailed') || 'Failed to create ZIP archive');
      }
    }
  };

  const handleDownloadAllAsZip = async () => {
    const allImages: ConvertedImage[] = [];
    files.forEach(fileItem => {
      if (fileItem.result?.success && fileItem.result.images.length > 0) {
        allImages.push(...fileItem.result.images);
      }
    });

    if (allImages.length > 0) {
      try {
        const zipFilename = `all_pdfs_to_images.zip`;
        await pdfService.downloadImagesAsZip(allImages, zipFilename);
      } catch (error) {
        console.error('Failed to download ZIP:', error);
        alert(t('pdfToImages.errors.zipFailed') || 'Failed to create ZIP archive');
      }
    }
  };

  const handleReset = () => {
    setFiles([]);
    setIsProcessing(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Dynamically import quality settings
  const [qualitySettings, setQualitySettings] = useState<typeof QUALITY_SETTINGS | null>(null);
  React.useEffect(() => {
    import('@/types/image.types').then(module => {
      setQualitySettings(module.QUALITY_SETTINGS);
    });
  }, []);

  return (
    <div className="pdf-to-images space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('pdfToImages.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('pdfToImages.description')}
        </p>
      </div>

      {/* File Upload - UPDATED 2025-01-26 - Multi-file support: max 20 files */}
      <Card>
        <CardContent className="p-6">
          <FileUpload
            onFilesSelected={handleFileSelected}
            accept=".pdf,application/pdf"
            multiple={true}
            maxFiles={20}
            maxSizeMB={100}
          />
        </CardContent>
      </Card>

      {/* Files List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {files.length} {files.length === 1 ? 'file' : 'files'} selected
              </h3>
              {!isProcessing && (
                <Button onClick={handleReset} variant="outline" size="sm">
                  Clear all
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {files.map((fileItem, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-xl">📄</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{fileItem.file.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(fileItem.file.size)}</p>
                    </div>
                    {!fileItem.result && !isProcessing && (
                      <Button onClick={() => handleRemoveFile(index)} variant="ghost" size="sm">
                        ×
                      </Button>
                    )}
                  </div>

                  {fileItem.isProcessing && (
                    <ProgressBar progress={fileItem.progress} message={fileItem.progressMessage} />
                  )}

                  {fileItem.result && fileItem.result.success && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm text-green-600 dark:text-green-400">
                        ✓ Converted {fileItem.result.images.length} pages
                      </p>
                      <div className="flex gap-2">
                        <Button onClick={() => handleDownloadZip(index)} size="sm">
                          Download ZIP
                        </Button>
                        <Button onClick={() => handleDownloadAll(index)} variant="outline" size="sm">
                          Download All
                        </Button>
                      </div>
                    </div>
                  )}

                  {fileItem.result && !fileItem.result.success && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      ✗ {fileItem.result.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversion Options */}
      {files.length > 0 && !isProcessing && files.some(f => !f.result) && (
        <Card className="space-y-6 p-6">

          {/* Format Selection */}
          <div>
            <Label className="block text-sm font-medium mb-2">
              {t('pdfToImages.format')}
            </Label>
            <Select value={format} onValueChange={(value) => setFormat(value as ImageFormat)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpeg">JPEG</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quality Selection */}
          <div>
            <Label className="block text-sm font-medium mb-2">
              {t('pdfToImages.quality')}
            </Label>
            <Select value={quality} onValueChange={(value) => setQuality(value as ImageQuality)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {qualitySettings && Object.entries(qualitySettings).map(([key, settings]) => (
                  <SelectItem key={key} value={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)} ({settings.resolution} DPI)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page Selection */}
          <div className="space-y-3">
            <Label className="block text-sm font-medium">
              {t('pdfToImages.pages')}
            </Label>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pageSelection"
                  value="all"
                  checked={pageSelection === 'all'}
                  onChange={(e) => setPageSelection(e.target.value as any)}
                  className="text-ocean-600 focus:ring-ocean-500"
                />
                <span className="text-gray-900 dark:text-white">{t('pdfToImages.allPages')}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pageSelection"
                  value="range"
                  checked={pageSelection === 'range'}
                  onChange={(e) => setPageSelection(e.target.value as any)}
                  className="text-ocean-600 focus:ring-ocean-500"
                />
                <span className="text-gray-900 dark:text-white">{t('pdfToImages.pageRange')}</span>
              </label>

              {pageSelection === 'range' && (
                <div className="ml-6 flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    value={pageRange.start}
                    onChange={(e) => setPageRange(prev => ({ ...prev, start: parseInt(e.target.value) || 1 }))}
                    className="w-20 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    placeholder="From"
                  />
                  <span className="text-gray-600 dark:text-gray-400">-</span>
                  <input
                    type="number"
                    min={pageRange.start}
                    value={pageRange.end}
                    onChange={(e) => setPageRange(prev => ({ ...prev, end: parseInt(e.target.value) || 1 }))}
                    className="w-20 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    placeholder="To"
                  />
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pageSelection"
                  value="specific"
                  checked={pageSelection === 'specific'}
                  onChange={(e) => setPageSelection(e.target.value as any)}
                  className="text-ocean-600 focus:ring-ocean-500"
                />
                <span className="text-gray-900 dark:text-white">{t('pdfToImages.specificPages')}</span>
              </label>

              {pageSelection === 'specific' && (
                <input
                  type="text"
                  value={specificPages}
                  onChange={(e) => setSpecificPages(e.target.value)}
                  placeholder="e.g., 1,3,5-10"
                  className="ml-6 w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
              )}
            </div>
          </div>

          {/* Background Color for JPEG */}
          {format === 'jpeg' && (
            <div>
              <Label className="block text-sm font-medium mb-2">
                {t('pdfToImages.backgroundColor')}
              </Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-16 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{backgroundColor}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleConvert}
              disabled={isProcessing}
              className="flex-1 px-6 py-3"
            >
              {isProcessing ? 'Converting...' : `Convert ${files.filter(f => !f.result).length} file(s)`}
            </Button>
          </div>
        </Card>
      )}

      {/* Download All Button */}
      {files.length > 0 && files.some(f => f.result?.success) && !isProcessing && (
        <Card className="p-6">
          <Button onClick={handleDownloadAllAsZip} className="w-full">
            Download All Files as ZIP
          </Button>
        </Card>
      )}
    </div>
  );
};

