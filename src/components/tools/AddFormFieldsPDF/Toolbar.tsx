import React from 'react';
import type { FormField } from '@/types/formFields';

interface ToolbarProps {
  currentPage: number;
  totalPages: number;
  scale: number;
  onPageChange: (page: number) => void;
  onScaleChange: (scale: number) => void;
  onSave: () => void;
  onAddField: (type: FormField['type']) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentPage,
  totalPages,
  scale,
  onPageChange,
  onScaleChange,
  onSave,
  onAddField,
}) => {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      {/* Add field buttons */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium mr-1">Add Field:</span>
        <button
          onClick={() => onAddField('text')}
          className="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Add text field"
        >
          📝 Text
        </button>
        <button
          onClick={() => onAddField('multiline')}
          className="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Add multiline text field"
        >
          📄 Multiline
        </button>
        <button
          onClick={() => onAddField('checkbox')}
          className="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Add checkbox"
        >
          ☑️ Checkbox
        </button>
        <button
          onClick={() => onAddField('radio')}
          className="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Add radio button"
        >
          🔘 Radio
        </button>
        <button
          onClick={() => onAddField('dropdown')}
          className="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Add dropdown"
        >
          ▼ Dropdown
        </button>
      </div>

      <div className="flex-1" />

      {/* Page navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ←
        </button>
        <span className="text-sm text-gray-700 dark:text-gray-300 min-w-[80px] text-center">
          {currentPage + 1} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage >= totalPages - 1}
          className="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          →
        </button>
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onScaleChange(Math.max(0.25, scale - 0.25))}
          disabled={scale <= 0.25}
          className="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Zoom out"
        >
          −
        </button>
        <span className="text-sm text-gray-700 dark:text-gray-300 min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => onScaleChange(Math.min(3, scale + 0.25))}
          disabled={scale >= 3}
          className="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Zoom in"
        >
          +
        </button>
      </div>

      {/* Save button */}
      <button
        onClick={onSave}
        className="px-6 py-2 bg-ocean-500 hover:bg-ocean-600 text-white text-sm font-medium rounded transition-colors"
      >
        Save PDF
      </button>
    </div>
  );
};
