import React from 'react';
import type { FormField, DropdownFormField, RadioFormField, TextFormField, MultilineFormField } from '@/types/formFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

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
          <Button
            onClick={() => onFieldDelete(selectedField.id)}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Delete field"
          >
            🗑️
          </Button>
        </div>

        {/* Field type badge */}
        <div className="inline-block px-3 py-1 bg-ocean-100 dark:bg-ocean-900 text-ocean-700 dark:text-ocean-300 rounded-full text-xs font-medium">
          {selectedField.type}
        </div>

        {/* Field Name */}
        <div>
          <Label>
            Field Name
          </Label>
          <Input
            type="text"
            value={selectedField.name}
            onChange={(e) => handleUpdate({ name: e.target.value })}
          />
        </div>

        {/* Position */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>
              X Position
            </Label>
            <Input
              type="number"
              value={Math.round(selectedField.x)}
              onChange={(e) => handleUpdate({ x: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>
              Y Position
            </Label>
            <Input
              type="number"
              value={Math.round(selectedField.y)}
              onChange={(e) => handleUpdate({ y: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Size */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>
              Width
            </Label>
            <Input
              type="number"
              value={Math.round(selectedField.width)}
              onChange={(e) => handleUpdate({ width: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>
              Height
            </Label>
            <Input
              type="number"
              value={Math.round(selectedField.height)}
              onChange={(e) => handleUpdate({ height: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Text field specific options */}
        {(selectedField.type === 'text' || selectedField.type === 'multiline') && (
          <>
            <div>
              <Label>
                Default Value
              </Label>
              <Input
                type="text"
                value={(selectedField as TextFormField | MultilineFormField).defaultValue || ''}
                onChange={(e) => handleUpdate({ defaultValue: e.target.value })}
                placeholder="Enter default text..."
              />
            </div>

            <div>
              <Label>
                Max Length
              </Label>
              <Input
                type="number"
                value={(selectedField as TextFormField | MultilineFormField).maxLength || ''}
                onChange={(e) => handleUpdate({ maxLength: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="No limit"
              />
            </div>

            <div>
              <Label>
                Font Size
              </Label>
              <Input
                type="number"
                value={(selectedField as TextFormField | MultilineFormField).fontSize || 12}
                onChange={(e) => handleUpdate({ fontSize: Number(e.target.value) })}
                min="6"
                max="72"
              />
            </div>
          </>
        )}

        {/* Checkbox specific options */}
        {selectedField.type === 'checkbox' && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="checkbox-checked"
              checked={selectedField.checked || false}
              onCheckedChange={(checked) => handleUpdate({ checked: checked as boolean })}
            />
            <Label htmlFor="checkbox-checked" className="text-sm font-normal cursor-pointer">
              Checked by default
            </Label>
          </div>
        )}

        {/* Radio specific options */}
        {selectedField.type === 'radio' && (
          <>
            <div>
              <Label>
                Radio Group
              </Label>
              <Input
                type="text"
                value={(selectedField as RadioFormField).group}
                onChange={(e) => handleUpdate({ group: e.target.value })}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Radio buttons with the same group name are mutually exclusive
              </p>
            </div>

            <div>
              <Label>
                Value
              </Label>
              <Input
                type="text"
                value={(selectedField as RadioFormField).value}
                onChange={(e) => handleUpdate({ value: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="radio-selected"
                checked={(selectedField as RadioFormField).selected || false}
                onCheckedChange={(checked) => handleUpdate({ selected: checked as boolean })}
              />
              <Label htmlFor="radio-selected" className="text-sm font-normal cursor-pointer">
                Selected by default
              </Label>
            </div>
          </>
        )}

        {/* Dropdown specific options */}
        {selectedField.type === 'dropdown' && (
          <>
            <div>
              <Label>
                Options (one per line)
              </Label>
              <textarea
                value={(selectedField as DropdownFormField).options.join('\n')}
                onChange={(e) => handleUpdate({ options: e.target.value.split('\n').filter(o => o.trim()) })}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="dropdown-multiselect"
                checked={(selectedField as DropdownFormField).multiSelect || false}
                onCheckedChange={(checked) => handleUpdate({ multiSelect: checked as boolean })}
              />
              <Label htmlFor="dropdown-multiselect" className="text-sm font-normal cursor-pointer">
                Allow multiple selections
              </Label>
            </div>
          </>
        )}

        {/* Common options */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="field-required"
              checked={selectedField.required || false}
              onCheckedChange={(checked) => handleUpdate({ required: checked as boolean })}
            />
            <Label htmlFor="field-required" className="text-sm font-normal cursor-pointer">
              Required field
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="field-readonly"
              checked={selectedField.readonly || false}
              onCheckedChange={(checked) => handleUpdate({ readonly: checked as boolean })}
            />
            <Label htmlFor="field-readonly" className="text-sm font-normal cursor-pointer">
              Read-only field
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
};
