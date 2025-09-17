import React from 'react';
import { Link } from 'react-router-dom';
import { relatedTools, toolsSEOData } from '../../data/seoData';
import { useI18n } from '../../hooks/useI18n';

interface RelatedToolsProps {
  currentTool: string;
  className?: string;
}

interface ToolInfo {
  name: string;
  title: string;
  description: string;
  path: string;
  icon: string;
}

export const RelatedTools: React.FC<RelatedToolsProps> = ({
  currentTool,
  className = ''
}) => {
  const { t } = useI18n();

  const getToolInfo = (toolKey: string): ToolInfo => {
    const toolData = toolsSEOData[toolKey as keyof typeof toolsSEOData];

    const toolIcons: Record<string, string> = {
      merge: '📄',
      split: '✂️',
      compress: '🗜️',
      addText: '✍️',
      watermark: '🏷️',
      rotate: '🔄',
      extractPages: '📑',
      extractText: '📝',
      pdfToImage: '🖼️',
      'word-to-pdf': '📄',
      'excel-to-pdf': '📊',
      'images-to-pdf': '🖼️'
    };

    const toolPaths: Record<string, string> = {
      merge: '/merge-pdf',
      split: '/split-pdf',
      compress: '/compress-pdf',
      addText: '/add-text-pdf',
      watermark: '/watermark-pdf',
      rotate: '/rotate-pdf',
      extractPages: '/extract-pages-pdf',
      extractText: '/extract-text-pdf',
      pdfToImage: '/pdf-to-image',
      'word-to-pdf': '/word-to-pdf',
      'excel-to-pdf': '/excel-to-pdf',
      'images-to-pdf': '/images-to-pdf'
    };

    return {
      name: t(`components.relatedTools.toolNames.${toolKey}` as any) || toolKey,
      title: toolData?.title.split(' - ')[0] || t(`components.relatedTools.toolNames.${toolKey}` as any),
      description: t(`components.relatedTools.toolDescriptions.${toolKey}` as any) || 'PDF processing tool',
      path: toolPaths[toolKey] || `/${toolKey}`,
      icon: toolIcons[toolKey] || '🔧'
    };
  };

  const getActionText = (fromTool: string, toTool: string): string => {
    // Try to get the specific action text for this tool combination
    const actionKey = `components.relatedTools.actions.${fromTool}.${toTool}` as any;
    const actionText = t(actionKey);

    // If no specific action text exists, return a generic one
    if (actionKey === actionText) {
      return t(`components.relatedTools.toolNames.${toTool}` as any) || `use ${toTool} tool`;
    }

    return actionText;
  };

  const related = relatedTools[currentTool as keyof typeof relatedTools];

  if (!related || related.length === 0) {
    return null;
  }

  return (
    <section className={`bg-gray-50 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('components.relatedTools.title')}
      </h3>
      <p className="text-gray-600 mb-4">
        {t('components.relatedTools.subtitle')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {related.map((toolKey) => {
          const tool = getToolInfo(toolKey);
          const actionText = getActionText(currentTool, toolKey);

          return (
            <Link
              key={toolKey}
              to={tool.path}
              className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
              aria-label={`Go to ${tool.name} tool`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl flex-shrink-0" role="img" aria-label={tool.name}>
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {tool.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {actionText}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Call-to-action for more tools */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('components.relatedTools.viewAllTools')}
        </Link>
      </div>
    </section>
  );
};

export default RelatedTools;
