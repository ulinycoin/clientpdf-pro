import type { IEditorTool, ToolContext } from './IEditorTool';
import type { ImageElement } from '../editor-types';

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

export function hasSignatureDraft(draft: { points: number[]; paths?: number[][] } | null | undefined): boolean {
    return getAllDraftPaths(draft).length > 0;
}

export function buildSignatureImage(
    draft: { points: number[]; paths?: number[][] },
    color: string,
    strokeWidth: number,
): { dataUrl: string; widthRatio: number; heightRatio: number; x: number; y: number } | null {
    const paths = getAllDraftPaths(draft);
    const points = paths.flat();
    if (points.length < 4) {
        return null;
    }

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < points.length; i += 2) {
        minX = Math.min(minX, points[i]);
        minY = Math.min(minY, points[i + 1]);
        maxX = Math.max(maxX, points[i]);
        maxY = Math.max(maxY, points[i + 1]);
    }
    if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
        return null;
    }

    const pad = clamp(strokeWidth / 800, 0.003, 0.02);
    const x = clamp(minX - pad, 0, 1);
    const y = clamp(minY - pad, 0, 1);
    const w = clamp(maxX - minX + pad * 2, 0.02, 0.95);
    const h = clamp(maxY - minY + pad * 2, 0.01, 0.45);
    if (w < 0.01 || h < 0.008) {
        return null;
    }

    const targetWidth = Math.max(320, Math.min(1800, Math.round(w * 2200)));
    const targetHeight = Math.max(120, Math.min(900, Math.round(h * 2200)));
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext('2d');
    if (!context) {
        return null;
    }

    context.clearRect(0, 0, targetWidth, targetHeight);
    context.strokeStyle = color;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.lineWidth = Math.max(1.6, (strokeWidth / Math.max(w, h)) * 0.0032 * Math.min(targetWidth, targetHeight));
    for (const path of paths) {
        if (path.length < 4) {
            continue;
        }
        context.beginPath();
        for (let i = 0; i < path.length; i += 2) {
            const px = ((path[i] - x) / w) * targetWidth;
            const py = ((path[i + 1] - y) / h) * targetHeight;
            if (i === 0) {
                context.moveTo(px, py);
            } else {
                context.lineTo(px, py);
            }
        }
        context.stroke();
    }

    return {
        dataUrl: canvas.toDataURL('image/png'),
        widthRatio: w,
        heightRatio: h,
        x,
        y,
    };
}

export const SignTool: IEditorTool = {
    id: 'sign',
    onPointerDown: (ctx: ToolContext, _event, { x, y }) => {
        if (ctx.textEditor) ctx.commitTextEditor();
        if (ctx.signMode !== 'draw') {
            ctx.setIsPointerDown(false);
            return;
        }
        ctx.setIsPointerDown(true);
        ctx.setDraftStroke((prev) => {
            const nextPaths = [...(prev?.paths ?? [])];
            if (prev?.points && prev.points.length >= 4) {
                nextPaths.push(prev.points);
            }
            return { points: [x, y], paths: nextPaths };
        });
    },
    onPointerMove: (ctx, _event, { x, y }) => {
        if (ctx.signMode !== 'draw' || !ctx.isPointerDown) {
            return;
        }
        ctx.setDraftStroke((prev) => {
            if (!prev) {
                return { points: [x, y], paths: [] };
            }
            return {
                points: [...prev.points, x, y],
                paths: prev.paths ?? [],
            };
        });
    },
    onPointerUp: (ctx: ToolContext) => {
        ctx.setIsPointerDown(false);
    },
};

export function finalizeSignatureDraft(params: {
    draft: { points: number[]; paths?: number[][] } | null;
    color: string;
    strokeWidth: number;
    elements: ToolContext['elements'];
    applyElements: ToolContext['applyElements'];
    setSelectedElementId: ToolContext['setSelectedElementId'];
    setInlineUiState: ToolContext['setInlineUiState'];
    setDraftStroke: ToolContext['setDraftStroke'];
}): boolean {
    const { draft, color, strokeWidth, elements, applyElements, setSelectedElementId, setInlineUiState, setDraftStroke } = params;
    if (!hasSignatureDraft(draft)) {
        return false;
    }
    const rendered = buildSignatureImage(draft!, color, strokeWidth);
    if (!rendered) {
        return false;
    }
    const next: ImageElement = {
        id: crypto.randomUUID(),
        type: 'image',
        x: rendered.x,
        y: rendered.y,
        w: rendered.widthRatio,
        h: rendered.heightRatio,
        opacity: 1,
        dataUrl: rendered.dataUrl,
        signatureSource: 'drawn',
    };
    applyElements([...elements, next]);
    setSelectedElementId(next.id);
    setInlineUiState('selected');
    setDraftStroke(null);
    return true;
}
