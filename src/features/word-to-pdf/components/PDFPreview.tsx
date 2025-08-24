import React, { useState, useEffect } from 'react';
import { Eye, Download, FileText, Clock, AlertCircle, ZoomIn, ZoomOut } from 'lucide-react';

interface PDFPreviewProps {
  pdfBytes: Uint8Array | null;
  fileName: string;
  onDownload: () => void;
  isGenerating: boolean;
  onRegenerate?: () => void;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
  pdfBytes,
  fileName,
  onDownload,
  isGenerating,
  onRegenerate
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (pdfBytes) {
      generatePreview();
    } else {
      cleanupPreview();
    }

    return cleanupPreview;
  }, [pdfBytes]);

  const generatePreview = async () => {
    if (!pdfBytes) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create blob URL for PDF preview
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
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

  if (isGenerating) {
    return (
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl mx-auto">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <p className="font-black text-black dark:text-white text-lg mb-2">Generating PDF preview...</p>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Please wait while we prepare your document</p>
          </div>
        </div>
      </div>
    );
  }

  if (!pdfBytes) {
    return (
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl mx-auto">
              <Eye className="w-8 h-8" />
            </div>
            <p className="font-black text-black dark:text-white text-lg mb-2">PDF preview will appear here</p>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Upload a Word document to get started</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200/60 dark:border-red-600/20 rounded-2xl p-8 backdrop-blur-sm shadow-xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <p className="font-black text-red-800 dark:text-red-200 text-lg mb-2">Preview Error</p>
            <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-4">{error}</p>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="btn-privacy-modern bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-black px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
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
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl overflow-hidden">
      {/* Preview Header */}
      <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm px-3 py-2 border-b border-white/20 dark:border-gray-600/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center text-white shadow-md flex-shrink-0">
              <FileText className="w-3 h-3" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-black dark:text-white text-sm truncate">{fileName}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">PDF Preview</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Zoom Controls */}
            <div className="flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/40 dark:border-gray-600/40 rounded-md overflow-hidden shadow-sm text-xs">
              <button
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                className="px-1.5 py-1 hover:bg-gray-50 dark:hover:bg-gray-700/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                title="Zoom out"
              >
                <ZoomOut className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </button>
              <span className="px-2 py-1 text-xs font-semibold text-black dark:text-white border-x border-white/40 dark:border-gray-600/40 min-w-[2.5rem] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={scale >= 2}
                className="px-1.5 py-1 hover:bg-gray-50 dark:hover:bg-gray-700/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                title="Zoom in"
              >
                <ZoomIn className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Download Button */}
            <button
              onClick={onDownload}
              className="flex items-center gap-1 bg-gradient-to-br from-seafoam-500 to-ocean-500 hover:from-seafoam-600 hover:to-ocean-600 text-white font-semibold px-2.5 py-1.5 rounded-md shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Download</span>
            </button>
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
              title="PDF Preview"
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
      <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm px-4 py-2 border-t border-white/20 dark:border-gray-600/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Preview may differ from final PDF</span>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200/60 dark:border-blue-600/20 rounded-md px-2 py-0.5 backdrop-blur-sm flex-shrink-0">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              {pdfBytes ? `${Math.round(pdfBytes.length / 1024)} KB` : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
