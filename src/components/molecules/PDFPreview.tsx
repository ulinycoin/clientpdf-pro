import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { FileText } from 'lucide-react';

interface PDFPreviewProps {
  file: File;
  className?: string;
  onPagesLoaded?: (numPages: number) => void;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ 
  file, 
  className,
  onPagesLoaded 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Эмуляция загрузки PDF
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Пока что возвращаем фиксированное количество страниц
        onPagesLoaded?.(1);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF');
        setLoading(false);
      }
    };

    if (file) {
      loadPDF();
    }
  }, [file, onPagesLoaded]);

  if (loading) {
    return (
      <div className={clsx(
        'bg-gray-50 rounded-lg flex items-center justify-center p-8',
        className
      )}>
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx(
        'bg-red-50 rounded-lg flex items-center justify-center p-8',
        className
      )}>
        <div className="text-center">
          <FileText className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      'bg-gray-50 rounded-lg flex items-center justify-center p-8',
      className
    )}>
      <div className="text-center">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-900 font-medium">{file.name}</p>
        <p className="text-sm text-gray-500 mt-1">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
        <p className="text-xs text-green-600 mt-2">
          ✅ PDF loaded successfully
        </p>
      </div>
    </div>
  );
};