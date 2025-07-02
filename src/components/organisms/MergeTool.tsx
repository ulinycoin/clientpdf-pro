import React, { useState, useCallback } from 'react';
import { MergeToolProps, PDFProcessingResult, MergeOptions } from '../../types';
import { pdfService } from '../../services/pdfService';
import Button from '../atoms/Button';
import ProgressBar from '../atoms/ProgressBar';

const MergeTool: React.FC<MergeToolProps> = ({
  files,
  onComplete,
  onClose,
  className = ''
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<MergeOptions>({
    order: Array.from({ length: files.length }, (_, i) => i),
    bookmarks: true,
    metadata: {
      title: 'Merged PDF',
      author: 'LocalPDF',
      subject: 'Merged PDF Document'
    }
  });

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 files to merge');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage('Starting merge...');
    setError(null);

    try {
      const result = await pdfService.mergePDFs(
        files,
        options,
        (progress, message) => {
          setProgress(progress);
          setProgressMessage(message || '');
        }
      );

      if (result.success) {
        onComplete(result);
      } else {
        setError(result.error?.message || 'Merge failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  const moveFile = (fromIndex: number, toIndex: number) => {
    if (isProcessing) return;
    
    const newOrder = [...(options.order || [])];
    const item = newOrder.splice(fromIndex, 1)[0];
    newOrder.splice(toIndex, 0, item);
    
    setOptions(prev => ({ ...prev, order: newOrder }));
  };

  const orderedFiles = options.order ? 
    options.order.map(index => files[index]).filter(Boolean) : 
    files;

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Merge PDFs</h2>
          <p className="text-gray-600 mt-1">
            Combine {files.length} files into one PDF document
          </p>
        </div>
        <Button variant="ghost" onClick={onClose}>
          ✕
        </Button>
      </div>

      {/* File List with Reordering */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Files to merge (drag to reorder):
        </h3>
        
        <div className="space-y-2">
          {orderedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center space-x-3">
                <div className="cursor-move text-gray-400">
                  ⋮⋮
                </div>
                <div className="text-lg">📄</div>
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => moveFile(index, Math.max(0, index - 1))}
                  disabled={index === 0 || isProcessing}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveFile(index, Math.min(orderedFiles.length - 1, index + 1))}
                  disabled={index === orderedFiles.length - 1 || isProcessing}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            📊 Total size: {formatFileSize(totalSize)} • {files.length} files
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Options:</h3>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.bookmarks}
              onChange={(e) => setOptions(prev => ({ ...prev, bookmarks: e.target.checked }))}
              disabled={isProcessing}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-3 text-sm text-gray-700">
              Create bookmarks for each file
            </span>
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={options.metadata?.title || ''}
                onChange={(e) => setOptions(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, title: e.target.value }
                }))}
                disabled={isProcessing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Document title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author
              </label>
              <input
                type="text"
                value={options.metadata?.author || ''}
                onChange={(e) => setOptions(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, author: e.target.value }
                }))}
                disabled={isProcessing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Author name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={options.metadata?.subject || ''}
                onChange={(e) => setOptions(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, subject: e.target.value }
                }))}
                disabled={isProcessing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Document subject"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      {isProcessing && (
        <div className="mb-6">
          <ProgressBar
            value={progress}
            className="mb-2"
            animated={true}
          />
          <p className="text-sm text-gray-600 text-center">
            {progressMessage}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-red-400 mr-2">⚠️</div>
            <div>
              <h4 className="text-red-800 font-medium">Merge Failed</h4>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleMerge}
          disabled={files.length < 2 || isProcessing}
          loading={isProcessing}
        >
          {isProcessing ? 'Merging...' : `Merge ${files.length} Files`}
        </Button>
      </div>
    </div>
  );
};

export default MergeTool;