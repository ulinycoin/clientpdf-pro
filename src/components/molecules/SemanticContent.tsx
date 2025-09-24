// src/components/molecules/SemanticContent.tsx
import React, { useMemo } from 'react';
import { useEntityContext } from '@/components/providers/EntityProvider';
import type { SupportedLanguage } from '@/types/i18n';

interface SemanticContentProps {
  entity: string;
  context: 'title' | 'description' | 'body' | 'meta' | 'heading' | 'alt';
  children?: React.ReactNode;
  // Content options
  variants?: string[];
  maxVariants?: number;
  includeVariants?: boolean;
  // Rendering options
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  // SEO options
  generateSchema?: boolean;
  schemaType?: string;
  // Content rotation for A/B testing and freshness
  rotationStrategy?: 'random' | 'sequential' | 'weight-based';
  fallback?: string;
}

interface SemanticTextProps {
  text: string;
  variants?: string[];
  rotationStrategy?: 'random' | 'sequential' | 'weight-based';
  className?: string;
}

// Helper component for rotating semantic variants
const SemanticText: React.FC<SemanticTextProps> = ({
  text,
  variants = [],
  rotationStrategy = 'random',
  className
}) => {
  const selectedText = useMemo(() => {
    if (!variants.length) return text;

    const allOptions = [text, ...variants];

    switch (rotationStrategy) {
      case 'random':
        return allOptions[Math.floor(Math.random() * allOptions.length)];
      case 'sequential':
        // Use day of year for consistent daily rotation
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        return allOptions[dayOfYear % allOptions.length];
      case 'weight-based':
        // Primary text has higher weight, variants are secondary
        const weights = [0.4, ...variants.map(() => 0.6 / variants.length)];
        const random = Math.random();
        let cumulativeWeight = 0;
        for (let i = 0; i < weights.length; i++) {
          cumulativeWeight += weights[i];
          if (random <= cumulativeWeight) {
            return allOptions[i];
          }
        }
        return text;
      default:
        return text;
    }
  }, [text, variants, rotationStrategy]);

  return <span className={className}>{selectedText}</span>;
};

export const SemanticContent: React.FC<SemanticContentProps> = ({
  entity,
  context,
  children,
  variants: customVariants,
  maxVariants = 3,
  includeVariants = true,
  as: Component = 'span',
  className,
  generateSchema = false,
  schemaType,
  rotationStrategy = 'weight-based',
  fallback
}) => {
  const entityContext = useEntityContext();

  const semanticData = useMemo(() => {
    try {
      return entityContext.generateSemanticContent(entity, context, {
        includeVariants,
        maxVariants
      });
    } catch (error) {
      console.warn(`Failed to generate semantic content for entity ${entity}:`, error);
      return null;
    }
  }, [entity, context, includeVariants, maxVariants, entityContext]);

  const content = useMemo(() => {
    if (!semanticData) {
      const fallbackText = fallback || entityContext.getLocalizedName(entity) || entity;
      return {
        primary: fallbackText,
        variants: [],
        weight: 0.1
      };
    }

    const primaryText = semanticData.variants[0] || entityContext.getLocalizedName(entity) || entity;
    const variants = customVariants || semanticData.variants.slice(1);

    return {
      primary: primaryText,
      variants,
      weight: semanticData.weight || 0.5
    };
  }, [semanticData, customVariants, fallback, entity, entityContext]);

  const structuredData = useMemo(() => {
    if (!generateSchema || !semanticData) return null;

    const baseSchema = entityContext.generateStructuredData(entity);

    if (schemaType) {
      baseSchema['@type'] = schemaType;
    }

    // Add context-specific properties
    switch (context) {
      case 'title':
        baseSchema.headline = content.primary;
        break;
      case 'description':
        baseSchema.description = content.primary;
        break;
      case 'alt':
        baseSchema.alternativeHeadline = content.primary;
        break;
    }

    return baseSchema;
  }, [generateSchema, semanticData, entity, context, content, schemaType, entityContext]);

  // If children are provided, use them instead of generated content
  if (children) {
    return (
      <>
        <Component className={className}>
          {children}
        </Component>
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Component className={className}>
        <SemanticText
          text={content.primary}
          variants={content.variants}
          rotationStrategy={rotationStrategy}
        />
      </Component>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </>
  );
};

// Higher-order component for entity-aware content
export const withSemanticContent = <P extends object>(
  WrappedComponent: React.ComponentType<P & {
    semanticData?: any;
    keywords?: any;
    entityId?: string;
  }>,
  entityId: string,
  context: SemanticContentProps['context'] = 'body'
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const entityContext = useEntityContext();

    const enhancedProps = useMemo(() => {
      const semanticData = entityContext.generateSemanticContent(entityId, context);
      const keywords = entityContext.generateSemanticKeywords(entityId);

      return {
        ...props,
        semanticData,
        keywords,
        entityId
      } as P & {
        semanticData: any;
        keywords: any;
        entityId: string;
      };
    }, [props, entityContext]);

    return <WrappedComponent ref={ref} {...enhancedProps} />;
  });
};

// Specialized components for common use cases
export const SemanticTitle: React.FC<Omit<SemanticContentProps, 'context' | 'as'> & {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}> = ({ level = 1, ...props }) => (
  <SemanticContent
    {...props}
    context="title"
    as={`h${level}` as keyof JSX.IntrinsicElements}
  />
);

export const SemanticDescription: React.FC<Omit<SemanticContentProps, 'context' | 'as'>> = (props) => (
  <SemanticContent
    {...props}
    context="description"
    as="p"
  />
);

export const SemanticMeta: React.FC<Omit<SemanticContentProps, 'context' | 'as'> & {
  name: string;
}> = ({ name, entity, ...props }) => {
  const entityContext = useEntityContext();
  const content = entityContext.generateSemanticContent(entity, 'meta');

  return (
    <meta
      name={name}
      content={content.variants[0] || entityContext.getLocalizedName(entity)}
    />
  );
};

export default SemanticContent;