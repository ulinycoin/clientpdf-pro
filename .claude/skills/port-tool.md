# Port PDF Tool from clientpdf-pro

This skill ports a complete PDF tool from the original clientpdf-pro project to Localpdf_v3 with all features and functionality.

## Usage

When user requests to port a tool (e.g., "port unlock-pdf tool" or "add unlock functionality"), follow this workflow:

## Step-by-Step Process

### 1. Analyze Source Tool

First, examine the original tool in clientpdf-pro:

```bash
# Find the tool implementation
- Check /Users/aleksejs/Desktop/clientpdf-pro/src/components/tools/[ToolName].tsx
- Check /Users/aleksejs/Desktop/clientpdf-pro/src/components/organisms/[ToolName]/
- Check /Users/aleksejs/Desktop/clientpdf-pro/src/pages/tools/[ToolName]Page.tsx
```

### 2. Create Type Definitions (if needed)

If the tool requires custom types, create them:

**Location:** `src/types/[toolName].ts`

```typescript
export interface ToolSpecificData {
  // Define interfaces for tool-specific data structures
}

export interface UseToolReturn {
  // Define the hook return type
}
```

### 3. Create Custom Hook (if complex)

For tools with complex state management:

**Location:** `src/hooks/use[ToolName].ts`

Include:
- State management
- History (undo/redo) if applicable
- All business logic
- PDF processing functions
- Unicode/Cyrillic support for text-based tools

### 4. Create Subcomponents (if needed)

**Location:** `src/components/tools/[ToolName]/`

Common subcomponents:
- `Canvas.tsx` - Visual PDF editor (for interactive tools)
- `FormatPanel.tsx` - Settings/formatting panel
- `Toolbar.tsx` - Navigation and controls
- `SettingsPanel.tsx` - Configuration options

### 5. Create Main Component

**Location:** `src/components/tools/[ToolName].tsx`

Structure:
```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';

export const ToolName: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile, setSharedFile } = useSharedFile();

  // State management
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [result, setResult] = useState<Blob | null>(null);

  // Auto-load shared file
  useEffect(() => {
    if (sharedFile && !file) {
      const sharedFileObj = new File([sharedFile.blob], sharedFile.name, { type: 'application/pdf' });
      handleFilesSelected([sharedFileObj]);
      clearSharedFile();
    }
  }, [sharedFile, file, clearSharedFile]);

  // Quick actions handler
  const handleQuickAction = (toolId: Tool) => {
    if (result) {
      setSharedFile(result, 'processed.pdf', 'tool-name');
    }
    window.location.hash = HASH_TOOL_MAP[toolId];
  };

  // Three states: Upload, Processing/Editor, Success
  if (!file) {
    return (/* Upload zone */);
  }

  if (result) {
    return (
      <div className="card p-8">
        {/* Success message */}
        {/* Download button */}
        {/* Quick Actions section */}
      </div>
    );
  }

  return (/* Main tool interface */);
};
```

### 6. Add to App.tsx

**IMPORTANT:** Tool is already lazy-loaded in App.tsx at line 19-20:
```typescript
const AddTextPDF = lazy(() => import('@/components/tools/AddTextPDF').then(m => ({ default: m.AddTextPDF })));
```

And already rendered in the routing at lines 157-158.

**DO NOT modify App.tsx** - the tool is already integrated!

### 7. Use English Text Only

**CRITICAL:** All UI text must be in **ENGLISH ONLY**:
- Remove `useI18n()` imports from subcomponents
- Use direct English strings in all UI elements
- Only use `t()` function in main component for tool names in Quick Actions
- Examples:
  ```typescript
  // ✅ Correct
  <h3>What's next?</h3>
  <p>Continue working with your PDF:</p>

  // ❌ Wrong
  <h3>{t('common.whatsNext')}</h3>
  ```

### 8. Add Quick Actions Section

Every tool MUST include Quick Actions after successful processing:

```typescript
{/* Quick Actions */}
<div className="card p-6 mt-6">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
    What's next?
  </h3>
  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
    Continue working with your PDF using these tools:
  </p>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    {/* Compress */}
    <button
      onClick={() => handleQuickAction('compress-pdf')}
      className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group"
    >
      <span className="text-3xl">🗜️</span>
      <div className="text-left">
        <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
          {t('tools.compress-pdf.name')}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Reduce file size
        </p>
      </div>
    </button>

    {/* Add 3 more relevant tools */}
  </div>
</div>
```

### 9. Build and Test

```bash
cd /Users/aleksejs/Desktop/Localpdf_v3
npm run build
```

Verify:
- No TypeScript errors
- Bundle size is reasonable (< 30 KB for tool chunk)
- Initial load stays under 75 KB gzip

### 10. Performance Checklist

- ✅ Tool component is lazy-loaded
- ✅ Heavy dependencies in manual chunks (vite.config.ts)
- ✅ No direct imports of large libraries
- ✅ Subcomponents are co-located (not lazy)
- ✅ Uses existing shared components (FileUpload, ProgressBar)

## Key Differences from clientpdf-pro

1. **No i18n in subcomponents** - English only
2. **Hash routing** - Uses `#tool-name` not `/tool-name`
3. **Simpler architecture** - No complex folder structure
4. **Quick Actions required** - For tool chaining workflow
5. **Dark mode support** - All components must support dark classes

## Common Issues

### TypeScript Errors
- Use `as` type assertions for pdf-lib compatibility
- Define proper interface for complex types
- Use `Record<string, any>` for dynamic font mappings

### Bundle Size
- Check manual chunks in vite.config.ts
- Don't import entire libraries (tree-shake when possible)
- Lazy load heavy components when needed

### Styling
- Use Tailwind dark: classes
- Follow existing card/button patterns
- Use ocean-* colors for primary actions

## Example: Add Text PDF

See the completed implementation:
- Types: `src/types/addText.ts`
- Hook: `src/hooks/useAddTextTool.ts`
- Subcomponents: `src/components/tools/AddTextPDF/`
- Main: `src/components/tools/AddTextPDF.tsx`

This tool demonstrates:
- ✅ Complex state management with history
- ✅ Visual editor with Canvas
- ✅ Multiple subcomponents
- ✅ Unicode/Cyrillic support
- ✅ Keyboard shortcuts
- ✅ Quick Actions integration
- ✅ SharedFile workflow

## Success Criteria

A successfully ported tool has:
1. All features from original working
2. English-only UI
3. Quick Actions section
4. SharedFile integration
5. Build passes without errors
6. Bundle size is reasonable
7. Dark mode fully supported
8. Matches existing tool UX patterns
