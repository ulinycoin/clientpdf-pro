import React from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Type, Minus, Plus } from 'lucide-react';
import type { TextElement } from '@/types/contentEditor';

interface FloatingToolbarProps {
    element: TextElement;
    onUpdate: (id: string, updates: Partial<TextElement>) => void;
    isMobile?: boolean;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ element, onUpdate, isMobile }) => {
    return (
        <div
            className={`
        flex items-center gap-1 p-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-xl backdrop-blur-md
        ${isMobile ? 'fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4' : 'absolute bottom-full left-1/2 -translate-x-1/2 mb-4 animate-in fade-in slide-in-from-bottom-2'}
      `}
        >
            <div className="flex items-center gap-1 border-r border-gray-100 dark:border-gray-800 pr-1 mr-1">
                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 p-0 ${element.bold ? 'bg-ocean-100 dark:bg-ocean-900/30 text-ocean-600' : ''}`}
                    onClick={() => onUpdate(element.id, { bold: !element.bold })}
                >
                    <Bold className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 p-0 ${element.italic ? 'bg-ocean-100 dark:bg-ocean-900/30 text-ocean-600' : ''}`}
                    onClick={() => onUpdate(element.id, { italic: !element.italic })}
                >
                    <Italic className="w-4 h-4" />
                </Button>
            </div>

            <div className="flex items-center gap-2 px-1">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onUpdate(element.id, { fontSize: Math.max(8, element.fontSize - 1) })}
                >
                    <Minus className="w-3 h-3" />
                </Button>
                <div className="flex items-center gap-1 min-w-[40px] justify-center">
                    <Type className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-bold">{element.fontSize}</span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onUpdate(element.id, { fontSize: Math.min(120, element.fontSize + 1) })}
                >
                    <Plus className="w-3 h-3" />
                </Button>
            </div>
        </div>
    );
};
