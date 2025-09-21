import React from 'react';
import { useTranslation } from '../../hooks/useI18n';

interface DocsNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const DocsNavigation: React.FC<DocsNavigationProps> = ({
  activeSection,
  onSectionChange
}) => {
  const { t } = useTranslation();

  const sections = [
    {
      id: 'overview',
      icon: '📋',
      title: t('docs.sections.overview')
    },
    {
      id: 'tools',
      icon: '🛠️',
      title: t('docs.sections.tools')
    },
    {
      id: 'libraries',
      icon: '📚',
      title: t('docs.sections.libraries')
    },
    {
      id: 'architecture',
      icon: '🏗️',
      title: t('docs.sections.architecture')
    },
    {
      id: 'ai-optimization',
      icon: '🤖',
      title: t('docs.sections.aiOptimization')
    },
    {
      id: 'multilingual',
      icon: '🌍',
      title: t('docs.sections.multilingual')
    }
  ];

  return (
    <nav className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 sticky top-8">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        {t('docs.navigation.title')}
      </h3>

      <ul className="space-y-2">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              onClick={() => onSectionChange(section.id)}
              className={`
                w-full flex items-center px-3 py-2 rounded-lg text-left transition-all duration-200
                ${activeSection === section.id
                  ? 'bg-seafoam-500/20 text-seafoam-700 dark:text-seafoam-300 border border-seafoam-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700/20 hover:text-seafoam-600 dark:hover:text-seafoam-400'
                }
              `}
            >
              <span className="text-lg mr-3" role="img" aria-hidden="true">
                {section.icon}
              </span>
              <span className="font-medium text-sm">
                {section.title}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 pt-6 border-t border-white/20 dark:border-gray-700/30">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {t('docs.navigation.quickLinks')}
        </div>
        <div className="space-y-1">
          <a
            href="https://github.com/ulinycoin/clientpdf-pro"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-xs text-gray-600 dark:text-gray-400 hover:text-seafoam-600 dark:hover:text-seafoam-400 transition-colors"
          >
            <span className="mr-2">🔗</span>
            {t('docs.navigation.github')}
          </a>
          <a
            href="https://localpdf.online"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-xs text-gray-600 dark:text-gray-400 hover:text-seafoam-600 dark:hover:text-seafoam-400 transition-colors"
          >
            <span className="mr-2">🌐</span>
            {t('docs.navigation.website')}
          </a>
        </div>
      </div>
    </nav>
  );
};

export default DocsNavigation;