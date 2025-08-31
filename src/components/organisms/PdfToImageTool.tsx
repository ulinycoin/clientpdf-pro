import React, { useState, useCallback, useEffect } from 'react';
import ModernUploadZone from '../molecules/ModernUploadZone';
import ProgressBar from '../atoms/ProgressBar';
import { useI18n } from '../../hooks/useI18n';
import { PdfToImageService } from '../../services/pdfToImageService';
import { 
  ImageConversionOptions,
  ImageConversionResult,
  ImageConversionProgress,
  ImageFormat,
  ImageQuality,
  QUALITY_SETTINGS,
  FORMAT_DESCRIPTIONS
} from '../../types/image.types';

interface PdfToImageToolProps {
  onClose?: () => void;
  initialFile?: File; // Optional pre-loaded file from HomePage
}

export const PdfToImageTool: React.FC<PdfToImageToolProps> = ({ onClose, initialFile }) => {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ImageConversionProgress | null>(null);
  const [result, setResult] = useState<ImageConversionResult | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // Conversion options
  const [format, setFormat] = useState<ImageFormat>('png');
  const [quality, setQuality] = useState<ImageQuality>('medium');
  const [pageSelection, setPageSelection] = useState<'all' | 'range' | 'specific'>('all');
  const [pageRange, setPageRange] = useState({ start: 1, end: 1 });
  const [specificPages, setSpecificPages] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  const pdfToImageService = PdfToImageService.getInstance();

  // Set initial file if provided
  useEffect(() => {
    if (initialFile) {
      setFile(initialFile);
      setResult(null);
      setPreviewImages([]);
    }
  }, [initialFile]);

  const handleFileSelect = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setResult(null);
      setPreviewImages([]);
    }
  }, []);

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
      const conversionResult = await pdfToImageService.convertToImages(
        file,
        options,
        (progressUpdate) => {
          setProgress(progressUpdate);
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
        error: error instanceof Error ? error.message : (t('pages.tools.pdfToImage.errors.conversionFailed') || 'Unknown error occurred')
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSingle = (index: number) => {
    if (result?.success && result.images[index]) {
      pdfToImageService.downloadImage(result.images[index]);
    }
  };

  const handleDownloadAll = () => {
    if (result?.success && result.images.length > 0) {
      pdfToImageService.downloadAllImages(result.images);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setPreviewImages([]);
    setProgress(null);
    setIsProcessing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Modern Header */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
              🖼️
            </div>
            <div>
              <h2 className="text-3xl font-black text-black dark:text-white">{t('pages.tools.pdfToImage.tool.title') || 'PDF to Image Converter'}</h2>
              <p className="text-gray-800 dark:text-gray-100 font-medium">
                {t('pages.tools.pdfToImage.tool.description') || 'Convert PDF pages to high-quality image files'}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
              title={t('pages.tools.pdfToImage.tool.close') || 'Close'}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </button>
          )}
        </div>

        {!file && (
          <div className="text-center">
            <ModernUploadZone
              onFilesSelected={handleFileSelect}
              accept="application/pdf"
              acceptedTypes={['application/pdf']}
              multiple={false}
              maxSize={100 * 1024 * 1024} // 100MB
              disabled={isProcessing}
              title={t('pages.tools.pdfToImage.uploadTitle') || 'Upload PDF file to convert to images'}
              subtitle={t('pages.tools.pdfToImage.uploadSubtitle') || 'Transform PDF pages into high-quality JPG, PNG or WebP images'}
              supportedFormats={t('pages.tools.pdfToImage.supportedFormats') || 'PDF files'}
            />
            <div className="mt-6 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-xl">
              <p className="text-gray-800 dark:text-gray-100 font-medium flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                {t('pages.tools.pdfToImage.tool.supportInfo') || 'Files up to 100MB supported • PNG, JPEG formats • High quality'}
              </p>
            </div>
          </div>
        )}
      </div>

      {file && !result && (
        <div className="space-y-8">
          {/* File Info */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 rounded-xl flex items-center justify-center text-lg">
                📄
              </div>
              <h3 className="text-xl font-black text-black dark:text-white">{t('pages.tools.pdfToImage.selectedFile', { count: 1 }) || 'Selected file'}</h3>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-800 dark:to-red-700 rounded-lg flex items-center justify-center text-sm">
                  📄
                </div>
                <div>
                  <p className="font-black text-black dark:text-white">{file.name}</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Conversion Options */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 rounded-xl flex items-center justify-center text-lg">
                ⚙️
              </div>
              <h3 className="text-xl font-black text-black dark:text-white">{t('pages.tools.pdfToImage.tool.conversionSettingsTitle') || 'Conversion Settings'}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 rounded flex items-center justify-center text-xs">
                    🖼️
                  </span>
                  {t('pages.tools.pdfToImage.tool.formatTitle') || 'Output Format'}
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as ImageFormat)}
                  className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl text-black dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                </select>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1">
                  <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                  {t(`pages.tools.pdfToImage.tool.formats.${format}`) || FORMAT_DESCRIPTIONS[format]}
                </p>
              </div>

              {/* Quality Selection */}
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 rounded flex items-center justify-center text-xs">
                    ⭐
                  </span>
                  {t('pages.tools.pdfToImage.tool.qualityTitle') || 'Quality'}
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as ImageQuality)}
                  className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl text-black dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  {Object.entries(QUALITY_SETTINGS).map(([key, settings]) => (
                    <option key={key} value={key}>
                      {key.charAt(0).toUpperCase() + key.slice(1)} ({settings.resolution} DPI)
                    </option>
                  ))}
                </select>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1">
                  <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                  {t(`pages.tools.pdfToImage.tool.qualities.${quality}`) || QUALITY_SETTINGS[quality].description}
                </p>
              </div>
            </div>
          </div>

          {/* Page Selection */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-800 dark:to-orange-700 rounded-xl flex items-center justify-center text-lg">
                📑
              </div>
              <h3 className="text-xl font-black text-black dark:text-white">{t('pages.tools.pdfToImage.tool.pageSelectionTitle') || 'Page Selection'}</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="pageSelection"
                    value="all"
                    checked={pageSelection === 'all'}
                    onChange={(e) => setPageSelection(e.target.value as any)}
                    className="w-4 h-4 text-orange-500 bg-white/80 border-gray-300 focus:ring-orange-500 focus:ring-2 mr-3"
                  />
                  <span className="font-black text-black dark:text-white">{t('pages.tools.pdfToImage.tool.pageSelection.all') || 'All pages'}</span>
                </label>
              </div>
              
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4">
                <label className="flex items-center cursor-pointer mb-3">
                  <input
                    type="radio"
                    name="pageSelection"
                    value="range"
                    checked={pageSelection === 'range'}
                    onChange={(e) => setPageSelection(e.target.value as any)}
                    className="w-4 h-4 text-orange-500 bg-white/80 border-gray-300 focus:ring-orange-500 focus:ring-2 mr-3"
                  />
                  <span className="font-black text-black dark:text-white">{t('pages.tools.pdfToImage.tool.pageSelection.range') || 'Page range'}</span>
                </label>
                
                {pageSelection === 'range' && (
                  <div className="ml-7 flex items-center space-x-3">
                    <input
                      type="number"
                      min={1}
                      value={pageRange.start}
                      onChange={(e) => setPageRange(prev => ({ ...prev, start: parseInt(e.target.value) || 1 }))}
                      className="w-20 px-3 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-lg text-black dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder={t('pages.tools.pdfToImage.tool.pageRangeFrom') || 'From'}
                    />
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{t('pages.tools.pdfToImage.tool.pageRangeTo') || 'to'}</span>
                    <input
                      type="number"
                      min={pageRange.start}
                      value={pageRange.end}
                      onChange={(e) => setPageRange(prev => ({ ...prev, end: parseInt(e.target.value) || 1 }))}
                      className="w-20 px-3 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-lg text-black dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder={t('pages.tools.pdfToImage.tool.pageRangeTo') || 'To'}
                    />
                  </div>
                )}
              </div>
              
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4">
                <label className="flex items-center cursor-pointer mb-3">
                  <input
                    type="radio"
                    name="pageSelection"
                    value="specific"
                    checked={pageSelection === 'specific'}
                    onChange={(e) => setPageSelection(e.target.value as any)}
                    className="w-4 h-4 text-orange-500 bg-white/80 border-gray-300 focus:ring-orange-500 focus:ring-2 mr-3"
                  />
                  <span className="font-black text-black dark:text-white">{t('pages.tools.pdfToImage.tool.pageSelection.specific') || 'Specific pages'}</span>
                </label>
                
                {pageSelection === 'specific' && (
                  <div className="ml-7">
                    <input
                      type="text"
                      value={specificPages}
                      onChange={(e) => setSpecificPages(e.target.value)}
                      placeholder={t('pages.tools.pdfToImage.tool.specificPagesPlaceholder') || 'e.g., 1,3,5-10'}
                      className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl text-black dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    />
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                      {t('pages.tools.pdfToImage.tool.specificPagesHelp') || 'Enter page numbers separated by commas'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Background Color for JPEG */}
          {format === 'jpeg' && (
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-800 dark:to-yellow-700 rounded-xl flex items-center justify-center text-lg">
                  🎨
                </div>
                <h3 className="text-xl font-black text-black dark:text-white">{t('pages.tools.pdfToImage.tool.backgroundTitle') || 'Background Color'}</h3>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-16 h-12 border border-white/20 dark:border-gray-600/20 rounded-xl cursor-pointer bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                />
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl px-4 py-3">
                  <span className="text-sm font-black text-black dark:text-white">{backgroundColor}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleConvert}
                disabled={isProcessing}
                className="flex-1 btn-privacy-modern text-lg px-8 py-4 min-h-[56px] ripple-effect btn-press disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {t('pages.tools.pdfToImage.tool.converting') || 'Converting...'}
                  </div>
                ) : (
                  t('pages.tools.pdfToImage.tool.startConversion') || 'Convert to Images 🖼️'
                )}
              </button>
              <button
                onClick={handleReset}
                disabled={isProcessing}
                className="btn-privacy-secondary text-lg px-8 py-4 min-h-[56px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('pages.tools.pdfToImage.tool.selectFile') || 'Select another file'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      {isProcessing && progress && (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg animate-pulse">
              ⚡
            </div>
            <div>
              <h3 className="text-xl font-black text-black dark:text-white">{t('pages.tools.pdfToImage.results.processingTitle') || 'Conversion in progress'}</h3>
              <p className="text-gray-800 dark:text-gray-100 font-medium">
                {progress.message || t('pages.tools.pdfToImage.results.processingMessage', { current: progress.currentPage, total: progress.totalPages }) || `Processing page ${progress.currentPage} of ${progress.totalPages}`}
              </p>
            </div>
          </div>
          <ProgressBar
            progress={progress.percentage}
            label=""
            showPercentage
          />
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-8">
          {result.success ? (
            <>
              {/* Conversion Summary */}
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                    ✅
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-green-800 dark:text-green-200">
                      {t('pages.tools.pdfToImage.results.conversionComplete') || 'Conversion completed successfully!'}
                    </h3>
                    <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                      {t('pages.tools.pdfToImage.results.successDescription') || 'All PDF pages converted to images'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-black text-green-600 dark:text-green-400 mb-1">
                      {result.images.length}
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('pages.tools.pdfToImage.results.pagesConverted') || 'Pages converted'}
                    </p>
                  </div>
                  
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-1">
                      {format.toUpperCase()}
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('pages.tools.pdfToImage.results.format') || 'Format'} • {quality} ({result.metadata?.resolution} DPI)
                    </p>
                  </div>
                  
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mb-1">
                      {(result.convertedSize / 1024 / 1024).toFixed(1)}MB
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('pages.tools.pdfToImage.results.totalSize') || 'Total size'} • {((result.metadata?.processingTime || 0) / 1000).toFixed(1)}{t('pages.tools.pdfToImage.results.seconds') || 's'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Images */}
              {previewImages.length > 0 && (
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-800 dark:to-pink-700 rounded-xl flex items-center justify-center text-lg">
                      👁️
                    </div>
                    <h3 className="text-xl font-black text-black dark:text-white">{t('pages.tools.pdfToImage.results.preview') || 'Preview'}</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-3 hover:scale-105 transition-transform duration-200">
                        <img 
                          src={preview} 
                          alt={`Page ${index + 1}`}
                          className="w-full h-24 object-contain rounded-lg mb-2"
                        />
                        <p className="text-xs font-black text-black dark:text-white text-center">
                          {t('pages.tools.pdfToImage.results.pageLabel', { number: result.images[index]?.pageNumber }) || `Page ${result.images[index]?.pageNumber}`}
                        </p>
                      </div>
                    ))}
                    {result.images.length > 5 && (
                      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-3 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl mb-1">📄</div>
                          <p className="text-xs font-black text-black dark:text-white">
                            +{result.images.length - 5} ещё
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Download Options */}
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 rounded-xl flex items-center justify-center text-lg">
                    📥
                  </div>
                  <h3 className="text-xl font-black text-black dark:text-white">{t('pages.tools.pdfToImage.results.downloadImages') || 'Download Images'}</h3>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <button 
                    onClick={handleDownloadAll} 
                    className="flex-1 btn-privacy-modern text-lg px-8 py-4 min-h-[56px] ripple-effect btn-press"
                  >
                    {t('pages.tools.pdfToImage.results.downloadAll', { count: result.images.length }) || `Download all images (${result.images.length})`} 📦
                  </button>
                  <button 
                    onClick={handleReset}
                    className="btn-privacy-secondary text-lg px-8 py-4 min-h-[56px]"
                  >
                    {t('pages.tools.pdfToImage.results.convertAnotherFile') || 'Convert another PDF'}
                  </button>
                </div>

                {/* Individual Download Buttons */}
                {result.images.length > 1 && (
                  <div>
                    <h4 className="text-sm font-black text-black dark:text-white mb-4 flex items-center gap-2">
                      <span className="w-5 h-5 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 rounded flex items-center justify-center text-xs">
                        📄
                      </span>
                      {t('pages.tools.pdfToImage.results.downloadIndividual') || 'Download individual images'}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {result.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => handleDownloadSingle(index)}
                          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl px-4 py-3 text-black dark:text-white font-medium hover:bg-white dark:hover:bg-gray-700 hover:scale-105 transition-all duration-200 hover:shadow-lg"
                        >
                          {t('pages.tools.pdfToImage.results.pageLabel', { number: image.pageNumber }) || `Page ${image.pageNumber}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Error Message */}
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                    ❌
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-red-800 dark:text-red-200">
                      {t('pages.tools.pdfToImage.errors.conversionFailed') || 'Conversion failed'}
                    </h3>
                    <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                      {t('pages.tools.pdfToImage.messages.error') || 'Failed to convert PDF to images'}
                    </p>
                  </div>
                </div>
                
                <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200/50 dark:border-red-700/30 rounded-xl p-4 mb-6">
                  <p className="text-red-700 dark:text-red-300 font-medium">{result.error}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={handleConvert} 
                    className="flex-1 btn-privacy-modern text-lg px-8 py-4 min-h-[56px] ripple-effect btn-press"
                  >
                    {t('pages.tools.pdfToImage.tool.startConversion') || 'Try again'} 🔄
                  </button>
                  <button 
                    onClick={handleReset}
                    className="btn-privacy-secondary text-lg px-8 py-4 min-h-[56px]"
                  >
                    {t('pages.tools.pdfToImage.tool.selectFile') || 'Select another file'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PdfToImageTool;