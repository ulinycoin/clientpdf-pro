// src/types/entities.ts
import type { SupportedLanguage } from './i18n';

export type EntityType = 'Product' | 'Service' | 'Concept' | 'Technology' | 'Organization' | 'Industry' | 'Use Case';

export type SearchIntent = 'informational' | 'navigational' | 'transactional' | 'commercial';

export interface AIOptimizationConfig {
  featuredSnippetTargets: string[];
  conversationalQueries: string[];
  voiceSearchOptimizations: string[];
  knowledgeGraphSignals?: string[];
  entityMentions?: string[];
  contextualKeywords?: string[];
}

export interface EntityDefinition {
  id: string;
  name: string;
  type: EntityType;
  description: string;
  relatedEntities: string[];
  wikipediaLink?: string;
  wikiDataId?: string;
  semanticVariants: string[];
  schema: Record<string, any>;
  toolMapping?: string[]; // Which tools relate to this entity
  searchIntent: SearchIntent;
  authorityLevel: 'primary' | 'secondary' | 'supporting'; // Entity importance in domain
  knowledgeGraphId?: string; // Google Knowledge Graph entity ID
  localizedNames?: Record<SupportedLanguage, string>;
  localizedDescriptions?: Record<SupportedLanguage, string>;
  localizedVariants?: Record<SupportedLanguage, string[]>;
  aiOptimization?: AIOptimizationConfig; // NEW: AI search optimization data
}

export interface TopicCluster {
  id: string;
  name: string;
  primaryEntity: string; // Main entity ID
  relatedEntities: string[];
  primaryTools: string[];
  semanticVariants: string[];
  searchIntent: SearchIntent;
  authorityPage: string; // URL path to authority content
  keywords: string[];
  difficulty: 'low' | 'medium' | 'high'; // Competition level
  priority: 'critical' | 'high' | 'medium' | 'low';
  localizedContent?: Record<SupportedLanguage, {
    title: string;
    description: string;
    keywords: string[];
  }>;
}

export interface EntityContext {
  currentEntity?: string;
  relatedEntities: string[];
  currentCluster?: string;
  language: SupportedLanguage;
  searchContext?: 'homepage' | 'tool' | 'authority' | 'blog';
}

export interface SemanticContent {
  entity: string;
  variants: string[];
  context: 'title' | 'description' | 'body' | 'meta' | 'heading' | 'alt';
  language: SupportedLanguage;
  weight?: number; // Semantic importance (0-1)
}

export interface EntityRelationship {
  fromEntity: string;
  toEntity: string;
  relationship: 'isPartOf' | 'relatesTo' | 'competesWith' | 'enabledBy' | 'requires' | 'complementedBy';
  strength: number; // 0-1, semantic relationship strength
}

export interface AIOptimizedContent {
  type: 'faq' | 'howto' | 'comparison' | 'definition' | 'workflow';
  entities: string[];
  structuredData: Record<string, any>;
  conversationalQueries: string[];
  voiceSearchOptimized: boolean;
  featuredSnippetTargets: string[];
}

export interface EntityPerformanceMetrics {
  entityId: string;
  impressions: number;
  clicks: number;
  avgPosition: number;
  featuredSnippets: number;
  voiceSearchCaptures: number;
  knowledgeGraphAppearances: number;
  semanticRankings: Record<string, number>; // Query -> position
}

// Re-export SupportedLanguage for convenience
export type { SupportedLanguage };