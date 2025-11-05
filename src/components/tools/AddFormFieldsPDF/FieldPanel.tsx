import React from 'react';
import type { FormField, DropdownFormField, RadioFormField, TextFormField, MultilineFormField } from '@/types/formFields';

interface FieldPanelProps {
  selectedField: FormField | null;
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  onFieldDelete: (fieldId: string) => void;
}

export const FieldPanel: React.FC<FieldPanelProps> = ({
  selectedField,
  onFieldUpdate,
  onFieldDelete,
}) => {
  if (!selectedField) {
    return (
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6">
        <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
          <p className="text-4xl mb-4">📝</p>
          <p className="text-sm">Select a field to edit its properties</p>
        </div>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<FormField>) => {
    onFieldUpdate(selectedField.id, updates);
  };

  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Field Properties</h3>
          <button
            onClick={() => onFieldDelete(selectedField.id)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Delete field"
          >
            🗑️
          </button>
        </div>

        {/* Field type badge */}
        <div className="inline-block px-3 py-1 bg-ocean-100 dark:bg-ocean-900 text-ocean-700 dark:text-ocean-300 rounded-full text-xs font-medium">
          {selectedField.type}
        </div>

        {/* Field Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Field Name
          </label>
          <input
            type="text"
            value={selectedField.name}
            onChange={(e) => handleUpdate({ name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
          />
        </div>

        {/* Position */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              X Position
            </label>
            <input
              type="number"
              value={Math.round(selectedField.x)}
              onChange={(e) => handleUpdate({ x: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Y Position
            </label>
            <input
              type="number"
              value={Math.round(selectedField.y)}
              onChange={(e) => handleUpdate({ y: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Size */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Width
            </label>
            <input
              type="number"
              value={Math.round(selectedField.width)}
              onChange={(e) => handleUpdate({ width: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Height
            </label>
            <input
              type="number"
              value={Math.round(selectedField.height)}
              onChange={(e) => handleUpdate({ height: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Text field specific options */}
        {(selectedField.type === 'text' || selectedField.type === 'multiline') && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Default Value
              </label>
              <input
                type="text"
                value={(selectedField as TextFormField | MultilineFormField).defaultValue || ''}
                onChange={(e) => handleUpdate({ defaultValue: e.target.value })}
                placeholder="Enter default text..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Length
              </label>
              <input
                type="number"
                value={(selectedField as TextFormField | MultilineFormField).maxLength || ''}
                onChange={(e) => handleUpdate({ maxLength: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="No limit"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Font Size
              </label>
              <input
                type="number"
                value={(selectedField as TextFormField | MultilineFormField).fontSize || 12}
                onChange={(e) => handleUpdate({ fontSize: Number(e.target.value) })}
                min="6"
                max="72"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              />
            </div>
          </>
        )}

        {/* Checkbox specific options */}
        {selectedField.type === 'checkbox' && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="checkbox-checked"
              checked={selectedField.checked || false}
              onChange={(e) => handleUpdate({ checked: e.target.checked })}
              className="w-4 h-4 text-ocean-500 border-gray-300 rounded focus:ring-ocean-500"
            />
            <label htmlFor="checkbox-checked" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Checked by default
            </label>
          </div>
        )}

        {/* Radio specific options */}
        {selectedField.type === 'radio' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Radio Group
              </label>
              <input
                type="text"
                value={(selectedField as RadioFormField).group}
                onChange={(e) => handleUpdate({ group: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Radio buttons with the same group name are mutually exclusive
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Value
              </label>
              <input
                type="text"
                value={(selectedField as RadioFormField).value}
                onChange={(e) => handleUpdate({ value: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="radio-selected"
                checked={(selectedField as RadioFormField).selected || false}
                onChange={(e) => handleUpdate({ selected: e.target.checked })}
                className="w-4 h-4 text-ocean-500 border-gray-300 rounded focus:ring-ocean-500"
              />
              <label htmlFor="radio-selected" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Selected by default
              </label>
            </div>
          </>
        )}

        {/* Dropdown specific options */}
        {selectedField.type === 'dropdown' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Options (one per line)
              </label>
              <textarea
                value={(selectedField as DropdownFormField).options.join('\n')}
                onChange={(e) => handleUpdate({ options: e.target.value.split('\n').filter(o => o.trim()) })}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="dropdown-multiselect"
                checked={(selectedField as DropdownFormField).multiSelect || false}
                onChange={(e) => handleUpdate({ multiSelect: e.target.checked })}
                className="w-4 h-4 text-ocean-500 border-gray-300 rounded focus:ring-ocean-500"
              />
              <label htmlFor="dropdown-multiselect" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Allow multiple selections
              </label>
            </div>
          </>
        )}

        {/* Common options */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="field-required"
              checked={selectedField.required || false}
              onChange={(e) => handleUpdate({ required: e.target.checked })}
              className="w-4 h-4 text-ocean-500 border-gray-300 rounded focus:ring-ocean-500"
            />
            <label htmlFor="field-required" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Required field
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="field-readonly"
              checked={selectedField.readonly || false}
              onChange={(e) => handleUpdate({ readonly: e.target.checked })}
              className="w-4 h-4 text-ocean-500 border-gray-300 rounded focus:ring-ocean-500"
            />
            <label htmlFor="field-readonly" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Read-only field
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
