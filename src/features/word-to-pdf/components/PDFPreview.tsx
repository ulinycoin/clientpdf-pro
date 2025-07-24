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
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-gray-600">Generating PDF preview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!pdfBytes) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>PDF preview will appear here</p>
            <p className="text-sm">Upload a Word document to get started</p>
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
      {/* Preview Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-500" />
            <div>
              <h3 className="font-medium text-gray-900">{fileName}</h3>
              <p className="text-sm text-gray-500">PDF Preview</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

            {/* Download Button */}
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Download</span>
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
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Preview may differ slightly from final PDF</span>
          <span>{pdfBytes ? `${Math.round(pdfBytes.length / 1024)} KB` : ''}</span>
        </div>
      </div>
    </div>
  );
};
