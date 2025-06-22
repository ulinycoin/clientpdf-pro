import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { CsvToPdfGenerator } from './CsvToPdfGenerator';
import { CsvPreprocessor } from './CsvPreprocessor';

// Встроенные типы для jsPDF autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      head?: any[][];
      body?: any[][];
      startY?: number;
      margin?: { top?: number; bottom?: number; left?: number; right?: number; };
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
      bodyStyles?: { fillColor?: number[] | string; textColor?: number[] | string; };
      alternateRowStyles?: { fillColor?: number[] | string; };
      tableLineColor?: number[] | string;
      tableLineWidth?: number;
      showHead?: boolean;
      showFoot?: boolean;
      didDrawPage?: (data: any) => void;
      columnStyles?: { [key: number]: any };
    }) => jsPDF;
  }
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
  maxRowsPerPage?: number;
  autoDetectDataTypes?: boolean;
}

export interface CsvParseResult {
  data: Record<string, any>[];
  headers: string[];
  rowCount: number;
  columnCount: number;
  encoding: string;
  delimiter: string;
  errors: Papa.ParseError[];
  columnTypes: Record<string, 'text' | 'number' | 'date' | 'boolean'>;
  preview: Record<string, any>[];
  reportTitle?: string;
}

export interface ColumnAnalysis {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  maxLength: number;
  avgLength: number;
  hasEmptyValues: boolean;
  alignment: 'left' | 'center' | 'right';
  samples: string[];
}

export class CsvToPdfConverter {
  private static readonly DEFAULT_OPTIONS: CsvToPdfOptions = {
    orientation: 'landscape',
    pageSize: 'a4',
    fontSize: 7,
    tableStyle: 'grid',
    headerStyle: 'bold',
    fitToPage: true,
    includeRowNumbers: false,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 10,
    marginRight: 10,
    maxRowsPerPage: 1000,
    autoDetectDataTypes: true,
  };

  /**
   * Парсинг CSV файла с предварительной обработкой для сложных структур
   */
  static async parseCSV(file: File): Promise<CsvParseResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const csvText = e.target?.result as string;
        
        try {
          console.log('Starting CSV preprocessing...');
          
          // Применяем препроцессор для сложных CSV файлов
          const preprocessed = CsvPreprocessor.preprocessCSV(csvText);
          console.log('Preprocessing completed:', {
            reportTitle: preprocessed.reportTitle,
            headerRowIndex: preprocessed.headerRowIndex,
            structure: preprocessed.structure
          });
          
          // Парсим очищенный CSV с правильными настройками
          Papa.parse(preprocessed.cleanedText, {
            header: preprocessed.structure.hasHeader,
            dynamicTyping: false,
            skipEmptyLines: 'greedy',
            encoding: 'UTF-8',
            delimiter: preprocessed.structure.delimiter,
            quoteChar: preprocessed.structure.quoteChar,
            escapeChar: preprocessed.structure.quoteChar,
            
            transformHeader: (header: string, index: number) => {
              return this.cleanHeaderName(header, index);
            },
            
            transform: (value: string) => {
              return this.cleanCellValue(value);
            },
            
            complete: (results) => {
              try {
                const processedData = this.processParseResults(
                  results, 
                  preprocessed.structure,
                  preprocessed.reportTitle
                );
                
                console.log('CSV Parse completed:', {
                  totalRows: processedData.data.length,
                  columns: processedData.headers.length,
                  delimiter: processedData.delimiter,
                  reportTitle: processedData.reportTitle,
                  errorCount: processedData.errors.length
                });
                
                resolve(processedData);
              } catch (error) {
                reject(new Error(`CSV processing failed: ${error}`));
              }
            },
            
            error: (error) => {
              reject(new Error(`Papa Parse error: ${error.message}`));
            }
          });
          
        } catch (error) {
          reject(new Error(`CSV preprocessing failed: ${error}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Конвертация CSV в PDF с использованием нового генератора
   */
  static async convertToPDF(
    parseResult: CsvParseResult, 
    options: Partial<CsvToPdfOptions> = {}
  ): Promise<Uint8Array> {
    // Если есть заголовок отчета и не указан title, используем его
    if (parseResult.reportTitle && !options.title) {
      options.title = parseResult.reportTitle;
    }
    
    return CsvToPdfGenerator.convertToPDF(parseResult, options);
  }

  private static cleanHeaderName(header: string, index: number): string {
    if (!header || header.trim() === '') {
      return `Column_${index + 1}`;
    }
    
    let cleaned = header
      .trim()
      .replace(/[^\w\s\-_\.\/@#\/]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleaned || `Column_${index + 1}`;
  }

  private static cleanCellValue(value: string): string {
    if (!value) return '';
    
    const strValue = String(value);
    
    if (['null', 'undefined', 'NULL', 'N/A', 'n/a', '#N/A'].includes(strValue)) {
      return '';
    }
    
    return strValue.trim();
  }

  /**
   * Обработка результатов парсинга
   */
  private static processParseResults(
    results: Papa.ParseResult<any>, 
    structure: any,
    reportTitle?: string
  ): CsvParseResult {
    let headers: string[];
    let data: Record<string, any>[];
    
    console.log('Processing parse results:', {
      dataLength: results.data.length,
      hasHeader: structure.hasHeader,
      fields: results.meta.fields?.length,
      sampleFields: results.meta.fields?.slice(0, 5)
    });
    
    if (structure.hasHeader && results.meta.fields) {
      headers = results.meta.fields;
      data = results.data as Record<string, any>[];
    } else {
      // Создаем заголовки для данных без заголовков
      const firstRow = results.data[0];
      if (Array.isArray(firstRow)) {
        headers = firstRow.map((_, index) => `Column_${index + 1}`);
        data = (results.data as any[][]).map(row => {
          const obj: Record<string, any> = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });
      } else {
        headers = Object.keys(firstRow || {});
        data = results.data as Record<string, any>[];
      }
    }
    
    // Фильтрация пустых строк
    data = data.filter(row => {
      return Object.values(row).some(val => 
        val !== null && val !== undefined && String(val).trim() !== ''
      );
    });
    
    const columnTypes = this.analyzeColumnTypes(headers, data);
    const preview = data.slice(0, 5);
    const criticalErrors = results.errors.filter(error => 
      error.type === 'Delimiter' || error.type === 'Quotes'
    );
    
    return {
      data,
      headers,
      rowCount: data.length,
      columnCount: headers.length,
      encoding: 'UTF-8',
      delimiter: structure.delimiter,
      errors: criticalErrors,
      columnTypes,
      preview,
      reportTitle
    };
  }

  private static analyzeColumnTypes(headers: string[], data: Record<string, any>[]): Record<string, 'text' | 'number' | 'date' | 'boolean'> {
    const columnTypes: Record<string, 'text' | 'number' | 'date' | 'boolean'> = {};
    const sampleSize = Math.min(100, data.length);
    
    headers.forEach(header => {
      const samples = data.slice(0, sampleSize)
        .map(row => row[header])
        .filter(val => val !== null && val !== undefined && String(val).trim() !== '');
      
      if (samples.length === 0) {
        columnTypes[header] = 'text';
        return;
      }
      
      // Специальная логика для финансовых данных
      const headerLower = header.toLowerCase();
      if (headerLower.includes('summa') || headerLower.includes('amount')) {
        columnTypes[header] = 'number';
        return;
      }
      
      if (headerLower.includes('datums') || headerLower.includes('date')) {
        columnTypes[header] = 'date';
        return;
      }
      
      const numericCount = samples.filter(val => {
        const strVal = String(val).replace(/[,\s]/g, '');
        return !isNaN(Number(strVal)) && strVal !== '';
      }).length;
      
      const dateCount = samples.filter(val => {
        const strVal = String(val);
        return /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/.test(strVal) ||
               /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/.test(strVal);
      }).length;
      
      const booleanCount = samples.filter(val => {
        const strVal = String(val).toLowerCase();
        return ['true', 'false', 'yes', 'no', '1', '0', 'on', 'off', 'd', 'c'].includes(strVal);
      }).length;
      
      const total = samples.length;
      if (booleanCount > total * 0.8) {
        columnTypes[header] = 'boolean';
      } else if (numericCount > total * 0.8) {
        columnTypes[header] = 'number';
      } else if (dateCount > total * 0.6) {
        columnTypes[header] = 'date';
      } else {
        columnTypes[header] = 'text';
      }
    });
    
    return columnTypes;
  }

  /**
   * Валидация CSV файла
   */
  static validateCSV(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!file) errors.push('No file provided');
    if (file.size === 0) errors.push('File is empty');
    if (file.size > maxSize) errors.push(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);

    const validExtensions = ['.csv', '.txt', '.tsv'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      errors.push(`Invalid file type. Supported: ${validExtensions.join(', ')}`);
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Получение примера настроек для предварительного просмотра
   */
  static getPreviewOptions(): CsvToPdfOptions {
    return { 
      ...this.DEFAULT_OPTIONS, 
      fontSize: 6, 
      marginTop: 10, 
      marginBottom: 10 
    };
  }
}