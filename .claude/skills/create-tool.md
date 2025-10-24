# Create New PDF Tool from Scratch

This skill creates a brand new PDF tool for Localpdf_v3 that doesn't exist in clientpdf-pro.

## Usage

When user requests a new tool (e.g., "create pdf-to-images tool" or "add sign-pdf functionality"), follow this workflow:

## Planning Phase

Before coding, clarify with user:
1. **Tool purpose** - What does it do?
2. **Input/Output** - Single PDF? Multiple files? What output format?
3. **UI complexity** - Simple form? Visual editor? Multi-step wizard?
4. **Libraries needed** - Any special dependencies?
5. **Related tools** - Which 4 tools for Quick Actions?

## Step-by-Step Implementation

### 1. Choose Tool Architecture

**Simple Tool Pattern** (Compress, Rotate, Delete Pages):
- Single file input
- Configuration options
- Process button
- Success screen with download

**Complex Tool Pattern** (Add Text, Watermark):
- Single file input
- Visual editor interface
- Real-time preview
- Multiple subcomponents

**Batch Tool Pattern** (Merge, Images to PDF):
- Multiple file input
- Drag & drop reordering
- Preview all files
- Batch processing

### 2. Add to Type System

**File:** `src/types/index.ts`

Add tool to Tool union type:
```typescript
export type Tool =
  | 'merge-pdf'
  | 'split-pdf'
  // ... existing tools ...
  | 'your-new-tool'; // Add here
```

Add to hash mapping:
```typescript
export const TOOL_HASH_MAP: Record<Tool, string> = {
  'merge-pdf': 'merge',
  // ... existing mappings ...
  'your-new-tool': 'your-tool-hash', // Add here
};

export const HASH_TOOL_MAP: Record<string, Tool> = {
  'merge': 'merge-pdf',
  // ... existing mappings ...
  'your-tool-hash': 'your-new-tool', // Add here
};
```

### 3. Create PDFService Methods (if needed)

**File:** `src/services/pdfService.ts`

Add new processing method:
```typescript
async yourNewOperation(
  file: File,
  options: YourOptions,
  onProgress?: ProgressCallback
): Promise<PDFProcessingResult<YourMetadata>> {
  try {
    onProgress?.(0, 'Loading PDF...');

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    onProgress?.(30, 'Processing...');

    // Your processing logic here

    onProgress?.(90, 'Saving...');

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });

    onProgress?.(100, 'Complete!');

    return {
      success: true,
      blob,
      metadata: {
        // Your metadata
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

### 4. Create Main Component

**File:** `src/components/tools/YourTool.tsx`

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import { PDFService } from '@/services/pdfService';
import type { UploadedFile } from '@/types/pdf';
import type { Tool } from '@/types';
import { HASH_TOOL_MAP } from '@/types';

const pdfService = PDFService.getInstance();

export const YourTool: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile, setSharedFile } = useSharedFile();

  // State
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [result, setResult] = useState<{ blob: Blob; metadata: any } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [settings, setSettings] = useState({
    // Your tool settings
  });

  // Auto-load shared file
  useEffect(() => {
    if (sharedFile && !file) {
      const sharedFileObj = new File([sharedFile.blob], sharedFile.name, { type: 'application/pdf' });
      handleFilesSelected([sharedFileObj]);
      clearSharedFile();
    }
  }, [sharedFile, file, clearSharedFile]);

  // File selection handler
  const handleFilesSelected = async (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    if (!selectedFile) return;

    const uploadedFile: UploadedFile = {
      id: `${Date.now()}`,
      file: selectedFile,
      name: selectedFile.name,
      size: selectedFile.size,
      status: 'completed',
    };

    setFile(uploadedFile);
    setResult(null);
  };

  // Process handler
  const handleProcess = async () => {
    if (!file?.file) return;

    setIsProcessing(true);
    setProgress(0);

    const result = await pdfService.yourNewOperation(
      file.file,
      settings,
      (prog, msg) => {
        setProgress(prog);
        setProgressMessage(msg);
      }
    );

    setIsProcessing(false);

    if (result.success && result.blob) {
      setResult({ blob: result.blob, metadata: result.metadata });
    } else {
      alert('Error: ' + (result.error || 'Unknown error'));
    }
  };

  // Download handler
  const handleDownload = () => {
    if (!result) return;

    const url = URL.createObjectURL(result.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file?.name.replace('.pdf', '_processed.pdf') || 'processed.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Reset handler
  const handleReset = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
    setProgressMessage('');
  };

  // Quick actions handler
  const handleQuickAction = (toolId: Tool) => {
    if (result) {
      setSharedFile(result.blob, file?.name.replace('.pdf', '_processed.pdf') || 'processed.pdf', 'your-new-tool');
    }
    window.location.hash = HASH_TOOL_MAP[toolId];
  };

  // STATE 1: No file - Show upload zone
  if (!file) {
    return (
      <div className="card p-8">
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Your Tool Name
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Brief description of what your tool does
        </p>

        <FileUpload
          onFilesSelected={handleFilesSelected}
          accept=".pdf"
          multiple={false}
          maxSizeMB={100}
        />
      </div>
    );
  }

  // STATE 2: Success - Show download and quick actions
  if (result) {
    return (
      <div className="card p-8">
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Your Tool Name
        </h2>

        <div className="mt-6 space-y-4">
          {/* Success message */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
              ✓ Success
            </h3>
            <div className="text-sm text-green-700 dark:text-green-400 space-y-1">
              {/* Show relevant metadata */}
              <p>Original size: {(file.size / 1024).toFixed(2)} KB</p>
              <p>New size: {(result.blob.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleDownload}
              className="flex-1 px-6 py-3 bg-ocean-500 hover:bg-ocean-600 text-white rounded-lg font-semibold transition-colors"
            >
              Download
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
            >
              Process Another
            </button>
          </div>
        </div>

        {/* Quick Actions - REQUIRED */}
        <div className="card p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            What's next?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Continue working with your PDF using these tools:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Add 4 relevant tools here */}
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
            {/* Add 3 more buttons */}
          </div>
        </div>
      </div>
    );
  }

  // STATE 3: Processing - Show settings and process button
  return (
    <div className="card p-8">
      <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
        Your Tool Name
      </h2>

      {/* File info */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">File: {file.name}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Size: {(file.size / 1024).toFixed(2)} KB
        </p>
      </div>

      {/* Settings */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Settings
        </h3>
        {/* Add your tool-specific settings here */}
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleProcess}
          disabled={isProcessing}
          className="flex-1 px-6 py-3 bg-ocean-500 hover:bg-ocean-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
        >
          {isProcessing ? 'Processing...' : 'Process PDF'}
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Progress bar */}
      {isProcessing && (
        <div className="mt-6">
          <ProgressBar progress={progress} message={progressMessage} />
        </div>
      )}
    </div>
  );
};
```

### 5. Add to Sidebar

**File:** `src/components/layout/Sidebar.tsx`

Add tool to appropriate tier:
```typescript
const toolsByTier = {
  tier1: [
    { id: 'merge-pdf' as Tool, icon: '📎', tier: 1 },
    // ... existing tier 1 tools
    { id: 'your-new-tool' as Tool, icon: '🔧', tier: 1 }, // Add here
  ],
  // ... other tiers
};
```

### 6. Add Lazy Import to App.tsx

**File:** `src/App.tsx`

Add at top with other lazy imports:
```typescript
const YourTool = lazy(() => import('@/components/tools/YourTool').then(m => ({ default: m.YourTool })));
```

Add to render logic:
```typescript
) : currentTool === 'your-new-tool' ? (
  <YourTool />
) : (
```

### 7. Add Translations

**Files:** All language files in `src/locales/*.json`

Add to each file:
```json
{
  "tools": {
    "your-new-tool": {
      "name": "Tool Name",
      "description": "Brief description"
    }
  }
}
```

### 8. Update Vite Config (if adding new heavy library)

**File:** `vite.config.ts`

Add to manual chunks if needed:
```typescript
manualChunks: {
  'vendor-react': ['react', 'react-dom'],
  'vendor-pdf-lib': ['pdf-lib', '@pdf-lib/fontkit'],
  'vendor-pdfjs': ['pdfjs-dist'],
  'vendor-ocr': ['tesseract.js'],
  'vendor-your-lib': ['your-heavy-library'], // Add if needed
}
```

### 9. Build and Test

```bash
cd /Users/aleksejs/Desktop/Localpdf_v3
npm run build
```

Check:
- ✅ No TypeScript errors
- ✅ Tool appears in sidebar
- ✅ Navigation works (#your-tool-hash)
- ✅ File upload works
- ✅ Processing works
- ✅ Download works
- ✅ Quick Actions work
- ✅ SharedFile integration works
- ✅ Bundle size is reasonable

## Tool Templates

### Simple Form Tool
Best for: Compress, Protect, Rotate
- Single file input
- Form with settings
- Process button
- Success screen

### Visual Editor Tool
Best for: Add Text, Watermark, Sign
- Canvas component
- Toolbar component
- Format panel
- Real-time preview

### Batch Processing Tool
Best for: Merge, Images to PDF
- Multiple file input
- Drag & drop reordering
- File list with previews
- Batch processing

## Common Patterns

### File Size Formatting
```typescript
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};
```

### Progress Callback
```typescript
type ProgressCallback = (progress: number, message: string) => void;

// Usage in service method
onProgress?.(30, 'Loading PDF...');
onProgress?.(60, 'Processing pages...');
onProgress?.(90, 'Saving...');
onProgress?.(100, 'Complete!');
```

### Error Handling
```typescript
try {
  const result = await pdfService.yourOperation(file, options, onProgress);

  if (result.success && result.blob) {
    setResult({ blob: result.blob, metadata: result.metadata });
  } else {
    alert('Error: ' + (result.error || 'Unknown error'));
  }
} catch (error) {
  console.error('Error:', error);
  alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
}
```

## Best Practices

1. **Always use English text** - No i18n in component body
2. **Include Quick Actions** - Required for tool chaining
3. **Support SharedFile** - Auto-load from previous tool
4. **Show progress** - Use ProgressBar for operations > 2 seconds
5. **Handle errors gracefully** - Show user-friendly messages
6. **Dark mode support** - Use dark: classes everywhere
7. **Responsive design** - Test on mobile viewport
8. **Keyboard shortcuts** - For power users (if applicable)
9. **Preserve metadata** - Don't lose PDF info
10. **Memory efficient** - Clean up large objects

## Performance Guidelines

- Initial tool chunk: < 30 KB (gzipped)
- Total app initial load: < 75 KB (gzipped)
- Processing feedback: Update every 100ms minimum
- Large files: Stream processing when possible
- Memory: Revoke object URLs after use

## Success Checklist

Before considering done:
- [ ] TypeScript builds without errors
- [ ] Tool appears in sidebar with correct icon
- [ ] Navigation works via hash routing
- [ ] File upload accepts correct types
- [ ] Processing shows progress
- [ ] Success screen shows relevant info
- [ ] Download works with correct filename
- [ ] Quick Actions section present
- [ ] SharedFile integration works
- [ ] Dark mode fully supported
- [ ] Mobile responsive
- [ ] Bundle size acceptable
- [ ] No console errors
- [ ] Tested with real PDF files
