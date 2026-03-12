# React Integration

1. Ensure your frontend has `react`, `react-dom`, and `react-router-dom`.
2. Create an app entrypoint (or replace existing) using `src/app/react/main-example.tsx`.
3. Mount `<PlatformApp />` into your root container.

## Custom Shell

If you already have an application shell:

1. Wrap your tree with `<PlatformProvider>`.
2. Render `<ToolSidebar />` where your navigation is.
3. Render `<ToolRoutes />` in your main content area.
4. Use `useToolExecution(toolId, context)` inside tool UIs to run tools via `UnifiedToolRunner`.

## Notes

- Routes and menu are registry-driven (`GlobalRegistry`).
- Tool UI modules are lazy-loaded.
- Tool logic executes through workers.
