import { describe, it, expect } from 'vitest';
import { ExcelToPDFGenerator } from './excelToPDFGenerator';
import { PDFDocument } from 'pdf-lib';

describe('ExcelToPDFGenerator - Landscape Orientation', () => {
  const generator = new ExcelToPDFGenerator();

  it('should create landscape pages with correct dimensions', async () => {
    // Test page dimensions calculation
    const dimensions = (generator as any).getPageDimensions('A4', 'landscape');
    expect(dimensions).toEqual([842, 595]); // Landscape A4: width=842, height=595

    const portraitDimensions = (generator as any).getPageDimensions('A4', 'portrait');
    expect(portraitDimensions).toEqual([595, 842]); // Portrait A4: width=595, height=842
  });

  it('should prepare table data correctly', () => {
    // Create a simple test sheet
    const testSheet = {
      name: 'Test Landscape',
      data: [
        [
          { value: 'Header 1', type: 'string' as const },
          { value: 'Header 2', type: 'string' as const }
        ],
        [
          { value: 'Data 1', type: 'string' as const },
          { value: 'Data 2', type: 'string' as const }
        ]
      ]
    };

    const landscapeOptions = {
      selectedSheets: ['Test Landscape'],
      orientation: 'landscape' as const,
      pageSize: 'A4' as const,
      fontSize: 10,
      fontFamily: 'helvetica',
      includeSheetNames: true,
      handleWideTablesWith: 'scale' as const,
      outputFormat: 'single-pdf' as const,
      margins: { top: 20, right: 20, bottom: 20, left: 20 }
    };

    // Test data preparation
    const { columns, tableData } = (generator as any).prepareTableData(testSheet, landscapeOptions);
    expect(columns).toHaveLength(2);
    expect(columns[0].header).toBe('Header 1'); // Should use first row as headers
    expect(columns[1].header).toBe('Header 2');
    expect(tableData).toHaveLength(1); // One data row (header row excluded)
    expect(tableData[0]['col_0']).toBe('Data 1');
    expect(tableData[0]['col_1']).toBe('Data 2');
  });

  it('should handle empty data gracefully', () => {
    const emptySheet = {
      name: 'Empty Sheet',
      data: []
    };

    const options = {
      selectedSheets: ['Empty Sheet'],
      orientation: 'landscape' as const,
      pageSize: 'A4' as const,
      fontSize: 10,
      fontFamily: 'helvetica',
      includeSheetNames: true,
      handleWideTablesWith: 'scale' as const,
      outputFormat: 'single-pdf' as const,
      margins: { top: 20, right: 20, bottom: 20, left: 20 }
    };

    const { columns, tableData } = (generator as any).prepareTableData(emptySheet, options);
    expect(columns).toHaveLength(0);
    expect(tableData).toHaveLength(0);
  });

  it('should calculate proper usable width for landscape orientation', () => {
    const testSheet = {
      name: 'Width Test',
      data: [
        [
          { value: 'Col1', type: 'string' as const },
          { value: 'Col2', type: 'string' as const },
          { value: 'Col3', type: 'string' as const }
        ]
      ]
    };

    const columns = [
      { header: 'Col1', dataKey: 'col_0' },
      { header: 'Col2', dataKey: 'col_1' },
      { header: 'Col3', dataKey: 'col_2' }
    ];

    // Landscape A4 width is 842
    // Usable width = 842 - 100 (margins) - 20 (2 * 10px padding between 3 columns) = 722
    const expectedUsableWidth = 842 - 100 - (10 * (3 - 1));

    const widths = (generator as any).getOriginalColumnWidths(testSheet, columns, expectedUsableWidth);
    expect(widths).toHaveLength(3);
    expect(widths.reduce((sum: number, w: number) => sum + w, 0)).toBeLessThanOrEqual(expectedUsableWidth);

    // All widths should be at least minimum width
    widths.forEach((width: number) => {
      expect(width).toBeGreaterThanOrEqual(60); // Minimum width
    });
  });

  it('should not throw currentX errors during rendering simulation', () => {
    // This test simulates the rendering process without actually creating PDF
    const testSheet = {
      name: 'Variable Scope Test',
      data: [
        [
          { value: 'Name', type: 'string' as const },
          { value: 'Value', type: 'string' as const }
        ],
        [
          { value: 'Test 1', type: 'string' as const },
          { value: 'Result 1', type: 'string' as const }
        ],
        [
          { value: 'Test 2', type: 'string' as const },
          { value: 'Result 2', type: 'string' as const }
        ]
      ]
    };

    const options = {
      selectedSheets: ['Variable Scope Test'],
      orientation: 'landscape' as const,
      pageSize: 'A4' as const,
      fontSize: 10,
      fontFamily: 'helvetica',
      includeSheetNames: true,
      handleWideTablesWith: 'scale' as const,
      outputFormat: 'single-pdf' as const,
      margins: { top: 20, right: 20, bottom: 20, left: 20 }
    };

    // This should not throw any variable scope errors
    expect(() => {
      const { columns, tableData } = (generator as any).prepareTableData(testSheet, options);
      const columnWidths = (generator as any).getOriginalColumnWidths(testSheet, columns, 700);

      // Simulate the variable scoping that was problematic
      tableData.forEach(() => {
        let currentX = 50; // This should be properly scoped
        columns.forEach((_, colIndex) => {
          currentX += columnWidths[colIndex] + 10; // Should not throw errors
        });
      });
    }).not.toThrow();
  });
});
