import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import Button from '../../../atoms/Button';
import ProgressBar from '../../../atoms/ProgressBar';

interface OCRToolbarProps {
  // File navigation
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  
  // Zoom controls
  scale: number;
  onScaleChange: (scale: number) => void;
  
  // View options
  showResults: boolean;
  onToggleResults: () => void;
  
  // Processing state
  isProcessing: boolean;
  progress: any;
  
  className?: string;
}

const OCRToolbar: React.FC<OCRToolbarProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  scale,
  onScaleChange,
  showResults,
  onToggleResults,
  isProcessing,
  progress,
  className = ''
}) => {
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className={`bg-white border-b border-gray-200 p-3 flex items-center justify-between ${className}`}>
      {/* Left side - Navigation */}
      <div className="flex items-center space-x-2">
        {/* Page Navigation */}
        {totalPages > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!canGoPrev}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center space-x-2 px-2">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    onPageChange(page);
                  }
                }}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
              />
              <span className="text-sm text-gray-600">/ {totalPages}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!canGoNext}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <div className="w-px h-6 bg-gray-300 mx-2" />
          </>
        )}

        {/* Zoom Controls */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onScaleChange(Math.max(0.25, scale - 0.25))}
          disabled={scale <= 0.25}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center space-x-2 px-2">
          <span className="text-sm text-gray-600 min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onScaleChange(Math.min(3, scale + 0.25))}
          disabled={scale >= 3}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onScaleChange(1)}
          title="Reset zoom to 100%"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Center - Progress Bar */}
      {isProcessing && progress && (
        <div className="flex-1 max-w-md mx-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-600 font-medium">{progress.status || 'Processing...'}</span>
              <span className="text-blue-600">{progress.progress?.toFixed(0) || 0}%</span>
            </div>
            <ProgressBar
              progress={progress.progress || 0}
              className="h-2"
            />
            {progress.currentPage && progress.totalPages && (
              <div className="text-xs text-gray-500 text-center">
                Page {progress.currentPage} of {progress.totalPages}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right side - View Options */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleResults}
          className={showResults ? 'bg-blue-100 text-blue-600' : ''}
        >
          {showResults ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="ml-2 text-sm">Results</span>
        </Button>
      </div>
    </div>
  );
};

export default OCRToolbar;