import type React from 'react';
import type { IEditorTool, ToolContext, Point } from './IEditorTool';
import type { WatermarkElement } from '../editor-types';

export const WatermarkTool: IEditorTool = {
    id: 'watermark',
    onPointerDown: (ctx: ToolContext, _event: React.PointerEvent, { x, y }: Point) => {
        if (ctx.textEditor) ctx.commitTextEditor();
        ctx.setIsPointerDown(false);

        const options = ctx.watermarkOptions;
        const next: WatermarkElement = {
            id: crypto.randomUUID(),
            type: 'watermark',
            x: Math.max(0, Math.min(0.95, x)),
            y: Math.max(0, Math.min(0.95, y)),
            w: 0.32,
            h: 0.08,
            text: options.text,
            color: options.color,
            fontSize: options.fontSize,
            fontFamily: options.fontFamily,
            fontWeight: options.fontWeight,
            fontStyle: options.fontStyle,
            opacity: options.opacity,
            rotation: options.rotation,
            repeatEnabled: options.repeatEnabled,
            repeatCols: options.repeatCols,
            repeatRows: options.repeatRows,
            repeatGapX: options.repeatGapX,
            repeatGapY: options.repeatGapY,
        };

        ctx.applyElements([...ctx.elements, next]);
        ctx.setSelectedElementId(next.id);
        ctx.setInlineUiState('selected');
    },
    onPointerMove: () => {
        // Watermark is inserted on click and transformed with handles.
    },
    onPointerUp: (ctx: ToolContext) => {
        ctx.setIsPointerDown(false);
    },
};
