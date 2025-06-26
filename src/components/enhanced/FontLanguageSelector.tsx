/**
 * FontLanguageSelector.tsx
 * Компонент для выбора языка и управления шрифтами в LivePreviewEditor
 * Интегрируется с EnhancedUnicodeFontService для optimal font selection
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Type, 
  Check, 
  AlertTriangle, 
  ChevronDown,
  Sparkles,
  Info
} from 'lucide-react';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { EnhancedUnicodeFontService } from '../../services/EnhancedUnicodeFontService';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  script: 'latin' | 'cyrillic' | 'arabic' | 'cjk' | 'devanagari';
  fontRecommendations: string[];
}

export interface FontPreviewData {
  sampleText: string;
  detectedLanguages: string[];
  recommendedFont: string;
  hasSpecialChars: boolean;
  needsTransliteration: boolean;
  warnings: string[];
}

interface FontLanguageSelectorProps {
  csvData: Record<string, any>[];
  headers: string[];
  onLanguageChange: (language: string) => void;
  onFontChange: (font: string) => void;
  selectedLanguage?: string;
  selectedFont?: string;
  className?: string;
}

// 🌍 Supported languages with their characteristics
const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'auto',
    name: 'Auto-detect',
    nativeName: 'Автоопределение',
    script: 'latin',
    fontRecommendations: ['times', 'helvetica']
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    script: 'latin',
    fontRecommendations: ['helvetica', 'times', 'courier']
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    script: 'cyrillic',
    fontRecommendations: ['times', 'DejaVu', 'courier']
  },
  {
    code: 'lv',
    name: 'Latvian',
    nativeName: 'Latviešu',
    script: 'latin',
    fontRecommendations: ['times', 'helvetica']
  },
  {
    code: 'lt',
    name: 'Lithuanian',
    nativeName: 'Lietuvių',
    script: 'latin',
    fontRecommendations: ['times', 'helvetica']
  },
  {
    code: 'pl',
    name: 'Polish',
    nativeName: 'Polski',
    script: 'latin',
    fontRecommendations: ['times', 'helvetica']
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    script: 'latin',
    fontRecommendations: ['helvetica', 'times']
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    script: 'latin',
    fontRecommendations: ['helvetica', 'times']
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    script: 'latin',
    fontRecommendations: ['helvetica', 'times']
  }
];

// 🔤 Available fonts with their capabilities
const AVAILABLE_FONTS = [
  {
    name: 'helvetica',
    displayName: 'Helvetica',
    description: 'Clean, modern sans-serif',
    unicodeSupport: 'basic',
    scripts: ['latin'],
    quality: 'good'
  },
  {
    name: 'times',
    displayName: 'Times Roman',
    description: 'Classic serif with extended Unicode',
    unicodeSupport: 'extended',
    scripts: ['latin', 'cyrillic'],
    quality: 'excellent'
  },
  {
    name: 'courier',
    displayName: 'Courier',
    description: 'Monospace with Unicode support',
    unicodeSupport: 'good',
    scripts: ['latin', 'cyrillic'],
    quality: 'good'
  },
  {
    name: 'DejaVu',
    displayName: 'DejaVu Sans',
    description: 'Open source with excellent Unicode',
    unicodeSupport: 'excellent',
    scripts: ['latin', 'cyrillic', 'extended'],
    quality: 'excellent'
  }
];

export const FontLanguageSelector: React.FC<FontLanguageSelectorProps> = ({
  csvData,
  headers,
  onLanguageChange,
  onFontChange,
  selectedLanguage = 'auto',
  selectedFont = 'helvetica',
  className = ''
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fontPreview, setFontPreview] = useState<FontPreviewData | null>(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);

  // 🔍 Analyze CSV content for language detection
  const analyzeContent = useCallback(async () => {
    if (!csvData || csvData.length === 0) return;

    setIsAnalyzing(true);
    
    try {
      // Собираем образец текста из CSV
      const sampleTexts = [
        ...headers,
        ...csvData.slice(0, 10).flatMap(row => 
          headers.slice(0, 5).map(header => String(row[header] || ''))
        )
      ].filter(text => text.trim() !== '').slice(0, 50);

      if (sampleTexts.length === 0) {
        setFontPreview({
          sampleText: 'No text data found',
          detectedLanguages: ['en'],
          recommendedFont: 'helvetica',
          hasSpecialChars: false,
          needsTransliteration: false,
          warnings: ['No text content to analyze']
        });
        return;
      }

      // Анализируем через EnhancedUnicodeFontService
      const combinedText = sampleTexts.join(' ');
      const analysis = EnhancedUnicodeFontService.analyzeText(combinedText);

      setFontPreview({
        sampleText: combinedText.substring(0, 100) + '...',
        detectedLanguages: analysis.detectedLanguages,
        recommendedFont: analysis.recommendedFont,
        hasSpecialChars: analysis.hasSpecialChars || analysis.hasLatinExtended,
        needsTransliteration: analysis.needsTransliteration,
        warnings: analysis.problemChars.length > 0 
          ? [`${analysis.problemChars.length} characters may need transliteration`]
          : []
      });

      // Автоматически устанавливаем рекомендуемый язык и шрифт если в auto режиме
      if (selectedLanguage === 'auto' && analysis.detectedLanguages.length > 0) {
        const primaryLanguage = analysis.detectedLanguages[0];
        onLanguageChange(primaryLanguage);
        onFontChange(analysis.recommendedFont);
      }

    } catch (error) {
      console.error('Content analysis failed:', error);
      setFontPreview({
        sampleText: 'Analysis failed',
        detectedLanguages: ['en'],
        recommendedFont: 'helvetica',
        hasSpecialChars: false,
        needsTransliteration: false,
        warnings: [`Analysis error: ${error}`]
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [csvData, headers, selectedLanguage, onLanguageChange, onFontChange]);

  // Анализируем содержимое при изменении данных
  useEffect(() => {
    analyzeContent();
  }, [analyzeContent]);

  // Получаем информацию о выбранном языке
  const selectedLanguageInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];
  const selectedFontInfo = AVAILABLE_FONTS.find(font => font.name === selectedFont) || AVAILABLE_FONTS[0];

  // Обработчик изменения языка
  const handleLanguageSelect = (languageCode: string) => {
    setShowLanguageDropdown(false);
    onLanguageChange(languageCode);
    
    // Если выбран конкретный язык, рекомендуем оптимальный шрифт
    if (languageCode !== 'auto') {
      const language = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
      if (language && language.fontRecommendations.length > 0) {
        onFontChange(language.fontRecommendations[0]);
      }
    }
  };

  // Обработчик изменения шрифта
  const handleFontSelect = (fontName: string) => {
    setShowFontDropdown(false);
    onFontChange(fontName);
  };

  // Получаем статус совместимости шрифта с языком
  const getFontCompatibility = (font: string, language: string): {
    status: 'excellent' | 'good' | 'warning' | 'error';
    message: string;
  } => {
    const fontInfo = AVAILABLE_FONTS.find(f => f.name === font);
    const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === language);
    
    if (!fontInfo || !langInfo) {
      return { status: 'error', message: 'Unknown font or language' };
    }

    // Проверяем поддержку скриптов
    if (langInfo.script === 'cyrillic' && !fontInfo.scripts.includes('cyrillic')) {
      return { 
        status: 'warning', 
        message: 'Font has limited Cyrillic support - characters will be transliterated' 
      };
    }

    if (fontInfo.scripts.includes(langInfo.script)) {
      return { 
        status: 'excellent', 
        message: `Perfect compatibility for ${langInfo.name}` 
      };
    }

    return { 
      status: 'good', 
      message: 'Good compatibility with fallback support' 
    };
  };

  const compatibility = getFontCompatibility(selectedFont, selectedLanguage);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Language Selection */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">Language & Script</h3>
            {isAnalyzing && (
              <div className="flex items-center space-x-1 text-blue-600">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Analyzing...</span>
              </div>
            )}
          </div>
          
          {fontPreview && fontPreview.detectedLanguages.length > 1 && (
            <div className="flex items-center space-x-1 text-amber-600">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs">Multi-language detected</span>
            </div>
          )}
        </div>

        {/* Language Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-blue-600 uppercase">
                  {selectedLanguageInfo.code === 'auto' ? 'AI' : selectedLanguageInfo.code}
                </span>
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">{selectedLanguageInfo.name}</div>
                <div className="text-sm text-gray-500">{selectedLanguageInfo.nativeName}</div>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showLanguageDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
            >
              {SUPPORTED_LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code)}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-b-0"
                >
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-600 uppercase">
                      {language.code === 'auto' ? 'AI' : language.code}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{language.name}</div>
                    <div className="text-sm text-gray-500">{language.nativeName}</div>
                  </div>
                  {selectedLanguage === language.code && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Auto-detection results */}
        {fontPreview && selectedLanguage === 'auto' && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Auto-detection Results</span>
            </div>
            <div className="text-sm text-blue-700">
              Detected: {fontPreview.detectedLanguages.map(lang => {
                const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === lang);
                return langInfo ? langInfo.name : lang;
              }).join(', ')}
            </div>
            {fontPreview.hasSpecialChars && (
              <div className="text-xs text-blue-600 mt-1">
                Special characters found - optimal font will be selected
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Font Selection */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Type className="w-5 h-5 text-purple-600" />
            <h3 className="font-medium text-gray-900">Font Selection</h3>
          </div>
          
          {/* Compatibility indicator */}
          <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
            compatibility.status === 'excellent' ? 'bg-green-100 text-green-700' :
            compatibility.status === 'good' ? 'bg-blue-100 text-blue-700' :
            compatibility.status === 'warning' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            {compatibility.status === 'excellent' && <Check className="w-3 h-3" />}
            {compatibility.status === 'warning' && <AlertTriangle className="w-3 h-3" />}
            <span>{compatibility.status}</span>
          </div>
        </div>

        {/* Font Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowFontDropdown(!showFontDropdown)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Type className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">{selectedFontInfo.displayName}</div>
                <div className="text-sm text-gray-500">{selectedFontInfo.description}</div>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showFontDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showFontDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
            >
              {AVAILABLE_FONTS.map((font) => {
                const fontCompat = getFontCompatibility(font.name, selectedLanguage);
                return (
                  <button
                    key={font.name}
                    onClick={() => handleFontSelect(font.name)}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-b-0"
                  >
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <Type className="w-3 h-3 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{font.displayName}</div>
                      <div className="text-sm text-gray-500">{font.description}</div>
                      <div className="text-xs text-gray-400">
                        Unicode: {font.unicodeSupport} • Scripts: {font.scripts.join(', ')}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedFont === font.name && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                      <div className={`w-2 h-2 rounded-full ${
                        fontCompat.status === 'excellent' ? 'bg-green-500' :
                        fontCompat.status === 'good' ? 'bg-blue-500' :
                        fontCompat.status === 'warning' ? 'bg-amber-500' :
                        'bg-red-500'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Compatibility message */}
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">{compatibility.message}</span>
          </div>
        </div>
      </Card>

      {/* Warnings and Recommendations */}
      {fontPreview && (fontPreview.warnings.length > 0 || fontPreview.needsTransliteration) && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="font-medium text-amber-800">Recommendations</span>
          </div>
          
          {fontPreview.needsTransliteration && (
            <div className="text-sm text-amber-700 mb-2">
              Some characters will be automatically transliterated for better compatibility
            </div>
          )}
          
          {fontPreview.warnings.map((warning, index) => (
            <div key={index} className="text-sm text-amber-700">
              • {warning}
            </div>
          ))}
          
          <div className="mt-2 text-xs text-amber-600">
            For best results with special characters, consider using Times Roman or DejaVu fonts
          </div>
        </Card>
      )}
    </div>
  );
};

export default FontLanguageSelector;