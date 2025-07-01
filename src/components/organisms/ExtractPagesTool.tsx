import React, { useState } from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import ProgressBar from '../atoms/ProgressBar';
import FileUploadZone from '../molecules/FileUploadZone';
import { useExtractPages } from '../../hooks/useExtractPages';
import { PAGE_SELECTION_MODES } from '../../types/pageExtraction.types';

export const ExtractPagesTool: React.FC = () => {
  const {
    file,
    pages,
    totalPages,
    selectedPages,
    isProcessing,
    error,
    progress,
    result,
    loadFile,
    selectPage,
    selectPageRange,
    selectAllPages,
    clearSelection,
    parseAndSelectRange,
    extractPages,
    reset,
    getSelectedPagesText,
    isValidSelection
  } = useExtractPages();

  const [selectionMode, setSelectionMode] = useState<'individual' | 'range' | 'all' | 'custom'>('individual');
  const [rangeInput, setRangeInput] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  const handleFileUpload = async (uploadedFiles: File[]) => {
    if (uploadedFiles.length > 0) {
      await loadFile(uploadedFiles[0]);
    }
  };

  const handleRangeSelection = () => {
    const start = parseInt(rangeStart);
    const end = parseInt(rangeEnd);
    
    if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= totalPages) {
      selectPageRange(start, end);
    }
  };

  const handleCustomRange = () => {
    if (rangeInput.trim()) {
      parseAndSelectRange(rangeInput.trim());
    }
  };

  if (!file) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="extract" className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Extract PDF Pages</h2>
          <p className="text-gray-600">
            Extract specific pages from your PDF into a new document
          </p>
        </div>

        <FileUploadZone
          onFilesSelected={handleFileUpload}
          accept="application/pdf"
          maxFiles={1}
          maxSizeMB={50}
        />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Icon name="checkmark" className="w-4 h-4 text-green-500 mr-2" />
            Select specific pages or ranges
          </div>
          <div className="flex items-center">
            <Icon name="checkmark" className="w-4 h-4 text-green-500 mr-2" />
            Preview page selection
          </div>
          <div className="flex items-center">
            <Icon name="checkmark" className="w-4 h-4 text-green-500 mr-2" />
            Maintain original quality
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Extract PDF Pages</h2>
          <p className="text-gray-600 mt-1">
            Select pages to extract from: <span className="font-medium">{file.name}</span>
          </p>
          <p className="text-sm text-gray-500">
            Total pages: {totalPages} • Selected: {selectedPages.length}
          </p>
        </div>
        <Button variant="outline" onClick={reset} className="flex items-center">
          <Icon name="refresh" className="w-4 h-4 mr-2" />
          New File
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <Icon name="alert" className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Selection Mode Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 mb-4">
          {PAGE_SELECTION_MODES.map((mode) => (
            <button
              key={mode.type}
              onClick={() => setSelectionMode(mode.type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectionMode === mode.type
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Selection Controls */}
        <div className="bg-gray-50 p-4 rounded-lg">
          {selectionMode === 'individual' && (
            <div>
              <p className="text-sm text-gray-600 mb-3">Click on page numbers below to select individual pages:</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Selected: {getSelectedPagesText()}</span>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear All
                </Button>
              </div>
            </div>
          )}

          {selectionMode === 'range' && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">From:</label>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                  placeholder="1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">To:</label>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                  placeholder={totalPages.toString()}
                />
              </div>
              <Button variant="primary" size="sm" onClick={handleRangeSelection}>
                Select Range
              </Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          )}

          {selectionMode === 'all' && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Extract all {totalPages} pages (copy entire document)</p>
              <div className="space-x-2">
                <Button variant="primary" size="sm" onClick={selectAllPages}>
                  Select All Pages
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            </div>
          )}

          {selectionMode === 'custom' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Range (e.g., "1-5, 8, 10-12"):
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    placeholder="1-5, 8, 10-12"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <Button variant="primary" onClick={handleCustomRange}>
                    Parse Range
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Selected: {getSelectedPagesText()}</span>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Page Grid */}
      {totalPages > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Pages Preview</h3>
          <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => selectPage(pageNum)}
                className={`w-10 h-12 border-2 rounded text-xs font-medium transition-all ${
                  selectedPages.includes(pageNum)
                    ? 'border-purple-500 bg-purple-100 text-purple-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50'
                }`}
                title={`Page ${pageNum}${selectedPages.includes(pageNum) ? ' (selected)' : ''}`}
              >
                {pageNum}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {isProcessing && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Extracting pages...</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <ProgressBar progress={progress} color="blue" />
        </div>
      )}

      {/* Result Summary */}
      {result && result.success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <Icon name="checkmark" className="w-5 h-5 text-green-500 mr-2" />
            <div className="text-green-700">
              <div className="font-medium">Pages extracted successfully!</div>
              <div className="text-sm">
                Extracted {result.extractedPageCount} of {result.originalPageCount} pages
                {result.processingTime && ` in ${(result.processingTime / 1000).toFixed(1)}s`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {selectedPages.length > 0 && (
            <span>Ready to extract {selectedPages.length} page{selectedPages.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={clearSelection}
            disabled={selectedPages.length === 0}
          >
            Clear Selection
          </Button>
          <Button
            variant="primary"
            onClick={() => extractPages()}
            disabled={!isValidSelection() || isProcessing}
            className="flex items-center"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Extracting...
              </>
            ) : (
              <>
                <Icon name="download" className="w-4 h-4 mr-2" />
                Extract Pages
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Tips for Page Extraction:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use "Range" mode for continuous pages (e.g., pages 1-10)</li>
          <li>• Use "Custom" mode for complex selections (e.g., "1-5, 8, 10-12")</li>
          <li>• Click individual page numbers to toggle selection</li>
          <li>• All original formatting and quality will be preserved</li>
        </ul>
      </div>
    </div>
  );
};
