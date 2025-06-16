import React, { Suspense, lazy } from 'react';

const LazyPDFProcessor = lazy(() => 
  import('./PDFProcessor').then(module => ({ default: module.PDFProcessor }))
);

interface PDFProcessorProps {
  files: File[];
  className?: string;
}

export const OptimizedPDFProcessor: React.FC<PDFProcessorProps> = (props) => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Загружаем PDF инструменты...</span>
      </div>
    }>
      <LazyPDFProcessor {...props} />
    </Suspense>
  );
};