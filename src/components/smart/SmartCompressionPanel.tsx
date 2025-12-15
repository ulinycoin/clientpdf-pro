import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, BarChart3, Image as ImageIcon, FileText } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import type { CompressionAnalysis } from '@/types/pdf';

interface SmartCompressionPanelProps {
    analysis: CompressionAnalysis | null;
    isAnalyzing: boolean;
    onApplyRecommendation: (quality: 'low' | 'medium' | 'high') => void;
    currentQuality: 'low' | 'medium' | 'high';
}

export const SmartCompressionPanel: React.FC<SmartCompressionPanelProps> = ({
    analysis,
    isAnalyzing,
    onApplyRecommendation,
    currentQuality
}) => {
    const { t } = useI18n();

    if (isAnalyzing) {
        return (
            <Card className="border-ocean-200 dark:border-ocean-800 bg-ocean-50/50 dark:bg-ocean-900/20">
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="animate-spin w-5 h-5 border-2 border-ocean-500 border-t-transparent rounded-full" />
                    <span className="text-sm text-ocean-700 dark:text-ocean-300">
                        {t('smartCompression.analyzing')}
                    </span>
                </CardContent>
            </Card>
        );
    }

    if (!analysis) return null;

    const isRecommendedApplied = currentQuality === analysis.recommendedQuality;

    return (
        <Card className="border-ocean-200 dark:border-ocean-800 bg-white dark:bg-gray-800 overflow-hidden relative">
            {/* Background gradient effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-ocean-100/50 to-purple-100/50 dark:from-ocean-900/20 dark:to-purple-900/20 rounded-bl-full pointer-events-none" />

            <CardContent className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-ocean-500 to-purple-500 rounded-lg shadow-sm">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                {t('smartCompression.title')}
                                <Badge variant="secondary" className="text-[10px] bg-ocean-100 text-ocean-700 dark:bg-ocean-900/50 dark:text-ocean-300 border-ocean-200">
                                    AI
                                </Badge>
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {analysis.savingPotential === 'high'
                                    ? t('smartCompression.highPotential')
                                    : t('smartCompression.optimized')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className={`p-2 rounded-lg border ${analysis.isImageHeavy ? 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-900/10 dark:border-amber-800 dark:text-amber-400' : 'bg-gray-50 border-gray-100 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <ImageIcon className="w-4 h-4" />
                            <span className="font-medium">{t('smartCompression.images')}</span>
                        </div>
                        <p className="text-xs opacity-80">{analysis.isImageHeavy ? t('smartCompression.heavy') : t('smartCompression.light')}</p>
                    </div>

                    <div className="p-2 rounded-lg border bg-gray-50 border-gray-100 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2 mb-1">
                            <BarChart3 className="w-4 h-4" />
                            <span className="font-medium">{t('smartCompression.structure')}</span>
                        </div>
                        <ul className="text-xs opacity-80 list-disc list-inside">
                            {analysis.insights.slice(0, 1).map((insight, i) => (
                                <li key={i}>{t(insight.key, insight.params)}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="bg-ocean-50 dark:bg-ocean-900/20 rounded-lg p-3 border border-ocean-100 dark:border-ocean-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-ocean-900 dark:text-ocean-100">
                            {t('smartCompression.recommendation')}
                        </span>
                        <Badge variant="outline" className="border-ocean-200 text-ocean-700 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                            {t(`compress.quality.${analysis.recommendedQuality}.name`)}
                        </Badge>
                    </div>

                    {!isRecommendedApplied && (
                        <Button
                            size="sm"
                            className="w-full bg-ocean-600 hover:bg-ocean-700 text-white shadow-sm"
                            onClick={() => onApplyRecommendation(analysis.recommendedQuality)}
                        >
                            <span className="mr-2">{t('smartCompression.apply')}</span>
                            <ArrowRight className="w-3 h-3" />
                        </Button>
                    )}
                    {isRecommendedApplied && (
                        <div className="text-center text-xs text-ocean-600 dark:text-ocean-400 font-medium py-1">
                            ✓ {t('smartCompression.applied')}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
