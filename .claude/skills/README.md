# Localpdf_v3 Skills

This directory contains reusable skills for Claude Code to efficiently work with the Localpdf_v3 project.

## Available Skills

### 1. `port-tool.md` - Port Tool from clientpdf-pro

**Use when:** User wants to port an existing tool from the original clientpdf-pro project.

**Examples:**
- "Port the unlock-pdf tool"
- "Add unlock functionality from clientpdf-pro"
- "Migrate sign-pdf from the original project"

**What it does:**
- Analyzes source tool in clientpdf-pro
- Creates necessary types and hooks
- Ports all subcomponents
- Maintains all original features
- Adapts to Localpdf_v3 architecture
- Ensures English-only UI
- Adds Quick Actions integration

**Result:** Fully functional tool with all features from original, adapted to new codebase.

---

### 2. `create-tool.md` - Create New Tool from Scratch

**Use when:** User wants to create a completely new tool that doesn't exist in clientpdf-pro.

**Examples:**
- "Create pdf-to-images tool"
- "Add flatten-pdf functionality"
- "Make a new tool for pdf redaction"

**What it does:**
- Provides complete tool template
- Guides through architecture decisions
- Creates PDFService methods
- Sets up component structure
- Implements Quick Actions
- Handles routing and sidebar integration
- Ensures performance guidelines

**Result:** New tool built from ground up following all project patterns.

---

## How to Use Skills

### Method 1: Direct Request
Simply mention the tool name and desired action:
```
"Port unlock-pdf from clientpdf-pro"
"Create flatten-pdf tool"
```

### Method 2: Explicit Skill Call
Reference the skill directly:
```
"Use port-tool skill for sign-pdf"
"Follow create-tool skill to add pdf-to-images"
```

## Project Architecture Overview

```
Localpdf_v3/
├── src/
│   ├── components/
│   │   ├── tools/               # Main tool components
│   │   │   ├── MergePDF.tsx
│   │   │   ├── AddTextPDF.tsx
│   │   │   └── AddTextPDF/      # Tool subcomponents
│   │   │       ├── Canvas.tsx
│   │   │       ├── Toolbar.tsx
│   │   │       └── FormatPanel.tsx
│   │   ├── common/              # Shared components
│   │   └── layout/              # Layout components
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAddTextTool.ts
│   │   ├── useHashRouter.tsx
│   │   └── useSharedFile.ts
│   ├── services/                # Business logic
│   │   └── pdfService.ts
│   ├── types/                   # TypeScript types
│   │   ├── index.ts
│   │   └── addText.ts
│   ├── locales/                 # Translations
│   └── App.tsx                  # Main app
└── .claude/
    └── skills/                  # This directory
```

## Key Concepts

### Tool States
Every tool has 3 main states:
1. **Upload** - File selection
2. **Processing** - Main tool interface
3. **Success** - Download + Quick Actions

### Quick Actions
Required section after processing:
- Shows 4 related tools
- Uses `handleQuickAction` to chain workflows
- Saves result via `setSharedFile`
- Navigates via hash routing

### SharedFile System
Enables tool chaining:
```typescript
// Save for next tool
setSharedFile(blob, filename, sourceTool);

// Auto-load in next tool
useEffect(() => {
  if (sharedFile && !file) {
    // Load shared file
  }
}, [sharedFile]);
```

### Lazy Loading
All tools are lazy-loaded:
```typescript
const ToolName = lazy(() => import('@/components/tools/ToolName')
  .then(m => ({ default: m.ToolName })));
```

### English-Only UI
- No i18n in tool components (except tool names in Quick Actions)
- Direct English strings in all UI
- Translations only for sidebar/header

## Performance Requirements

- Tool chunk: < 30 KB gzipped
- Initial app load: < 75 KB gzipped
- Heavy libraries in manual chunks
- Lazy load when possible

## Common Patterns

### File Upload
```typescript
<FileUpload
  onFilesSelected={handleFilesSelected}
  accept=".pdf"
  multiple={false}
  maxSizeMB={100}
/>
```

### Progress Bar
```typescript
<ProgressBar
  progress={progress}
  message={progressMessage}
/>
```

### Success Message
```typescript
<div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
  <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
    ✓ Success
  </h3>
  {/* Details */}
</div>
```

## Troubleshooting

### Build Errors
1. Check TypeScript types
2. Verify imports use `@/` alias
3. Ensure all types are exported
4. Check for unused imports

### Bundle Size Issues
1. Check vite.config.ts manual chunks
2. Verify lazy loading is used
3. Check for large library imports
4. Use tree-shakeable imports

### Routing Issues
1. Verify tool added to `TOOL_HASH_MAP`
2. Check lazy import in App.tsx
3. Ensure render logic includes tool
4. Test hash navigation

### SharedFile Not Working
1. Check `setSharedFile` is called with result
2. Verify auto-load useEffect exists
3. Test `clearSharedFile` is called
4. Check file conversion (Blob to File)

## Resources

- Main README: `/README.md`
- CLAUDE.md: `/CLAUDE.md` (project instructions)
- Type definitions: `/src/types/index.ts`
- PDF Service: `/src/services/pdfService.ts`
- Existing tools: `/src/components/tools/`

## Examples

### Completed Tools (Reference)
- **AddTextPDF** - Complex visual editor with Canvas
- **MergePDF** - Batch processing with drag & drop
- **CompressPDF** - Simple form tool
- **WatermarkPDF** - Visual overlay tool
- **ProtectPDF** - Form with password settings

### Study These First
1. `AddTextPDF.tsx` - Most complex, shows all patterns
2. `MergePDF.tsx` - Batch processing, Quick Actions
3. `CompressPDF.tsx` - Simplest pattern, good starting point

## Contributing Guidelines

When adding new skills:
1. Use clear, step-by-step format
2. Include code examples
3. Explain "why" not just "how"
4. Add troubleshooting section
5. Link to related skills
6. Update this README

## Version History

- **v1.0** (2025) - Initial skills: port-tool, create-tool
  - Based on AddTextPDF implementation
  - Includes Quick Actions pattern
  - English-only UI approach
  - SharedFile workflow
