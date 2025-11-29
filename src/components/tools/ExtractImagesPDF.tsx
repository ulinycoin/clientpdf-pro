import React, { useState, useEffect } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useI18n } from '@/hooks/useI18n';
import pdfService from '@/services/pdfService';
import smartImageFilterService from '@/services/smartImageFilterService';
import type { CategorizedImage, SmartImageFilterAnalysis, ImageCategory } from '@/services/smartImageFilterService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { PDFProcessingResult, ExtractedImage } from '@/types/pdf';

export const ExtractImagesPDF: React.FC = () => {
    const { t } = useI18n();
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const [extractedImages, setExtractedImages] = useState<ExtractedImage[]>([]);
    const [categorizedImages, setCategorizedImages] = useState<CategorizedImage[]>([]);
    const [filterAnalysis, setFilterAnalysis] = useState<SmartImageFilterAnalysis | null>(null);
    const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
    const [result, setResult] = useState<PDFProcessingResult<any> | null>(null);
    const [mode, setMode] = useState<'extract' | 'remove'>('extract');
    const [activeFilter, setActiveFilter] = useState<'all' | ImageCategory>('all');
    const [smartFilterEnabled] = useState(true);

    const handleFileSelected = (selectedFiles: File[]) => {
        if (selectedFiles.length > 0) {
            setFile(selectedFiles[0]);
            setResult(null);
            setExtractedImages([]);
            setCategorizedImages([]);
            setFilterAnalysis(null);
            setSelectedImageIds(new Set());
            setActiveFilter('all');
        }
    };

    const handleProcess = async () => {
        if (!file) return;

        setIsProcessing(true);
        setResult(null);
        setProgress(0);
        setExtractedImages([]);
        setSelectedImageIds(new Set());

        try {
            // First, extract images to show preview in both modes
            const extractResult = await pdfService.extractImages(
                file,
                (p: number, msg: string) => {
                    setProgress(p * 0.5); // First 50% for extraction
                    setProgressMessage(msg);
                }
            );

            if (extractResult.success && extractResult.data) {
                setExtractedImages(extractResult.data);

                // Analyze and categorize images
                if (smartFilterEnabled && extractResult.data.length > 0) {
                    setProgress(60);
                    setProgressMessage('Analyzing image types...');

                    const analysis = smartImageFilterService.analyzeImages(extractResult.data);
                    setFilterAnalysis(analysis);
                    const allCategorized = analysis.categories.flatMap(cat => cat.images);
                    setCategorizedImages(allCategorized);

                    if (mode === 'extract') {
                        // Auto-select useful images
                        const usefulIds = analysis.usefulImages.map(img => img.id);
                        setSelectedImageIds(new Set(usefulIds.length > 0 ? usefulIds : extractResult.data.map(img => img.id)));
                        setResult(extractResult);
                        setProgress(100);
                    } else {
                        setSelectedImageIds(new Set(extractResult.data.map(img => img.id)));
                        setProgress(50);
                    }
                } else {
                    if (mode === 'extract') {
                        setSelectedImageIds(new Set(extractResult.data.map(img => img.id)));
                        setResult(extractResult);
                        setProgress(100);
                    } else {
                        setSelectedImageIds(new Set(extractResult.data.map(img => img.id)));
                        setProgress(50);
                    }
                }
            } else {
                setResult(extractResult);
            }

        } catch (error) {
            console.error('Operation failed:', error);
            setResult({
                success: false,
                error: {
                    code: 'PROCESSING_FAILED',
                    message: error instanceof Error ? error.message : 'Operation failed'
                }
            });
        } finally {
            if (mode === 'extract') {
                setIsProcessing(false);
            } else {
                // For remove mode, keep processing state until user confirms
                setIsProcessing(false);
            }
        }
    };

    const handleRemoveSelected = async () => {
        if (!file || selectedImageIds.size === 0) return;

        setIsProcessing(true);
        setProgress(50);
        setProgressMessage('Removing selected images...');

        try {
            const imageIdsArray = Array.from(selectedImageIds);
            const processResult = await pdfService.removeSelectedImages(
                file,
                imageIdsArray,
                extractedImages,
                (p: number, msg: string) => {
                    setProgress(50 + p * 0.5);
                    setProgressMessage(msg);
                }
            );

            setResult(processResult);
        } catch (error) {
            console.error('Remove failed:', error);
            setResult({
                success: false,
                error: {
                    code: 'PROCESSING_FAILED',
                    message: error instanceof Error ? error.message : 'Remove failed'
                }
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleToggleImage = (imageId: string) => {
        setSelectedImageIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(imageId)) {
                newSet.delete(imageId);
            } else {
                newSet.add(imageId);
            }
            return newSet;
        });
    };

    const handleToggleAll = () => {
        if (selectedImageIds.size === extractedImages.length) {
            setSelectedImageIds(new Set());
        } else {
            setSelectedImageIds(new Set(extractedImages.map(img => img.id)));
        }
    };

    const handleDownload = async () => {
        if (mode === 'extract' && extractedImages.length > 0) {
            const selectedImages = extractedImages.filter(img => selectedImageIds.has(img.id));

            if (selectedImages.length === 0) {
                alert(t('extractImages.noImagesSelected') || 'Please select at least one image to download.');
                return;
            }

            const baseName = file?.name.replace(/\.pdf$/i, '') || 'images';

            if (selectedImages.length === 1) {
                // Download single image directly
                pdfService.downloadFile(selectedImages[0].blob, selectedImages[0].filename);
            } else {
                // Create ZIP for multiple images
                const filesToZip = selectedImages.map(img => ({ blob: img.blob, filename: img.filename }));
                await pdfService.downloadAsZip(filesToZip, `${baseName}_images.zip`);
            }
        } else if (mode === 'remove' && result?.success && result.data) {
            const baseName = file?.name.replace(/\.pdf$/i, '') || 'document';
            pdfService.downloadFile(result.data, `${baseName}_no_images.pdf`);
        }
    };

    const handleQuickFilter = (filterId: string) => {
        const presets = smartImageFilterService.getFilterPresets();
        const preset = presets.find(p => p.id === filterId);
        if (preset && categorizedImages.length > 0) {
            const filtered = categorizedImages.filter(preset.filter);
            setSelectedImageIds(new Set(filtered.map(img => img.id)));
        }
    };

    const getFilteredImages = (): (ExtractedImage | CategorizedImage)[] => {
        if (!smartFilterEnabled || categorizedImages.length === 0) {
            return extractedImages;
        }
        if (activeFilter === 'all') {
            return categorizedImages;
        }
        return categorizedImages.filter(img => img.category === activeFilter);
    };

    const handleReset = () => {
        // Clean up blob URLs
        extractedImages.forEach(img => {
            if (img.previewUrl) {
                URL.revokeObjectURL(img.previewUrl);
            }
        });

        setFile(null);
        setResult(null);
        setProgress(0);
        setProgressMessage('');
        setIsProcessing(false);
        setExtractedImages([]);
        setCategorizedImages([]);
        setFilterAnalysis(null);
        setSelectedImageIds(new Set());
        setActiveFilter('all');
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            extractedImages.forEach(img => {
                if (img.previewUrl) {
                    URL.revokeObjectURL(img.previewUrl);
                }
            });
        };
    }, [extractedImages]);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
    };

    return (
        <div className="extract-images-pdf space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {t('extractImages.title') || 'Extract & Remove Images'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    {t('extractImages.description') || 'Extract all images from a PDF or remove them to reduce file size.'}
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
                            maxSizeMB={100}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Options */}
            {file && !result && (
                <Card className="space-y-6 p-6">
                    {/* File Info */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <span className="text-xl">📄</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                        </div>
                    </div>

                    {/* Mode Selection */}
                    <Tabs value={mode} onValueChange={(v) => setMode(v as 'extract' | 'remove')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="extract">{t('extractImages.modeExtract') || 'Extract Images'}</TabsTrigger>
                            <TabsTrigger value="remove">{t('extractImages.modeRemove') || 'Remove Images'}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="extract" className="mt-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('extractImages.extractDescription') || 'Extract all images found in the PDF. You can preview and select which images to download.'}
                            </p>
                        </TabsContent>
                        <TabsContent value="remove" className="mt-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('extractImages.removeDescription') || 'Remove all images from the PDF to reduce file size. Text and other content will be preserved.'}
                            </p>
                        </TabsContent>
                    </Tabs>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            onClick={handleProcess}
                            disabled={isProcessing}
                            className="flex-1 px-6 py-3"
                        >
                            {isProcessing ? t('common.processing') : (mode === 'extract' ? (t('extractImages.extractBtn') || 'Extract Images') : (t('extractImages.removeBtn') || 'Remove Images'))}
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
                    <ProgressBar progress={progress} message={progressMessage} />
                </Card>
            )}

            {/* Image Preview Grid - Extract mode shows after extraction, Remove mode shows before removal */}
            {extractedImages.length > 0 && ((mode === 'extract' && result?.success) || (mode === 'remove' && !result)) && (
                <Card className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {mode === 'extract'
                                    ? (t('extractImages.previewTitle') || 'Extracted Images')
                                    : (t('extractImages.previewTitleRemove') || 'Select Images to Remove')
                                }
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {mode === 'extract'
                                    ? `Found ${extractedImages.length} images. Select images to download.`
                                    : `Found ${extractedImages.length} images. Select images to remove from PDF.`
                                }
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={selectedImageIds.size === extractedImages.length}
                                    onCheckedChange={handleToggleAll}
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('extractImages.selectAll') || 'Select All'}
                                </span>
                            </label>
                            <Button
                                onClick={mode === 'extract' ? handleDownload : handleRemoveSelected}
                                disabled={selectedImageIds.size === 0 || isProcessing}
                                className="px-6 py-2"
                            >
                                {mode === 'extract'
                                    ? `Download (${selectedImageIds.size})`
                                    : `Remove (${selectedImageIds.size})`
                                }
                            </Button>
                        </div>
                    </div>

                    {/* Smart Filter UI */}
                    {smartFilterEnabled && filterAnalysis && mode === 'extract' && (
                        <div className="space-y-4">
                            <div className="border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                    <button
                                        onClick={() => setActiveFilter('all')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                            activeFilter === 'all'
                                                ? 'bg-ocean-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        All ({extractedImages.length})
                                    </button>
                                    {filterAnalysis.categories.map(cat => (
                                        <button
                                            key={cat.category}
                                            onClick={() => setActiveFilter(cat.category)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                                                activeFilter === cat.category
                                                    ? 'bg-ocean-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            <span>{cat.icon}</span>
                                            <span>{cat.label} ({cat.count})</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-ocean-50 dark:bg-ocean-900/20 border border-ocean-200 dark:border-ocean-800 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-ocean-700 dark:text-ocean-300">
                                        Quick Filters
                                    </h4>
                                    <span className="text-xs text-ocean-600 dark:text-ocean-400">
                                        {filterAnalysis.usefulImages.length} useful / {filterAnalysis.likelyJunk.length} junk detected
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {smartImageFilterService.getFilterPresets().map(preset => (
                                        <Button
                                            key={preset.id}
                                            onClick={() => handleQuickFilter(preset.id)}
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-auto py-2 px-3 border-ocean-300 dark:border-ocean-700 hover:bg-ocean-100 dark:hover:bg-ocean-900/40"
                                            title={preset.description}
                                        >
                                            <span className="mr-1.5">{preset.icon}</span>
                                            {preset.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {getFilteredImages().map((image) => (
                            <div
                                key={image.id}
                                className={`relative group rounded-lg border-2 transition-all cursor-pointer overflow-hidden ${selectedImageIds.has(image.id)
                                        ? 'border-ocean-500 dark:border-ocean-400 ring-2 ring-ocean-500/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-ocean-300 dark:hover:border-ocean-600'
                                    }`}
                                onClick={() => handleToggleImage(image.id)}
                            >
                                {/* Checkbox */}
                                <div className="absolute top-2 left-2 z-10">
                                    <Checkbox
                                        checked={selectedImageIds.has(image.id)}
                                        onCheckedChange={() => handleToggleImage(image.id)}
                                        className="bg-white dark:bg-gray-800 shadow-lg"
                                    />
                                </div>

                                {/* Category Badge */}
                                {smartFilterEnabled && 'category' in image && (
                                    <div className="absolute top-2 right-2 z-10">
                                        <Badge
                                            variant="secondary"
                                            className={`text-xs px-2 py-0.5 ${
                                                image.category === 'photo'
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                    : image.category === 'chart'
                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                    : image.category === 'icon' || image.category === 'decoration'
                                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                            }`}
                                        >
                                            {image.category === 'photo' && '📷'}
                                            {image.category === 'chart' && '📊'}
                                            {image.category === 'logo' && '🏢'}
                                            {image.category === 'icon' && '🔘'}
                                            {image.category === 'decoration' && '✨'}
                                            {image.category === 'other' && '🖼️'}
                                        </Badge>
                                    </div>
                                )}

                                {/* Image Preview */}
                                <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-2">
                                    {image.previewUrl ? (
                                        <img
                                            src={image.previewUrl}
                                            alt={image.filename}
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    ) : (
                                        <span className="text-4xl">🖼️</span>
                                    )}
                                </div>

                                {/* Image Info */}
                                <div className="p-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                        {image.filename}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <span>{image.width}×{image.height}</span>
                                        <span>{formatFileSize(image.size)}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        Page {image.pageNumber}
                                    </p>
                                </div>

                                {/* Selection Overlay */}
                                {selectedImageIds.has(image.id) && (
                                    <div className="absolute inset-0 bg-ocean-500/10 dark:bg-ocean-400/10 pointer-events-none" />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {mode === 'extract'
                                ? `${selectedImageIds.size} of ${extractedImages.length} images selected for download`
                                : `${selectedImageIds.size} of ${extractedImages.length} images selected for removal`
                            }
                        </p>
                        <Button
                            onClick={handleReset}
                            variant="secondary"
                            className="px-6 py-2"
                        >
                            {t('common.cancel') || 'Cancel'}
                        </Button>
                    </div>
                </Card>
            )}

            {/* Remove Mode Success */}
            {result?.success && mode === 'remove' && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
                    <div className="text-4xl mb-4">🎉</div>
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                        {t('common.success')}
                    </h3>
                    <p className="text-green-700 dark:text-green-300 mb-6">
                        {t('extractImages.successRemove') || 'Successfully removed images from PDF.'}
                    </p>

                    <div className="flex justify-center gap-4">
                        <Button
                            onClick={handleDownload}
                            className="px-8 py-3"
                        >
                            {t('common.download')}
                        </Button>
                        <Button
                            onClick={handleReset}
                            variant="secondary"
                            className="px-8 py-3"
                        >
                            {t('common.convertAnother')}
                        </Button>
                    </div>
                </div>
            )}

            {/* Error State */}
            {result && !result.success && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                        {t('common.error')}
                    </h3>
                    <p className="text-red-700 dark:text-red-300">{result.error?.message || 'Unknown error'}</p>
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
    );
};
