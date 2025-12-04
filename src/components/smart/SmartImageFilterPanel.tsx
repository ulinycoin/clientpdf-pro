/**
 * Smart Image Filter Panel
 * AI-powered image categorization and filtering suggestions
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/hooks/useI18n';
import type { SmartImageFilterAnalysis, ImageCategoryGroup, CategorizedImage } from '@/services/smartImageFilterService';

interface SmartImageFilterPanelProps {
  analysisResult: SmartImageFilterAnalysis | null;
  isAnalyzing: boolean;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onApplyFilter: (filterId: string) => void;
  onSelectCategory: (category: string, selected: boolean) => void;
  selectedCategories: Set<string>;
}

export const SmartImageFilterPanel: React.FC<SmartImageFilterPanelProps> = ({
  analysisResult,
  isAnalyzing,
  enabled,
  onToggle,
  onApplyFilter,
  onSelectCategory,
  selectedCategories,
}) => {
  const { t } = useI18n();
  const [expandedSection, setExpandedSection] = useState<'categories' | 'presets' | null>('categories');

  // Toggle component
  const ToggleSwitch = () => (
    <button
      onClick={() => onToggle(!enabled)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        enabled ? 'bg-ocean-500' : 'bg-gray-300 dark:bg-gray-600'
      }`}
      aria-label={enabled ? 'Disable Smart Image Filter' : 'Enable Smart Image Filter'}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );

  // Disabled state - compact view
  if (!enabled) {
    return (
      <Card className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 opacity-60">
              <span className="text-base">🎨</span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('smartImageFilter.title') || 'Smart Image Filter'}
              </span>
              <Badge variant="secondary" className="text-[10px] bg-gray-400 text-white">
                AI
              </Badge>
            </div>
            <ToggleSwitch />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isAnalyzing) {
    return (
      <Card className="border-ocean-400/50 dark:border-ocean-500/30 bg-white dark:bg-gray-800/90">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-ocean-500 border-t-transparent rounded-full" />
              <span className="text-sm text-ocean-700 dark:text-ocean-300">
                {t('smartImageFilter.analyzing') || 'Analyzing images...'}
              </span>
            </div>
            <ToggleSwitch />
          </div>
        </CardContent>
      </Card>
    );
  }

  // No analysis yet
  if (!analysisResult) return null;

  const { categories, usefulImages, likelyJunk, totalImages } = analysisResult;

  // Quick presets
  const presets = [
    {
      id: 'useful',
      label: t('smartImageFilter.presets.useful.label') || 'Useful Images',
      icon: '⭐',
      description: t('smartImageFilter.presets.useful.description') || 'Photos and charts only',
      count: usefulImages.length,
    },
    {
      id: 'photos-only',
      label: t('smartImageFilter.presets.photosOnly.label') || 'Photos Only',
      icon: '📷',
      description: t('smartImageFilter.presets.photosOnly.description') || 'High-quality photos',
      count: categories.find(c => c.category === 'photo')?.count || 0,
    },
    {
      id: 'exclude-icons',
      label: t('smartImageFilter.presets.excludeIcons.label') || 'No Icons',
      icon: '🚫',
      description: t('smartImageFilter.presets.excludeIcons.description') || 'Exclude small icons',
      count: totalImages - (categories.find(c => c.category === 'icon')?.count || 0) - (categories.find(c => c.category === 'decoration')?.count || 0),
    },
    {
      id: 'large',
      label: t('smartImageFilter.presets.large.label') || 'Large Images',
      icon: '🖼️',
      description: t('smartImageFilter.presets.large.description') || 'Images > 0.1 MP',
      count: categories.reduce((sum, cat) => sum + cat.images.filter(img => img.megapixels >= 0.1).length, 0),
    },
  ];

  return (
    <Card className="border-ocean-400/50 dark:border-ocean-500/30 bg-gradient-to-br from-ocean-50/50 to-privacy-50/30 dark:from-ocean-900/20 dark:to-privacy-900/10">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎨</span>
            <h3 className="text-base font-semibold text-ocean-900 dark:text-ocean-100">
              {t('smartImageFilter.title') || 'Smart Image Filter'}
            </h3>
            <Badge variant="secondary" className="text-[10px] bg-ocean-500 text-white">
              AI
            </Badge>
          </div>
          <ToggleSwitch />
        </div>

        {/* Summary */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-600 dark:text-gray-400">{t('smartImageFilter.totalImages') || 'Total'}:</span>
            <span className="font-semibold text-ocean-700 dark:text-ocean-300">{totalImages}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-green-600 dark:text-green-400">⭐ {t('smartImageFilter.useful') || 'Useful'}:</span>
            <span className="font-semibold text-green-700 dark:text-green-300">{usefulImages.length}</span>
          </div>
          {likelyJunk.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-amber-600 dark:text-amber-400">🗑️ {t('smartImageFilter.junk') || 'Junk'}:</span>
              <span className="font-semibold text-amber-700 dark:text-amber-300">{likelyJunk.length}</span>
            </div>
          )}
        </div>

        {/* Quick Presets */}
        <div>
          <button
            onClick={() => setExpandedSection(expandedSection === 'presets' ? null : 'presets')}
            className="flex items-center justify-between w-full text-sm font-medium text-ocean-800 dark:text-ocean-200 mb-2 hover:text-ocean-600 dark:hover:text-ocean-300 transition-colors"
          >
            <span>{t('smartImageFilter.quickFilters') || 'Quick Filters'}</span>
            <svg
              className={`w-4 h-4 transition-transform ${expandedSection === 'presets' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSection === 'presets' && (
            <div className="grid grid-cols-2 gap-2">
              {presets.map(preset => (
                <Button
                  key={preset.id}
                  onClick={() => onApplyFilter(preset.id)}
                  variant="outline"
                  className="h-auto p-3 border-2 hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 group justify-start"
                  disabled={preset.count === 0}
                >
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{preset.icon}</span>
                      <span className="font-medium text-xs text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                        {preset.label}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {preset.count}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      {preset.description}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Categories */}
        <div>
          <button
            onClick={() => setExpandedSection(expandedSection === 'categories' ? null : 'categories')}
            className="flex items-center justify-between w-full text-sm font-medium text-ocean-800 dark:text-ocean-200 mb-2 hover:text-ocean-600 dark:hover:text-ocean-300 transition-colors"
          >
            <span>{t('smartImageFilter.categories') || 'Categories'}</span>
            <svg
              className={`w-4 h-4 transition-transform ${expandedSection === 'categories' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSection === 'categories' && (
            <div className="space-y-2">
              {categories.map(cat => {
                const isSelected = selectedCategories.has(cat.category);
                return (
                  <button
                    key={cat.category}
                    onClick={() => onSelectCategory(cat.category, !isSelected)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 text-ocean-600 border-gray-300 rounded focus:ring-ocean-500"
                      />
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {cat.label}
                      </span>
                    </div>
                    <Badge variant={isSelected ? 'default' : 'secondary'} className="text-xs">
                      {cat.count}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Junk warning */}
        {likelyJunk.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <span className="text-base">💡</span>
              <div className="text-xs">
                <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                  {t('smartImageFilter.junkWarning.title') || 'Low-value images detected'}
                </p>
                <p className="text-amber-700 dark:text-amber-300">
                  {t('smartImageFilter.junkWarning.description') || `Found ${likelyJunk.length} small icons/decorations. Consider using "Useful Images" filter.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
          {t('smartImageFilter.processingInfo') || 'All analysis runs locally in your browser. Images are categorized by size, format, and characteristics.'}
        </div>
      </CardContent>
    </Card>
  );
};
