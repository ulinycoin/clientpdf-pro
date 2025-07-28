import { describe, it, expect } from 'vitest';
import { ExcelToPDFGenerator } from './excelToPDFGenerator';
import { ExcelSheet, ConversionOptions } from '../types/excelToPdf.types';

describe('ExcelToPDFGenerator', () => {
  const generator = new ExcelToPDFGenerator();

  describe('getPageDimensions', () => {
    it('should return correct dimensions for A4 portrait', () => {
      // Access private method through any for testing
      const dimensions = (generator as any).getPageDimensions('A4', 'portrait');
      expect(dimensions).toEqual([595, 842]);
    });

    it('should return correct dimensions for A4 landscape', () => {
      const dimensions = (generator as any).getPageDimensions('A4', 'landscape');
      expect(dimensions).toEqual([842, 595]);
    });

    it('should return correct dimensions for A3 portrait', () => {
      const dimensions = (generator as any).getPageDimensions('A3', 'portrait');
      expect(dimensions).toEqual([842, 1191]);
    });

    it('should return correct dimensions for A3 landscape', () => {
      const dimensions = (generator as any).getPageDimensions('A3', 'landscape');
      expect(dimensions).toEqual([1191, 842]);
    });

    it('should return correct dimensions for Letter portrait', () => {
      const dimensions = (generator as any).getPageDimensions('Letter', 'portrait');
      expect(dimensions).toEqual([612, 792]);
    });

    it('should return correct dimensions for Letter landscape', () => {
      const dimensions = (generator as any).getPageDimensions('Letter', 'landscape');
      expect(dimensions).toEqual([792, 612]);
    });

    it('should default to A4 for unknown page sizes', () => {
      const dimensions = (generator as any).getPageDimensions('Unknown', 'portrait');
      expect(dimensions).toEqual([595, 842]);
    });
  });

  describe('prepareTableData', () => {
    it('should use first row as headers when available', () => {
      const mockSheet: ExcelSheet = {
        name: 'Test Sheet',
        data: [
          [
            { value: 'Name', type: 'string' },
            { value: 'Age', type: 'string' },
            { value: 'City', type: 'string' }
          ],
          [
            { value: 'John', type: 'string' },
            { value: 25, type: 'number' },
            { value: 'London', type: 'string' }
          ],
          [
            { value: 'Jane', type: 'string' },
            { value: 30, type: 'number' },
            { value: 'Paris', type: 'string' }
          ]
        ]
      };

      const options: ConversionOptions = {
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

      const result = (generator as any).prepareTableData(mockSheet, options);

      expect(result.columns).toHaveLength(3);
      expect(result.columns[0].header).toBe('Name');
      expect(result.columns[1].header).toBe('Age');
      expect(result.columns[2].header).toBe('City');

      // Should have 2 data rows (excluding header row)
      expect(result.tableData).toHaveLength(2);
      expect(result.tableData[0]['col_0']).toBe('John');
      expect(result.tableData[1]['col_0']).toBe('Jane');
    });

    it('should use column numbers as fallback headers when first row is empty', () => {
      const mockSheet: ExcelSheet = {
        name: 'Test Sheet',
        data: [
          [
            { value: '', type: 'string' },
            { value: null, type: 'string' },
            { value: undefined, type: 'string' }
          ],
          [
            { value: 'John', type: 'string' },
            { value: 25, type: 'number' },
            { value: 'London', type: 'string' }
          ]
        ]
      };

      const options: ConversionOptions = {
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

      const result = (generator as any).prepareTableData(mockSheet, options);

      expect(result.columns).toHaveLength(3);
      expect(result.columns[0].header).toBe('Column 1');
      expect(result.columns[1].header).toBe('Column 2');
      expect(result.columns[2].header).toBe('Column 3');
    });

    it('should skip empty columns', () => {
      const mockSheet: ExcelSheet = {
        name: 'Test Sheet',
        data: [
          [
            { value: 'Name', type: 'string' },
            { value: '', type: 'string' }, // Empty column
            { value: 'Age', type: 'string' }
          ],
          [
            { value: 'John', type: 'string' },
            { value: '', type: 'string' }, // Empty column
            { value: 25, type: 'number' }
          ]
        ]
      };

      const options: ConversionOptions = {
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

      const result = (generator as any).prepareTableData(mockSheet, options);

      // Should only have 2 columns (skipping the empty middle column)
      expect(result.columns).toHaveLength(2);
      expect(result.columns[0].header).toBe('Name');
      expect(result.columns[1].header).toBe('Age');
    });

    it('should filter out empty rows', () => {
      const mockSheet: ExcelSheet = {
        name: 'Test Sheet',
        data: [
          [
            { value: 'Name', type: 'string' },
            { value: 'Age', type: 'string' }
          ],
          [
            { value: 'John', type: 'string' },
            { value: 25, type: 'number' }
          ],
          [
            { value: '', type: 'string' },
            { value: '', type: 'string' }
          ], // Empty row
          [
            { value: 'Jane', type: 'string' },
            { value: 30, type: 'number' }
          ]
        ]
      };

      const options: ConversionOptions = {
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

      const result = (generator as any).prepareTableData(mockSheet, options);

      // Should have 2 data rows (excluding header and empty row)
      expect(result.tableData).toHaveLength(2);
      expect(result.tableData[0]['col_0']).toBe('John');
      expect(result.tableData[1]['col_0']).toBe('Jane');
    });
  });

  describe('formatCellValue', () => {
    it('should format string values correctly', () => {
      const cell = { value: 'Hello World', type: 'string' as const };
      const result = (generator as any).formatCellValue(cell);
      expect(result).toBe('Hello World');
    });

    it('should format number values correctly', () => {
      const cell = { value: 42, type: 'number' as const };
      const result = (generator as any).formatCellValue(cell);
      expect(result).toBe('42');
    });

    it('should format date values correctly', () => {
      const testDate = new Date('2023-01-01');
      const cell = { value: testDate, type: 'date' as const };
      const result = (generator as any).formatCellValue(cell);
      expect(result).toBe(testDate.toLocaleDateString());
    });

    it('should handle null/undefined values', () => {
      const nullCell = { value: null, type: 'string' as const };
      const undefinedCell = { value: undefined, type: 'string' as const };

      expect((generator as any).formatCellValue(nullCell)).toBe('');
      expect((generator as any).formatCellValue(undefinedCell)).toBe('');
      expect((generator as any).formatCellValue(null)).toBe('');
    });
  });

  describe('sanitizeTextForPDF', () => {
    it('should transliterate Cyrillic characters', () => {
      const result = (generator as any).sanitizeTextForPDF('Привет мир');
      expect(result).toBe('Privet mir');
    });

    it('should handle mixed text with Latin and Cyrillic', () => {
      const result = (generator as any).sanitizeTextForPDF('Hello Привет');
      expect(result).toBe('Hello Privet');
    });

    it('should leave Latin text unchanged', () => {
      const result = (generator as any).sanitizeTextForPDF('Hello World');
      expect(result).toBe('Hello World');
    });
  });

  describe('getOriginalColumnWidths', () => {
    it('should calculate widths based on content length', () => {
      const mockSheet: ExcelSheet = {
        name: 'Test Sheet',
        data: [
          [
            { value: 'Short', type: 'string' },
            { value: 'Very Long Header Name', type: 'string' }
          ],
          [
            { value: 'X', type: 'string' },
            { value: 'Even longer cell content that exceeds header', type: 'string' }
          ]
        ]
      };

      const mockColumns = [
        { header: 'Short', dataKey: 'col_0' },
        { header: 'Very Long Header Name', dataKey: 'col_1' }
      ];

      const usableWidth = 500;
      const result = (generator as any).getOriginalColumnWidths(mockSheet, mockColumns, usableWidth);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeGreaterThan(60); // Minimum width
      expect(result[1]).toBeGreaterThan(result[0]); // Longer content should get more width
      expect(result[0] + result[1]).toBeLessThanOrEqual(usableWidth);
    });

    it('should enforce minimum column width', () => {
      const mockSheet: ExcelSheet = {
        name: 'Test Sheet',
        data: [
          [{ value: 'A', type: 'string' }],
          [{ value: 'B', type: 'string' }]
        ]
      };

      const mockColumns = [{ header: 'A', dataKey: 'col_0' }];
      const usableWidth = 500;

      const result = (generator as any).getOriginalColumnWidths(mockSheet, mockColumns, usableWidth);

      expect(result[0]).toBeGreaterThanOrEqual(60); // Minimum width enforced
    });

    it('should scale down proportionally when content exceeds available width', () => {
      const mockSheet: ExcelSheet = {
        name: 'Test Sheet',
        data: [
          [
            { value: 'Very Long Header That Would Normally Take Much Space', type: 'string' },
            { value: 'Another Very Long Header That Also Takes Much Space', type: 'string' }
          ]
        ]
      };

      const mockColumns = [
        { header: 'Very Long Header That Would Normally Take Much Space', dataKey: 'col_0' },
        { header: 'Another Very Long Header That Also Takes Much Space', dataKey: 'col_1' }
      ];

      const smallUsableWidth = 200;
      const result = (generator as any).getOriginalColumnWidths(mockSheet, mockColumns, smallUsableWidth);

      expect(result[0] + result[1]).toBeLessThanOrEqual(smallUsableWidth);
      expect(result[0]).toBeGreaterThanOrEqual(60); // Still maintain minimum
      expect(result[1]).toBeGreaterThanOrEqual(60);
    });
  });

  describe('containsCyrillic', () => {
    it('should detect Cyrillic characters', () => {
      expect((generator as any).containsCyrillic('Привет')).toBe(true);
      expect((generator as any).containsCyrillic('Hello Привет')).toBe(true);
      expect((generator as any).containsCyrillic('Русский текст')).toBe(true);
    });

    it('should return false for Latin text', () => {
      expect((generator as any).containsCyrillic('Hello World')).toBe(false);
      expect((generator as any).containsCyrillic('12345')).toBe(false);
      expect((generator as any).containsCyrillic('')).toBe(false);
    });
  });
});
