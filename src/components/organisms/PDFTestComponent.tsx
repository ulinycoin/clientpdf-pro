/**
 * Enhanced PDF.js Test Component with deep module inspection
 */

import React, { useState } from 'react';
import { Button } from '../atoms/Button';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const PDFTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    method: string;
    status: 'testing' | 'success' | 'error';
    message: string;
    details?: string;
  }[]>([]);

  const addResult = (method: string, status: 'testing' | 'success' | 'error', message: string, details?: string) => {
    setTestResults(prev => [...prev, { method, status, message, details }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const inspectObject = (obj: any, path = ''): string => {
    const results: string[] = [];
    
    try {
      if (obj && typeof obj === 'object') {
        const keys = Object.keys(obj);
        results.push(`${path} keys: [${keys.join(', ')}]`);
        
        keys.forEach(key => {
          const value = obj[key];
          const currentPath = path ? `${path}.${key}` : key;
          
          if (typeof value === 'function') {
            results.push(`${currentPath}: [Function]`);
          } else if (typeof value === 'object' && value !== null) {
            results.push(`${currentPath}: [Object]`);
            if (key === 'default' || key === 'pdfjsLib') {
              // Recursively inspect important nested objects
              results.push(inspectObject(value, currentPath));
            }
          } else {
            results.push(`${currentPath}: ${value}`);
          }
        });
      }
    } catch (error) {
      results.push(`Error inspecting ${path}: ${error}`);
    }
    
    return results.join('\n');
  };

  const testPDFJS = async () => {
    clearResults();

    // Test 1: Deep module inspection
    addResult('Deep Module Inspection', 'testing', 'Analyzing PDF.js module structure...');
    try {
      const pdfjs = await import('pdfjs-dist');
      
      const moduleStructure = inspectObject(pdfjs, 'pdfjs');
      
      // Test various access patterns
      const tests = {
        'direct getDocument': typeof pdfjs.getDocument === 'function',
        'direct version': pdfjs.version,
        'has default': 'default' in pdfjs,
        'default getDocument': pdfjs.default && typeof pdfjs.default.getDocument === 'function',
        'default version': pdfjs.default && pdfjs.default.version,
        'pdfjsLib exists': !!(pdfjs as any).pdfjsLib,
        'pdfjsLib getDocument': (pdfjs as any).pdfjsLib && typeof (pdfjs as any).pdfjsLib.getDocument === 'function',
      };
      
      const testResults = Object.entries(tests).map(([key, value]) => `${key}: ${value}`).join('\n');
      
      const details = `
MODULE STRUCTURE:
${moduleStructure}

ACCESS PATTERN TESTS:
${testResults}
      `.trim();
      
      addResult('Deep Module Inspection', 'success', 'Module structure analyzed', details);
    } catch (error) {
      addResult('Deep Module Inspection', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 2: Try different import methods
    addResult('Alternative Import', 'testing', 'Testing namespace import...');
    try {
      const pdfjsNamespace = await import('pdfjs-dist/build/pdf');
      
      const details = inspectObject(pdfjsNamespace, 'pdfjsNamespace');
      
      addResult('Alternative Import', 'success', 'Namespace import successful', details);
    } catch (error) {
      addResult('Alternative Import', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 3: Try legacy import
    addResult('Legacy Import', 'testing', 'Testing legacy import pattern...');
    try {
      const pdfjsLegacy = await import('pdfjs-dist/legacy/build/pdf');
      
      const details = inspectObject(pdfjsLegacy, 'pdfjsLegacy');
      
      addResult('Legacy Import', 'success', 'Legacy import successful', details);
    } catch (error) {
      addResult('Legacy Import', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 4: Manual construction
    addResult('Manual Construction', 'testing', 'Testing manual PDF.js construction...');
    try {
      const pdfjs = await import('pdfjs-dist');
      
      // Try to manually construct getDocument if it exists anywhere
      let foundGetDocument = null;
      let foundVersion = null;
      
      const searchForGetDocument = (obj: any, path: string[] = []): void => {
        if (obj && typeof obj === 'object') {
          Object.keys(obj).forEach(key => {
            const value = obj[key];
            const currentPath = [...path, key];
            
            if (key === 'getDocument' && typeof value === 'function') {
              foundGetDocument = { path: currentPath.join('.'), func: value };
            }
            
            if (key === 'version' && typeof value === 'string') {
              foundVersion = { path: currentPath.join('.'), value };
            }
            
            if (typeof value === 'object' && value !== null && currentPath.length < 3) {
              searchForGetDocument(value, currentPath);
            }
          });
        }
      };
      
      searchForGetDocument(pdfjs);
      
      const details = `
Found getDocument: ${foundGetDocument ? `${foundGetDocument.path} [Function]` : 'Not found'}
Found version: ${foundVersion ? `${foundVersion.path} = ${foundVersion.value}` : 'Not found'}
      `.trim();
      
      if (foundGetDocument) {
        addResult('Manual Construction', 'success', 'getDocument function located!', details);
      } else {
        addResult('Manual Construction', 'error', 'getDocument function not found anywhere', details);
      }
    } catch (error) {
      addResult('Manual Construction', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 5: Package info
    addResult('Package Info', 'testing', 'Checking package information...');
    try {
      const details = `
Current URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Environment: ${import.meta.env.MODE}
Base URL: ${import.meta.env.BASE_URL}
      `.trim();
      
      addResult('Package Info', 'success', 'Package info collected', details);
    } catch (error) {
      addResult('Package Info', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusIcon = (status: 'testing' | 'success' | 'error') => {
    switch (status) {
      case 'testing':
        return <Clock className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Enhanced PDF.js Deep Inspection</h2>
      <p className="text-gray-600 mb-6">
        Deep analysis of PDF.js module structure to find the correct access pattern.
      </p>

      <div className="space-y-4 mb-6">
        <Button onClick={testPDFJS} variant="primary">
          Run Deep Analysis
        </Button>
        <Button onClick={clearResults} variant="secondary">
          Clear Results
        </Button>
      </div>

      <div className="space-y-3">
        {testResults.map((result, index) => (
          <div
            key={index}
            className="border rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(result.status)}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{result.method}</div>
                <div className={`text-sm ${
                  result.status === 'error' ? 'text-red-600' :
                  result.status === 'success' ? 'text-green-600' : 
                  'text-blue-600'
                }`}>
                  {result.message}
                </div>
                {result.details && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                      Show details
                    </summary>
                    <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                      {result.details}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};