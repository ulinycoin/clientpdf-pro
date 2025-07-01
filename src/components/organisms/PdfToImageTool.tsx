import React, { useState, useCallback } from 'react';
import { FileUploadZone } from '../molecules/FileUploadZone';
import { Button } from '../atoms/Button';
import { ProgressBar } from '../atoms/ProgressBar';
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
}

export const PdfToImageTool: React.FC<PdfToImageToolProps> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
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
        error: error instanceof Error ? error.message : 'Unknown error occurred'
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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">PDF to Image Converter</h2>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {!file && (
        <div className="mb-6">
          <FileUploadZone
            onFilesSelected={handleFileSelect}
            accept="application/pdf"
            multiple={false}
            maxSize={100 * 1024 * 1024} // 100MB
            disabled={isProcessing}
            className="mb-4"
          />
          <p className="text-sm text-gray-600 text-center">
            Upload a PDF file to convert its pages to images
          </p>
        </div>
      )}

      {file && !result && (
        <div className="space-y-6">
          {/* File Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Selected File</h3>
            <div className="flex items-center space-x-3">
              <div className="text-red-500">📄</div>
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>

          {/* Conversion Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as ImageFormat)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {FORMAT_DESCRIPTIONS[format]}
              </p>
            </div>

            {/* Quality Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as ImageQuality)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(QUALITY_SETTINGS).map(([key, settings]) => (
                  <option key={key} value={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)} ({settings.resolution} DPI)
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {QUALITY_SETTINGS[quality].description}
              </p>
            </div>
          </div>

          {/* Page Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pages to Convert
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="pageSelection"
                  value="all"
                  checked={pageSelection === 'all'}
                  onChange={(e) => setPageSelection(e.target.value as any)}
                  className="mr-2"
                />
                All pages
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="pageSelection"
                  value="range"
                  checked={pageSelection === 'range'}
                  onChange={(e) => setPageSelection(e.target.value as any)}
                  className="mr-2"
                />
                Page range
              </label>
              
              {pageSelection === 'range' && (
                <div className="ml-6 flex items-center space-x-2">
                  <input
                    type="number"
                    min={1}
                    value={pageRange.start}
                    onChange={(e) => setPageRange(prev => ({ ...prev, start: parseInt(e.target.value) || 1 }))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="From"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    min={pageRange.start}
                    value={pageRange.end}
                    onChange={(e) => setPageRange(prev => ({ ...prev, end: parseInt(e.target.value) || 1 }))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="To"
                  />
                </div>
              )}
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="pageSelection"
                  value="specific"
                  checked={pageSelection === 'specific'}
                  onChange={(e) => setPageSelection(e.target.value as any)}
                  className="mr-2"
                />
                Specific pages
              </label>
              
              {pageSelection === 'specific' && (
                <div className="ml-6">
                  <input
                    type="text"
                    value={specificPages}
                    onChange={(e) => setSpecificPages(e.target.value)}
                    placeholder="e.g., 1, 3, 5-7, 10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter page numbers separated by commas
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Background Color for JPEG */}
          {format === 'jpeg' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color (for JPEG)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">{backgroundColor}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              onClick={handleConvert}
              disabled={isProcessing}
              loading={isProcessing}
              className="flex-1"
            >
              Convert to Images
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isProcessing}
            >
              Select Different File
            </Button>
          </div>
        </div>
      )}

      {/* Progress */}
      {isProcessing && progress && (
        <div className="mb-6">
          <ProgressBar
            progress={progress.percentage}
            label={progress.message || `Converting page ${progress.currentPage} of ${progress.totalPages}`}
            showPercentage
          />
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {result.success ? (
            <>
              {/* Conversion Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">✅ Conversion Successful!</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p>Converted {result.images.length} pages to {format.toUpperCase()}</p>
                  <p>
                    Quality: {quality} ({result.metadata?.resolution} DPI) • 
                    Processing time: {((result.metadata?.processingTime || 0) / 1000).toFixed(1)}s
                  </p>
                  <p>
                    Total size: {(result.convertedSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {/* Preview Images */}
              {previewImages.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Preview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="bg-gray-100 rounded-lg p-2">
                        <img 
                          src={preview} 
                          alt={`Page ${index + 1}`}
                          className="w-full h-24 object-contain rounded"
                        />
                        <p className="text-xs text-gray-600 text-center mt-1">
                          Page {result.images[index]?.pageNumber}
                        </p>
                      </div>
                    ))}
                    {result.images.length > 5 && (
                      <div className="bg-gray-100 rounded-lg p-2 flex items-center justify-center">
                        <p className="text-xs text-gray-600 text-center">
                          +{result.images.length - 5} more
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Download Options */}
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <Button onClick={handleDownloadAll} className="flex-1">
                    Download All Images ({result.images.length})
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    Convert Another PDF
                  </Button>
                </div>

                {/* Individual Download Buttons */}
                {result.images.length > 1 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Download Individual Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {result.images.map((image, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadSingle(index)}
                          className="text-xs"
                        >
                          Page {image.pageNumber}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Error Message */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-900 mb-2">❌ Conversion Failed</h3>
                <p className="text-sm text-red-700">{result.error}</p>
              </div>

              <div className="flex space-x-4">
                <Button onClick={handleConvert} className="flex-1">
                  Try Again
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Select Different File
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PdfToImageTool;