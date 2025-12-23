import React, { useState } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';

import { useI18n } from '@/hooks/useI18n';
import pdfService from '@/services/pdfService';
import smartImageFilterService from '@/services/smartImageFilterService';
import type { CategorizedImage, SmartImageFilterAnalysis, ImageCategory } from '@/services/smartImageFilterService';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { ExtractedImage, PDFProcessingResult } from '@/types/pdf';
import { Label } from '@/components/ui/label';
import { CheckCircle2, ImageIcon, Sparkles, Filter, Trash2, Download, ArrowLeft } from 'lucide-react';

export const ExtractImagesPDF: React.FC = () => {
    const { t } = useI18n();
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const [extractedImages, setExtractedImages] = useState<ExtractedImage[]>([]);
    const [categorizedImages, setCategorizedImages] = useState<CategorizedImage[]>([]);
    const [filterAnalysis, setFilterAnalysis] = useState<SmartImageFilterAnalysis | null>(null);
    const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
    const [result, setResult] = useState<PDFProcessingResult<Blob | ExtractedImage[]> | null>(null);
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
        setExtractedImages([]);
        setSelectedImageIds(new Set());

        try {
            const extractResult = await pdfService.extractImages(
                file,
                () => { }
            );

            if (extractResult.success && extractResult.data) {
                setExtractedImages(extractResult.data);

                if (smartFilterEnabled && extractResult.data.length > 0) {
                    const analysis = await smartImageFilterService.analyzeImages(extractResult.data);
                    if (smartFilterEnabled && extractResult.data.length > 0) {
                        setFilterAnalysis(analysis);
                        const allCategorized = analysis.categories.flatMap(cat => cat.images);
                        setCategorizedImages(allCategorized);

                        if (mode === 'extract') {
                            const usefulIds = analysis.usefulImages.map(img => img.id);
                            setSelectedImageIds(new Set(usefulIds.length > 0 ? usefulIds : extractResult.data.map(img => img.id)));
                            setResult(extractResult);
                        } else {
                            setSelectedImageIds(new Set(extractResult.data.map(img => img.id)));
                        }
                    } else {
                        setSelectedImageIds(new Set(extractResult.data.map(img => img.id)));
                        if (mode === 'extract') setResult(extractResult);
                    }
                } else {
                    setResult(extractResult);
                }
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
                // Keep processing true for remove mode until confirmed? No, let's allow user to interact
                setIsProcessing(false);
            }
        }
    };

    const handleRemoveSelected = async () => {
        if (!file || selectedImageIds.size === 0) return;

        setIsProcessing(true);

        try {
            const imageIdsArray = Array.from(selectedImageIds);
            const processResult = await pdfService.removeSelectedImages(
                file,
                imageIdsArray,
                extractedImages,
                () => { }
            );

            setResult(processResult);
        } catch (error) {
            console.error('Remove failed:', error);
            setResult({
                success: false,
                error: { code: 'PROCESSING_FAILED', message: error instanceof Error ? error.message : 'Remove failed' }
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleToggleImage = (imageId: string) => {
        setSelectedImageIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(imageId)) newSet.delete(imageId); else newSet.add(imageId);
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
                alert(t('extractImages.noImagesSelected') || 'Please select at least one image.');
                return;
            }
            const baseName = file?.name.replace(/\.pdf$/i, '') || 'images';
            if (selectedImages.length === 1) {
                pdfService.downloadFile(selectedImages[0].blob, selectedImages[0].filename);
            } else {
                const filesToZip = selectedImages.map(img => ({ blob: img.blob, filename: img.filename }));
                await pdfService.downloadAsZip(filesToZip, `${baseName}_images.zip`);
            }
        } else if (mode === 'remove' && result?.success && result.data && !(result.data instanceof Array)) {
            const baseName = file?.name.replace(/\.pdf$/i, '') || 'document';
            pdfService.downloadFile(result.data as Blob, `${baseName}_no_images.pdf`);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(1)} ${['B', 'KB', 'MB', 'GB'][i]}`;
    };

    const handleAnalyzeImages = () => {
        handleProcess();
    };

    const getFilteredImages = () => {
        if (!smartFilterEnabled || categorizedImages.length === 0) return extractedImages;
        if (activeFilter === 'all') return categorizedImages;
        return categorizedImages.filter(img => img.category === activeFilter);
    };

    const renderSettings = () => (
        <div className="space-y-6">
            <div className="space-y-4">
                <Label>{t('extractImages.mode') || 'Operation Mode'}</Label>
                <Tabs value={mode} onValueChange={(v) => setMode(v as 'extract' | 'remove')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="extract">{t('extractImages.modeExtract') || 'Extract'}</TabsTrigger>
                        <TabsTrigger value="remove">{t('extractImages.modeRemove') || 'Remove'}</TabsTrigger>
                    </TabsList>
                </Tabs>
                <p className="text-sm text-gray-500">
                    {mode === 'extract'
                        ? (t('extractImages.extractDescription') || 'Extract images from PDF.')
                        : (t('extractImages.removeDescription') || 'Remove images to reduce size.')}
                </p>
            </div>

            {smartFilterEnabled && filterAnalysis && mode === 'extract' && (
                <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <Filter className="w-4 h-4 text-accent-blue" />
                        <Label>{t('extractImages.smartFilter.quickFilters')}</Label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant={activeFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter('all')}>
                            All ({extractedImages.length})
                        </Button>
                        {filterAnalysis.categories.map(cat => (
                            <Button
                                key={cat.category}
                                variant={activeFilter === cat.category ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveFilter(cat.category)}
                            >
                                {t(`extractImages.smartFilter.categories.${cat.category}`)} ({cat.count})
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderContent = () => {
        if (result?.success && mode === 'remove') {
            return (
                <div className="text-center space-y-8 py-12">
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/20">
                        <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('common.success')}</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">{t('extractImages.successRemove')}</p>
                    </div>
                    <div className="flex justify-center gap-4">
                        <Button onClick={handleDownload} size="lg" className="h-14 px-8 rounded-2xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 dark:shadow-none transition-all">
                            <Download className="w-5 h-5 mr-2" />
                            {t('common.download')}
                        </Button>
                        <Button onClick={() => setFile(null)} variant="outline" size="lg" className="h-14 px-8 rounded-2xl font-bold border-2">
                            {t('common.processAnother')}
                        </Button>
                    </div>
                </div>
            );
        }

        if (extractedImages.length > 0) {
            const currentImages = getFilteredImages();
            return (
                <div className="space-y-6">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-accent-blue/10">
                                <ImageIcon className="w-5 h-5 text-accent-blue" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {mode === 'extract' ? t('extractImages.previewTitle') : t('extractImages.previewTitleRemove')}
                            </h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleToggleAll}
                            className="text-accent-blue hover:bg-accent-blue/10 font-medium"
                        >
                            {selectedImageIds.size === extractedImages.length ? t('split.deselectAll') : t('extractImages.selectAll')}
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto p-1 custom-scrollbar min-h-[400px]">
                        {currentImages.map((image) => (
                            <div
                                key={image.id}
                                className={`
                                    relative group rounded-[1.5rem] border-2 cursor-pointer overflow-hidden transition-all duration-300
                                    ${selectedImageIds.has(image.id)
                                        ? 'border-accent-blue bg-accent-blue/5 shadow-lg shadow-accent-blue/10 scale-[1.02]'
                                        : 'border-white/10 dark:border-white/5 bg-white/5 hover:border-white/30 hover:bg-white/10'
                                    }
                                `}
                                onClick={() => handleToggleImage(image.id)}
                            >
                                <div className={`absolute top-3 left-3 z-10 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${selectedImageIds.has(image.id) ? 'bg-accent-blue border-accent-blue' : 'border-white/40 bg-black/20'}`}>
                                    {selectedImageIds.has(image.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                                </div>

                                {(image as Partial<CategorizedImage>).category && (image as CategorizedImage).category !== 'other' && (
                                    <div className="absolute top-3 right-3 z-10">
                                        <Badge variant="secondary" className="bg-black/40 backdrop-blur-md border border-white/10 text-[10px] uppercase tracking-wider">
                                            {t(`extractImages.smartFilter.categories.${(image as CategorizedImage).category}`)}
                                        </Badge>
                                    </div>
                                )}

                                <div className="aspect-square flex items-center justify-center p-4">
                                    {image.previewUrl && (
                                        <img
                                            src={image.previewUrl}
                                            alt={image.filename}
                                            className="max-w-full max-h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500"
                                        />
                                    )}
                                </div>

                                <div className="px-4 py-2 bg-black/20 backdrop-blur-sm border-t border-white/5 text-[10px] text-gray-400 truncate">
                                    {image.filename}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (file && !result) {
            return (
                <div className="text-center py-20 space-y-6">
                    <div className="relative inline-block">
                        <div className="w-24 h-24 bg-accent-blue/10 rounded-[2rem] flex items-center justify-center mx-auto text-accent-blue animate-pulse-slow">
                            <ImageIcon className="w-12 h-12" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-blue rounded-full flex items-center justify-center text-white shadow-lg animate-bounce duration-3000">
                            <Sparkles className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{file.name}</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">{formatFileSize(file.size || 0)}</p>
                    </div>
                    <p className="text-lg text-gray-500">{t('ocr.analyzingContent')}</p>
                    <Button onClick={handleAnalyzeImages} disabled={isProcessing} className="h-16 px-10 rounded-2xl text-xl font-bold bg-accent-blue hover:bg-accent-blue/90 text-white shadow-xl shadow-accent-blue/20 transition-all hover:scale-105">
                        {isProcessing ? t('common.processing') : t('extractImages.removeBtn')}
                    </Button>
                </div>
            );
        }

        return null;
    };

    return (
        <ToolLayout
            title={t('tools.extract-images-pdf.name')}
            description={t('tools.extract-images-pdf.description')}
            hasFiles={!!file}
            onUpload={handleFileSelected}
            isProcessing={isProcessing}
            maxFiles={1}
            uploadTitle={t('common.selectFile')}
            uploadDescription={t('upload.singleFileAllowed')}
            acceptedTypes=".pdf"
            settings={file ? renderSettings() : null}
            actions={
                file && !result?.success ? (
                    extractedImages.length === 0 ? (
                        <Button onClick={handleAnalyzeImages} disabled={isProcessing} className="w-full h-12 rounded-xl font-bold bg-accent-blue text-white shadow-lg shadow-accent-blue/10">
                            {isProcessing ? <><span className="animate-spin mr-2">⏳</span> {t('common.processing')}</> : (t('extractImages.removeBtn'))}
                        </Button>
                    ) : (
                        <div className="space-y-4">
                            <Button
                                onClick={mode === 'extract' ? handleDownload : handleRemoveSelected}
                                disabled={isProcessing || selectedImageIds.size === 0}
                                className={`w-full h-14 rounded-xl text-lg font-bold text-white shadow-lg transition-all ${mode === 'extract' ? 'bg-accent-blue hover:bg-accent-blue/90 shadow-accent-blue/20' : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'}`}
                            >
                                {isProcessing ? (
                                    <span className="animate-spin">⏳</span>
                                ) : mode === 'extract' ? (
                                    <><Download className="w-5 h-5 mr-2" /> {t('extractImages.downloadSelected', { count: selectedImageIds.size })}</>
                                ) : (
                                    <><Trash2 className="w-5 h-5 mr-2" /> {t('extractImages.removeSelected', { count: selectedImageIds.size })}</>
                                )}
                            </Button>
                            <Button
                                onClick={() => {
                                    setExtractedImages([]);
                                    setSelectedImageIds(new Set());
                                }}
                                variant="ghost"
                                className="w-full h-12 rounded-xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {t('common.back')}
                            </Button>
                        </div>
                    )
                ) : null
            }
            sidebarWidth="w-80"
        >
            {renderContent()}
        </ToolLayout>
    );
};
