import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, Download, Settings, Globe, FileText, 
  Sparkles, Check, Loader, Palette, Type, Zap, AlertTriangle, Shield
} from 'lucide-react';
import { detectLanguage, getOptimalPDFSettings, type LanguageInfo } from '../../services/elegantLanguageDetection';
import { getOptimizedFontSettings, type SimpleFontSolution } from '../../services/reliableFontSolution';

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

// 🎨 Элегантные темы
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
    language: null as LanguageInfo | null,
    fontSolution: null as SimpleFontSolution | null,
    fontRecommendations: [] as string[]
  });

  // 🔍 Умная автодетекция языка и надежных шрифтов при загрузке
  useEffect(() => {
    const analyzeData = async () => {
      const lang = detectLanguage(parseResult.data);
      const optimalSettings = getOptimalPDFSettings(lang);
      
      // 🛡️ Получаем надежное шрифтовое решение
      const fontSettings = getOptimizedFontSettings(
        lang.language,
        lang.script,
        parseResult.data
      );
      
      setState(prev => ({ 
        ...prev, 
        language: lang,
        fontSolution: fontSettings.fontSolution,
        fontRecommendations: fontSettings.recommendations
      }));
      
      // Автоматически применяем оптимальные настройки
      setOptions(prev => ({
        ...prev,
        fontSize: optimalSettings.fontSize as any
      }));
      
      console.log('🧠 Smart analysis with reliable fonts:', {
        language: lang.displayName,
        confidence: Math.round(lang.confidence * 100) + '%',
        fontStrategy: fontSettings.fontSolution.strategy,
        primaryFont: fontSettings.fontSolution.primary,
        recommendations: fontSettings.recommendations
      });
    };

    analyzeData();
  }, [parseResult]);

  // 📄 Элегантная генерация PDF с надежными шрифтами
  const generatePDF = useCallback(async () => {
    setState(prev => ({ ...prev, isGenerating: true }));
    
    try {
      const { CsvToPdfConverter } = await import('../../services/converters/CsvToPdfConverter');
      const { applyReliableFontToPDF, hasUnicodeCharacters, sanitizeTextForPDF } = await import('../../services/reliableFontSolution');
      
      // Преобразуем и очищаем данные
      const formattedData = parseResult.data.map(row => {
        const obj: Record<string, any> = {};
        parseResult.headers.forEach((header, index) => {
          // Очищаем текст для безопасной обработки в PDF
          const cellValue = row[index] || '';
          obj[header] = sanitizeTextForPDF(cellValue);
        });
        return obj;
      });

      const csvData = {
        data: formattedData,
        headers: parseResult.headers.map(h => sanitizeTextForPDF(h)),
        rowCount: parseResult.rowCount,
        columnCount: parseResult.columnCount,
        reportTitle: sanitizeTextForPDF(parseResult.reportTitle || 'Elegant CSV Report'),
        delimiter: ',',
        errors: [],
        encoding: 'UTF-8' as const,
        columnTypes: parseResult.headers.reduce((acc, header) => {
          acc[header] = 'text';
          return acc;
        }, {} as Record<string, string>),
        preview: []
      };

      // 🎨 Применяем тему и умные настройки
      const themeColors = themes[options.theme].colors;
      const optimalSettings = state.language ? getOptimalPDFSettings(state.language) : {};
      
      let pdfOptions = {
        orientation: options.orientation,
        pageSize: options.pageSize,
        fontSize: options.fontSize,
        tableStyle: 'grid' as const,
        headerStyle: 'bold' as const,
        fitToPage: true,
        includeRowNumbers: false,
        title: sanitizeTextForPDF(parseResult.reportTitle || 'Elegant CSV Report'),
        marginTop: 15,
        marginBottom: 15,
        marginLeft: 10,
        marginRight: 10,
        // 🛡️ Базовые надежные настройки шрифтов
        fontFamily: 'Arial', // Самый надежный выбор
        headerBackgroundColor: themeColors.header,
        borderColor: themeColors.border,
        textColor: themeColors.text,
        // Оптимизация для языка
        ...optimalSettings
      };

      // 🛡️ Применяем надежное шрифтовое решение
      if (state.fontSolution) {
        const sampleText = parseResult.data.flat().join(' ');
        const hasUnicode = hasUnicodeCharacters(sampleText);
        pdfOptions = applyReliableFontToPDF(pdfOptions, state.fontSolution, hasUnicode);
      }

      console.log('🎯 Generating PDF with reliable font solution:', {
        language: state.language?.displayName,
        fontStrategy: state.fontSolution?.strategy,
        primaryFont: pdfOptions.fontFamily,
        hasUnicode: hasUnicodeCharacters(parseResult.data.flat().join(' ')),
        theme: options.theme,
        fontSize: pdfOptions.fontSize
      });

      const pdfResult = await CsvToPdfConverter.convertToPDF(csvData, pdfOptions);
      const pdfData = Array.isArray(pdfResult) ? pdfResult[0] : pdfResult;
      const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
      
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setState(prev => ({ ...prev, pdfUrl, isGenerating: false }));

      console.log('✨ Reliable PDF generated successfully:', {
        size: `${(pdfBlob.size / 1024).toFixed(1)}KB`,
        optimizedFor: state.language?.displayName,
        fontStrategy: state.fontSolution?.strategy
      });

    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  }, [parseResult, options, state.language, state.fontSolution]);

  // 💾 Элегантный экспорт
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
      const timeoutId = setTimeout(generatePDF, 300); // Debounce
      return () => clearTimeout(timeoutId);
    }
  }, [options]);

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl overflow-hidden shadow-lg ${className}`}>
      {/* 🎯 Умная шапка с языковой и шрифтовой информацией */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200 p-4">
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
                {parseResult.reportTitle || 'Elegant CSV Document'}
                {state.language && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ml-3 flex items-center text-xs bg-gradient-to-r from-blue-100 to-green-100 text-blue-700 px-3 py-1 rounded-full"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    {state.language.displayName}
                    <span className="ml-1 text-green-600 font-medium">
                      {Math.round(state.language.confidence * 100)}%
                    </span>
                  </motion.span>
                )}
              </h3>
              <p className="text-sm text-slate-600 flex items-center">
                {parseResult.rowCount} rows × {parseResult.columnCount} columns
                {state.fontSolution && (
                  <span className="ml-3 flex items-center text-xs text-green-600">
                    <Shield className="w-3 h-3 mr-1" />
                    {state.fontSolution.primary}
                    <span className="ml-1 text-xs text-slate-500">
                      (reliable)
                    </span>
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setState(prev => ({ ...prev, showSettings: !prev.showSettings }))}
              className={`p-2 rounded-lg transition-all ${
                state.showSettings 
                  ? 'bg-blue-100 text-blue-700 shadow-sm' 
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
            
            {!state.pdfUrl ? (
              <button
                onClick={generatePDF}
                disabled={state.isGenerating}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all shadow-sm"
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
                className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            )}
          </div>
        </div>

        {/* ⚙️ Элегантные настройки с надежными подсказками */}
        {state.showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200"
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
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="a4">A4 (210×297mm)</option>
                  <option value="letter">Letter (8.5×11")</option>
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
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="landscape">🖼️ Landscape</option>
                  <option value="portrait">📃 Portrait</option>
                </select>
              </div>
              
              {/* Размер шрифта с умной подсказкой */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center">
                  🔤 Font Size
                  {state.language && (
                    <span className="ml-1 text-blue-600 text-xs">
                      (optimal: {getOptimalPDFSettings(state.language).fontSize}pt)
                    </span>
                  )}
                </label>
                <select
                  value={options.fontSize}
                  onChange={(e) => setOptions(prev => ({ ...prev, fontSize: parseInt(e.target.value) as any }))}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {Object.entries(themes).map(([key, theme]) => (
                    <option key={key} value={key}>
                      {theme.emoji} {theme.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* 🛡️ Надежные подсказки по шрифтам */}
            {state.language && state.fontSolution && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 space-y-3"
              >
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center text-sm text-green-800">
                    <Shield className="w-4 h-4 mr-2" />
                    <span>
                      <strong>Reliable fonts:</strong> Using proven system fonts 
                      for {state.language.displayName}
                    </span>
                  </div>
                </div>
                
                {/* Рекомендации по шрифтам */}
                {state.fontRecommendations.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-800">
                      <strong>🎯 Optimizations:</strong>
                      <ul className="mt-1 space-y-1">
                        {state.fontRecommendations.map((rec, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-1 h-1 bg-blue-600 rounded-full mr-2"></span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* 🎬 Главный контент с элегантным превью */}
      <div className="p-4 h-[600px]">
        {state.pdfUrl ? (
          <div className="h-full bg-white rounded-lg shadow-inner overflow-hidden border border-slate-200">
            <iframe
              src={state.pdfUrl}
              className="w-full h-full"
              title="Elegant PDF Preview"
            />
          </div>
        ) : state.isGenerating ? (
          <div className="h-full flex items-center justify-center bg-white rounded-lg border border-slate-200">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Creating reliable PDF...
              </h3>
              <p className="text-slate-600">
                {state.language && state.fontSolution && 
                  `Optimizing for ${state.language.displayName} with reliable fonts`
                }
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-white rounded-lg border-2 border-dashed border-slate-300">
            <div className="text-center">
              <Eye className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-900 mb-2">
                Ready to Generate
              </h3>
              <p className="text-slate-600 mb-6">
                Click Preview to create your reliable PDF
                {state.language && ` optimized for ${state.language.displayName}`}
              </p>
              <button
                onClick={generatePDF}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm mx-auto"
              >
                <Shield className="w-5 h-5 mr-2" />
                Generate Preview
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 📊 Элегантный статус бар */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-slate-200 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Globe className="w-3 h-3 mr-1" />
              {state.language?.displayName || 'Auto-detecting...'}
            </span>
            <span className="flex items-center">
              <Shield className="w-3 h-3 mr-1 text-green-600" />
              {state.fontSolution?.primary || 'Default font'}
              {state.fontSolution && (
                <span className="ml-1 text-green-600">(reliable)</span>
              )}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span>{options.orientation} • {options.pageSize.toUpperCase()} • {options.fontSize}pt</span>
            <span className="flex items-center">
              <Palette className="w-3 h-3 mr-1" />
              {themes[options.theme].name}
            </span>
            {state.pdfUrl && (
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center text-green-600"
              >
                <Check className="w-3 h-3 mr-1" />
                Ready
              </motion.span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElegantCSVConverter;