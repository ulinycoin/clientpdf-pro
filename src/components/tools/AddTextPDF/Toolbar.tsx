import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  const handleScaleChange = (value: string) => {
    const newScale = parseFloat(value);
    onScaleChange(newScale);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Left side - Tool modes */}
      <div className="flex items-center space-x-4">
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <Button
            onClick={() => onToolModeChange('add')}
            variant={toolMode === 'add' ? 'default' : 'ghost'}
            className={`rounded-l-lg rounded-r-none ${
              toolMode === 'add'
                ? 'bg-ocean-500 text-white shadow-lg hover:bg-ocean-600'
                : ''
            }`}
            size="sm"
          >
            ✏️ Add Text
          </Button>
          <Button
            onClick={() => onToolModeChange('select')}
            variant={toolMode === 'select' ? 'default' : 'ghost'}
            className={`rounded-r-lg rounded-l-none ${
              toolMode === 'select'
                ? 'bg-ocean-500 text-white shadow-lg hover:bg-ocean-600'
                : ''
            }`}
            size="sm"
          >
            👆 Select
          </Button>
        </div>

        {/* Undo/Redo */}
        <div className="flex space-x-1">
          <Button
            onClick={onUndo}
            disabled={!canUndo}
            variant="ghost"
            size="sm"
            title="Undo (Ctrl+Z)"
          >
            ↶
          </Button>
          <Button
            onClick={onRedo}
            disabled={!canRedo}
            variant="ghost"
            size="sm"
            title="Redo (Ctrl+Y)"
          >
            ↷
          </Button>
        </div>
      </div>

      {/* Center - Page navigation */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          variant="ghost"
          size="sm"
        >
          ◀️
        </Button>

        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Page</span>
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={handlePageInputChange}
            className="w-16 h-8 px-2 py-1 text-center"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">of {totalPages}</span>
        </div>

        <Button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          variant="ghost"
          size="sm"
        >
          ▶️
        </Button>
      </div>

      {/* Right side - Zoom and actions */}
      <div className="flex items-center space-x-4">
        {/* Zoom controls */}
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2">
          <Button
            onClick={() => onScaleChange(Math.max(0.25, scale - 0.25))}
            variant="ghost"
            size="sm"
            title="Zoom out (-)"
          >
            🔍-
          </Button>

          <Select value={scale.toString()} onValueChange={handleScaleChange}>
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scaleOptions.map(option => (
                <SelectItem key={option} value={option.toString()}>
                  {Math.round(option * 100)}%
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => onScaleChange(Math.min(5, scale + 0.25))}
            variant="ghost"
            size="sm"
            title="Zoom in (+)"
          >
            🔍+
          </Button>
        </div>

        {/* Save button */}
        <Button
          onClick={onSave}
          className="bg-ocean-500 hover:bg-ocean-600"
        >
          <span>💾</span>
          <span>Save PDF</span>
        </Button>
      </div>
    </div>
  );
};
