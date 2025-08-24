import React from 'react';

// Define TextElement locally
interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  isSelected: boolean;
  pageNumber: number;
}

interface FormatPanelProps {
  selectedElement: TextElement | null;
  onElementUpdate: (id: string, updates: Partial<TextElement>) => void;
}

const FormatPanel: React.FC<FormatPanelProps> = ({
  selectedElement,
  onElementUpdate
}) => {
  const fontFamilies = [
    'Open Sans', // Unicode-compatible, good for Cyrillic
    'Roboto', // Google font with Cyrillic support
    'PT Sans', // Specifically designed for Cyrillic
    'Noto Sans', // Universal Unicode font
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
      <div className="w-64 bg-white/95 dark:bg-gray-800/90 backdrop-blur-lg border-r border-gray-200/60 dark:border-gray-600/20 p-6 h-full flex flex-col">
        <h3 className="text-lg font-black text-black dark:text-white mb-6">Format Panel</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg mx-auto mb-4">
            🎨
          </div>
          <p className="text-gray-800 dark:text-gray-100 font-medium">Select a text element to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white/95 dark:bg-gray-800/90 backdrop-blur-lg border-r border-gray-200/60 dark:border-gray-600/20 p-6 space-y-6 h-full flex flex-col overflow-y-auto">
      <h3 className="text-lg font-black text-black dark:text-white mb-6">Format Panel</h3>

      {/* Text Content */}
      <div className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/20 rounded-xl p-4 shadow-sm">
        <label className="block text-sm font-black text-black dark:text-white mb-3">
          Text Content
        </label>
        <textarea
          value={selectedElement.text}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300/80 dark:border-gray-500/50 rounded-lg bg-white dark:bg-gray-700/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-200 shadow-lg placeholder-gray-500 dark:placeholder-gray-400"
          rows={3}
          placeholder="Enter text..."
        />
      </div>

      {/* Font Family */}
      <div className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/20 rounded-xl p-4 shadow-sm">
        <label className="block text-sm font-black text-black dark:text-white mb-3">
          Font Family
        </label>
        <select
          value={selectedElement.fontFamily}
          onChange={(e) => handleFontFamilyChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300/80 dark:border-gray-500/50 rounded-lg bg-white dark:bg-gray-700/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-200 shadow-lg"
        >
          {fontFamilies.map(font => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/20 rounded-xl p-4 shadow-sm">
        <label className="block text-sm font-black text-black dark:text-white mb-3">
          Font Size
        </label>
        <div className="flex space-x-2">
          <select
            value={selectedElement.fontSize}
            onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-300/80 dark:border-gray-500/50 rounded-lg bg-white dark:bg-gray-700/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-200 shadow-lg"
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
            className="w-20 px-2 py-2 border border-gray-300/80 dark:border-gray-500/50 rounded-lg bg-white dark:bg-gray-700/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-200 shadow-lg"
          />
        </div>
      </div>

      {/* Color */}
      <div className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/20 rounded-xl p-4 shadow-sm">
        <label className="block text-sm font-black text-black dark:text-white mb-3">
          Text Color
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 shadow-lg ${
                selectedElement.color === color 
                  ? 'border-seafoam-500 ring-2 ring-seafoam-500/50' 
                  : 'border-white/20 dark:border-gray-600/20 hover:border-seafoam-400'
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
          className="w-full h-10 border border-gray-300/80 dark:border-gray-500/50 rounded-lg cursor-pointer bg-white dark:bg-gray-700/90 backdrop-blur-lg focus:ring-2 focus:ring-seafoam-500/50 transition-all duration-200 shadow-lg"
        />
      </div>

      {/* Position */}
      <div className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/20 rounded-xl p-4 shadow-sm">
        <label className="block text-sm font-black text-black dark:text-white mb-3">
          Position
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-800 dark:text-gray-200 mb-2">X</label>
            <input
              type="number"
              min="0"
              value={Math.round(selectedElement.x)}
              onChange={(e) => handlePositionChange(parseInt(e.target.value) || 0, undefined)}
              className="w-full px-3 py-2 text-sm border border-gray-300/80 dark:border-gray-500/50 rounded-lg bg-white dark:bg-gray-700/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-200 shadow-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-800 dark:text-gray-200 mb-2">Y</label>
            <input
              type="number"
              min="0"
              value={Math.round(selectedElement.y)}
              onChange={(e) => handlePositionChange(undefined, parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-gray-300/80 dark:border-gray-500/50 rounded-lg bg-white dark:bg-gray-700/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-200 shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Preview with multiline support */}
      <div className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/20 rounded-xl p-4 shadow-sm">
        <label className="block text-sm font-black text-black dark:text-white mb-3">
          Preview
        </label>
        <div
          className="p-3 border border-gray-300/80 dark:border-gray-500/50 rounded-lg bg-gray-50 dark:bg-gray-700/90 min-h-12 backdrop-blur-lg shadow-lg"
          style={{
            fontFamily: selectedElement.fontFamily,
            fontSize: `${Math.min(selectedElement.fontSize, 16)}px`,
            color: selectedElement.color,
            lineHeight: '1.2',
            whiteSpace: 'pre-wrap' // This enables multiline display
          }}
        >
          {selectedElement.text || 'Sample text'}
        </div>
      </div>

      {/* Element Info */}
      <div className="pt-4 border-t border-gray-200/50 dark:border-gray-600/30">
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 font-medium">
          <div>ID: {selectedElement.id.slice(0, 8)}...</div>
          <div>Page: {selectedElement.pageNumber}</div>
          <div>Lines: {selectedElement.text.split('\n').length}</div>
        </div>
      </div>
    </div>
  );
};

export default FormatPanel;
