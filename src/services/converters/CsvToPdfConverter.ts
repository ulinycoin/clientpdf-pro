import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { CsvToPdfGenerator } from './CsvToPdfGenerator';

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
   * Парсинг CSV файла с улучшенным определением структуры
   */
  static async parseCSV(file: File): Promise<CsvParseResult> {
    return new Promise((resolve, reject) => {
      const chunk = file.slice(0, Math.min(50000, file.size));
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const sampleText = e.target?.result as string;
        
        try {
          const structure = this.analyzeCSVStructure(sampleText);
          console.log('CSV Structure Analysis:', structure);
          
          Papa.parse(file, {
            header: structure.hasHeader,
            dynamicTyping: false,
            skipEmptyLines: 'greedy',
            encoding: 'UTF-8',
            delimiter: structure.delimiter,
            quoteChar: structure.quoteChar,
            escapeChar: structure.quoteChar,
            
            transformHeader: (header: string, index: number) => {
              return this.cleanHeaderName(header, index);
            },
            
            transform: (value: string) => {
              return this.cleanCellValue(value);
            },
            
            complete: (results) => {
              try {
                const processedData = this.processParseResults(results, structure);
                console.log('CSV Parse completed:', {
                  totalRows: processedData.data.length,
                  columns: processedData.headers.length,
                  delimiter: processedData.delimiter,
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
          reject(new Error(`CSV analysis failed: ${error}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(chunk, 'UTF-8');
    });
  }

  /**
   * Конвертация CSV в PDF с использованием нового генератора
   */
  static async convertToPDF(
    parseResult: CsvParseResult, 
    options: Partial<CsvToPdfOptions> = {}
  ): Promise<Uint8Array> {
    return CsvToPdfGenerator.convertToPDF(parseResult, options);
  }

  /**
   * Анализ структуры CSV файла
   */
  private static analyzeCSVStructure(text: string) {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
      throw new Error('CSV file appears to be empty');
    }
    
    return {
      delimiter: this.detectDelimiterAdvanced(lines),
      hasHeader: this.detectHeaderRow(lines),
      quoteChar: this.detectQuoteChar(lines),
      encoding: 'UTF-8',
      lineCount: lines.length
    };
  }

  /**
   * Продвинутое определение разделителя с множественной эвристикой
   */
  private static detectDelimiterAdvanced(lines: string[]): string {
    const candidates = [';', ',', '\t', '|'];
    const analysisLines = lines.slice(0, Math.min(10, lines.length));
    
    let bestDelimiter = ';';
    let maxScore = 0;
    
    for (const delimiter of candidates) {
      const scores = analysisLines.map(line => this.scoreDelimiterForLine(line, delimiter));
      const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const consistency = this.calculateConsistency(scores);
      const finalScore = averageScore * consistency;
      
      console.log(`Delimiter "${delimiter}": avg=${averageScore.toFixed(2)}, consistency=${consistency.toFixed(2)}, final=${finalScore.toFixed(2)}`);
      
      if (finalScore > maxScore) {
        maxScore = finalScore;
        bestDelimiter = delimiter;
      }
    }
    
    return bestDelimiter;
  }

  private static scoreDelimiterForLine(line: string, delimiter: string): number {
    let count = 0;
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        count++;
      }
    }
    
    return count >= 2 && count <= 50 ? count : count * 0.5;
  }

  private static calculateConsistency(scores: number[]): number {
    if (scores.length <= 1) return 1;
    
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    return mean > 0 ? Math.max(0, 1 - (stdDev / mean)) : 0;
  }

  private static detectQuoteChar(lines: string[]): string {
    const doubleQuoteCount = lines.join('').split('"').length - 1;
    const singleQuoteCount = lines.join('').split("'").length - 1;
    return doubleQuoteCount >= singleQuoteCount ? '"' : "'";
  }

  /**
   * УЛУЧШЕННОЕ определение строки заголовков для сложных CSV файлов
   */
  private static detectHeaderRow(lines: string[]): boolean {
    if (lines.length < 2) return false;
    
    const headerIndicators = [
      'MU NR.', 'DATUMS', 'VALŪTA', 'SUMMA', 'KODS',
      'ID', 'DATE', 'AMOUNT', 'NAME', 'VALUE', 'TYPE',
      'NUMBER', 'CODE', 'DESCRIPTION', 'STATUS',
      'MAKSĀJUMA', 'PARTNERA', 'TRANSAKCIJAS', 'REFERENCE'
    ];
    
    // Ищем строку с наибольшим количеством заголовков-индикаторов
    let bestHeaderLineIndex = -1;
    let maxIndicatorCount = 0;
    
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].toUpperCase();
      const indicatorCount = headerIndicators.filter(indicator => 
        line.includes(indicator.toUpperCase())
      ).length;
      
      console.log(`Line ${i + 1}: ${indicatorCount} indicators found`);
      
      if (indicatorCount > maxIndicatorCount) {
        maxIndicatorCount = indicatorCount;
        bestHeaderLineIndex = i;
      }
    }
    
    // Если нашли строку с заголовками, проверяем что это не первая строка
    if (bestHeaderLineIndex > 0 && maxIndicatorCount >= 2) {
      console.log(`Header row detected at line ${bestHeaderLineIndex + 1} with ${maxIndicatorCount} indicators`);
      return true;
    }
    
    // Если первая строка содержит много индикаторов, это тоже заголовок
    if (bestHeaderLineIndex === 0 && maxIndicatorCount >= 3) {
      console.log(`Header row detected at line 1 with ${maxIndicatorCount} indicators`);
      return true;
    }
    
    // Дополнительная проверка - сравниваем структуру строк
    if (lines.length >= 3) {
      const delimiter = this.detectDelimiterAdvanced(lines);
      
      // Анализируем первые 3 строки
      const lineParts = lines.slice(0, 3).map(line => this.splitCSVLine(line, delimiter));
      
      // Если вторая строка имеет больше всего столбцов и содержит текстовые заголовки
      if (lineParts[1] && lineParts[1].length > lineParts[0].length && lineParts[1].length >= lineParts[2]?.length) {
        const secondLineHasTextHeaders = lineParts[1].some(field => 
          field.trim().length > 3 && isNaN(Number(field.trim().replace(/[^\d.-]/g, '')))
        );
        
        if (secondLineHasTextHeaders) {
          console.log('Header row detected at line 2 based on structure analysis');
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Разделение CSV строки с учетом кавычек
   */
  private static splitCSVLine(line: string, delimiter: string): string[] {
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          currentField += '"';
          i++; // Пропускаем следующую кавычку
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        fields.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    
    fields.push(currentField.trim());
    return fields;
  }

  private static cleanHeaderName(header: string, index: number): string {
    if (!header || header.trim() === '') {
      return `Column_${index + 1}`;
    }
    
    let cleaned = header
      .trim()
      .replace(/[^\w\s\-_\.\/@#]/g, ' ')
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
   * УЛУЧШЕННАЯ обработка результатов парсинга для сложных CSV файлов
   */
  private static processParseResults(results: Papa.ParseResult<any>, structure: any): CsvParseResult {
    let headers: string[];
    let data: Record<string, any>[];
    
    console.log('Processing parse results:', {
      dataLength: results.data.length,
      hasHeader: structure.hasHeader,
      fields: results.meta.fields,
      firstRowSample: results.data[0]
    });
    
    if (structure.hasHeader && results.meta.fields) {
      headers = results.meta.fields;
      data = results.data as Record<string, any>[];
    } else {
      // Для файлов без заголовков или с неправильно определенными заголовками
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
    
    // Фильтрация пустых строк и строк-заголовков отчета
    data = data.filter((row, index) => {
      // Пропускаем строки которые выглядят как заголовки отчета
      const values = Object.values(row);
      const firstValue = String(values[0] || '').trim();
      
      // Пропускаем строки заголовков отчета
      if (firstValue.includes('PĀRSKATS') || firstValue.includes('KONTAA') || 
          firstValue.includes('PERIODU') || firstValue.length > 100) {
        console.log(`Skipping report header row ${index}: ${firstValue.substring(0, 50)}...`);
        return false;
      }
      
      // Проверяем что в строке есть хотя бы одно непустое значение
      return values.some(val => 
        val !== null && val !== undefined && String(val).trim() !== ''
      );
    });
    
    const columnTypes = this.analyzeColumnTypes(headers, data);
    const preview = data.slice(0, 5);
    const criticalErrors = results.errors.filter(error => 
      error.type === 'Delimiter' || error.type === 'Quotes'
    );
    
    console.log('Final processed result:', {
      headers: headers.length,
      dataRows: data.length,
      sampleRow: data[0]
    });
    
    return {
      data,
      headers,
      rowCount: data.length,
      columnCount: headers.length,
      encoding: 'UTF-8',
      delimiter: structure.delimiter,
      errors: criticalErrors,
      columnTypes,
      preview
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
        return ['true', 'false', 'yes', 'no', '1', '0', 'on', 'off'].includes(strVal);
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