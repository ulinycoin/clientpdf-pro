import type { IEditorTool, ToolContext } from './IEditorTool';

export const FormsTool: IEditorTool = {
    id: 'forms',
    onPointerDown: (ctx: ToolContext) => {
        if (ctx.textEditor) ctx.commitTextEditor();
        ctx.setIsPointerDown(false);
    },
    onPointerMove: () => {
        // Form insertion is handled by the forms composer modal.
    },
    onPointerUp: (ctx: ToolContext) => {
        ctx.setIsPointerDown(false);
    },
};
