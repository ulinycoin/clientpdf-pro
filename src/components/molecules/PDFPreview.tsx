import React from 'react';
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
  // Временное решение - просто показываем информацию о файле
  React.useEffect(() => {
    // Эмулируем загрузку
    setTimeout(() => {
      onPagesLoaded?.(1); // Временно возвращаем 1 страницу
    }, 100);
  }, [onPagesLoaded]);

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
        <p className="text-xs text-gray-400 mt-4">
          Предпросмотр временно недоступен
        </p>
      </div>
    </div>
  );
};