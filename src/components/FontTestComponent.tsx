/**
 * FontTestComponent.tsx
 * Компонент для тестирования улучшенной системы шрифтов в CSV to PDF конвертации
 */

import React, { useState, useCallback } from 'react';
import { EnhancedUnicodeFontService } from '../services/EnhancedUnicodeFontService';
import { CsvToPdfConverter } from '../services/converters/CsvToPdfConverter';

interface FontTestResult {
  analysis: any;
  cleanedText: string;
  recommendations: string[];
  fontStats: any;
}

export const FontTestComponent: React.FC = () => {
  const [testText, setTestText] = useState<string>('');
  const [testResult, setTestResult] = useState<FontTestResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Предустановленные примеры текста для тестирования
  const testSamples = {
    latvian: 'Šis ir latviešu teksts ar dažādiem simboliem: ā, č, ē, ģ, ī, ķ, ļ, ņ, š, ū, ž',
    russian: 'Это русский текст с кириллицей: Привет, мир! Тестируем шрифты.',
    lithuanian: 'Lietuvių kalba su diakritikais: ą, č, ę, ė, į, š, ų, ū, ž',
    polish: 'Polski tekst z polskimi znakami: ą, ć, ę, ł, ń, ó, ś, ź, ż',
    german: 'Deutscher Text mit Umlauten: ä, ö, ü, ß',
    french: 'Texte français avec accents: à, â, ç, é, è, ê, ë, î, ï, ô, ù, û, ü, ÿ',
    mixed: 'Mixed: Latvian ā, Russian Привет, Polish ą, German ä, French é, Special: €, £, ¥, №, ±',
    special: 'Special chars: "Smart quotes", 'apostrophes', –dash—, …ellipsis, ™, ©, ®',
    math: 'Math symbols: α, β, γ, δ, π, ∞, ≤, ≥, ≠, ±, ×, ÷, √'
  };

  const handleAnalyzeText = useCallback(async () => {
    if (!testText.trim()) return;

    setIsAnalyzing(true);
    try {
      // Анализируем текст
      const analysis = EnhancedUnicodeFontService.analyzeText(testText);
      
      // Очищаем текст
      const cleanedText = EnhancedUnicodeFontService.smartCleanText(testText);
      
      // Получаем рекомендации (используем mock данные)
      const mockParseResult = {
        data: [{ test: testText }],
        headers: ['test'],
        rowCount: 1,
        columnCount: 1,
        encoding: 'UTF-8',
        delimiter: ',',
        errors: [],
        columnTypes: { test: 'text' },
        preview: [{ test: testText }]
      };
      
      const recommendations = CsvToPdfConverter.getOptimizationRecommendations(mockParseResult);
      
      // Получаем статистику шрифтов
      const fontStats = EnhancedUnicodeFontService.getFontStats();

      setTestResult({
        analysis,
        cleanedText,
        recommendations: recommendations.recommendations,
        fontStats
      });

    } catch (error) {
      console.error('Font analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [testText]);

  const loadSample = (sampleKey: keyof typeof testSamples) => {
    setTestText(testSamples[sampleKey]);
    setTestResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🎨 Font System Test Tool
        </h2>
        <p className="text-gray-600">
          Test the enhanced Unicode font system for CSV to PDF conversion
        </p>
      </div>

      {/* Sample Text Buttons */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Quick Test Samples:</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(testSamples).map(([key, _]) => (
            <button
              key={key}
              onClick={() => loadSample(key as keyof typeof testSamples)}
              className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm font-medium transition-colors"
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Text Input */}
      <div className="mb-4">
        <label htmlFor="testText" className="block text-sm font-medium text-gray-700 mb-2">
          Test Text (paste your CSV content or use samples above):
        </label>
        <textarea
          id="testText"
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter text with special characters to test font handling..."
        />
      </div>

      {/* Analyze Button */}
      <div className="mb-6">
        <button
          onClick={handleAnalyzeText}
          disabled={!testText.trim() || isAnalyzing}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
        >
          {isAnalyzing ? '🔍 Analyzing...' : '🔍 Analyze Text'}
        </button>
      </div>

      {/* Results */}
      {testResult && (
        <div className="space-y-6">
          {/* Text Analysis */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              📊 Text Analysis Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Detected Languages:</h4>
                <div className="flex flex-wrap gap-1">
                  {testResult.analysis.detectedLanguages.map((lang: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Recommended Font:</h4>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono">
                  {testResult.analysis.recommendedFont}
                </span>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${testResult.analysis.hasLatinExtended ? 'text-orange-600' : 'text-green-600'}`}>
                  {testResult.analysis.hasLatinExtended ? '⚠️' : '✅'}
                </div>
                <div className="text-sm text-gray-600">Latin Extended</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${testResult.analysis.hasCyrillic ? 'text-orange-600' : 'text-green-600'}`}>
                  {testResult.analysis.hasCyrillic ? '⚠️' : '✅'}
                </div>
                <div className="text-sm text-gray-600">Cyrillic</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${testResult.analysis.hasSpecialChars ? 'text-orange-600' : 'text-green-600'}`}>
                  {testResult.analysis.hasSpecialChars ? '⚠️' : '✅'}
                </div>
                <div className="text-sm text-gray-600">Special Chars</div>
              </div>
            </div>
          </div>

          {/* Problem Characters */}
          {testResult.analysis.problemChars.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-yellow-800">
                ⚠️ Characters That Will Be Transliterated
              </h3>
              <div className="text-sm text-yellow-700 mb-2">
                Found {testResult.analysis.problemChars.length} characters that need replacement:
              </div>
              <div className="flex flex-wrap gap-1">
                {testResult.analysis.problemChars.map((char: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded font-mono text-sm">
                    {char}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Before/After Comparison */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              🔄 Text Transformation
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Original Text:</h4>
                <div className="p-3 bg-white border rounded font-mono text-sm break-all">
                  {testText}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Cleaned Text (for PDF):</h4>
                <div className="p-3 bg-white border rounded font-mono text-sm break-all">
                  {testResult.cleanedText}
                </div>
              </div>
              {testText !== testResult.cleanedText && (
                <div className="text-sm text-blue-600">
                  ✨ Text has been cleaned and optimized for PDF compatibility
                </div>
              )}
            </div>
          </div>

          {/* Font Statistics */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              📈 Font System Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Available Fonts:</h4>
                <div className="space-y-1">
                  {testResult.fontStats.availableFonts.map((font: string, index: number) => (
                    <div key={index} className="px-2 py-1 bg-white border rounded text-sm font-mono">
                      {font}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Recommendations:</h4>
                <div className="space-y-1">
                  {testResult.fontStats.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Processing Recommendations */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-blue-800">
              💡 Processing Recommendations
            </h3>
            <div className="space-y-2">
              {testResult.recommendations.map((rec: string, index: number) => (
                <div key={index} className="text-sm text-blue-700 flex items-start">
                  <span className="text-blue-500 mr-2">→</span>
                  {rec}
                </div>
              ))}
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-green-800">
              🚀 How to Use These Results
            </h3>
            <div className="space-y-2 text-sm text-green-700">
              <p>
                <strong>1.</strong> The system automatically detects text language and selects the best font
              </p>
              <p>
                <strong>2.</strong> Special characters are automatically transliterated for better compatibility
              </p>
              <p>
                <strong>3.</strong> No manual intervention needed - the CSV to PDF converter handles everything
              </p>
              <p>
                <strong>4.</strong> For best results with multilingual content, use the "auto" font setting
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          This tool helps test and debug the enhanced Unicode font system in ClientPDF Pro.
          <br />
          Use it to verify font handling before converting large CSV files.
        </p>
      </div>
    </div>
  );
};

export default FontTestComponent;