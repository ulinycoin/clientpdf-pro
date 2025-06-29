import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, Download, Settings, Globe, FileText, 
  Sparkles, Check, Loader, Palette, Type
} from 'lucide-react';

interface Props {
  parseResult: {
    data: string[][];
    headers: string[];
    rowCount: number;
    columnCount: number;
    reportTitle?: string;
  };
  onExport: (blob: Blob) => void;
  className?: string;
}

interface ElegantOptions {
  pageSize: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
  fontSize: 9 | 10 | 11 | 12;
  theme: 'clean' | 'modern' | 'minimal';
}

interface LanguageInfo {
  detected: string;
  confidence: number;
  font: string;
  emoji: string;
}

// 🌍 Умная детекция языка
const detectLanguage = (data: string[][]): LanguageInfo => {
  const allText = data.flat().join(' ');
  
  const patterns = {
    cyrillic: { regex: /[\u0400-\u04FF]/, name: 'Русский/Latvian', font: 'Roboto', emoji: '🇷🇺' },
    chinese: { regex: /[\u4E00-\u9FFF]/, name: '中文', font: 'Noto Sans CJK', emoji: '🇨🇳' },
    arabic: { regex: /[\u0600-\u06FF]/, name: 'العربية', font: 'Noto Sans Arabic', emoji: '🇸🇦' },
    latin: { regex: /[a-zA-Z]/, name: 'English/Deutsch', font: 'Inter', emoji: '🌍' }
  };
  
  for (const [key, pattern] of Object.entries(patterns)) {
    const matches = allText.match(pattern.regex);
    if (matches) {
      return {
        detected: pattern.name,
        confidence: Math.min(0.95, matches.length / allText.length * 10),
        font: pattern.font,
        emoji: pattern.emoji
      };
    }
  }
  
  return { detected: 'Auto', confidence: 0.5, font: 'Inter', emoji: '📄' };
};

// 🎨 Темы оформления
const themes = {
  clean: { 
    name: 'Clean', 
    colors: { header: '#f8fafc', border: '#e2e8f0', text: '#1e293b' },
    emoji: '✨'
  },
  modern: { 
    name: 'Modern', 
    colors: { header: '#1e293b', border: '#3b82f6', text: '#ffffff' },
    emoji: '🚀'
  },
  minimal: { 
    name: 'Minimal', 
    colors: { header: '#ffffff', border: '#d1d5db', text: '#374151' },
    emoji: '🎯'
  }
};

const ElegantCSVConverter: React.FC<Props> = ({ parseResult, onExport, className = '' }) => {
  const [options, setOptions] = useState<ElegantOptions>({
    pageSize: 'a4',
    orientation: 'landscape',
    fontSize: 10,
    theme: 'clean'
  });
  
  const [state, setState] = useState({
    pdfUrl: null as string | null,
    isGenerating: false,
    showSettings: false,
    language: null as LanguageInfo | null
  });

  // 🔍 Автодетекция при загрузке
  useEffect(() => {
    const lang = detectLanguage(parseResult.data);
    setState(prev => ({ ...prev, language: lang }));
  }, [parseResult]);

  // 📄 Генерация PDF с автоматической оптимизацией
  const generatePDF = useCallback(async () => {
    setState(prev => ({ ...prev, isGenerating: true }));
    
    try {
      const { CsvToPdfConverter } = await import('../../services/converters/CsvToPdfConverter');
      
      // Преобразуем данные
      const formattedData = parseResult.data.map(row => {
        const obj: Record<string, any> = {};
        parseResult.headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });

      const csvData = {
        data: formattedData,
        headers: parseResult.headers,
        rowCount: parseResult.rowCount,
        columnCount: parseResult.columnCount,
        reportTitle: parseResult.reportTitle || 'CSV Report',
        delimiter: ',',
        errors: [],
        encoding: 'UTF-8' as const,
        columnTypes: parseResult.headers.reduce((acc, header) => {
          acc[header] = 'text';
          return acc;
        }, {} as Record<string, string>),
        preview: []
      };

      // 🎨 Применяем тему
      const themeColors = themes[options.theme].colors;
      
      const pdfOptions = {
        orientation: options.orientation,
        pageSize: options.pageSize,
        fontSize: options.fontSize,
        tableStyle: 'grid' as const,
        headerStyle: 'bold' as const,
        fitToPage: true,
        includeRowNumbers: false,
        title: parseResult.reportTitle || 'CSV Report',
        marginTop: 15,
        marginBottom: 15,
        marginLeft: 10,
        marginRight: 10,
        // Добавляем поддержку шрифтов
        fontFamily: state.language?.font || 'Inter',
        headerBackgroundColor: themeColors.header,
        borderColor: themeColors.border,
        textColor: themeColors.text
      };

      const pdfResult = await CsvToPdfConverter.convertToPDF(csvData, pdfOptions);
      const pdfData = Array.isArray(pdfResult) ? pdfResult[0] : pdfResult;
      const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
      
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setState(prev => ({ ...prev, pdfUrl, isGenerating: false }));

    } catch (error) {
      console.error('PDF generation failed:', error);
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  }, [parseResult, options, state.language]);

  // 💾 Экспорт
  const handleExport = useCallback(async () => {
    if (!state.pdfUrl) await generatePDF();
    
    if (state.pdfUrl) {
      const response = await fetch(state.pdfUrl);
      const blob = await response.blob();
      onExport(blob);
    }
  }, [state.pdfUrl, generatePDF, onExport]);

  // 🎮 Автогенерация при изменении настроек
  useEffect(() => {
    if (state.pdfUrl) {
      generatePDF();
    }
  }, [options]);

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl overflow-hidden ${className}`}>
      {/* 🎯 Умная шапка */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <FileText className="w-6 h-6 text-blue-600" />
              {state.language && (
                <div className="absolute -top-1 -right-1 text-xs">
                  {state.language.emoji}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center">
                {parseResult.reportTitle || 'CSV Document'}
                {state.language && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {state.language.detected}
                  </span>
                )}
              </h3>
              <p className="text-sm text-slate-600">
                {parseResult.rowCount} rows × {parseResult.columnCount} columns
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setState(prev => ({ ...prev, showSettings: !prev.showSettings }))}
              className={`p-2 rounded-lg transition-colors ${
                state.showSettings 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
            
            {!state.pdfUrl ? (
              <button
                onClick={generatePDF}
                disabled={state.isGenerating}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {state.isGenerating ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                Preview
              </button>
            ) : (
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            )}
          </div>
        </div>

        {/* ⚙️ Элегантные настройки */}
        {state.showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-slate-50 rounded-lg"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Размер страницы */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  📄 Page Size
                </label>
                <select
                  value={options.pageSize}
                  onChange={(e) => setOptions(prev => ({ ...prev, pageSize: e.target.value as any }))}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="a4">A4</option>
                  <option value="letter">Letter</option>
                </select>
              </div>
              
              {/* Ориентация */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  🔄 Orientation
                </label>
                <select
                  value={options.orientation}
                  onChange={(e) => setOptions(prev => ({ ...prev, orientation: e.target.value as any }))}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="landscape">Landscape</option>
                  <option value="portrait">Portrait</option>
                </select>
              </div>
              
              {/* Размер шрифта */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  🔤 Font Size
                </label>
                <select
                  value={options.fontSize}
                  onChange={(e) => setOptions(prev => ({ ...prev, fontSize: parseInt(e.target.value) as any }))}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="9">9pt</option>
                  <option value="10">10pt</option>
                  <option value="11">11pt</option>
                  <option value="12">12pt</option>
                </select>
              </div>
              
              {/* Тема */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  🎨 Theme
                </label>
                <select
                  value={options.theme}
                  onChange={(e) => setOptions(prev => ({ ...prev, theme: e.target.value as any }))}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(themes).map(([key, theme]) => (
                    <option key={key} value={key}>
                      {theme.emoji} {theme.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* 🎬 Главный контент */}
      <div className="p-4 h-[600px]">
        {state.pdfUrl ? (
          <div className="h-full bg-white rounded-lg shadow-inner overflow-hidden">
            <iframe
              src={state.pdfUrl}
              className="w-full h-full"
              title="PDF Preview"
            />
          </div>
        ) : state.isGenerating ? (
          <div className="h-full flex items-center justify-center bg-white rounded-lg">
            <div className="text-center">
              <Loader className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Creating your PDF...
              </h3>
              <p className="text-slate-600">
                {state.language && `Optimizing for ${state.language.detected}`}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-white rounded-lg border-2 border-dashed border-slate-300">
            <div className="text-center">
              <Eye className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-900 mb-2">
                Ready to Preview
              </h3>
              <p className="text-slate-600 mb-6">
                Click Preview to see your PDF with {state.language?.detected || 'auto-detected'} formatting
              </p>
              <button
                onClick={generatePDF}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Preview
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 📊 Статус бар */}
      <div className="bg-white/50 backdrop-blur-sm border-t border-slate-200 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Globe className="w-3 h-3 mr-1" />
              {state.language?.detected || 'Auto-detecting...'}
            </span>
            <span className="flex items-center">
              <Type className="w-3 h-3 mr-1" />
              {state.language?.font || 'Default font'}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span>{options.orientation} • {options.pageSize.toUpperCase()} • {options.fontSize}pt</span>
            <span className="flex items-center">
              <Palette className="w-3 h-3 mr-1" />
              {themes[options.theme].name}
            </span>
            {state.pdfUrl && (
              <span className="flex items-center text-green-600">
                <Check className="w-3 h-3 mr-1" />
                Ready
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElegantCSVConverter;