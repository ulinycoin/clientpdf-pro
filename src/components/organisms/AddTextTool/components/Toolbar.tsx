import React from 'react';
import Button from '../../../atoms/Button';
import { useI18n } from '../../../../hooks/useI18n';

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
  const { t } = useI18n();
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
    <div className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-white/20 dark:border-gray-600/20">
      {/* Left side - Tool modes */}
      <div className="flex items-center space-x-4">
        <div className="flex bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl border border-white/20 dark:border-gray-600/20 shadow-lg">
          <button
            onClick={() => onToolModeChange('add')}
            className={`px-4 py-2 text-sm font-medium rounded-l-xl transition-all duration-200 ${
              toolMode === 'add'
                ? 'bg-gradient-to-br from-seafoam-500 to-ocean-500 text-white shadow-lg'
                : 'text-black dark:text-white hover:bg-seafoam-50 dark:hover:bg-seafoam-900/20'
            }`}
          >
            ✏️ {t('tools.addText.toolbar.addText')}
          </button>
          <button
            onClick={() => onToolModeChange('select')}
            className={`px-4 py-2 text-sm font-medium rounded-r-xl transition-all duration-200 ${
              toolMode === 'select'
                ? 'bg-gradient-to-br from-seafoam-500 to-ocean-500 text-white shadow-lg'
                : 'text-black dark:text-white hover:bg-seafoam-50 dark:hover:bg-seafoam-900/20'
            }`}
          >
            👆 {t('tools.addText.toolbar.select')}
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex space-x-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 text-gray-800 dark:text-gray-200 hover:text-seafoam-600 dark:hover:text-seafoam-400 hover:bg-seafoam-50 dark:hover:bg-seafoam-900/20 disabled:text-gray-600 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
            title={t('tools.addText.toolbar.undo')}
          >
            ↶
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 text-gray-800 dark:text-gray-200 hover:text-seafoam-600 dark:hover:text-seafoam-400 hover:bg-seafoam-50 dark:hover:bg-seafoam-900/20 disabled:text-gray-600 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
            title={t('tools.addText.toolbar.redo')}
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
          className="p-2 text-gray-800 dark:text-gray-200 hover:text-seafoam-600 dark:hover:text-seafoam-400 hover:bg-seafoam-50 dark:hover:bg-seafoam-900/20 disabled:text-gray-600 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
        >
          ◀️
        </button>
        
        <div className="flex items-center space-x-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-xl px-3 py-2 shadow-lg">
          <span className="text-sm font-medium text-black dark:text-white">{t('tools.addText.toolbar.page')}</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={handlePageInputChange}
            className="w-16 px-2 py-1 text-center border border-white/20 dark:border-gray-600/20 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-200"
          />
          <span className="text-sm font-medium text-black dark:text-white">{t('tools.addText.toolbar.of')} {totalPages}</span>
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="p-2 text-gray-800 dark:text-gray-200 hover:text-seafoam-600 dark:hover:text-seafoam-400 hover:bg-seafoam-50 dark:hover:bg-seafoam-900/20 disabled:text-gray-600 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
        >
          ▶️
        </button>
      </div>

      {/* Right side - Zoom and actions */}
      <div className="flex items-center space-x-4">
        {/* Zoom controls */}
        <div className="flex items-center space-x-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-xl px-3 py-2 shadow-lg">
          <button
            onClick={() => onScaleChange(Math.max(0.25, scale - 0.25))}
            className="p-1 text-gray-800 dark:text-gray-200 hover:text-seafoam-600 dark:hover:text-seafoam-400 hover:bg-seafoam-50 dark:hover:bg-seafoam-900/20 rounded-lg transition-all duration-200"
            title="Zoom out (-)"
          >
            🔍-
          </button>
          
          <select
            value={scale}
            onChange={handleScaleChange}
            className="px-2 py-1 text-sm border border-white/20 dark:border-gray-600/20 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-200"
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
            className="p-1 text-gray-800 dark:text-gray-200 hover:text-seafoam-600 dark:hover:text-seafoam-400 hover:bg-seafoam-50 dark:hover:bg-seafoam-900/20 rounded-lg transition-all duration-200"
            title="Zoom in (+)"
          >
            🔍+
          </button>
        </div>

        {/* Save button */}
        <button
          onClick={onSave}
          className="btn-privacy-modern text-sm px-6 py-2 ripple-effect btn-press flex items-center space-x-2"
        >
          <span>💾</span>
          <span>{t('tools.addText.toolbar.savePdf')}</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;