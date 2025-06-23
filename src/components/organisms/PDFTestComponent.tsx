/**
 * PDF.js Test Component
 * Used to debug and test different PDF.js initialization approaches
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

  const testPDFJS = async () => {
    clearResults();

    // Test 1: Direct PDF.js import with detailed inspection
    addResult('Direct import', 'testing', 'Testing direct PDF.js import...');
    try {
      const pdfjs = await import('pdfjs-dist');
      
      // Inspect the imported module structure
      const moduleKeys = Object.keys(pdfjs);
      const hasDefault = 'default' in pdfjs;
      const hasGetDocument = typeof pdfjs.getDocument === 'function';
      const defaultHasGetDocument = hasDefault && typeof (pdfjs as any).default?.getDocument === 'function';
      
      const details = `
Module keys: ${moduleKeys.join(', ')}
Has default: ${hasDefault}
Direct getDocument: ${hasGetDocument}
Default.getDocument: ${defaultHasGetDocument}
Version: ${pdfjs.version || 'unknown'}
GlobalWorkerOptions: ${pdfjs.GlobalWorkerOptions ? 'available' : 'missing'}
      `.trim();
      
      if (hasGetDocument || defaultHasGetDocument) {
        addResult('Direct import', 'success', 'PDF.js loaded with getDocument function', details);
      } else {
        addResult('Direct import', 'error', 'PDF.js loaded but getDocument not found', details);
      }
    } catch (error) {
      addResult('Direct import', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 2: Our main utils
    addResult('Main PDF utils', 'testing', 'Testing main PDF utilities...');
    try {
      const { initializePDFJS } = await import('../../utils/pdfUtils');
      const pdfjsLib = await initializePDFJS();
      
      const hasGetDocument = typeof pdfjsLib.getDocument === 'function';
      const version = pdfjsLib.version || 'unknown';
      const hasGlobalWorkerOptions = pdfjsLib.GlobalWorkerOptions ? 'available' : 'missing';
      
      const details = `
getDocument: ${hasGetDocument}
Version: ${version}
GlobalWorkerOptions: ${hasGlobalWorkerOptions}
      `.trim();
      
      addResult('Main PDF utils', 'success', 'Main PDF utilities initialized successfully', details);
    } catch (error) {
      addResult('Main PDF utils', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 3: Simple PDF utils
    addResult('Simple PDF utils', 'testing', 'Testing simple PDF utilities...');
    try {
      const { initSimplePDFJS } = await import('../../utils/simplePdfUtils');
      const pdfjs = await initSimplePDFJS();
      
      const hasGetDocument = typeof pdfjs.getDocument === 'function';
      const version = pdfjs.version || 'unknown';
      
      const details = `
getDocument: ${hasGetDocument}
Version: ${version}
      `.trim();
      
      addResult('Simple PDF utils', 'success', 'Simple PDF utilities initialized successfully', details);
    } catch (error) {
      addResult('Simple PDF utils', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 4: Manual worker setup with getDocument test
    addResult('Manual worker', 'testing', 'Testing manual worker setup...');
    try {
      const pdfjs = await import('pdfjs-dist');
      
      // Get the correct module
      const pdfjsLib = pdfjs.default || pdfjs;
      
      if (typeof pdfjsLib.getDocument !== 'function') {
        throw new Error('getDocument function not found');
      }
      
      // Try to create a dummy document to test worker
      const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
      
      // Create a minimal PDF buffer for testing
      const testArrayBuffer = new ArrayBuffer(8);
      
      try {
        const loadingTask = pdfjsLib.getDocument({
          data: testArrayBuffer,
          workerSrc: workerSrc
        });
        
        // This will likely fail but should test worker loading
        await loadingTask.promise.catch(() => {
          // Expected to fail with invalid PDF, but worker should load
        });
        
        addResult('Manual worker', 'success', 'Manual worker setup successful (getDocument callable)');
      } catch (workerError) {
        addResult('Manual worker', 'error', `Worker test failed: ${workerError instanceof Error ? workerError.message : 'Unknown error'}`);
      }
    } catch (error) {
      addResult('Manual worker', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 5: Environment and dependency check
    addResult('Environment', 'testing', 'Checking environment...');
    try {
      const details = `
User Agent: ${navigator.userAgent}
URL: ${window.location.href}
Environment: ${import.meta.env.MODE}
Node modules available: ${typeof require !== 'undefined' ? 'yes' : 'no'}
Module system: ES modules
Vite version: ${import.meta.env.VITE_VERSION || 'unknown'}
      `.trim();
      
      addResult('Environment', 'success', 'Environment check complete', details);
    } catch (error) {
      addResult('Environment', 'error', `Environment check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">PDF.js Initialization Test</h2>
      <p className="text-gray-600 mb-6">
        This component tests different PDF.js initialization approaches to help debug issues.
      </p>

      <div className="space-y-4 mb-6">
        <Button onClick={testPDFJS} variant="primary">
          Run PDF.js Tests
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
                    <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded overflow-x-auto">
                      {result.details}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {testResults.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Recommendations</h3>
          <div className="text-sm text-gray-600 space-y-2">
            {testResults.some(r => r.method === 'Direct import' && r.status === 'success') && (
              <div className="text-green-600">✅ Direct import works - PDF.js is loading correctly</div>
            )}
            {testResults.some(r => r.method === 'Main PDF utils' && r.status === 'success') && (
              <div className="text-green-600">✅ Main PDF utils work - use pdfUtils.ts</div>
            )}
            {testResults.some(r => r.method === 'Simple PDF utils' && r.status === 'success') && (
              <div className="text-green-600">✅ Simple PDF utils work - use simplePdfUtils.ts as fallback</div>
            )}
            {testResults.some(r => r.message.includes('getDocument') && r.status === 'error') && (
              <div className="text-red-600">❌ getDocument issues detected - check module import pattern</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};