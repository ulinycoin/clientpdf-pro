import React, { useState, useCallback, useEffect } from 'react';
import ModernUploadZone from '../molecules/ModernUploadZone';
import ProgressBar from '../atoms/ProgressBar';
import { useI18n } from '../../hooks/useI18n';
import { PdfToSvgService } from '../../services/pdfToSvgService';
import { 
  SvgConversionOptions,
  SvgConversionResult,
  SvgConversionProgress,
  SvgFormat,
  SvgQuality,
  SvgConversionMethod,
  SVG_QUALITY_SETTINGS,
  SVG_METHOD_DESCRIPTIONS
} from '../../types/svgConversion.types';

interface PdfToSvgToolProps {
  onClose?: () => void;
  initialFile?: File; // Optional pre-loaded file from HomePage
}

export const PdfToSvgTool: React.FC<PdfToSvgToolProps> = ({ onClose, initialFile }) => {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<SvgConversionProgress | null>(null);
  const [result, setResult] = useState<SvgConversionResult | null>(null);
  const [previewSvgs, setPreviewSvgs] = useState<string[]>([]);

  // Conversion options
  const [format] = useState<SvgFormat>('svg'); // SVG is the only format for now
  const [quality, setQuality] = useState<SvgQuality>('medium');
  const [method, setMethod] = useState<SvgConversionMethod>('canvas');
  const [pageSelection, setPageSelection] = useState<'all' | 'range' | 'specific'>('all');
  const [pageRange, setPageRange] = useState({ start: 1, end: 1 });
  const [specificPages, setSpecificPages] = useState('');
  const [includeText, setIncludeText] = useState(true);
  const [includeImages, setIncludeImages] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  const pdfToSvgService = PdfToSvgService.getInstance();

  // Set initial file if provided
  useEffect(() => {
    if (initialFile) {
      setFile(initialFile);
      setResult(null);
      setPreviewSvgs([]);
    }
  }, [initialFile]);

  const handleFileSelect = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setResult(null);
      setPreviewSvgs([]);
    }
  }, []);

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setResult(null);
    setPreviewSvgs([]);

    try {
      // Prepare conversion options
      const options: SvgConversionOptions = {
        format,
        quality,
        method,
        pages: pageSelection,
        includeText,
        includeImages,
        backgroundColor,
        scale: SVG_QUALITY_SETTINGS[quality].scale,
        resolution: SVG_QUALITY_SETTINGS[quality].resolution
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

      // Validate options
      const validation = pdfToSvgService.validateOptions(options);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      // Convert PDF to SVGs
      const conversionResult = await pdfToSvgService.convertToSvg(
        file,
        options,
        (progressUpdate) => {
          setProgress(progressUpdate);
        }
      );

      setResult(conversionResult);

      // Create preview URLs for successful conversions
      if (conversionResult.success && conversionResult.svgs.length > 0) {
        const previews = conversionResult.svgs.slice(0, 5).map(svg => svg.dataUrl);
        setPreviewSvgs(previews);
      }

    } catch (error) {
      console.error('PDF to SVG conversion failed:', error);
      setResult({
        success: false,
        svgs: [],
        totalPages: 0,
        originalSize: file.size,
        convertedSize: 0,
        error: error instanceof Error ? error.message : (t('pages.tools.pdfToSvg.errors.conversionFailed') || 'Unknown error occurred')
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSingle = (index: number) => {
    if (result?.success && result.svgs[index]) {
      pdfToSvgService.downloadSvg(result.svgs[index]);
    }
  };

  const handleDownloadAll = () => {
    if (result?.success && result.svgs.length > 0) {
      pdfToSvgService.downloadAllSvgs(result.svgs);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setPreviewSvgs([]);
    setProgress(null);
    setIsProcessing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Modern Header */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
              📐
            </div>
            <div>
              <h2 className="text-3xl font-black text-black dark:text-white">{t('pages.tools.pdfToSvg.tool.title') || 'PDF to SVG Converter'}</h2>
              <p className="text-gray-800 dark:text-gray-100 font-medium">
                {t('pages.tools.pdfToSvg.tool.description') || 'Convert PDF pages to scalable SVG vector files'}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
              title={t('pages.tools.pdfToSvg.tool.close') || 'Close'}
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
              title={t('pages.tools.pdfToSvg.uploadTitle') || 'Upload PDF file to convert to SVG'}
              subtitle={t('pages.tools.pdfToSvg.uploadSubtitle') || 'Transform PDF pages into scalable vector graphics'}
              supportedFormats={t('pages.tools.pdfToSvg.supportedFormats') || 'PDF files'}
            />
            <div className="mt-6 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-xl">
              <p className="text-gray-800 dark:text-gray-100 font-medium flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                {t('pages.tools.pdfToSvg.tool.supportInfo') || 'Files up to 100MB supported • SVG format • Scalable vectors'}
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
              <h3 className="text-xl font-black text-black dark:text-white">{t('pages.tools.pdfToSvg.selectedFile', { count: 1 }) || 'Selected file'}</h3>
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
              <h3 className="text-xl font-black text-black dark:text-white">{t('pages.tools.pdfToSvg.tool.conversionSettingsTitle') || 'Conversion Settings'}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quality Selection */}
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 rounded flex items-center justify-center text-xs">
                    ⭐
                  </span>
                  {t('pages.tools.pdfToSvg.tool.qualityTitle') || 'Quality & Resolution'}
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as SvgQuality)}
                  className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl text-black dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  {Object.entries(SVG_QUALITY_SETTINGS).map(([key, settings]) => (
                    <option key={key} value={key}>
                      {key.charAt(0).toUpperCase() + key.slice(1)} ({settings.resolution} DPI)
                    </option>
                  ))}
                </select>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1">
                  <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                  {t(`pages.tools.pdfToSvg.tool.qualities.${quality}`) || SVG_QUALITY_SETTINGS[quality].description}
                </p>
              </div>

              {/* Method Selection */}
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 rounded flex items-center justify-center text-xs">
                    🔧
                  </span>
                  {t('pages.tools.pdfToSvg.tool.methodTitle') || 'Conversion Method'}
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as SvgConversionMethod)}
                  className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl text-black dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="canvas">Canvas (Fast)</option>
                  <option value="vector" disabled>Vector Extraction (Coming Soon)</option>
                </select>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1">
                  <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                  {t(`pages.tools.pdfToSvg.tool.methods.${method}`) || SVG_METHOD_DESCRIPTIONS[method]}
                </p>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="mt-6 pt-6 border-t border-white/20 dark:border-gray-600/20">
              <h4 className="text-sm font-black text-black dark:text-white mb-4 flex items-center gap-2">
                <span className="w-5 h-5 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-800 dark:to-orange-700 rounded flex items-center justify-center text-xs">
                  🎛️
                </span>
                {t('pages.tools.pdfToSvg.tool.advancedTitle') || 'Advanced Options'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center cursor-pointer bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4">
                  <input
                    type="checkbox"
                    checked={includeText}
                    onChange={(e) => setIncludeText(e.target.checked)}
                    className="w-4 h-4 text-purple-500 bg-white/80 border-gray-300 focus:ring-purple-500 focus:ring-2 mr-3"
                  />
                  <div>
                    <span className="font-black text-black dark:text-white">{t('pages.tools.pdfToSvg.tool.includeText') || 'Include Text Elements'}</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{t('pages.tools.pdfToSvg.tool.includeTextDesc') || 'Preserve text as selectable elements'}</p>
                  </div>
                </label>

                <label className="flex items-center cursor-pointer bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4">
                  <input
                    type="checkbox"
                    checked={includeImages}
                    onChange={(e) => setIncludeImages(e.target.checked)}
                    className="w-4 h-4 text-purple-500 bg-white/80 border-gray-300 focus:ring-purple-500 focus:ring-2 mr-3"
                  />
                  <div>
                    <span className="font-black text-black dark:text-white">{t('pages.tools.pdfToSvg.tool.includeImages') || 'Include Images'}</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{t('pages.tools.pdfToSvg.tool.includeImagesDesc') || 'Embed images in SVG output'}</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Page Selection */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-800 dark:to-orange-700 rounded-xl flex items-center justify-center text-lg">
                📑
              </div>
              <h3 className="text-xl font-black text-black dark:text-white">{t('pages.tools.pdfToSvg.tool.pageSelectionTitle') || 'Page Selection'}</h3>
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
                  <span className="font-black text-black dark:text-white">{t('pages.tools.pdfToSvg.tool.pageSelection.all') || 'All pages'}</span>
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
                  <span className="font-black text-black dark:text-white">{t('pages.tools.pdfToSvg.tool.pageSelection.range') || 'Page range'}</span>
                </label>
                
                {pageSelection === 'range' && (
                  <div className="ml-7 flex items-center space-x-3">
                    <input
                      type="number"
                      min={1}
                      value={pageRange.start}
                      onChange={(e) => setPageRange(prev => ({ ...prev, start: parseInt(e.target.value) || 1 }))}
                      className="w-20 px-3 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-lg text-black dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder={t('pages.tools.pdfToSvg.tool.pageRangeFrom') || 'From'}
                    />
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{t('pages.tools.pdfToSvg.tool.pageRangeTo') || 'to'}</span>
                    <input
                      type="number"
                      min={pageRange.start}
                      value={pageRange.end}
                      onChange={(e) => setPageRange(prev => ({ ...prev, end: parseInt(e.target.value) || 1 }))}
                      className="w-20 px-3 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-lg text-black dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder={t('pages.tools.pdfToSvg.tool.pageRangeTo') || 'To'}
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
                  <span className="font-black text-black dark:text-white">{t('pages.tools.pdfToSvg.tool.pageSelection.specific') || 'Specific pages'}</span>
                </label>
                
                {pageSelection === 'specific' && (
                  <div className="ml-7">
                    <input
                      type="text"
                      value={specificPages}
                      onChange={(e) => setSpecificPages(e.target.value)}
                      placeholder={t('pages.tools.pdfToSvg.tool.specificPagesPlaceholder') || 'e.g., 1,3,5-10'}
                      className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl text-black dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    />
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                      {t('pages.tools.pdfToSvg.tool.specificPagesHelp') || 'Enter page numbers separated by commas'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Background Color */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-800 dark:to-yellow-700 rounded-xl flex items-center justify-center text-lg">
                🎨
              </div>
              <h3 className="text-xl font-black text-black dark:text-white">{t('pages.tools.pdfToSvg.tool.backgroundTitle') || 'Background Color'}</h3>
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
                    {t('pages.tools.pdfToSvg.tool.converting') || 'Converting...'}
                  </div>
                ) : (
                  t('pages.tools.pdfToSvg.tool.startConversion') || 'Convert to SVG 📐'
                )}
              </button>
              <button
                onClick={handleReset}
                disabled={isProcessing}
                className="btn-privacy-secondary text-lg px-8 py-4 min-h-[56px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('pages.tools.pdfToSvg.tool.selectFile') || 'Select another file'}
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
              <h3 className="text-xl font-black text-black dark:text-white">{t('pages.tools.pdfToSvg.results.processingTitle') || 'SVG conversion in progress'}</h3>
              <p className="text-gray-800 dark:text-gray-100 font-medium">
                {progress.message || t('pages.tools.pdfToSvg.results.processingMessage', { current: progress.currentPage, total: progress.totalPages }) || `Processing page ${progress.currentPage} of ${progress.totalPages}`}
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
                      {t('pages.tools.pdfToSvg.results.conversionComplete') || 'SVG conversion completed successfully!'}
                    </h3>
                    <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                      {t('pages.tools.pdfToSvg.results.successDescription') || 'All PDF pages converted to scalable SVG files'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-black text-green-600 dark:text-green-400 mb-1">
                      {result.svgs.length}
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('pages.tools.pdfToSvg.results.pagesConverted') || 'Pages converted'}
                    </p>
                  </div>
                  
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-1">
                      SVG
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('pages.tools.pdfToSvg.results.format') || 'Format'} • {quality} ({result.metadata?.resolution} DPI)
                    </p>
                  </div>
                  
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mb-1">
                      {(result.convertedSize / 1024 / 1024).toFixed(1)}MB
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('pages.tools.pdfToSvg.results.totalSize') || 'Total size'} • {((result.metadata?.processingTime || 0) / 1000).toFixed(1)}{t('pages.tools.pdfToSvg.results.seconds') || 's'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview SVGs */}
              {previewSvgs.length > 0 && (
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-800 dark:to-pink-700 rounded-xl flex items-center justify-center text-lg">
                      👁️
                    </div>
                    <h3 className="text-xl font-black text-black dark:text-white">{t('pages.tools.pdfToSvg.results.preview') || 'Preview'}</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {previewSvgs.map((preview, index) => (
                      <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-3 hover:scale-105 transition-transform duration-200">
                        <img 
                          src={preview} 
                          alt={`SVG Page ${index + 1}`}
                          className="w-full h-24 object-contain rounded-lg mb-2"
                        />
                        <p className="text-xs font-black text-black dark:text-white text-center">
                          {t('pages.tools.pdfToSvg.results.pageLabel', { number: result.svgs[index]?.pageNumber }) || `Page ${result.svgs[index]?.pageNumber}`}
                        </p>
                      </div>
                    ))}
                    {result.svgs.length > 5 && (
                      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-3 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl mb-1">📐</div>
                          <p className="text-xs font-black text-black dark:text-white">
                            +{result.svgs.length - 5} more
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
                  <h3 className="text-xl font-black text-black dark:text-white">{t('pages.tools.pdfToSvg.results.downloadSvgs') || 'Download SVG Files'}</h3>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <button 
                    onClick={handleDownloadAll} 
                    className="flex-1 btn-privacy-modern text-lg px-8 py-4 min-h-[56px] ripple-effect btn-press"
                  >
                    {t('pages.tools.pdfToSvg.results.downloadAll', { count: result.svgs.length }) || `Download all SVG files (${result.svgs.length})`} 📦
                  </button>
                  <button 
                    onClick={handleReset}
                    className="btn-privacy-secondary text-lg px-8 py-4 min-h-[56px]"
                  >
                    {t('pages.tools.pdfToSvg.results.convertAnotherFile') || 'Convert another PDF'}
                  </button>
                </div>

                {/* Individual Download Buttons */}
                {result.svgs.length > 1 && (
                  <div>
                    <h4 className="text-sm font-black text-black dark:text-white mb-4 flex items-center gap-2">
                      <span className="w-5 h-5 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 rounded flex items-center justify-center text-xs">
                        📐
                      </span>
                      {t('pages.tools.pdfToSvg.results.downloadIndividual') || 'Download individual SVG files'}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {result.svgs.map((svg, index) => (
                        <button
                          key={index}
                          onClick={() => handleDownloadSingle(index)}
                          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl px-4 py-3 text-black dark:text-white font-medium hover:bg-white dark:hover:bg-gray-700 hover:scale-105 transition-all duration-200 hover:shadow-lg"
                        >
                          {t('pages.tools.pdfToSvg.results.pageLabel', { number: svg.pageNumber }) || `Page ${svg.pageNumber}`}
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
                      {t('pages.tools.pdfToSvg.errors.conversionFailed') || 'SVG conversion failed'}
                    </h3>
                    <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                      {t('pages.tools.pdfToSvg.messages.error') || 'Failed to convert PDF to SVG'}
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
                    {t('pages.tools.pdfToSvg.tool.startConversion') || 'Try again'} 🔄
                  </button>
                  <button 
                    onClick={handleReset}
                    className="btn-privacy-secondary text-lg px-8 py-4 min-h-[56px]"
                  >
                    {t('pages.tools.pdfToSvg.tool.selectFile') || 'Select another file'}
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

export default PdfToSvgTool;