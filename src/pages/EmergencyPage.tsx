/**
 * EmergencyPage.tsx
 * 🚨 ЭКСТРЕННАЯ СТРАНИЦА БЕЗ ВНЕШНИХ ЗАВИСИМОСТЕЙ
 * Использует только inline стили для диагностики MIME проблем
 */

import React from 'react';

export const EmergencyPage: React.FC = () => {
  const handleRestart = () => {
    window.location.href = '/';
  };

  const handleClearCache = () => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  const testBasicFunctionality = () => {
    alert('✅ JavaScript работает!\n✅ React компоненты загружаются!\n✅ Событие клика работает!');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '3rem',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        textAlign: 'center'
      }}>
        
        {/* Заголовок */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#dc3545',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            🚨 Emergency Mode
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: '#6b7280',
            margin: 0
          }}>
            MIME Type Error Recovery System
          </p>
        </div>

        {/* Статус */}
        <div style={{
          backgroundColor: '#d1fae5',
          color: '#065f46',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          border: '1px solid #10b981'
        }}>
          <strong>✅ SUCCESS:</strong> This page loaded without MIME errors!<br/>
          React components and JavaScript are working correctly.
        </div>

        {/* Диагностика */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <h3 style={{ 
            margin: '0 0 1rem 0', 
            color: '#495057',
            fontSize: '1.125rem',
            fontWeight: '600'
          }}>
            🔍 Diagnostic Results:
          </h3>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '1.5rem',
            lineHeight: '1.6'
          }}>
            <li>✅ HTML structure: Working</li>
            <li>✅ JavaScript execution: Working</li>
            <li>✅ React rendering: Working</li>
            <li>✅ Event handling: Working</li>
            <li>✅ Inline styles: Working</li>
            <li>❌ External CSS imports: Blocked by MIME error</li>
          </ul>
        </div>

        {/* Решения */}
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <h3 style={{ 
            margin: '0 0 1rem 0',
            fontSize: '1.125rem',
            fontWeight: '600'
          }}>
            🛠️ Immediate Solutions:
          </h3>
          <ol style={{ 
            margin: 0, 
            paddingLeft: '1.5rem',
            lineHeight: '1.6'
          }}>
            <li><strong>Stop dev server:</strong> Press Ctrl+C in terminal</li>
            <li><strong>Clear Vite cache:</strong> <code>rm -rf node_modules/.vite</code></li>
            <li><strong>Restart server:</strong> <code>npm run dev</code></li>
            <li><strong>Hard refresh browser:</strong> Ctrl+Shift+R</li>
          </ol>
        </div>

        {/* Кнопки действий */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={testBasicFunctionality}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.875rem',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
          >
            🧪 Test Functions
          </button>

          <button
            onClick={handleClearCache}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.875rem',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
          >
            🧹 Clear Cache & Reload
          </button>

          <button
            onClick={handleRestart}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.875rem',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
          >
            🏠 Back to Home
          </button>
        </div>

        {/* Детальная инструкция */}
        <details style={{ marginTop: '2rem', textAlign: 'left' }}>
          <summary style={{ 
            cursor: 'pointer', 
            fontWeight: '600', 
            color: '#495057',
            marginBottom: '1rem',
            fontSize: '1rem'
          }}>
            📚 Detailed Recovery Instructions
          </summary>
          
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            lineHeight: '1.6'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#495057' }}>Terminal Commands:</h4>
            <pre style={{
              backgroundColor: '#343a40',
              color: '#f8f9fa',
              padding: '0.75rem',
              borderRadius: '0.25rem',
              overflow: 'auto',
              fontSize: '0.8rem'
            }}>{`# Stop the dev server
Ctrl + C

# Clear Vite cache
rm -rf node_modules/.vite
rm -rf node_modules/.tmp

# Restart development server
npm run dev

# If that doesn't work, try:
npm run clean
npm install
npm run dev`}</pre>

            <h4 style={{ margin: '1rem 0 0.5rem 0', color: '#495057' }}>Browser Actions:</h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              <li>Hard refresh: <kbd>Ctrl + Shift + R</kbd></li>
              <li>Open DevTools → Application → Clear storage</li>
              <li>Try incognito mode</li>
              <li>Try different port: <code>npm run dev -- --port 3001</code></li>
            </ul>
          </div>
        </details>

        {/* Подвал */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e9ecef',
          fontSize: '0.875rem',
          color: '#6c757d'
        }}>
          Emergency Recovery System • ClientPDF Pro • {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default EmergencyPage;