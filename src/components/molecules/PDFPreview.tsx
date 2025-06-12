import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { FileText, Eye, Download } from 'lucide-react';
import { Button } from '../atoms/Button';

interface PDFPreviewProps {
  file: File;
  className?: string;
  onPagesLoaded?: (pageCount: number) => void;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
  file,
  className,
  onPagesLoaded,
}) => {
  const [fileUrl, setFileUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const setupPreview = () => {
      try {
        setLoading(true);
        setError('');

        // Create object URL for the file
        const url = URL.createObjectURL(file);
        setFileUrl(url);
        
        if (onPagesLoaded) {
          onPagesLoaded(1); // Simplified - just return 1 page for now
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error setting up PDF preview:', err);
        setError('Failed to load PDF file');
        setLoading(false);
      }
    };

    if (file) {
      setupPreview();
    }

    // Cleanup
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [file, onPagesLoaded]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className={clsx('flex items-center justify-center p-8', className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx('flex items-center justify-center p-8', className)}>
        <div className="text-center">
          <p className="text-red-600 mb-2">❌ {error}</p>
          <p className="text-sm text-gray-500">Please try uploading a different PDF file</p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('flex flex-col bg-white rounded-lg border border-gray-200', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="text-sm font-medium text-gray-900 truncate max-w-xs">
              {file.name}
            </h3>
            <p className="text-xs text-gray-500">
              {formatFileSize(file.size)} • PDF Document
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Eye}
            onClick={() => window.open(fileUrl, '_blank')}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Download}
            onClick={() => {
              const link = document.createElement('a');
              link.href = fileUrl;
              link.download = file.name;
              link.click();
            }}
          >
            Download
          </Button>
        </div>
      </div>

      {/* PDF Embed */}
      <div className="flex-1 p-4">
        <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden border border-gray-200">
          <iframe
            key={file.name} // Force re-render when file changes
            src={fileUrl}
            className="w-full h-full"
            title={`PDF Preview: ${file.name}`}
            style={{ minHeight: '400px' }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>📄 PDF Document</span>
          <span>Ready for processing</span>
        </div>
      </div>
    </div>
  );
};