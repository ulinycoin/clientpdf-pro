import React from 'react';
import useLocalization from '@/hooks/useLocalization';
import LanguageSwitcher from '@/components/atoms/LanguageSwitcher';
import HeaderLocalized from '@/components/organisms/HeaderLocalized';

const LocalizationDemo: React.FC = () => {
  const { t, currentLanguage, formatFileSize, formatNumber } = useLocalization();

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderLocalized />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Demo Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('header.title')} - {t('common.demo')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('header.tagline')}
          </p>
        </div>

        {/* Language Switcher Demo */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Language Switcher Demo
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Dropdown Variant</h3>
              <LanguageSwitcher variant="dropdown" showText={true} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Toggle Variant</h3>
              <LanguageSwitcher variant="toggle" showText={true} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Icon Only</h3>
              <LanguageSwitcher variant="dropdown" showText={false} />
            </div>
          </div>
        </div>

        {/* Translation Examples */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Translation Examples
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Common Translations */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Common Terms</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Loading:</span>
                  <span className="font-medium">{t('common.loading')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success:</span>
                  <span className="font-medium text-green-600">{t('common.success')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Error:</span>
                  <span className="font-medium text-red-600">{t('common.error')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Download:</span>
                  <span className="font-medium">{t('common.download')}</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Navigation</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Home:</span>
                  <span className="font-medium">{t('navigation.home')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tools:</span>
                  <span className="font-medium">{t('navigation.tools')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">FAQ:</span>
                  <span className="font-medium">{t('navigation.faq')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Tools Examples */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            PDF Tools ({t('navigation.tools')})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Merge Tool */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-600 mb-2">
                {t('tools.merge.title')}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {t('tools.merge.description')}
              </p>
              <button className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors">
                {t('tools.merge.action')}
              </button>
            </div>

            {/* Split Tool */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-600 mb-2">
                {t('tools.split.title')}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {t('tools.split.description')}
              </p>
              <button className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600 transition-colors">
                {t('tools.split.action')}
              </button>
            </div>

            {/* Compress Tool */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-600 mb-2">
                {t('tools.compress.title')}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {t('tools.compress.description')}
              </p>
              <button className="bg-purple-500 text-white px-4 py-2 rounded text-sm hover:bg-purple-600 transition-colors">
                {t('tools.compress.action')}
              </button>
            </div>
          </div>
        </div>

        {/* Utility Functions Demo */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Utility Functions Demo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">File Size Formatting</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">1024 bytes:</span>
                  <span className="font-medium">{formatFileSize(1024)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">1048576 bytes:</span>
                  <span className="font-medium">{formatFileSize(1048576)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">52428800 bytes:</span>
                  <span className="font-medium">{formatFileSize(52428800)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Number Formatting</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">1234:</span>
                  <span className="font-medium">{formatNumber(1234)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">1234567:</span>
                  <span className="font-medium">{formatNumber(1234567)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Language Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-3">
            Current Language Information
          </h2>
          <div className="space-y-2 text-blue-700">
            <p><strong>Language Code:</strong> {currentLanguage}</p>
            <p><strong>Document Language:</strong> {typeof document !== 'undefined' ? document.documentElement.lang : 'N/A'}</p>
            <p><strong>Sample Translation:</strong> "{t('footer.privacyFirst')}"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalizationDemo;