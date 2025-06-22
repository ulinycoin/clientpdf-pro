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
    fontSize: 7,
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
      // Читаем файл для анализа
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        
        // Определяем разделитель и структуру
        const delimiter = this.detectDelimiter(text);
        const hasHeader = this.hasHeaderRow(text, delimiter);
        
        console.log('Detected delimiter:', JSON.stringify(delimiter));
        console.log('Has header:', hasHeader);
        
        // Основной парсинг с правильными настройками
        Papa.parse(file, {
          header: hasHeader,
          dynamicTyping: false,
          skipEmptyLines: 'greedy',
          encoding: 'UTF-8',
          delimiter: delimiter,
          quoteChar: '"',
          escapeChar: '"',
          transformHeader: (header: string, index: number) => {
            // Очищаем заголовки
            const cleanHeader = header.trim().replace(/[^\w\s\-_\.\/]/g, ' ').trim();
            return cleanHeader || `Col_${index + 1}`;
          },
          transform: (value: string) => {
            // Очищаем значения
            if (!value || value === 'null' || value === 'undefined') {
              return '';
            }
            return String(value).trim();
          },
          complete: (results) => {
            try {
              console.log('Papa Parse results:', {
                fields: results.meta.fields,
                delimiter: results.meta.delimiter,
                linebreak: results.meta.linebreak,
                aborted: results.meta.aborted,
                truncated: results.meta.truncated,
                cursor: results.meta.cursor,
                dataRowCount: results.data.length,
                errorsCount: results.errors.length
              });

              let headers: string[];
              let data: Record<string, any>[];

              if (hasHeader && results.meta.fields && results.meta.fields.length > 1) {
                headers = results.meta.fields;
                data = results.data as Record<string, any>[];
              } else {
                // Создаем заголовки на основе первой строки данных
                const firstRow = results.data[0] as any;
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
                  headers = Object.keys(firstRow);
                  data = results.data as Record<string, any>[];
                }
              }

              // Фильтруем пустые строки и заголовок-описание
              data = data.filter((row, index) => {
                // Пропускаем первую строку если это описание файла
                if (index === 0 && headers.length === 1) {
                  const firstValue = Object.values(row)[0];
                  if (firstValue && String(firstValue).includes('PĀRSKATS')) {
                    return false;
                  }
                }
                
                // Проверяем что в строке есть хотя бы одно непустое значение
                return Object.values(row).some(val => 
                  val && String(val).trim() !== '' && String(val).trim() !== 'null'
                );
              });

              // Очищаем данные
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

              console.log('Final processed data:', {
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
  private static detectDelimiter(text: string): string {
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) return ';';
    
    // Берем несколько строк для анализа (исключая первую если это заголовок файла)
    let analysisLines = lines.slice(0, 5);
    
    // Исключаем строки-заголовки которые могут не иметь разделителей
    analysisLines = analysisLines.filter(line => 
      !line.includes('PĀRSKATS') && 
      !line.includes('PERIODU') &&
      line.includes('"') // строки с данными обычно содержат кавычки
    );
    
    if (analysisLines.length === 0) {
      analysisLines = lines.slice(1, 3); // fallback
    }
    
    const delimiters = [';', ',', '\t', '|'];
    let bestDelimiter = ';';
    let maxScore = 0;
    
    for (const delimiter of delimiters) {
      const counts = analysisLines.map(line => {
        // Считаем количество разделителей, учитывая кавычки
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
        
        return count;
      });
      
      if (counts.length === 0) continue;
      
      const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length;
      const maxCount = Math.max(...counts);
      const minCount = Math.min(...counts);
      const consistency = maxCount > 0 ? (1 - (maxCount - minCount) / maxCount) : 0;
      const score = avgCount * consistency;
      
      console.log(`Delimiter "${delimiter}": avg=${avgCount.toFixed(1)}, consistency=${consistency.toFixed(2)}, score=${score.toFixed(2)}`);
      
      if (score > maxScore && avgCount > 1) {
        maxScore = score;
        bestDelimiter = delimiter;
      }
    }
    
    return bestDelimiter;
  }

  /**
   * Определение наличия заголовка
   */
  private static hasHeaderRow(text: string, delimiter: string): boolean {
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) return false;
    
    // Ищем строку с заголовками столбцов
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i];
      if (line.includes('MU NR.') || line.includes('DATUMS') || line.includes('VALŪTA')) {
        return true;
      }
    }
    
    return false;
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
          cellPadding: 1,
          overflow: 'linebreak',
          halign: 'left',
          valign: 'top',
          lineColor: tableStyles.lineColor,
          lineWidth: tableStyles.lineWidth,
        },
        headStyles: {
          ...tableStyles.headerStyles,
          minCellHeight: 6,
          fontSize: opts.fontSize + 1,
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
   * Автоматический расчет ширины колонок для большого количества столбцов
   */
  private static calculateColumnWidths(headers: string[], data: Record<string, any>[], opts: CsvToPdfOptions) {
    const columnStyles: { [key: number]: any } = {};
    const pageWidth = this.getPageWidth(opts.pageSize, opts.orientation) - opts.marginLeft - opts.marginRight;
    
    // Для большого количества колонок используем более компактные размеры
    const columnCount = headers.length;
    const baseWidth = pageWidth / columnCount;
    
    headers.forEach((header, index) => {
      // Анализируем содержимое колонки
      const headerLength = header.length;
      const sampleSize = Math.min(20, data.length);
      const contentLengths = data.slice(0, sampleSize).map(row => {
        const value = row[header];
        return value ? String(value).length : 0;
      });
      
      const avgContentLength = contentLengths.reduce((a, b) => a + b, 0) / Math.max(contentLengths.length, 1);
      const maxContentLength = Math.max(...contentLengths, headerLength);
      
      // Определяем множитель ширины на основе содержимого
      let widthMultiplier = 1;
      if (maxContentLength > 40) {
        widthMultiplier = 2; // Широкие колонки
      } else if (maxContentLength > 20) {
        widthMultiplier = 1.5;
      } else if (maxContentLength < 8) {
        widthMultiplier = 0.7; // Узкие колонки
      }
      
      const cellWidth = Math.max(8, baseWidth * widthMultiplier);
      
      columnStyles[index] = {
        cellWidth: cellWidth,
        overflow: 'linebreak',
        halign: this.detectColumnAlignment(header, data.slice(0, 10), header),
        fontSize: maxContentLength > 30 ? opts.fontSize - 1 : opts.fontSize
      };
    });
    
    return columnStyles;
  }

  /**
   * Определение выравнивания колонки по содержимому
   */
  private static detectColumnAlignment(header: string, data: Record<string, any>[], columnName: string): 'left' | 'center' | 'right' {
    const values = data.map(row => row[columnName]).filter(val => val && String(val).trim());
    
    if (values.length === 0) return 'left';
    
    // Если в заголовке есть "SUMMA", "EUR", "DATUMS" - специальная логика
    const headerLower = header.toLowerCase();
    if (headerLower.includes('summa') || headerLower.includes('eur')) {
      return 'right';
    }
    if (headerLower.includes('datums') || headerLower.includes('date')) {
      return 'center';
    }
    
    // Если все значения - числа, выравниваем по правому краю
    const numericValues = values.filter(val => !isNaN(Number(String(val).replace(/[,\s]/g, ''))));
    if (numericValues.length > values.length * 0.8) {
      return 'right';
    }
    
    // Если короткие значения (коды), выравниваем по центру
    const avgLength = values.reduce((sum, val) => sum + String(val).length, 0) / values.length;
    if (avgLength < 10) {
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
    
    if (!hasValidExtensions) {
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