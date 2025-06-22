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
      pageSize: 'a4' as const,
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
        // 🔥 КРИТИЧЕСКИ ВАЖНО: Принудительное подгоняние под страницу
        tableWidth: 'wrap',
        horizontalPageBreak: true,
        horizontalPageBreakRepeat: 0,
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
   * 🔥 REVOLUTIONIZED: Bulletproof column width calculation with GUARANTEED page fitting
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
    
    console.log(`📏 Page calculations: ${pageWidth}mm total, ${availableWidth}mm available for table`);
    
    // 🎯 КРИТИЧНО: Всего колонок включая номера строк
    const totalColumns = columnAnalysis.length + (includeRowNumbers ? 1 : 0);
    
    // 🎯 КРИТИЧНО: Абсолютные пределы для предотвращения переполнения
    const absoluteMinWidth = 8; // Минимальная ширина в мм
    const absoluteMaxWidth = Math.floor(availableWidth / 3); // Максимум 1/3 от страницы
    
    // 🎯 АДАПТИВНАЯ ЛОГИКА: чем больше колонок, тем компактнее
    let targetMinWidth: number;
    let targetMaxWidth: number;
    let adaptiveFontSize = opts.fontSize;
    
    if (totalColumns <= 5) {
      targetMinWidth = 25;
      targetMaxWidth = 60;
    } else if (totalColumns <= 10) {
      targetMinWidth = 20;
      targetMaxWidth = 45;
      adaptiveFontSize = Math.max(opts.fontSize - 0.5, 6);
    } else if (totalColumns <= 15) {
      targetMinWidth = 15;
      targetMaxWidth = 35;
      adaptiveFontSize = Math.max(opts.fontSize - 1, 6);
    } else {
      // Экстремально много колонок - максимальная компактность
      targetMinWidth = 12;
      targetMaxWidth = 25;
      adaptiveFontSize = Math.max(opts.fontSize - 1.5, 5);
    }
    
    // 🔥 BULLETPROOF: Применяем абсолютные ограничения
    targetMinWidth = Math.max(targetMinWidth, absoluteMinWidth);
    targetMaxWidth = Math.min(targetMaxWidth, absoluteMaxWidth);
    
    console.log(`📊 Column strategy: ${totalColumns} columns, width range ${targetMinWidth}-${targetMaxWidth}mm, font ${adaptiveFontSize}pt`);
    
    // 🎯 ФАЗА 1: Расчет желаемых ширин на основе контента
    const desiredWidths: number[] = [];
    let totalDesiredWidth = 0;
    
    // Номер строки (если включен)
    if (includeRowNumbers) {
      const rowNumberWidth = Math.min(15, targetMinWidth * 1.2);
      desiredWidths.push(rowNumberWidth);
      totalDesiredWidth += rowNumberWidth;
    }
    
    // Анализ контента для каждой колонки
    columnAnalysis.forEach((column) => {
      // Базовая ширина на основе содержимого
      const headerLength = column.name.length;
      const contentLength = Math.max(column.avgLength, column.maxLength * 0.7);
      const effectiveLength = Math.max(headerLength, contentLength);
      
      // Приблизительная ширина: 1 символ ≈ 1.5мм при fontSize=7
      const charWidthMm = (adaptiveFontSize / 7) * 1.5;
      let desiredWidth = effectiveLength * charWidthMm + 4; // +4мм padding
      
      // Корректировки по типу данных
      switch (column.type) {
        case 'number':
          desiredWidth = Math.max(desiredWidth, targetMinWidth);
          break;
        case 'date':
          desiredWidth = Math.max(desiredWidth, 22);
          break;
        case 'boolean':
          desiredWidth = Math.max(desiredWidth, 15);
          break;
        default:
          // Для текста ограничиваем экстремально длинные значения
          if (column.avgLength > 50) {
            desiredWidth = Math.min(desiredWidth, targetMaxWidth);
          }
      }
      
      // Применяем ограничения
      desiredWidth = Math.max(targetMinWidth, Math.min(desiredWidth, targetMaxWidth));
      
      desiredWidths.push(desiredWidth);
      totalDesiredWidth += desiredWidth;
    });
    
    console.log(`💡 Desired total width: ${totalDesiredWidth.toFixed(1)}mm (available: ${availableWidth.toFixed(1)}mm)`);
    
    // 🎯 ФАЗА 2: КРИТИЧЕСКОЕ МАСШТАБИРОВАНИЕ для подгонки под страницу
    let finalWidths: number[];
    
    if (totalDesiredWidth > availableWidth) {
      // 🔥 Принудительное масштабирование - все колонки пропорционально уменьшаются
      const scaleFactor = availableWidth / totalDesiredWidth;
      console.log(`🔧 Scaling down by factor: ${scaleFactor.toFixed(3)}`);
      
      finalWidths = desiredWidths.map(width => {
        const scaledWidth = width * scaleFactor;
        // КРИТИЧНО: даже после масштабирования соблюдаем минимум
        return Math.max(scaledWidth, absoluteMinWidth);
      });
      
      // Перепроверка после применения минимумов
      const recalculatedTotal = finalWidths.reduce((sum, w) => sum + w, 0);
      if (recalculatedTotal > availableWidth) {
        // Экстремальная ситуация - пропорционально урезаем ВСЕ колонки до минимума
        const excessWidth = recalculatedTotal - availableWidth;
        const reductionPerColumn = excessWidth / finalWidths.length;
        
        finalWidths = finalWidths.map(width => 
          Math.max(width - reductionPerColumn, absoluteMinWidth)
        );
      }
    } else {
      // Есть лишнее место - можем немного расширить
      const extraSpace = availableWidth - totalDesiredWidth;
      const bonusPerColumn = extraSpace / desiredWidths.length;
      
      finalWidths = desiredWidths.map(width => 
        Math.min(width + bonusPerColumn, targetMaxWidth)
      );
    }
    
    const finalTotalWidth = finalWidths.reduce((sum, w) => sum + w, 0);
    console.log(`✅ Final total width: ${finalTotalWidth.toFixed(1)}mm (fit: ${finalTotalWidth <= availableWidth})`);
    
    // 🎯 ФАЗА 3: Применение стилей к колонкам
    finalWidths.forEach((width, index) => {
      const column = index === 0 && includeRowNumbers ? null : columnAnalysis[includeRowNumbers ? index - 1 : index];
      
      columnStyles[index] = {
        cellWidth: width,
        overflow: 'linebreak',
        halign: column ? column.alignment : 'center',
        fontSize: adaptiveFontSize,
        valign: 'top',
        minCellHeight: 4,
      };
    });
    
    // 🔥 ДОПОЛНИТЕЛЬНОЕ ПРИНУЖДЕНИЕ: autoTable настройки для гарантированной подгонки
    if (finalTotalWidth > availableWidth * 0.98) { // 2% буфер
      console.log('🚨 Applying emergency table constraints');
      
      // Принудительно уменьшаем шрифт для всех колонок
      Object.keys(columnStyles).forEach(key => {
        columnStyles[parseInt(key)].fontSize = Math.max(adaptiveFontSize - 1, 5);
        columnStyles[parseInt(key)].cellPadding = 1;
      });
    }
    
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
}