import React from 'react';

interface ToolbarProps {
  currentPage: number;
  totalPages: number;
  scale: number;
  canUndo: boolean;
  canRedo: boolean;
  toolMode: 'select' | 'add';
  onPageChange: (page: number) => void;
  onScaleChange: (scale: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onToolModeChange: (mode: 'select' | 'add') => void;
  onSave: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentPage,
  totalPages,
  scale,
  canUndo,
  canRedo,
  toolMode,
  onPageChange,
  onScaleChange,
  onUndo,
  onRedo,
  onToolModeChange,
  onSave
}) => {
  const scaleOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const handlePageInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const pageNumber = parseInt(event.target.value);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    }
  };

  const handleScaleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newScale = parseFloat(event.target.value);
    onScaleChange(newScale);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Left side - Tool modes */}
      <div className="flex items-center space-x-4">
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <button
            onClick={() => onToolModeChange('add')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-all duration-200 ${
              toolMode === 'add'
                ? 'bg-ocean-500 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            ✏️ Add Text
          </button>
          <button
            onClick={() => onToolModeChange('select')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-all duration-200 ${
              toolMode === 'select'
                ? 'bg-ocean-500 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            👆 Select
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex space-x-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
            title="Undo (Ctrl+Z)"
          >
            ↶
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
            title="Redo (Ctrl+Y)"
          >
            ↷
          </button>
        </div>
      </div>

      {/* Center - Page navigation */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
        >
          ◀️
        </button>

        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Page</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={handlePageInputChange}
            className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">of {totalPages}</span>
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
        >
          ▶️
        </button>
      </div>

      {/* Right side - Zoom and actions */}
      <div className="flex items-center space-x-4">
        {/* Zoom controls */}
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2">
          <button
            onClick={() => onScaleChange(Math.max(0.25, scale - 0.25))}
            className="p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-200"
            title="Zoom out (-)"
          >
            🔍-
          </button>

          <select
            value={scale}
            onChange={handleScaleChange}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
          >
            {scaleOptions.map(option => (
              <option key={option} value={option}>
                {Math.round(option * 100)}%
              </option>
            ))}
            <option value={scale}>{Math.round(scale * 100)}%</option>
          </select>

          <button
            onClick={() => onScaleChange(Math.min(5, scale + 0.25))}
            className="p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-200"
            title="Zoom in (+)"
          >
            🔍+
          </button>
        </div>

        {/* Save button */}
        <button
          onClick={onSave}
          className="px-6 py-2 bg-ocean-500 hover:bg-ocean-600 text-white rounded-lg font-semibold transition-colors shadow-lg flex items-center space-x-2"
        >
          <span>💾</span>
          <span>Save PDF</span>
        </button>
      </div>
    </div>
  );
};
