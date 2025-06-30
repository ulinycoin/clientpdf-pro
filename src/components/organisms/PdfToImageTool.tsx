import React, { useState, useCallback } from 'react';
import { FileUploadZone } from '../molecules/FileUploadZone';
import { ProgressBar } from '../molecules/ProgressBar';
import { usePdfToImage } from '../../hooks/usePdfToImage';
import { 
  ImageFormat, 
  ImageQuality, 
  QUALITY_SETTINGS, 
  FORMAT_DESCRIPTIONS 
} from '../../types/image.types';
import { validatePdfFile } from '../../utils/fileHelpers';

export function PdfToImageTool() {
  const {
    isConverting,
    progress,
    result,
    error,
    previewImages,
    options,
    convertToImages,
    updateOptions,
    downloadImage,
    downloadAllImages,
    reset,
    addPageNumber,
    removePageNumber,
    clearPageNumbers,
    setPageRange,
    getEstimatedFileSize
  } = usePdfToImage();

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageInput, setPageInput] = useState<string>('');

  const handleFileUpload = useCallback(async (file: File) => {
    const validation = validatePdfFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    setUploadedFile(file);
    reset();

    // Get total pages for validation (basic check)
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Simple way to estimate pages - in production you might want to use PDF.js here too
      setTotalPages(Math.max(1, Math.floor(arrayBuffer.byteLength / 50000))); // Rough estimate
    } catch (err) {
      setTotalPages(1);
    }
  }, [reset]);

  const handleConvert = useCallback(() => {
    if (uploadedFile) {
      convertToImages(uploadedFile);
    }
  }, [uploadedFile, convertToImages]);

  const handleFormatChange = useCallback((format: ImageFormat) => {
    updateOptions({ format });
  }, [updateOptions]);

  const handleQualityChange = useCallback((quality: ImageQuality) => {
    updateOptions({ quality });
  }, [updateOptions]);

  const handlePagesTypeChange = useCallback((pagesType: 'all' | 'specific' | 'range') => {
    updateOptions({ pages: pagesType });
  }, [updateOptions]);

  const handleAddPage = useCallback(() => {
    const pageNum = parseInt(pageInput);
    if (pageNum && pageNum >= 1 && pageNum <= totalPages) {
      addPageNumber(pageNum);
      setPageInput('');
    }
  }, [pageInput, totalPages, addPageNumber]);

  const handleRangeChange = useCallback((type: 'start' | 'end', value: string) => {
    const num = parseInt(value) || 1;
    if (type === 'start') {
      setPageRange(num, options.pageRange.end);
    } else {
      setPageRange(options.pageRange.start, num);
    }
  }, [options.pageRange, setPageRange]);

  const estimatedSize = getEstimatedFileSize();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          PDF to Image Converter
        </h1>
        <p className="text-gray-600">
          Convert PDF pages to high-quality PNG or JPEG images
        </p>
      </div>

      {/* File Upload */}
      <FileUploadZone
        onFileSelect={handleFileUpload}
        acceptedTypes={['.pdf']}
        maxSize={50 * 1024 * 1024} // 50MB
        disabled={isConverting}
      />

      {uploadedFile && !isConverting && !result && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Output Format
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['png', 'jpeg'] as ImageFormat[]).map((format) => (
                <label
                  key={format}
                  className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="format"
                    value={format}
                    checked={options.format === format}
                    onChange={() => handleFormatChange(format)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900 uppercase">
                      {format}
                    </div>
                    <div className="text-sm text-gray-600">
                      {FORMAT_DESCRIPTIONS[format]}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Quality Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quality Settings
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {(Object.keys(QUALITY_SETTINGS) as ImageQuality[]).map((quality) => (
                <label
                  key={quality}
                  className="flex flex-col p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-center"
                >
                  <input
                    type="radio"
                    name="quality"
                    value={quality}
                    checked={options.quality === quality}
                    onChange={() => handleQualityChange(quality)}
                    className="mb-2"
                  />
                  <div className="font-medium text-gray-900 capitalize mb-1">
                    {quality}
                  </div>
                  <div className="text-xs text-gray-600">
                    {QUALITY_SETTINGS[quality].resolution} DPI
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {QUALITY_SETTINGS[quality].description}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Page Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pages to Convert
            </label>
            <div className="space-y-4">
              {/* All Pages */}
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="pages"
                  value="all"
                  checked={options.pages === 'all'}
                  onChange={() => handlePagesTypeChange('all')}
                  className="mr-3"
                />
                <span className="font-medium">All Pages</span>
                <span className="ml-2 text-gray-600">(Estimated: {totalPages} pages)</span>
              </label>

              {/* Page Range */}
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="pages"
                  value="range"
                  checked={options.pages === 'range'}
                  onChange={() => handlePagesTypeChange('range')}
                  className="mr-3"
                />
                <span className="font-medium mr-4">Page Range:</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={options.pageRange.start}
                    onChange={(e) => handleRangeChange('start', e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                    disabled={options.pages !== 'range'}
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={options.pageRange.end}
                    onChange={(e) => handleRangeChange('end', e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                    disabled={options.pages !== 'range'}
                  />
                </div>
              </label>

              {/* Specific Pages */}
              <div className="border rounded-lg p-3">
                <label className="flex items-center mb-3 cursor-pointer hover:bg-gray-50 -m-3 p-3 rounded-lg">
                  <input
                    type="radio"
                    name="pages"
                    value="specific"
                    checked={options.pages === 'specific'}
                    onChange={() => handlePagesTypeChange('specific')}
                    className="mr-3"
                  />
                  <span className="font-medium">Specific Pages</span>
                </label>
                
                {options.pages === 'specific' && (
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                        placeholder="Page number"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        onClick={handleAddPage}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Add
                      </button>
                    </div>
                    
                    {options.pageNumbers.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">
                            Selected pages: {options.pageNumbers.length}
                          </span>
                          <button
                            onClick={clearPageNumbers}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Clear all
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {options.pageNumbers.map((pageNum) => (
                            <span
                              key={pageNum}
                              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {pageNum}
                              <button
                                onClick={() => removePageNumber(pageNum)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Background Color for JPEG */}
          {options.format === 'jpeg' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Background Color (for JPEG)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={options.backgroundColor}
                  onChange={(e) => updateOptions({ backgroundColor: e.target.value })}
                  className="w-12 h-8 border border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">
                  {options.backgroundColor}
                </span>
              </div>
            </div>
          )}

          {/* Convert Button */}
          <button
            onClick={handleConvert}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Convert to Images
          </button>
        </div>
      )}

      {/* Progress */}
      {isConverting && progress && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Converting PDF to Images...
          </h3>
          <ProgressBar
            progress={progress.percentage}
            text={progress.message}
            showPercentage
          />
          <div className="mt-2 text-sm text-gray-600">
            Page {progress.currentPage} of {progress.totalPages}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Conversion Failed</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && result.success && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Conversion Complete! 🎉
            </h3>
            <button
              onClick={downloadAllImages}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Download All ({result.images.length})
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{result.images.length}</div>
              <div className="text-sm text-gray-600">Images Created</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {((result.convertedSize / 1024 / 1024)).toFixed(1)}MB
              </div>
              <div className="text-sm text-gray-600">Total Size</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {result.metadata?.resolution}
              </div>
              <div className="text-sm text-gray-600">DPI Resolution</div>
            </div>
          </div>

          {/* Preview Images */}
          {previewImages.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Preview</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {previewImages.map((image) => (
                  <div key={image.pageNumber} className="border rounded-lg p-3">
                    <img
                      src={image.dataUrl}
                      alt={`Page ${image.pageNumber}`}
                      className="w-full h-48 object-contain bg-gray-50 rounded mb-2"
                    />
                    <div className="text-sm text-gray-600 mb-2">
                      Page {image.pageNumber} • {(image.size / 1024).toFixed(1)}KB
                    </div>
                    <button
                      onClick={() => downloadImage(image)}
                      className="w-full bg-blue-500 text-white py-1 px-3 rounded text-sm hover:bg-blue-600"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
              {result.images.length > previewImages.length && (
                <div className="text-center mt-4 text-sm text-gray-600">
                  + {result.images.length - previewImages.length} more images
                </div>
              )}
            </div>
          )}

          {/* Individual Downloads */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Individual Downloads</h4>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {result.images.map((image) => (
                <div key={image.pageNumber} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{image.filename}</div>
                    <div className="text-sm text-gray-600">
                      Page {image.pageNumber} • {(image.size / 1024).toFixed(1)}KB
                    </div>
                  </div>
                  <button
                    onClick={() => downloadImage(image)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* New Conversion */}
          <button
            onClick={() => {
              reset();
              setUploadedFile(null);
            }}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Convert Another PDF
          </button>
        </div>
      )}
    </div>
  );
}