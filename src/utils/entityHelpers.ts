// src/utils/entityHelpers.ts
import type {
  EntityDefinition,
  TopicCluster,
  EntityContext,
  SemanticContent,
  EntityRelationship,
  SupportedLanguage
} from '@/types/entities';
import {
  CORE_ENTITIES,
  TOPIC_CLUSTERS,
  ENTITY_RELATIONSHIPS,
  getEntity,
  getRelatedEntities,
  getEntitiesForTool,
  getTopicClustersForEntity
} from '@/data/entities';

/**
 * Entity-aware content generation utilities
 */

export class EntityHelper {
  private static instance: EntityHelper;

  static getInstance(): EntityHelper {
    if (!EntityHelper.instance) {
      EntityHelper.instance = new EntityHelper();
    }
    return EntityHelper.instance;
  }

  /**
   * Get semantic variants for an entity in a specific language
   */
  getSemanticVariants(entityId: string, language: SupportedLanguage): string[] {
    const entity = getEntity(entityId);
    if (!entity) return [];

    // Combine base variants with localized variants
    const baseVariants = entity.semanticVariants || [];
    const localizedVariants = entity.localizedVariants?.[language] || [];

    return [...baseVariants, ...localizedVariants];
  }

  /**
   * Get localized entity name
   */
  getLocalizedName(entityId: string, language: SupportedLanguage): string {
    const entity = getEntity(entityId);
    if (!entity) return entityId;

    return entity.localizedNames?.[language] || entity.name;
  }

  /**
   * Get localized entity description
   */
  getLocalizedDescription(entityId: string, language: SupportedLanguage): string {
    const entity = getEntity(entityId);
    if (!entity) return '';

    return entity.localizedDescriptions?.[language] || entity.description;
  }

  /**
   * Generate semantic content for a given context
   */
  generateSemanticContent(
    entityId: string,
    context: SemanticContent['context'],
    language: SupportedLanguage,
    options: {
      includeVariants?: boolean;
      maxVariants?: number;
      preferRecent?: boolean;
    } = {}
  ): SemanticContent {
    const { includeVariants = true, maxVariants = 3 } = options;

    const variants = includeVariants
      ? this.getSemanticVariants(entityId, language).slice(0, maxVariants)
      : [this.getLocalizedName(entityId, language)];

    return {
      entity: entityId,
      variants,
      context,
      language,
      weight: this.calculateSemanticWeight(entityId, context)
    };
  }

  /**
   * Calculate semantic weight based on entity authority and context
   */
  private calculateSemanticWeight(entityId: string, context: SemanticContent['context']): number {
    const entity = getEntity(entityId);
    if (!entity) return 0.1;

    // Base weight from authority level
    let weight = entity.authorityLevel === 'primary' ? 0.9 :
                 entity.authorityLevel === 'secondary' ? 0.7 : 0.5;

    // Context modifiers
    const contextModifiers = {
      'title': 1.0,
      'meta': 0.9,
      'heading': 0.8,
      'description': 0.7,
      'body': 0.6,
      'alt': 0.4
    };

    return Math.min(weight * (contextModifiers[context] || 0.5), 1.0);
  }

  /**
   * Get best entity for a tool page
   */
  getPrimaryEntityForTool(toolId: string): string | null {
    const entities = getEntitiesForTool(toolId);

    // Find primary authority entity first
    const primaryEntity = entities.find(e => e.authorityLevel === 'primary');
    if (primaryEntity) return primaryEntity.id;

    // Fall back to secondary
    const secondaryEntity = entities.find(e => e.authorityLevel === 'secondary');
    if (secondaryEntity) return secondaryEntity.id;

    // Fall back to any entity
    return entities[0]?.id || null;
  }

  /**
   * Get topic cluster for a tool
   */
  getTopicClusterForTool(toolId: string): TopicCluster | null {
    const cluster = Object.values(TOPIC_CLUSTERS).find(cluster =>
      cluster.primaryTools.includes(toolId)
    );
    return cluster || null;
  }

  /**
   * Generate related content suggestions
   */
  getRelatedContentSuggestions(
    currentEntityId: string,
    language: SupportedLanguage,
    limit: number = 5
  ): Array<{
    entityId: string;
    name: string;
    description: string;
    relationshipStrength: number;
    suggestedTools: string[];
  }> {
    const relatedEntities = getRelatedEntities(currentEntityId);

    return relatedEntities
      .map(entity => {
        const relationship = this.getRelationshipStrength(currentEntityId, entity.id);
        return {
          entityId: entity.id,
          name: this.getLocalizedName(entity.id, language),
          description: this.getLocalizedDescription(entity.id, language),
          relationshipStrength: relationship,
          suggestedTools: entity.toolMapping || []
        };
      })
      .sort((a, b) => b.relationshipStrength - a.relationshipStrength)
      .slice(0, limit);
  }

  /**
   * Get relationship strength between two entities
   */
  private getRelationshipStrength(fromEntityId: string, toEntityId: string): number {
    const relationship = ENTITY_RELATIONSHIPS.find(rel =>
      (rel.fromEntity === fromEntityId && rel.toEntity === toEntityId) ||
      (rel.fromEntity === toEntityId && rel.toEntity === fromEntityId)
    );

    return relationship?.strength || 0.1;
  }

  /**
   * Generate entity context for a page
   */
  createEntityContext(
    primaryEntityId: string,
    language: SupportedLanguage,
    searchContext: EntityContext['searchContext'] = 'tool'
  ): EntityContext {
    const relatedEntities = getRelatedEntities(primaryEntityId).map(e => e.id);
    const topicClusters = getTopicClustersForEntity(primaryEntityId);
    const currentCluster = topicClusters[0]?.id;

    return {
      currentEntity: primaryEntityId,
      relatedEntities,
      currentCluster,
      language,
      searchContext
    };
  }

  /**
   * Generate Schema.org structured data for an entity
   */
  generateStructuredData(
    entityId: string,
    language: SupportedLanguage,
    additionalProperties: Record<string, any> = {}
  ): Record<string, any> {
    const entity = getEntity(entityId);
    if (!entity) return {};

    const baseSchema = {
      '@context': 'https://schema.org',
      ...entity.schema,
      'name': this.getLocalizedName(entityId, language),
      'description': this.getLocalizedDescription(entityId, language),
      'inLanguage': language,
      ...additionalProperties
    };

    // Add knowledge graph identifiers if available
    if (entity.wikiDataId) {
      (baseSchema as any).sameAs = [`https://www.wikidata.org/wiki/${entity.wikiDataId}`];
      if (entity.wikipediaLink) {
        (baseSchema as any).sameAs.push(entity.wikipediaLink);
      }
    }

    return baseSchema;
  }

  /**
   * Generate FAQ schema optimized for AI search
   */
  generateFAQSchema(
    entityId: string,
    language: SupportedLanguage,
    questions: Array<{ question: string; answer: string }>
  ): Record<string, any> {
    const entity = getEntity(entityId);
    if (!entity) return {};

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'about': {
        '@type': entity.schema['@type'] || 'Thing',
        'name': this.getLocalizedName(entityId, language)
      },
      'mainEntity': questions.map(qa => ({
        '@type': 'Question',
        'name': qa.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': qa.answer
        }
      }))
    };
  }

  /**
   * Generate How-to schema for tool pages
   */
  generateHowToSchema(
    entityId: string,
    toolId: string,
    language: SupportedLanguage,
    steps: Array<{ name: string; text: string; image?: string }>
  ): Record<string, any> {
    const entity = getEntity(entityId);
    if (!entity) return {};

    const toolName = this.getLocalizedName(entityId, language);

    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      'name': `How to use ${toolName}`,
      'description': this.getLocalizedDescription(entityId, language),
      'tool': [{
        '@type': 'HowToTool',
        'name': toolName
      }],
      'step': steps.map((step, index) => ({
        '@type': 'HowToStep',
        'position': index + 1,
        'name': step.name,
        'text': step.text,
        ...(step.image && { 'image': step.image })
      }))
    };
  }

  /**
   * Get AI-optimized content suggestions
   */
  getAIOptimizedContent(
    entityId: string,
    language: SupportedLanguage
  ): {
    conversationalQueries: string[];
    voiceSearchTargets: string[];
    featuredSnippetQueries: string[];
  } {
    const entity = getEntity(entityId);
    if (!entity) return { conversationalQueries: [], voiceSearchTargets: [], featuredSnippetQueries: [] };

    const variants = this.getSemanticVariants(entityId, language);
    const name = this.getLocalizedName(entityId, language);

    return {
      conversationalQueries: [
        `What is ${name}?`,
        `How does ${name} work?`,
        `Why use ${name}?`,
        `Best ${name} practices`,
        `${name} vs alternatives`
      ],
      voiceSearchTargets: [
        `How to ${variants[0]}`,
        `What's the best way to ${variants[0]}`,
        `Can I ${variants[0]} for free`,
        `${name} tutorial`,
        `${name} guide`
      ],
      featuredSnippetQueries: [
        `${name} definition`,
        `${name} benefits`,
        `${name} features`,
        `How ${name} works`,
        `${name} use cases`
      ]
    };
  }

  /**
   * Generate semantic keywords for content optimization
   */
  generateSemanticKeywords(
    entityId: string,
    language: SupportedLanguage,
    includeRelated: boolean = true
  ): {
    primary: string[];
    secondary: string[];
    longTail: string[];
  } {
    const entity = getEntity(entityId);
    if (!entity) return { primary: [], secondary: [], longTail: [] };

    const variants = this.getSemanticVariants(entityId, language);
    const name = this.getLocalizedName(entityId, language);

    const primary = [name, ...variants.slice(0, 2)];

    const secondary = includeRelated
      ? getRelatedEntities(entityId).flatMap(e =>
          this.getSemanticVariants(e.id, language).slice(0, 1)
        )
      : [];

    const longTail = [
      `best ${name}`,
      `free ${name}`,
      `${name} online`,
      `${name} tool`,
      `how to ${variants[0]}`,
      `${name} guide`,
      `${name} tutorial`
    ];

    return { primary, secondary, longTail };
  }

  /**
   * Generate AI-specific structured data for multiple schema types
   */
  generateAdvancedAISchema(
    entityId: string,
    language: SupportedLanguage,
    options: {
      includeConversationalSchema?: boolean;
      includeVoiceSearchSchema?: boolean;
      includeFeaturedSnippetSchema?: boolean;
      includeKnowledgeGraphSignals?: boolean;
    } = {}
  ): Record<string, any>[] {
    const {
      includeConversationalSchema = true,
      includeVoiceSearchSchema = true,
      includeFeaturedSnippetSchema = true,
      includeKnowledgeGraphSignals = true
    } = options;

    const entity = getEntity(entityId);
    if (!entity) return [];

    const schemas: Record<string, any>[] = [];
    const aiContent = this.getAIOptimizedContent(entityId, language);
    const name = this.getLocalizedName(entityId, language);
    const description = this.getLocalizedDescription(entityId, language);

    // Enhanced Organization Schema with AI signals
    if (includeKnowledgeGraphSignals) {
      const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'LocalPDF',
        'alternateName': ['Local PDF', 'LocalPDF.online'],
        'description': 'Privacy-first browser-based PDF toolkit for document manipulation and conversion',
        'url': 'https://localpdf.online',
        'knowsAbout': [
          'PDF processing',
          'Document conversion',
          'Privacy-first software',
          'Browser-based tools',
          'Client-side processing',
          'GDPR compliance'
        ],
        'specialty': entity.semanticVariants,
        'areaServed': 'Worldwide',
        'serviceType': 'Software as a Service',
        'applicationCategory': 'DocumentManagement'
      };
      schemas.push(organizationSchema);
    }

    // Conversational AI Schema
    if (includeConversationalSchema && aiContent.conversationalQueries.length > 0) {
      const conversationalSchema = {
        '@context': 'https://schema.org',
        '@type': 'QAPage',
        'mainEntity': {
          '@type': 'Question',
          'name': aiContent.conversationalQueries[0],
          'answerCount': 1,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': description,
            'author': {
              '@type': 'Organization',
              'name': 'LocalPDF'
            }
          }
        },
        'potentialAction': {
          '@type': 'AskAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': 'https://localpdf.online?q={query}',
            'actionPlatform': ['ChatGPT', 'Claude', 'Bard']
          }
        }
      };
      schemas.push(conversationalSchema);
    }

    // Voice Search Optimization Schema
    if (includeVoiceSearchSchema && aiContent.voiceSearchTargets.length > 0) {
      const voiceSearchSchema = {
        '@context': 'https://schema.org',
        '@type': 'SpeakableSpecification',
        'cssSelector': '.voice-optimized-content',
        'xpath': ['//*[@data-voice-query]']
      };
      schemas.push(voiceSearchSchema);
    }

    // Featured Snippet Targeting Schema
    if (includeFeaturedSnippetSchema && aiContent.featuredSnippetQueries.length > 0) {
      const snippetSchema = {
        '@context': 'https://schema.org',
        '@type': 'DefinedTerm',
        'name': name,
        'description': description,
        'inDefinedTermSet': {
          '@type': 'DefinedTermSet',
          'name': 'PDF Processing Terminology',
          'hasDefinedTerm': aiContent.featuredSnippetQueries.map(query => ({
            '@type': 'DefinedTerm',
            'name': query,
            'description': `Information about ${query.toLowerCase()}`
          }))
        }
      };
      schemas.push(snippetSchema);
    }

    return schemas;
  }

  /**
   * Generate conversation-ready content for AI assistants
   */
  generateConversationalContent(
    entityId: string,
    language: SupportedLanguage,
    userIntent: 'definition' | 'howto' | 'comparison' | 'recommendation' = 'definition'
  ): {
    directAnswer: string;
    followUpQuestions: string[];
    relatedTopics: string[];
    actionableSteps?: string[];
  } {
    const entity = getEntity(entityId);
    if (!entity) {
      return {
        directAnswer: 'Information not available.',
        followUpQuestions: [],
        relatedTopics: []
      };
    }

    const name = this.getLocalizedName(entityId, language);
    const description = this.getLocalizedDescription(entityId, language);
    const relatedEntities = getRelatedEntities(entityId);

    let directAnswer = '';
    const followUpQuestions: string[] = [];
    const relatedTopics = relatedEntities.map(e => this.getLocalizedName(e.id, language));
    let actionableSteps: string[] | undefined;

    switch (userIntent) {
      case 'definition':
        directAnswer = `${name} is ${description.toLowerCase()}. It offers privacy-first, browser-based processing without requiring file uploads.`;
        followUpQuestions.push(
          `How does ${name} work?`,
          `What are the benefits of ${name}?`,
          `Is ${name} free to use?`
        );
        break;

      case 'howto':
        directAnswer = `To use ${name}, simply visit the website and upload your files. All processing happens locally in your browser for maximum privacy.`;
        actionableSteps = [
          'Visit LocalPDF.online',
          'Select the appropriate tool',
          'Upload your PDF file',
          'Configure settings if needed',
          'Process and download results'
        ];
        followUpQuestions.push(
          `What file formats does ${name} support?`,
          `Are there any file size limits?`,
          `How secure is ${name}?`
        );
        break;

      case 'comparison':
        directAnswer = `${name} stands out by offering completely client-side processing, ensuring your documents never leave your device. Unlike cloud-based alternatives, it provides true privacy protection.`;
        followUpQuestions.push(
          `What makes ${name} different?`,
          `Which is better: ${name} or cloud alternatives?`,
          `What are the pros and cons of ${name}?`
        );
        break;

      case 'recommendation':
        directAnswer = `I recommend ${name} if you prioritize privacy and security. It's ideal for sensitive documents since all processing happens locally in your browser.`;
        followUpQuestions.push(
          `What types of documents work best with ${name}?`,
          `Who should use ${name}?`,
          `When is ${name} the best choice?`
        );
        break;
    }

    return {
      directAnswer,
      followUpQuestions,
      relatedTopics,
      actionableSteps
    };
  }

  /**
   * Generate voice search optimized content
   */
  generateVoiceSearchContent(
    entityId: string,
    language: SupportedLanguage
  ): {
    quickAnswers: Record<string, string>;
    conversationalPhrases: string[];
    questionVariations: string[];
  } {
    const entity = getEntity(entityId);
    if (!entity) {
      return {
        quickAnswers: {},
        conversationalPhrases: [],
        questionVariations: []
      };
    }

    const name = this.getLocalizedName(entityId, language);
    const description = this.getLocalizedDescription(entityId, language);
    const aiContent = this.getAIOptimizedContent(entityId, language);

    const quickAnswers: Record<string, string> = {
      [`what is ${name.toLowerCase()}`]: `${name} is ${description.toLowerCase()}`,
      [`how to use ${name.toLowerCase()}`]: `To use ${name}, visit the website and upload your files for local processing.`,
      [`is ${name.toLowerCase()} free`]: `Yes, ${name} is completely free to use with no registration required.`,
      [`${name.toLowerCase()} privacy`]: `${name} processes files locally in your browser, ensuring complete privacy.`
    };

    const conversationalPhrases = [
      `tell me about ${name.toLowerCase()}`,
      `explain ${name.toLowerCase()}`,
      `what can I do with ${name.toLowerCase()}`,
      `help me with ${name.toLowerCase()}`
    ];

    const questionVariations = [
      ...aiContent.conversationalQueries,
      ...aiContent.voiceSearchTargets,
      `okay google, what is ${name.toLowerCase()}`,
      `hey siri, how do I use ${name.toLowerCase()}`,
      `alexa, tell me about ${name.toLowerCase()}`
    ];

    return {
      quickAnswers,
      conversationalPhrases,
      questionVariations
    };
  }
}

// Export singleton instance
export const entityHelper = EntityHelper.getInstance();

// Convenience exports
export {
  getEntity,
  getRelatedEntities,
  getEntitiesForTool,
  getTopicClustersForEntity,
  CORE_ENTITIES,
  TOPIC_CLUSTERS,
  ENTITY_RELATIONSHIPS
};