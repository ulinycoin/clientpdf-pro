/**
 * MIMEDebugPage.tsx
 * Специальная диагностическая страница для решения проблем с MIME типами
 */

import React, { useEffect, useState } from 'react';

export const MIMEDebugPage: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    const info: string[] = [];
    
    // Проверяем загруженные стили
    const stylesheets = Array.from(document.styleSheets);
    info.push(`📊 Loaded stylesheets: ${stylesheets.length}`);
    
    stylesheets.forEach((sheet, index) => {
      try {
        info.push(`  ${index + 1}. ${sheet.href || 'Inline styles'} - Rules: ${sheet.cssRules?.length || 'Unknown'}`);
      } catch (e) {
        info.push(`  ${index + 1}. ${sheet.href || 'Inline styles'} - Error accessing rules: ${e}`);
      }
    });

    // Проверяем link элементы
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    info.push(`🔗 Link elements: ${links.length}`);
    
    links.forEach((link, index) => {
      const linkEl = link as HTMLLinkElement;
      info.push(`  ${index + 1}. href: ${linkEl.href}, type: ${linkEl.type || 'auto'}`);
    });

    // Проверяем модули в документе
    const scripts = Array.from(document.querySelectorAll('script[type="module"]'));
    info.push(`📜 Module scripts: ${scripts.length}`);
    
    scripts.forEach((script, index) => {
      const scriptEl = script as HTMLScriptElement;
      info.push(`  ${index + 1}. src: ${scriptEl.src || 'inline'}`);
    });

    setDebugInfo(info);
  }, []);

  const testTailwind = () => {
    const testEl = document.createElement('div');
    testEl.className = 'bg-red-500 text-white p-4';
    testEl.textContent = 'Tailwind Test';
    document.body.appendChild(testEl);
    
    const computedStyle = window.getComputedStyle(testEl);
    const hasStyles = computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && computedStyle.backgroundColor !== 'transparent';
    
    setTimeout(() => {
      document.body.removeChild(testEl);
    }, 2000);
    
    return hasStyles;
  };

  const clearCache = () => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '2rem', 
      fontFamily: 'monospace',
      backgroundColor: '#f8f9fa',
      color: '#333'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          marginBottom: '2rem',
          color: '#dc3545',
          textAlign: 'center'
        }}>
          🚨 MIME Type Debug Page
        </h1>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px',
          marginBottom: '2rem',
          border: '1px solid #dee2e6'
        }}>
          <h2 style={{ color: '#495057', marginBottom: '1rem' }}>🔧 Quick Fixes</h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <button 
              onClick={clearCache}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '1rem'
              }}
            >
              Clear Cache & Reload
            </button>
            
            <button 
              onClick={() => window.location.href = '/style-test'}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Go to Style Test
            </button>
          </div>

          <div style={{ 
            backgroundColor: '#fff3cd', 
            color: '#856404',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            <strong>⚠️ Common Solutions:</strong>
            <ul style={{ marginTop: '0.5rem', marginBottom: 0 }}>
              <li>Stop dev server (Ctrl+C) and restart: <code>npm run dev</code></li>
              <li>Clear browser cache: Ctrl+Shift+R (hard refresh)</li>
              <li>Check if PostCSS is processing correctly</li>
              <li>Verify Tailwind config is valid</li>
            </ul>
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px',
          marginBottom: '2rem',
          border: '1px solid #dee2e6'
        }}>
          <h2 style={{ color: '#495057', marginBottom: '1rem' }}>📊 Debug Information</h2>
          
          <pre style={{ 
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '0.875rem',
            whiteSpace: 'pre-wrap'
          }}>
            {debugInfo.join('\n')}
          </pre>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px',
          marginBottom: '2rem',
          border: '1px solid #dee2e6'
        }}>
          <h2 style={{ color: '#495057', marginBottom: '1rem' }}>🧪 Live Tests</h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <button 
              onClick={() => {
                const result = testTailwind();
                alert(result ? '✅ Tailwind is working!' : '❌ Tailwind not working');
              }}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Test Tailwind CSS
            </button>
          </div>

          {/* Manual style tests */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ 
              backgroundColor: '#d1ecf1', 
              color: '#0c5460',
              padding: '1rem',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              ✅ Inline styles working
            </div>
            
            <div className="bg-green-100 text-green-800 p-4 rounded text-center">
              🤔 Tailwind classes
            </div>
            
            <div style={{ 
              backgroundColor: '#f8d7da', 
              color: '#721c24',
              padding: '1rem',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              📊 CSS Grid working
            </div>
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#d4edda', 
          color: '#155724',
          padding: '1.5rem', 
          borderRadius: '8px',
          border: '1px solid #c3e6cb'
        }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>🎯 Next Steps</h3>
          <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li>If this page loads without MIME errors, the problem is resolved</li>
            <li>Try the Tailwind test button above</li>
            <li>Navigate to <code>/style-test</code> for comprehensive testing</li>
            <li>If errors persist, check browser DevTools Console and Network tabs</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default MIMEDebugPage;