import type React from 'react';
import type { IEditorTool, ToolContext, Point } from './IEditorTool';
import type { EditorToolId } from '../editor-types';

export const createRectTool = (id: EditorToolId): IEditorTool => ({
    id,
    onPointerDown: (ctx: ToolContext, _event: React.PointerEvent, { x, y }: Point) => {
        if (ctx.textEditor) ctx.commitTextEditor();
        ctx.setIsPointerDown(true);
        ctx.setDraftRect({ startX: x, startY: y, endX: x, endY: y, x, y, w: 0, h: 0 });
    },
    onPointerMove: (ctx: ToolContext, _event: React.PointerEvent, { x, y }: Point) => {
        if (!ctx.isPointerDown) return;
        ctx.setDraftRect(prev => prev ? {
            ...prev,
            endX: x,
            endY: y,
            x: Math.min(prev.startX, x),
            y: Math.min(prev.startY, y),
            w: Math.abs(x - prev.startX),
            h: Math.abs(y - prev.startY)
        } : null);
    },
    onPointerUp: (ctx: ToolContext, _event: React.PointerEvent, _worldPos: Point) => {
        ctx.setIsPointerDown(false);
        const draft = ctx.draftRect;
        if (draft) {
            if (id === 'whiteout' || ctx.shapePreset === 'rectangle') {
                if (draft.w <= 0.002 || draft.h <= 0.002) {
                    ctx.setDraftRect(null);
                    return;
                }
                ctx.applyElements([...ctx.elements, {
                    id: crypto.randomUUID(), type: 'rect', x: draft.x, y: draft.y,
                    w: draft.w, h: draft.h,
                    fill: id === 'whiteout' ? (ctx.whiteoutColor || '#ffffff') : 'transparent',
                    stroke: id === 'whiteout' ? 'transparent' : ctx.shapeColor,
                    strokeWidth: id === 'whiteout' ? 0 : ctx.shapeStrokeWidth,
                    opacity: 1
                }]);
            } else {
                const sx = draft.startX;
                const sy = draft.startY;
                const ex = draft.endX;
                const ey = draft.endY;
                const dx = ex - sx;
                const dy = ey - sy;
                const len = Math.hypot(dx, dy);
                if (len > 0.002) {
                    const points: number[] = [sx, sy, ex, ey];
                    if (ctx.shapePreset === 'arrow') {
                        const ux = dx / len;
                        const uy = dy / len;
                        const px = -uy;
                        const py = ux;
                        const head = Math.min(0.045, Math.max(0.018, len * 0.24));
                        const wing = head * 0.62;
                        const wingAX = ex - ux * head + px * wing;
                        const wingAY = ey - uy * head + py * wing;
                        const wingBX = ex - ux * head - px * wing;
                        const wingBY = ey - uy * head - py * wing;
                        points.push(wingAX, wingAY, ex, ey, wingBX, wingBY);
                    }
                    ctx.applyElements([...ctx.elements, {
                        id: crypto.randomUUID(),
                        type: 'stroke',
                        points,
                        color: ctx.shapeColor,
                        width: ctx.shapeStrokeWidth,
                        opacity: 1,
                    }]);
                }
            }
        }
        ctx.setDraftRect(null);
    }
});

export const ShapesTool = createRectTool('shapes');
export const WhiteoutTool = createRectTool('whiteout');
