import React from 'react';
import { useLocalizedText } from '../context/LocalizationProvider';
import ToolCard from './ToolCard';

interface Tool {
  id: string;
  route: string;
  icon: string;
  titleKey: string;
  descriptionKey: string;
  color: string;
}

const LocalizedToolsGrid: React.FC = () => {
  const { t } = useLocalizedText('tools');
  
  const tools: Tool[] = [
    {
      id: 'merge',
      route: '/merge-pdf',
      icon: '🔗',
      titleKey: 'merge.title',
      descriptionKey: 'merge.description',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      id: 'split',
      route: '/split-pdf',
      icon: '✂️',
      titleKey: 'split.title',
      descriptionKey: 'split.description',
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      id: 'compress',
      route: '/compress-pdf',
      icon: '🗜️',
      titleKey: 'compress.title',
      descriptionKey: 'compress.description',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    },
    {
      id: 'addtext',
      route: '/add-text-pdf',
      icon: '✏️',
      titleKey: 'addtext.title',
      descriptionKey: 'addtext.description',
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
    },
    {
      id: 'watermark',
      route: '/watermark-pdf',
      icon: '🏷️',
      titleKey: 'watermark.title',
      descriptionKey: 'watermark.description',
      color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
    },
    {
      id: 'rotate',
      route: '/rotate-pdf',
      icon: '🔄',
      titleKey: 'rotate.title',
      descriptionKey: 'rotate.description',
      color: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100'
    },
    {
      id: 'extractPages',
      route: '/extract-pages-pdf',
      icon: '📄',
      titleKey: 'extractPages.title',
      descriptionKey: 'extractPages.description',
      color: 'bg-pink-50 border-pink-200 hover:bg-pink-100'
    },
    {
      id: 'extractText',
      route: '/extract-text-pdf',
      icon: '📝',
      titleKey: 'extractText.title',
      descriptionKey: 'extractText.description',
      color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
    },
    {
      id: 'pdfToImage',
      route: '/pdf-to-image',
      icon: '🖼️',
      titleKey: 'pdfToImage.title',
      descriptionKey: 'pdfToImage.description',
      color: 'bg-red-50 border-red-200 hover:bg-red-100'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('header.title', 'LocalPDF')}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t('header.subtitle', '9 Free PDF Tools • Privacy First • No Upload Required')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <div key={tool.id} className={`rounded-lg border-2 p-6 transition-all duration-200 cursor-pointer ${tool.color}`}>
            <a href={tool.route} className="block">
              <div className="text-4xl mb-4">{tool.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t(tool.titleKey)}
              </h3>
              <p className="text-gray-600">
                {t(tool.descriptionKey)}
              </p>
            </a>
          </div>
        ))}
      </div>
      
      {/* Features Section */}
      <div className="mt-16 bg-gray-50 rounded-xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {t('footer.noDataCollection', 'No data collection')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('footer.localProcessing', 'Local processing only')}
            </p>
          </div>
          <div>
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Fast & Efficient
            </h3>
            <p className="text-gray-600 text-sm">
              Process files instantly in your browser
            </p>
          </div>
          <div>
            <div className="text-3xl mb-3">🆓</div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Completely Free
            </h3>
            <p className="text-gray-600 text-sm">
              No registration or payments required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalizedToolsGrid;