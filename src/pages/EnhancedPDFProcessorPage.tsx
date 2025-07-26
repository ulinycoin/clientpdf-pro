import React from 'react';
import { Helmet } from 'react-helmet-async';
import EnhancedPDFProcessor from '../components/molecules/EnhancedPDFProcessor';

const EnhancedPDFProcessorPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Enhanced PDF Processor Demo | LocalPDF</title>
        <meta name="description" content="Демонстрация Enhanced PDF Processor с Web Workers и улучшенным UX" />
      </Helmet>

      <div className="min-h-screen bg-gradient-mesh py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto px-4 mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🚀 Enhanced PDF Processor Demo
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Демонстрация последних улучшений LocalPDF: Web Workers, реальный прогресс выполнения,
              строгая типизация TypeScript и оптимизированные React компоненты.
            </p>
          </div>
        </div>

        {/* Demo Component */}
        <div className="max-w-4xl mx-auto px-4">
          <EnhancedPDFProcessor />
        </div>

        {/* Technical Info */}
        <div className="max-w-4xl mx-auto px-4 mt-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🛠️ Технические улучшения
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-600 mb-3">
                  ⚡ Производительность
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Web Workers для неблокирующей обработки</li>
                  <li>• React.memo для оптимизации рендеринга</li>
                  <li>• Lazy loading и code splitting</li>
                  <li>• Эффективное управление памятью</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-600 mb-3">
                  🔧 Качество кода
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• TypeScript strict mode</li>
                  <li>• Atomic Design архитектура</li>
                  <li>• Строгая типизация всех интерфейсов</li>
                  <li>• Переиспользуемые компоненты</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-600 mb-3">
                  🎨 User Experience
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Реальный прогресс выполнения</li>
                  <li>• Анимированные переходы</li>
                  <li>• Интуитивные элементы управления</li>
                  <li>• Обработка ошибок с понятными сообщениями</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-red-600 mb-3">
                  🔒 Приватность и безопасность
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• 100% локальная обработка</li>
                  <li>• Никаких серверных запросов</li>
                  <li>• Файлы не покидают ваше устройство</li>
                  <li>• Отсутствие трекинга и аналитики</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="max-w-4xl mx-auto px-4 mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Вернуться на главную страницу
          </a>
        </div>
      </div>
    </>
  );
};

export default EnhancedPDFProcessorPage;
