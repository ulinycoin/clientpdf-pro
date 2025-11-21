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

export const PDFToImages: React.FC = () => {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<ImageConversionResult | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // Conversion options
  const [format, setFormat] = useState<ImageFormat>('png');
  const [quality, setQuality] = useState<ImageQuality>('medium');
  const [pageSelection, setPageSelection] = useState<'all' | 'range' | 'specific'>('all');
  const [pageRange, setPageRange] = useState({ start: 1, end: 1 });
  const [specificPages, setSpecificPages] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  const handleFileSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setResult(null);
      setPreviewImages([]);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setResult(null);
    setPreviewImages([]);

    try {
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

      // Convert PDF to images
      const conversionResult = await pdfService.pdfToImages(
        file,
        options,
        (progressUpdate) => {
          setProgress(progressUpdate.percentage);
          setProgressMessage(progressUpdate.message || '');
        }
      );

      setResult(conversionResult);

      // Create preview URLs for successful conversions
      if (conversionResult.success && conversionResult.images.length > 0) {
        const previews = conversionResult.images.slice(0, 5).map(img => img.dataUrl);
        setPreviewImages(previews);
      }

    } catch (error) {
      console.error('PDF to Image conversion failed:', error);
      setResult({
        success: false,
        images: [],
        totalPages: 0,
        originalSize: file.size,
        convertedSize: 0,
        error: error instanceof Error ? error.message : t('pdfToImages.errors.conversionFailed')
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSingle = (index: number) => {
    if (result?.success && result.images[index]) {
      pdfService.downloadImage(result.images[index]);
    }
  };

  const handleDownloadAll = () => {
    if (result?.success && result.images.length > 0) {
      pdfService.downloadAllImages(result.images);
    }
  };

  const handleDownloadZip = async () => {
    if (result?.success && result.images.length > 0 && file) {
      try {
        const baseName = file.name.replace(/\.pdf$/i, '');
        const zipFilename = `${baseName}_images.zip`;
        await pdfService.downloadImagesAsZip(result.images, zipFilename);
      } catch (error) {
        console.error('Failed to download ZIP:', error);
        alert(t('pdfToImages.errors.zipFailed') || 'Failed to create ZIP archive');
      }
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setPreviewImages([]);
    setProgress(0);
    setProgressMessage('');
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

      {/* File Upload */}
      {!file && (
        <Card>
          <CardContent className="p-6">
            <FileUpload
              onFilesSelected={handleFileSelected}
              accept=".pdf,application/pdf"
              maxFiles={1}
              maxSize={100 * 1024 * 1024}
            />
          </CardContent>
        </Card>
      )}

      {/* Options */}
      {file && !result && (
        <Card className="space-y-6 p-6">
          {/* File Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <span className="text-xl">📄</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
            </div>
          </div>

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
              {isProcessing ? t('common.processing') : t('pdfToImages.convert')}
            </Button>
            <Button
              onClick={handleReset}
              disabled={isProcessing}
              variant="secondary"
              className="px-6 py-3"
            >
              {t('common.reset')}
            </Button>
          </div>
        </Card>
      )}

      {/* Progress */}
      {isProcessing && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('common.processing')}
          </h3>
          <ProgressBar progress={progress} label={progressMessage} />
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {result.success ? (
            <>
              {/* Success Summary */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
                  {t('pdfToImages.success')}
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {result.images.length}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      {t('pdfToImages.imagesCreated')}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {format.toUpperCase()}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      {t('pdfToImages.format')}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {formatFileSize(result.convertedSize)}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      {t('pdfToImages.totalSize')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Images */}
              {previewImages.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('pdfToImages.preview')}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                        <img
                          src={preview}
                          alt={`Page ${index + 1}`}
                          className="w-full h-24 object-contain mb-2"
                        />
                        <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                          {t('pdfToImages.page')} {result.images[index]?.pageNumber}
                        </p>
                      </div>
                    ))}
                    {result.images.length > 5 && (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 flex items-center justify-center">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          <div className="text-2xl mb-1">+{result.images.length - 5}</div>
                          <div className="text-xs">{t('common.more')}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Download Options */}
              <Card className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('pdfToImages.download')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    onClick={handleDownloadZip}
                    className="px-6 py-3 flex items-center justify-center gap-2"
                  >
                    <span>📦</span>
                    <span>{t('pdfToImages.downloadZip')}</span>
                  </Button>
                  <Button
                    onClick={handleDownloadAll}
                    className="px-6 py-3"
                  >
                    {t('pdfToImages.downloadAll')} ({result.images.length})
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="secondary"
                    className="px-6 py-3"
                  >
                    {t('common.convertAnother')}
                  </Button>
                </div>

                {/* Individual Download Buttons */}
                {result.images.length > 1 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {t('pdfToImages.downloadIndividual')}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {result.images.map((image, index) => (
                        <Button
                          key={index}
                          onClick={() => handleDownloadSingle(index)}
                          variant="outline"
                          className="px-4 py-2 text-sm"
                        >
                          {t('pdfToImages.page')} {image.pageNumber}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                {t('common.error')}
              </h3>
              <p className="text-red-700 dark:text-red-300">{result.error}</p>
              <Button
                onClick={handleReset}
                variant="destructive"
                className="mt-4 px-6 py-2"
              >
                {t('common.tryAgain')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
