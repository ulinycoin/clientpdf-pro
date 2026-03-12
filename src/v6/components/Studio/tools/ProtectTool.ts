import type React from 'react';
import type { IEditorTool, Point, ToolContext } from './IEditorTool';

export const ProtectTool: IEditorTool = {
    id: 'protect',
    onPointerDown(_ctx: ToolContext, _event: React.PointerEvent, _worldPos: Point): void {
        // Protect is configured from a side settings panel and doesn't draw on canvas.
    },
    onPointerMove(_ctx: ToolContext, _event: React.PointerEvent, _worldPos: Point): void {
        // No-op by design.
    },
    onPointerUp(_ctx: ToolContext, _event: React.PointerEvent, _worldPos: Point): void {
        // No-op by design.
    },
};
