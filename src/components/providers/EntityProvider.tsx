// src/components/providers/EntityProvider.tsx
import React, { createContext, useContext, useMemo } from 'react';
import type { EntityContext, EntityDefinition } from '@/types/entities';
import type { SupportedLanguage } from '@/types/i18n';
import { entityHelper } from '@/utils/entityHelpers';

interface EntityProviderProps {
  children: React.ReactNode;
  primaryEntity?: string;
  language: SupportedLanguage;
  searchContext?: EntityContext['searchContext'];
  forceEnglish?: boolean; // Force English-only mode for /pdf-hub routes
}

interface EntityContextValue {
  context: EntityContext | null;
  // Entity helpers
  getLocalizedName: (entityId: string) => string;
  getLocalizedDescription: (entityId: string) => string;
  getSemanticVariants: (entityId: string) => string[];
  generateSemanticContent: (
    entityId: string,
    context: 'title' | 'description' | 'body' | 'meta' | 'heading' | 'alt',
    options?: { includeVariants?: boolean; maxVariants?: number }
  ) => {
    entity: string;
    variants: string[];
    context: string;
    language: SupportedLanguage;
    weight?: number;
  };
  getRelatedContentSuggestions: (entityId: string, limit?: number) => Array<{
    entityId: string;
    name: string;
    description: string;
    relationshipStrength: number;
    suggestedTools: string[];
  }>;
  generateStructuredData: (
    entityId: string,
    additionalProperties?: Record<string, any>
  ) => Record<string, any>;
  generateSemanticKeywords: (
    entityId: string,
    includeRelated?: boolean
  ) => {
    primary: string[];
    secondary: string[];
    longTail: string[];
  };
}

const EntityContext = createContext<EntityContextValue | null>(null);

export const EntityProvider: React.FC<EntityProviderProps> = ({
  children,
  primaryEntity,
  language,
  searchContext = 'tool',
  forceEnglish = false
}) => {
  const contextValue = useMemo<EntityContextValue>(() => {
    // Force English for /pdf-hub routes regardless of user language
    const effectiveLanguage = forceEnglish ? 'en' : language;

    // Create entity context if primary entity is provided
    const context = primaryEntity
      ? entityHelper.createEntityContext(primaryEntity, effectiveLanguage, searchContext)
      : null;

    return {
      context,
      // Bind helper methods with effective language (English for /pdf-hub)
      getLocalizedName: (entityId: string) =>
        entityHelper.getLocalizedName(entityId, effectiveLanguage),

      getLocalizedDescription: (entityId: string) =>
        entityHelper.getLocalizedDescription(entityId, effectiveLanguage),

      getSemanticVariants: (entityId: string) =>
        entityHelper.getSemanticVariants(entityId, effectiveLanguage),

      generateSemanticContent: (
        entityId: string,
        context: 'title' | 'description' | 'body' | 'meta' | 'heading' | 'alt',
        options = {}
      ) => entityHelper.generateSemanticContent(entityId, context, effectiveLanguage, options),

      getRelatedContentSuggestions: (entityId: string, limit = 5) =>
        entityHelper.getRelatedContentSuggestions(entityId, effectiveLanguage, limit),

      generateStructuredData: (
        entityId: string,
        additionalProperties = {}
      ) => entityHelper.generateStructuredData(entityId, effectiveLanguage, additionalProperties),

      generateSemanticKeywords: (
        entityId: string,
        includeRelated = true
      ) => entityHelper.generateSemanticKeywords(entityId, effectiveLanguage, includeRelated)
    };
  }, [primaryEntity, language, searchContext, forceEnglish]);

  return (
    <EntityContext.Provider value={contextValue}>
      {children}
    </EntityContext.Provider>
  );
};

export const useEntityContext = (): EntityContextValue => {
  const context = useContext(EntityContext);
  if (!context) {
    throw new Error('useEntityContext must be used within an EntityProvider');
  }
  return context;
};

// Hook for entity-aware components that don't require the full context
export const useEntity = (entityId?: string) => {
  const entityContext = useContext(EntityContext);

  if (!entityContext) {
    throw new Error('useEntity must be used within an EntityProvider');
  }

  const currentEntityId = entityId || entityContext.context?.currentEntity;

  if (!currentEntityId) {
    return {
      entity: null,
      name: '',
      description: '',
      variants: [],
      relatedSuggestions: [],
      structuredData: {},
      keywords: { primary: [], secondary: [], longTail: [] }
    };
  }

  return {
    entity: currentEntityId,
    name: entityContext.getLocalizedName(currentEntityId),
    description: entityContext.getLocalizedDescription(currentEntityId),
    variants: entityContext.getSemanticVariants(currentEntityId),
    relatedSuggestions: entityContext.getRelatedContentSuggestions(currentEntityId),
    structuredData: entityContext.generateStructuredData(currentEntityId),
    keywords: entityContext.generateSemanticKeywords(currentEntityId)
  };
};