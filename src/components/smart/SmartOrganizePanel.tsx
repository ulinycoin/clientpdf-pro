/**
 * Smart Organize Panel
 * Displays AI-powered page analysis and quick actions for PDF organization
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/hooks/useI18n';
import smartOrganizeService, {
  type SmartOrganizeAnalysis,
  type SmartAction,
  type ChapterInfo,
} from '@/services/smartOrganizeService';

interface SmartOrganizePanelProps {
  file: File | null;
  onDeletePages: (pageNumbers: number[]) => void;
  onRotatePages: (pageNumbers: number[], rotation: number) => void;
  onReorderPages?: (newOrder: number[]) => void;
  onHighlightPages?: (pageNumbers: number[]) => void;
}

export const SmartOrganizePanel: React.FC<SmartOrganizePanelProps> = ({
  file,
  onDeletePages,
  onRotatePages,
  onReorderPages,
  onHighlightPages,
}) => {
  const { t } = useI18n();
  const [analysis, setAnalysis] = useState<SmartOrganizeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);
  const [expandedSection, setExpandedSection] = useState<'actions' | 'chapters' | 'details' | null>('actions');

  // Analyze document when file changes
  useEffect(() => {
    if (!file || !isEnabled) {
      setAnalysis(null);
      return;
    }

    const analyzeDocument = async () => {
      setIsAnalyzing(true);
      setError(null);

      try {
        const result = await smartOrganizeService.analyzeDocument(file);
        setAnalysis(result);
      } catch (err) {
        console.error('Analysis failed:', err);
        setError('Failed to analyze document');
      } finally {
        setIsAnalyzing(false);
      }
    };

    // Small delay to avoid analyzing during rapid file changes
    const timeoutId = setTimeout(analyzeDocument, 300);
    return () => clearTimeout(timeoutId);
  }, [file, isEnabled]);

  const handleAction = (action: SmartAction) => {
    switch (action.type) {
      case 'remove_blank':
      case 'remove_duplicates':
        onDeletePages(action.affectedPages);
        break;
      case 'fix_rotation':
        // Get rotation suggestion for each page
        if (analysis) {
          action.affectedPages.forEach(pageNum => {
            const page = analysis.pages.find(p => p.pageNumber === pageNum);
            if (page && page.suggestedRotation !== 0) {
              onRotatePages([pageNum], page.suggestedRotation);
            }
          });
        }
        break;
      case 'move_toc':
        // Reorder to move TOC pages to the front (after cover if exists)
        if (onReorderPages && analysis) {
          const coverPage = analysis.coverPage;
          const otherPages = Array.from({ length: analysis.totalPages }, (_, i) => i + 1)
            .filter(p => !action.affectedPages.includes(p) && p !== coverPage);

          const newOrder = coverPage
            ? [coverPage, ...action.affectedPages, ...otherPages.filter(p => p !== coverPage)]
            : [...action.affectedPages, ...otherPages];

          onReorderPages(newOrder);
        }
        break;
    }
  };

  const handleHighlight = (pageNumbers: number[]) => {
    onHighlightPages?.(pageNumbers);
  };

  // Toggle switch component
  const ToggleSwitch = () => (
    <button
      onClick={() => setIsEnabled(!isEnabled)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        isEnabled ? 'bg-ocean-500' : 'bg-gray-300 dark:bg-gray-600'
      }`}
      aria-label={isEnabled ? 'Disable Smart Organize' : 'Enable Smart Organize'}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          isEnabled ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );

  // Don't render if no file
  if (!file) return null;

  // Disabled state
  if (!isEnabled) {
    return (
      <Card className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 opacity-60">
              <span className="text-base">🧠</span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('smartOrganize.title') || 'Smart Organize'}
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
                {t('smartOrganize.analyzing') || 'Analyzing pages...'}
              </span>
            </div>
            <ToggleSwitch />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-amber-700 dark:text-amber-300">{error}</p>
            <ToggleSwitch />
          </div>
        </CardContent>
      </Card>
    );
  }

  // No analysis yet
  if (!analysis) return null;

  const actions = smartOrganizeService.generateActions(analysis, t);
  const hasIssues = analysis.issuesCount > 0;
  const hasChapters = analysis.chapters.length > 0;

  return (
    <Card className="border-ocean-400/50 dark:border-ocean-500/30 bg-white dark:bg-gray-800/90 shadow-sm">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧠</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t('smartOrganize.title') || 'Smart Organize'}
            </h3>
            <Badge variant="secondary" className="text-xs bg-ocean-500 text-white">
              AI
            </Badge>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {Math.round(analysis.analysisTime)}ms
            </span>
          </div>
          <ToggleSwitch />
        </div>

        {/* Summary */}
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {analysis.totalPages} pages
          </Badge>
          {analysis.blankPages.length > 0 && (
            <Badge
              className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 cursor-pointer hover:bg-amber-200 dark:hover:bg-amber-900"
              onClick={() => handleHighlight(analysis.blankPages)}
            >
              {analysis.blankPages.length} blank
            </Badge>
          )}
          {analysis.duplicateGroups.length > 0 && (
            <Badge
              className="bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 cursor-pointer hover:bg-orange-200 dark:hover:bg-orange-900"
              onClick={() => handleHighlight(analysis.duplicateGroups.flatMap(g => g.pages))}
            >
              {analysis.duplicateGroups.reduce((sum, g) => sum + g.pages.length - 1, 0)} duplicates
            </Badge>
          )}
          {analysis.rotationNeeded.length > 0 && (
            <Badge
              className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900"
              onClick={() => handleHighlight(analysis.rotationNeeded)}
            >
              {analysis.rotationNeeded.length} rotated
            </Badge>
          )}
          {hasChapters && (
            <Badge className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
              {analysis.chapters.length} chapters
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        {actions.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setExpandedSection(expandedSection === 'actions' ? null : 'actions')}
              className="flex items-center justify-between w-full text-left py-1"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('smartOrganize.quickActions') || 'Quick Actions'}
              </span>
              <span className="text-gray-400 dark:text-gray-500">
                {expandedSection === 'actions' ? '▼' : '▶'}
              </span>
            </button>

            {expandedSection === 'actions' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {actions.map((action, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(action)}
                    className="justify-start h-auto py-3 px-4 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-ocean-50 dark:hover:bg-ocean-900/30 hover:border-ocean-400 dark:hover:border-ocean-500 transition-colors"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <span className="text-xl">{action.icon}</span>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {action.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chapters */}
        {hasChapters && (
          <div className="space-y-2">
            <button
              onClick={() => setExpandedSection(expandedSection === 'chapters' ? null : 'chapters')}
              className="flex items-center justify-between w-full text-left py-1"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('smartOrganize.detectedChapters') || 'Detected Chapters'}
              </span>
              <span className="text-gray-400 dark:text-gray-500">
                {expandedSection === 'chapters' ? '▼' : '▶'}
              </span>
            </button>

            {expandedSection === 'chapters' && (
              <div className="space-y-1">
                {analysis.chapters.map((chapter, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleHighlight([chapter.startPage])}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">📖</span>
                      <span className="text-sm text-gray-700 dark:text-gray-200 truncate max-w-[200px]">
                        {chapter.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      p. {chapter.startPage}
                      {chapter.endPage && ` - ${chapter.endPage}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No issues message */}
        {!hasIssues && actions.length === 0 && (
          <div className="text-center py-2">
            <span className="text-green-600 dark:text-green-400 text-sm">
              ✓ {t('smartOrganize.noIssues') || 'No issues detected - document looks good!'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartOrganizePanel;
