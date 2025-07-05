import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocalizedText } from '../components/context/LocalizationProvider';
import ToolsGrid from '../components/organisms/ToolsGrid';
import SEOHead from '../components/SEO/SEOHead';

const HomePage: React.FC = () => {
  const { t, language } = useLocalizedText('common');

  const handleToolSelect = (toolType: string) => {
    // Navigate to the appropriate tool page
    const toolRoutes: Record<string, string> = {
      'merge': '/merge-pdf',
      'split': '/split-pdf', 
      'compress': '/compress-pdf',
      'add-text': '/add-text-pdf',
      'watermark': '/watermark-pdf',
      'rotate': '/rotate-pdf',
      'extract-pages': '/extract-pages-pdf',
      'extract-text': '/extract-text-pdf',
      'pdf-to-image': '/pdf-to-image'
    };

    const route = toolRoutes[toolType];
    if (route) {
      window.location.href = route;
    }
  };

  return (
    <>
      <SEOHead 
        title={language === 'ru' ? 'LocalPDF - Бесплатные PDF инструменты' : 'LocalPDF - Free PDF Tools'}
        description={language === 'ru' 
          ? 'Быстрые, приватные PDF инструменты, работающие полностью в вашем браузере. 9 бесплатных инструментов без загрузки данных.'
          : 'Ultra-fast, privacy-first PDF tools that work entirely in your browser. 9 free tools with no upload required.'
        }
        keywords={language === 'ru'
          ? 'PDF инструменты, объединить PDF, разделить PDF, сжать PDF, бесплатно, приватно, локально'
          : 'PDF tools, merge PDF, split PDF, compress PDF, free, privacy, local'
        }
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="text-8xl mb-6">📄</div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                {t('app.title', 'LocalPDF')}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                {language === 'ru' 
                  ? 'Сверхбыстрые, приватные PDF инструменты, работающие полностью в вашем браузере'
                  : 'Ultra-fast, privacy-first PDF tools that work entirely in your browser'
                }
              </p>
            </div>
            
            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg border border-white/20">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === 'ru' ? '100% Приватно' : '100% Private'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {language === 'ru' 
                    ? 'Все обрабатывается локально в вашем браузере'
                    : 'Everything processed locally in your browser'
                  }
                </p>
              </div>
              
              <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg border border-white/20">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === 'ru' ? 'Мгновенно' : 'Instant'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {language === 'ru'
                    ? 'Никаких загрузок или ожидания'
                    : 'No uploads or waiting required'
                  }
                </p>
              </div>
              
              <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg border border-white/20">
                <div className="text-4xl mb-4">🆓</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === 'ru' ? 'Совершенно бесплатно' : 'Completely Free'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {language === 'ru'
                    ? 'Без регистрации и ограничений'
                    : 'No registration or limitations'
                  }
                </p>
              </div>
            </div>
            
            {/* CTA */}
            <div className="mb-8">
              <a 
                href="#tools" 
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {language === 'ru' ? 'Начать работу' : 'Get Started'}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        {/* Tools Section */}
        <div id="tools" className="bg-white/50 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <ToolsGrid onToolSelect={handleToolSelect} />
          </div>
        </div>
        
        {/* Why Choose LocalPDF Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {language === 'ru' ? 'Почему LocalPDF?' : 'Why LocalPDF?'}
            </h2>
            <p className="text-lg text-gray-600">
              {language === 'ru'
                ? 'Мы делаем работу с PDF простой, быстрой и безопасной'
                : 'We make PDF work simple, fast, and secure'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {language === 'ru' ? 'Работает везде' : 'Works Everywhere'}
              </h3>
              <p className="text-gray-600 text-sm">
                {language === 'ru'
                  ? 'Любой браузер, любое устройство'
                  : 'Any browser, any device'
                }
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {language === 'ru' ? 'Супер быстро' : 'Super Fast'}
              </h3>
              <p className="text-gray-600 text-sm">
                {language === 'ru'
                  ? 'Обработка за секунды'
                  : 'Processing in seconds'
                }
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {language === 'ru' ? 'Максимальная безопасность' : 'Maximum Security'}
              </h3>
              <p className="text-gray-600 text-sm">
                {language === 'ru'
                  ? 'Файлы никогда не покидают ваш браузер'
                  : 'Files never leave your browser'
                }
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {language === 'ru' ? 'Простота использования' : 'Easy to Use'}
              </h3>
              <p className="text-gray-600 text-sm">
                {language === 'ru'
                  ? 'Интуитивный интерфейс'
                  : 'Intuitive interface'
                }
              </p>
            </div>
          </div>
        </div>
        
        {/* Statistics Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">9</div>
                <div className="text-blue-100">
                  {language === 'ru' ? 'PDF инструментов' : 'PDF Tools'}
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">100%</div>
                <div className="text-blue-100">
                  {language === 'ru' ? 'Приватность' : 'Privacy'}
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">0₽</div>
                <div className="text-blue-100">
                  {language === 'ru' ? 'Стоимость' : 'Cost'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;