import React, { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useI18n } from '@/hooks/useI18n';
import pdfService from '@/services/pdfService';
import smartImageFilterService from '@/services/smartImageFilterService';
import type { CategorizedImage, SmartImageFilterAnalysis, ImageCategory } from '@/services/smartImageFilterService';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { PDFProcessingResult, ExtractedImage, UploadedFile } from '@/types/pdf';
import { Label } from '@/components/ui/label';

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
            const extractResult = await pdfService.extractImages(
                file,
                (p: number, msg: string) => {
                    setProgress(p * 0.5);
                    setProgressMessage(msg);
                }
            );

            if (extractResult.success && extractResult.data) {
                setExtractedImages(extractResult.data);

                if (smartFilterEnabled && extractResult.data.length > 0) {
                    setProgress(60);
                    setProgressMessage('Analyzing image types...');

                    const analysis = smartImageFilterService.analyzeImages(extractResult.data);
                    setFilterAnalysis(analysis);
                    const allCategorized = analysis.categories.flatMap(cat => cat.images);
                    setCategorizedImages(allCategorized);

                    if (mode === 'extract') {
                        const usefulIds = analysis.usefulImages.map(img => img.id);
                        setSelectedImageIds(new Set(usefulIds.length > 0 ? usefulIds : extractResult.data.map(img => img.id)));
                        setResult(extractResult);
                        setProgress(100);
                    } else {
                        setSelectedImageIds(new Set(extractResult.data.map(img => img.id)));
                        setProgress(50);
                    }
                } else {
                    setSelectedImageIds(new Set(extractResult.data.map(img => img.id)));
                    setProgress(mode === 'extract' ? 100 : 50);
                    if (mode === 'extract') setResult(extractResult);
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
                // Keep processing true for remove mode until confirmed? No, let's allow user to interact
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
        } else if (mode === 'remove' && result?.success && result.data) {
            const baseName = file?.name.replace(/\.pdf$/i, '') || 'document';
            pdfService.downloadFile(result.data, `${baseName}_no_images.pdf`);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(1)} ${['B', 'KB', 'MB', 'GB'][i]}`;
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
                <div className="space-y-3 pt-4 border-t">
                    <Label>Filter Images</Label>
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
                                {cat.label} ({cat.count})
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
                <div className="text-center space-y-6">
                    <div className="text-4xl">🎉</div>
                    <h2 className="text-2xl font-bold">{t('common.success')}</h2>
                    <p>{t('extractImages.successRemove') || 'Files removed successfully.'}</p>
                    <div className="flex justify-center gap-4">
                        <Button onClick={handleDownload} size="lg">{t('common.download')}</Button>
                        <Button onClick={() => setFile(null)} variant="outline" size="lg">{t('common.convertAnother')}</Button>
                    </div>
                </div>
            );
        }

        if (extractedImages.length > 0) {
            return (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{mode === 'extract' ? 'Extracted Images' : 'Select to Remove'}</h3>
                        <div className="flex items-center gap-2">
                            <Checkbox checked={selectedImageIds.size === extractedImages.length} onCheckedChange={handleToggleAll} />
                            <span className="text-sm">{t('extractImages.selectAll')}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-1">
                        {getFilteredImages().map((image: any) => (
                            <div
                                key={image.id}
                                className={`relative group rounded-lg border-2 cursor-pointer overflow-hidden ${selectedImageIds.has(image.id) ? 'border-ocean-500' : 'border-gray-200'}`}
                                onClick={() => handleToggleImage(image.id)}
                            >
                                <div className="absolute top-2 left-2 z-10"><Checkbox checked={selectedImageIds.has(image.id)} /></div>
                                {image.category && <div className="absolute top-2 right-2 z-10"><Badge variant="secondary">{image.category}</Badge></div>}
                                <div className="aspect-square bg-gray-100 flex items-center justify-center p-2">
                                    {image.previewUrl && <img src={image.previewUrl} alt={image.filename} className="max-w-full max-h-full object-contain" />}
                                </div>
                                <div className="p-2 bg-white text-xs truncate">{image.filename}</div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (file && !result) {
            return (
                <div className="text-center py-12">
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto text-blue-600 mb-4">
                        <span className="text-4xl">🖼️</span>
                    </div>
                    <h2 className="text-xl font-bold">{file.name}</h2>
                    <p className="text-gray-500">{formatFileSize(file.size || 0)}</p>
                    <p className="mt-4 text-gray-600">Click "Analyze Images" to start.</p>
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
            accept=".pdf"
            settings={file ? renderSettings() : null}
            actions={
                file && !result?.success ? (
                    extractedImages.length === 0 ? (
                        <Button onClick={handleProcess} disabled={isProcessing} className="w-full py-6 text-lg font-bold">
                            {isProcessing ? t('common.processing') : 'Analyze Images'}
                        </Button>
                    ) : (
                        <div className="space-y-3">
                            <Button onClick={mode === 'extract' ? handleDownload : handleRemoveSelected} disabled={isProcessing || selectedImageIds.size === 0} className="w-full py-6 text-lg font-bold">
                                {mode === 'extract' ? `Download (${selectedImageIds.size})` : `Remove (${selectedImageIds.size})`}
                            </Button>
                            <Button onClick={() => setExtractedImages([])} variant="ghost" className="w-full">Back to File</Button>
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
