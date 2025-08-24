import React, { useState, useEffect } from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import ProgressBar from '../atoms/ProgressBar';
import { useExtractPages } from '../../hooks/useExtractPages';
import { 
  PAGE_SELECTION_MODES, 
  ExtractPagesToolProps 
} from '../../types/pageExtraction.types';

export const ExtractPagesTool: React.FC<ExtractPagesToolProps> = ({
  files,
  onComplete,
  onClose,
  className = ''
}) => {
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

  // Load the first file when component mounts or files change
  useEffect(() => {
    if (files && files.length > 0 && !file) {
      loadFile(files[0]);
    }
  }, [files, file, loadFile]);

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

  const handleExtract = async () => {
    await extractPages();
    // Note: Since ExtractPagesTool handles its own download,
    // we call onComplete with a dummy success result
    if (result && result.success) {
      onComplete({
        success: true,
        blob: undefined, // Download already handled
        extractedPageCount: result.extractedPageCount,
        originalPageCount: result.originalPageCount,
        processingTime: result.processingTime
      });
    }
  };

  // Show loading state while file is being loaded
  if (!file && files && files.length > 0) {
    return (
      <div className={`max-w-4xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl p-8 ${className} transition-all duration-300`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white text-2xl">📑</span>
          </div>
          <h2 className="text-2xl font-black text-black dark:text-white mb-4">Extract PDF Pages</h2>
          <p className="text-gray-800 dark:text-gray-100 font-medium mb-6">Loading PDF file...</p>
          <div className="max-w-md mx-auto">
            <ProgressBar progress={50} color="blue" />
          </div>
        </div>
      </div>
    );
  }

  // Show error if no file available
  if (!file) {
    return (
      <div className={`max-w-4xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl p-8 ${className} transition-all duration-300`}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-black dark:text-white">Extract PDF Pages</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-seafoam-50 dark:hover:bg-seafoam-900/20 rounded-lg transition-all duration-200 flex items-center space-x-2"
          >
            <span>←</span>
            <span className="font-medium text-black dark:text-white">Back to Tools</span>
          </button>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white text-2xl">⚠️</span>
          </div>
          <p className="text-gray-800 dark:text-gray-100 font-medium mb-6">No PDF file available for page extraction.</p>
          <button
            onClick={onClose}
            className="btn-privacy-modern text-lg px-8 py-3 ripple-effect btn-press"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl p-8 ${className} transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-black dark:text-white">Extract PDF Pages</h2>
          <p className="text-gray-800 dark:text-gray-100 font-medium mt-2">
            Select pages to extract from: <span className="font-black">{file.name}</span>
          </p>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
            Total pages: {totalPages} • Selected: {selectedPages.length}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-seafoam-50 dark:hover:bg-seafoam-900/20 rounded-lg transition-all duration-200 flex items-center space-x-2"
        >
          <span>←</span>
          <span className="font-medium text-black dark:text-white">Back to Tools</span>
        </button>
      </div>

      {error && (
        <div className="mb-8 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 backdrop-blur-sm border border-red-200/60 dark:border-red-600/20 rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white mr-4">
              ⚠️
            </div>
            <span className="text-red-800 dark:text-red-200 font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Selection Mode Tabs */}
      <div className="mb-8">
        <div className="flex space-x-2 mb-6">
          {PAGE_SELECTION_MODES.map((mode) => (
            <button
              key={mode.type}
              onClick={() => setSelectionMode(mode.type)}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                selectionMode === mode.type
                  ? 'bg-gradient-to-br from-seafoam-500 to-ocean-500 text-white shadow-lg transform scale-105'
                  : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 text-black dark:text-white hover:bg-seafoam-50 dark:hover:bg-seafoam-900/20 hover:scale-102 shadow-lg'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Selection Controls */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-6 shadow-lg">
          {selectionMode === 'individual' && (
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-4">Click on page numbers below to select individual pages:</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-black text-black dark:text-white">Selected: {getSelectedPagesText()}</span>
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-300/80 dark:border-gray-600/20 rounded-lg text-black dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-lg"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {selectionMode === 'range' && (
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <label className="text-sm font-black text-black dark:text-white">From:</label>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300/80 dark:border-gray-600/20 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg text-black dark:text-white font-medium text-center focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-200 shadow-sm"
                  placeholder="1"
                />
              </div>
              <div className="flex items-center space-x-3">
                <label className="text-sm font-black text-black dark:text-white">To:</label>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300/80 dark:border-gray-600/20 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg text-black dark:text-white font-medium text-center focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-200 shadow-sm"
                  placeholder={totalPages.toString()}
                />
              </div>
              <button
                onClick={handleRangeSelection}
                className="btn-privacy-modern text-sm px-4 py-2 ripple-effect btn-press"
              >
                Select Range
              </button>
              <button
                onClick={clearSelection}
                className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-300/80 dark:border-gray-600/20 rounded-lg text-black dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-lg"
              >
                Clear
              </button>
            </div>
          )}

          {selectionMode === 'all' && (
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Extract all {totalPages} pages (copy entire document)</p>
              <div className="space-x-4">
                <button
                  onClick={selectAllPages}
                  className="btn-privacy-modern text-sm px-4 py-2 ripple-effect btn-press"
                >
                  Select All Pages
                </button>
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-300/80 dark:border-gray-600/20 rounded-lg text-black dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-lg"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {selectionMode === 'custom' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-3">
                  Page Range (e.g., "1-5, 8, 10-12"):
                </label>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    placeholder="1-5, 8, 10-12"
                    className="flex-1 px-4 py-3 border border-gray-300/80 dark:border-gray-600/20 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-200 shadow-sm"
                  />
                  <button
                    onClick={handleCustomRange}
                    className="btn-privacy-modern text-sm px-6 py-3 ripple-effect btn-press"
                  >
                    Parse Range
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-black text-black dark:text-white">Selected: {getSelectedPagesText()}</span>
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-300/80 dark:border-gray-600/20 rounded-lg text-black dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-lg"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Page Grid */}
      {totalPages > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-black text-black dark:text-white mb-4">Pages Preview</h3>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-6 shadow-lg">
            <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-3 max-h-96 overflow-y-auto">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => selectPage(pageNum)}
                  className={`w-12 h-14 border-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                    selectedPages.includes(pageNum)
                      ? 'border-seafoam-500 bg-gradient-to-br from-seafoam-100 to-ocean-100 dark:from-seafoam-900/40 dark:to-ocean-900/40 text-seafoam-700 dark:text-seafoam-300 shadow-lg transform scale-105'
                      : 'border-gray-300/80 dark:border-gray-600/20 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:border-seafoam-400 hover:bg-seafoam-50 dark:hover:bg-seafoam-900/20 hover:scale-102 shadow-sm'
                  }`}
                  title={`Page ${pageNum}${selectedPages.includes(pageNum) ? ' (selected)' : ''}`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {isProcessing && (
        <div className="mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-black text-black dark:text-white">Extracting pages...</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{Math.round(progress)}%</span>
            </div>
            <ProgressBar progress={progress} color="blue" />
          </div>
        </div>
      )}

      {/* Result Summary */}
      {result && result.success && (
        <div className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-sm border border-green-200/60 dark:border-green-600/20 rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white mr-4 shadow-lg">
              ✅
            </div>
            <div className="text-green-800 dark:text-green-200">
              <div className="font-black text-lg">Pages extracted successfully!</div>
              <div className="text-sm font-medium mt-1">
                Extracted {result.extractedPageCount} of {result.originalPageCount} pages
                {result.processingTime && ` in ${(result.processingTime / 1000).toFixed(1)}s`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
          {selectedPages.length > 0 && (
            <span>Ready to extract {selectedPages.length} page{selectedPages.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={clearSelection}
            disabled={selectedPages.length === 0}
            className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-300/80 dark:border-gray-600/20 rounded-xl text-black dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            Clear Selection
          </button>
          <button
            onClick={handleExtract}
            disabled={!isValidSelection() || isProcessing}
            className="btn-privacy-modern text-lg px-8 py-3 min-w-[200px] ripple-effect btn-press disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                Extracting...
              </>
            ) : (
              <>
                📑 Extract Pages
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm border border-blue-200/60 dark:border-blue-600/20 rounded-xl p-6 shadow-lg">
        <h4 className="text-sm font-black text-blue-800 dark:text-blue-200 mb-4">💡 Tips for Page Extraction:</h4>
        <ul className="text-sm font-medium text-blue-700 dark:text-blue-300 space-y-2">
          <li>• Use "Range" mode for continuous pages (e.g., pages 1-10)</li>
          <li>• Use "Custom" mode for complex selections (e.g., "1-5, 8, 10-12")</li>
          <li>• Click individual page numbers to toggle selection</li>
          <li>• All original formatting and quality will be preserved</li>
        </ul>
      </div>
    </div>
  );
};

// Add default export
export default ExtractPagesTool;
