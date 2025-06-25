/**
 * CyrillicTestComponent.tsx
 * Компонент для тестирования поддержки кириллицы в PDF
 */

import React, { useState } from 'react';
import { ExternalFontLoader } from '../services/ExternalFontLoader';
import { CyrillicFontService } from '../services/CyrillicFontService';

interface CyrillicTestResult {
  method: string;
  success: boolean;
  fontName: string;
  sampleText: string;
  warnings: string[];
}

export const CyrillicTestComponent: React.FC = () => {
  const [testResult, setTestResult] = useState<CyrillicTestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testText, setTestText] = useState('Привет, мир! Это тест кириллицы в PDF.');

  const testCyrillicSupport = async (method: 'external' | 'builtin') => {
    setIsLoading(true);
    setTestResult(null);

    try {
      // Создаем временный PDF для тестирования
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();

      let result: CyrillicTestResult;

      if (method === 'external') {
        // Тестируем внешние шрифты
        const fontResult = await ExternalFontLoader.setupPDFWithCyrillicFont(pdf, 'Roboto');
        
        result = {
          method: 'External Font (Roboto from Google Fonts)',
          success: fontResult.success,
          fontName: fontResult.fontName,
          sampleText: testText,
          warnings: fontResult.success ? [] : ['External font loading failed']
        };

        if (fontResult.success) {
          // Добавляем тестовый текст
          pdf.setFontSize(14);
          pdf.text(testText, 20, 30);
          pdf.text('Тестовые символы: А, Б, В, Г, Д, Е, Ё, Ж, З, И, Й, К, Л, М, Н, О, П', 20, 50);
          pdf.text('а, б, в, г, д, е, ё, ж, з, и, й, к, л, м, н, о, п', 20, 70);
        }

      } else {
        // Тестируем встроенную поддержку
        const cyrillicResult = CyrillicFontService.setupCyrillicSupport(pdf);
        
        result = {
          method: 'Built-in Unicode Support',
          success: cyrillicResult.success,
          fontName: cyrillicResult.selectedFont,
          sampleText: testText,
          warnings: cyrillicResult.success ? [] : ['Built-in Unicode failed']
        };

        if (cyrillicResult.success) {
          // Тестируем поддержку кириллицы
          const isSupported = CyrillicFontService.testCyrillicSupport(pdf, testText);
          if (!isSupported) {
            result.warnings.push('Cyrillic test failed');
          }
        }
      }

      setTestResult(result);

    } catch (error) {
      setTestResult({
        method: method === 'external' ? 'External Font' : 'Built-in Unicode',
        success: false,
        fontName: 'none',
        sampleText: testText,
        warnings: [`Test failed: ${error}`]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const preloadFonts = async () => {
    setIsLoading(true);
    try {
      await ExternalFontLoader.preloadFonts();
      alert('✅ Cyrillic fonts preloaded successfully!');
    } catch (error) {
      alert(`❌ Preload failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🔤 Cyrillic Support Test Tool
        </h2>
        <p className="text-gray-600">
          Test different methods for displaying Cyrillic characters in PDF
        </p>
      </div>

      {/* Test Text Input */}
      <div className="mb-6">
        <label htmlFor="testText" className="block text-sm font-medium text-gray-700 mb-2">
          Test Text (Russian/Cyrillic):
        </label>
        <textarea
          id="testText"
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Введите русский текст для тестирования..."
        />
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => testCyrillicSupport('external')}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
        >
          {isLoading ? '🔄 Testing...' : '🌐 Test External Fonts'}
        </button>

        <button
          onClick={() => testCyrillicSupport('builtin')}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
        >
          {isLoading ? '🔄 Testing...' : '🔧 Test Built-in Unicode'}
        </button>

        <button
          onClick={preloadFonts}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
        >
          {isLoading ? '🔄 Loading...' : '⚡ Preload Fonts'}
        </button>
      </div>

      {/* Test Results */}
      {testResult && (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border-2 ${
            testResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <h3 className="text-lg font-semibold mb-2">
              {testResult.success ? '✅' : '❌'} Test Results
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Method:</h4>
                <p className="text-sm text-gray-600">{testResult.method}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Font Used:</h4>
                <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {testResult.fontName}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-1">Test Text:</h4>
              <div className="p-3 bg-white border rounded text-sm">
                {testResult.sampleText}
              </div>
            </div>

            {testResult.warnings.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-yellow-800 mb-1">⚠️ Warnings:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {testResult.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-yellow-700">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Available Fonts Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-800">
          📚 Available Cyrillic Fonts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ExternalFontLoader.getAvailableFonts().map((font, index) => (
            <div key={index} className="text-sm">
              <span className="font-mono bg-blue-100 px-2 py-1 rounded">
                {font}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Implementation Guide */}
      <div className="mt-8 bg-gray-50 border border-gray-200 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          🚀 How to Use in Your App
        </h3>
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h4 className="font-medium mb-1">1. Automatic Detection:</h4>
            <p>The system automatically detects Cyrillic content and tries to preserve it when possible.</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">2. Fallback Chain:</h4>
            <p>External fonts → Built-in Unicode → Transliteration (current behavior)</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">3. User Control:</h4>
            <p>Add a setting to let users choose: "Preserve Cyrillic" vs "Always Transliterate"</p>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="mt-8 bg-gray-900 text-green-400 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">💻 Example Usage</h3>
        <pre className="text-xs overflow-x-auto">
{`// Enable Cyrillic support in CSV to PDF conversion
const options = {
  fontFamily: 'auto',
  preserveCyrillic: true, // NEW OPTION
  // ... other options
};

const pdfBytes = await CsvToPdfConverter.convertToPDF(
  parseResult, 
  options
);`}
        </pre>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          This tool helps test Cyrillic support before implementing in production.
          <br />
          Choose the method that works best for your use case.
        </p>
      </div>
    </div>
  );
};

export default CyrillicTestComponent;