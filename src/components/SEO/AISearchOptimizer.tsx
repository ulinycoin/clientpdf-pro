// src/components/SEO/AISearchOptimizer.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useEntity } from '@/components/providers/EntityProvider';
import { entityHelper, getEntity } from '@/utils/entityHelpers';

interface AISearchOptimizerProps {
  entityId?: string;
  toolId?: string;
  title: string;
  description: string;
  canonicalUrl?: string;
  content?: {
    sections?: Array<{
      heading: string;
      content: string;
      type?: 'definition' | 'howto' | 'comparison' | 'benefit';
    }>;
    faqs?: Array<{
      question: string;
      answer: string;
    }>;
    keyFeatures?: string[];
    useCases?: string[];
  };
  aiOptimizations?: {
    enableSnippetTargeting?: boolean;
    enableVoiceSearch?: boolean;
    enableConversationalAI?: boolean;
    includeKnowledgeGraph?: boolean;
  };
}

export const AISearchOptimizer: React.FC<AISearchOptimizerProps> = ({
  entityId,
  toolId,
  title,
  description,
  canonicalUrl,
  content,
  aiOptimizations = {
    enableSnippetTargeting: true,
    enableVoiceSearch: true,
    enableConversationalAI: true,
    includeKnowledgeGraph: true
  }
}) => {
  const { entity: contextEntity, language: contextLanguage } = useEntity();
  const currentEntity = entityId || contextEntity || 'LocalPDF';
  const currentLanguage = contextLanguage || 'en';

  // Generate AI-optimized structured data
  const generateAIStructuredData = () => {
    const structuredDataArray: any[] = [];

    // 1. Enhanced WebPage/SoftwareApplication Schema
    const webPageSchema = {
      '@context': 'https://schema.org',
      '@type': ['WebPage', 'SoftwareApplication'],
      'name': title,
      'description': description,
      'url': canonicalUrl,
      'applicationCategory': 'DocumentManagement',
      'operatingSystem': 'Web Browser',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      },
      'featureList': content?.keyFeatures || [
        'Privacy-first PDF processing',
        'Browser-based operation',
        'No file uploads required',
        'Multiple format support'
      ],
      'audience': {
        '@type': 'Audience',
        'audienceType': ['Professionals', 'Students', 'Businesses', 'Individuals']
      }
    };

    // Add knowledge graph connections if enabled
    if (aiOptimizations.includeKnowledgeGraph) {
      const entityData = getEntity(currentEntity);
      if (entityData?.wikiDataId) {
        webPageSchema['sameAs'] = [`https://www.wikidata.org/wiki/${entityData.wikiDataId}`];
        if (entityData.wikipediaLink) {
          webPageSchema['sameAs'].push(entityData.wikipediaLink);
        }
      }
    }

    structuredDataArray.push(webPageSchema);

    // 2. FAQ Schema optimized for featured snippets
    if (content?.faqs && content.faqs.length > 0) {
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': content.faqs.map(faq => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer,
            'inLanguage': currentLanguage
          }
        }))
      };
      structuredDataArray.push(faqSchema);
    }

    // 3. How-To Schema for tool pages
    if (toolId && content?.sections) {
      const howToSteps = content.sections
        .filter(section => section.type === 'howto')
        .map((section, index) => ({
          '@type': 'HowToStep',
          'position': index + 1,
          'name': section.heading,
          'text': section.content
        }));

      if (howToSteps.length > 0) {
        const howToSchema = {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          'name': `How to use ${title}`,
          'description': description,
          'step': howToSteps,
          'tool': [{
            '@type': 'HowToTool',
            'name': title
          }],
          'totalTime': 'PT2M'
        };
        structuredDataArray.push(howToSchema);
      }
    }

    // 4. Article Schema for content pages
    if (content?.sections && content.sections.length > 0) {
      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': title,
        'description': description,
        'author': {
          '@type': 'Organization',
          'name': 'LocalPDF',
          'url': 'https://localpdf.online'
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'LocalPDF',
          'url': 'https://localpdf.online'
        },
        'dateModified': new Date().toISOString(),
        'datePublished': new Date().toISOString(),
        'inLanguage': currentLanguage,
        'about': {
          '@type': 'Thing',
          'name': entityHelper.getLocalizedName(currentEntity, currentLanguage)
        }
      };
      structuredDataArray.push(articleSchema);
    }

    // 5. Organization Schema with enhanced AI signals
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'LocalPDF',
      'url': 'https://localpdf.online',
      'description': 'Privacy-first browser-based PDF toolkit for document manipulation and conversion',
      'foundingDate': '2024',
      'specialty': ['PDF Processing', 'Document Management', 'Privacy-First Software', 'Browser-Based Tools'],
      'knowsAbout': [
        'PDF manipulation',
        'Document conversion',
        'Privacy protection',
        'Browser-based processing',
        'Client-side computing',
        'GDPR compliance'
      ],
      'areaServed': 'Worldwide',
      'serviceType': 'Software as a Service'
    };
    structuredDataArray.push(organizationSchema);

    return structuredDataArray;
  };

  // Generate AI-specific meta tags
  const generateAIMetaTags = () => {
    const aiOptimizedContent = entityHelper.getAIOptimizedContent(currentEntity, currentLanguage);
    const semanticKeywords = entityHelper.generateSemanticKeywords(currentEntity, currentLanguage);

    return {
      // Enhanced meta descriptions for AI understanding
      'description': description,
      'keywords': [...semanticKeywords.primary, ...semanticKeywords.secondary].join(', '),

      // AI-specific tags
      'ai:topic': entityHelper.getLocalizedName(currentEntity, currentLanguage),
      'ai:category': 'PDF Tools',
      'ai:use-cases': content?.useCases?.join(', ') || 'Document processing, File conversion, PDF manipulation',

      // Voice search optimization
      'voice-search-queries': aiOptimizedContent.voiceSearchTargets.join(' | '),

      // Featured snippet targeting
      'snippet-targets': aiOptimizedContent.featuredSnippetQueries.join(' | '),

      // Entity markup for AI understanding
      'entity:name': entityHelper.getLocalizedName(currentEntity, currentLanguage),
      'entity:type': getEntity(currentEntity)?.type || 'Product',

      // Conversational AI optimization
      'conversational-queries': aiOptimizedContent.conversationalQueries.join(' | ')
    };
  };

  const structuredData = generateAIStructuredData();
  const aiMetaTags = generateAIMetaTags();

  return (
    <Helmet>
      {/* AI-optimized meta tags */}
      {Object.entries(aiMetaTags).map(([name, content]) => (
        <meta key={name} name={name} content={content} />
      ))}

      {/* Enhanced robots directives for AI crawlers */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

      {/* AI search engine specific tags */}
      <meta name="chatgpt-plugin" content="true" />
      <meta name="ai-content-type" content="tool-documentation" />
      <meta name="ai-interaction-type" content="informational,transactional" />

      {/* Enhanced Open Graph for AI social sharing */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="LocalPDF - AI-Optimized PDF Tools" />
      <meta property="article:section" content="PDF Tools" />
      <meta property="article:tag" content={aiMetaTags.keywords} />

      {/* Twitter Card enhancements for AI */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:label1" content="Category" />
      <meta name="twitter:data1" content="PDF Tools" />
      <meta name="twitter:label2" content="Use Cases" />
      <meta name="twitter:data2" content={content?.useCases?.join(', ') || 'Document Processing'} />

      {/* Structured data for AI understanding */}
      {structuredData.map((schema, index) => (
        <script key={`ai-schema-${index}`} type="application/ld+json">
          {JSON.stringify(schema, null, 0)}
        </script>
      ))}

      {/* AI accessibility enhancements */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#3B82F6" />

      {/* Performance hints for AI crawlers */}
      <link rel="preconnect" href="https://localpdf.online" />
      <link rel="dns-prefetch" href="//localpdf.online" />
    </Helmet>
  );
};

export default AISearchOptimizer;