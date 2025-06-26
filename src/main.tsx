/**
 * LocalPDF - Main application entry point
 * 🔧 FIXED: Proper CSS imports to avoid MIME type issues
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { ErrorBoundary } from './components/ErrorBoundary'
import App from './App.tsx'

// 🔧 КРИТИЧЕСКИЙ ИМПОРТ: CSS стили (обрабатываются Vite + PostCSS)
import './index.css'

// 🔧 ОПЦИОНАЛЬНЫЙ ИМПОРТ: Дополнительные стили если нужны
import './App.css'

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