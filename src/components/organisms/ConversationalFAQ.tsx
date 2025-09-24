// src/components/organisms/ConversationalFAQ.tsx
import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useEntity } from '@/components/providers/EntityProvider';
import { entityHelper, getEntity } from '@/utils/entityHelpers';
import { SnippetOptimizer } from '@/components/SEO/SnippetOptimizer';

interface ConversationalFAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  conversationalQueries?: string[];
  voiceOptimized: boolean;
  snippetOptimized: boolean;
  aiAssistantReady: boolean;
  followUpQuestions?: string[];
  relatedTopics?: string[];
  actionableSteps?: string[];
}

interface ConversationalFAQProps {
  entityId?: string;
  maxItems?: number;
  aiOptimized?: boolean;
  conversationalMode?: boolean;
  className?: string;
}

export const ConversationalFAQ: React.FC<ConversationalFAQProps> = ({
  entityId,
  maxItems = 12,
  aiOptimized = true,
  conversationalMode = true,
  className = ""
}) => {
  const { entity: contextEntity } = useEntity();
  const currentEntity = entityId || contextEntity || 'LocalPDF';
  const currentLanguage = 'en'; // Since we're using English-only for /pdf-hub
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  // Generate enhanced conversational FAQ content
  const conversationalFAQs = useMemo((): ConversationalFAQItem[] => {
    const entityData = getEntity(currentEntity);
    if (!entityData) return [];

    const aiContent = entityHelper.getAIOptimizedContent(currentEntity, currentLanguage);
    const voiceContent = entityHelper.generateVoiceSearchContent(currentEntity, currentLanguage);
    const name = entityHelper.getLocalizedName(currentEntity, currentLanguage);

    const faqs: ConversationalFAQItem[] = [];

    // Definition-focused FAQs
    const definitionContent = entityHelper.generateConversationalContent(
      currentEntity,
      currentLanguage,
      'definition'
    );
    faqs.push({
      id: 'definition',
      question: `What is ${name}?`,
      answer: definitionContent.directAnswer,
      category: 'Definition',
      conversationalQueries: [`tell me about ${name.toLowerCase()}`, `explain ${name.toLowerCase()}`],
      voiceOptimized: true,
      snippetOptimized: true,
      aiAssistantReady: true,
      followUpQuestions: definitionContent.followUpQuestions,
      relatedTopics: definitionContent.relatedTopics
    });

    // How-to focused FAQs
    const howtoContent = entityHelper.generateConversationalContent(
      currentEntity,
      currentLanguage,
      'howto'
    );
    faqs.push({
      id: 'howto',
      question: `How do I use ${name}?`,
      answer: howtoContent.directAnswer,
      category: 'How-to',
      conversationalQueries: [`how to use ${name.toLowerCase()}`, `${name.toLowerCase()} tutorial`],
      voiceOptimized: true,
      snippetOptimized: true,
      aiAssistantReady: true,
      followUpQuestions: howtoContent.followUpQuestions,
      relatedTopics: howtoContent.relatedTopics,
      actionableSteps: howtoContent.actionableSteps
    });

    // Comparison focused FAQs
    const comparisonContent = entityHelper.generateConversationalContent(
      currentEntity,
      currentLanguage,
      'comparison'
    );
    faqs.push({
      id: 'comparison',
      question: `How does ${name} compare to alternatives?`,
      answer: comparisonContent.directAnswer,
      category: 'Comparison',
      conversationalQueries: [`${name.toLowerCase()} vs competitors`, `best ${name.toLowerCase()} alternative`],
      voiceOptimized: true,
      snippetOptimized: true,
      aiAssistantReady: true,
      followUpQuestions: comparisonContent.followUpQuestions,
      relatedTopics: comparisonContent.relatedTopics
    });

    // Recommendation focused FAQs
    const recommendationContent = entityHelper.generateConversationalContent(
      currentEntity,
      currentLanguage,
      'recommendation'
    );
    faqs.push({
      id: 'recommendation',
      question: `Should I use ${name}?`,
      answer: recommendationContent.directAnswer,
      category: 'Recommendation',
      conversationalQueries: [`should I use ${name.toLowerCase()}`, `is ${name.toLowerCase()} good`],
      voiceOptimized: true,
      snippetOptimized: true,
      aiAssistantReady: true,
      followUpQuestions: recommendationContent.followUpQuestions,
      relatedTopics: recommendationContent.relatedTopics
    });

    // Privacy and Security FAQ
    faqs.push({
      id: 'privacy',
      question: `Is ${name} secure and private?`,
      answer: `Yes, ${name} is completely secure and private. All processing happens locally in your browser, which means your documents never leave your device. Unlike cloud-based alternatives, there's no risk of data breaches or unauthorized access to your files.`,
      category: 'Privacy',
      conversationalQueries: [`is ${name.toLowerCase()} safe`, `${name.toLowerCase()} privacy policy`, `${name.toLowerCase()} security`],
      voiceOptimized: true,
      snippetOptimized: true,
      aiAssistantReady: true,
      followUpQuestions: [
        'How does local processing work?',
        'What data does LocalPDF collect?',
        'Is LocalPDF GDPR compliant?'
      ],
      relatedTopics: ['GDPR Compliance', 'Client-Side Processing', 'Privacy-First Software']
    });

    // Cost and Accessibility FAQ
    faqs.push({
      id: 'cost',
      question: `Is ${name} free to use?`,
      answer: `Yes, ${name} is completely free to use with no registration required, no file limits, and no hidden costs. You can access all features directly in your web browser without creating an account or providing personal information.`,
      category: 'Pricing',
      conversationalQueries: [`is ${name.toLowerCase()} free`, `${name.toLowerCase()} cost`, `${name.toLowerCase()} price`],
      voiceOptimized: true,
      snippetOptimized: true,
      aiAssistantReady: true,
      followUpQuestions: [
        'Are there any premium features?',
        'Do I need to create an account?',
        'Are there file size limitations?'
      ],
      relatedTopics: ['Free PDF Tools', 'No Registration Required']
    });

    return faqs.slice(0, maxItems);
  }, [currentEntity, currentLanguage, maxItems]);

  // Generate advanced AI schema for the FAQ
  const aiSchemas = useMemo(() => {
    if (!aiOptimized) return [];
    return entityHelper.generateAdvancedAISchema(currentEntity, currentLanguage);
  }, [currentEntity, currentLanguage, aiOptimized]);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const startConversation = (faqId: string) => {
    setActiveConversation(faqId);
    setExpandedItems(new Set([faqId]));
  };

  return (
    <section className={`conversational-faq ${className}`}>
      {/* Enhanced SEO Schema */}
      <Helmet>
        {/* Standard FAQ Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': conversationalFAQs.map(faq => ({
              '@type': 'Question',
              'name': faq.question,
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer,
                'author': {
                  '@type': 'Organization',
                  'name': 'LocalPDF'
                }
              }
            }))
          })}
        </script>

        {/* Advanced AI Schemas */}
        {aiSchemas.map((schema, index) => (
          <script key={`ai-schema-${index}`} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}

        {/* Voice Search Optimization */}
        <meta name="voice-search-optimized" content="true" />
        <meta name="conversational-ai-ready" content="true" />
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Frequently Asked Questions
        </h2>
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            AI Assistant Ready
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            Voice Search Optimized
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            Featured Snippet Targets
          </div>
        </div>
      </div>

      {/* Conversational Mode Toggle */}
      {conversationalMode && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">💬 Conversational Mode</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Ask questions naturally - this content is optimized for AI assistants like ChatGPT, Claude, and voice search.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded">ChatGPT</span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 rounded">Claude</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded">Voice</span>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Items */}
      <div className="space-y-4">
        {conversationalFAQs.map((faq) => (
          <ConversationalFAQItem
            key={faq.id}
            faq={faq}
            isExpanded={expandedItems.has(faq.id)}
            onToggle={() => toggleExpanded(faq.id)}
            onStartConversation={() => startConversation(faq.id)}
            isActiveConversation={activeConversation === faq.id}
            conversationalMode={conversationalMode}
            entityId={currentEntity}
          />
        ))}
      </div>

      {/* AI Assistant Integration Hint */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100">ChatGPT Ready</h4>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Copy any question above and paste it into ChatGPT for detailed, context-aware answers about LocalPDF.
          </p>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h4 className="font-medium text-purple-900 dark:text-purple-100">Voice Search</h4>
          </div>
          <p className="text-sm text-purple-800 dark:text-purple-200">
            Try asking your voice assistant: "What is LocalPDF?" or "How do I use LocalPDF?"
          </p>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-green-900 dark:text-green-100">Search Optimized</h4>
          </div>
          <p className="text-sm text-green-800 dark:text-green-200">
            These answers are optimized to appear in Google's featured snippets and answer boxes.
          </p>
        </div>
      </div>
    </section>
  );
};

// Individual FAQ Item Component
const ConversationalFAQItem: React.FC<{
  faq: ConversationalFAQItem;
  isExpanded: boolean;
  onToggle: () => void;
  onStartConversation: () => void;
  isActiveConversation: boolean;
  conversationalMode: boolean;
  entityId: string;
}> = ({ faq, isExpanded, onToggle, onStartConversation, isActiveConversation, conversationalMode, entityId }) => {
  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-all duration-200 ${
      isActiveConversation ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
    } ${faq.snippetOptimized ? 'bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10' : 'bg-white dark:bg-gray-800'}`}>

      {/* Voice Search Hidden Markup */}
      <div className="sr-only voice-optimized-content" itemScope itemType="https://schema.org/Question">
        <h3 itemProp="name">{faq.question}</h3>
        <div itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
          <div itemProp="text">{faq.answer}</div>
        </div>
        {faq.conversationalQueries?.map((query, index) => (
          <span key={index} data-voice-query={query}>{faq.answer}</span>
        ))}
      </div>

      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
              {faq.question}
              <div className="flex items-center ml-3 space-x-1">
                {faq.voiceOptimized && (
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full" title="Voice Search Optimized"></span>
                )}
                {faq.snippetOptimized && (
                  <span className="inline-block w-2 h-2 bg-purple-400 rounded-full" title="Featured Snippet Target"></span>
                )}
                {faq.aiAssistantReady && (
                  <span className="inline-block w-2 h-2 bg-blue-400 rounded-full" title="AI Assistant Ready"></span>
                )}
              </div>
            </h3>
            {faq.category && (
              <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                {faq.category}
              </span>
            )}
          </div>
          <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
          <div className="prose prose-sm max-w-none dark:prose-invert mb-4">
            <p>{faq.answer}</p>
          </div>

          {/* Action Steps */}
          {faq.actionableSteps && faq.actionableSteps.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Quick Steps:</h4>
              <ol className="space-y-1">
                {faq.actionableSteps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-2 flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Follow-up Questions */}
          {faq.followUpQuestions && faq.followUpQuestions.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Related Questions:</h4>
              <div className="flex flex-wrap gap-2">
                {faq.followUpQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    onClick={() => {}}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversational Mode Features */}
          {conversationalMode && isActiveConversation && (
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">💬 Ask AI Assistants</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                  <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Copy for ChatGPT/Claude:</h5>
                  <code className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded block text-gray-800 dark:text-gray-200">
                    "{faq.question}"
                  </code>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                  <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Voice Search Query:</h5>
                  <code className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded block text-gray-800 dark:text-gray-200">
                    "Hey Google, {faq.conversationalQueries?.[0] || faq.question.toLowerCase()}"
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConversationalFAQ;