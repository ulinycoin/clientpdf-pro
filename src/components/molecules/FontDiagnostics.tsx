import React, { useState } from 'react';
import Button from '../atoms/Button';

const FontDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics([]);

    const logs: string[] = [];

    // Override console methods to capture logs
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => {
      logs.push(`📝 LOG: ${args.join(' ')}`);
      originalLog(...args);
    };

    console.warn = (...args) => {
      logs.push(`⚠️ WARN: ${args.join(' ')}`);
      originalWarn(...args);
    };

    console.error = (...args) => {
      logs.push(`❌ ERROR: ${args.join(' ')}`);
      originalError(...args);
    };

    try {
      // Test font URLs
      const fontUrls = [
        'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf',
        'https://fonts.gstatic.com/s/notosans/v36/o-0IIpQlx3QUlC5A4PNr5TRASf6M7Q.woff2'
      ];

      logs.push('🔍 Testing font accessibility...');

      for (const fontUrl of fontUrls) {
        try {
          logs.push(`🌐 Testing: ${fontUrl}`);

          const response = await fetch(fontUrl, {
            mode: 'cors',
            method: 'HEAD' // Just check if accessible
          });

          if (response.ok) {
            logs.push(`✅ ACCESSIBLE: ${fontUrl}`);
          } else {
            logs.push(`❌ NOT ACCESSIBLE: ${fontUrl} (${response.status})`);
          }
        } catch (error) {
          logs.push(`❌ FETCH FAILED: ${fontUrl} - ${error.message}`);
        }
      }

      // Test CORS headers
      logs.push('🔒 Testing CORS policy...');
      try {
        const testResponse = await fetch('https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf', {
          mode: 'cors'
        });

        if (testResponse.ok) {
          logs.push('✅ CORS: Font loading should work');
        } else {
          logs.push(`⚠️ CORS: Response not OK (${testResponse.status})`);
        }
      } catch (corsError) {
        logs.push(`❌ CORS: Blocked - ${corsError.message}`);
      }

      // Test browser font support
      logs.push('🎨 Testing browser font support...');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.font = '16px Arial';
        const fallbackWidth = ctx.measureText('Русский текст').width;

        ctx.font = '16px "Times New Roman"';
        const timesWidth = ctx.measureText('Русский текст').width;

        if (fallbackWidth !== timesWidth) {
          logs.push('✅ BROWSER: Basic Cyrillic support detected');
        } else {
          logs.push('⚠️ BROWSER: Limited Cyrillic support');
        }
      }

    } catch (error) {
      logs.push(`❌ DIAGNOSTICS ERROR: ${error.message}`);
    } finally {
      // Restore console methods
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;

      setDiagnostics(logs);
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h4 className="font-medium mb-3">🔧 Font Diagnostics</h4>
      <p className="text-sm text-gray-600 mb-3">
        Run diagnostics to check font loading capabilities and troubleshoot Cyrillic display issues.
      </p>

      <Button
        onClick={runDiagnostics}
        disabled={isRunning}
        size="sm"
        variant="secondary"
      >
        {isRunning ? '🔄 Running...' : '🔍 Run Font Diagnostics'}
      </Button>

      {diagnostics.length > 0 && (
        <div className="mt-4">
          <h5 className="font-medium mb-2">Diagnostic Results:</h5>
          <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono max-h-60 overflow-y-auto">
            {diagnostics.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
          </div>

          <div className="mt-2 text-xs text-gray-600">
            <strong>Interpretation:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>✅ ACCESSIBLE = Font can be loaded</li>
              <li>❌ NOT ACCESSIBLE = Font blocked or unavailable</li>
              <li>❌ CORS Blocked = Browser security policy preventing font access</li>
              <li>⚠️ Limited support = May need transliteration</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FontDiagnostics;
