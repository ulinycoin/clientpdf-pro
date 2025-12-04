import React, { useState, useEffect } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PDFMultiPagePreview } from '@/components/common/PDFMultiPagePreview';
import { SmartImageFilterPanel } from '@/components/smart/SmartImageFilterPanel';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import pdfService from '@/services/pdfService';
import smartImageFilterService, { type SmartImageFilterAnalysis, type CategorizedImage } from '@/services/smartImageFilterService';
import type { Tool } from '@/types';
import type { ExtractedImage } from '@/types/pdf';
import { HASH_TOOL_MAP } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface ImageFile {
  id: string;
  file: File;
  name: string;
  size: number;
  preview: string;
  width?: number;
  height?: number;
  hidden?: boolean; // For smart filtering
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

  // Smart Image Filter state
  const [smartEnabled, setSmartEnabled] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SmartImageFilterAnalysis | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(['photo', 'chart', 'logo', 'other']));
  const [duplicateHashes, setDuplicateHashes] = useState<Map<string, string[]>>(new Map());

  // Analyze images when they change
  useEffect(() => {
    if (images.length === 0 || !smartEnabled) {
      setAnalysisResult(null);
      return;
    }

    const analyzeImages = async () => {
      setIsAnalyzing(true);

      try {
        // Convert ImageFile[] to ExtractedImage[] format for analysis
        const imagesToAnalyze: ExtractedImage[] = await Promise.all(
          images.map(async (img, index) => {
            // Get image dimensions if not already loaded
            if (!img.width || !img.height) {
              const dimensions = await getImageDimensions(img.file);
              img.width = dimensions.width;
              img.height = dimensions.height;
            }

            return {
              id: img.id,
              blob: img.file,
              filename: img.name,
              width: img.width || 0,
              height: img.height || 0,
              pageNumber: index + 1,
              format: img.file.type.includes('png') ? 'png' : 'jpg',
              size: img.size,
              previewUrl: img.preview,
            } as ExtractedImage;
          })
        );

        // Run analysis
        const analysis = smartImageFilterService.analyzeImages(imagesToAnalyze);
        setAnalysisResult(analysis);

        // Detect duplicates using crypto.subtle
        const hashes = await Promise.all(
          images.map(async (img) => {
            const buffer = await img.file.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return { id: img.id, hash: hashHex };
          })
        );

        // Group duplicates
        const duplicateMap = new Map<string, string[]>();
        hashes.forEach(({ id, hash }) => {
          if (!duplicateMap.has(hash)) {
            duplicateMap.set(hash, []);
          }
          duplicateMap.get(hash)!.push(id);
        });

        // Filter out non-duplicates
        const actualDuplicates = new Map<string, string[]>();
        duplicateMap.forEach((ids, hash) => {
          if (ids.length > 1) {
            actualDuplicates.set(hash, ids);
          }
        });

        setDuplicateHashes(actualDuplicates);
      } catch (error) {
        console.error('Image analysis failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    // Debounce analysis
    const timeoutId = setTimeout(analyzeImages, 500);
    return () => clearTimeout(timeoutId);
  }, [images, smartEnabled]);

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFilesSelected = async (selectedFiles: File[]) => {
    const newImages: ImageFile[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const preview = URL.createObjectURL(file);

      // Get dimensions
      const dimensions = await getImageDimensions(file);

      newImages.push({
        id: `${Date.now()}-${i}`,
        file,
        name: file.name,
        size: file.size,
        preview,
        width: dimensions.width,
        height: dimensions.height,
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

  const handleApplyFilter = (filterId: string) => {
    if (!analysisResult) return;

    const presets = smartImageFilterService.getFilterPresets();
    const preset = presets.find(p => p.id === filterId);
    if (!preset) return;

    // Get categorized images
    const categorizedImages = analysisResult.categories.flatMap(cat => cat.images);

    // Apply filter - mark as hidden instead of removing
    const filtered = categorizedImages.filter(preset.filter);
    const filteredIds = new Set(filtered.map(img => img.id));

    // Mark images as hidden/visible
    setImages(prev => prev.map(img => ({
      ...img,
      hidden: !filteredIds.has(img.id)
    })));
  };

  const handleSelectCategory = (category: string, selected: boolean) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(category);
      } else {
        newSet.delete(category);
      }
      return newSet;
    });

    // Filter images by selected categories
    if (analysisResult) {
      const selectedCats = selected
        ? new Set([...selectedCategories, category])
        : new Set([...selectedCategories].filter(c => c !== category));

      if (selectedCats.size === 0) {
        // If nothing selected, show all
        setImages(prev => prev.map(img => ({ ...img, hidden: false })));
        return;
      }

      const categoriesToShow = analysisResult.categories
        .filter(cat => selectedCats.has(cat.category))
        .flatMap(cat => cat.images);

      const idsToShow = new Set(categoriesToShow.map(img => img.id));

      // Mark images as hidden/visible instead of removing
      setImages(prev => prev.map(img => ({
        ...img,
        hidden: !idsToShow.has(img.id)
      })));
    }
  };

  const handleRemoveDuplicates = () => {
    // Keep only first image from each duplicate group
    const idsToRemove = new Set<string>();
    duplicateHashes.forEach((ids) => {
      // Remove all but the first
      ids.slice(1).forEach(id => idsToRemove.add(id));
    });

    setImages(prev => {
      prev.forEach(img => {
        if (idsToRemove.has(img.id)) {
          URL.revokeObjectURL(img.preview);
        }
      });
      return prev.filter(img => !idsToRemove.has(img.id));
    });
  };

  const handleAutoRotate = () => {
    // Auto-detect orientation based on image dimensions
    const rotatedImages = images.map(img => {
      if (img.width && img.height) {
        const isLandscape = img.width > img.height;
        // This would require actual image rotation, which is complex
        // For now, we'll just suggest orientation
        return img;
      }
      return img;
    });

    // Detect if most images are landscape or portrait
    const landscapeCount = images.filter(img => (img.width || 0) > (img.height || 0)).length;
    const portraitCount = images.length - landscapeCount;

    if (landscapeCount > portraitCount) {
      setOrientation('landscape');
    } else {
      setOrientation('portrait');
    }
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
    // Filter out hidden images
    const visibleImages = images.filter(img => !img.hidden);

    if (visibleImages.length === 0) {
      alert(t('imagesToPdf.errors.noImages'));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      const imageFiles = visibleImages.map((img) => img.file);
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
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setResult(null);
    setProgress(0);
    setProgressMessage('');
    setAnalysisResult(null);
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

  const duplicateCount = Array.from(duplicateHashes.values()).reduce((sum, ids) => sum + ids.length - 1, 0);
  const visibleImagesCount = images.filter(img => !img.hidden).length;
  const hiddenImagesCount = images.filter(img => img.hidden).length;

  return (
    <div className="images-to-pdf space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('tools.images-to-pdf.name')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('tools.images-to-pdf.description')}
        </p>
      </div>

        {!result ? (
          <>
            {/* File Upload */}
            <Card>
              <CardContent className="p-6">
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
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-ocean-900 dark:text-white">
                          {t('imagesToPdf.imagesList')} ({visibleImagesCount})
                        </h3>
                        {hiddenImagesCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {hiddenImagesCount} hidden
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {hiddenImagesCount > 0 && (
                          <Button
                            onClick={() => setImages(prev => prev.map(img => ({ ...img, hidden: false })))}
                            variant="outline"
                            className="text-sm"
                          >
                            👁️ Show All ({images.length})
                          </Button>
                        )}
                        {duplicateCount > 0 && (
                          <Button
                            onClick={handleRemoveDuplicates}
                            variant="outline"
                            className="text-sm"
                          >
                            🗑️ {t('smartOrganize.removeDuplicates')} ({duplicateCount})
                          </Button>
                        )}
                        <Button
                          onClick={handleAutoRotate}
                          variant="outline"
                          className="text-sm"
                        >
                          🔄 Auto Orientation
                        </Button>
                        <Button
                          onClick={handleReset}
                          variant="ghost"
                          className="text-sm text-ocean-600 dark:text-ocean-400"
                        >
                          {t('common.clearAll')}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {images.filter(img => !img.hidden).map((image, index) => (
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
                            <Button
                              onClick={() => handleRemoveImage(image.id)}
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-2 transition-opacity hover:bg-red-600"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </Button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 truncate">
                            {index + 1}. {image.name}
                          </div>
                          {image.width && image.height && (
                            <div className="absolute top-1 right-1">
                              <Badge variant="secondary" className="text-[10px]">
                                {image.width}×{image.height}
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Smart Image Filter */}
            {images.length > 0 && (
              <SmartImageFilterPanel
                analysisResult={analysisResult}
                isAnalyzing={isAnalyzing}
                enabled={smartEnabled}
                onToggle={setSmartEnabled}
                onApplyFilter={handleApplyFilter}
                onSelectCategory={handleSelectCategory}
                selectedCategories={selectedCategories}
              />
            )}

            {/* Settings */}
            {images.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-ocean-900 dark:text-white mb-4">
                    {t('imagesToPdf.settings')}
                  </h3>

                  {/* Page Size */}
                  <div className="mb-4">
                    <Label className="block text-sm font-medium text-ocean-700 dark:text-ocean-300 mb-2">
                      {t('imagesToPdf.pageSize')}
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['fit', 'a4', 'letter'] as PageSize[]).map((size) => (
                        <Button
                          key={size}
                          onClick={() => setPageSize(size)}
                          variant="outline"
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            pageSize === size
                              ? 'bg-ocean-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-ocean-700 dark:text-ocean-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {t(`imagesToPdf.pageSizes.${size}`)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Orientation */}
                  <div className="mb-4">
                    <Label className="block text-sm font-medium text-ocean-700 dark:text-ocean-300 mb-2">
                      {t('imagesToPdf.orientation')}
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['portrait', 'landscape'] as Orientation[]).map((orient) => (
                        <Button
                          key={orient}
                          onClick={() => setOrientation(orient)}
                          variant="outline"
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            orientation === orient
                              ? 'bg-ocean-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-ocean-700 dark:text-ocean-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {t(`imagesToPdf.orientations.${orient}`)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Margin */}
                  <div>
                    <Label className="block text-sm font-medium text-ocean-700 dark:text-ocean-300 mb-2">
                      {t('imagesToPdf.margin')}: {margin}px
                    </Label>
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
                </CardContent>
              </Card>
            )}

            {/* Convert Button */}
            {images.length > 0 && !isProcessing && (
              <div className="flex justify-center">
                <Button
                  onClick={handleConvert}
                  className="px-8 py-4 bg-ocean-500 text-white text-lg font-semibold rounded-xl hover:bg-ocean-600 transition-colors shadow-lg hover:shadow-xl"
                >
                  {t('imagesToPdf.convert')}
                </Button>
              </div>
            )}

            {/* Progress */}
            {isProcessing && (
              <Card>
                <CardContent className="p-6">
                  <ProgressBar progress={progress} message={progressMessage} />
                </CardContent>
              </Card>
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
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-ocean-900 dark:text-white mb-4">
                  {t('common.preview')}
                </h3>
                <PDFMultiPagePreview
                  file={new File([result.blob], 'images-to-pdf.pdf', { type: 'application/pdf' })}
                  maxPages={10}
                  pageWidth={200}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleDownload}
                size="lg"
                className="px-8 !bg-green-600 hover:!bg-green-700 !text-white"
              >
                {t('common.download')}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
              >
                {t('common.convertAnother')}
              </Button>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('common.quickActions')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(['compress-pdf', 'protect-pdf', 'watermark-pdf'] as Tool[]).map((toolId) => (
                    <Button
                      key={toolId}
                      onClick={() => handleQuickAction(toolId)}
                      variant="outline"
                      className="h-auto justify-start p-4 border-2 hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 group"
                    >
                      <div className="text-left ml-3">
                        <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                          {t(`tools.${toolId}.name`)}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
};
