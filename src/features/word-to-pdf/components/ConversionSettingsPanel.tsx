import React from 'react';
import { Settings, FileText, Download, Palette } from 'lucide-react';
import { ConversionSettings } from '../types/wordToPdf.types';

interface ConversionSettingsPanelProps {
  settings: ConversionSettings;
  onSettingsChange: (settings: ConversionSettings) => void;
  isVisible: boolean;
  onToggle: () => void;
}

export const ConversionSettingsPanel: React.FC<ConversionSettingsPanelProps> = ({
  settings,
  onSettingsChange,
  isVisible,
  onToggle
}) => {
  const handleSettingChange = (key: keyof ConversionSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="mb-6">
      {/* Settings Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
      >
        <Settings className="w-4 h-4" />
        <span className="font-medium">Conversion Settings</span>
        <span className="ml-auto text-sm text-gray-500">
          {isVisible ? 'Hide' : 'Show'}
        </span>
      </button>

      {/* Settings Panel */}
      {isVisible && (
        <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">

          {/* Page Size */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4" />
              Page Size
            </label>
            <select
              value={settings.pageSize}
              onChange={(e) => handleSettingChange('pageSize', e.target.value as ConversionSettings['pageSize'])}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="A4">A4 (210 × 297 mm)</option>
              <option value="Letter">Letter (8.5 × 11 in)</option>
              <option value="A3">A3 (297 × 420 mm)</option>
            </select>
          </div>

          {/* Margins */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Margins (mm)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600">Top</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={settings.margins?.top || 20}
                  onChange={(e) => handleSettingChange('margins', {
                    ...settings.margins,
                    top: parseInt(e.target.value) || 20
                  })}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Bottom</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={settings.margins?.bottom || 20}
                  onChange={(e) => handleSettingChange('margins', {
                    ...settings.margins,
                    bottom: parseInt(e.target.value) || 20
                  })}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Left</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={settings.margins?.left || 20}
                  onChange={(e) => handleSettingChange('margins', {
                    ...settings.margins,
                    left: parseInt(e.target.value) || 20
                  })}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Right</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={settings.margins?.right || 20}
                  onChange={(e) => handleSettingChange('margins', {
                    ...settings.margins,
                    right: parseInt(e.target.value) || 20
                  })}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Palette className="w-4 h-4" />
              Font Size
            </label>
            <select
              value={settings.fontSize || 12}
              onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10pt (Small)</option>
              <option value={11}>11pt</option>
              <option value={12}>12pt (Normal)</option>
              <option value={14}>14pt (Large)</option>
              <option value={16}>16pt (Extra Large)</option>
            </select>
          </div>

          {/* Advanced Options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Advanced Options</h4>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="embedFonts"
                checked={settings.embedFonts}
                onChange={(e) => handleSettingChange('embedFonts', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="embedFonts" className="text-sm text-gray-700">
                Embed fonts for better compatibility
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="compression"
                checked={settings.compression || false}
                onChange={(e) => handleSettingChange('compression', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="compression" className="text-sm text-gray-700">
                Compress PDF (smaller file size)
              </label>
            </div>
          </div>

          {/* Reset Settings */}
          <div className="pt-3 border-t border-gray-200">
            <button
              onClick={() => onSettingsChange({
                pageSize: 'A4',
                embedFonts: true,
                margins: { top: 20, right: 20, bottom: 20, left: 20 },
                fontSize: 12,
                compression: false
              })}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
