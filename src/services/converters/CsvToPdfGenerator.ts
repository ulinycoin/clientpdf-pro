import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { CsvParseResult, CsvToPdfOptions, ColumnAnalysis } from './CsvToPdfConverter';

export class CsvToPdfGenerator {
  /**
   * Конвертация CSV в PDF с улучшенным форматированием
   */
  static async convertToPDF(
    parseResult: CsvParseResult, 
    options: Partial<CsvToPdfOptions> = {}
  ): Promise<Uint8Array> {
    const opts = { 
      orientation: 'landscape' as const,
      pageSize: 'legal' as const, // 🔥 CHANGED: Legal as default (356mm landscape vs A4 297mm)
      fontSize: 7,
      tableStyle: 'grid' as const,
      headerStyle: 'bold' as const,
      fitToPage: true,
      includeRowNumbers: false,
      marginTop: 20,
      marginBottom: 20,
      marginLeft: 10,
      marginRight: 10,
      maxRowsPerPage: 1000,
      autoDetectDataTypes: true,
      ...options
    };
    
    // 🔥 AUTO-UPGRADE: Автоматически переключаемся на A3 для экстремально широких таблиц
    const totalColumns = parseResult.columnCount + (opts.includeRowNumbers ? 1 : 0);
    if (totalColumns >= 25 && opts.pageSize === 'legal') {
      opts.pageSize = 'a3';
      console.log(`🚀 Auto-upgraded to A3 format for ${totalColumns} columns (from Legal)`);
    } else if (totalColumns >= 20 && opts.pageSize === 'a4') {
      opts.pageSize = 'legal';
      console.log(`🚀 Auto-upgraded to Legal format for ${totalColumns} columns`);
    }
    
    try {
      // Анализ столбцов для оптимизации
      const columnAnalysis = this.analyzeColumns(parseResult.headers, parseResult.data, parseResult.columnTypes);
      
      // Создание PDF документа
      const pdf = new jsPDF({
        orientation: opts.orientation,
        unit: 'mm',
        format: opts.pageSize.toLowerCase() as any,
      });

      // Настройка метаданных
      pdf.setProperties({
        title: opts.title || 'CSV Data Export',
        subject: `Data table with ${parseResult.rowCount} rows and ${parseResult.columnCount} columns`,
        author: 'ClientPDF Pro',
        creator: 'ClientPDF Pro - CSV to PDF Converter',
        keywords: 'CSV, PDF, data, table, export',
      });

      // Добавление заголовка документа
      let currentY = opts.marginTop;
      if (opts.title) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(opts.title, opts.marginLeft, currentY);
        currentY += 10;
      }

      // Информация о данных
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `Data: ${parseResult.rowCount} rows × ${parseResult.columnCount} columns | Delimiter: "${parseResult.delimiter}"`,
        opts.marginLeft,
        currentY
      );
      currentY += 5;

      // Подготовка данных для таблицы
      const tableHeaders = opts.includeRowNumbers 
        ? ['#', ...parseResult.headers]
        : parseResult.headers;

      // Ограничиваем количество строк для предотвращения проблем с памятью
      const maxRows = opts.maxRowsPerPage || 1000;
      const dataToProcess = parseResult.data.slice(0, maxRows);

      const tableData = dataToProcess.map((row, index) => {
        const rowData = parseResult.headers.map(header => {
          const value = row[header];
          return this.formatCellValue(value, parseResult.columnTypes[header]);
        });
        return opts.includeRowNumbers 
          ? [String(index + 1), ...rowData]
          : rowData;
      });

      // 🔥 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Рассчитываем ширины колонок с гарантией подгонки под страницу
      const columnStyles = this.calculateOptimalColumnWidths(
        columnAnalysis, 
        opts, 
        opts.includeRowNumbers
      );
      
      // Настройки стилей таблицы
      const tableStyles = this.getTableStyles(opts);
      
      // Генерация таблицы
      pdf.autoTable({
        head: [tableHeaders],
        body: tableData,
        startY: currentY + 5,
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
        },
        headStyles: {
          ...tableStyles.headerStyles,
          minCellHeight: 6,
          fontSize: Math.max(opts.fontSize, 7),
        },
        bodyStyles: tableStyles.bodyStyles,
        alternateRowStyles: tableStyles.alternateRowStyles,
        columnStyles: columnStyles,
        showHead: true,
        showFoot: false,
        tableLineColor: tableStyles.lineColor,
        tableLineWidth: tableStyles.lineWidth,
        // 🔥 КРИТИЧНО: НЕ используем горизонтальное разбиение - все колонки на одной странице
        tableWidth: 'wrap',
        didDrawPage: (data: any) => {
          // Номера страниц
          const pageNumber = (pdf as any).internal.getCurrentPageInfo().pageNumber;
          const totalPages = (pdf as any).internal.getNumberOfPages();
          
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          
          // Номер страницы
          pdf.text(
            `Page ${pageNumber} of ${totalPages}`,
            opts.marginLeft,
            (pdf as any).internal.pageSize.height - 10
          );
          
          // Информация о данных
          const pageWidth = (pdf as any).internal.pageSize.width;
          pdf.text(
            `${parseResult.rowCount} rows | ${parseResult.columnCount} columns`,
            pageWidth - 50,
            (pdf as any).internal.pageSize.height - 10
          );
        },
      });

      // Добавление предупреждения об ограничении строк
      if (parseResult.rowCount > maxRows) {
        const finalY = (pdf as any).lastAutoTable.finalY || currentY + 50;
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.text(
          `Note: Only first ${maxRows} of ${parseResult.rowCount} rows are displayed`,
          opts.marginLeft,
          finalY + 10
        );
      }

      // Возврат PDF как Uint8Array
      const pdfOutput = pdf.output('arraybuffer');
      return new Uint8Array(pdfOutput);

    } catch (error) {
      throw new Error(`PDF generation failed: ${error}`);
    }
  }

  /**
   * Анализ столбцов для оптимального форматирования
   */
  private static analyzeColumns(headers: string[], data: Record<string, any>[], columnTypes: Record<string, string>): ColumnAnalysis[] {
    return headers.map(header => {
      const sampleSize = Math.min(50, data.length);
      const values = data.slice(0, sampleSize)
        .map(row => String(row[header] || ''))
        .filter(val => val.trim() !== '');
      
      const lengths = values.map(val => val.length);
      const maxLength = Math.max(...lengths, header.length);
      const avgLength = lengths.length > 0 ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;
      
      // Определение выравнивания
      let alignment: 'left' | 'center' | 'right' = 'left';
      const type = columnTypes[header];
      
      if (type === 'number') {
        alignment = 'right';
      } else if (type === 'date' || type === 'boolean') {
        alignment = 'center';
      } else if (avgLength < 10) {
        alignment = 'center';
      }
      
      return {
        name: header,
        type: type as any,
        maxLength,
        avgLength,
        hasEmptyValues: values.length < sampleSize,
        alignment,
        samples: values.slice(0, 3)
      };
    });
  }

  /**
   * Форматирование значения ячейки по типу
   */
  private static formatCellValue(value: any, type: string): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    
    const strValue = String(value);
    
    switch (type) {
      case 'number':
        const numValue = parseFloat(strValue.replace(/[,\s]/g, ''));
        if (!isNaN(numValue)) {
          return numValue.toLocaleString('en-US', { maximumFractionDigits: 2 });
        }
        return strValue;
        
      case 'date':
        const dateValue = new Date(strValue);
        if (!isNaN(dateValue.getTime())) {
          return dateValue.toLocaleDateString();
        }
        return strValue;
        
      case 'boolean':
        const lowerValue = strValue.toLowerCase();
        if (['true', 'yes', '1', 'on'].includes(lowerValue)) return 'Yes';
        if (['false', 'no', '0', 'off'].includes(lowerValue)) return 'No';
        return strValue;
        
      default:
        return strValue;
    }
  }

  /**
   * 🔥 REVOLUTIONARY: Extreme column fitting algorithm for 25+ columns
   */
  private static calculateOptimalColumnWidths(
    columnAnalysis: ColumnAnalysis[], 
    opts: CsvToPdfOptions,
    includeRowNumbers: boolean
  ): { [key: number]: any } {
    const columnStyles: { [key: number]: any } = {};
    
    // 🎯 КРИТИЧНО: Точный расчет доступной ширины
    const pageWidth = this.getPageWidth(opts.pageSize, opts.orientation);
    const availableWidth = pageWidth - opts.marginLeft - opts.marginRight;
    
    console.log(`📏 Page: ${opts.pageSize.toUpperCase()}, Available width: ${availableWidth}mm`);
    
    // 🎯 КРИТИЧНО: Всего колонок включая номера строк
    const totalColumns = columnAnalysis.length + (includeRowNumbers ? 1 : 0);
    
    console.log(`📊 Total columns to fit: ${totalColumns}`);
    
    // 🔥 EXTREME MODES: Экстремальные режимы для очень широких таблиц
    let maxWidth: number;
    let minWidth: number;
    let fontSize = opts.fontSize;
    let cellPadding = 1.5;
    
    if (totalColumns >= 25) {
      // 🆘 SURVIVAL MODE: 25+ колонок
      maxWidth = 12;
      minWidth = 6;
      fontSize = Math.max(opts.fontSize - 3, 3);
      cellPadding = 0.5;
      console.log('🆘 SURVIVAL MODE: 25+ columns - extreme compression');
    } else if (totalColumns >= 20) {
      // 🔥 EXTREME MODE: 20+ колонок
      maxWidth = 15;
      minWidth = 7;
      fontSize = Math.max(opts.fontSize - 2.5, 3.5);
      cellPadding = 0.8;
      console.log('🔥 EXTREME MODE: 20+ columns');
    } else if (totalColumns >= 15) {
      // 🚨 ULTRA-COMPACT: 15+ колонок
      maxWidth = 18;
      minWidth = 8;
      fontSize = Math.max(opts.fontSize - 2, 4);
      cellPadding = 1;
      console.log('🚨 ULTRA-COMPACT MODE: 15+ columns');
    } else if (totalColumns >= 10) {
      // ⚡ HIGH-COMPACT: 10+ колонок
      maxWidth = 25;
      minWidth = 10;
      fontSize = Math.max(opts.fontSize - 1, 5);
      cellPadding = 1.2;
      console.log('⚡ HIGH-COMPACT MODE: 10+ columns');
    } else if (totalColumns >= 7) {
      // 📦 COMPACT: 7+ колонок
      maxWidth = 35;
      minWidth = 15;
      fontSize = Math.max(opts.fontSize - 0.5, 6);
      console.log('📦 COMPACT MODE: 7+ columns');
    } else {
      // 📝 NORMAL: мало колонок
      maxWidth = 50;
      minWidth = 20;
      console.log('📝 NORMAL MODE: few columns');
    }
    
    // 🎯 CRITICAL: Равномерное распределение с учетом минимумов
    const idealWidth = availableWidth / totalColumns;
    let targetWidth = Math.min(idealWidth, maxWidth);
    targetWidth = Math.max(targetWidth, minWidth);
    
    console.log(`🎯 Ideal: ${idealWidth.toFixed(1)}mm, Target: ${targetWidth.toFixed(1)}mm per column`);
    
    // 🔥 FINAL CHECK: Проверяем поместится ли
    const totalRequiredWidth = targetWidth * totalColumns;
    let finalWidth = targetWidth;
    
    if (totalRequiredWidth > availableWidth) {
      // 🆘 EMERGENCY: Принудительное уменьшение
      finalWidth = (availableWidth - 1) / totalColumns; // -1мм аварийный буфер
      console.log(`🆘 EMERGENCY: Forced reduction to ${finalWidth.toFixed(1)}mm per column`);
      
      // Если слишком мало - дополнительное уменьшение шрифта
      if (finalWidth < 6) {
        fontSize = Math.max(fontSize - 1, 2);
        cellPadding = 0.3;
        console.log(`🆘 CRITICAL: Font reduced to ${fontSize}pt, padding to ${cellPadding}mm`);
      }
    }
    
    // 🎯 ПРИМЕНЕНИЕ одинаковой ширины ко всем колонкам
    for (let i = 0; i < totalColumns; i++) {
      const isRowNumber = includeRowNumbers && i === 0;
      const columnIndex = isRowNumber ? i : (includeRowNumbers ? i - 1 : i);
      const column = isRowNumber ? null : columnAnalysis[columnIndex];
      
      columnStyles[i] = {
        cellWidth: finalWidth,
        overflow: 'linebreak',
        halign: column ? column.alignment : 'center',
        fontSize: fontSize,
        valign: 'top',
        minCellHeight: Math.max(2, fontSize * 0.5),
        cellPadding: cellPadding,
      };
    }
    
    const finalTotalWidth = finalWidth * totalColumns;
    console.log(`✅ Final: ${finalWidth.toFixed(1)}mm × ${totalColumns} = ${finalTotalWidth.toFixed(1)}mm (available: ${availableWidth}mm)`);
    console.log(`📝 Font: ${fontSize}pt, Padding: ${cellPadding}mm`);
    
    return columnStyles;
  }

  /**
   * Получение ширины страницы в мм
   */
  private static getPageWidth(pageSize: string, orientation: string): number {
    const sizes = {
      'a4': orientation === 'landscape' ? 297 : 210,
      'a3': orientation === 'landscape' ? 420 : 297,
      'letter': orientation === 'landscape' ? 279 : 216,
      'legal': orientation === 'landscape' ? 356 : 216, // 🔥 Legal landscape: 356mm
    };
    return sizes[pageSize as keyof typeof sizes] || 356; // 🔥 Default to Legal width
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
}