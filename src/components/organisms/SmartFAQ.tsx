// src/components/organisms/SmartFAQ.tsx
import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useEntity } from '@/components/providers/EntityProvider';
import { SemanticContent } from '@/components/molecules/SemanticContent';
import { entityHelper } from '@/utils/entityHelpers';
import { useI18n } from '@/hooks/useI18n';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  searchKeywords?: string[];
  voiceOptimized?: boolean;
  aiSnippetTarget?: boolean;
}

interface SmartFAQProps {
  baseFAQs?: FAQItem[];
  entityId?: string;
  maxItems?: number;
  showSearch?: boolean;
  showCategories?: boolean;
  enableVoiceSearch?: boolean;
  className?: string;
}

export const SmartFAQ: React.FC<SmartFAQProps> = ({
  baseFAQs = [],
  entityId,
  maxItems = 10,
  showSearch = true,
  showCategories = true,
  enableVoiceSearch = true,
  className = ""
}) => {
  const { t, currentLanguage } = useI18n();
  const { entity, name, description } = useEntity();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const currentEntity = entityId || entity || 'LocalPDF';

  // Generate AI-optimized FAQ content
  const aiOptimizedContent = useMemo(() => {
    if (!currentEntity) return null;
    return entityHelper.getAIOptimizedContent(currentEntity, currentLanguage);
  }, [currentEntity, currentLanguage]);

  // Enhanced FAQ items with AI optimization
  const enhancedFAQs = useMemo((): FAQItem[] => {
    // If we have baseFAQs, prioritize them over AI-generated content
    if (baseFAQs.length > 0) {
      return baseFAQs;
    }

    const aiQuestions: FAQItem[] = aiOptimizedContent ? [
      // Conversational queries for voice search
      ...aiOptimizedContent.conversationalQueries.map((query, index) => ({
        id: `ai-conversational-${index}`,
        question: query,
        answer: description || `${name} provides comprehensive functionality for your PDF processing needs.`,
        category: 'General',
        voiceOptimized: true,
        aiSnippetTarget: true,
        searchKeywords: [currentEntity, 'general', 'overview']
      })),

      // Voice search targets
      ...aiOptimizedContent.voiceSearchTargets.map((target, index) => ({
        id: `ai-voice-${index}`,
        question: target,
        answer: `To ${target.toLowerCase().replace('how to ', '').replace('what\'s the best way to ', '')}, use ${name} which offers a privacy-first, browser-based solution that processes files locally without uploading to servers.`,
        category: 'How-to',
        voiceOptimized: true,
        searchKeywords: ['how-to', 'tutorial', 'guide']
      })),

      // Featured snippet targets
      ...aiOptimizedContent.featuredSnippetQueries.map((snippet, index) => ({
        id: `ai-snippet-${index}`,
        question: snippet,
        answer: generateSnippetAnswer(snippet, currentEntity, name, description),
        category: 'Definitions',
        aiSnippetTarget: true,
        searchKeywords: ['definition', 'explanation', 'features']
      }))
    ] : [];

    // Combine with base FAQs
    const allFAQs = [...baseFAQs, ...aiQuestions];

    // Remove duplicates and limit items
    const uniqueFAQs = allFAQs.filter((faq, index, self) =>
      index === self.findIndex(f => f.question.toLowerCase() === faq.question.toLowerCase())
    );

    return uniqueFAQs.slice(0, maxItems);
  }, [baseFAQs, aiOptimizedContent, currentEntity, name, description, maxItems]);

  // Filter FAQs based on search and category
  const filteredFAQs = useMemo(() => {
    let filtered = enhancedFAQs;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.searchKeywords?.some(keyword => keyword.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [enhancedFAQs, searchQuery, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = enhancedFAQs.map(faq => faq.category).filter(Boolean);
    return Array.from(new Set(cats));
  }, [enhancedFAQs]);

  // Generate FAQ Schema for search engines
  const faqSchema = useMemo(() => {
    return entityHelper.generateFAQSchema(
      currentEntity,
      currentLanguage,
      filteredFAQs.map(faq => ({
        question: faq.question,
        answer: faq.answer
      }))
    );
  }, [currentEntity, currentLanguage, filteredFAQs]);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <section className={`smart-faq ${className}`}>
      {/* SEO Schema */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          <SemanticContent
            entity={currentEntity}
            context="heading"
            fallback="Frequently Asked Questions"
            maxVariants={1}
          />
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          <SemanticContent
            entity={currentEntity}
            context="description"
            fallback="Find answers to common questions about our PDF tools"
            maxVariants={1}
          />
        </p>
      </div>

      {/* Search and Filters */}
      {(showSearch || showCategories) && (
        <div className="mb-8 space-y-4">
          {/* Search */}
          {showSearch && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          )}

          {/* Categories */}
          {showCategories && categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !selectedCategory
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No FAQs found matching your criteria.</p>
          </div>
        ) : (
          filteredFAQs.map((faq) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              isExpanded={expandedItems.has(faq.id)}
              onToggle={() => toggleExpanded(faq.id)}
              entityId={currentEntity}
            />
          ))
        )}
      </div>

      {/* Voice Search Hint */}
      {enableVoiceSearch && (
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="text-blue-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Voice Search Optimized</h4>
              <p className="text-sm text-blue-700 dark:text-blue-200">
                Try asking: "How to {name?.toLowerCase()}" or "What is {name}?"
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// Individual FAQ Item Component
const FAQItem: React.FC<{
  faq: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
  entityId: string;
}> = ({ faq, isExpanded, onToggle, entityId }) => {
  return (
    <div
      className={`border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-all duration-200 ${
        faq.aiSnippetTarget ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {faq.question}
            </h3>
            {faq.category && (
              <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                {faq.category}
              </span>
            )}
            {faq.voiceOptimized && (
              <span className="inline-block mt-1 ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                Voice Optimized
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
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {/* Direct FAQ content display - semantic context preserved via data attributes */}
            <div className="semantic-faq-content" data-entity={entityId} data-context="faq-answer">
              <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to generate snippet answers
function generateSnippetAnswer(query: string, entityId: string, name?: string, description?: string): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('definition') || lowerQuery.includes('what is')) {
    return description || `${name} is a comprehensive PDF processing tool.`;
  }

  if (lowerQuery.includes('benefits') || lowerQuery.includes('advantages')) {
    return `${name} offers privacy-first processing, browser-based operation, and comprehensive PDF functionality without uploading files to servers.`;
  }

  if (lowerQuery.includes('features')) {
    return `${name} includes PDF merging, splitting, compression, text extraction, OCR, and format conversion - all processed locally in your browser.`;
  }

  if (lowerQuery.includes('how') && lowerQuery.includes('works')) {
    return `${name} works entirely in your browser using advanced JavaScript libraries to process PDF files locally, ensuring your documents never leave your device.`;
  }

  if (lowerQuery.includes('use cases')) {
    return `${name} is ideal for document management, file organization, business workflows, academic research, and any scenario requiring secure PDF processing.`;
  }

  return description || `${name} provides comprehensive PDF processing capabilities.`;
}

export default SmartFAQ;