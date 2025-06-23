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
  }[]>([]);

  const addResult = (method: string, status: 'testing' | 'success' | 'error', message: string) => {
    setTestResults(prev => [...prev, { method, status, message }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testPDFJS = async () => {
    clearResults();

    // Test 1: Direct PDF.js import
    addResult('Direct import', 'testing', 'Testing direct PDF.js import...');
    try {
      const pdfjs = await import('pdfjs-dist');
      if (pdfjs.GlobalWorkerOptions) {
        addResult('Direct import', 'success', `PDF.js ${pdfjs.version} loaded with GlobalWorkerOptions`);
      } else {
        addResult('Direct import', 'error', 'PDF.js loaded but GlobalWorkerOptions not available');
      }
    } catch (error) {
      addResult('Direct import', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 2: Our main utils
    addResult('Main PDF utils', 'testing', 'Testing main PDF utilities...');
    try {
      const { initializePDFJS } = await import('../../utils/pdfUtils');
      await initializePDFJS();
      addResult('Main PDF utils', 'success', 'Main PDF utilities initialized successfully');
    } catch (error) {
      addResult('Main PDF utils', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 3: Simple PDF utils
    addResult('Simple PDF utils', 'testing', 'Testing simple PDF utilities...');
    try {
      const { initSimplePDFJS } = await import('../../utils/simplePdfUtils');
      await initSimplePDFJS();
      addResult('Simple PDF utils', 'success', 'Simple PDF utilities initialized successfully');
    } catch (error) {
      addResult('Simple PDF utils', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 4: Manual worker setup
    addResult('Manual worker', 'testing', 'Testing manual worker setup...');
    try {
      const pdfjs = await import('pdfjs-dist');
      
      // Try to manually set up worker
      const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '3.11.174'}/pdf.worker.min.js`;
      
      // Test worker loading by creating a document
      const testDoc = await pdfjs.getDocument({
        data: new ArrayBuffer(0), // Empty buffer - will fail but tests worker loading
        workerSrc: workerSrc
      }).promise.catch(() => null);
      
      addResult('Manual worker', 'success', 'Manual worker setup successful');
    } catch (error) {
      addResult('Manual worker', 'error', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    <div className="p-6 max-w-2xl mx-auto">
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
            className="flex items-start space-x-3 p-3 border rounded-lg"
          >
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
            </div>
          </div>
        ))}
      </div>

      {testResults.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Debug Information</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>User Agent: {navigator.userAgent}</div>
            <div>URL: {window.location.href}</div>
            <div>Environment: {import.meta.env.MODE}</div>
          </div>
        </div>
      )}
    </div>
  );
};