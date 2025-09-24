// src/data/entities.ts
import type { EntityDefinition, TopicCluster, EntityRelationship } from '@/types/entities';

// Core entities that define LocalPDF's semantic identity
export const CORE_ENTITIES: Record<string, EntityDefinition> = {
  LocalPDF: {
    id: 'LocalPDF',
    name: 'LocalPDF',
    type: 'Product',
    description: 'Privacy-first browser-based PDF toolkit for document manipulation and conversion',
    relatedEntities: ['PDFProcessing', 'PrivacyFirstSoftware', 'BrowserBasedTools', 'DocumentManagement'],
    wikiDataId: 'Q7834516', // PDF software category
    semanticVariants: ['LocalPDF', 'Local PDF', 'PDF tools', 'browser PDF editor', 'client-side PDF'],
    schema: {
      '@type': 'SoftwareApplication',
      'name': 'LocalPDF',
      'applicationCategory': 'DocumentManagement',
      'operatingSystem': 'Web Browser',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      }
    },
    toolMapping: ['merge-pdf', 'split-pdf', 'compress-pdf', 'watermark-pdf', 'rotate-pdf', 'extract-pages-pdf', 'extract-text-pdf', 'add-text-pdf', 'word-to-pdf', 'excel-to-pdf', 'images-to-pdf', 'pdf-to-image', 'ocr-pdf'],
    searchIntent: 'navigational',
    authorityLevel: 'primary',
    localizedNames: {
      en: 'LocalPDF',
      de: 'LocalPDF',
      fr: 'LocalPDF',
      es: 'LocalPDF',
      ru: 'LocalPDF'
    },
    localizedDescriptions: {
      en: 'Privacy-first browser-based PDF toolkit for document manipulation and conversion',
      de: 'Datenschutzorientiertes browserbasiertes PDF-Toolkit für Dokumentenbearbeitung und -konvertierung',
      fr: 'Boîte à outils PDF basée sur navigateur axée sur la confidentialité pour la manipulation et conversion de documents',
      es: 'Kit de herramientas PDF basado en navegador centrado en privacidad para manipulación y conversión de documentos',
      ru: 'Инструментарий PDF с акцентом на конфиденциальность для обработки и преобразования документов'
    }
  },

  PDFProcessing: {
    id: 'PDFProcessing',
    name: 'PDF Processing',
    type: 'Concept',
    description: 'Digital document manipulation, conversion, and optimization techniques',
    relatedEntities: ['DocumentManagement', 'FileConversion', 'LocalPDF', 'BrowserBasedTools'],
    wikipediaLink: 'https://en.wikipedia.org/wiki/PDF',
    wikiDataId: 'Q42332',
    semanticVariants: ['PDF processing', 'PDF manipulation', 'document processing', 'PDF editing', 'PDF tools'],
    schema: {
      '@type': 'DefinedTerm',
      'name': 'PDF Processing',
      'description': 'The manipulation and transformation of Portable Document Format files'
    },
    searchIntent: 'informational',
    authorityLevel: 'primary',
    localizedVariants: {
      en: ['PDF processing', 'PDF manipulation', 'document processing', 'PDF editing'],
      de: ['PDF-Verarbeitung', 'PDF-Bearbeitung', 'Dokumentverarbeitung', 'PDF-Tools'],
      fr: ['traitement PDF', 'manipulation PDF', 'traitement de documents', 'édition PDF'],
      es: ['procesamiento PDF', 'manipulación PDF', 'procesamiento de documentos', 'edición PDF'],
      ru: ['обработка PDF', 'редактирование PDF', 'работа с PDF', 'PDF инструменты']
    }
  },

  DocumentManagement: {
    id: 'DocumentManagement',
    name: 'Document Management',
    type: 'Concept',
    description: 'Systematic organization, storage, and processing of digital documents',
    relatedEntities: ['PDFProcessing', 'EnterpriseWorkflow', 'DigitalTransformation'],
    wikipediaLink: 'https://en.wikipedia.org/wiki/Document_management_system',
    wikiDataId: 'Q1233832',
    semanticVariants: ['document management', 'document workflow', 'file organization', 'document system'],
    schema: {
      '@type': 'DefinedTerm',
      'name': 'Document Management',
      'description': 'The systematic organization and control of documents throughout their lifecycle'
    },
    searchIntent: 'commercial',
    authorityLevel: 'secondary'
  },

  PrivacyFirstSoftware: {
    id: 'PrivacyFirstSoftware',
    name: 'Privacy-First Software',
    type: 'Concept',
    description: 'Software designed with privacy protection as the primary consideration',
    relatedEntities: ['LocalPDF', 'GDPRCompliance', 'ClientSideProcessing', 'DataProtection'],
    semanticVariants: ['privacy-first software', 'privacy-focused tools', 'secure software', 'privacy by design'],
    schema: {
      '@type': 'DefinedTerm',
      'name': 'Privacy-First Software',
      'description': 'Software applications that prioritize user privacy and data protection'
    },
    searchIntent: 'commercial',
    authorityLevel: 'primary',
    localizedVariants: {
      en: ['privacy-first software', 'privacy-focused tools', 'secure software', 'privacy by design'],
      de: ['datenschutzorientierte Software', 'sichere Software', 'Privacy-by-Design'],
      fr: ['logiciel axé sur la confidentialité', 'outils sécurisés', 'confidentialité par conception'],
      es: ['software centrado en privacidad', 'herramientas seguras', 'privacidad por diseño'],
      ru: ['программы с защитой конфиденциальности', 'безопасное ПО', 'приватность по умолчанию']
    }
  },

  BrowserBasedTools: {
    id: 'BrowserBasedTools',
    name: 'Browser-Based Tools',
    type: 'Technology',
    description: 'Web applications that run entirely in browser without server-side processing',
    relatedEntities: ['LocalPDF', 'ClientSideProcessing', 'WebAssembly', 'ProgressiveWebApps'],
    semanticVariants: ['browser-based tools', 'client-side applications', 'web-based tools', 'browser apps'],
    schema: {
      '@type': 'DefinedTerm',
      'name': 'Browser-Based Tools',
      'description': 'Applications that execute entirely within web browsers'
    },
    searchIntent: 'informational',
    authorityLevel: 'secondary'
  },

  GDPRCompliance: {
    id: 'GDPRCompliance',
    name: 'GDPR Compliance',
    type: 'Concept',
    description: 'Adherence to European General Data Protection Regulation requirements',
    relatedEntities: ['PrivacyFirstSoftware', 'DataProtection', 'LocalPDF'],
    wikipediaLink: 'https://en.wikipedia.org/wiki/General_Data_Protection_Regulation',
    wikiDataId: 'Q20970855',
    semanticVariants: ['GDPR compliance', 'data protection regulation', 'privacy regulation', 'EU privacy law'],
    schema: {
      '@type': 'DefinedTerm',
      'name': 'GDPR Compliance',
      'description': 'Conformity with European Union data protection regulations'
    },
    searchIntent: 'commercial',
    authorityLevel: 'supporting'
  },

  ClientSideProcessing: {
    id: 'ClientSideProcessing',
    name: 'Client-Side Processing',
    type: 'Technology',
    description: 'Computing operations performed locally in user browser without server communication',
    relatedEntities: ['BrowserBasedTools', 'PrivacyFirstSoftware', 'WebAssembly'],
    semanticVariants: ['client-side processing', 'local processing', 'browser processing', 'offline processing'],
    schema: {
      '@type': 'DefinedTerm',
      'name': 'Client-Side Processing',
      'description': 'Data processing that occurs on the user device rather than on remote servers'
    },
    searchIntent: 'informational',
    authorityLevel: 'secondary'
  },

  DocumentConversion: {
    id: 'DocumentConversion',
    name: 'Document Conversion',
    type: 'Service',
    description: 'Transformation of documents between different file formats',
    relatedEntities: ['PDFProcessing', 'FileConversion', 'LocalPDF'],
    semanticVariants: ['document conversion', 'file conversion', 'format transformation', 'document transformation'],
    schema: {
      '@type': 'Service',
      'name': 'Document Conversion',
      'description': 'Converting documents from one format to another'
    },
    toolMapping: ['word-to-pdf', 'excel-to-pdf', 'images-to-pdf', 'pdf-to-image'],
    searchIntent: 'transactional',
    authorityLevel: 'primary'
  },

  DocumentOptimization: {
    id: 'DocumentOptimization',
    name: 'Document Optimization',
    type: 'Service',
    description: 'Improving document file size, quality, and performance characteristics',
    relatedEntities: ['PDFProcessing', 'FileCompression', 'LocalPDF'],
    semanticVariants: ['document optimization', 'PDF optimization', 'file compression', 'document enhancement'],
    schema: {
      '@type': 'Service',
      'name': 'Document Optimization',
      'description': 'Improving document efficiency and performance'
    },
    toolMapping: ['compress-pdf', 'extract-text-pdf', 'ocr-pdf'],
    searchIntent: 'transactional',
    authorityLevel: 'primary'
  },

  TextExtraction: {
    id: 'TextExtraction',
    name: 'Text Extraction',
    type: 'Technology',
    description: 'Automated extraction of textual content from digital documents',
    relatedEntities: ['PDFProcessing', 'OCR', 'DocumentOptimization'],
    semanticVariants: ['text extraction', 'content extraction', 'document parsing', 'text mining'],
    schema: {
      '@type': 'DefinedTerm',
      'name': 'Text Extraction',
      'description': 'The process of retrieving text content from documents'
    },
    toolMapping: ['extract-text-pdf', 'ocr-pdf'],
    searchIntent: 'informational',
    authorityLevel: 'secondary',
    aiOptimization: {
      featuredSnippetTargets: [
        'What is text extraction?',
        'How does text extraction work?',
        'Text extraction benefits',
        'OCR vs text extraction'
      ],
      conversationalQueries: [
        'How to extract text from PDF?',
        'What\'s the best text extraction tool?',
        'Can I extract text for free?'
      ],
      voiceSearchOptimizations: [
        'extract text from document',
        'get text from PDF file',
        'copy text from PDF'
      ]
    }
  },

  // NEW AI-focused entities for enhanced search optimization
  AISearchOptimization: {
    id: 'AISearchOptimization',
    name: 'AI Search Optimization',
    type: 'Technology',
    description: 'Optimization techniques for AI-powered search engines and chatbots',
    relatedEntities: ['LocalPDF', 'ConversationalAI', 'FeaturedSnippets'],
    semanticVariants: ['AI SEO', 'artificial intelligence optimization', 'chatbot optimization', 'voice search optimization'],
    schema: {
      '@type': 'DefinedTerm',
      'name': 'AI Search Optimization',
      'description': 'Techniques for optimizing content for AI-powered search and conversation systems'
    },
    searchIntent: 'informational',
    authorityLevel: 'primary',
    aiOptimization: {
      featuredSnippetTargets: [
        'What is AI search optimization?',
        'How to optimize for ChatGPT?',
        'AI SEO best practices',
        'Voice search optimization techniques'
      ],
      conversationalQueries: [
        'How to optimize content for AI?',
        'What makes content AI-friendly?',
        'Best AI optimization strategies?'
      ],
      voiceSearchOptimizations: [
        'optimize for voice search',
        'AI content optimization',
        'chatbot SEO techniques'
      ]
    }
  },

  ConversationalAI: {
    id: 'ConversationalAI',
    name: 'Conversational AI',
    type: 'Technology',
    description: 'AI systems that can engage in natural language conversations with users',
    relatedEntities: ['AISearchOptimization', 'LocalPDF', 'VoiceSearch'],
    semanticVariants: ['conversational AI', 'chatbot technology', 'AI assistants', 'natural language processing'],
    schema: {
      '@type': 'DefinedTerm',
      'name': 'Conversational AI',
      'description': 'Artificial intelligence systems designed for natural language interaction'
    },
    searchIntent: 'informational',
    authorityLevel: 'secondary'
  },

  FeaturedSnippets: {
    id: 'FeaturedSnippets',
    name: 'Featured Snippets',
    type: 'Concept',
    description: 'Enhanced search results that provide direct answers to user queries',
    relatedEntities: ['AISearchOptimization', 'VoiceSearch', 'LocalPDF'],
    semanticVariants: ['featured snippets', 'answer boxes', 'position zero', 'quick answers'],
    schema: {
      '@type': 'DefinedTerm',
      'name': 'Featured Snippets',
      'description': 'Search engine results that highlight specific content as direct answers'
    },
    searchIntent: 'informational',
    authorityLevel: 'supporting'
  },

  VoiceSearch: {
    id: 'VoiceSearch',
    name: 'Voice Search',
    type: 'Technology',
    description: 'Search functionality that responds to spoken queries instead of typed text',
    relatedEntities: ['ConversationalAI', 'AISearchOptimization', 'LocalPDF'],
    semanticVariants: ['voice search', 'voice queries', 'spoken search', 'audio search'],
    schema: {
      '@type': 'DefinedTerm',
      'name': 'Voice Search',
      'description': 'Technology that enables searching using voice commands'
    },
    searchIntent: 'informational',
    authorityLevel: 'secondary'
  }
};

// Topic clusters for semantic SEO organization
export const TOPIC_CLUSTERS: Record<string, TopicCluster> = {
  'pdf-management': {
    id: 'pdf-management',
    name: 'PDF Document Management',
    primaryEntity: 'PDFProcessing',
    relatedEntities: ['LocalPDF', 'DocumentManagement', 'BrowserBasedTools'],
    primaryTools: ['merge-pdf', 'split-pdf', 'rotate-pdf', 'extract-pages-pdf'],
    semanticVariants: ['pdf management', 'document organization', 'pdf handling', 'file management'],
    searchIntent: 'navigational',
    authorityPage: '/pdf-hub/guides',
    keywords: ['pdf management', 'organize pdf files', 'pdf workflow', 'document handling'],
    difficulty: 'medium',
    priority: 'critical',
    localizedContent: {
      en: {
        title: 'Complete PDF Document Management Guide',
        description: 'Master PDF organization, merging, splitting, and page management with browser-based tools',
        keywords: ['pdf management', 'document organization', 'merge pdf', 'split pdf']
      }
    }
  },

  'pdf-security': {
    id: 'pdf-security',
    name: 'PDF Security & Privacy',
    primaryEntity: 'PrivacyFirstSoftware',
    relatedEntities: ['GDPRCompliance', 'ClientSideProcessing', 'LocalPDF'],
    primaryTools: ['watermark-pdf', 'add-text-pdf'],
    semanticVariants: ['pdf security', 'document protection', 'privacy protection', 'secure pdf'],
    searchIntent: 'commercial',
    authorityPage: '/pdf-hub/security',
    keywords: ['pdf security', 'watermark pdf', 'protect pdf', 'privacy'],
    difficulty: 'high',
    priority: 'high'
  },

  'pdf-conversion': {
    id: 'pdf-conversion',
    name: 'Document Format Conversion',
    primaryEntity: 'DocumentConversion',
    relatedEntities: ['PDFProcessing', 'LocalPDF', 'BrowserBasedTools'],
    primaryTools: ['word-to-pdf', 'excel-to-pdf', 'images-to-pdf', 'pdf-to-image'],
    semanticVariants: ['document conversion', 'file conversion', 'format transformation', 'pdf converter'],
    searchIntent: 'transactional',
    authorityPage: '/pdf-hub/guides',
    keywords: ['convert to pdf', 'word to pdf', 'excel to pdf', 'image to pdf'],
    difficulty: 'high',
    priority: 'critical'
  },

  'pdf-optimization': {
    id: 'pdf-optimization',
    name: 'PDF Optimization & Enhancement',
    primaryEntity: 'DocumentOptimization',
    relatedEntities: ['PDFProcessing', 'TextExtraction', 'LocalPDF'],
    primaryTools: ['compress-pdf', 'extract-text-pdf', 'ocr-pdf'],
    semanticVariants: ['pdf optimization', 'document enhancement', 'pdf compression', 'text extraction'],
    searchIntent: 'informational',
    authorityPage: '/pdf-hub/guides',
    keywords: ['compress pdf', 'optimize pdf', 'extract text', 'pdf ocr'],
    difficulty: 'medium',
    priority: 'high'
  }
};

// Entity relationships for semantic understanding
export const ENTITY_RELATIONSHIPS: EntityRelationship[] = [
  // Core product relationships
  { fromEntity: 'LocalPDF', toEntity: 'PDFProcessing', relationship: 'enabledBy', strength: 1.0 },
  { fromEntity: 'LocalPDF', toEntity: 'PrivacyFirstSoftware', relationship: 'isPartOf', strength: 0.9 },
  { fromEntity: 'LocalPDF', toEntity: 'BrowserBasedTools', relationship: 'isPartOf', strength: 0.95 },

  // Service relationships
  { fromEntity: 'PDFProcessing', toEntity: 'DocumentManagement', relationship: 'isPartOf', strength: 0.8 },
  { fromEntity: 'DocumentConversion', toEntity: 'PDFProcessing', relationship: 'isPartOf', strength: 0.9 },
  { fromEntity: 'DocumentOptimization', toEntity: 'PDFProcessing', relationship: 'isPartOf', strength: 0.85 },

  // Technology relationships
  { fromEntity: 'BrowserBasedTools', toEntity: 'ClientSideProcessing', relationship: 'enabledBy', strength: 0.9 },
  { fromEntity: 'PrivacyFirstSoftware', toEntity: 'ClientSideProcessing', relationship: 'enabledBy', strength: 0.8 },
  { fromEntity: 'PrivacyFirstSoftware', toEntity: 'GDPRCompliance', relationship: 'enabledBy', strength: 0.7 },

  // Complementary relationships
  { fromEntity: 'TextExtraction', toEntity: 'DocumentOptimization', relationship: 'complementedBy', strength: 0.6 },
  { fromEntity: 'DocumentConversion', toEntity: 'DocumentOptimization', relationship: 'complementedBy', strength: 0.5 }
];

// Helper function to get entity by ID
export function getEntity(id: string): EntityDefinition | undefined {
  return CORE_ENTITIES[id];
}

// Helper function to get topic cluster by ID
export function getTopicCluster(id: string): TopicCluster | undefined {
  return TOPIC_CLUSTERS[id];
}

// Helper function to get entities by type
export function getEntitiesByType(type: EntityDefinition['type']): EntityDefinition[] {
  return Object.values(CORE_ENTITIES).filter(entity => entity.type === type);
}

// Helper function to get related entities
export function getRelatedEntities(entityId: string): EntityDefinition[] {
  const entity = getEntity(entityId);
  if (!entity) return [];

  return entity.relatedEntities
    .map(id => getEntity(id))
    .filter(Boolean) as EntityDefinition[];
}

// Helper function to get entities for a tool
export function getEntitiesForTool(toolId: string): EntityDefinition[] {
  return Object.values(CORE_ENTITIES).filter(entity =>
    entity.toolMapping?.includes(toolId)
  );
}

// Helper function to get topic clusters for an entity
export function getTopicClustersForEntity(entityId: string): TopicCluster[] {
  return Object.values(TOPIC_CLUSTERS).filter(cluster =>
    cluster.primaryEntity === entityId || cluster.relatedEntities.includes(entityId)
  );
}

// Helper function to get AI optimization data for an entity
export function getAIOptimizationData(entityId: string): {
  featuredSnippetTargets: string[];
  conversationalQueries: string[];
  voiceSearchOptimizations: string[];
} | null {
  const entity = getEntity(entityId);
  if (!entity || !entity.aiOptimization) {
    return null;
  }
  return entity.aiOptimization;
}

// Helper function to get entities optimized for AI search
export function getAIOptimizedEntities(): EntityDefinition[] {
  return Object.values(CORE_ENTITIES).filter(entity =>
    entity.aiOptimization && entity.aiOptimization.featuredSnippetTargets.length > 0
  );
}