import * as XLSX from 'xlsx';
import { ExcelCell, ExcelSheet, ExcelWorkbook, CellFormatting, LanguageDetectionResult } from '../types/excelToPdf.types';
import { detectLanguageFromText } from '../utils/excelLanguageDetector';

export class ExcelParserService {

  async parseExcelFile(file: File): Promise<ExcelWorkbook> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, {
        cellStyles: true,
        cellFormulas: true,
        cellDates: true,
        cellNF: true,
        sheetStubs: true
      });

      const sheets: ExcelSheet[] = [];
      const allDetectedLanguages = new Set<string>();

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const sheet = await this.parseWorksheet(worksheet, sheetName);
        sheets.push(sheet);

        sheet.metadata?.detectedLanguages.forEach(lang => allDetectedLanguages.add(lang));
      }

      return {
        sheets,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          totalSheets: sheets.length,
          detectedLanguages: Array.from(allDetectedLanguages),
          requiresSpecialFont: this.requiresSpecialFont(Array.from(allDetectedLanguages)),
          estimatedPdfSize: this.estimatePdfSize(sheets)
        }
      };
    } catch (error) {
      throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async parseWorksheet(worksheet: XLSX.WorkSheet, sheetName: string): Promise<ExcelSheet> {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
    const data: ExcelCell[][] = [];
    const textContent: string[] = [];

    for (let row = range.s.r; row <= range.e.r; row++) {
      const rowData: ExcelCell[] = [];

      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ c: col, r: row });
        const cell = worksheet[cellAddress];

        const excelCell = this.parseCell(cell);
        rowData.push(excelCell);

        if (excelCell.value && typeof excelCell.value === 'string') {
          textContent.push(excelCell.value);
        }
      }

      data.push(rowData);
    }

    const languageDetection = await this.detectLanguages(textContent.join(' '));
    const columns = this.extractColumnInfo(worksheet);
    const rows = this.extractRowInfo(worksheet);

    return {
      name: sheetName,
      data,
      columns,
      rows,
      metadata: {
        totalColumns: range.e.c - range.s.c + 1,
        totalRows: range.e.r - range.s.r + 1,
        maxWidth: Math.max(...columns.map(col => col.width || 100)),
        detectedLanguages: languageDetection.detectedLanguages.map(l => l.language),
        hasWideTable: (range.e.c - range.s.c + 1) > 15
      }
    };
  }

  private parseCell(cell: XLSX.CellObject | undefined): ExcelCell {
    if (!cell) {
      return { value: null, type: 'string' };
    }

    let value: string | number | Date | null = null;
    let type: ExcelCell['type'] = 'string';

    if (cell.v !== undefined) {
      if (cell.t === 'n') {
        value = cell.v as number;
        type = 'number';
      } else if (cell.t === 'd') {
        value = new Date(cell.v as string);
        type = 'date';
      } else if (cell.t === 'b') {
        value = cell.v ? 'TRUE' : 'FALSE';
        type = 'boolean';
      } else if (cell.f) {
        value = cell.w || String(cell.v);
        type = 'formula';
      } else {
        value = String(cell.v);
        type = 'string';
      }
    }

    const formatting = this.extractCellFormatting(cell);

    return { value, type, formatting };
  }

  private extractCellFormatting(cell: XLSX.CellObject): CellFormatting | undefined {
    if (!cell.s) return undefined;

    const style = cell.s;
    const formatting: CellFormatting = {};

    if (style.font) {
      if (style.font.name) formatting.fontFamily = style.font.name;
      if (style.font.sz) formatting.fontSize = style.font.sz;
      if (style.font.bold) formatting.bold = true;
      if (style.font.italic) formatting.italic = true;
      if (style.font.underline) formatting.underline = true;
      if (style.font.color?.rgb) {
        formatting.color = `#${style.font.color.rgb}`;
      }
    }

    if (style.fill?.fgColor?.rgb) {
      formatting.backgroundColor = `#${style.fill.fgColor.rgb}`;
    }

    if (style.alignment) {
      if (style.alignment.horizontal) {
        formatting.alignment = style.alignment.horizontal as any;
      }
      if (style.alignment.vertical) {
        formatting.verticalAlignment = style.alignment.vertical as any;
      }
    }

    if (style.border) {
      formatting.border = {
        top: !!style.border.top,
        right: !!style.border.right,
        bottom: !!style.border.bottom,
        left: !!style.border.left
      };
    }

    return Object.keys(formatting).length > 0 ? formatting : undefined;
  }

  private extractColumnInfo(worksheet: XLSX.WorkSheet) {
    const columns = worksheet['!cols'] || [];
    return columns.map(col => ({
      width: col.wch || col.wpx ? (col.wch || col.wpx / 7) : undefined,
      hidden: col.hidden || false
    }));
  }

  private extractRowInfo(worksheet: XLSX.WorkSheet) {
    const rows = worksheet['!rows'] || [];
    return rows.map(row => ({
      height: row.hpt || undefined,
      hidden: row.hidden || false
    }));
  }

  private async detectLanguages(text: string): Promise<LanguageDetectionResult> {
    try {
      return await detectLanguageFromText(text);
    } catch (error) {
      return {
        primaryLanguage: 'en',
        confidence: 0.5,
        detectedLanguages: [{ language: 'en', confidence: 0.5, script: 'latin' }],
        requiredFontSubsets: ['latin']
      };
    }
  }

  private requiresSpecialFont(languages: string[]): boolean {
    const specialLanguages = ['ru', 'ar', 'zh', 'ja', 'ko', 'hi', 'th'];
    return languages.some(lang => specialLanguages.includes(lang));
  }

  private estimatePdfSize(sheets: ExcelSheet[]): number {
    const totalCells = sheets.reduce((sum, sheet) =>
      sum + (sheet.metadata?.totalColumns || 0) * (sheet.metadata?.totalRows || 0), 0
    );
    return Math.max(500000, totalCells * 100);
  }
}

export const excelParserService = new ExcelParserService();
