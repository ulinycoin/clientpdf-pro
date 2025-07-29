import React, { useMemo } from 'react';
import { Shield, Zap, Lock, CheckCircle } from 'lucide-react';
import { useTranslation } from '../../hooks/useI18n';
import ToolCard from '../molecules/ToolCard';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  operationType: string;
  featured?: boolean;
  primary?: boolean;
}

interface ToolsGridProps {
  disabledTools?: string[];
  className?: string;
}

// Memoized tool card component to prevent unnecessary re-renders
const MemoizedToolCard = React.memo<{
  tool: Tool;
  index: number;
  disabled: boolean;
}>(({ tool, index, disabled }) => (
  <ToolCard
    title={tool.title}
    description={tool.description}
    icon={tool.icon}
    operationType={tool.operationType}
    disabled={disabled}
    className={`
      progressive-reveal pdf-tool-card
      ${tool.featured ? 'lg:col-span-2 xl:col-span-2' : ''}
    `}
    style={{ animationDelay: `${index * 50}ms` }}
  />
));

MemoizedToolCard.displayName = 'MemoizedToolCard';

// Memoized feature item component
const FeatureItem = React.memo<{
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  iconColor: string;
  text: string;
}>(({ icon: Icon, bgColor, iconColor, text }) => (
  <div className="flex items-center space-x-3">
    <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <span className="text-secondary-700 font-medium">{text}</span>
  </div>
));

FeatureItem.displayName = 'FeatureItem';

// Memoized statistics item component
const StatItem = React.memo<{
  value: string | number;
  label: string;
  description: string;
  color: string;
}>(({ value, label, description, color }) => (
  <div className="text-center">
    <div className={`text-3xl font-bold ${color} mb-2`}>{value}</div>
    <div className="text-secondary-700 font-medium">{label}</div>
    <div className="text-sm text-secondary-500">{description}</div>
  </div>
));

StatItem.displayName = 'StatItem';

const ToolsGrid: React.FC<ToolsGridProps> = React.memo(({
  disabledTools = [],
  className = ''
}) => {
  const { t } = useTranslation();

  // Memoized tools configuration
  const pdfTools = useMemo<Tool[]>(() => [
    {
      id: 'merge',
      title: t('tools.merge.title'),
      description: t('tools.merge.description'),
      icon: 'MERGE',
      operationType: 'merge',
      featured: true // Most popular tool
    },
    {
      id: 'split',
      title: t('tools.split.title'),
      description: t('tools.split.description'),
      icon: 'SPLIT',
      operationType: 'split',
      primary: true // Frequently used
    },
    {
      id: 'compress',
      title: t('tools.compress.title'),
      description: t('tools.compress.description'),
      icon: 'COMPRESS',
      operationType: 'compress'
    },
    {
      id: 'addText',
      title: t('tools.addText.title'),
      description: t('tools.addText.description'),
      icon: 'TEXT',
      operationType: 'add-text'
    },
    {
      id: 'watermark',
      title: t('tools.watermark.title'),
      description: t('tools.watermark.description'),
      icon: 'WATERMARK',
      operationType: 'watermark'
    },
    {
      id: 'rotate',
      title: t('tools.rotate.title'),
      description: t('tools.rotate.description'),
      icon: 'ROTATE',
      operationType: 'rotate'
    },
    {
      id: 'extractPages',
      title: t('tools.extractPages.title'),
      description: t('tools.extractPages.description'),
      icon: 'PAGES',
      operationType: 'extract-pages'
    },
    {
      id: 'extractText',
      title: t('tools.extractText.title'),
      description: t('tools.extractText.description'),
      icon: 'EXTRACT',
      operationType: 'extract-text'
    },
    {
      id: 'pdfToImage',
      title: t('tools.pdfToImage.title'),
      description: t('tools.pdfToImage.description'),
      icon: 'IMAGE',
      operationType: 'pdf-to-image'
    },
    {
      id: 'imageToPdf',
      title: t('tools.imageToPdf.title'),
      description: t('tools.imageToPdf.description'),
      icon: '🖼️',
      operationType: 'images-to-pdf'
    },
    {
      id: 'wordToPdf',
      title: t('tools.wordToPdf.title'),
      description: t('tools.wordToPdf.description'),
      icon: '📄',
      operationType: 'word-to-pdf'
    },
    {
      id: 'excelToPdf',
      title: t('tools.excelToPdf.title'),
      description: t('tools.excelToPdf.description'),
      icon: '📊',
      operationType: 'excel-to-pdf'
    },
    {
      id: 'ocr',
      title: t('tools.ocr.title'),
      description: t('tools.ocr.description'),
      icon: '🔍',
      operationType: 'ocr-pdf'
    }
  ], [t]);

  // Memoized statistics data
  const statistics = useMemo(() => [
    {
      value: 13,
      label: t('home.tools.whyChoose.stats.tools'),
      description: t('home.tools.whyChoose.stats.toolsDesc'),
      color: 'text-primary-600'
    },
    {
      value: '100%',
      label: t('home.tools.whyChoose.stats.privacy'),
      description: t('home.tools.whyChoose.stats.privacyDesc'),
      color: 'text-success-600'
    },
    {
      value: 0,
      label: t('home.tools.whyChoose.stats.dataCollection'),
      description: t('home.tools.whyChoose.stats.dataCollectionDesc'),
      color: 'text-purple-600'
    },
    {
      value: '∞',
      label: t('home.tools.whyChoose.stats.usageLimits'),
      description: t('home.tools.whyChoose.stats.usageLimitsDesc'),
      color: 'text-orange-600'
    }
  ], [t]);

  // Memoized features data
  const features = useMemo(() => [
    {
      icon: CheckCircle,
      bgColor: 'bg-success-100',
      iconColor: 'text-success-600',
      text: t('home.tools.whyChoose.features.noRegistration')
    },
    {
      icon: Zap,
      bgColor: 'bg-primary-100',
      iconColor: 'text-primary-600',
      text: t('home.tools.whyChoose.features.fastProcessing')
    },
    {
      icon: Shield,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      text: t('home.tools.whyChoose.features.secureProcessing')
    },
    {
      icon: Lock,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      text: t('home.tools.whyChoose.features.worksOffline')
    }
  ], [t]);

  // Memoized disabled tools set for O(1) lookup
  const disabledToolsSet = useMemo(() =>
    new Set(disabledTools),
    [disabledTools]
  );

  // Memoized title parts for performance
  const titleParts = useMemo(() => {
    const fullTitle = t('home.tools.title');
    const words = fullTitle.split(' ');
    return {
      highlight: words.slice(0, 2).join(' '),
      rest: words.slice(2).join(' ')
    };
  }, [t]);

  return (
    <div className={`space-y-12 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
          <span className="text-gradient-blue">
            {titleParts.highlight}
          </span> {titleParts.rest}
        </h2>
        <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
          {t('home.tools.subtitle')}
        </p>
      </div>

      {/* Tools Grid - responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-6">
        {pdfTools.map((tool, index) => (
          <MemoizedToolCard
            key={tool.id}
            tool={tool}
            index={index}
            disabled={disabledToolsSet.has(tool.operationType)}
          />
        ))}
      </div>

      {/* Trust-First statistics */}
      <div className="pdf-processing-card rounded-3xl p-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h4 className="text-2xl font-bold text-secondary-900 mb-2">
              {t('home.tools.whyChoose.title')}
            </h4>
            <p className="text-secondary-600">
              {t('home.tools.whyChoose.description')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statistics.map((stat, index) => (
              <StatItem
                key={index}
                value={stat.value}
                label={stat.label}
                description={stat.description}
                color={stat.color}
              />
            ))}
          </div>

          {/* Trust-First features */}
          <div className="mt-8 pt-8 border-t border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              {features.map((feature, index) => (
                <FeatureItem
                  key={index}
                  icon={feature.icon}
                  bgColor={feature.bgColor}
                  iconColor={feature.iconColor}
                  text={feature.text}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trust Message */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-success-200 shadow-soft trust-badge">
          <Shield className="w-5 h-5 text-success-600" />
          <span className="text-success-700 font-medium">
            {t('home.tools.trustMessage')}
          </span>
        </div>
      </div>
    </div>
  );
});

ToolsGrid.displayName = 'ToolsGrid';

export default ToolsGrid;
