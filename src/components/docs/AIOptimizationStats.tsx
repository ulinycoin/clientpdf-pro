import React from 'react';
import { useTranslation } from '../../hooks/useI18n';

interface AIOptimizationStatsProps {
  stats: {
    crawlerStats: {
      chatGPT: string;
      yandex: string;
      google: string;
      apple: string;
      others: string;
    };
    features: string[];
    totalIndexedPages: number;
    indexingSuccess: string;
    aiTrafficDominant: boolean;
  };
}

const AIOptimizationStats: React.FC<AIOptimizationStatsProps> = ({ stats }) => {
  const { t } = useTranslation();

  const crawlerData = [
    {
      name: 'ChatGPT',
      percentage: stats.crawlerStats.chatGPT,
      color: 'from-green-500 to-emerald-500',
      icon: '🤖'
    },
    {
      name: 'Yandex',
      percentage: stats.crawlerStats.yandex,
      color: 'from-red-500 to-pink-500',
      icon: '🔍'
    },
    {
      name: 'Google',
      percentage: stats.crawlerStats.google,
      color: 'from-blue-500 to-cyan-500',
      icon: '🌐'
    },
    {
      name: 'Apple',
      percentage: stats.crawlerStats.apple,
      color: 'from-gray-500 to-gray-600',
      icon: '🍎'
    },
    {
      name: 'Others',
      percentage: stats.crawlerStats.others,
      color: 'from-purple-500 to-indigo-500',
      icon: '📊'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Overview */}
      <div>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          {t('docs.aiOptimization.description')}
        </p>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 rounded-xl border border-green-500/20">
            <div className="text-3xl mb-3">📄</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.totalIndexedPages}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('docs.aiOptimization.stats.indexedPages')}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6 rounded-xl border border-blue-500/20">
            <div className="text-3xl mb-3">✅</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.indexingSuccess}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('docs.aiOptimization.stats.successRate')}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-xl border border-purple-500/20">
            <div className="text-3xl mb-3">🤖</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.aiTrafficDominant ? 'Yes' : 'No'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('docs.aiOptimization.stats.aiDominant')}
            </div>
          </div>
        </div>
      </div>

      {/* Crawler Statistics */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {t('docs.aiOptimization.crawlerStats.title')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {crawlerData.map((crawler, index) => (
            <div
              key={index}
              className="bg-white/5 dark:bg-gray-800/5 p-4 rounded-lg border border-white/10 hover:bg-white/10 dark:hover:bg-gray-800/10 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`w-8 h-8 bg-gradient-to-br ${crawler.color} rounded-lg flex items-center justify-center text-white text-sm mr-3`}>
                    {crawler.icon}
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {crawler.name}
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {crawler.percentage}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${crawler.color} transition-all duration-500`}
                  style={{ width: crawler.percentage }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Optimization Features */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {t('docs.aiOptimization.features.title')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start bg-white/5 dark:bg-gray-800/5 p-4 rounded-lg border border-white/10"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-full flex items-center justify-center text-white text-xs mr-3 mt-0.5 flex-shrink-0">
                ✓
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI-First Approach Info */}
      <div className="bg-gradient-to-br from-seafoam-500/10 to-ocean-500/10 p-6 rounded-xl border border-seafoam-500/20">
        <h3 className="text-xl font-bold text-seafoam-700 dark:text-seafoam-300 mb-4">
          {t('docs.aiOptimization.approach.title')}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          {t('docs.aiOptimization.approach.description')}
        </p>
        <div className="flex items-center text-sm text-seafoam-600 dark:text-seafoam-400">
          <span className="mr-2">💡</span>
          {t('docs.aiOptimization.approach.tip')}
        </div>
      </div>
    </div>
  );
};

export default AIOptimizationStats;