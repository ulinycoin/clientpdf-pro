/**
 * ClientPDF Pro - Client-side PDF processing application
 * 🚨 EMERGENCY MODE: Minimal imports to avoid MIME issues
 * 
 * @license MIT
 * @author ulinycoin
 * @version 0.1.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { EmergencyPage } from './pages/EmergencyPage'; // 🚨 Экстренная страница

// 🚨 ВРЕМЕННО ОТКЛЮЧЕНЫ ИМПОРТЫ СТРАНИЦ ДЛЯ РЕШЕНИЯ MIME ПРОБЛЕМЫ
// Будут включены обратно после решения проблемы

function App() {
  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          {/* 🚨 ЭКСТРЕННЫЙ РЕЖИМ: Все маршруты ведут на emergency страницу */}
          <Route path="*" element={<EmergencyPage />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;