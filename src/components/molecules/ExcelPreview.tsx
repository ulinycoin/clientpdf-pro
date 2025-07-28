import React, { useState, useEffect } from 'react';
import { Eye, Download, FileSpreadsheet, Clock, AlertCircle, ZoomIn, ZoomOut, AlertTriangle, Info, RotateCcw } from 'lucide-react';
import { ConversionResult } from '../../types/excelToPdf.types';

interface ExcelPreviewProps {
  result: ConversionResult | null;
  fileName: string;
  onDownload: () => void;
  onDownloadAll?: () => void;
  isGenerating: boolean;
  onRegenerate?: () => void;
  onOrientationToggle?: () => void;
  tableOverflowWarning?: {
    isOverflowing: boolean;
    recommendedOrientation?: 'landscape' | 'portrait';
    recommendedPageSize?: string;
    columnCount: number;
    scaleFactor?: number;
  };
}

export const ExcelPreview: React.FC<ExcelPreviewProps> = ({
  result,
  fileName,
  onDownload,
  onDownloadAll,
  isGenerating,
  onRegenerate,
  onOrientationToggle,
  tableOverflowWarning
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  const pdfFiles = result?.success ? result.pdfFiles : null;
  const currentPdfFile = pdfFiles?.[currentFileIndex];

  // Debug logging
  console.log('🔍 ExcelPreview Debug:', {
    result: result ? { success: result.success, hasFiles: !!result.pdfFiles } : null,
    pdfFiles: pdfFiles ? pdfFiles.length : 0,
    currentPdfFile: !!currentPdfFile,
    isGenerating,
    fileName
  });

  useEffect(() => {
    if (currentPdfFile) {
      generatePreview();
    } else {
      cleanupPreview();
    }

    return cleanupPreview;
  }, [currentPdfFile]);

  const generatePreview = async () => {
    if (!currentPdfFile) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create blob URL for PDF preview
      const blob = new Blob([currentPdfFile.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Error generating preview:', err);
      setError('Failed to generate preview');
    } finally {
      setIsLoading(false);
    }
  };

  const cleanupPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleFileSwitch = (index: number) => {
    if (pdfFiles && index >= 0 && index < pdfFiles.length) {
      setCurrentFileIndex(index);
    }
  };

  if (isGenerating) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-gray-600">Generating Excel PDF preview...</p>
            <p className="text-sm text-gray-500 mt-1">Processing spreadsheet data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result || !result.success) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>PDF preview will appear here</p>
            <p className="text-sm">Upload an Excel file and convert to see preview</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-200 rounded-lg p-6 bg-red-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-red-600">
            <AlertCircle className="w-12 h-12 mx-auto mb-3" />
            <p className="font-medium">Preview Error</p>
            <p className="text-sm">{error}</p>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Table Overflow Warning */}
      {tableOverflowWarning?.isOverflowing && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-yellow-800 mb-1">Table Layout Warning</h4>
              <p className="text-sm text-yellow-700 mb-2">
                Your table has {tableOverflowWarning.columnCount} columns which may be too wide for optimal display.
                {tableOverflowWarning.scaleFactor && tableOverflowWarning.scaleFactor < 0.7 &&
                  ` Text has been scaled to ${Math.round(tableOverflowWarning.scaleFactor * 100)}% to fit.`
                }
              </p>
              <div className="flex flex-wrap gap-2">
                {tableOverflowWarning.recommendedOrientation && onOrientationToggle && (
                  <button
                    onClick={onOrientationToggle}
                    className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm hover:bg-yellow-200 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Try {tableOverflowWarning.recommendedOrientation} orientation
                  </button>
                )}
                {tableOverflowWarning.recommendedPageSize && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                    Consider {tableOverflowWarning.recommendedPageSize} format
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="font-medium text-gray-900">{fileName}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Excel to PDF Preview</span>
                {pdfFiles && pdfFiles.length > 1 && (
                  <>
                    <span>•</span>
                    <span>{pdfFiles.length} files generated</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* File Switcher for Multiple PDFs */}
            {pdfFiles && pdfFiles.length > 1 && (
              <div className="flex items-center gap-1 bg-white border border-gray-300 rounded">
                <button
                  onClick={() => handleFileSwitch(currentFileIndex - 1)}
                  disabled={currentFileIndex === 0}
                  className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous file"
                >
                  <span className="text-sm">‹</span>
                </button>
                <span className="px-2 text-sm font-mono">
                  {currentFileIndex + 1} / {pdfFiles.length}
                </span>
                <button
                  onClick={() => handleFileSwitch(currentFileIndex + 1)}
                  disabled={currentFileIndex === pdfFiles.length - 1}
                  className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next file"
                >
                  <span className="text-sm">›</span>
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white border border-gray-300 rounded">
              <button
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 text-sm font-mono">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={scale >= 2}
                className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Download Buttons */}
            <div className="flex gap-1">
              {pdfFiles && pdfFiles.length > 1 && onDownloadAll && (
                <button
                  onClick={onDownloadAll}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  title="Download all PDF files"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">All ({pdfFiles.length})</span>
                </button>
              )}
              <button
                onClick={onDownload}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                title={pdfFiles && pdfFiles.length > 1 ? "Download current file" : "Download PDF"}
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {pdfFiles && pdfFiles.length > 1 ? 'Current' : 'Download'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading preview...</p>
            </div>
          </div>
        ) : previewUrl ? (
          <div className="relative overflow-auto max-h-96">
            <iframe
              src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full border border-gray-300 rounded"
              style={{
                height: '400px',
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: `${100 / scale}%`
              }}
              title="Excel PDF Preview"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-96 text-gray-500">
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p>Preparing preview...</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>Preview may differ slightly from final PDF</span>
            {currentPdfFile && (
              <div className="flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>{currentPdfFile.sheetName || 'Sheet'}</span>
              </div>
            )}
          </div>
          <span>
            {currentPdfFile ? `${Math.round(currentPdfFile.data.length / 1024)} KB` : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExcelPreview;
