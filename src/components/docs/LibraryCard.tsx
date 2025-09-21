import React from 'react';
import { useTranslation } from '../../hooks/useI18n';

interface Library {
  name: string;
  version: string;
  description: string;
  usage: {
    purpose: string;
    files: string[];
    features: string[];
  };
}

interface LibraryCardProps {
  library: Library;
}

const LibraryCard: React.FC<LibraryCardProps> = ({ library }) => {
  const { t } = useTranslation();

  const getLibraryIcon = (name: string) => {
    const icons: { [key: string]: string } = {
      'pdf-lib': '📄',
      'pdfjs-dist': '🔍',
      'tesseract.js': '👁️',
      'react': '⚛️',
      'mammoth': '📝',
      'xlsx': '📊',
      'jszip': '🗜️',
      'franc': '🌐'
    };
    return icons[name] || '📦';
  };

  const getLibraryColor = (name: string) => {
    const colors: { [key: string]: string } = {
      'pdf-lib': 'from-red-500 to-pink-500',
      'pdfjs-dist': 'from-blue-500 to-indigo-500',
      'tesseract.js': 'from-green-500 to-emerald-500',
      'react': 'from-cyan-500 to-blue-500',
      'mammoth': 'from-purple-500 to-indigo-500',
      'xlsx': 'from-emerald-500 to-teal-500',
      'jszip': 'from-orange-500 to-red-500',
      'franc': 'from-pink-500 to-rose-500'
    };
    return colors[name] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="group bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm border border-white/10 dark:border-gray-700/20 rounded-xl p-6 hover:bg-white/10 dark:hover:bg-gray-800/10 hover:border-seafoam-500/30 transition-all duration-300 hover:scale-105">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-12 h-12 bg-gradient-to-br ${getLibraryColor(library.name)} rounded-xl flex items-center justify-center text-white text-xl shadow-lg mr-4`}>
            {getLibraryIcon(library.name)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-seafoam-600 dark:group-hover:text-seafoam-400 transition-colors">
              {library.name}
            </h3>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded">
              v{library.version}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
        {library.description}
      </p>

      {/* Purpose */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {t('docs.libraries.purpose')}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {library.usage.purpose}
        </p>
      </div>

      {/* Features */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {t('docs.libraries.features')}
        </h4>
        <div className="flex flex-wrap gap-1">
          {library.usage.features.map((feature, index) => (
            <span
              key={index}
              className="text-xs bg-seafoam-100 dark:bg-seafoam-900/20 text-seafoam-700 dark:text-seafoam-300 px-2 py-1 rounded-md"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Files */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {t('docs.libraries.files')}
        </h4>
        <div className="space-y-1">
          {library.usage.files.map((file, index) => (
            <div
              key={index}
              className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded border"
            >
              {file}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LibraryCard;