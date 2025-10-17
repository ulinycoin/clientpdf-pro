import React from 'react';
import { useI18n } from '@/hooks/useI18n';
import { POPULAR_TOOLS } from '@/types';
import type { Tool, URLContext } from '@/types';

interface WelcomeScreenProps {
  context: URLContext | null;
  onToolSelect: (tool: Tool) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ context, onToolSelect }) => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-mesh">
      <div className="container-responsive max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gradient-ocean">
            {t('welcome.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t('welcome.subtitle')}
          </p>
        </div>

        {/* First time banner */}
        {context?.isFirstVisit && (
          <div className="card p-6 mb-8 bg-ocean-50 dark:bg-ocean-900/20 border-ocean-200 dark:border-ocean-800 animate-slide-down">
            <p className="text-center text-ocean-700 dark:text-ocean-300">
              {t('welcome.firstTimeBanner')}
            </p>
          </div>
        )}

        {/* Popular tools */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-gray-200">
            {t('welcome.selectTool')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {POPULAR_TOOLS.map((tool, index) => (
              <button
                key={tool}
                onClick={() => onToolSelect(tool)}
                className="card card-hover p-6 text-left transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-ocean-100 dark:bg-ocean-900/30 flex items-center justify-center">
                    <span className="text-2xl">📄</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t(`tools.${tool}.name`)}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t(`tools.${tool}.description`)}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Info text */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 animate-fade-in delay-300">
          <p>Open the sidebar (☰) to see all available tools</p>
        </div>
      </div>
    </div>
  );
};
