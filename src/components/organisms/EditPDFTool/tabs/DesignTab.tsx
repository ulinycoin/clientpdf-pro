import React from 'react';
import { useI18n } from '../../../../hooks/useI18n';
import { useEditPDFContext } from '../EditPDFTool';
import DesignPreview from '../components/DesignPreview';

const DesignTab: React.FC = () => {
  const { t } = useI18n();
  const { state, updateWatermark, updatePageNumbers } = useEditPDFContext();

  // Get selected page indices
  const selectedPages = state.pages
    .map((page, index) => ({ page, index }))
    .filter(({ page }) => page.isSelected && !page.isDeleted)
    .map(({ index }) => index);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left column - Controls */}
      <div className="space-y-6">
        {/* Watermark Section */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('tools.edit.design.watermark.title')}
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={state.watermark.enabled}
              onChange={(e) => updateWatermark({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ocean-300 dark:peer-focus:ring-ocean-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-ocean-600"></div>
          </label>
        </div>

        {state.watermark.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('tools.edit.design.watermark.text')}
              </label>
              <input
                type="text"
                value={state.watermark.text}
                onChange={(e) => updateWatermark({ text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="CONFIDENTIAL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('tools.edit.design.watermark.opacity')} ({state.watermark.opacity}%)
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={state.watermark.opacity}
                onChange={(e) => updateWatermark({ opacity: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('tools.edit.design.watermark.angle')} ({state.watermark.angle}°)
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={state.watermark.angle}
                onChange={(e) => updateWatermark({ angle: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('tools.edit.design.watermark.color')}
                </label>
                <input
                  type="color"
                  value={state.watermark.color}
                  onChange={(e) => updateWatermark({ color: e.target.value })}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Font Size ({state.watermark.fontSize}px)
                </label>
                <input
                  type="number"
                  min="12"
                  max="120"
                  value={state.watermark.fontSize}
                  onChange={(e) => updateWatermark({ fontSize: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Page Numbers Section */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('tools.edit.design.pageNumbers.title')}
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={state.pageNumbers.enabled}
              onChange={(e) => updatePageNumbers({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ocean-300 dark:peer-focus:ring-ocean-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-ocean-600"></div>
          </label>
        </div>

        {state.pageNumbers.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('tools.edit.design.pageNumbers.format')}
              </label>
              <select
                value={state.pageNumbers.format}
                onChange={(e) => updatePageNumbers({ format: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="{n}">1, 2, 3...</option>
                <option value="Page {n}">Page 1, Page 2...</option>
                <option value="Page {n} of {total}">Page 1 of 10</option>
                <option value="{n}/{total}">1/10</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('tools.edit.design.pageNumbers.position')}
              </label>
              <select
                value={state.pageNumbers.position}
                onChange={(e) => updatePageNumbers({ position: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="top-left">Top Left</option>
                <option value="top-center">Top Center</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('tools.edit.design.watermark.color')}
                </label>
                <input
                  type="color"
                  value={state.pageNumbers.color}
                  onChange={(e) => updatePageNumbers({ color: e.target.value })}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Font Size ({state.pageNumbers.fontSize}px)
                </label>
                <input
                  type="number"
                  min="8"
                  max="24"
                  value={state.pageNumbers.fontSize}
                  onChange={(e) => updatePageNumbers({ fontSize: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            ℹ️ {t('tools.edit.design.preview.info')}
          </p>
        </div>
      </div>

      {/* Right column - Preview */}
      <div className="lg:sticky lg:top-4 lg:self-start">
        {state.originalFile ? (
          <DesignPreview
            pdfFile={state.originalFile}
            watermark={state.watermark}
            pageNumbers={state.pageNumbers}
            selectedPages={selectedPages}
            totalPages={state.pages.length}
            pages={state.pages}
          />
        ) : (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {t('tools.edit.design.preview.noDocument')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignTab;
