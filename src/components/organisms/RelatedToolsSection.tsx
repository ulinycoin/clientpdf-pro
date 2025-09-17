import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useI18n';
import { useLocalizedPath } from '../../hooks/useLocalizedPath';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface RelatedTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  estimatedTime?: string;
}

interface RelatedToolsSectionProps {
  currentTool: string;
  className?: string;
}

const RelatedToolsSection: React.FC<RelatedToolsSectionProps> = ({
  currentTool,
  className = ''
}) => {
  const { t } = useTranslation();
  const getLocalizedPath = useLocalizedPath();

  // Логика определения связанных инструментов
  const getRelatedTools = (toolId: string): RelatedTool[] => {
    const allTools: Record<string, RelatedTool> = {
      'merge-pdf': {
        id: 'merge-pdf',
        title: t('tools.merge.title'),
        description: t('tools.merge.description'),
        icon: '🔗',
        href: getLocalizedPath('/merge-pdf'),
        estimatedTime: '~1 мин'
      },
      'split-pdf': {
        id: 'split-pdf',
        title: t('tools.split.title'),
        description: t('tools.split.description'),
        icon: '✂️',
        href: getLocalizedPath('/split-pdf'),
        estimatedTime: '~2 мин'
      },
      'compress-pdf': {
        id: 'compress-pdf',
        title: t('tools.compress.title'),
        description: t('tools.compress.description'),
        icon: '🗜️',
        href: getLocalizedPath('/compress-pdf'),
        estimatedTime: '~1 мин'
      },
      'rotate-pdf': {
        id: 'rotate-pdf',
        title: t('tools.rotate.title'),
        description: t('tools.rotate.description'),
        icon: '🔄',
        href: getLocalizedPath('/rotate-pdf'),
        estimatedTime: '<1 мин'
      },
      'watermark-pdf': {
        id: 'watermark-pdf',
        title: t('tools.watermark.title'),
        description: t('tools.watermark.description'),
        icon: '🔐',
        href: getLocalizedPath('/watermark-pdf'),
        estimatedTime: '~2 мин'
      },
      'add-text-pdf': {
        id: 'add-text-pdf',
        title: t('tools.addText.title'),
        description: t('tools.addText.description'),
        icon: '📝',
        href: getLocalizedPath('/add-text-pdf'),
        estimatedTime: '~3 мин'
      },
      'extract-pages-pdf': {
        id: 'extract-pages-pdf',
        title: t('tools.extractPages.title'),
        description: t('tools.extractPages.description'),
        icon: '📄',
        href: getLocalizedPath('/extract-pages-pdf'),
        estimatedTime: '~2 мин'
      },
      'extract-text-pdf': {
        id: 'extract-text-pdf',
        title: t('tools.extractText.title'),
        description: t('tools.extractText.description'),
        icon: '📋',
        href: getLocalizedPath('/extract-text-pdf'),
        estimatedTime: '~1 мин'
      },
      'ocr-pdf': {
        id: 'ocr-pdf',
        title: t('tools.ocr.title'),
        description: t('tools.ocr.description'),
        icon: '📷',
        href: getLocalizedPath('/ocr-pdf'),
        estimatedTime: '~4 мин'
      },
      'pdf-to-image': {
        id: 'pdf-to-image',
        title: t('tools.pdfToImage.title'),
        description: t('tools.pdfToImage.description'),
        icon: '🖼️',
        href: getLocalizedPath('/pdf-to-image'),
        estimatedTime: '~2 мин'
      },
      'images-to-pdf': {
        id: 'images-to-pdf',
        title: t('tools.imageToPdf.title'),
        description: t('tools.imageToPdf.description'),
        icon: '📸',
        href: getLocalizedPath('/images-to-pdf'),
        estimatedTime: '~2 мин'
      },
      'word-to-pdf': {
        id: 'word-to-pdf',
        title: t('tools.wordToPdf.title'),
        description: t('tools.wordToPdf.description'),
        icon: '📄',
        href: getLocalizedPath('/word-to-pdf'),
        estimatedTime: '~2 мин'
      },
      'excel-to-pdf': {
        id: 'excel-to-pdf',
        title: t('tools.excelToPdf.title'),
        description: t('tools.excelToPdf.description'),
        icon: '📊',
        href: getLocalizedPath('/excel-to-pdf'),
        estimatedTime: '~3 мин'
      }
    };

    // Логика группировки связанных инструментов
    const relatedGroups: Record<string, string[]> = {
      'merge-pdf': ['split-pdf', 'compress-pdf', 'rotate-pdf', 'watermark-pdf'],
      'split-pdf': ['merge-pdf', 'extract-pages-pdf', 'compress-pdf', 'rotate-pdf'],
      'compress-pdf': ['merge-pdf', 'split-pdf', 'watermark-pdf', 'rotate-pdf'],
      'rotate-pdf': ['merge-pdf', 'split-pdf', 'compress-pdf', 'watermark-pdf'],
      'watermark-pdf': ['add-text-pdf', 'compress-pdf', 'rotate-pdf', 'merge-pdf'],
      'add-text-pdf': ['watermark-pdf', 'merge-pdf', 'rotate-pdf', 'compress-pdf'],
      'extract-pages-pdf': ['split-pdf', 'merge-pdf', 'extract-text-pdf', 'compress-pdf'],
      'extract-text-pdf': ['ocr-pdf', 'extract-pages-pdf', 'split-pdf', 'pdf-to-image'],
      'ocr-pdf': ['extract-text-pdf', 'pdf-to-image', 'add-text-pdf', 'watermark-pdf'],
      'pdf-to-image': ['images-to-pdf', 'ocr-pdf', 'extract-text-pdf', 'compress-pdf'],
      'images-to-pdf': ['pdf-to-image', 'merge-pdf', 'compress-pdf', 'watermark-pdf'],
      'word-to-pdf': ['excel-to-pdf', 'merge-pdf', 'compress-pdf', 'watermark-pdf'],
      'excel-to-pdf': ['word-to-pdf', 'merge-pdf', 'compress-pdf', 'add-text-pdf']
    };

    const relatedIds = relatedGroups[toolId] || Object.keys(allTools).filter(id => id !== toolId).slice(0, 4);
    return relatedIds.map(id => allTools[id]).filter(Boolean);
  };

  const relatedTools = getRelatedTools(currentTool);

  if (relatedTools.length === 0) return null;

  return (
    <section className={`py-16 bg-gradient-to-br from-blue-50/30 via-white/80 to-cyan-50/30 dark:from-gray-900/50 dark:via-gray-800/50 dark:to-gray-700/50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            🔗 {t('relatedTools.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('relatedTools.subtitle')}
          </p>
        </div>

        {/* Tools Grid - Horizontal Scroll */}
        <div className="relative">
          {/* Scroll Container */}
          <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory scroll-smooth">
            {relatedTools.map((tool, index) => (
              <Link
                key={tool.id}
                to={tool.href}
                className="group min-w-[280px] sm:min-w-[320px] snap-start"
              >
                <div className="h-full bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] group-hover:border-blue-300 dark:group-hover:border-blue-600 p-6">
                  
                  {/* Tool Icon & Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 rounded-xl flex items-center justify-center text-2xl border border-blue-200/20 dark:border-blue-700/30">
                      {tool.icon}
                    </div>
                    {tool.estimatedTime && (
                      <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 text-green-700 dark:text-green-300 rounded-full border border-green-200/20 dark:border-green-700/30">
                        {tool.estimatedTime}
                      </span>
                    )}
                  </div>

                  {/* Tool Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2">
                      {tool.description}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    <span>{t('relatedTools.tryTool')}</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Free Badge */}
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      ✨ {t('relatedTools.free')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Scroll Indicators (optional) */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('relatedTools.scrollHint')}
              </span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <Link
            to={getLocalizedPath("/#tools-section")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span>{t('relatedTools.viewAll')}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default RelatedToolsSection;