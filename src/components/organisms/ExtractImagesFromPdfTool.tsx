import React, { useState, useCallback, useEffect } from 'react';
import { Download, FileImage, Grid, Filter, Image, Trash2, CheckSquare, Square, Upload } from 'lucide-react';
import JSZip from 'jszip';
import ModernUploadZone from '../molecules/ModernUploadZone';
import ProgressBar from '../atoms/ProgressBar';
import { useI18n } from '../../hooks/useI18n';
import { ImageExtractionService } from '../../services/imageExtractionService';
import { 
  ImageExtractionOptions,
  ImageExtractionResult,
  ExtractedImage,
  ImageExtractionProgress,
  ImageOutputFormat,
  OUTPUT_FORMAT_DESCRIPTIONS,
  IMAGE_QUALITY_PRESETS,
  DEFAULT_EXTRACTION_OPTIONS
} from '../../types/imageExtraction.types';

interface ExtractImagesFromPdfToolProps {
  onClose?: () => void;
  onReset?: () => void;
  initialFile?: File;
}

export const ExtractImagesFromPdfTool: React.FC<ExtractImagesFromPdfToolProps> = ({ 
  onClose, 
  onReset,
  initialFile 
}) => {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ImageExtractionProgress | null>(null);

  // Parse page range string like "1,3,5-8" into array [1,3,5,6,7,8]
  const parsePageRange = (input: string): number[] => {
    if (!input.trim()) return [];
    
    const pages: number[] = [];
    const parts = input.split(',').map(s => s.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        // Handle range like "5-8"
        const [start, end] = part.split('-').map(s => parseInt(s.trim()));
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            if (!pages.includes(i)) pages.push(i);
          }
        }
      } else {
        // Handle single page like "3"
        const page = parseInt(part);
        if (!isNaN(page) && !pages.includes(page)) {
          pages.push(page);
        }
      }
    }
    
    return pages.sort((a, b) => a - b);
  };
  const [result, setResult] = useState<ImageExtractionResult | null>(null);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  
  // Extraction options
  const [options, setOptions] = useState<ImageExtractionOptions>({
    ...DEFAULT_EXTRACTION_OPTIONS,
    pages: 'all'
  });

  // UI state
  const [showSettings, setShowSettings] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pageRangeInput, setPageRangeInput] = useState<string>('');

  const imageExtractionService = ImageExtractionService.getInstance();

  // Set initial file if provided
  useEffect(() => {
    if (initialFile) {
      setFile(initialFile);
      setResult(null);
      setSelectedImages(new Set());
    }
  }, [initialFile]);

  const handleFileSelect = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setResult(null);
      setSelectedImages(new Set());
    }
  }, []);

  const handleExtractImages = async () => {
    if (!file) return;

    setIsProcessing(true);
    setResult(null);
    setSelectedImages(new Set());

    try {
      const extractionResult = await imageExtractionService.extractImages(
        file,
        options,
        (progressUpdate) => {
          setProgress(progressUpdate);
        }
      );

      setResult(extractionResult);

      // Don't auto-select images - let user choose explicitly
      setSelectedImages(new Set());

    } catch (error) {
      console.error('Extraction failed:', error);
      setResult({
        success: false,
        images: [],
        totalImages: 0,
        totalSize: 0,
        error: error instanceof Error ? error.message : 'Extraction failed'
      });
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleSelectImage = (imageId: string) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(imageId)) {
      newSelection.delete(imageId);
    } else {
      newSelection.add(imageId);
    }
    setSelectedImages(newSelection);
  };

  const handleSelectAll = () => {
    if (!result?.images) return;
    
    if (selectedImages.size === result.images.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(result.images.map(img => img.id)));
    }
  };

  const handleDownloadSelected = async () => {
    if (!result?.images || selectedImages.size === 0) return;

    const selectedImageObjects = result.images.filter(img => selectedImages.has(img.id));
    
    if (selectedImageObjects.length === 1) {
      // Download single image
      const image = selectedImageObjects[0];
      const url = URL.createObjectURL(image.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Create and download ZIP
      await downloadAsZip(selectedImageObjects);
    }
  };

  const handleDownloadAll = async () => {
    if (!result?.images) return;
    await downloadAsZip(result.images);
  };

  const downloadAsZip = async (images: ExtractedImage[]) => {
    try {
      
      if (images.length === 0) {
        console.warn('No images to download');
        return;
      }

      // Create ZIP archive
      const zip = new JSZip();
      const folderName = file?.name ? `${file.name.replace('.pdf', '')}_images` : 'extracted_images';
      const folder = zip.folder(folderName);

      if (!folder) {
        throw new Error('Failed to create ZIP folder');
      }

      // Add each image to the ZIP
      for (const image of images) {
        const arrayBuffer = await image.blob.arrayBuffer();
        folder.file(image.filename, arrayBuffer);
      }

      // Add metadata file
      const metadata = {
        extractedAt: new Date().toISOString(),
        sourceFile: file?.name || 'unknown.pdf',
        totalImages: images.length,
        totalSize: images.reduce((sum, img) => sum + img.size, 0),
        images: images.map(img => ({
          filename: img.filename,
          pageNumber: img.pageNumber,
          originalFormat: img.originalFormat,
          width: img.width,
          height: img.height,
          size: img.size
        }))
      };

      folder.file('metadata.json', JSON.stringify(metadata, null, 2));

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Download the ZIP
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folderName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // ZIP created successfully
    } catch (error) {
      console.error('ZIP download failed:', error);
      
      // Fallback: download images individually
      console.log('Falling back to individual downloads...');
      for (const image of images) {
        const url = URL.createObjectURL(image.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = image.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Add small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setSelectedImages(new Set());
    setIsProcessing(false);
    setProgress(null);
    setPageRangeInput('');
    
    // Call parent reset function to handle navigation properly
    onReset?.();
  };

  const getSelectedImages = (): ExtractedImage[] => {
    return result?.images?.filter(img => selectedImages.has(img.id)) || [];
  };

  const selectedCount = selectedImages.size;
  const totalCount = result?.images?.length || 0;
  const selectedSize = getSelectedImages().reduce((sum, img) => sum + img.size, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <FileImage className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              {t('tools.extractImagesFromPdf.title')}
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('tools.extractImagesFromPdf.description')}
          </p>
        </div>

        {/* Upload Zone */}
        {!file && (
          <div className="mb-8">
            <div className="text-center mb-6">
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to tool info
              </button>
            </div>
            <ModernUploadZone
              onFilesSelected={handleFileSelect}
              title={t('tools.extractImagesFromPdf.uploadPrompt')}
              subtitle={t('tools.extractImagesFromPdf.uploadSubtitle')}
              supportedFormats="PDF files up to 100MB"
              accept="application/pdf"
              acceptedTypes={['application/pdf']}
              icon="📄"
            />
          </div>
        )}

        {/* File Info & Settings */}
        {file && !result && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FileImage className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-medium text-gray-900">{file.name}</h3>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4" />
                {showSettings ? 'Hide Settings' : 'Show Settings'}
              </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                {/* Page Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tools.extractImagesFromPdf.settings.pageSelection')}
                  </label>
                  <select
                    value={options.pages === 'all' ? 'all' : 'specific'}
                    onChange={(e) => {
                      if (e.target.value === 'all') {
                        setOptions(prev => ({ ...prev, pages: 'all' }));
                        setPageRangeInput('');
                      } else {
                        setOptions(prev => ({ ...prev, pages: [] }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All pages</option>
                    <option value="specific">Specific pages</option>
                  </select>
                  
                  {/* Pages Input - only show when "specific" is selected */}
                  {options.pages !== 'all' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="e.g., 1,3,5-8"
                        value={pageRangeInput}
                        onChange={(e) => {
                          const input = e.target.value;
                          setPageRangeInput(input);
                          // Parse page range string like "1,3,5-8" into array [1,3,5,6,7,8]
                          const pages = parsePageRange(input);
                          setOptions(prev => ({ ...prev, pages }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter page numbers (e.g., 1,3,5-8)
                      </p>
                    </div>
                  )}
                </div>

                {/* Min Image Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tools.extractImagesFromPdf.settings.minSize')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={options.minWidth || 32}
                    onChange={(e) => setOptions(prev => ({
                      ...prev,
                      minWidth: parseInt(e.target.value),
                      minHeight: parseInt(e.target.value)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Min width/height (px)</p>
                </div>

                {/* Output Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tools.extractImagesFromPdf.settings.outputFormat')}
                  </label>
                  <select
                    value={options.outputFormat || 'original'}
                    onChange={(e) => setOptions(prev => ({
                      ...prev,
                      outputFormat: e.target.value as ImageOutputFormat
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(OUTPUT_FORMAT_DESCRIPTIONS).map(([format, desc]) => (
                      <option key={format} value={format}>
                        {format.toUpperCase()} - {desc.split(' (')[0]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* JPEG Quality */}
                {options.outputFormat === 'jpeg' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      JPEG Quality
                    </label>
                    <select
                      value={options.jpegQuality ? 
                        Object.entries(IMAGE_QUALITY_PRESETS).find(([, settings]) => 
                          settings.jpegQuality === options.jpegQuality
                        )?.[0] || 'medium' : 'medium'}
                      onChange={(e) => setOptions(prev => ({
                        ...prev,
                        jpegQuality: IMAGE_QUALITY_PRESETS[e.target.value].jpegQuality
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.entries(IMAGE_QUALITY_PRESETS).map(([key, preset]) => (
                        <option key={key} value={key}>
                          {key.charAt(0).toUpperCase() + key.slice(1)} ({(preset.jpegQuality * 100).toFixed(0)}%)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Extract Button */}
            <button
              onClick={handleExtractImages}
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isProcessing ? 'Extracting Images...' : 'Extract Images'}
            </button>
          </div>
        )}

        {/* Progress */}
        {isProcessing && progress && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Image className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Extracting Images</h3>
              {progress.imagesFound > 50 && (
                <div className="ml-auto">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Large file detected
                  </span>
                </div>
              )}
            </div>
            <ProgressBar 
              progress={progress.percentage} 
              showPercentage={true}
              className="mb-4"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{progress.message}</span>
              <span>{progress.imagesFound} images found</span>
            </div>
            
            {/* Large file warning and controls */}
            {progress.imagesFound > 100 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">Large PDF detected</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        This may take a while. The browser might appear unresponsive, but processing is continuing in the background.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsProcessing(false);
                      setProgress(null);
                    }}
                    className="flex-shrink-0 px-3 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {result.success ? (
              <>
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {result.totalImages} {t('tools.extractImagesFromPdf.results.imagesFound')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t('tools.extractImagesFromPdf.results.totalSize')}: {formatFileSize(result.totalSize)}
                      {result.duplicatesRemoved && result.duplicatesRemoved > 0 && 
                        ` • ${result.duplicatesRemoved} duplicates removed`
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Choose another PDF file"
                    >
                      <Upload className="w-4 h-4" />
                      New File
                    </button>
                    <button
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                      title="Toggle view mode"
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {result.images.length > 0 && (
                  <>
                    {/* Selection Controls */}
                    <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={handleSelectAll}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                        >
                          {selectedImages.size === totalCount ? 
                            <CheckSquare className="w-4 h-4" /> : 
                            <Square className="w-4 h-4" />
                          }
                          {selectedImages.size === totalCount ? 
                            t('tools.extractImagesFromPdf.results.deselectAll') : 
                            t('tools.extractImagesFromPdf.results.selectAll')
                          }
                        </button>
                        <span className="text-sm text-gray-600">
                          {t('tools.extractImagesFromPdf.results.selectedCount', { 
                            selected: selectedCount, 
                            total: totalCount 
                          })}
                          {selectedCount > 0 && ` • ${formatFileSize(selectedSize)}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleDownloadSelected}
                          disabled={selectedCount === 0}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Download className="w-4 h-4" />
                          {t('tools.extractImagesFromPdf.results.downloadSelected')}
                        </button>
                        <button
                          onClick={handleDownloadAll}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          <Download className="w-4 h-4" />
                          {t('tools.extractImagesFromPdf.results.downloadAll')}
                        </button>
                      </div>
                    </div>

                    {/* Images Grid */}
                    <div className={viewMode === 'grid' 
                      ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" 
                      : "space-y-3"
                    }>
                      {result.images.map((image) => (
                        <div
                          key={image.id}
                          className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                            selectedImages.has(image.id) 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleSelectImage(image.id)}
                        >
                          {/* Selection Indicator */}
                          <div className="absolute top-2 left-2 z-10">
                            {selectedImages.has(image.id) ? 
                              <CheckSquare className="w-5 h-5 text-blue-600 bg-white rounded" /> :
                              <Square className="w-5 h-5 text-gray-400 bg-white rounded" />
                            }
                          </div>

                          {/* Image Preview */}
                          <div className="aspect-square bg-gray-100 flex items-center justify-center">
                            <img
                              src={image.dataUrl}
                              alt={`Extracted image from page ${image.pageNumber}`}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>

                          {/* Image Info */}
                          <div className="p-3 bg-white">
                            <div className="text-xs text-gray-500 truncate">
                              Page {image.pageNumber}
                            </div>
                            <div className="text-xs text-gray-600 truncate">
                              {image.width}×{image.height}
                            </div>
                            <div className="text-xs text-gray-600">
                              {formatFileSize(image.size)} • {image.originalFormat}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {result.images.length === 0 && (
                  <div className="text-center py-12">
                    <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('tools.extractImagesFromPdf.errors.noImages')}
                    </h3>
                    <p className="text-gray-500">
                      This PDF doesn't contain any extractable images matching your criteria.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('tools.extractImagesFromPdf.errors.extractionFailed')}
                </h3>
                <p className="text-gray-500 mb-4">{result.error}</p>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Another File
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};