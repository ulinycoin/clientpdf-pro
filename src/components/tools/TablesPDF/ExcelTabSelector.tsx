import React from 'react';
import { useI18n } from '@/hooks/useI18n';
import { Button } from '@/components/ui/button';
import { Check, Layers } from 'lucide-react';
import { type TableData } from '@/services/tableService';

interface ExcelTabSelectorProps {
    tabs: TableData[];
    selectedTabs: string[];
    onToggleTab: (name: string) => void;
    onConfirm: () => void;
}

export const ExcelTabSelector: React.FC<ExcelTabSelectorProps> = ({
    tabs,
    selectedTabs,
    onToggleTab,
    onConfirm
}) => {
    const { t } = useI18n();

    return (
        <div className="card p-6 bg-white dark:bg-privacy-800 border-gray-200 dark:border-privacy-700 shadow-xl rounded-2xl max-w-md w-full mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                    <Layers size={20} />
                </div>
                <h3 className="text-xl font-bold">{t('tables.selectTabs')}</h3>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('tables.selectedTabs', { count: selectedTabs.length })}
            </p>

            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {tabs.map((tab) => {
                    const isSelected = selectedTabs.includes(tab.name);
                    return (
                        <button
                            key={tab.name}
                            onClick={() => onToggleTab(tab.name)}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${isSelected
                                ? 'bg-ocean-50 dark:bg-ocean-900/20 border-ocean-200 dark:border-ocean-800 text-ocean-700 dark:text-ocean-300'
                                : 'bg-gray-50 dark:bg-privacy-900 border-gray-200 dark:border-privacy-700 text-gray-700 dark:text-gray-300 hover:border-ocean-300 dark:hover:border-ocean-700'
                                }`}
                        >
                            <div className="flex flex-col items-start gap-1">
                                <span className="font-semibold text-sm truncate max-w-[200px]">{tab.name}</span>
                                <span className="text-xs opacity-60">
                                    {tab.data.length} {t('tables.rows')} • {tab.data[0]?.length || 0} {t('tables.cols')}
                                </span>
                            </div>
                            {isSelected && <Check size={18} className="text-ocean-500" />}
                        </button>
                    );
                })}
            </div>

            <Button
                className="w-full py-6 text-lg font-semibold bg-ocean-600 hover:bg-ocean-700 text-white rounded-xl"
                onClick={onConfirm}
                disabled={selectedTabs.length === 0}
            >
                {t('common.done')}
            </Button>
        </div>
    );
};
