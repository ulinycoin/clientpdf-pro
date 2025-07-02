import React from 'react';
import { TextElement } from '../types';

interface FormatPanelProps {
  selectedElement: TextElement | null;
  onElementUpdate: (id: string, updates: Partial<TextElement>) => void;
}

const FormatPanel: React.FC<FormatPanelProps> = ({
  selectedElement,
  onElementUpdate
}) => {
  const fontFamilies = [
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

  const handleFontSizeChange = (fontSize: number) => {
    if (selectedElement) {
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
      <div className="w-64 bg-white border-r p-4">
        <h3 className="text-lg font-semibold mb-4">Format Panel</h3>
        <div className="text-gray-500 text-center py-8">
          <div className="mb-2">🎨</div>
          <p>Select a text element to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r p-4 space-y-4">
      <h3 className="text-lg font-semibold mb-4">Format Panel</h3>

      {/* Text Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Text Content
        </label>
        <textarea
          value={selectedElement.text}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Enter text..."
        />
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Font Family
        </label>
        <select
          value={selectedElement.fontFamily}
          onChange={(e) => handleFontFamilyChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {fontFamilies.map(font => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Font Size
        </label>
        <div className="flex space-x-2">
          <select
            value={selectedElement.fontSize}
            onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {fontSizes.map(size => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
          <input
            type="number"
            min="6"
            max="200"
            value={selectedElement.fontSize}
            onChange={(e) => handleFontSizeChange(parseInt(e.target.value) || 12)}
            className="w-20 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Text Color
        </label>
        <div className="flex flex-wrap gap-1 mb-2">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              className={`w-6 h-6 rounded border-2 ${
                selectedElement.color === color ? 'border-gray-800' : 'border-gray-300'
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
          className="w-full h-8 border border-gray-300 rounded cursor-pointer"
        />
      </div>

      {/* Position */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Position
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">X</label>
            <input
              type="number"
              min="0"
              value={Math.round(selectedElement.x)}
              onChange={(e) => handlePositionChange(parseInt(e.target.value) || 0, undefined)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Y</label>
            <input
              type="number"
              min="0"
              value={Math.round(selectedElement.y)}
              onChange={(e) => handlePositionChange(undefined, parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preview
        </label>
        <div 
          className="p-3 border border-gray-300 rounded-md bg-gray-50 min-h-12 flex items-center"
          style={{
            fontFamily: selectedElement.fontFamily,
            fontSize: `${Math.min(selectedElement.fontSize, 16)}px`,
            color: selectedElement.color
          }}
        >
          {selectedElement.text || 'Sample text'}
        </div>
      </div>

      {/* Element Info */}
      <div className="pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <div>ID: {selectedElement.id.slice(0, 8)}...</div>
          <div>Page: {selectedElement.pageNumber}</div>
        </div>
      </div>
    </div>
  );
};

export default FormatPanel;