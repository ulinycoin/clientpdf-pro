import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { CsvParseResult, CsvToPdfOptions, ColumnAnalysis } from './CsvToPdfConverter';

export interface LargeDataOptions extends CsvToPdfOptions {
  maxRowsPerPdf?: number;
  createMultiplePdfs?: boolean;
  chunkSize?: number;
  compressionLevel?: 'low' | 'medium' | 'high';
  memoryOptimization?: boolean;
}

export class CsvToPdfGeneratorOptimized {
  private static readonly CHUNK_SIZE = 5000; // Обрабатываем по 5000 строк
  private static readonly MAX_ROWS_PER_PDF = 10000; // Увеличено с 1000 до 10000
  private static readonly MEMORY_THRESHOLD = 100 * 1024 * 1024; // 100MB

  /**
   * Оптимизированная конвертация больших CSV в PDF
   */
  static async convertLargeToPDF(
    parseResult: CsvParseResult, 
    options: Partial<LargeDataOptions> = {},
    onProgress?: (progress: number, status: string) => void
  ): Promise<Uint8Array[]> {
    const opts = this.getOptimizedOptions(parseResult, options);
    
    onProgress?.(0, 'Analyzing data structure...');
    
    // Анализируем нужно ли разделение на несколько PDF
    const shouldSplit = this.shouldSplitIntoParts(parseResult, opts);
    
    if (shouldSplit.split) {
      onProgress?.(10, `Creating ${shouldSplit.parts} PDF files...`);
      return this.createMultiplePdfs(parseResult, opts, onProgress);
    } else {
      onProgress?.(10, 'Creating single optimized PDF...');
      const pdf = await this.createOptimizedSinglePdf(parseResult, opts, onProgress);
      return [pdf];
    }
  }

  /**
   * Определяет нужно ли разделить данные на несколько PDF
   */
  private static shouldSplitIntoParts(parseResult: CsvParseResult, opts: LargeDataOptions): {
    split: boolean;
    parts: number;
    reason: string;
  } {
    const { rowCount, columnCount } = parseResult;
    const maxRows = opts.maxRowsPerPdf || this.MAX_ROWS_PER_PDF;
    
    // Причины для разделения
    if (rowCount > maxRows) {
      return {
        split: true,
        parts: Math.ceil(rowCount / maxRows),
        reason: `Too many rows: ${rowCount} > ${maxRows}`
      };
    }
    
    // Проверяем использование памяти
    const estimatedMemory = this.estimateMemoryUsage(parseResult);
    if (estimatedMemory > this.MEMORY_THRESHOLD) {
      return {
        split: true,
        parts: Math.ceil(estimatedMemory / this.MEMORY_THRESHOLD),
        reason: `Memory usage too high: ${(estimatedMemory / 1024 / 1024).toFixed(1)}MB`
      };
    }
    
    // Очень широкие таблицы (много столбцов) тоже могут быть проблемными
    if (columnCount > 30 && rowCount > 5000) {
      return {
        split: true,
        parts: Math.ceil(rowCount / 5000),
        reason: `Wide table with many rows: ${columnCount} columns × ${rowCount} rows`
      };
    }
    
    return {
      split: false,
      parts: 1,
      reason: 'Data size is manageable'
    };
  }

  /**
   * Оценка использования памяти
   */
  private static estimateMemoryUsage(parseResult: CsvParseResult): number {
    const { rowCount, columnCount } = parseResult;
    
    // Примерная оценка: каждая ячейка ~50 байт в памяти
    const cellMemory = 50;
    const baseMemory = 10 * 1024 * 1024; // 10MB базовое использование
    
    return baseMemory + (rowCount * columnCount * cellMemory);
  }

  /**
   * Создание нескольких PDF файлов для больших данных
   */
  private static async createMultiplePdfs(
    parseResult: CsvParseResult,
    opts: LargeDataOptions,
    onProgress?: (progress: number, status: string) => void
  ): Promise<Uint8Array[]> {
    const maxRows = opts.maxRowsPerPdf || this.MAX_ROWS_PER_PDF;
    const totalRows = parseResult.rowCount;
    const parts = Math.ceil(totalRows / maxRows);
    const pdfs: Uint8Array[] = [];
    
    for (let i = 0; i < parts; i++) {
      const startRow = i * maxRows;
      const endRow = Math.min(startRow + maxRows, totalRows);
      
      onProgress?.(
        10 + (i / parts) * 80, 
        `Creating PDF ${i + 1}/${parts} (rows ${startRow + 1}-${endRow})`
      );
      
      // Создаем подмножество данных
      const partData: CsvParseResult = {
        ...parseResult,
        data: parseResult.data.slice(startRow, endRow),
        rowCount: endRow - startRow,
        preview: parseResult.data.slice(startRow, Math.min(startRow + 5, endRow))
      };
      
      // Добавляем информацию о части в заголовок
      const partOptions: CsvToPdfOptions = {
        ...opts,
        title: `${opts.title || 'Data Export'} - Part ${i + 1}/${parts}`
      };
      
      const pdf = await this.createOptimizedSinglePdf(partData, partOptions);
      pdfs.push(pdf);
      
      // Небольшая пауза для предотвращения блокировки UI
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    onProgress?.(100, `Created ${parts} PDF files successfully!`);
    return pdfs;
  }

  /**
   * Создание оптимизированного PDF для больших данных
   */
  private static async createOptimizedSinglePdf(
    parseResult: CsvParseResult,
    opts: LargeDataOptions,
    onProgress?: (progress: number, status: string) => void
  ): Promise<Uint8Array> {
    onProgress?.(20, 'Analyzing columns...');
    
    // Анализ столбцов с оптимизацией
    const columnAnalysis = this.analyzeColumnsOptimized(parseResult.headers, parseResult.data, parseResult.columnTypes);
    
    onProgress?.(30, 'Creating PDF document...');
    
    // Создание PDF с оптимизированными настройками
    const pdf = new jsPDF({
      orientation: opts.orientation,
      unit: 'mm',
      format: opts.pageSize?.toLowerCase() as any,
      compress: true, // Включаем сжатие
    });

    // Настройка метаданных
    pdf.setProperties({
      title: opts.title || 'Large Data Export',
      subject: `Data table with ${parseResult.rowCount} rows and ${parseResult.columnCount} columns`,
      author: 'ClientPDF Pro',
      creator: 'ClientPDF Pro - Optimized CSV to PDF Converter',
      keywords: 'CSV, PDF, large data, table, export',
    });

    onProgress?.(40, 'Preparing table data...');

    // Подготовка данных с оптимизацией
    const { tableHeaders, tableData } = this.prepareTableDataOptimized(parseResult, opts);
    
    onProgress?.(50, 'Calculating optimal layout...');

    // Оптимизированный расчет столбцов
    const columnStyles = this.calculateOptimalColumnWidthsLarge(
      columnAnalysis, 
      opts, 
      opts.includeRowNumbers || false
    );
    
    onProgress?.(60, 'Generating PDF table...');

    // Настройки стилей таблицы
    const tableStyles = this.getOptimizedTableStyles(opts);
    
    // Добавление заголовка документа
    let currentY = opts.marginTop || 20;
    if (opts.title) {
      pdf.setFontSize(14); // Немного меньше для экономии места
      pdf.setFont('helvetica', 'bold');
      pdf.text(opts.title, opts.marginLeft || 10, currentY);
      currentY += 8;
    }

    // Информация о данных (сжатая)
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      `${parseResult.rowCount} rows × ${parseResult.columnCount} columns`,
      opts.marginLeft || 10,
      currentY
    );
    currentY += 5;

    onProgress?.(70, 'Rendering table...');

    // Генерация таблицы с оптимизированными настройками
    pdf.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: currentY,
      margin: {
        top: opts.marginTop || 15, // Уменьшены отступы
        bottom: opts.marginBottom || 15,
        left: opts.marginLeft || 8,
        right: opts.marginRight || 8,
      },
      styles: {
        fontSize: Math.max(opts.fontSize || 6, 5), // Минимум 5pt
        cellPadding: 1,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'top',
        lineColor: tableStyles.lineColor,
        lineWidth: 0.1, // Тонкие линии для экономии места
      },
      headStyles: {
        ...tableStyles.headerStyles,
        minCellHeight: 4, // Компактные заголовки
        fontSize: Math.max(opts.fontSize || 6, 5),
      },
      bodyStyles: tableStyles.bodyStyles,
      alternateRowStyles: tableStyles.alternateRowStyles,
      columnStyles: columnStyles,
      showHead: true,
      showFoot: false,
      tableLineColor: tableStyles.lineColor,
      tableLineWidth: 0.1,
      didDrawPage: (data: any) => {
        // Компактная информация на странице
        const pageNumber = (pdf as any).internal.getCurrentPageInfo().pageNumber;
        const totalPages = (pdf as any).internal.getNumberOfPages();
        
        pdf.setFontSize(6);
        pdf.setFont('helvetica', 'normal');
        
        pdf.text(
          `Page ${pageNumber}`,
          opts.marginLeft || 8,
          (pdf as any).internal.pageSize.height - 8
        );
        
        pdf.text(
          `${parseResult.rowCount} rows`,
          (pdf as any).internal.pageSize.width - 25,
          (pdf as any).internal.pageSize.height - 8
        );
      },
    });

    onProgress?.(90, 'Finalizing PDF...');

    // Возврат PDF как Uint8Array
    const pdfOutput = pdf.output('arraybuffer');
    
    onProgress?.(100, 'PDF created successfully!');
    
    return new Uint8Array(pdfOutput);
  }

  /**
   * Оптимизированный анализ столбцов для больших данных
   */
  private static analyzeColumnsOptimized(
    headers: string[], 
    data: Record<string, any>[], 
    columnTypes: Record<string, string>
  ): ColumnAnalysis[] {
    // Используем меньшую выборку для анализа больших данных
    const sampleSize = Math.min(50, data.length);
    
    return headers.map(header => {
      const values = data.slice(0, sampleSize)
        .map(row => String(row[header] || ''))
        .filter(val => val.trim() !== '');
      
      const lengths = values.map(val => val.length);
      const maxLength = Math.max(...lengths, header.length);
      const avgLength = lengths.length > 0 ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;
      
      let alignment: 'left' | 'center' | 'right' = 'left';
      const type = columnTypes[header];
      
      if (type === 'number') {
        alignment = 'right';
      } else if (type === 'date' || type === 'boolean') {
        alignment = 'center';
      } else if (avgLength < 8) {
        alignment = 'center';
      }
      
      return {
        name: header,
        type: type as any,
        maxLength: Math.min(maxLength, 50), // Ограничиваем максимальную длину
        avgLength: Math.min(avgLength, 30),
        hasEmptyValues: values.length < sampleSize,
        alignment,
        samples: values.slice(0, 2) // Меньше примеров
      };
    });
  }

  /**
   * Подготовка данных таблицы с оптимизацией
   */
  private static prepareTableDataOptimized(
    parseResult: CsvParseResult, 
    opts: LargeDataOptions
  ): { tableHeaders: string[]; tableData: string[][] } {
    const tableHeaders = opts.includeRowNumbers 
      ? ['#', ...parseResult.headers]
      : parseResult.headers;

    const tableData = parseResult.data.map((row, index) => {
      const rowData = parseResult.headers.map(header => {
        const value = row[header];
        let formatted = this.formatCellValueOptimized(value, parseResult.columnTypes[header]);
        
        // Обрезаем очень длинные значения для экономии места
        if (formatted.length > 100) {
          formatted = formatted.substring(0, 97) + '...';
        }
        
        return formatted;
      });
      
      return opts.includeRowNumbers 
        ? [String(index + 1), ...rowData]
        : rowData;
    });

    return { tableHeaders, tableData };
  }

  /**
   * Оптимизированное форматирование значений ячеек
   */
  private static formatCellValueOptimized(value: any, type: string): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    
    const strValue = String(value);
    
    switch (type) {
      case 'number':
        const numValue = parseFloat(strValue.replace(/[,\s]/g, ''));
        if (!isNaN(numValue)) {
          // Компактное форматирование чисел
          return numValue.toLocaleString('en-US', { 
            maximumFractionDigits: 2,
            notation: numValue > 1000000 ? 'compact' : 'standard'
          });
        }
        return strValue;
        
      case 'date':
        const dateValue = new Date(strValue);
        if (!isNaN(dateValue.getTime())) {
          // Короткий формат даты
          return dateValue.toLocaleDateString('en-GB');
        }
        return strValue;
        
      case 'boolean':
        const lowerValue = strValue.toLowerCase();
        if (['true', 'yes', '1', 'on'].includes(lowerValue)) return '✓';
        if (['false', 'no', '0', 'off'].includes(lowerValue)) return '✗';
        return strValue;
        
      default:
        return strValue;
    }
  }

  /**
   * Расчет оптимальных ширин столбцов для больших таблиц
   */
  private static calculateOptimalColumnWidthsLarge(
    columnAnalysis: ColumnAnalysis[], 
    opts: LargeDataOptions,
    includeRowNumbers: boolean
  ): { [key: number]: any } {
    const columnStyles: { [key: number]: any } = {};
    const pageWidth = this.getPageWidth(opts.pageSize || 'a4', opts.orientation || 'landscape') 
      - (opts.marginLeft || 8) - (opts.marginRight || 8);
    
    const totalColumns = columnAnalysis.length + (includeRowNumbers ? 1 : 0);
    const baseWidth = pageWidth / totalColumns;
    
    // Более агрессивный компактный режим для больших таблиц
    const isCompactMode = totalColumns > 6;
    const minColumnWidth = isCompactMode ? 12 : 15;
    const maxColumnWidth = isCompactMode ? 30 : 40;
    
    columnAnalysis.forEach((column, index) => {
      const columnIndex = includeRowNumbers ? index + 1 : index;
      
      let columnWidth = Math.max(minColumnWidth, baseWidth * 0.8);
      columnWidth = Math.min(columnWidth, maxColumnWidth);
      
      // Специальные настройки для разных типов
      switch (column.type) {
        case 'number':
          columnWidth = Math.max(columnWidth * 0.7, 12);
          break;
        case 'date':
          columnWidth = Math.max(20, Math.min(columnWidth, 25));
          break;
        case 'boolean':
          columnWidth = Math.max(8, Math.min(columnWidth, 12));
          break;
        case 'text':
          if (column.avgLength > 40) {
            columnWidth = Math.min(columnWidth * 1.1, maxColumnWidth);
          } else if (column.avgLength < 8) {
            columnWidth = Math.max(columnWidth * 0.6, minColumnWidth);
          }
          break;
      }
      
      columnStyles[columnIndex] = {
        cellWidth: columnWidth,
        overflow: 'linebreak',
        halign: column.alignment,
        fontSize: Math.max((opts.fontSize || 6) - (isCompactMode ? 1 : 0), 5),
        valign: 'top',
      };
    });
    
    if (includeRowNumbers) {
      columnStyles[0] = {
        cellWidth: Math.min(10, baseWidth * 0.3),
        overflow: 'visible',
        halign: 'center',
        fontSize: Math.max(opts.fontSize || 6, 5),
        valign: 'middle',
      };
    }
    
    return columnStyles;
  }

  /**
   * Получение оптимизированных настроек
   */
  private static getOptimizedOptions(parseResult: CsvParseResult, options: Partial<LargeDataOptions>): LargeDataOptions {
    const baseOptions: LargeDataOptions = {
      orientation: 'landscape',
      pageSize: 'a4',
      fontSize: 6, // Меньший шрифт по умолчанию
      tableStyle: 'minimal', // Минималистичный стиль для больших данных
      headerStyle: 'bold',
      fitToPage: true,
      includeRowNumbers: false,
      marginTop: 15, // Уменьшенные отступы
      marginBottom: 15,
      marginLeft: 8,
      marginRight: 8,
      maxRowsPerPdf: this.MAX_ROWS_PER_PDF,
      createMultiplePdfs: true,
      chunkSize: this.CHUNK_SIZE,
      compressionLevel: 'medium',
      memoryOptimization: true,
      autoDetectDataTypes: true,
    };

    // Автоматические оптимизации на основе размера данных
    if (parseResult.columnCount > 15) {
      baseOptions.fontSize = 5;
      baseOptions.marginLeft = 5;
      baseOptions.marginRight = 5;
    }

    if (parseResult.rowCount > 5000) {
      baseOptions.tableStyle = 'plain'; // Еще более минималистично
      baseOptions.fontSize = Math.max(baseOptions.fontSize! - 1, 4);
    }

    return { ...baseOptions, ...options };
  }

  private static getPageWidth(pageSize: string, orientation: string): number {
    const sizes = {
      'a4': orientation === 'landscape' ? 297 : 210,
      'a3': orientation === 'landscape' ? 420 : 297,
      'letter': orientation === 'landscape' ? 279 : 216,
      'legal': orientation === 'landscape' ? 356 : 216,
    };
    return sizes[pageSize as keyof typeof sizes] || 297;
  }

  private static getOptimizedTableStyles(options: LargeDataOptions) {
    const baseStyles = {
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    };

    // Упрощенные стили для больших данных
    return {
      ...baseStyles,
      headerStyles: {
        fillColor: [245, 245, 245],
        textColor: [0, 0, 0],
        fontStyle: 'bold' as const,
        halign: 'center' as const,
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      lineColor: [230, 230, 230],
      lineWidth: 0.05,
    };
  }
}