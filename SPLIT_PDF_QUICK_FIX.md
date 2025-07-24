# Быстрые исправления для split-pdf

## 1. Исправить SplitPDFPage.tsx

Добавить импорты:
```typescript
import { PDFProcessingResult } from '../../types';
import { downloadBlob, generateFilename } from '../../utils/fileHelpers';
```

Заменить handleToolComplete:
```typescript
const handleToolComplete = (results: PDFProcessingResult[]) => {
  const successfulResults = results.filter(result => result.success && result.data);

  if (successfulResults.length > 0) {
    successfulResults.forEach((result, index) => {
      if (result.data instanceof Blob) {
        const originalFilename = files[0]?.name || 'document.pdf';
        let filename: string;

        if (result.metadata?.pageNumber) {
          filename = generateFilename(originalFilename, `page_${result.metadata.pageNumber}`);
        } else if (result.metadata?.startPage && result.metadata?.endPage) {
          filename = generateFilename(originalFilename, `pages_${result.metadata.startPage}-${result.metadata.endPage}`);
        } else {
          filename = generateFilename(originalFilename, `split_${index + 1}`);
        }

        setTimeout(() => {
          downloadBlob(result.data as Blob, filename);
        }, index * 200);
      }
    });
  }

  setToolActive(false);
  clearFiles();
};
```

## 2. Исправить fileHelpers.ts

В функции downloadBlob заменить строку 177:
```typescript
link.download = filename; // вместо generateFilename(filename, '', '')
```

## 3. Исправить SplitTool.tsx

В строке 74 исправить:
```typescript
.map(r => r.error?.message || 'Unknown error')
```

После этих исправлений split-pdf будет скачивать файлы!
