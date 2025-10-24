import React, { useState } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PDFPreview } from '@/components/common/PDFPreview';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import pdfService from '@/services/pdfService';
import type { Tool } from '@/types';
import { HASH_TOOL_MAP } from '@/types';

interface ImageFile {
  id: string;
  file: File;
  name: string;
  size: number;
  preview: string;
}

type PageSize = 'fit' | 'a4' | 'letter';
type Orientation = 'portrait' | 'landscape';

export const ImagesToPDF: React.FC = () => {
  const { t } = useI18n();
  const { setSharedFile: saveSharedFile } = useSharedFile();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>('fit');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [margin, setMargin] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<{ blob: Blob; metadata: any } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFilesSelected = async (selectedFiles: File[]) => {
    const newImages: ImageFile[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      // Create preview URL
      const preview = URL.createObjectURL(file);

      newImages.push({
        id: `${Date.now()}-${i}`,
        file,
        name: file.name,
        size: file.size,
        preview,
      });
    }

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);

    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      alert(t('imagesToPdf.errors.noImages'));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      const imageFiles = images.map((img) => img.file);
      const result = await pdfService.imagesToPDF(
        imageFiles,
        (prog, msg) => {
          setProgress(prog);
          setProgressMessage(msg);
        },
        { pageSize, orientation, margin }
      );

      if (result.success && result.data) {
        setResult({ blob: result.data, metadata: result.metadata });
      } else {
        alert(result.error?.message || 'Conversion failed');
      }
    } catch (error) {
      alert('An error occurred during conversion');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result?.blob) {
      pdfService.downloadFile(result.blob, 'images-to-pdf.pdf');
    }
  };

  const handleReset = () => {
    // Clean up preview URLs
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setResult(null);
    setProgress(0);
    setProgressMessage('');
  };

  const handleQuickAction = (toolId: Tool) => {
    if (result?.blob) {
      saveSharedFile(result.blob, 'images-to-pdf.pdf', 'images-to-pdf');
    }
    window.location.hash = HASH_TOOL_MAP[toolId];
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-privacy-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-ocean-900 dark:text-white mb-3">
            {t('tools.images-to-pdf.name')}
          </h1>
          <p className="text-lg text-ocean-700 dark:text-ocean-300">
            {t('tools.images-to-pdf.description')}
          </p>
        </div>

        {!result ? (
          <>
            {/* File Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
              <FileUpload
                onFilesSelected={handleFilesSelected}
                accept="image/jpeg,image/jpg,image/png"
                multiple={true}
                maxFiles={50}
                disabled={isProcessing}
              />

              {/* Image List */}
              {images.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-ocean-900 dark:text-white">
                      {t('imagesToPdf.imagesList')} ({images.length})
                    </h3>
                    <button
                      onClick={handleReset}
                      className="text-sm text-ocean-600 dark:text-ocean-400 hover:text-ocean-800 dark:hover:text-ocean-200"
                    >
                      {t('common.clearAll')}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div
                        key={image.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`relative group cursor-move border-2 rounded-lg overflow-hidden transition-all ${
                          draggedIndex === index
                            ? 'border-ocean-500 shadow-lg scale-105'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <img
                          src={image.preview}
                          alt={image.name}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => handleRemoveImage(image.id)}
                            className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-2 transition-opacity hover:bg-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 truncate">
                          {index + 1}. {image.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            {images.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-ocean-900 dark:text-white mb-4">
                  {t('imagesToPdf.settings')}
                </h3>

                {/* Page Size */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-ocean-700 dark:text-ocean-300 mb-2">
                    {t('imagesToPdf.pageSize')}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['fit', 'a4', 'letter'] as PageSize[]).map((size) => (
                      <button
                        key={size}
                        onClick={() => setPageSize(size)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          pageSize === size
                            ? 'bg-ocean-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-ocean-700 dark:text-ocean-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {t(`imagesToPdf.pageSizes.${size}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orientation */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-ocean-700 dark:text-ocean-300 mb-2">
                    {t('imagesToPdf.orientation')}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['portrait', 'landscape'] as Orientation[]).map((orient) => (
                      <button
                        key={orient}
                        onClick={() => setOrientation(orient)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          orientation === orient
                            ? 'bg-ocean-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-ocean-700 dark:text-ocean-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {t(`imagesToPdf.orientations.${orient}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Margin */}
                <div>
                  <label className="block text-sm font-medium text-ocean-700 dark:text-ocean-300 mb-2">
                    {t('imagesToPdf.margin')}: {margin}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>
              </div>
            )}

            {/* Convert Button */}
            {images.length > 0 && !isProcessing && (
              <div className="flex justify-center">
                <button
                  onClick={handleConvert}
                  className="px-8 py-4 bg-ocean-500 text-white text-lg font-semibold rounded-xl hover:bg-ocean-600 transition-colors shadow-lg hover:shadow-xl"
                >
                  {t('imagesToPdf.convert')}
                </button>
              </div>
            )}

            {/* Progress */}
            {isProcessing && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <ProgressBar progress={progress} message={progressMessage} />
              </div>
            )}
          </>
        ) : (
          /* Results */
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-xl font-semibold text-green-900 dark:text-green-100">
                  {t('common.success')}
                </h3>
              </div>
              <div className="text-green-800 dark:text-green-200 space-y-1">
                <p>
                  {t('imagesToPdf.successMessage', {
                    count: result.metadata?.pageCount || images.length,
                  })}
                </p>
                <p className="text-sm">
                  {t('common.fileSize')}: {formatFileSize(result.metadata?.processedSize || 0)}
                </p>
                <p className="text-sm">
                  {t('common.processingTime')}: {((result.metadata?.processingTime || 0) / 1000).toFixed(2)}s
                </p>
              </div>
            </div>

            {/* PDF Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-ocean-900 dark:text-white mb-4">
                {t('common.preview')}
              </h3>
              <PDFPreview
                file={new File([result.blob], 'images-to-pdf.pdf', { type: 'application/pdf' })}
                width={600}
                height={800}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleDownload}
                className="flex-1 px-6 py-4 bg-ocean-500 text-white text-lg font-semibold rounded-xl hover:bg-ocean-600 transition-colors shadow-lg hover:shadow-xl"
              >
                {t('common.download')}
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-6 py-4 bg-gray-200 dark:bg-gray-700 text-ocean-900 dark:text-white text-lg font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {t('common.convertAnother')}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-ocean-900 dark:text-white mb-4">
                {t('common.quickActions')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(['compress-pdf', 'protect-pdf', 'watermark-pdf'] as Tool[]).map((toolId) => (
                  <button
                    key={toolId}
                    onClick={() => handleQuickAction(toolId)}
                    className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-ocean-700 dark:text-ocean-300 rounded-lg hover:bg-ocean-100 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    {t(`tools.${toolId}.name`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
