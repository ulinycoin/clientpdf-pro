import { describe, it, expect, beforeEach } from 'vitest';
import { ExcelToPDFGenerator } from './excelToPDFGenerator';
import { ExcelSheet, ConversionOptions } from '../types/excelToPdf.types';

describe('ExcelToPDFGenerator - Landscape Text Rendering', () => {
  let generator: ExcelToPDFGenerator;
  let testSheet: ExcelSheet;
  let portraitOptions: ConversionOptions;
  let landscapeOptions: ConversionOptions;

  beforeEach(() => {
    generator = new ExcelToPDFGenerator();

    // Create a test sheet with simple text data
    testSheet = {
      name: 'Test Sheet',
      data: [
        [
          { value: 'Name', type: 'string' as const },
          { value: 'Description', type: 'string' as const },
          { value: 'Value', type: 'string' as const }
        ],
        [
          { value: 'Item 1', type: 'string' as const },
          { value: 'First test item', type: 'string' as const },
          { value: '100', type: 'number' as const }
        ],
        [
          { value: 'Item 2', type: 'string' as const },
          { value: 'Second test item', type: 'string' as const },
          { value: '200', type: 'number' as const }
        ]
      ]
    };

    portraitOptions = {
      selectedSheets: ['Test Sheet'],
      orientation: 'portrait',
      pageSize: 'A4',
      fontSize: 10,
      fontFamily: 'helvetica',
      includeSheetNames: true,
      handleWideTablesWith: 'scale',
      outputFormat: 'single-pdf',
      margins: { top: 20, right: 20, bottom: 20, left: 20 }
    };

    landscapeOptions = {
      ...portraitOptions,
      orientation: 'landscape'
    };
  });

  it('should calculate correct page dimensions for landscape', () => {
    const landscapeDims = (generator as any).getPageDimensions('A4', 'landscape');
    const portraitDims = (generator as any).getPageDimensions('A4', 'portrait');

    // Landscape should swap width and height
    expect(landscapeDims[0]).toBe(842); // width
    expect(landscapeDims[1]).toBe(595);  // height
    expect(portraitDims[0]).toBe(595);   // width
    expect(portraitDims[1]).toBe(842);   // height
  });

  it('should calculate correct usable width for landscape', () => {
    const { columns } = (generator as any).prepareTableData(testSheet, landscapeOptions);

    // For landscape A4: width=842, margins=100, column padding
    const expectedUsableWidth = 842 - 100 - (10 * (columns.length - 1));
    const actualWidths = (generator as any).getOriginalColumnWidths(testSheet, columns, expectedUsableWidth);

    // Should have width for each column
    expect(actualWidths).toHaveLength(columns.length);

    // Total width should not exceed usable width
    const totalWidth = actualWidths.reduce((sum: number, w: number) => sum + w, 0);
    expect(totalWidth).toBeLessThanOrEqual(expectedUsableWidth + 1); // Allow 1px tolerance

    // Each column should have minimum width
    actualWidths.forEach((width: number) => {
      expect(width).toBeGreaterThanOrEqual(60);
    });
  });

  it('should generate PDF with text content in landscape mode', async () => {
    // This test verifies that the PDF generation doesn't fail for landscape
    const result = await generator.generatePDF([testSheet], landscapeOptions, (progress, message) => {
      console.log(`Progress: ${progress}% - ${message}`);
    });

    expect(result.success).toBe(true);
    expect(result.pdfFiles).toHaveLength(1);
    expect(result.pdfFiles![0].data).toBeInstanceOf(Uint8Array);
    expect(result.pdfFiles![0].data.length).toBeGreaterThan(1000); // Should have actual content
  });

  it('should position text correctly in landscape mode', () => {
    const { columns, tableData } = (generator as any).prepareTableData(testSheet, landscapeOptions);
    const usableWidth = 842 - 100 - (10 * (columns.length - 1));
    const columnWidths = (generator as any).getOriginalColumnWidths(testSheet, columns, usableWidth);

    // Simulate text positioning
    let currentX = 50; // Starting X position

    columns.forEach((col: any, index: number) => {
      // Text should be positioned within page bounds
      expect(currentX).toBeGreaterThanOrEqual(50);
      expect(currentX + columnWidths[index]).toBeLessThanOrEqual(842); // Within page width

      currentX += columnWidths[index] + 10; // Move to next column
    });
  });

  it('should handle font rendering in landscape mode', async () => {
    // Test with Cyrillic text to ensure font loading works in landscape
    const cyrillicSheet: ExcelSheet = {
      name: 'Тест',
      data: [
        [
          { value: 'Название', type: 'string' as const },
          { value: 'Описание', type: 'string' as const }
        ],
        [
          { value: 'Элемент 1', type: 'string' as const },
          { value: 'Первый тестовый элемент', type: 'string' as const }
        ]
      ]
    };

    const result = await generator.generatePDF([cyrillicSheet], landscapeOptions, (progress, message) => {
      console.log(`Cyrillic test progress: ${progress}% - ${message}`);
    });

    expect(result.success).toBe(true);
    expect(result.pdfFiles).toHaveLength(1);
    // PDF should contain content even with Cyrillic text
    expect(result.pdfFiles![0].data.length).toBeGreaterThan(1000);
  });
});
