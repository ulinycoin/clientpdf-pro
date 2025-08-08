# E2E Test Fixtures

This directory contains test files used by Playwright end-to-end tests.

## Files needed:

### PDF Files:
- `test1.pdf` - Simple single-page PDF for merge tests
- `test2.pdf` - Another single-page PDF for merge tests
- `multi-page.pdf` - PDF with 3+ pages for split tests
- `large-file.pdf` - Large PDF file (5MB+) for compression tests
- `very-large.pdf` - Very large PDF (50MB+) for performance tests
- `text-document.pdf` - PDF with selectable text for extraction tests
- `scanned-document.pdf` - Image-based PDF for OCR tests
- `visual-document.pdf` - PDF with images for conversion tests
- `blank-document.pdf` - Empty PDF for text annotation tests
- `landscape-document.pdf` - Landscape oriented PDF for rotation tests
- `medium-size.pdf` - Medium-sized PDF for memory tests

### Excel Files:
- Generated dynamically by the application's test data generator

## Creating Test Files:

Most test files can be created using the LocalPDF application itself:

1. **Create basic PDFs**:
   - Use Excel to PDF tool to generate simple PDFs
   - Save different orientations and sizes

2. **Create multi-page PDFs**:
   - Use merge tool to combine several single-page PDFs

3. **Create large files**:
   - Use high-resolution images in Excel
   - Create many pages with content

4. **Create scanned documents**:
   - Take screenshots of text and convert to PDF
   - Or use actual scanned documents

## Automated Generation:

Some fixtures can be generated automatically:

```typescript
// In setup script
import { PDFDocument, rgb } from 'pdf-lib';

export async function createTestPDF(filename: string, pages: number = 1) {
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < pages; i++) {
    const page = pdfDoc.addPage([600, 400]);
    page.drawText(`Test Page ${i + 1}`, {
      x: 50,
      y: 200,
      size: 30,
      color: rgb(0, 0, 0),
    });
  }

  const pdfBytes = await pdfDoc.save();
  // Save to fixtures directory
}
```

## Usage in Tests:

```typescript
import path from 'path';

test('example test', async ({ page }) => {
  const testPdf = path.join(__dirname, 'fixtures', 'test1.pdf');

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(testPdf);

  // ... rest of test
});
```

## File Sizes Guidelines:

- **Small PDFs** (test1.pdf, test2.pdf): < 100KB
- **Medium PDFs** (medium-size.pdf): 1-5MB
- **Large PDFs** (large-file.pdf): 5-20MB
- **Very Large PDFs** (very-large.pdf): 50MB+

## Security Note:

These test files should NOT contain any sensitive or real data. All content should be placeholder text and images.
