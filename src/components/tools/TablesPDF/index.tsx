import React, { useState } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/common/FileUpload';
import { type UploadedFile } from '@/types/pdf';
import { Table, Download, Loader2, ArrowLeft } from 'lucide-react';
import { tableService, type TableData, type TableStyle } from '@/services/tableService';
import { ExcelTabSelector } from './ExcelTabSelector';
import { toast } from 'sonner';

export const TablesPDF: React.FC = () => {
    const { t } = useI18n();
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [parsedTabs, setParsedTabs] = useState<TableData[]>([]);
    const [selectedTabNames, setSelectedTabNames] = useState<string[]>([]);
    const [showTabSelector, setShowTabSelector] = useState(false);
    const [activeTables, setActiveTables] = useState<TableData[]>([]);
    const [style, setStyle] = useState<TableStyle>({
        headerBgColor: '#5F7FFF',
        headerTextColor: '#FFFFFF',
        rowBgColor1: '#FFFFFF',
        rowBgColor2: '#F9FAFB',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        fontSize: 10,
        padding: 5,
        useStripes: true,
        orientation: 'auto'
    });

    const handleFilesSelected = async (selectedFiles: File[]) => {
        if (selectedFiles.length === 0) return;

        const file = selectedFiles[0];
        const uploadedFile: UploadedFile = {
            id: `${Date.now()}-0`,
            file,
            name: file.name,
            size: file.size,
            status: 'pending'
        };

        setIsProcessing(true);

        try {
            if (file.name.endsWith('.pdf')) {
                setFiles([uploadedFile]);
                setActiveTables([{ name: 'Table 1', data: [["", ""], ["", ""]] }]);
            } else if (file.name.endsWith('.csv')) {
                const result = await tableService.parseCSV(file);
                setActiveTables([result]);
                setFiles([uploadedFile]);
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                const tabs = await tableService.parseExcel(file);
                setFiles([uploadedFile]);
                if (tabs.length > 1) {
                    setParsedTabs(tabs);
                    setSelectedTabNames([tabs[0].name]);
                    setShowTabSelector(true);
                } else {
                    setActiveTables(tabs);
                }
            }
        } catch (error) {
            console.error('Parsing failed:', error);
            toast.error(t('tables.errors.parseFailed'));
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleTab = (name: string) => {
        setSelectedTabNames(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    };

    const confirmTabs = () => {
        setActiveTables(parsedTabs.filter(t => selectedTabNames.includes(t.name)));
        setShowTabSelector(false);
    };

    const handleGenerate = async () => {
        setIsProcessing(true);
        try {
            const isBasePdf = files[0]?.file.name.endsWith('.pdf');
            const pdfBytes = await tableService.generatePDF(
                activeTables,
                style,
                isBasePdf ? files[0].file : undefined
            );
            const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `tables_${Date.now()}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success(t('common.success'));
        } catch (error) {
            console.error('Generation failed:', error);
            toast.error(t('tables.errors.generateFailed'));
        } finally {
            setIsProcessing(false);
        }
    };

    const reset = () => {
        setFiles([]);
        setActiveTables([]);
        setParsedTabs([]);
        setShowTabSelector(false);
    };

    const updateCell = (tableIdx: number, rowIdx: number, colIdx: number, value: string) => {
        setActiveTables(prev => {
            const next = [...prev];
            const table = { ...next[tableIdx] };
            const data = [...table.data];
            const row = [...data[rowIdx]];
            row[colIdx] = value;
            data[rowIdx] = row;
            table.data = data;
            next[tableIdx] = table;
            return next;
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto space-y-4">
                <div className="inline-flex items-center justify-center p-3 bg-ocean-100 dark:bg-ocean-900/30 text-ocean-600 dark:text-ocean-400 rounded-2xl mb-2">
                    <Table size={32} />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                    {t('tables.title')}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    {t('tables.description')}
                </p>
            </div>

            {showTabSelector ? (
                <ExcelTabSelector
                    tabs={parsedTabs}
                    selectedTabs={selectedTabNames}
                    onToggleTab={toggleTab}
                    onConfirm={confirmTabs}
                />
            ) : activeTables.length === 0 ? (
                <div className="max-w-3xl mx-auto">
                    <FileUpload
                        onFilesSelected={handleFilesSelected}
                        accept=".pdf,.csv,.xlsx,.xls"
                        maxFiles={1}
                        multiple={false}
                    />

                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-250px)]">
                    {/* Main Editor Area */}
                    <div className="lg:col-span-3 card p-0 overflow-hidden flex flex-col bg-white dark:bg-privacy-800 border-gray-200 dark:border-privacy-700 shadow-xl rounded-2xl">
                        <div className="p-4 border-b dark:border-privacy-700 flex justify-between items-center bg-gray-50/50 dark:bg-privacy-900/50">
                            <span className="text-sm font-medium">{t('common.selectedFile')}: {files[0]?.file.name}</span>
                            <Button variant="ghost" size="sm" onClick={reset}>
                                <ArrowLeft size={16} className="mr-2" />
                                {t('common.changeFile')}
                            </Button>
                        </div>
                        <div className="flex-1 overflow-auto bg-gray-100 dark:bg-privacy-950/50 p-8 custom-scrollbar">
                            <div className="space-y-12">
                                {activeTables.map((table, tIdx) => (
                                    <div key={tIdx} className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Table size={18} className="text-ocean-500" />
                                            <h4 className="font-bold text-lg">{table.name}</h4>
                                        </div>
                                        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-privacy-700 shadow-sm transition-all hover:shadow-md">
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-xs uppercase bg-gray-50 dark:bg-privacy-900/50 text-gray-700 dark:text-gray-300">
                                                    <tr>
                                                        {table.data[0]?.map((cell, cIdx) => (
                                                            <th key={cIdx} className="px-6 py-3 font-semibold border-b dark:border-privacy-700">
                                                                <input
                                                                    className="bg-transparent w-full outline-none focus:ring-1 focus:ring-ocean-500 rounded px-1"
                                                                    value={String(cell || '')}
                                                                    onChange={(e) => updateCell(tIdx, 0, cIdx, e.target.value)}
                                                                />
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 dark:divide-privacy-700">
                                                    {table.data.slice(1).map((row, rIdx) => {
                                                        const actualRIdx = rIdx + 1;
                                                        return (
                                                            <tr key={rIdx} className="bg-white dark:bg-privacy-800 hover:bg-gray-50 dark:hover:bg-privacy-700/50 transition-colors">
                                                                {row.map((cell, cIdx) => (
                                                                    <td key={cIdx} className="px-6 py-2 whitespace-nowrap">
                                                                        <input
                                                                            className="bg-transparent w-full text-gray-600 dark:text-gray-400 outline-none focus:ring-1 focus:ring-ocean-300 rounded px-1"
                                                                            value={String(cell || '')}
                                                                            onChange={(e) => updateCell(tIdx, actualRIdx, cIdx, e.target.value)}
                                                                        />
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-6">
                        <div className="card p-6 space-y-6 bg-white dark:bg-privacy-800 border-gray-200 dark:border-privacy-700 shadow-xl rounded-2xl sticky top-24">

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('tables.style.header')}</label>
                                    <div className="flex gap-2">
                                        {['#5F7FFF', '#10b981', '#f59e0b', '#ef4444', '#000000'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setStyle(prev => ({ ...prev, headerBgColor: color }))}
                                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${style.headerBgColor === color ? 'border-ocean-500 scale-110' : 'border-transparent'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStyle(prev => ({ ...prev, useStripes: !prev.useStripes }))}
                                    className="flex items-center justify-between w-full p-3 rounded-xl bg-gray-50 dark:bg-privacy-900 border border-gray-100 dark:border-privacy-700 transition-colors hover:bg-gray-100 dark:hover:bg-privacy-800"
                                >
                                    <span className="text-sm font-medium">{t('tables.style.stripes')}</span>
                                    <div className={`w-10 h-6 rounded-full relative transition-colors ${style.useStripes ? 'bg-ocean-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${style.useStripes ? 'right-1' : 'left-1'}`} />
                                    </div>
                                </button>

                                <div className="space-y-3 pt-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('tables.style.orientation')}</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['auto', 'portrait', 'landscape'] as const).map((o) => (
                                            <button
                                                key={o}
                                                onClick={() => setStyle(prev => ({ ...prev, orientation: o }))}
                                                className={`py-2 px-1 text-[10px] font-medium rounded-lg border transition-all ${style.orientation === o
                                                    ? 'bg-ocean-50 border-ocean-200 text-ocean-700 dark:bg-ocean-900/30 dark:border-ocean-800'
                                                    : 'bg-white dark:bg-privacy-900 border-gray-100 dark:border-privacy-700 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {t(`tables.style.orientations.${o}`)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t dark:border-privacy-700">
                                <Button
                                    className="w-full py-6 text-lg font-semibold bg-ocean-600 hover:bg-ocean-700 text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                    disabled={isProcessing}
                                    onClick={handleGenerate}
                                >
                                    {isProcessing ? (
                                        <Loader2 className="mr-2 animate-spin" size={20} />
                                    ) : (
                                        <Download className="mr-2" size={20} />
                                    )}
                                    {t('tables.actions.generate')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
