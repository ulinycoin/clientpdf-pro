import React, { useState } from 'react';
import { PDFProcessingResult } from '../../types';
import { SplitService } from '../../services/splitService';
import Button from '../atoms/Button';
import ProgressBar from '../atoms/ProgressBar';

interface SplitToolProps {
  files: File[];
  onComplete: (result: PDFProcessingResult[]) => void;
  onClose: () => void;
}

type SplitMode = 'all' | 'range' | 'specific';

const SplitTool: React.FC<SplitToolProps> = ({ files, onComplete, onClose }) => {
  const [mode, setMode] = useState<SplitMode>('all');
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(1);
  const [specificPages, setSpecificPages] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const selectedFile = files[0]; // Split works with single file

  const handleSplit = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      let options: any = { mode: 'pages' };

      if (mode === 'range') {
        options = {
          mode: 'range',
          startPage: startPage - 1, // Convert to 0-based
          endPage: endPage - 1
        };
      } else if (mode === 'specific') {
        // Parse specific pages from string
        const pageNumbers = specificPages
          .split(',')
          .map(p => parseInt(p.trim()) - 1) // Convert to 0-based
          .filter(p => !isNaN(p) && p >= 0);
        
        if (pageNumbers.length === 0) {
          setError('Please enter valid page numbers');
          setIsProcessing(false);
          return;
        }

        options = {
          mode: 'pages',
          pages: pageNumbers
        };
      }

      setProgress(50);

      const results = await SplitService.splitPDF(selectedFile, options);
      
      setProgress(100);
      
      // Filter out failed results for display
      const successResults = results.filter(r => r.success);
      
      if (successResults.length === 0) {
        const errorMessages = results
          .filter(r => !r.success)
          .map(r => r.error)
          .join(', ');
        setError(`Split failed: ${errorMessages}`);
        return;
      }

      setTimeout(() => {
        onComplete(results);
      }, 500);

    } catch (error) {
      console.error('Split error:', error);
      setError(error instanceof Error ? error.message : 'Split failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setIsProcessing(false);
    onClose();
  };

  if (!selectedFile) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Split PDF</h2>
        <p className="text-red-600 mb-4">Please select a PDF file to split.</p>
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Split PDF</h2>
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
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Split Mode
        </label>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="splitMode"
              value="all"
              checked={mode === 'all'}
              onChange={(e) => setMode(e.target.value as SplitMode)}
              className="mr-2"
              disabled={isProcessing}
            />
            <span>Split into individual pages</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="splitMode"
              value="range"
              checked={mode === 'range'}
              onChange={(e) => setMode(e.target.value as SplitMode)}
              className="mr-2"
              disabled={isProcessing}
            />
            <span>Split page range</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="splitMode"
              value="specific"
              checked={mode === 'specific'}
              onChange={(e) => setMode(e.target.value as SplitMode)}
              className="mr-2"
              disabled={isProcessing}
            />
            <span>Split specific pages</span>
          </label>
        </div>
      </div>

      {mode === 'range' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Page Range
          </label>
          <div className="flex items-center space-x-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <input
                type="number"
                min="1"
                value={startPage}
                onChange={(e) => setStartPage(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 border border-gray-300 rounded text-sm"
                disabled={isProcessing}
              />
            </div>
            <div className="pt-5">to</div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <input
                type="number"
                min="1"
                value={endPage}
                onChange={(e) => setEndPage(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 border border-gray-300 rounded text-sm"
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>
      )}

      {mode === 'specific' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specific Pages
          </label>
          <input
            type="text"
            placeholder="e.g., 1, 3, 5-7, 10"
            value={specificPages}
            onChange={(e) => setSpecificPages(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            disabled={isProcessing}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter page numbers separated by commas. Use ranges like "5-7".
          </p>
        </div>
      )}

      {isProcessing && (
        <div className="mb-6">
          <ProgressBar progress={progress} />
          <p className="text-sm text-gray-600 mt-2">
            {progress < 50 ? 'Analyzing PDF...' : 'Splitting pages...'}
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
          onClick={handleSplit}
          disabled={isProcessing}
          loading={isProcessing}
          className="flex-1"
        >
          {isProcessing ? 'Splitting...' : 'Split PDF'}
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
          <strong>Note:</strong> Each split page will be downloaded as a separate PDF file.
        </p>
      </div>
    </div>
  );
};

export default SplitTool;