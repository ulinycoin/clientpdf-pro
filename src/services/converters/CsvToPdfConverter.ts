import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Встроенные типы для jsPDF autoTable (чтобы избежать проблем с импортом)
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
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
      // Читаем небольшую часть файла для анализа
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const firstLines = text.split('\n').slice(0, 15).join('\n');
        
        // Определяем разделитель и структуру
        const delimiter = this.detectDelimiter(firstLines);
        console.log('Detected delimiter:', delimiter);
        
        // Основной парсинг с правильными настройками
        Papa.parse(file, {
          header: true,
          dynamicTyping: false,
          skipEmptyLines: 'greedy',
          encoding: 'UTF-8',
          delimiter: delimiter,
          quoteChar: '"',
          escapeChar: '"',
          transformHeader: (header: string, index: number) => {
            // Очищаем заголовки и делаем их уникальными
            const cleanHeader = header.trim().replace(/[^\w\s\-_\.]/g, '').trim();
            return cleanHeader || `Column_${index + 1}`;
          },
          transform: (value: string, field: string) => {
            // Очищаем значения
            if (!value || value === 'null' || value === 'undefined') {
              return '';
            }
            return String(value).trim();
          },
          complete: (results) => {
            try {
              console.log('Parse results:', {
                fields: results.meta.fields,
                delimiter: results.meta.delimiter,
                errors: results.errors.length
              });

              const headers = results.meta.fields || [];
              let data = results.data as Record<string, any>[];

              // Фильтруем пустые строки более агрессивно
              data = data.filter(row => {
                // Проверяем что в строке есть хотя бы одно непустое значение
                return Object.values(row).some(val => 
                  val && String(val).trim() !== '' && String(val).trim() !== 'null'
                );
              });

              // Очищаем данные от undefined/null значений
              data = data.map(row => {
                const cleanRow: Record<string, any> = {};
                headers.forEach(header => {
                  const value = row[header];
                  cleanRow[header] = (value === null || value === undefined || value === 'null') 
                    ? '' 
                    : String(value).trim();
                });
                return cleanRow;
              });

              // Фильтруем только критические ошибки
              const criticalErrors = results.errors.filter(error => 
                error.type === 'Delimiter' || error.type === 'Quotes'
              );

              console.log('Processed data:', {
                headers,
                rowCount: data.length,
                columnCount: headers.length,
                sampleRow: data[0]
              });

              resolve({
                data,
                headers,
                rowCount: data.length,
                columnCount: headers.length,
                encoding: 'UTF-8',
                delimiter: delimiter,
                errors: criticalErrors,
              });
            } catch (error) {
              reject(new Error(`CSV parsing failed: ${error}`));
            }
          },
          error: (error) => {
            reject(new Error(`Papa Parse error: ${error.message}`));
          }
        });
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Улучшенное определение разделителя
   */
  private static detectDelimiter(sample: string): string {
    const delimiters = [';', ',', '\t', '|', ':'];
    const lines = sample.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    if (lines.length < 2) return ';';
    
    let bestDelimiter = ';';
    let maxScore = 0;
    
    for (const delimiter of delimiters) {
      const counts = lines.slice(0, 10).map(line => {
        // Учитываем кавычки при подсчете
        const parts = line.split(delimiter);
        return parts.length - 1;
      });
      
      if (counts.length === 0) continue;
      
      const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length;
      const consistency = counts.filter(count => count === counts[0]).length / counts.length;
      const score = avgCount * consistency * (avgCount > 0 ? 1 : 0);
      
      console.log(`Delimiter "${delimiter}": avg=${avgCount}, consistency=${consistency}, score=${score}`);
      
      if (score > maxScore && avgCount > 0) {
        maxScore = score;
        bestDelimiter = delimiter;
      }
    }
    
    return bestDelimiter;
  }

  /**
   * Конвертация CSV в PDF с улучшенным форматированием
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
        const rowData = parseResult.headers.map(header => {
          const value = row[header];
          return (value === null || value === undefined || value === 'null') ? '' : String(value);
        });
        return opts.includeRowNumbers 
          ? [index + 1, ...rowData]
          : rowData;
      });

      // Настройки стилей таблицы
      const tableStyles = this.getTableStyles(opts);
      
      // Определяем ширину колонок автоматически
      const columnStyles = this.calculateColumnWidths(parseResult.headers, parseResult.data, opts);
      
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
          cellPadding: 1.5,
          overflow: 'linebreak',
          halign: 'left',
          valign: 'top',
          lineColor: tableStyles.lineColor,
          lineWidth: tableStyles.lineWidth,
        },
        headStyles: {
          ...tableStyles.headerStyles,
          minCellHeight: 8,
        },
        bodyStyles: tableStyles.bodyStyles,
        alternateRowStyles: tableStyles.alternateRowStyles,
        columnStyles: columnStyles,
        showHead: true,
        showFoot: false,
        tableLineColor: tableStyles.lineColor,
        tableLineWidth: tableStyles.lineWidth,
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
   * Автоматический расчет ширины колонок
   */
  private static calculateColumnWidths(headers: string[], data: Record<string, any>[], opts: CsvToPdfOptions) {
    const columnStyles: { [key: number]: any } = {};
    const pageWidth = this.getPageWidth(opts.pageSize, opts.orientation) - opts.marginLeft - opts.marginRight;
    
    // Анализируем содержимое каждой колонки
    headers.forEach((header, index) => {
      // Получаем среднюю длину содержимого в колонке
      const headerLength = header.length;
      const sampleSize = Math.min(50, data.length);
      const contentLengths = data.slice(0, sampleSize).map(row => {
        const value = row[header];
        return value ? String(value).length : 0;
      });
      
      const avgContentLength = contentLengths.reduce((a, b) => a + b, 0) / contentLengths.length;
      const maxContentLength = Math.max(...contentLengths, headerLength);
      
      // Определяем оптимальную ширину
      let cellWidth;
      if (maxContentLength > 50) {
        cellWidth = Math.max(30, pageWidth * 0.25); // Широкие колонки для длинного текста
      } else if (maxContentLength > 20) {
        cellWidth = Math.max(20, pageWidth * 0.15);
      } else if (maxContentLength > 10) {
        cellWidth = Math.max(15, pageWidth * 0.1);
      } else {
        cellWidth = Math.max(10, pageWidth * 0.08); // Узкие колонки для коротких данных
      }
      
      columnStyles[index] = {
        cellWidth: cellWidth,
        overflow: 'linebreak',
        halign: this.detectColumnAlignment(header, data.slice(0, 10), header)
      };
    });
    
    return columnStyles;
  }

  /**
   * Определение выравнивания колонки по содержимому
   */
  private static detectColumnAlignment(header: string, data: Record<string, any>[], columnName: string): 'left' | 'center' | 'right' {
    // Проверяем содержимое колонки
    const values = data.map(row => row[columnName]).filter(val => val && String(val).trim());
    
    if (values.length === 0) return 'left';
    
    // Если все значения - числа, выравниваем по правому краю
    const numericValues = values.filter(val => !isNaN(Number(String(val).replace(/[,\s]/g, ''))));
    if (numericValues.length > values.length * 0.8) {
      return 'right';
    }
    
    // Если короткие значения (коды), выравниваем по центру
    const avgLength = values.reduce((sum, val) => sum + String(val).length, 0) / values.length;
    if (avgLength < 8) {
      return 'center';
    }
    
    return 'left';
  }

  /**
   * Получение ширины страницы в мм
   */
  private static getPageWidth(pageSize: string, orientation: string): number {
    const sizes = {
      'a4': orientation === 'landscape' ? 297 : 210,
      'a3': orientation === 'landscape' ? 420 : 297,
      'letter': orientation === 'landscape' ? 279 : 216,
      'legal': orientation === 'landscape' ? 356 : 216,
    };
    return sizes[pageSize as keyof typeof sizes] || 297;
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
            halign: 'center' as const,
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
            halign: 'center' as const,
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
            halign: 'center' as const,
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
            halign: 'center' as const,
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