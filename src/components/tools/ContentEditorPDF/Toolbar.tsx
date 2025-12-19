import React from 'react';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    ChevronRight,
    Undo,
    Redo,
    MousePointer2,
    Sparkles,
    Plus,
    Save,
    Trash2
} from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';

interface ToolbarProps {
    currentPage: number;
    totalPages: number;
    toolMode: 'select' | 'add' | 'edit';
    canUndo: boolean;
    canRedo: boolean;
    onPageChange: (page: number) => void;
    onUndo: () => void;
    onRedo: () => void;
    onToolModeChange: (mode: 'select' | 'add' | 'edit') => void;
    onReset: () => void;
    onSave: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
    currentPage,
    totalPages,
    toolMode,
    canUndo,
    canRedo,
    onPageChange,
    onUndo,
    onRedo,
    onToolModeChange,
    onReset,
    onSave
}) => {
    const { t } = useI18n();

    return (
        <div className="flex flex-nowrap items-center justify-between gap-2 p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all overflow-x-auto no-scrollbar min-w-0">
            {/* Mode Selectors */}
            <div className="flex shrink-0 items-center gap-1.5 p-1 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                <Button
                    variant={toolMode === 'select' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onToolModeChange('select')}
                    className={`h-9 px-3 rounded-lg transition-all ${toolMode === 'select' ? 'bg-ocean-500 shadow-md text-white' : ''}`}
                >
                    <MousePointer2 className="w-4 h-4 mr-2" />
                    <span className="text-xs font-semibold">{t('addText.modeSelect')}</span>
                </Button>
                <Button
                    variant={toolMode === 'add' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onToolModeChange('add')}
                    className={`h-9 px-3 rounded-lg transition-all ${toolMode === 'add' ? 'bg-ocean-500 shadow-md text-white' : ''}`}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="text-xs font-semibold">{t('addText.modeAdd')}</span>
                </Button>
                <Button
                    variant={toolMode === 'edit' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onToolModeChange('edit')}
                    className={`h-9 px-3 rounded-lg transition-all ${toolMode === 'edit' ? 'bg-purple-500 shadow-md text-white hover:bg-purple-600' : ''}`}
                >
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span className="text-xs font-semibold">{t('editText.smartEdit') || 'Smart Edit'}</span>
                </Button>
            </div>

            {/* Navigation */}
            <div className="flex shrink-0 items-center gap-2">
                <div className="flex items-center gap-1 bg-gray-50/50 dark:bg-gray-800/50 p-1 rounded-xl">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        disabled={currentPage <= 1}
                        onClick={() => onPageChange(currentPage - 1)}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs font-bold px-2 min-w-[60px] text-center whitespace-nowrap">
                        {currentPage} / {totalPages}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        disabled={currentPage >= totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-2">
                <div className="flex items-center gap-1 border-r border-gray-100 dark:border-gray-800 pr-2 mr-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title={t('common.reset')}
                        onClick={() => {
                            if (window.confirm(t('common.clearAll') + '?')) {
                                onReset();
                            }
                        }}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl"
                        disabled={!canUndo}
                        onClick={onUndo}
                    >
                        <Undo className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl"
                        disabled={!canRedo}
                        onClick={onRedo}
                    >
                        <Redo className="w-4 h-4" />
                    </Button>
                </div>

                <Button
                    onClick={onSave}
                    size="sm"
                    className="bg-ocean-600 hover:bg-ocean-700 text-white shadow-lg hover:shadow-xl transition-all rounded-xl px-4 h-10 font-bold"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {t('common.save')}
                </Button>
            </div>
        </div>
    );
};
