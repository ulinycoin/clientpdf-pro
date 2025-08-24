import React from 'react';
import { ArrowLeft, Wrench, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

// OCR Tool Maintenance Page
const OCRPDFPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-mesh flex flex-col">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link 
              to="/"
              className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-300/80 dark:border-gray-600/20 rounded-lg text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Главная
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl p-12">
            
            {/* Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-8 shadow-2xl">
              <Wrench className="w-12 h-12" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-black text-black dark:text-white mb-4">
              OCR инструмент временно недоступен
            </h1>

            {/* Description */}
            <div className="space-y-4 text-gray-700 dark:text-gray-300 mb-8">
              <p className="text-lg">
                Мы работаем над улучшением технологии распознавания текста, чтобы предоставить вам наилучший опыт.
              </p>
              
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/60 dark:border-amber-600/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="font-black text-amber-700 dark:text-amber-300">Альтернативные решения:</h3>
                </div>
                <ul className="text-left space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-seafoam-500 rounded-full"></span>
                    <strong>Extract Text:</strong> Для PDF с текстовым слоем
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-seafoam-500 rounded-full"></span>
                    <strong>Images to PDF:</strong> Для создания PDF из изображений
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-seafoam-500 rounded-full"></span>
                    <strong>Online OCR сервисы:</strong> Временное решение
                  </li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/"
                className="btn btn-privacy-modern bg-gradient-to-br from-seafoam-500 to-ocean-500 hover:from-seafoam-600 hover:to-ocean-600 text-white font-black px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                🏠 Вернуться на главную
              </Link>
              
              <Link 
                to="/extract-text-pdf"
                className="btn bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-300/80 dark:border-gray-600/20 text-gray-700 dark:text-gray-200 font-bold px-8 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-all duration-300 shadow-lg"
              >
                📄 Extract Text
              </Link>
            </div>

            {/* Footer note */}
            <div className="mt-8 pt-6 border-t border-gray-200/60 dark:border-gray-600/20">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ожидаемое время восстановления: в ближайших обновлениях
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OCRPDFPage;