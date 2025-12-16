/**
 * Smart Merge Panel
 * Displays AI-powered sorting suggestions, duplicate warnings, and date analysis
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/hooks/useI18n';
import smartMergeService, {
  type SmartMergeAnalysis,
  type SmartSortSuggestion,
} from '@/services/smartMergeService';

interface SmartMergePanelProps {
  files: Array<{ id: string; file: File; name: string }>;
  onApplySort: (newOrder: string[]) => void;
  onRemoveDuplicates?: (fileIds: string[]) => void;
}

export const SmartMergePanel: React.FC<SmartMergePanelProps> = ({
  files,
  onApplySort,
  onRemoveDuplicates,
}) => {
  const { t, language } = useI18n();
  const [analysis, setAnalysis] = useState<SmartMergeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<'suggestions' | 'dates' | 'duplicates' | null>('suggestions');
  const [isEnabled, setIsEnabled] = useState(true);

  // Analyze files when they change
  useEffect(() => {
    if (files.length < 2 || !isEnabled) {
      setAnalysis(null);
      return;
    }

    const analyzeFiles = async () => {
      setIsAnalyzing(true);
      setError(null);

      try {
        const result = await smartMergeService.analyzeDocuments(
          files.map(f => ({ id: f.id, file: f.file }))
        );
        setAnalysis(result);
      } catch (err) {
        console.error('Analysis failed:', err);
        setError('Failed to analyze documents');
      } finally {
        setIsAnalyzing(false);
      }
    };

    // Debounce analysis
    const timeoutId = setTimeout(analyzeFiles, 500);
    return () => clearTimeout(timeoutId);
  }, [files, isEnabled]);

  const handleApplySuggestion = (suggestion: SmartSortSuggestion) => {
    onApplySort(suggestion.order);
  };

  const handleRemoveDuplicates = (fileIds: string[]) => {
    // Keep only the first file from duplicates
    const toRemove = fileIds.slice(1);
    onRemoveDuplicates?.(toRemove);
  };

  // Don't render if not enough files
  if (files.length < 2) return null;

  // Toggle component
  const ToggleSwitch = () => (
    <button
      onClick={() => setIsEnabled(!isEnabled)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isEnabled ? 'bg-ocean-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      aria-label={isEnabled ? 'Disable Smart Merge' : 'Enable Smart Merge'}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-1'
          }`}
      />
    </button>
  );

  // Disabled state - compact view
  if (!isEnabled) {
    return (
      <Card className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 opacity-60">
              <span className="text-base">🧠</span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('smartMerge.title') || 'Smart Merge'}
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
                {t('smartMerge.analyzing') || 'Analyzing documents...'}
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

  const { suggestions, duplicates, warnings, documents } = analysis;
  const hasUsefulData = suggestions.length > 0 || duplicates.length > 0;

  if (!hasUsefulData) return null;

  return (
    <Card className="border-ocean-400/50 dark:border-ocean-500/30 bg-white dark:bg-gray-800/90 shadow-sm">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧠</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t('smartMerge.title') || 'Smart Merge'}
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

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-2">
            {warnings.map((warning, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 p-2 rounded-lg text-sm ${warning.severity === 'warning'
                  ? 'bg-amber-100/80 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
                  : 'bg-blue-100/80 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                  }`}
              >
                <span>{warning.severity === 'warning' ? '⚠️' : 'ℹ️'}</span>
                <span>{warning.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Sort Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setExpandedSection(expandedSection === 'suggestions' ? null : 'suggestions')}
              className="flex items-center justify-between w-full text-left py-1"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('smartMerge.sortSuggestions') || 'Sort Suggestions'}
              </span>
              <span className="text-gray-400 dark:text-gray-500">{expandedSection === 'suggestions' ? '▼' : '▶'}</span>
            </button>

            {expandedSection === 'suggestions' && (
              <div className="grid grid-cols-1 gap-3">
                {suggestions.map((suggestion, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplySuggestion(suggestion)}
                    className="justify-start h-auto py-3 px-4 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-ocean-50 dark:hover:bg-ocean-900/30 hover:border-ocean-400 dark:hover:border-ocean-500 transition-colors"
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-base">
                          {suggestion.type === 'date_asc' && '📅'}
                          {suggestion.type === 'date_desc' && '📅'}
                          {suggestion.type === 'filename' && '🔢'}
                          {suggestion.type === 'size' && '📊'}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {getSuggestionLabel(suggestion.type, language)}
                        </span>
                        {suggestion.confidence > 0.7 && (
                          <Badge className="ml-auto text-[10px] bg-green-500 text-white border-0">
                            {Math.round(suggestion.confidence * 100)}%
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getSuggestionDescription(suggestion.type, language)}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Duplicate Detection */}
        {duplicates.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setExpandedSection(expandedSection === 'duplicates' ? null : 'duplicates')}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                {t('smartMerge.duplicatesFound') || 'Possible Duplicates Found'}
              </span>
              <span className="text-gray-400">{expandedSection === 'duplicates' ? '▼' : '▶'}</span>
            </button>

            {expandedSection === 'duplicates' && (
              <div className="space-y-2">
                {duplicates.map((group, idx) => {
                  const groupFiles = group.files
                    .map(id => files.find(f => f.id === id))
                    .filter(Boolean);

                  return (
                    <div
                      key={idx}
                      className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="text-sm text-amber-800 dark:text-amber-200">
                            {groupFiles.length} {t('smartMerge.similarFiles') || 'similar files'}:
                          </p>
                          <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-0.5">
                            {groupFiles.map((f, i) => (
                              <li key={i} className="truncate max-w-[200px]">
                                • {f?.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {onRemoveDuplicates && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveDuplicates(group.files)}
                            className="text-xs border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                          >
                            {t('smartMerge.keepFirst') || 'Keep First'}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Date Info */}
        {documents.some(d => d.primaryDate) && (
          <div className="space-y-2">
            <button
              onClick={() => setExpandedSection(expandedSection === 'dates' ? null : 'dates')}
              className="flex items-center justify-between w-full text-left py-1"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('smartMerge.detectedDates') || 'Detected Dates'}
              </span>
              <span className="text-gray-400 dark:text-gray-500">{expandedSection === 'dates' ? '▼' : '▶'}</span>
            </button>

            {expandedSection === 'dates' && (
              <div className="grid grid-cols-2 gap-2">
                {documents
                  .filter(d => d.primaryDate)
                  .map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs border border-gray-200 dark:border-gray-600"
                    >
                      <span className="text-gray-400">📄</span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-gray-700 dark:text-gray-200">{doc.fileName}</p>
                        <p className="text-ocean-600 dark:text-ocean-400 font-medium">
                          {smartMergeService.formatDate(doc.primaryDate!, language)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper functions for localized labels
function getSuggestionLabel(type: string, lang: string): string {
  const labels: Record<string, Record<string, string>> = {
    date_asc: { en: 'Chronological', ru: 'Хронологически', de: 'Chronologisch', fr: 'Chronologique', es: 'Cronológico' },
    date_desc: { en: 'Newest First', ru: 'Сначала новые', de: 'Neueste zuerst', fr: 'Plus récent', es: 'Más reciente' },
    filename: { en: 'By Filename', ru: 'По имени файла', de: 'Nach Dateiname', fr: 'Par nom', es: 'Por nombre' },
    size: { en: 'By Size', ru: 'По размеру', de: 'Nach Größe', fr: 'Par taille', es: 'Por tamaño' },
  };
  return labels[type]?.[lang] || labels[type]?.en || type;
}

function getSuggestionDescription(type: string, lang: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    date_asc: { en: 'Oldest first', ru: 'От старых к новым', de: 'Älteste zuerst', fr: 'Du plus ancien', es: 'Del más antiguo' },
    date_desc: { en: 'Newest first', ru: 'От новых к старым', de: 'Neueste zuerst', fr: 'Du plus récent', es: 'Del más reciente' },
    filename: { en: 'By numbers in names', ru: 'По номерам в именах', de: 'Nach Nummern', fr: 'Par numéros', es: 'Por números' },
    size: { en: 'Largest first', ru: 'Большие первыми', de: 'Größte zuerst', fr: 'Plus grands', es: 'Más grandes' },
  };
  return descriptions[type]?.[lang] || descriptions[type]?.en || '';
}

export default SmartMergePanel;
