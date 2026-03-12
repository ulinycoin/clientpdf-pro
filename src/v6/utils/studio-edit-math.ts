import type React from 'react';

export function clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
}

export function toWorldPointByRect(event: React.PointerEvent<HTMLElement> | MouseEvent | PointerEvent, rect: DOMRect): { x: number; y: number } {
    const x = clamp01((event.clientX - rect.left) / rect.width);
    const y = clamp01((event.clientY - rect.top) / rect.height);
    return { x, y };
}

export function getStrokeBounds(points: number[]): { minX: number; minY: number; maxX: number; maxY: number } {
    let minX = 1;
    let minY = 1;
    let maxX = 0;
    let maxY = 0;
    for (let i = 0; i < points.length; i += 2) {
        const x = points[i] ?? 0;
        const y = points[i + 1] ?? 0;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
    }
    return { minX, minY, maxX, maxY };
}

export function moveStrokePoints(points: number[], dx: number, dy: number): number[] {
    const out = [...points];
    for (let i = 0; i < out.length; i += 2) {
        out[i] = clamp01((out[i] ?? 0) + dx);
        out[i + 1] = clamp01((out[i + 1] ?? 0) + dy);
    }
    return out;
}

export function resizeStrokePoints(
    points: number[],
    bounds: { minX: number; minY: number; maxX: number; maxY: number },
    scaleX: number,
    scaleY: number,
): number[] {
    const width = Math.max(0.0001, bounds.maxX - bounds.minX);
    const height = Math.max(0.0001, bounds.maxY - bounds.minY);
    const out = [...points];
    for (let i = 0; i < out.length; i += 2) {
        const x = out[i] ?? 0;
        const y = out[i + 1] ?? 0;
        const nx = bounds.minX + ((x - bounds.minX) / width) * (width * scaleX);
        const ny = bounds.minY + ((y - bounds.minY) / height) * (height * scaleY);
        out[i] = clamp01(nx);
        out[i + 1] = clamp01(ny);
    }
    return out;
}
