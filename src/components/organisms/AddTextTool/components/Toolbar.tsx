import React from 'react';
import Button from '../../../atoms/Button';

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

const Toolbar: React.FC<ToolbarProps> = ({
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
    <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
      {/* Left side - Tool modes */}
      <div className="flex items-center space-x-4">
        <div className="flex bg-white rounded-lg border">
          <button
            onClick={() => onToolModeChange('add')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
              toolMode === 'add'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            ✏️ Add Text
          </button>
          <button
            onClick={() => onToolModeChange('select')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
              toolMode === 'select'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
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
            className="p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            ↶
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
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
          className="p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
        >
          ◀️
        </button>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Page</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={handlePageInputChange}
            className="w-16 px-2 py-1 text-center border rounded"
          />
          <span className="text-sm text-gray-600">of {totalPages}</span>
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
        >
          ▶️
        </button>
      </div>

      {/* Right side - Zoom and actions */}
      <div className="flex items-center space-x-4">
        {/* Zoom controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onScaleChange(Math.max(0.25, scale - 0.25))}
            className="p-1 text-gray-600 hover:text-gray-900"
            title="Zoom out (-)"
          >
            🔍-
          </button>
          
          <select
            value={scale}
            onChange={handleScaleChange}
            className="px-2 py-1 text-sm border rounded"
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
            className="p-1 text-gray-600 hover:text-gray-900"
            title="Zoom in (+)"
          >
            🔍+
          </button>
        </div>

        {/* Save button */}
        <Button
          onClick={onSave}
          variant="primary"
          size="sm"
        >
          💾 Save PDF
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;