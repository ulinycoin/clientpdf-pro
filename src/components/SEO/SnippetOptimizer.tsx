// src/components/SEO/SnippetOptimizer.tsx
import React from 'react';
import { useEntity } from '@/components/providers/EntityProvider';
import { entityHelper, getEntity } from '@/utils/entityHelpers';

interface SnippetContent {
  type: 'definition' | 'list' | 'steps' | 'table' | 'paragraph';
  content: any;
  priority?: number; // Higher priority = more likely to be featured
}

interface SnippetOptimizerProps {
  entityId?: string;
  targetQuery: string;
  snippetType?: 'definition' | 'howto' | 'comparison' | 'list' | 'table';
  content: {
    title?: string;
    definition?: string;
    steps?: Array<{ title: string; description: string }>;
    listItems?: string[];
    comparison?: Array<{ feature: string; value: string; competitor?: string }>;
    benefits?: string[];
    features?: string[];
  };
  aiOptimized?: boolean;
  voiceSearchOptimized?: boolean;
  className?: string;
}

export const SnippetOptimizer: React.FC<SnippetOptimizerProps> = ({
  entityId,
  targetQuery,
  snippetType = 'definition',
  content,
  aiOptimized = true,
  voiceSearchOptimized = true,
  className = ''
}) => {
  const { entity: contextEntity, language } = useEntity();
  const currentEntity = entityId || contextEntity || 'LocalPDF';
  const currentLanguage = language || 'en';

  const entityName = entityHelper.getLocalizedName(currentEntity, currentLanguage);

  // Generate snippet-optimized content based on type
  const renderSnippetContent = () => {
    switch (snippetType) {
      case 'definition':
        return (
          <div className="snippet-definition">
            <h3 className="text-xl font-semibold mb-3 snippet-question">
              What is {entityName}?
            </h3>
            <div className="snippet-answer bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-base leading-relaxed">
                <strong>{entityName}</strong> {content.definition}
              </p>
              {content.benefits && (
                <ul className="mt-3 space-y-1">
                  {content.benefits.slice(0, 3).map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );

      case 'howto':
        return (
          <div className="snippet-howto">
            <h3 className="text-xl font-semibold mb-4 snippet-question">
              How to use {entityName}
            </h3>
            <div className="snippet-answer">
              {content.steps && (
                <ol className="space-y-3">
                  {content.steps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {step.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                          {step.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="snippet-list">
            <h3 className="text-xl font-semibold mb-3 snippet-question">
              {content.title || `${entityName} Features`}
            </h3>
            <div className="snippet-answer bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              {content.features && (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {content.features.slice(0, 6).map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="snippet-table">
            <h3 className="text-xl font-semibold mb-3 snippet-question">
              {content.title || `${entityName} Comparison`}
            </h3>
            <div className="snippet-answer overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              {content.comparison && (
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Feature</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">{entityName}</th>
                      {content.comparison[0]?.competitor && (
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Others</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {content.comparison.slice(0, 5).map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                          {item.feature}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {item.value}
                        </td>
                        {item.competitor && (
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {item.competitor}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );

      case 'comparison':
        return (
          <div className="snippet-comparison">
            <h3 className="text-xl font-semibold mb-4 snippet-question">
              {entityName} vs Alternatives
            </h3>
            <div className="snippet-answer space-y-4">
              {content.comparison && content.comparison.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.feature}
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                      {entityName}: {item.value}
                    </span>
                    {item.competitor && (
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                        Others: {item.competitor}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Voice search optimization markup
  const VoiceSearchMarkup = () => (
    <>
      {voiceSearchOptimized && (
        <div className="sr-only" aria-hidden="true">
          <span data-voice-query={`what is ${entityName.toLowerCase()}`}>
            {content.definition}
          </span>
          <span data-voice-query={`how to use ${entityName.toLowerCase()}`}>
            {content.steps?.map(step => step.title).join(', ')}
          </span>
          <span data-voice-query={`${entityName.toLowerCase()} features`}>
            {content.features?.join(', ')}
          </span>
        </div>
      )}
    </>
  );

  // AI optimization metadata
  const AIMetadata = () => (
    <>
      {aiOptimized && (
        <div className="sr-only" aria-hidden="true">
          <meta itemProp="name" content={entityName} />
          <meta itemProp="description" content={content.definition} />
          <meta itemProp="category" content="PDF Tools" />
          {content.features && (
            <meta itemProp="features" content={content.features.join(', ')} />
          )}
        </div>
      )}
    </>
  );

  return (
    <section className={`snippet-optimizer ${className}`} itemScope itemType="https://schema.org/Thing">
      <AIMetadata />
      <VoiceSearchMarkup />

      <div className="snippet-content">
        {renderSnippetContent()}
      </div>

      {/* Quick answer format for AI assistants */}
      {aiOptimized && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100">AI Assistant Ready</h4>
              <p className="text-sm text-purple-700 dark:text-purple-200 mt-1">
                This content is optimized for ChatGPT, Claude, and other AI assistants.
                <span className="block mt-1 font-medium">Ask: "{targetQuery}"</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SnippetOptimizer;