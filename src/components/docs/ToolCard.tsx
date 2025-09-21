import React from 'react';
import { useTranslation, useI18n } from '../../hooks/useI18n';

interface Tool {
  name: string;
  slug: string;
  description: string;
  multilingual: boolean;
  techStack: string[];
  file: string;
  path: string;
}

interface DocsToolCardProps {
  tool: Tool;
}

const DocsToolCard: React.FC<DocsToolCardProps> = ({ tool }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();

  const getToolIcon = (slug: string) => {
    const icons: { [key: string]: string } = {
      'merge-pdf': '🔗',
      'split-pdf': '✂️',
      'compress-pdf': '🗜️',
      'add-text-pdf': '✏️',
      'watermark-pdf': '🏷️',
      'rotate-pdf': '🔄',
      'extract-pages-pdf': '📑',
      'extract-text-pdf': '📝',
      'ocr-pdf': '👁️',
      'pdf-to-image': '🖼️',
      'images-to-pdf': '📁',
      'word-to-pdf': '📄',
      'excel-to-pdf': '📊',
      'pdf-to-svg': '🎨',
      'extract-images-from-pdf': '🖼️',
      'protect-pdf': '🔒'
    };
    return icons[slug] || '📄';
  };

  const getToolColor = (slug: string) => {
    const colors: { [key: string]: string } = {
      'merge-pdf': 'from-blue-500 to-cyan-500',
      'split-pdf': 'from-red-500 to-pink-500',
      'compress-pdf': 'from-green-500 to-emerald-500',
      'add-text-pdf': 'from-purple-500 to-indigo-500',
      'watermark-pdf': 'from-orange-500 to-yellow-500',
      'rotate-pdf': 'from-teal-500 to-green-500',
      'extract-pages-pdf': 'from-indigo-500 to-purple-500',
      'extract-text-pdf': 'from-pink-500 to-rose-500',
      'ocr-pdf': 'from-emerald-500 to-teal-500',
      'pdf-to-image': 'from-cyan-500 to-blue-500',
      'images-to-pdf': 'from-yellow-500 to-orange-500',
      'word-to-pdf': 'from-blue-600 to-indigo-600',
      'excel-to-pdf': 'from-green-600 to-emerald-600',
      'pdf-to-svg': 'from-purple-600 to-pink-600',
      'extract-images-from-pdf': 'from-rose-500 to-pink-500',
      'protect-pdf': 'from-gray-600 to-gray-700'
    };
    return colors[slug] || 'from-gray-500 to-gray-600';
  };

  const toolUrl = currentLanguage === 'en' ? `/${tool.slug}` : `/${currentLanguage}/${tool.slug}`;

  return (
    <div className="group bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm border border-white/10 dark:border-gray-700/20 rounded-xl p-6 hover:bg-white/10 dark:hover:bg-gray-800/10 hover:border-seafoam-500/30 transition-all duration-300 hover:scale-105">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-12 h-12 bg-gradient-to-br ${getToolColor(tool.slug)} rounded-xl flex items-center justify-center text-white text-xl shadow-lg mr-4`}>
            {getToolIcon(tool.slug)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-seafoam-600 dark:group-hover:text-seafoam-400 transition-colors">
              {tool.name}
            </h3>
            <div className="flex items-center mt-1">
              {tool.multilingual && (
                <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded-md mr-2">
                  {t('docs.tools.multilingual')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
        {tool.description}
      </p>

      {/* Tech Stack */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {t('docs.tools.techStack')}
        </h4>
        <div className="flex flex-wrap gap-1">
          {tool.techStack.map((tech, index) => (
            <span
              key={index}
              className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* File Path */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {t('docs.tools.implementation')}
        </h4>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded border">
          {tool.path}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10 dark:border-gray-700/20">
        <a
          href={toolUrl}
          className="inline-flex items-center text-sm font-medium text-seafoam-600 dark:text-seafoam-400 hover:text-seafoam-700 dark:hover:text-seafoam-300 transition-colors"
        >
          <span className="mr-1">🔗</span>
          {t('docs.tools.tryTool')}
        </a>

        <div className="flex items-center space-x-3">
          <a
            href={`https://github.com/ulinycoin/clientpdf-pro/blob/main/${tool.path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {t('docs.tools.viewSource')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default DocsToolCard;