import React from 'react';
import { useI18n } from '../../../../hooks/useI18n';
import { useEditPDFContext } from '../EditPDFTool';

const ToolsTab: React.FC = () => {
  const { t } = useI18n();
  const { state } = useEditPDFContext();

  const visiblePages = state.pages.filter(p => !p.isDeleted);
  const fileSize = state.originalFile?.size || 0;
  const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Document Info */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {t('tools.edit.tools.documentInfo')}
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              {t('tools.edit.tools.pages')}:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {visiblePages.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              {t('tools.edit.tools.fileSize')}:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {fileSizeMB} MB
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              {t('tools.edit.tools.fileName')}:
            </span>
            <span className="font-medium text-gray-900 dark:text-white truncate ml-4">
              {state.originalFile?.name}
            </span>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {t('tools.edit.tools.metadata')}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('tools.edit.tools.title')}
            </label>
            <input
              type="text"
              value={state.metadata.title || ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Document title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('tools.edit.tools.author')}
            </label>
            <input
              type="text"
              value={state.metadata.author || ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Author name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('tools.edit.tools.subject')}
            </label>
            <input
              type="text"
              value={state.metadata.subject || ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Subject"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsTab;
