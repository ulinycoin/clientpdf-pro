import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Languages,
  Type,
  Eye,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Globe
} from 'lucide-react';

import { TextAnalysis } from '../../../services/EnhancedUnicodeFontService';
import { CsvToPdfOptions } from '../../../services/converters/CsvToPdfConverter';
import { Card } from '../../atoms/Card';
import { Button } from '../../atoms/Button';
import { Badge } from '../../atoms/Badge';

interface FontLanguageSelectorProps {
  fontAnalysis: TextAnalysis | null;
  currentOptions: CsvToPdfOptions;
  onChange: (options: CsvToPdfOptions) => void;
  isProcessing?: boolean;
}

interface FontInfo {
  name: string;
  displayName: string;
  description: string;
  supportedLanguages: string[];
  unicodeSupport: boolean;
  quality: 'excellent' | 'good' | 'basic' | 'poor';
  recommended?: boolean;
}

interface LanguageInfo {
  code: string;
  name: string;
  script: string;
  detected: boolean;
  confidence?: number;
}

export const FontLanguageSelector: React.FC<FontLanguageSelectorProps> = ({
  fontAnalysis,
  currentOptions,
  onChange,
  isProcessing = false
}) => {
  const [activeTab, setActiveTab] = useState<'auto' | 'manual' | 'preview'>('auto');
  const [selectedFont, setSelectedFont] = useState<string>(currentOptions.fontFamily || 'auto');

  // 🎯 FONT DEFINITIONS - интеграция с существующей системой
  const availableFonts: FontInfo[] = useMemo(() => [
    {
      name: 'auto',
      displayName: '🤖 Auto-Select',
      description: 'Automatically choose the best font based on detected language',
      supportedLanguages: ['all'],
      unicodeSupport: true,
      quality: 'excellent',
      recommended: true
    },
    {
      name: 'times',
      displayName: 'Times Roman',
      description: 'Excellent Unicode support, recommended for multilingual content',
      supportedLanguages: ['en', 'ru', 'lv', 'lt', 'pl', 'de', 'fr', 'es'],
      unicodeSupport: true,
      quality: 'excellent'
    },
    {
      name: 'helvetica',
      displayName: 'Helvetica',
      description: 'Universal compatibility but limited Unicode support',
      supportedLanguages: ['en', 'basic-latin'],
      unicodeSupport: false,
      quality: 'basic'
    },
    {
      name: 'courier',
      displayName: 'Courier',
      description: 'Monospace font with decent Unicode support',
      supportedLanguages: ['en', 'ru', 'lv', 'basic-unicode'],
      unicodeSupport: true,
      quality: 'good'
    },
    {
      name: 'DejaVuSans',
      displayName: 'DejaVu Sans',
      description: 'Comprehensive Unicode font with Cyrillic support',
      supportedLanguages: ['en', 'ru', 'lv', 'lt', 'pl', 'de', 'fr', 'es', 'ar', 'zh'],
      unicodeSupport: true,
      quality: 'excellent'
    }
  ], []);

  // 🌍 LANGUAGE MAPPING
  const languageMapping: Record<string, LanguageInfo> = useMemo(() => ({
    'en': { code: 'en', name: 'English', script: 'Latin', detected: false },
    'ru': { code: 'ru', name: 'Русский (Russian)', script: 'Cyrillic', detected: false },
    'lv': { code: 'lv', name: 'Latviešu (Latvian)', script: 'Latin Extended', detected: false },
    'lt': { code: 'lt', name: 'Lietuvių (Lithuanian)', script: 'Latin Extended', detected: false },
    'pl': { code: 'pl', name: 'Polski (Polish)', script: 'Latin Extended', detected: false },
    'de': { code: 'de', name: 'Deutsch (German)', script: 'Latin Extended', detected: false },
    'fr': { code: 'fr', name: 'Français (French)', script: 'Latin Extended', detected: false },
    'es': { code: 'es', name: 'Español (Spanish)', script: 'Latin Extended', detected: false },
    'et': { code: 'et', name: 'Eesti (Estonian)', script: 'Latin Extended', detected: false },
    'zh': { code: 'zh', name: '中文 (Chinese)', script: 'CJK', detected: false },
    'ar': { code: 'ar', name: 'العربية (Arabic)', script: 'Arabic', detected: false }
  }), []);

  // 🔍 DETECTED LANGUAGES with confidence
  const detectedLanguages: LanguageInfo[] = useMemo(() => {
    if (!fontAnalysis || !fontAnalysis.detectedLanguages) {
      return [{ ...languageMapping['en'], detected: true, confidence: 1.0 }];
    }

    return fontAnalysis.detectedLanguages.map((langCode, index) => ({
      ...languageMapping[langCode] || { 
        code: langCode, 
        name: langCode.toUpperCase(), 
        script: 'Unknown', 
        detected: false 
      },
      detected: true,
      confidence: Math.max(0.5, 1.0 - (index * 0.2)) // Снижаем confidence для дополнительных языков
    }));
  }, [fontAnalysis, languageMapping]);

  // 🎯 RECOMMENDED FONT based on analysis
  const recommendedFont = useMemo(() => {
    if (!fontAnalysis) return availableFonts[0]; // auto

    // Если кириллица - рекомендуем Times или DejaVu
    if (fontAnalysis.hasCyrillic) {
      return availableFonts.find(f => f.name === 'times') || availableFonts.find(f => f.name === 'DejaVuSans');
    }

    // Если расширенная латиница - Times
    if (fontAnalysis.hasLatinExtended) {
      return availableFonts.find(f => f.name === 'times');
    }

    // По умолчанию авто
    return availableFonts[0];
  }, [fontAnalysis, availableFonts]);

  // 🎨 FONT QUALITY INDICATOR
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'basic': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 🔄 FONT CHANGE HANDLER
  const handleFontChange = useCallback((fontName: string) => {
    setSelectedFont(fontName);
    onChange({
      ...currentOptions,
      fontFamily: fontName as any
    });
  }, [currentOptions, onChange]);

  // 🎯 COMPATIBILITY CHECK
  const checkFontCompatibility = useCallback((font: FontInfo): {
    compatible: boolean;
    warnings: string[];
    score: number;
  } => {
    const warnings: string[] = [];
    let score = 100;

    if (!fontAnalysis) {
      return { compatible: true, warnings: [], score: 100 };
    }

    // Проверка кириллицы
    if (fontAnalysis.hasCyrillic && !font.supportedLanguages.includes('ru') && font.name !== 'auto') {
      warnings.push('Cyrillic characters may not display correctly');
      score -= 30;
    }

    // Проверка расширенной латиницы
    if (fontAnalysis.hasLatinExtended && !font.unicodeSupport && font.name !== 'auto') {
      warnings.push('Extended Latin characters will be transliterated');
      score -= 20;
    }

    // Проверка специальных символов
    if (fontAnalysis.hasSpecialChars && font.quality === 'poor') {
      warnings.push('Special characters may not render properly');
      score -= 15;
    }

    // Проверка транслитерации
    if (fontAnalysis.needsTransliteration && font.name !== 'auto' && font.quality !== 'excellent') {
      warnings.push(`${fontAnalysis.problemChars.length} characters will be transliterated`);
      score -= 10;
    }

    return {
      compatible: warnings.length === 0,
      warnings,
      score: Math.max(0, score)
    };
  }, [fontAnalysis]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      
      {/* 🎛️ TAB NAVIGATION */}
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('auto')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'auto'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Zap className="w-4 h-4 mr-2 inline" />
            Auto-Detection
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'manual'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Type className="w-4 h-4 mr-2 inline" />
            Font Selection
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Eye className="w-4 h-4 mr-2 inline" />
            Preview
          </button>
        </div>
      </div>

      {/* 📝 TAB CONTENT */}
      <div className="flex-1 overflow-y-auto p-4">
        
        {/* 🤖 AUTO-DETECTION TAB */}
        {activeTab === 'auto' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* 📊 LANGUAGE ANALYSIS */}
            <Card className="p-4">
              <div className="flex items-center mb-3">
                <Languages className="w-5 h-5 text-blue-500 mr-2" />
                <h3 className="font-semibold text-gray-700">Detected Languages</h3>
              </div>
              
              {detectedLanguages.length > 0 ? (
                <div className="space-y-2">
                  {detectedLanguages.map((lang) => (
                    <div key={lang.code} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="font-medium">{lang.name}</span>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {lang.script}
                        </Badge>
                      </div>
                      {lang.confidence && (
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${lang.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round(lang.confidence * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Languages className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No language data available</p>
                </div>
              )}
            </Card>

            {/* 🎯 RECOMMENDATION */}
            {recommendedFont && (
              <Card className="p-4 border-green-200 bg-green-50">
                <div className="flex items-center mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="font-semibold text-green-800">Recommended Font</h3>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-700">{recommendedFont.displayName}</h4>
                    <p className="text-sm text-gray-600">{recommendedFont.description}</p>
                  </div>
                  <Button
                    onClick={() => handleFontChange(recommendedFont.name)}
                    size="sm"
                    disabled={selectedFont === recommendedFont.name}
                    className={selectedFont === recommendedFont.name ? 'opacity-50' : ''}
                  >
                    {selectedFont === recommendedFont.name ? 'Selected' : 'Use This Font'}
                  </Button>
                </div>
              </Card>
            )}

            {/* ⚠️ ANALYSIS DETAILS */}
            {fontAnalysis && (
              <Card className="p-4">
                <div className="flex items-center mb-3">
                  <Info className="w-5 h-5 text-blue-500 mr-2" />
                  <h3 className="font-semibold text-gray-700">Text Analysis</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Cyrillic Characters:</span>
                    <Badge variant={fontAnalysis.hasCyrillic ? 'primary' : 'secondary'}>
                      {fontAnalysis.hasCyrillic ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Extended Latin:</span>
                    <Badge variant={fontAnalysis.hasLatinExtended ? 'primary' : 'secondary'}>
                      {fontAnalysis.hasLatinExtended ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Special Characters:</span>
                    <Badge variant={fontAnalysis.hasSpecialChars ? 'primary' : 'secondary'}>
                      {fontAnalysis.hasSpecialChars ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Needs Transliteration:</span>
                    <Badge variant={fontAnalysis.needsTransliteration ? 'warning' : 'success'}>
                      {fontAnalysis.needsTransliteration ? `${fontAnalysis.problemChars.length} chars` : 'No'}
                    </Badge>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {/* 🎨 MANUAL FONT SELECTION TAB */}
        {activeTab === 'manual' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {availableFonts.map((font) => {
              const compatibility = checkFontCompatibility(font);
              const isSelected = selectedFont === font.name;
              
              return (
                <Card 
                  key={font.name}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  } ${font.recommended ? 'border-green-200' : ''}`}
                  onClick={() => handleFontChange(font.name)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h4 className="font-medium text-gray-700">{font.displayName}</h4>
                        {font.recommended && (
                          <Badge variant="success" className="ml-2 text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                        <Badge 
                          variant="secondary" 
                          className={`ml-2 text-xs ${getQualityColor(font.quality)}`}
                        >
                          {font.quality}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{font.description}</p>
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>Supports:</span>
                        {font.supportedLanguages.slice(0, 4).map((lang) => (
                          <Badge key={lang} variant="secondary" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                        {font.supportedLanguages.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{font.supportedLanguages.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center ml-4">
                      {/* 📊 COMPATIBILITY SCORE */}
                      <div className="text-center mr-3">
                        <div className={`text-lg font-bold ${
                          compatibility.score >= 80 ? 'text-green-600' :
                          compatibility.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {compatibility.score}
                        </div>
                        <div className="text-xs text-gray-500">score</div>
                      </div>

                      {/* ✅ SELECTION INDICATOR */}
                      {isSelected && (
                        <CheckCircle className="w-6 h-6 text-blue-500" />
                      )}
                    </div>
                  </div>

                  {/* ⚠️ WARNINGS */}
                  {compatibility.warnings.length > 0 && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="flex items-start">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-yellow-800">
                          <ul className="space-y-1">
                            {compatibility.warnings.map((warning, index) => (
                              <li key={index}>• {warning}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </motion.div>
        )}

        {/* 👁️ PREVIEW TAB */}
        {activeTab === 'preview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="p-4">
              <div className="flex items-center mb-3">
                <Eye className="w-5 h-5 text-blue-500 mr-2" />
                <h3 className="font-semibold text-gray-700">Font Preview</h3>
              </div>
              
              {/* 🎨 SAMPLE TEXT PREVIEW */}
              <div className="space-y-4">
                <div className="p-4 bg-white border rounded-lg">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">English Sample</h4>
                  <div className="font-mono text-lg" style={{ fontFamily: selectedFont === 'auto' ? 'inherit' : selectedFont }}>
                    The quick brown fox jumps over the lazy dog
                  </div>
                </div>

                {detectedLanguages.some(lang => lang.code === 'ru') && (
                  <div className="p-4 bg-white border rounded-lg">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Russian Sample</h4>
                    <div className="font-mono text-lg" style={{ fontFamily: selectedFont === 'auto' ? 'inherit' : selectedFont }}>
                      Съешь же ещё этих мягких французских булок
                    </div>
                  </div>
                )}

                {detectedLanguages.some(lang => lang.code === 'lv') && (
                  <div className="p-4 bg-white border rounded-lg">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Latvian Sample</h4>
                    <div className="font-mono text-lg" style={{ fontFamily: selectedFont === 'auto' ? 'inherit' : selectedFont }}>
                      Čūčet būtu īgu žākli pār ņērdu
                    </div>
                  </div>
                )}

                {fontAnalysis?.problemChars && fontAnalysis.problemChars.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-sm font-medium text-red-700 mb-2">Problematic Characters</h4>
                    <div className="text-lg space-x-2">
                      {fontAnalysis.problemChars.slice(0, 20).map((char, index) => (
                        <span key={index} className="inline-block p-1 bg-red-100 rounded text-red-800">
                          {char}
                        </span>
                      ))}
                      {fontAnalysis.problemChars.length > 20 && (
                        <span className="text-red-600">... +{fontAnalysis.problemChars.length - 20} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* 📊 CURRENT SELECTION INFO */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-800">Current Selection</h4>
                  <p className="text-blue-600">
                    {availableFonts.find(f => f.name === selectedFont)?.displayName || selectedFont}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    // Trigger a preview refresh
                    onChange({ ...currentOptions });
                  }}
                  size="sm"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Updating...' : 'Refresh Preview'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FontLanguageSelector;