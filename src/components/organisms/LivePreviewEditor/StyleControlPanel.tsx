import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings,
  Palette,
  Layout,
  Type,
  Maximize2,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';

import { CsvToPdfOptions } from '../../../services/converters/CsvToPdfConverter';
import { Card } from '../../atoms/Card';
import { Button } from '../../atoms/Button';
import { Badge } from '../../atoms/Badge';

interface StyleControlPanelProps {
  options: CsvToPdfOptions;
  onChange: (options: CsvToPdfOptions) => void;
  isProcessing?: boolean;
}

export const StyleControlPanel: React.FC<StyleControlPanelProps> = ({
  options,
  onChange,
  isProcessing = false
}) => {
  // 🔄 OPTION CHANGE HANDLER
  const handleOptionChange = useCallback(<K extends keyof CsvToPdfOptions>(
    key: K,
    value: CsvToPdfOptions[K]
  ) => {
    onChange({
      ...options,
      [key]: value
    });
  }, [options, onChange]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      
      {/* 🎛️ HEADER */}
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="flex items-center">
          <Settings className="w-5 h-5 text-blue-500 mr-2" />
          <h3 className="font-semibold text-gray-700">Style Controls</h3>
          {isProcessing && (
            <Badge variant="secondary" className="ml-2 text-xs">
              Updating...
            </Badge>
          )}
        </div>
      </div>

      {/* 📝 CONTROLS */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* 📄 PAGE SETTINGS */}
        <Card className="p-4">
          <div className="flex items-center mb-3">
            <Layout className="w-4 h-4 text-gray-600 mr-2" />
            <h4 className="font-medium text-gray-700">Page Settings</h4>
          </div>
          
          <div className="space-y-4">
            {/* Orientation */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Orientation
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleOptionChange('orientation', 'portrait')}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    options.orientation === 'portrait'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-6 h-8 bg-gray-300 mx-auto mb-1 rounded"></div>
                  <span className="text-xs">Portrait</span>
                </button>
                <button
                  onClick={() => handleOptionChange('orientation', 'landscape')}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    options.orientation === 'landscape'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-8 h-6 bg-gray-300 mx-auto mb-1 rounded"></div>
                  <span className="text-xs">Landscape</span>
                </button>
              </div>
            </div>

            {/* Page Size */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Page Size
              </label>
              <select
                value={options.pageSize}
                onChange={(e) => handleOptionChange('pageSize', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="a4">A4</option>
                <option value="a3">A3</option>
                <option value="letter">Letter</option>
                <option value="legal">Legal (Recommended)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* 🎨 TABLE STYLING */}
        <Card className="p-4">
          <div className="flex items-center mb-3">
            <Palette className="w-4 h-4 text-gray-600 mr-2" />
            <h4 className="font-medium text-gray-700">Table Styling</h4>
          </div>
          
          <div className="space-y-4">
            {/* Table Style */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Table Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'grid', label: 'Grid', desc: 'Full borders' },
                  { value: 'striped', label: 'Striped', desc: 'Alternating rows' },
                  { value: 'minimal', label: 'Minimal', desc: 'Clean lines' },
                  { value: 'plain', label: 'Plain', desc: 'No borders' }
                ].map((style) => (
                  <button
                    key={style.value}
                    onClick={() => handleOptionChange('tableStyle', style.value as any)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      options.tableStyle === style.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-sm font-medium">{style.label}</div>
                    <div className="text-xs text-gray-500">{style.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Header Style */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Header Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'bold', label: 'Bold' },
                  { value: 'colored', label: 'Colored' },
                  { value: 'simple', label: 'Simple' }
                ].map((style) => (
                  <button
                    key={style.value}
                    onClick={() => handleOptionChange('headerStyle', style.value as any)}
                    className={`p-2 border rounded-lg text-center transition-colors ${
                      options.headerStyle === style.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xs">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* 🔤 TYPOGRAPHY */}
        <Card className="p-4">
          <div className="flex items-center mb-3">
            <Type className="w-4 h-4 text-gray-600 mr-2" />
            <h4 className="font-medium text-gray-700">Typography</h4>
          </div>
          
          <div className="space-y-4">
            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Font Size: {options.fontSize}pt
              </label>
              <input
                type="range"
                min="6"
                max="16"
                value={options.fontSize}
                onChange={(e) => handleOptionChange('fontSize', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>6pt</span>
                <span>11pt</span>
                <span>16pt</span>
              </div>
            </div>
          </div>
        </Card>

        {/* 📏 LAYOUT OPTIONS */}
        <Card className="p-4">
          <div className="flex items-center mb-3">
            <Maximize2 className="w-4 h-4 text-gray-600 mr-2" />
            <h4 className="font-medium text-gray-700">Layout Options</h4>
          </div>
          
          <div className="space-y-4">
            {/* Fit to Page */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.fitToPage}
                onChange={(e) => handleOptionChange('fitToPage', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Fit table to page width
              </span>
            </label>

            {/* Row Numbers */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeRowNumbers}
                onChange={(e) => handleOptionChange('includeRowNumbers', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Include row numbers
              </span>
            </label>
          </div>
        </Card>

        {/* 📄 DOCUMENT SETTINGS */}
        <Card className="p-4">
          <div className="flex items-center mb-3">
            <AlignLeft className="w-4 h-4 text-gray-600 mr-2" />
            <h4 className="font-medium text-gray-700">Document</h4>
          </div>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Document Title (Optional)
              </label>
              <input
                type="text"
                value={options.title || ''}
                onChange={(e) => handleOptionChange('title', e.target.value || undefined)}
                placeholder="Enter document title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Margins */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Top Margin
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={options.marginTop}
                  onChange={(e) => handleOptionChange('marginTop', parseInt(e.target.value))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Bottom Margin
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={options.marginBottom}
                  onChange={(e) => handleOptionChange('marginBottom', parseInt(e.target.value))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Left Margin
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={options.marginLeft}
                  onChange={(e) => handleOptionChange('marginLeft', parseInt(e.target.value))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Right Margin
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={options.marginRight}
                  onChange={(e) => handleOptionChange('marginRight', parseInt(e.target.value))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StyleControlPanel;