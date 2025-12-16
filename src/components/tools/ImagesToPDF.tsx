import React, { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PDFMultiPagePreview } from '@/components/common/PDFMultiPagePreview';
import { SmartImageFilterPanel } from '@/components/smart/SmartImageFilterPanel';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import pdfService from '@/services/pdfService';
import smartImageFilterService, { type SmartImageFilterAnalysis } from '@/services/smartImageFilterService';
import type { Tool } from '@/types';
import type { ExtractedImage } from '@/types/pdf';
import { HASH_TOOL_MAP } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, RotateCw, Trash2, Eye } from 'lucide-react';

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
        const imagesToAnalyze: ExtractedImage[] = await Promise.all(
          images.map(async (img, index) => {
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

        const analysis = smartImageFilterService.analyzeImages(imagesToAnalyze);
        setAnalysisResult(analysis);

        const hashes = await Promise.all(
          images.map(async (img) => {
            const buffer = await img.file.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return { id: img.id, hash: hashHex };
          })
        );

        const duplicateMap = new Map<string, string[]>();
        hashes.forEach(({ id, hash }) => {
          if (!duplicateMap.has(hash)) duplicateMap.set(hash, []);
          duplicateMap.get(hash)!.push(id);
        });

        const actualDuplicates = new Map<string, string[]>();
        duplicateMap.forEach((ids, hash) => {
          if (ids.length > 1) actualDuplicates.set(hash, ids);
        });

        setDuplicateHashes(actualDuplicates);
      } catch (error) {
        console.error('Image analysis failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    const timeoutId = setTimeout(analyzeImages, 500);
    return () => clearTimeout(timeoutId);
  }, [images, smartEnabled]);

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFilesSelected = async (selectedFiles: File[]) => {
    const newImages: ImageFile[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (!file.type.startsWith('image/')) continue;
      const preview = URL.createObjectURL(file);
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
    setResult(null);
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) URL.revokeObjectURL(image.preview);
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleApplyFilter = (filterId: string) => {
    if (!analysisResult) return;
    const presets = smartImageFilterService.getFilterPresets();
    const preset = presets.find(p => p.id === filterId);
    if (!preset) return;
    const categorizedImages = analysisResult.categories.flatMap(cat => cat.images);
    const filtered = categorizedImages.filter(preset.filter);
    const filteredIds = new Set(filtered.map(img => img.id));
    setImages(prev => prev.map(img => ({ ...img, hidden: !filteredIds.has(img.id) })));
  };

  const handleSelectCategory = (category: string, selected: boolean) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (selected) newSet.add(category);
      else newSet.delete(category);
      return newSet;
    });

    if (analysisResult) {
      const selectedCats = selected
        ? new Set([...selectedCategories, category])
        : new Set([...selectedCategories].filter(c => c !== category));

      if (selectedCats.size === 0) {
        setImages(prev => prev.map(img => ({ ...img, hidden: false })));
        return;
      }
      const categoriesToShow = analysisResult.categories.filter(cat => selectedCats.has(cat.category)).flatMap(cat => cat.images);
      const idsToShow = new Set(categoriesToShow.map(img => img.id));
      setImages(prev => prev.map(img => ({ ...img, hidden: !idsToShow.has(img.id) })));
    }
  };

  const handleRemoveDuplicates = () => {
    const idsToRemove = new Set<string>();
    duplicateHashes.forEach((ids) => ids.slice(1).forEach(id => idsToRemove.add(id)));
    setImages(prev => {
      prev.forEach(img => { if (idsToRemove.has(img.id)) URL.revokeObjectURL(img.preview); });
      return prev.filter(img => !idsToRemove.has(img.id));
    });
  };

  const handleAutoRotate = () => {
    const landscapeCount = images.filter(img => (img.width || 0) > (img.height || 0)).length;
    const portraitCount = images.length - landscapeCount;
    setOrientation(landscapeCount > portraitCount ? 'landscape' : 'portrait');
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);

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

  const handleDragEnd = () => setDraggedIndex(null);

  const handleConvert = async () => {
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
        (prog, msg) => { setProgress(prog); setProgressMessage(msg); },
        { pageSize, orientation, margin }
      );

      if (result.success && result.data) {
        setResult({ blob: result.data, metadata: result.metadata });
      } else {
        alert(result.error?.message || 'Conversion failed');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred during conversion');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result?.blob) pdfService.downloadFile(result.blob, 'images-to-pdf.pdf');
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
    setTimeout(() => {
      window.location.hash = HASH_TOOL_MAP[toolId];
    }, 100);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const duplicateCount = Array.from(duplicateHashes.values()).reduce((sum, ids) => sum + ids.length - 1, 0);
  const visibleImagesCount = images.filter(img => !img.hidden).length;
  const hiddenImagesCount = images.filter(img => img.hidden).length;

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Smart Filter Panel (Collapsed/Expanded logic inside component) */}
      <SmartImageFilterPanel
        analysisResult={analysisResult}
        isAnalyzing={isAnalyzing}
        enabled={smartEnabled}
        onToggle={setSmartEnabled}
        onApplyFilter={handleApplyFilter}
        onSelectCategory={handleSelectCategory}
        selectedCategories={selectedCategories}
      />

      <div className="grid grid-cols-1 gap-4">
        {/* Page Size */}
        <div>
          <Label>{t('imagesToPdf.pageSize')}</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {(['fit', 'a4', 'letter'] as PageSize[]).map((size) => (
              <Button
                key={size}
                onClick={() => setPageSize(size)}
                variant={pageSize === size ? "default" : "outline"}
                size="sm"
                className="w-full"
              >
                {t(`imagesToPdf.pageSizes.${size}`)}
              </Button>
            ))}
          </div>
        </div>

        {/* Orientation */}
        <div>
          <Label>{t('imagesToPdf.orientation')}</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {(['portrait', 'landscape'] as Orientation[]).map((orient) => (
              <Button
                key={orient}
                onClick={() => setOrientation(orient)}
                variant={orientation === orient ? "default" : "outline"}
                size="sm"
                className="w-full"
              >
                {t(`imagesToPdf.orientations.${orient}`)}
              </Button>
            ))}
          </div>
        </div>

        {/* Margin */}
        <div>
          <Label>{t('imagesToPdf.margin')}: {margin}px</Label>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={margin}
            onChange={(e) => setMargin(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-2"
          />
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (!images.length) return null; // Should process onUpload instead

    if (result) {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('common.success')}
              </h2>
              <div className="text-gray-600 dark:text-gray-400 space-y-1">
                <p>{t('imagesToPdf.successMessage', { count: result.metadata?.pageCount || images.length })}</p>
                <p className="text-sm">{t('common.fileSize')}: {formatFileSize(result.metadata?.processedSize || 0)}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={handleDownload} size="lg" className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all">
              {t('common.download')}
            </Button>
            <Button variant="outline" onClick={handleReset} size="lg">
              {t('common.convertAnother')}
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-ocean-900 dark:text-white">
              {t('imagesToPdf.imagesList')} ({visibleImagesCount})
            </h3>
            {hiddenImagesCount > 0 && <Badge variant="secondary">{hiddenImagesCount} hidden</Badge>}
          </div>
          <div className="flex gap-2">
            {hiddenImagesCount > 0 && (
              <Button onClick={() => setImages(prev => prev.map(img => ({ ...img, hidden: false })))} variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" /> Show All
              </Button>
            )}
            {duplicateCount > 0 && (
              <Button onClick={handleRemoveDuplicates} variant="outline" size="sm">
                <Trash2 className="w-4 h-4 mr-2" /> {t('smartOrganize.removeDuplicates')} ({duplicateCount})
              </Button>
            )}
            <Button onClick={handleAutoRotate} variant="outline" size="sm">
              <RotateCw className="w-4 h-4 mr-2" /> Auto Orientation
            </Button>
            <Button onClick={handleReset} variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
              {t('common.clearAll')}
            </Button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.filter(img => !img.hidden).map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative group cursor-move border-2 rounded-lg overflow-hidden transition-all bg-white dark:bg-gray-800 ${draggedIndex === index ? 'border-ocean-500 shadow-lg scale-105' : 'border-gray-200 dark:border-gray-700'
                }`}
            >
              <div className="aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-900">
                <img src={image.preview} alt={image.name} className="w-full h-full object-contain" />
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button onClick={() => handleRemoveImage(image.id)} variant="destructive" size="icon" className="h-8 w-8 rounded-full shadow-md">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-2 text-xs truncate border-t dark:border-gray-700">
                {index + 1}. {image.name}
              </div>
              {image.width && image.height && (
                <Badge variant="secondary" className="absolute top-2 left-2 text-[10px] opacity-75">
                  {image.width}×{image.height}
                </Badge>
              )}
            </div>
          ))}
          {/* Upload More Box */}
          <div className="aspect-[3/4] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-gray-500 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all"
            onClick={() => document.getElementById('tool-layout-upload-input')?.click()}
          >
            <span className="text-4xl mb-2">+</span>
            <span className="text-sm">Add More</span>
          </div>
        </div>
      </div>
    );
  };

  const renderActions = () => (
    <Button
      onClick={handleConvert}
      disabled={isProcessing || !images.length}
      className="w-full py-6 text-lg rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
    >
      {isProcessing ? t('common.processing') : t('imagesToPdf.convert')}
    </Button>
  );

  return (
    <ToolLayout
      title={t('tools.images-to-pdf.name')}
      description={t('tools.images-to-pdf.description')}
      hasFiles={images.length > 0}
      onUpload={handleFilesSelected}
      isProcessing={isProcessing}
      maxFiles={50}
      uploadTitle={t('common.selectFile')}
      uploadDescription={t('upload.multipleFilesAllowed')}
      accept="image/jpeg,image/jpg,image/png"
      settings={!result ? renderSettings() : null}
      actions={!result ? renderActions() : null}
    >
      {renderContent()}
    </ToolLayout>
  );
};
