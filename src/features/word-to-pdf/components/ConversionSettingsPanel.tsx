import React from 'react';
import { Settings, FileText, Download, Palette } from 'lucide-react';
import { ConversionSettings } from '../types/wordToPdf.types';
import { useI18n } from '../../../hooks/useI18n';

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
  const { t } = useI18n();
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
        className="flex items-center gap-3 w-full p-4 text-left bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl hover:bg-white/90 dark:hover:bg-gray-700/90 transition-all duration-300 shadow-lg"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg">
          <Settings className="w-4 h-4" />
        </div>
        <span className="font-black text-black dark:text-white">{t('pages.tools.wordToPdf.tool.settings.title')}</span>
        <span className="ml-auto text-sm font-bold text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-gray-600/80 px-3 py-1 rounded-full">
          {isVisible ? t('pages.tools.wordToPdf.tool.settings.hide') : t('pages.tools.wordToPdf.tool.settings.show')}
        </span>
      </button>

      {/* Settings Panel */}
      {isVisible && (
        <div className="mt-4 p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl space-y-6">

          {/* Page Setup Section */}
          <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-black text-black dark:text-white">{t('pages.tools.wordToPdf.tool.settings.pageSetup.title')}</h3>
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-black text-black dark:text-white mb-2">{t('pages.tools.wordToPdf.tool.settings.pageSetup.pageSize')}</label>
              <select
                value={settings.pageSize}
                onChange={(e) => handleSettingChange('pageSize', e.target.value as ConversionSettings['pageSize'])}
                className="w-full px-4 py-3 border border-gray-300/80 dark:border-gray-600/20 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-200 shadow-sm"
              >
                <option value="A4">{t('pages.tools.wordToPdf.tool.settings.pageSetup.pageSizeOptions.a4')}</option>
                <option value="Letter">{t('pages.tools.wordToPdf.tool.settings.pageSetup.pageSizeOptions.letter')}</option>
                <option value="A3">{t('pages.tools.wordToPdf.tool.settings.pageSetup.pageSizeOptions.a3')}</option>
              </select>
            </div>
          </div>

          {/* Margins Section */}
          <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                📐
              </div>
              <h3 className="font-black text-black dark:text-white">{t('pages.tools.wordToPdf.tool.settings.margins.title')}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 block">{t('pages.tools.wordToPdf.tool.settings.margins.top')}</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={settings.margins?.top || 20}
                  onChange={(e) => handleSettingChange('margins', {
                    ...settings.margins,
                    top: parseInt(e.target.value) || 20
                  })}
                  className="w-full px-3 py-2 text-sm border border-gray-300/80 dark:border-gray-600/20 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-200 shadow-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 block">{t('pages.tools.wordToPdf.tool.settings.margins.bottom')}</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={settings.margins?.bottom || 20}
                  onChange={(e) => handleSettingChange('margins', {
                    ...settings.margins,
                    bottom: parseInt(e.target.value) || 20
                  })}
                  className="w-full px-3 py-2 text-sm border border-gray-300/80 dark:border-gray-600/20 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-200 shadow-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 block">{t('pages.tools.wordToPdf.tool.settings.margins.left')}</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={settings.margins?.left || 20}
                  onChange={(e) => handleSettingChange('margins', {
                    ...settings.margins,
                    left: parseInt(e.target.value) || 20
                  })}
                  className="w-full px-3 py-2 text-sm border border-gray-300/80 dark:border-gray-600/20 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seaforam-500 transition-all duration-200 shadow-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 block">{t('pages.tools.wordToPdf.tool.settings.margins.right')}</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={settings.margins?.right || 20}
                  onChange={(e) => handleSettingChange('margins', {
                    ...settings.margins,
                    right: parseInt(e.target.value) || 20
                  })}
                  className="w-full px-3 py-2 text-sm border border-gray-300/80 dark:border-gray-600/20 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-200 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Typography Section */}
          <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                <Palette className="w-4 h-4" />
              </div>
              <h3 className="font-black text-black dark:text-white">{t('pages.tools.wordToPdf.tool.settings.typography.title')}</h3>
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-black text-black dark:text-white mb-2">{t('pages.tools.wordToPdf.tool.settings.typography.fontSize')}</label>
              <select
                value={settings.fontSize || 12}
                onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300/80 dark:border-gray-600/20 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-200 shadow-sm"
              >
                <option value={10}>{t('pages.tools.wordToPdf.tool.settings.typography.fontSizeOptions.small')}</option>
                <option value={11}>{t('pages.tools.wordToPdf.tool.settings.typography.fontSizeOptions.normal11')}</option>
                <option value={12}>{t('pages.tools.wordToPdf.tool.settings.typography.fontSizeOptions.normal12')}</option>
                <option value={14}>{t('pages.tools.wordToPdf.tool.settings.typography.fontSizeOptions.large')}</option>
                <option value={16}>{t('pages.tools.wordToPdf.tool.settings.typography.fontSizeOptions.extraLarge')}</option>
              </select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                ⚙️
              </div>
              <h3 className="font-black text-black dark:text-white">{t('pages.tools.wordToPdf.tool.settings.advanced.title')}</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl border border-white/20 dark:border-gray-600/20">
                <input
                  type="checkbox"
                  id="embedFonts"
                  checked={settings.embedFonts}
                  onChange={(e) => handleSettingChange('embedFonts', e.target.checked)}
                  className="w-5 h-5 text-seafoam-600 rounded-lg focus:ring-2 focus:ring-seafoam-500/50 focus:ring-offset-2"
                />
                <label htmlFor="embedFonts" className="text-sm font-medium text-black dark:text-white">
                  {t('pages.tools.wordToPdf.tool.settings.advanced.embedFonts')}
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl border border-white/20 dark:border-gray-600/20">
                <input
                  type="checkbox"
                  id="compression"
                  checked={settings.compression || false}
                  onChange={(e) => handleSettingChange('compression', e.target.checked)}
                  className="w-5 h-5 text-seafoam-600 rounded-lg focus:ring-2 focus:ring-seafoam-500/50 focus:ring-offset-2"
                />
                <label htmlFor="compression" className="text-sm font-medium text-black dark:text-white">
                  {t('pages.tools.wordToPdf.tool.settings.advanced.compression')}
                </label>
              </div>
            </div>
          </div>

          {/* Reset Settings */}
          <div className="pt-4 border-t border-white/20 dark:border-gray-600/20">
            <button
              onClick={() => onSettingsChange({
                pageSize: 'A4',
                embedFonts: true,
                margins: { top: 20, right: 20, bottom: 20, left: 20 },
                fontSize: 12,
                compression: false
              })}
              className="w-full px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-blue-300/80 dark:border-blue-600/20 rounded-lg text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 shadow-lg"
            >
              🔄 {t('pages.tools.wordToPdf.tool.settings.advanced.resetDefaults')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
