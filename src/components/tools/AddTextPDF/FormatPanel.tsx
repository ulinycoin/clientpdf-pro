import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { TextElement } from '@/types/addText';

interface FormatPanelProps {
  selectedElement: TextElement | null;
  onElementUpdate: (id: string, updates: Partial<TextElement>) => void;
}

export const FormatPanel: React.FC<FormatPanelProps> = ({
  selectedElement,
  onElementUpdate
}) => {

  const fontFamilies = [
    'Open Sans',
    'Roboto',
    'PT Sans',
    'Noto Sans',
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Courier New',
    'Impact',
    'Comic Sans MS'
  ];

  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#808080',
    '#800000', '#008000', '#000080', '#808000',
    '#800080', '#008080', '#C0C0C0', '#FFFFFF'
  ];

  const handleTextChange = (text: string) => {
    if (selectedElement) {
      onElementUpdate(selectedElement.id, { text });
    }
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    if (selectedElement) {
      onElementUpdate(selectedElement.id, { fontFamily });
    }
  };

  const handleFontSizeChange = (value: string | number) => {
    if (selectedElement) {
      const fontSize = typeof value === 'string' ? parseInt(value) : value;
      onElementUpdate(selectedElement.id, { fontSize });
    }
  };

  const handleColorChange = (color: string) => {
    if (selectedElement) {
      onElementUpdate(selectedElement.id, { color });
    }
  };

  const handlePositionChange = (x?: number, y?: number) => {
    if (selectedElement) {
      const updates: Partial<TextElement> = {};
      if (x !== undefined) updates.x = Math.max(0, x);
      if (y !== undefined) updates.y = Math.max(0, y);
      onElementUpdate(selectedElement.id, updates);
    }
  };

  if (!selectedElement) {
    return (
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 h-full flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Format Panel
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg mx-auto mb-4">
            🎨
          </div>
          <p className="text-gray-600 dark:text-gray-400">Select a text element to edit its format</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 space-y-6 h-full flex flex-col overflow-y-auto">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
        Format Panel
      </h3>

      {/* Text Content */}
      <div>
        <Label>Text Content</Label>
        <Textarea
          value={selectedElement.text}
          onChange={(e) => handleTextChange(e.target.value)}
          rows={3}
          placeholder="Enter text..."
          className="mt-2"
        />
      </div>

      {/* Font Family */}
      <div>
        <Label>Font Family</Label>
        <Select value={selectedElement.fontFamily} onValueChange={handleFontFamilyChange}>
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fontFamilies.map(font => (
              <SelectItem key={font} value={font}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Size */}
      <div>
        <Label>Font Size</Label>
        <div className="flex space-x-2 mt-2">
          <Select value={selectedElement.fontSize.toString()} onValueChange={handleFontSizeChange}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontSizes.map(size => (
                <SelectItem key={size} value={size.toString()}>
                  {size}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            min="6"
            max="200"
            value={selectedElement.fontSize}
            onChange={(e) => handleFontSizeChange(parseInt(e.target.value) || 12)}
            className="w-20"
          />
        </div>
      </div>

      {/* Color */}
      <div>
        <Label>Text Color</Label>
        <div className="flex flex-wrap gap-2 mb-3 mt-2">
          {colors.map(color => (
            <Button
              key={color}
              onClick={() => handleColorChange(color)}
              variant="outline"
              size="sm"
              className={`w-8 h-8 p-0 transition-all duration-200 hover:scale-110 shadow-lg ${
                selectedElement.color === color
                  ? 'border-ocean-500 ring-2 ring-ocean-500'
                  : 'hover:border-ocean-400'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <input
          type="color"
          value={selectedElement.color}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
        />
      </div>

      {/* Position */}
      <div>
        <Label>Position</Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div>
            <Label className="text-xs">X</Label>
            <Input
              type="number"
              min="0"
              value={Math.round(selectedElement.x)}
              onChange={(e) => handlePositionChange(parseInt(e.target.value) || 0, undefined)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Y</Label>
            <Input
              type="number"
              min="0"
              value={Math.round(selectedElement.y)}
              onChange={(e) => handlePositionChange(undefined, parseInt(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <Label>Preview</Label>
        <div
          className="mt-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 min-h-12"
          style={{
            fontFamily: selectedElement.fontFamily,
            fontSize: `${Math.min(selectedElement.fontSize, 16)}px`,
            color: selectedElement.color,
            lineHeight: '1.2',
            whiteSpace: 'pre-wrap'
          }}
        >
          {selectedElement.text || 'Sample text'}
        </div>
      </div>

      {/* Element Info */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>ID: {selectedElement.id.slice(0, 8)}...</div>
          <div>Page: {selectedElement.pageNumber}</div>
          <div>Lines: {selectedElement.text.split('\n').length}</div>
        </div>
      </div>
    </div>
  );
};
