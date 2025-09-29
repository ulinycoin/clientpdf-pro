import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useI18n';
import { useMotionPreferences } from '../../hooks/useAccessibilityPreferences';
import { TOOL_DEFINITIONS, type Tool } from '../../utils/toolsData';
import { getToolRoute } from '../../utils/routeHelpers';
import { FileText, Scissors, FileDown, Shield, Wand2, RotateCcw,
         Eye, FileImage, ImageIcon, BookOpen, Grid, FileType, Settings } from 'lucide-react';

interface BentoToolsGridProps {
  disabledTools?: string[];
  className?: string;
}

// Tool icon mapping using tool IDs from toolsData.ts
const TOOL_ICONS = {
  'merge': FileText,
  'split': Scissors,
  'compress': FileDown,
  'addText': Wand2,
  'watermark': Shield,
  'rotate': RotateCcw,
  'extractPages': Grid,
  'extractText': FileText,
  'extractImagesFromPdf': ImageIcon,
  'pdfToImage': FileImage,
  'pdfToSvg': FileType,
  'imageToPdf': ImageIcon,
  'wordToPdf': BookOpen,
  'excelToPdf': Grid,
  'protect': Shield,
  'ocr': Eye
} as const;

// Organic Bento Grid Layout - responsive asymmetric design with priority-based sizes
const BENTO_LAYOUT = [
  // Priority 1: Most used tool - extra large
  {
    id: 'merge',
    gridClass: 'col-span-1 sm:col-span-2 lg:col-span-2 row-span-1 sm:row-span-1 lg:row-span-2',
    size: 'xl',
    featured: true,
    priority: 1,
    bgGradient: 'from-blue-500 to-blue-600'
  },

  // Priority 2: Core tools - large size
  {
    id: 'split',
    gridClass: 'col-span-1 sm:col-span-2 lg:col-span-2 row-span-1',
    size: 'large',
    featured: true,
    priority: 2,
    bgGradient: 'from-red-500 to-red-600'
  },

  // Priority 3: Popular tool - medium-large
  {
    id: 'compress',
    gridClass: 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1 sm:row-span-1 lg:row-span-2',
    size: 'large',
    featured: true,
    priority: 2,
    bgGradient: 'from-green-500 to-green-600'
  },

  // Priority 4: Conversion tools - medium sizes
  {
    id: 'pdfToImage',
    gridClass: 'col-span-1 row-span-1',
    size: 'medium',
    priority: 3,
    bgGradient: 'from-pink-500 to-pink-600'
  },
  {
    id: 'imageToPdf',
    gridClass: 'col-span-1 sm:col-span-2 lg:col-span-2 row-span-1',
    size: 'medium',
    priority: 3,
    bgGradient: 'from-violet-500 to-violet-600'
  },

  // Priority 5: Advanced tools - varied sizes
  {
    id: 'ocr',
    gridClass: 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1 sm:row-span-1 lg:row-span-2',
    size: 'medium',
    featured: true,
    priority: 3,
    bgGradient: 'from-cyan-500 to-cyan-600'
  },
  {
    id: 'addText',
    gridClass: 'col-span-1 row-span-1',
    size: 'small',
    priority: 4,
    bgGradient: 'from-purple-500 to-purple-600'
  },

  // Priority 6: Enhancement tools - small/medium
  {
    id: 'watermark',
    gridClass: 'col-span-1 row-span-1',
    size: 'small',
    priority: 4,
    bgGradient: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'rotate',
    gridClass: 'col-span-1 row-span-1',
    size: 'small',
    priority: 4,
    bgGradient: 'from-orange-500 to-orange-600'
  },
  {
    id: 'protect',
    gridClass: 'col-span-1 sm:col-span-2 lg:col-span-2 row-span-1',
    size: 'medium',
    priority: 4,
    bgGradient: 'from-slate-500 to-slate-600'
  },

  // Priority 7: Less common tools - small sizes
  {
    id: 'extractPages',
    gridClass: 'col-span-1 row-span-1',
    size: 'small',
    priority: 5,
    bgGradient: 'from-teal-500 to-teal-600'
  },
  {
    id: 'extractText',
    gridClass: 'col-span-1 row-span-1',
    size: 'small',
    priority: 5,
    bgGradient: 'from-rose-500 to-rose-600'
  },
  {
    id: 'wordToPdf',
    gridClass: 'col-span-1 row-span-1',
    size: 'small',
    priority: 5,
    bgGradient: 'from-amber-500 to-amber-600'
  },

  // Missing tools - adding them
  {
    id: 'extractImagesFromPdf',
    gridClass: 'col-span-1 row-span-1',
    size: 'small',
    priority: 5,
    bgGradient: 'from-lime-500 to-lime-600'
  },
  {
    id: 'pdfToSvg',
    gridClass: 'col-span-1 row-span-1',
    size: 'small',
    priority: 5,
    bgGradient: 'from-fuchsia-500 to-fuchsia-600'
  },
  {
    id: 'excelToPdf',
    gridClass: 'col-span-1 row-span-1',
    size: 'small',
    priority: 5,
    bgGradient: 'from-emerald-500 to-emerald-600'
  }
];

const BentoToolsGrid: React.FC<BentoToolsGridProps> = ({
  disabledTools = [],
  className = ''
}) => {
  const { t, currentLanguage, isInitialized } = useTranslation();
  const { shouldAnimate } = useMotionPreferences();

  // Map tool operation types to actual URL paths using routeHelpers with language prefix
  const getToolPath = (operationType: string): string => {
    const basePath = getToolRoute(operationType);
    // Add language prefix for non-English languages, with fallback to 'en' if currentLanguage is undefined
    const language = currentLanguage || 'en';
    return language === 'en' ? basePath : `/${language}${basePath}`;
  };

  // Get tool definitions with translations and paths
  const pdfTools = useMemo<Record<string, Tool & { path: string }>>(() => {
    const tools = TOOL_DEFINITIONS.reduce((acc, toolDef) => {
      const title = t(`tools.${toolDef.id}.title`) || `${toolDef.id} Tool`;
      const description = t(`tools.${toolDef.id}.description`) || `${toolDef.id} description`;

      acc[toolDef.id] = {
        ...toolDef,
        title,
        description,
        path: getToolPath(toolDef.operationType)
      };
      return acc;
    }, {} as Record<string, Tool & { path: string }>);

    return tools;
  }, [t, currentLanguage, isInitialized]);

  // Memoized disabled tools set for O(1) lookup
  const disabledToolsSet = useMemo(() =>
    new Set(disabledTools),
    [disabledTools]
  );

  const renderBentoCard = (layoutItem: typeof BENTO_LAYOUT[0]) => {
    const tool = pdfTools[layoutItem.id];


    if (!tool || disabledToolsSet.has(tool.id)) {
      return null;
    }

    const IconComponent = TOOL_ICONS[layoutItem.id as keyof typeof TOOL_ICONS] || Settings;
    const isXL = layoutItem.size === 'xl';
    const isLarge = layoutItem.size === 'large';
    const isMedium = layoutItem.size === 'medium';
    const isFeatured = layoutItem.featured;

    return (
      <Link
        key={tool.id}
        to={tool.path}
        className={`
          ${layoutItem.gridClass}
          group relative overflow-hidden rounded-3xl
          bg-white/10 dark:bg-white/5 backdrop-blur-xl
          border border-white/20 dark:border-white/10
          ${shouldAnimate ? 'transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:bg-white/20 dark:hover:bg-white/10' : ''}
          ${shouldAnimate ? 'hover:-translate-y-1' : ''}
          shadow-lg hover:shadow-xl
          focus:outline-none focus:ring-4 focus:ring-blue-500/20
          min-h-[140px]
        `}
        aria-label={`${tool.title} - ${tool.description}`}
      >
        {/* Glassmorphism Background with Color Accent */}
        <div className="absolute inset-0">
          {/* Subtle color accent */}
          <div className={`absolute inset-0 bg-gradient-to-br ${layoutItem.bgGradient} opacity-10`} />

          {/* Glass surface */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 dark:from-white/5 dark:to-white/2" />

          {/* Floating glass elements */}
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 dark:bg-white/5 rounded-full blur-xl" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 dark:bg-white/3 rounded-full blur-lg" />
        </div>

        {/* Popular Badge */}
        {isFeatured && (
          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center gap-1 px-3 py-1 bg-amber-500 text-amber-900 text-xs font-bold rounded-full shadow-lg">
              <span className="text-xs">⭐</span>
              <span>{t('home.tools.popular')}</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="
          relative z-10 h-full flex flex-col justify-center items-center
          p-6 space-y-4
        ">
          {/* Icon */}
          <div className="flex items-center justify-center">
            <div className="
              w-16 h-16
              flex items-center justify-center
              bg-white/30 dark:bg-white/20 backdrop-blur-md rounded-2xl
              border border-white/30 dark:border-white/20
              shadow-lg shadow-black/10
              group-hover:scale-110 group-hover:bg-white/40 group-hover:shadow-xl transition-all duration-300
            ">
              <IconComponent className="w-8 h-8 text-gray-700 dark:text-white drop-shadow-lg" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h3 className="
              text-xl
              font-bold text-gray-800 dark:text-white drop-shadow-lg
              group-hover:scale-105 transition-transform duration-300
            ">
              {tool.title}
            </h3>
          </div>

          {/* Hover Arrow */}
          <div className={`
            absolute bottom-4 right-4
            w-8 h-8 flex items-center justify-center
            bg-white/30 dark:bg-white/20 backdrop-blur-md rounded-full
            border border-white/30 dark:border-white/20
            shadow-lg shadow-black/10
            ${shouldAnimate ? 'transform translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:bg-white/40 transition-all duration-300' : ''}
          `}>
            <svg
              className="w-4 h-4 text-gray-700 dark:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </Link>
    );
  };

  // Show loading state only if i18n is explicitly not initialized and we have no translations
  if (!isInitialized && Object.keys(pdfTools).length === 0) {
    return (
      <section data-section="tools" className={`py-8 ${className}`} id="tools-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto max-w-md"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mx-auto max-w-lg"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section data-section="tools" className={`py-8 ${className} overflow-hidden`} id="tools-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

        {/* Modern Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gradient-ocean mb-6">
            {t('home.tools.title')}
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {t('home.tools.subtitle', { count: Object.keys(pdfTools).length })}
          </p>

        </div>


        {/* Organic Bento Grid - responsive asymmetric layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[180px] gap-4 sm:gap-6 max-w-6xl mx-auto overflow-hidden"
             style={{ gridTemplateRows: 'repeat(auto-fit, 180px)' }}>
          {BENTO_LAYOUT.map(renderBentoCard)}
        </div>

      </div>
    </section>
  );
};

export default BentoToolsGrid;