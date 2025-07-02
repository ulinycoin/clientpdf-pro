# AddTextTool - Modular Architecture

This is a demonstration of the modular approach to solve Claude's response length limitations.

## Structure

```
AddTextTool/
├── index.tsx              # Main export
├── AddTextTool.tsx        # Main component (orchestrator)
├── components/            # UI Components
│   ├── Canvas.tsx         # PDF rendering canvas
│   ├── Toolbar.tsx        # Tools and controls
│   ├── FormatPanel.tsx    # Text formatting
│   └── ElementsList.tsx   # Text elements list
├── hooks/                 # Business logic
│   ├── useCanvas.ts       # Canvas management
│   ├── useTextElements.ts # Text elements logic
│   └── usePdfViewer.ts    # PDF document handling
├── services/              # Utilities
│   ├── pdfRenderer.ts     # PDF rendering service
│   └── textEditor.ts      # Text editing utilities
└── types/                 # TypeScript definitions
    └── index.ts           # All interfaces
```

## Benefits of this approach

1. **No file size limitations** - Each module is 200-300 lines max
2. **Better maintainability** - Clear separation of concerns
3. **Easier testing** - Each module can be tested independently
4. **Reusability** - Components can be reused
5. **Collaborative development** - Multiple developers can work on different modules

## Development workflow

1. Each module is created as a separate artifact
2. Modules are integrated step by step
3. Main component orchestrates all modules
4. Full functionality without size constraints