import React, { useMemo } from 'react';
import { useTranslation } from '../../hooks/useI18n';
import { useMotionPreferences } from '../../hooks/useAccessibilityPreferences';
import ModernToolCard from '../molecules/ModernToolCard';
import { TOOL_DEFINITIONS, type Tool } from '../../utils/toolsData';


interface ModernToolsGridProps {
  disabledTools?: string[];
  className?: string;
}

const ModernToolsGrid: React.FC<ModernToolsGridProps> = ({
  disabledTools = [],
  className = ''
}) => {
  const { t } = useTranslation();
  const { shouldAnimate } = useMotionPreferences();

  // Organized PDF tools with categories - dynamically generated from central source
  const pdfTools = useMemo<Tool[]>(() => {
    return TOOL_DEFINITIONS.map(toolDef => ({
      ...toolDef,
      title: t(`tools.${toolDef.id}.title`),
      description: t(`tools.${toolDef.id}.description`)
    }));
  }, [t]);

  // Group tools by category
  const toolsByCategory = useMemo(() => {
    return pdfTools.reduce((acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = [];
      }
      acc[tool.category].push(tool);
      return acc;
    }, {} as Record<string, Tool[]>);
  }, [pdfTools]);

  // Memoized disabled tools set for O(1) lookup
  const disabledToolsSet = useMemo(() =>
    new Set(disabledTools),
    [disabledTools]
  );

  // Category titles and descriptions
  const categoryInfo = useMemo(() => ({
    core: {
      title: t('home.tools.categories.core.title'),
      description: t('home.tools.categories.core.description'),
      icon: '🎯'
    },
    advanced: {
      title: t('home.tools.categories.advanced.title'), 
      description: t('home.tools.categories.advanced.description'),
      icon: '🚀'
    },
    conversion: {
      title: t('home.tools.categories.conversion.title'),
      description: t('home.tools.categories.conversion.description'),
      icon: '🔄'
    },
    enhancement: {
      title: t('home.tools.categories.enhancement.title'),
      description: t('home.tools.categories.enhancement.description'),
      icon: '✨'
    }
  }), [t]);

  return (
    <section data-section="tools" className={`py-16 ${className}`} id="tools-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Modern Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gradient-ocean mb-6">
            {t('home.tools.title')}
          </h2>
          <p className="text-xl text-privacy-600 dark:text-privacy-400 max-w-3xl mx-auto leading-relaxed">
            {t('home.tools.subtitle', { count: pdfTools.length })}
          </p>
          
          {/* Floating Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-privacy-900/60 backdrop-blur-lg rounded-full border border-white/20 dark:border-privacy-700/30">
              <div className={`w-2 h-2 rounded-full bg-success-500 ${shouldAnimate ? 'animate-pulse' : ''}`}></div>
              <span className="text-sm font-medium text-privacy-700 dark:text-privacy-300">
                {t('home.tools.trustIndicators.private')}
              </span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-privacy-900/60 backdrop-blur-lg rounded-full border border-white/20 dark:border-privacy-700/30">
              <div className={`w-2 h-2 rounded-full bg-seafoam-500 ${shouldAnimate ? 'animate-pulse' : ''}`} style={{animationDelay: '0.5s'}}></div>
              <span className="text-sm font-medium text-privacy-700 dark:text-privacy-300">
                {t('home.tools.trustIndicators.noUploads')}
              </span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-privacy-900/60 backdrop-blur-lg rounded-full border border-white/20 dark:border-privacy-700/30">
              <div className={`w-2 h-2 rounded-full bg-ocean-500 ${shouldAnimate ? 'animate-pulse' : ''}`} style={{animationDelay: '1s'}}></div>
              <span className="text-sm font-medium text-privacy-700 dark:text-privacy-300">
                {t('home.tools.trustIndicators.unlimited')}
              </span>
            </div>
          </div>
        </div>

        {/* Tools by Category */}
        <div className="space-y-16">
          {Object.entries(toolsByCategory).map(([category, tools], categoryIndex) => (
            <div key={category} className="category-section">
              
              {/* Category Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-seafoam-100 to-ocean-100 dark:from-privacy-800 dark:to-privacy-700 rounded-2xl flex items-center justify-center text-2xl">
                    {categoryInfo[category as keyof typeof categoryInfo].icon}
                  </div>
                  <h3 className="text-2xl font-bold text-privacy-900 dark:text-privacy-100">
                    {categoryInfo[category as keyof typeof categoryInfo].title}
                  </h3>
                </div>
                <p className="text-privacy-600 dark:text-privacy-400 max-w-2xl mx-auto">
                  {categoryInfo[category as keyof typeof categoryInfo].description}
                </p>
              </div>

              {/* Tools Grid */}
              <div className={`
                grid gap-6
                ${tools.length <= 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' :
                  tools.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto' :
                  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}
              `}>
                {tools.map((tool, index) => (
                  <div
                    key={tool.id}
                    className={`
                      ${shouldAnimate ? 'smooth-reveal' : ''}
                    `}
                    style={{ 
                      animationDelay: shouldAnimate ? `${(categoryIndex * 200) + (index * 100)}ms` : undefined 
                    }}
                  >
                    <ModernToolCard
                      title={tool.title}
                      description={tool.description}
                      icon={tool.icon}
                      operationType={tool.operationType}
                      disabled={disabledToolsSet.has(tool.operationType)}
                      featured={tool.featured}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Statistics Section */}
        <div className="mt-20 relative overflow-hidden text-center">
          {/* Modern gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-seafoam-50 via-white to-ocean-50 dark:from-privacy-900 dark:via-privacy-800 dark:to-ocean-900 rounded-2xl" />
          <div className="absolute inset-0 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/30" />
          
          {/* Floating decoration elements */}
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-seafoam-200/20 to-ocean-200/20 rounded-full blur-xl" />
          <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-privacy-200/20 to-seafoam-200/20 rounded-full blur-lg" />
          
          <div className="relative z-10 p-8">
          <h3 className="text-2xl font-bold text-privacy-900 dark:text-privacy-100 mb-8">
            {t('home.tools.whyChoose.title')}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold text-seafoam-600 dark:text-seafoam-400 mb-2">13</div>
              <div className="text-privacy-700 dark:text-privacy-300 font-medium">{t('home.tools.whyChoose.stats.tools')}</div>
              <div className="text-sm text-privacy-500">{t('home.tools.whyChoose.stats.toolsDesc')}</div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-ocean-600 dark:text-ocean-400 mb-2">100%</div>
              <div className="text-privacy-700 dark:text-privacy-300 font-medium">{t('home.tools.whyChoose.stats.privacy')}</div>
              <div className="text-sm text-privacy-500">{t('home.tools.whyChoose.stats.privacyDesc')}</div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-privacy-600 dark:text-privacy-400 mb-2">0</div>
              <div className="text-privacy-700 dark:text-privacy-300 font-medium">{t('home.tools.whyChoose.stats.dataCollection')}</div>
              <div className="text-sm text-privacy-500">{t('home.tools.whyChoose.stats.dataCollectionDesc')}</div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-success-600 dark:text-success-400 mb-2">∞</div>
              <div className="text-privacy-700 dark:text-privacy-300 font-medium">{t('home.tools.whyChoose.stats.usageLimits')}</div>
              <div className="text-sm text-privacy-500">{t('home.tools.whyChoose.stats.usageLimitsDesc')}</div>
            </div>
          </div>

          {/* Privacy Promise */}
          <div className="mt-8 pt-8 border-t border-privacy-200 dark:border-privacy-700">
            <div className="flex items-center justify-center gap-3">
              <svg className="w-6 h-6 text-privacy-accent" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,1L21,5V11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1Z" />
              </svg>
              <span className="text-lg font-semibold text-privacy-800 dark:text-privacy-200">
                {t('home.tools.trustMessage')}
              </span>
            </div>
            <p className="text-privacy-600 dark:text-privacy-400 mt-2 max-w-2xl mx-auto">
              {t('home.tools.whyChoose.description')}
            </p>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernToolsGrid;