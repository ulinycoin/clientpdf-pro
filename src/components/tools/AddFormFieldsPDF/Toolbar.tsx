import React from 'react';
import type { FormField } from '@/types/formFields';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/hooks/useI18n';

interface ToolbarProps {
  currentPage: number;
  totalPages: number;
  scale: number;
  onPageChange: (page: number) => void;
  onScaleChange: (scale: number) => void;
  onSave: () => void;
  onAddField: (type: FormField['type']) => void;
  hideSave?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentPage,
  totalPages,
  scale,
  onPageChange,
  onScaleChange,
  onSave,
  onAddField,
  hideSave,
}) => {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      {/* Add field buttons */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium mr-1">{t('addFormFields.toolbar.addField')}</span>
        <Button
          onClick={() => onAddField('text')}
          variant="outline"
          size="sm"
          className="text-xs"
          title={t('addFormFields.toolbar.addText')}
        >
          📝 {t('addFormFields.types.text')}
        </Button>
        <Button
          onClick={() => onAddField('multiline')}
          variant="outline"
          size="sm"
          className="text-xs"
          title={t('addFormFields.toolbar.addMultiline')}
        >
          📄 {t('addFormFields.types.multiline')}
        </Button>
        <Button
          onClick={() => onAddField('checkbox')}
          variant="outline"
          size="sm"
          className="text-xs"
          title={t('addFormFields.toolbar.addCheckbox')}
        >
          ☑️ {t('addFormFields.types.checkbox')}
        </Button>
        <Button
          onClick={() => onAddField('radio')}
          variant="outline"
          size="sm"
          className="text-xs"
          title={t('addFormFields.toolbar.addRadio')}
        >
          🔘 {t('addFormFields.types.radio')}
        </Button>
        <Button
          onClick={() => onAddField('dropdown')}
          variant="outline"
          size="sm"
          className="text-xs"
          title={t('addFormFields.toolbar.addDropdown')}
        >
          ▼ {t('addFormFields.types.dropdown')}
        </Button>
      </div>

      <div className="flex-1" />

      {/* Page navigation */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          ←
        </Button>
        <span className="text-sm text-gray-700 dark:text-gray-300 min-w-[80px] text-center">
          {currentPage + 1} / {totalPages}
        </span>
        <Button
          onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage >= totalPages - 1}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          →
        </Button>
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => onScaleChange(Math.max(0.25, scale - 0.25))}
          disabled={scale <= 0.25}
          variant="outline"
          size="sm"
          className="text-xs"
          title={t('common.zoom')}
        >
          −
        </Button>
        <span className="text-sm text-gray-700 dark:text-gray-300 min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <Button
          onClick={() => onScaleChange(Math.min(3, scale + 0.25))}
          disabled={scale >= 3}
          variant="outline"
          size="sm"
          className="text-xs"
          title={t('common.zoom')}
        >
          +
        </Button>
      </div>

      {/* Save button */}
      {!hideSave && (
        <Button
          onClick={onSave}
          size="sm"
        >
          {t('addFormFields.toolbar.savePdf')}
        </Button>
      )}
    </div>
  );
};
