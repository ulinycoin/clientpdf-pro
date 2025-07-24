import React, { useState, useEffect } from 'react';
import { PDFProcessingResult } from '../../types';
import { RotateService } from '../../services/rotateService';
import Button from '../atoms/Button';
import ProgressBar from '../atoms/ProgressBar';

interface RotateToolProps {
  files: File[];
  onComplete: (result: PDFProcessingResult) => void;
  onClose: () => void;
}

const RotateTool: React.FC<RotateToolProps> = ({ files, onComplete, onClose }) => {
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [pageSelection, setPageSelection] = useState<'all' | 'specific'>('all');
  const [specificPages, setSpecificPages] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<{
    totalPages: number;
    pageOrientations: ('portrait' | 'landscape')[];
  } | null>(null);

  const selectedFile = files[0]; // Rotate works with single file

  useEffect(() => {
    const loadPageInfo = async () => {
      if (selectedFile) {
        const info = await RotateService.getPageInfo(selectedFile);
        setPageInfo(info);
      }
    };
    
    loadPageInfo();
  }, [selectedFile]);

  const handleRotate = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      let options: any = { rotation };

      if (pageSelection === 'specific') {
        // Parse specific pages from string
        const pageNumbers = specificPages
          .split(',')
          .map(p => {
            const num = parseInt(p.trim());
            return isNaN(num) ? -1 : num - 1; // Convert to 0-based
          })
          .filter(p => p >= 0);
        
        if (pageNumbers.length === 0) {
          setError('Please enter valid page numbers');
          setIsProcessing(false);
          return;
        }

        options.pages = pageNumbers;
      }

      setProgress(50);

      const result = await RotateService.rotatePDF(selectedFile, options);
      
      setProgress(100);
      
      if (!result.success) {
        setError(result.error?.message || 'Rotation failed');
        return;
      }

      setTimeout(() => {
        onComplete(result);
      }, 500);

    } catch (error) {
      console.error('Rotate error:', error);
      setError(error instanceof Error ? error.message : 'Rotation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setIsProcessing(false);
    onClose();
  };

  const getRotationIcon = (degrees: number) => {
    switch (degrees) {
      case 90:
        return '↻';
      case 180:
        return '↻↻';
      case 270:
        return '↺';
      default:
        return '↻';
    }
  };

  if (!selectedFile) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Rotate PDF</h2>
        <p className="text-red-600 mb-4">Please select a PDF file to rotate.</p>
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Rotate PDF</h2>
        <Button onClick={onClose} variant="outline" size="sm">
          Close
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
          <div className="text-red-500 text-xl">📄</div>
          <div>
            <p className="font-medium text-gray-900">{selectedFile.name}</p>
            <p className="text-sm text-gray-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              {pageInfo && ` • ${pageInfo.totalPages} pages`}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Rotation Angle
        </label>
        
        <div className="flex space-x-4">
          {[90, 180, 270].map((degrees) => (
            <button
              key={degrees}
              onClick={() => setRotation(degrees as 90 | 180 | 270)}
              className={`p-4 rounded-lg border-2 transition-colors ${
                rotation === degrees
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              disabled={isProcessing}
            >
              <div className="text-2xl mb-1">{getRotationIcon(degrees)}</div>
              <div className="text-sm font-medium">{degrees}°</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Pages to Rotate
        </label>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="pageSelection"
              value="all"
              checked={pageSelection === 'all'}
              onChange={(e) => setPageSelection(e.target.value as 'all' | 'specific')}
              className="mr-2"
              disabled={isProcessing}
            />
            <span>All pages</span>
            {pageInfo && (
              <span className="ml-2 text-sm text-gray-500">
                ({pageInfo.totalPages} pages)
              </span>
            )}
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="pageSelection"
              value="specific"
              checked={pageSelection === 'specific'}
              onChange={(e) => setPageSelection(e.target.value as 'all' | 'specific')}
              className="mr-2"
              disabled={isProcessing}
            />
            <span>Specific pages</span>
          </label>
        </div>
      </div>

      {pageSelection === 'specific' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Page Numbers
          </label>
          <input
            type="text"
            placeholder="e.g., 1, 3, 5, 7"
            value={specificPages}
            onChange={(e) => setSpecificPages(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            disabled={isProcessing}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter page numbers separated by commas.
          </p>
        </div>
      )}

      {pageInfo && (
        <div className="mb-6 p-3 bg-gray-50 rounded">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Page Overview</h4>
          <div className="flex flex-wrap gap-1">
            {pageInfo.pageOrientations.map((orientation, index) => (
              <div
                key={index}
                className={`w-6 h-8 text-xs flex items-center justify-center rounded ${
                  orientation === 'portrait'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}
                title={`Page ${index + 1} - ${orientation}`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Blue: Portrait • Green: Landscape
          </p>
        </div>
      )}

      {isProcessing && (
        <div className="mb-6">
          <ProgressBar progress={progress} />
          <p className="text-sm text-gray-600 mt-2">
            {progress < 50 ? 'Analyzing PDF...' : 'Rotating pages...'}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="flex space-x-3">
        <Button
          onClick={handleRotate}
          disabled={isProcessing}
          loading={isProcessing}
          className="flex-1"
        >
          {isProcessing ? 'Rotating...' : `Rotate ${rotation}°`}
        </Button>
        
        <Button
          onClick={handleCancel}
          variant="outline"
          disabled={isProcessing}
        >
          Cancel
        </Button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-blue-700 text-sm">
          <strong>Note:</strong> The rotated PDF will be downloaded automatically.
        </p>
      </div>
    </div>
  );
};

export default RotateTool;