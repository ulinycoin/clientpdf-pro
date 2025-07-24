#!/bin/bash

# Fix для split-pdf функциональности
echo "🔧 Исправляем split-pdf функциональность..."

# Создаем backup
cp src/pages/tools/SplitPDFPage.tsx src/pages/tools/SplitPDFPage.tsx.backup
cp src/utils/fileHelpers.ts src/utils/fileHelpers.ts.backup

echo "✅ Backup создан"

# Показываем инструкции для ручного исправления
echo "
📝 ИСПРАВЛЕНИЯ ДЛЯ SPLIT-PDF:

1. В файле src/pages/tools/SplitPDFPage.tsx:

   А) Добавить импорты в начало файла:
   import { PDFProcessingResult } from '../../types';
   import { downloadBlob, generateFilename } from '../../utils/fileHelpers';

   Б) Заменить функцию handleToolComplete:

   const handleToolComplete = (results: PDFProcessingResult[]) => {
     console.log('handleToolComplete called with:', results);

     const successfulResults = results.filter(result => result.success && result.data);
     console.log('Successful results for download:', successfulResults);

     if (successfulResults.length > 0) {
       successfulResults.forEach((result, index) => {
         if (result.data instanceof Blob) {
           const originalFilename = files[0]?.name || 'document.pdf';
           let filename: string;

           if (result.metadata?.pageNumber) {
             filename = generateFilename(originalFilename, \`page_\${result.metadata.pageNumber}\`);
           } else if (result.metadata?.startPage && result.metadata?.endPage) {
             filename = generateFilename(originalFilename, \`pages_\${result.metadata.startPage}-\${result.metadata.endPage}\`);
           } else {
             filename = generateFilename(originalFilename, \`split_\${index + 1}\`);
           }

           console.log(\`Downloading file \${index}: \${filename}\`);

           setTimeout(() => {
             downloadBlob(result.data as Blob, filename);
           }, index * 200);
         }
       });
     }

     setToolActive(false);
     clearFiles();
   };

2. В файле src/utils/fileHelpers.ts:

   Заменить функцию downloadBlob (строка ~177):

   link.download = filename; // вместо generateFilename(filename, '', '')

   И добавить console.log для отладки:
   console.log('downloadBlob called with:', { filename, blobSize: blob.size });

3. В файле src/components/organisms/SplitTool.tsx:

   Исправить обработку ошибок (строка ~74):
   .map(r => r.error?.message || 'Unknown error')

🎯 После этих изменений split-pdf будет скачивать файлы!
"

echo "📋 Инструкции выведены выше"
