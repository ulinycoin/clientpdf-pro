import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Расширяем типы jsPDF для autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
  }
}

// Типы для autoTable
interface AutoTableOptions {
  head?: any[][];
  body?: any[][];
  startY?: number;
  margin?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  styles?: {
    fontSize?: number;
    cellPadding?: number;
    overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden';
    halign?: 'left' | 'center' | 'right';
    valign?: 'top' | 'middle' | 'bottom';
  };
  headStyles?: {
    fillColor?: number[] | string;
    textColor?: number[] | string;
    fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
  };
  bodyStyles?: {
    fillColor?: number[] | string;
    textColor?: number[] | string;
  };
  alternateRowStyles?: {
    fillColor?: number[] | string;
  };
  tableLineColor?: number[] | string;
  tableLineWidth?: number;
  showHead?: boolean;
  showFoot?: boolean;
  didDrawPage?: (data: any) => void;
}

export interface CsvToPdfOptions {
  orientation: 'portrait' | 'landscape';
  pageSize: 'a4' | 'a3' | 'letter' | 'legal';
  fontSize: number;
  tableStyle: 'grid' | 'striped' | 'plain' | 'minimal';
  headerStyle: 'bold' | 'colored' | 'simple';
  fitToPage: boolean;
  includeRowNumbers: boolean;
  title?: string;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

export interface CsvParseResult {
  data: Record<string, any>[];
  headers: string[];
  rowCount: number;
  columnCount: number;
  encoding: string;
  delimiter: string;
  errors: Papa.ParseError[];
}

export class CsvToPdfConverter {
  private static readonly DEFAULT_OPTIONS: CsvToPdfOptions = {
    orientation: 'landscape',
    pageSize: 'a4',
    fontSize: 8,
    tableStyle: 'grid',
    headerStyle: 'bold',
    fitToPage: true,
    includeRowNumbers: false,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 10,
    marginRight: 10,
  };

  /**
   * Парсинг CSV файла с автоматическим определением разделителя
   */
  static async parseCSV(file: File): Promise<CsvParseResult> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        encoding: 'UTF-8',
        delimitersToGuess: [',', '\t', '|', ';', ':', '~'],
        complete: (results) => {
          try {
            const headers = results.meta.fields || [];
            const cleanHeaders = headers.map(header => 
              header?.toString().trim() || ''
            ).filter(Boolean);

            // Очистка данных от undefined значений
            const cleanData = (results.data as Record<string, any>[]).map((row: any) => {
              const cleanRow: Record<string, any> = {};
              cleanHeaders.forEach(header => {
                cleanRow[header] = row[header] !== undefined ? 
                  String(row[header]).trim() : '';
              });
              return cleanRow;
            }).filter(row => Object.values(row).some(val => val !== ''));

            resolve({
              data: cleanData,
              headers: cleanHeaders,
              rowCount: cleanData.length,
              columnCount: cleanHeaders.length,
              encoding: 'UTF-8',
              delimiter: results.meta.delimiter || ',',
              errors: results.errors || [],
            });
          } catch (error) {
            reject(new Error(`CSV parsing failed: ${error}`));
          }
        },
        error: (error) => {
          reject(new Error(`Papa Parse error: ${error.message}`));
        }
      });
    });
  }

  /**
   * Конвертация CSV в PDF
   */
  static async convertToPDF(
    parseResult: CsvParseResult, 
    options: Partial<CsvToPdfOptions> = {}
  ): Promise<Uint8Array> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      // Создание PDF документа
      const pdf = new jsPDF({
        orientation: opts.orientation,
        unit: 'mm',
        format: opts.pageSize.toLowerCase() as any,
      });

      // Настройка метаданных
      pdf.setProperties({
        title: opts.title || 'CSV to PDF Conversion',
        subject: `Converted CSV file with ${parseResult.rowCount} rows`,
        author: 'ClientPDF Pro',
        creator: 'ClientPDF Pro - CSV to PDF Converter',
        keywords: 'CSV, PDF, conversion, table, data',
      });

      // Добавление заголовка документа
      if (opts.title) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(opts.title, opts.marginLeft, opts.marginTop);
      }

      // Подготовка данных для таблицы
      const tableHeaders = opts.includeRowNumbers 
        ? ['#', ...parseResult.headers]
        : parseResult.headers;

      const tableData = parseResult.data.map((row, index) => {
        const rowData = parseResult.headers.map(header => 
          row[header] || ''
        );
        return opts.includeRowNumbers 
          ? [index + 1, ...rowData]
          : rowData;
      });

      // Настройки стилей таблицы
      const tableStyles = this.getTableStyles(opts);
      
      // Генерация таблицы
      pdf.autoTable({
        head: [tableHeaders],
        body: tableData,
        startY: opts.title ? opts.marginTop + 10 : opts.marginTop,
        margin: {
          top: opts.marginTop,
          bottom: opts.marginBottom,
          left: opts.marginLeft,
          right: opts.marginRight,
        },
        styles: {
          fontSize: opts.fontSize,
          cellPadding: 2,
          overflow: 'linebreak',
          halign: 'left',
          valign: 'middle',
        },
        headStyles: tableStyles.headerStyles,
        bodyStyles: tableStyles.bodyStyles,
        alternateRowStyles: tableStyles.alternateRowStyles,
        tableLineColor: tableStyles.lineColor,
        tableLineWidth: tableStyles.lineWidth,
        showHead: true,
        showFoot: false,
        didDrawPage: (data: any) => {
          // Добавление номеров страниц
          const pageNumber = (pdf as any).internal.getCurrentPageInfo().pageNumber;
          const totalPages = (pdf as any).internal.pages.length - 1;
          
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.text(
            `Page ${pageNumber} of ${totalPages}`,
            data.settings.margin.left,
            (pdf as any).internal.pageSize.height - 10
          );
          
          // Добавление информации о файле
          pdf.text(
            `Rows: ${parseResult.rowCount} | Columns: ${parseResult.columnCount}`,
            (pdf as any).internal.pageSize.width - 50,
            (pdf as any).internal.pageSize.height - 10
          );
        },
      });

      // Возврат PDF как Uint8Array
      const pdfOutput = pdf.output('arraybuffer');
      return new Uint8Array(pdfOutput);

    } catch (error) {
      throw new Error(`PDF generation failed: ${error}`);
    }
  }

  /**
   * Получение стилей таблицы в зависимости от выбранного стиля
   */
  private static getTableStyles(options: CsvToPdfOptions) {
    const baseStyles = {
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    };

    switch (options.tableStyle) {
      case 'grid':
        return {
          ...baseStyles,
          headerStyles: {
            fillColor: [41, 128, 185],
            textColor: [255, 255, 255],
            fontStyle: 'bold' as const,
          },
          bodyStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
          lineWidth: 0.3,
        };

      case 'striped':
        return {
          ...baseStyles,
          headerStyles: {
            fillColor: [52, 73, 94],
            textColor: [255, 255, 255],
            fontStyle: 'bold' as const,
          },
          bodyStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
          },
          alternateRowStyles: {
            fillColor: [248, 249, 250],
          },
          lineWidth: 0.1,
        };

      case 'minimal':
        return {
          ...baseStyles,
          headerStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: 'bold' as const,
          },
          bodyStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
          },
          alternateRowStyles: {
            fillColor: [255, 255, 255],
          },
          lineColor: [220, 220, 220],
          lineWidth: 0.1,
        };

      case 'plain':
      default:
        return {
          ...baseStyles,
          headerStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: 'bold' as const,
          },
          bodyStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
          },
          alternateRowStyles: {
            fillColor: [255, 255, 255],
          },
          lineColor: [0, 0, 0],
          lineWidth: 0,
        };
    }
  }

  /**
   * Валидация CSV файла
   */
  static validateCSV(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!file) {
      errors.push('No file provided');
      return { isValid: false, errors };
    }

    if (file.size === 0) {
      errors.push('File is empty');
    }

    if (file.size > maxSize) {
      errors.push(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
    }

    const validExtensions = ['.csv', '.txt', '.tsv'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      errors.push(`Invalid file type. Supported: ${validExtensions.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Получение примера настроек для предварительного просмотра
   */
  static getPreviewOptions(): CsvToPdfOptions {
    return {
      ...this.DEFAULT_OPTIONS,
      fontSize: 6,
      marginTop: 10,
      marginBottom: 10,
    };
  }
}