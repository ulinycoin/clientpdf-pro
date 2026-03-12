import type React from 'react';
import type { IEditorTool, ToolContext, Point } from './IEditorTool';
import { findNearestTextSpan, mergeTextLine } from '../inline-text-utils';

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function getAllDraftPaths(draft: { points: number[]; paths?: number[][] } | null | undefined): number[][] {
    if (!draft) {
        return [];
    }
    const paths = [...(draft.paths ?? [])];
    if (draft.points.length >= 4) {
        paths.push(draft.points);
    }
    return paths;
}

export function hasAnnotatePenDraft(draft: { points: number[]; paths?: number[][] } | null | undefined): boolean {
    return getAllDraftPaths(draft).length > 0;
}

export function finalizeAnnotatePenDraft(params: {
    draft: { points: number[]; paths?: number[][] } | null;
    color: string;
    width: number;
    elements: ToolContext['elements'];
    applyElements: ToolContext['applyElements'];
    setSelectedElementId: ToolContext['setSelectedElementId'];
    setInlineUiState: ToolContext['setInlineUiState'];
    setDraftStroke: ToolContext['setDraftStroke'];
}): boolean {
    const { draft, color, width, elements, applyElements, setSelectedElementId, setInlineUiState, setDraftStroke } = params;
    if (!hasAnnotatePenDraft(draft)) {
        return false;
    }
    const paths = getAllDraftPaths(draft);
    const [firstPath, ...restPaths] = paths;
    if (!firstPath || firstPath.length < 4) {
        return false;
    }
    const next = {
        id: crypto.randomUUID(),
        type: 'stroke' as const,
        points: firstPath,
        paths: restPaths.length > 0 ? restPaths : undefined,
        color,
        width,
        opacity: 1,
    };
    applyElements([...elements, next]);
    setSelectedElementId(next.id);
    setInlineUiState('selected');
    setDraftStroke(null);
    return true;
}

export const AnnotateTool: IEditorTool = {
    id: 'annotate',
    onPointerDown: (ctx: ToolContext, _event: React.PointerEvent, { x, y }: Point) => {
        if (ctx.textEditor) ctx.commitTextEditor();
        ctx.setIsPointerDown(true);
        if (ctx.annotateMode === 'shapes') {
            ctx.setDraftRect({ startX: x, startY: y, endX: x, endY: y, x, y, w: 0, h: 0 });
            return;
        }
        if (ctx.annotateMode === 'pen') {
            ctx.setDraftStroke((prev) => {
                const nextPaths = [...(prev?.paths ?? [])];
                if (prev?.points && prev.points.length >= 4) {
                    nextPaths.push(prev.points);
                }
                return { points: [x, y], paths: nextPaths };
            });
            return;
        }
        ctx.setDraftStroke({ points: [x, y] });
    },
    onPointerMove: (ctx: ToolContext, _event: React.PointerEvent, { x, y }: Point) => {
        if (!ctx.isPointerDown) return;
        if (ctx.annotateMode === 'shapes') {
            ctx.setDraftRect(prev => prev ? {
                ...prev,
                endX: x,
                endY: y,
                x: Math.min(prev.startX, x),
                y: Math.min(prev.startY, y),
                w: Math.abs(x - prev.startX),
                h: Math.abs(y - prev.startY),
            } : null);
            return;
        }
        ctx.setDraftStroke(prev => prev ? { points: [...prev.points, x, y], paths: prev.paths ?? [] } : null);
    },
    onPointerUp: (ctx: ToolContext, _event: React.PointerEvent, { x, y }: Point) => {
        ctx.setIsPointerDown(false);
        if (ctx.annotateMode === 'shapes') {
            const draftRect = ctx.draftRect;
            if (!draftRect) {
                ctx.setDraftRect(null);
                return;
            }
            if (ctx.shapePreset === 'rectangle') {
                if (draftRect.w > 0.002 && draftRect.h > 0.002) {
                    ctx.applyElements([...ctx.elements, {
                        id: crypto.randomUUID(),
                        type: 'rect',
                        x: draftRect.x,
                        y: draftRect.y,
                        w: draftRect.w,
                        h: draftRect.h,
                        fill: 'transparent',
                        stroke: ctx.shapeColor,
                        strokeWidth: ctx.shapeStrokeWidth,
                        opacity: 1,
                    }]);
                }
            } else {
                const sx = draftRect.startX;
                const sy = draftRect.startY;
                const ex = draftRect.endX;
                const ey = draftRect.endY;
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
                        points.push(
                            ex - ux * head + px * wing,
                            ey - uy * head + py * wing,
                            ex,
                            ey,
                            ex - ux * head - px * wing,
                            ey - uy * head - py * wing,
                        );
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
            ctx.setDraftRect(null);
            ctx.setDraftStroke(null);
            return;
        }
        const draft = ctx.draftStroke;
        if (draft && draft.points.length >= 4) {
            if (ctx.annotateMode === 'pen') {
                return;
            }

            const startX = draft.points[0];
            const startY = draft.points[1];
            const endX = x;
            const endY = y;
            const midPoint = { x: (startX + endX) * 0.5, y: (startY + endY) * 0.5 };
            const anchor = findNearestTextSpan(midPoint, ctx.textLayerSpans, 0.08);
            const mergedLine = anchor ? mergeTextLine(ctx.textLayerSpans, anchor) : null;

            let snappedY: number | null = null;
            let dynamicWidth = 12;

            if (mergedLine) {
                // highlight
                snappedY = mergedLine.top + mergedLine.height * 0.5;
                const viewportScale = document.querySelector('.studio-edit-canvas-content')?.getBoundingClientRect().height || 842;
                dynamicWidth = Math.max(8, mergedLine.height * viewportScale * 0.85);
            }

            const clampedStartX = mergedLine ? clamp(startX, mergedLine.left, mergedLine.left + mergedLine.width) : startX;
            const clampedEndX = mergedLine ? clamp(endX, mergedLine.left, mergedLine.left + mergedLine.width) : endX;
            ctx.applyElements([...ctx.elements, {
                id: crypto.randomUUID(),
                type: 'stroke',
                points: snappedY !== null
                    ? [clampedStartX, snappedY, clampedEndX, snappedY]
                    : draft.points,
                color: ctx.annotateColor,
                width: isNaN(dynamicWidth) ? 12 : dynamicWidth,
                opacity: 0.45
            }]);
        }
        ctx.setDraftStroke(null);
        ctx.setDraftRect(null);
    }
};
