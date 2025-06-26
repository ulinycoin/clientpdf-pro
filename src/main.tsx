/**
 * LocalPDF - Main application entry point
 * 🔧 ИСПРАВЛЕН: Правильные CSS импорты без MIME ошибок
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { ErrorBoundary } from './components/ErrorBoundary'
import App from './App.tsx'

// 🔧 ПРАВИЛЬНЫЕ CSS ИМПОРТЫ (после проверки что MIME проблема решена)
import './index.css'

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