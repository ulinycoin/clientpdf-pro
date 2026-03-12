import { useCallback, useState, useRef } from 'react';
import { usePlatform } from '../../../../app/react/platform-context';

const ZOOM_MIN = 0.35;
const ZOOM_MAX = 6;
const ZOOM_STEP = 1.25;

export function clampScale(scale: number): number {
    return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, scale));
}

export function useStudioEditZoom(runId: string, initialZoom = 1) {
    const { runtime } = usePlatform();
    const [zoomLevel, setZoomLevel] = useState(initialZoom);
    const containerRef = useRef<HTMLDivElement>(null);

    const zoomAtScreenPoint = useCallback((clientX: number, clientY: number, direction: 'in' | 'out', source: 'wheel' | 'button' = 'button') => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const rect = container.getBoundingClientRect();

        const viewportX = clientX - rect.left;
        const viewportY = clientY - rect.top;

        const oldScale = zoomLevel;
        const factor = direction === 'in' ? ZOOM_STEP : 1 / ZOOM_STEP;
        const nextScale = clampScale(oldScale * factor);

        if (Math.abs(nextScale - oldScale) < 0.0001) return;

        const scrollLeft = container.scrollLeft;
        const scrollTop = container.scrollTop;

        const docX = (viewportX + scrollLeft) / oldScale;
        const docY = (viewportY + scrollTop) / oldScale;

        const nextScrollLeft = docX * nextScale - viewportX;
        const nextScrollTop = docY * nextScale - viewportY;

        setZoomLevel(nextScale);
        runtime.telemetry.track({ type: 'STUDIO_EDIT_ZOOM_CHANGED', runId, toolId: 'studio.edit', source, scaleLevel: nextScale });

        requestAnimationFrame(() => {
            if (containerRef.current) {
                containerRef.current.scrollLeft = nextScrollLeft;
                containerRef.current.scrollTop = nextScrollTop;
            }
        });
    }, [zoomLevel, runtime.telemetry]);

    const zoomIn = useCallback((clientX?: number, clientY?: number) => {
        if (clientX !== undefined && clientY !== undefined) {
            zoomAtScreenPoint(clientX, clientY, 'in');
        } else if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            zoomAtScreenPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, 'in');
        } else {
            setZoomLevel(prev => clampScale(prev * ZOOM_STEP));
        }
    }, [zoomAtScreenPoint]);

    const zoomOut = useCallback((clientX?: number, clientY?: number) => {
        if (clientX !== undefined && clientY !== undefined) {
            zoomAtScreenPoint(clientX, clientY, 'out');
        } else if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            zoomAtScreenPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, 'out');
        } else {
            setZoomLevel(prev => clampScale(prev / ZOOM_STEP));
        }
    }, [zoomAtScreenPoint]);

    const fitToPage = useCallback((pageWidth: number, pageHeight: number, padding = 48) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const availableW = Math.max(1, rect.width - padding * 2);
        const availableH = Math.max(1, rect.height - padding * 2);
        const scale = clampScale(Math.min(availableW / pageWidth, availableH / pageHeight));
        setZoomLevel(scale);
        runtime.telemetry.track({ type: 'STUDIO_EDIT_ZOOM_CHANGED', runId, toolId: 'studio.edit', source: 'preset', preset: 'fitPage', scaleLevel: scale });
    }, [runtime.telemetry, runId]);

    const fitToWidth = useCallback((pageWidth: number, padding = 48) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const availableW = Math.max(1, rect.width - padding * 2);
        const scale = clampScale(availableW / pageWidth);
        setZoomLevel(scale);
        runtime.telemetry.track({ type: 'STUDIO_EDIT_ZOOM_CHANGED', runId, toolId: 'studio.edit', source: 'preset', preset: 'fitWidth', scaleLevel: scale });
    }, [runtime.telemetry, runId]);

    const zoomToHundred = useCallback(() => {
        const scale = clampScale(1);
        setZoomLevel(scale);
        runtime.telemetry.track({ type: 'STUDIO_EDIT_ZOOM_CHANGED', runId, toolId: 'studio.edit', source: 'preset', preset: '100', scaleLevel: scale });
    }, [runtime.telemetry, runId]);

    return {
        zoomLevel,
        setZoomLevel,
        containerRef,
        zoomIn,
        zoomOut,
        zoomAtScreenPoint,
        fitToPage,
        fitToWidth,
        zoomToHundred
    };
}
