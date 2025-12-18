import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Bold,
    Italic,
    Trash2,
    Type,
    Palette,
    Maximize,
    RotateCw,
    Ghost,
    ChevronDown,
    ChevronUp,
    Square,
    AlignLeft,
    AlignCenter,
    AlignRight,
    StretchHorizontal
} from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import type { TextElement } from '@/types/contentEditor';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface FormatPanelProps {
    selectedElement: TextElement | null;
    onElementUpdate: (id: string, updates: Partial<TextElement>) => void;
    onDelete: (id: string) => void;
}

export const FormatPanel: React.FC<FormatPanelProps> = ({
    selectedElement,
    onElementUpdate,
    onDelete
}) => {
    const { t } = useI18n();
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        style: true,
        appearance: true
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    if (!selectedElement) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center justify-center text-gray-400">
                    <Type className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('addText.format.title')}</h4>
                    <p className="text-xs text-gray-500 mt-1">{t('addText.clickToEdit')}</p>
                </div>
            </div>
        );
    }

    const fontFamilies = [
        'Roboto',
        'Helvetica',
        'Times New Roman',
        'Courier New',
        'Arial'
    ];

    const colors = [
        '#000000', '#4B5563', '#9CA3AF', '#FFFFFF',
        '#EF4444', '#F97316', '#F59E0B', '#10B981',
        '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-20 md:pb-0">
            {/* Text Content */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-ocean-500" />
                    <Label className="text-sm font-semibold">{t('addText.format.textContent')}</Label>
                </div>
                <textarea
                    value={selectedElement.text}
                    onChange={(e) => onElementUpdate(selectedElement.id, { text: e.target.value })}
                    placeholder={t('addText.format.placeholder')}
                    className="w-full min-h-[100px] p-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 outline-none transition-all resize-none shadow-sm"
                />
            </div>

            <div className="space-y-4">
                {/* Style Section */}
                <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
                    <button
                        onClick={() => toggleSection('style')}
                        className="flex items-center justify-between w-full py-2 group"
                    >
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                                <Maximize className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-sm font-semibold">{t('addText.format.fontFamily')}</span>
                        </div>
                        {expandedSections.style ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>

                    {expandedSections.style && (
                        <div className="pt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <Select
                                value={selectedElement.fontFamily}
                                onValueChange={(value) => onElementUpdate(selectedElement.id, { fontFamily: value })}
                            >
                                <SelectTrigger className="w-full bg-white dark:bg-gray-800 rounded-xl h-10 border-gray-200 dark:border-gray-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {fontFamilies.map(font => (
                                        <SelectItem key={font} value={font}>
                                            <span style={{ fontFamily: font }}>{font}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-xs text-gray-500">{t('addText.format.fontSize')}</Label>
                                    <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{selectedElement.fontSize}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="8"
                                    max="120"
                                    step="1"
                                    value={selectedElement.fontSize}
                                    onChange={(e) => onElementUpdate(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-ocean-500"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant={selectedElement.bold ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => onElementUpdate(selectedElement.id, { bold: !selectedElement.bold })}
                                    className={`flex-1 rounded-xl h-10 ${selectedElement.bold ? 'bg-ocean-500 shadow-md text-white hover:bg-ocean-600' : 'bg-transparent text-gray-700 dark:text-gray-300'}`}
                                >
                                    <Bold className="w-4 h-4 mr-2" />
                                    {t('addText.format.bold')}
                                </Button>
                                <Button
                                    variant={selectedElement.italic ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => onElementUpdate(selectedElement.id, { italic: !selectedElement.italic })}
                                    className={`flex-1 rounded-xl h-10 ${selectedElement.italic ? 'bg-ocean-500 shadow-md text-white hover:bg-ocean-600' : 'bg-transparent text-gray-700 dark:text-gray-300'}`}
                                >
                                    <Italic className="w-4 h-4 mr-2" />
                                    {t('addText.format.italic')}
                                </Button>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <Label className="text-xs text-gray-500">{t('addText.format.alignment')}</Label>
                                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                                    {(['left', 'center', 'right'] as const).map(align => (
                                        <Button
                                            key={align}
                                            variant="ghost"
                                            size="sm"
                                            className={`flex-1 h-8 rounded-lg ${selectedElement.textAlign === align ? 'bg-white dark:bg-gray-700 shadow-sm text-ocean-600' : 'text-gray-500'}`}
                                            onClick={() => onElementUpdate(selectedElement.id, { textAlign: align })}
                                        >
                                            {align === 'left' && <AlignLeft className="w-4 h-4" />}
                                            {align === 'center' && <AlignCenter className="w-4 h-4" />}
                                            {align === 'right' && <AlignRight className="w-4 h-4" />}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <StretchHorizontal className="w-3.5 h-3.5 text-gray-400" />
                                        <Label className="text-xs text-gray-500">{t('addText.format.fitToWidth')}</Label>
                                    </div>
                                    <span className="text-xs font-bold">{Math.round((selectedElement.horizontalScaling || 1) * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="2.0"
                                    step="0.01"
                                    value={selectedElement.horizontalScaling || 1.0}
                                    onChange={(e) => onElementUpdate(selectedElement.id, { horizontalScaling: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-ocean-500"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Appearance Section */}
                <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
                    <button
                        onClick={() => toggleSection('appearance')}
                        className="flex items-center justify-between w-full py-2 group"
                    >
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                                <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-sm font-semibold">{t('addText.format.textColor')}</span>
                        </div>
                        {expandedSections.appearance ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>

                    {expandedSections.appearance && (
                        <div className="pt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="grid grid-cols-6 gap-2">
                                {colors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => onElementUpdate(selectedElement.id, { color })}
                                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 shadow-sm ${selectedElement.color === color ? 'border-ocean-500 scale-110' : 'border-transparent'
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Ghost className="w-3.5 h-3.5 text-gray-400" />
                                        <Label className="text-xs text-gray-500">{t('addText.format.opacity')}</Label>
                                    </div>
                                    <span className="text-xs font-bold">{selectedElement.opacity}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={selectedElement.opacity}
                                    onChange={(e) => onElementUpdate(selectedElement.id, { opacity: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-ocean-500"
                                />
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <RotateCw className="w-3.5 h-3.5 text-gray-400" />
                                        <Label className="text-xs text-gray-500">{t('addText.format.rotation')}</Label>
                                    </div>
                                    <span className="text-xs font-bold">{selectedElement.rotation}°</span>
                                </div>
                                <input
                                    type="range"
                                    min="-180"
                                    max="180"
                                    step="1"
                                    value={selectedElement.rotation}
                                    onChange={(e) => onElementUpdate(selectedElement.id, { rotation: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-ocean-500"
                                />
                            </div>

                            {selectedElement.originalRect && (
                                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <Square className="w-3.5 h-3.5 text-gray-400" />
                                        <Label className="text-xs text-gray-500">Background Cover</Label>
                                    </div>
                                    <div className="flex gap-2">
                                        {['#FFFFFF', '#F3F4F6', '#000000'].map(bg => (
                                            <button
                                                key={bg}
                                                className={`w-6 h-6 rounded border ${selectedElement.backgroundColor === bg ? 'ring-2 ring-ocean-500' : 'border-gray-200 dark:border-gray-700'}`}
                                                style={{ backgroundColor: bg }}
                                                onClick={() => onElementUpdate(selectedElement.id, { backgroundColor: bg })}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(selectedElement.id)}
                    className="w-full h-11 rounded-xl text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 transition-all border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('addText.format.delete')}
                </Button>
            </div>
        </div>
    );
};
