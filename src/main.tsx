/**
 * LocalPDF - Main application entry point
 * 🚨 EMERGENCY FIX: Temporary main.tsx without CSS imports to resolve MIME issue
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { ErrorBoundary } from './components/ErrorBoundary'
import App from './App.tsx'

// 🚨 ВРЕМЕННО ОТКЛЮЧЕНЫ CSS ИМПОРТЫ для решения MIME проблемы
// import './index.css'
// import './App.css'

// 🚀 Инициализация приложения
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
)

// 🚨 ДОБАВЛЯЕМ КРИТИЧЕСКИЕ СТИЛИ ЧЕРЕЗ JAVASCRIPT
const addCriticalStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    /* 🚨 КРИТИЧЕСКИЕ СТИЛИ ДЛЯ РАБОТЫ ПРИЛОЖЕНИЯ */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.5;
      color: #333;
      background: #fff;
    }
    
    #root {
      min-height: 100vh;
    }
    
    /* Базовые утилиты */
    .container-modern {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    .text-center { text-align: center; }
    .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .font-medium { font-weight: 500; }
    
    .mb-8 { margin-bottom: 2rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    
    .mt-4 { margin-top: 1rem; }
    .mt-3 { margin-top: 0.75rem; }
    
    .p-8 { padding: 2rem; }
    .p-6 { padding: 1.5rem; }
    .p-4 { padding: 1rem; }
    .p-3 { padding: 0.75rem; }
    
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .space-x-4 > * + * { margin-left: 1rem; }
    .space-x-3 > * + * { margin-left: 0.75rem; }
    .space-x-2 > * + * { margin-left: 0.5rem; }
    
    .grid { display: grid; }
    .gap-4 { gap: 1rem; }
    
    .w-full { width: 100%; }
    .max-w-6xl { max-width: 72rem; }
    .max-w-2xl { max-width: 42rem; }
    
    .text-gray-900 { color: #111827; }
    .text-gray-600 { color: #4b5563; }
    .text-gray-500 { color: #6b7280; }
    .text-blue-600 { color: #2563eb; }
    
    .bg-white { background-color: white; }
    .bg-gray-50 { background-color: #f9fafb; }
    
    .border { border: 1px solid #e5e7eb; }
    .border-dashed { border-style: dashed; }
    .rounded-lg { border-radius: 0.5rem; }
    
    .min-h-screen { min-height: 100vh; }
    
    /* Градиенты */
    .bg-gradient-to-br {
      background: linear-gradient(to bottom right, var(--tw-gradient-stops));
    }
    
    .from-blue-50 {
      --tw-gradient-from: #eff6ff;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(239, 246, 255, 0));
    }
    
    .to-indigo-100 {
      --tw-gradient-to: #e0e7ff;
    }
    
    /* Кнопки */
    .btn-base {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 500;
      transition: all 0.2s;
      border: none;
      cursor: pointer;
      font-size: 0.875rem;
    }
    
    .btn-primary {
      background-color: #3b82f6;
      color: white;
    }
    
    .btn-primary:hover {
      background-color: #2563eb;
    }
    
    .btn-secondary {
      background-color: white;
      color: #374151;
      border: 1px solid #d1d5db;
    }
    
    .btn-secondary:hover {
      background-color: #f9fafb;
    }
    
    /* Карточки */
    .card {
      background: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
    }
    
    /* Бейджи */
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .badge-success {
      background: #d1fae5;
      color: #065f46;
    }
    
    .badge-secondary {
      background: #f3f4f6;
      color: #374151;
    }
    
    /* Анимации */
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    
    /* Responsive */
    @media (max-width: 640px) {
      .container-modern {
        padding: 0 1rem;
      }
      .text-4xl {
        font-size: 1.875rem;
        line-height: 2.25rem;
      }
      .p-8 {
        padding: 1.5rem;
      }
    }
  `;
  document.head.appendChild(style);
};

// Добавляем стили после загрузки DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addCriticalStyles);
} else {
  addCriticalStyles();
}