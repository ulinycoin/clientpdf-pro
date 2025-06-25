import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { CsvParseResult, CsvToPdfOptions, ColumnAnalysis } from './CsvToPdfConverter';
import { EnhancedUnicodeFontService } from '../EnhancedUnicodeFontService';

export class CsvToPdfGenerator {
  /**
   * Конвертация CSV в PDF с улучшенным форматированием и Unicode поддержкой
   */
  static async convertToPDF(
    parseResult: CsvParseResult, 
    options: Partial<CsvToPdfOptions> = {}
  ): Promise<Uint8Array> {
    const opts = { 
      orientation: 'landscape' as const,
      pageSize: 'legal' as const,
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
      fontFamily: 'auto',
      ...options
    };
    
    // Автоматическое увеличение размера страницы для широких таблиц
    const totalColumns = parseResult.columnCount + (opts.includeRowNumbers ? 1 : 0);
    if (totalColumns >= 25 && opts.pageSize === 'legal') {
      opts.pageSize = 'a3';
      console.log(`🚀 Auto-upgraded to A3 format for ${totalColumns} columns`);
    } else if (totalColumns >= 20 && opts.pageSize === 'a4') {
      opts.pageSize = 'legal';
      console.log(`🚀 Auto-upgraded to Legal format for ${totalColumns} columns`);
    }
    
    try {
      // Создание PDF документа
      const pdf = new jsPDF({
        orientation: opts.orientation,
        unit: 'mm',
        format: opts.pageSize.toLowerCase() as any,
      });

      // 🆕 УЛУЧШЕННАЯ НАСТРОЙКА ШРИФТОВ
      // Собираем образцы текста для анализа
      const sampleTexts = [
        // Заголовки
        ...parseResult.headers,
        // Образцы данных
        ...parseResult.data.slice(0, 10).flatMap(row => 
          parseResult.headers.map(header => String(row[header] || ''))
        ),
        // Заголовок документа
        opts.title || ''
      ].filter(text => text.trim() !== '');

      // 🔧 ИСПРАВЛЕНО: Ждем Promise от setupPDFFont
      console.log('🔤 Setting up fonts with sample texts...');
      const fontSetup = await EnhancedUnicodeFontService.setupPDFFont(pdf, sampleTexts);
      
      if (!fontSetup.success) {
        console.error('❌ Font setup failed:', fontSetup.warnings);
        // 🔧 ИСПРАВЛЕНО: Безопасная обработка warnings
        const warningMessage = fontSetup.warnings && Array.isArray(fontSetup.warnings) 
          ? fontSetup.warnings.join(', ') 
          : 'Unknown font setup error';
        throw new Error(`Font setup failed: ${warningMessage}`);
      }

      console.log('✅ Font setup successful:', {
        selectedFont: fontSetup.selectedFont,
        warnings: fontSetup.warnings,
        transliterations: fontSetup.appliedTransliterations
      });

      // Анализ столбцов для оптимизации
      const columnAnalysis = this.analyzeColumns(parseResult.headers, parseResult.data, parseResult.columnTypes);
      
      // Настройка метаданных с очисткой через новый сервис
      const title = opts.title ? 
        EnhancedUnicodeFontService.smartCleanText(opts.title) : 
        'CSV Data Export';
      
      pdf.setProperties({
        title: title,
        subject: `Data table with ${parseResult.rowCount} rows and ${parseResult.columnCount} columns`,
        author: 'ClientPDF Pro',
        creator: 'ClientPDF Pro - CSV to PDF Converter with Enhanced Unicode Support v5.0',
        keywords: 'CSV, PDF, data, table, export, unicode, multilingual, font-rendering',
      });

      // Добавление заголовка документа
      let currentY = opts.marginTop;
      if (opts.title) {
        pdf.setFontSize(16);
        pdf.setFont(fontSetup.selectedFont, 'bold');
        pdf.text(title, opts.marginLeft, currentY);
        currentY += 10;
      }

      // Информация о данных и кодировке
      pdf.setFontSize(8);
      pdf.setFont(fontSetup.selectedFont, 'normal');
      
      const infoText = `Data: ${parseResult.rowCount} rows × ${parseResult.columnCount} columns | Font: ${fontSetup.selectedFont}`;
      pdf.text(infoText, opts.marginLeft, currentY);
      currentY += 5;

      // Предупреждения о транслитерации
      if (fontSetup.appliedTransliterations > 0) {
        pdf.setFontSize(7);
        pdf.setFont(fontSetup.selectedFont, 'italic');
        const warningText = `Note: ${fontSetup.appliedTransliterations} special characters have been transliterated for compatibility`;
        pdf.text(warningText, opts.marginLeft, currentY);
        currentY += 5;
      }

      // 🆕 УЛУЧШЕННАЯ ОЧИСТКА ЗАГОЛОВКОВ
      const cleanHeaders = parseResult.headers.map(header => 
        EnhancedUnicodeFontService.smartCleanText(header)
      );
      
      const tableHeaders = opts.includeRowNumbers 
        ? ['#', ...cleanHeaders]
        : cleanHeaders;

      const maxRows = opts.maxRowsPerPage || 1000;
      const dataToProcess = parseResult.data.slice(0, maxRows);

      // 🆕 УЛУЧШЕННАЯ ОЧИСТКА ДАННЫХ
      const tableData = dataToProcess.map((row, index) => {
        const rowData = parseResult.headers.map(header => {
          const value = row[header];
          const formattedValue = this.formatCellValue(value, parseResult.columnTypes[header]);
          return EnhancedUnicodeFontService.smartCleanText(formattedValue);
        });
        return opts.includeRowNumbers 
          ? [String(index + 1), ...rowData]
          : rowData;
      });

      // Расчет оптимальных ширин колонок
      const columnStyles = this.calculateOptimalColumnWidths(
        columnAnalysis, 
        opts, 
        opts.includeRowNumbers
      );
      
      // Настройки стилей таблицы
      const tableStyles = this.getTableStyles(opts);
      
      // Генерация таблицы с улучшенными настройками шрифтов
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
          font: fontSetup.selectedFont, // 🆕 Явно указываем шрифт
        },
        headStyles: {
          ...tableStyles.headerStyles,
          minCellHeight: 6,
          fontSize: Math.max(opts.fontSize, 7),
          fontStyle: 'bold',
          font: fontSetup.selectedFont, // 🆕 Явно указываем шрифт
        },
        bodyStyles: {
          ...tableStyles.bodyStyles,
          font: fontSetup.selectedFont, // 🆕 Явно указываем шрифт
        },
        alternateRowStyles: {
          ...tableStyles.alternateRowStyles,
          font: fontSetup.selectedFont, // 🆕 Явно указываем шрифт
        },
        columnStyles: columnStyles,
        showHead: true,
        showFoot: false,
        tableLineColor: tableStyles.lineColor,
        tableLineWidth: tableStyles.lineWidth,
        tableWidth: 'wrap',
        
        // 🆕 УЛУЧШЕННЫЕ КОЛБЭКИ С КОНТРОЛЕМ ШРИФТОВ
        didDrawPage: (data: any) => {
          const pageNumber = (pdf as any).internal.getCurrentPageInfo().pageNumber;
          const totalPages = (pdf as any).internal.getNumberOfPages();
          
          pdf.setFontSize(8);
          pdf.setFont(fontSetup.selectedFont, 'normal');
          
          pdf.text(
            `Page ${pageNumber} of ${totalPages}`,
            opts.marginLeft,
            (pdf as any).internal.pageSize.height - 10
          );
          
          const pageWidth = (pdf as any).internal.pageSize.width;
          pdf.text(
            `${parseResult.rowCount} rows | ${parseResult.columnCount} columns | Font: ${fontSetup.selectedFont}`,
            pageWidth - 80,
            (pdf as any).internal.pageSize.height - 10
          );
        },
        
        willDrawPage: () => {
          // Убеждаемся что шрифт установлен перед рисованием каждой страницы
          pdf.setFont(fontSetup.selectedFont, 'normal');
        },
        
        willDrawCell: (data: any) => {
          // Устанавливаем правильный шрифт для каждой ячейки
          if (data.section === 'head') {
            pdf.setFont(fontSetup.selectedFont, 'bold');
          } else {
            pdf.setFont(fontSetup.selectedFont, 'normal');
          }
        }
      });

      // Добавление предупреждения об ограничении строк
      if (parseResult.rowCount > maxRows) {
        const finalY = (pdf as any).lastAutoTable.finalY || currentY + 50;
        pdf.setFontSize(8);
        pdf.setFont(fontSetup.selectedFont, 'normal');
        const warningText = `Note: Only first ${maxRows} of ${parseResult.rowCount} rows are displayed`;
        pdf.text(warningText, opts.marginLeft, finalY + 10);
      }

      // 🆕 УЛУЧШЕННАЯ ИНФОРМАЦИЯ О ТРАНСЛИТЕРАЦИИ
      const needsTransliteration = this.checkIfNeedsTransliteration(parseResult);
      if (needsTransliteration || fontSetup.appliedTransliterations > 0) {
        const finalY = (pdf as any).lastAutoTable.finalY || currentY + 50;
        pdf.setFontSize(6);
        pdf.setFont(fontSetup.selectedFont, 'italic');
        
        const noteLines = [
          'Font Rendering Information:',
          `• Selected font: ${fontSetup.selectedFont}`,
          `• Characters transliterated: ${fontSetup.appliedTransliterations}`,
          '• Non-Latin characters converted for better compatibility'
        ];
        
        noteLines.forEach((line, index) => {
          pdf.text(line, opts.marginLeft, finalY + 15 + (index * 4));
        });
      }

      // Возврат PDF как Uint8Array
      const pdfOutput = pdf.output('arraybuffer');
      return new Uint8Array(pdfOutput);

    } catch (error) {
      console.error('💥 PDF generation error:', error);
      throw new Error(`PDF generation failed: ${error}`);
    }
  }

  /**
   * Проверка нужна ли транслитерация (теперь использует новый сервис)
   */
  private static checkIfNeedsTransliteration(parseResult: CsvParseResult): boolean {
    // Анализируем заголовки
    const headerAnalysis = EnhancedUnicodeFontService.analyzeText(parseResult.headers.join(' '));
    if (headerAnalysis.needsTransliteration) {
      return true;
    }
    
    // Анализируем образец данных
    const sampleSize = Math.min(10, parseResult.data.length);
    for (let i = 0; i < sampleSize; i++) {
      const row = parseResult.data[i];
      for (const header of parseResult.headers) {
        const value = row[header];
        if (value && typeof value === 'string') {
          const analysis = EnhancedUnicodeFontService.analyzeText(value);
          if (analysis.needsTransliteration) {
            return true;
          }
        }
      }
    }
    
    return false;
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
   * Расчет оптимальных ширин колонок
   */
  private static calculateOptimalColumnWidths(
    columnAnalysis: ColumnAnalysis[], 
    opts: CsvToPdfOptions,
    includeRowNumbers: boolean
  ): { [key: number]: any } {
    const columnStyles: { [key: number]: any } = {};
    
    const pageWidth = this.getPageWidth(opts.pageSize, opts.orientation);
    const availableWidth = pageWidth - opts.marginLeft - opts.marginRight;
    
    console.log(`📏 Page: ${opts.pageSize.toUpperCase()}, Available width: ${availableWidth}mm`);
    
    const totalColumns = columnAnalysis.length + (includeRowNumbers ? 1 : 0);
    console.log(`📊 Total columns to fit: ${totalColumns}`);
    
    // Экстремальные режимы для очень широких таблиц
    let maxWidth: number;
    let minWidth: number;
    let fontSize = opts.fontSize;
    let cellPadding = 1.5;
    
    if (totalColumns >= 25) {
      maxWidth = 12;
      minWidth = 6;
      fontSize = Math.max(opts.fontSize - 3, 3);
      cellPadding = 0.5;
      console.log('🆘 SURVIVAL MODE: 25+ columns - extreme compression');
    } else if (totalColumns >= 20) {
      maxWidth = 15;
      minWidth = 7;
      fontSize = Math.max(opts.fontSize - 2.5, 3.5);
      cellPadding = 0.8;
      console.log('🔥 EXTREME MODE: 20+ columns');
    } else if (totalColumns >= 15) {
      maxWidth = 18;
      minWidth = 8;
      fontSize = Math.max(opts.fontSize - 2, 4);
      cellPadding = 1;
      console.log('🚨 ULTRA-COMPACT MODE: 15+ columns');
    } else if (totalColumns >= 10) {
      maxWidth = 25;
      minWidth = 10;
      fontSize = Math.max(opts.fontSize - 1, 5);
      cellPadding = 1.2;
      console.log('⚡ HIGH-COMPACT MODE: 10+ columns');
    } else if (totalColumns >= 7) {
      maxWidth = 35;
      minWidth = 15;
      fontSize = Math.max(opts.fontSize - 0.5, 6);
      console.log('📦 COMPACT MODE: 7+ columns');
    } else {
      maxWidth = 50;
      minWidth = 20;
      console.log('📝 NORMAL MODE: few columns');
    }
    
    // Равномерное распределение с учетом минимумов
    const idealWidth = availableWidth / totalColumns;
    let targetWidth = Math.min(idealWidth, maxWidth);
    targetWidth = Math.max(targetWidth, minWidth);
    
    console.log(`🎯 Ideal: ${idealWidth.toFixed(1)}mm, Target: ${targetWidth.toFixed(1)}mm per column`);
    
    // Проверяем поместится ли
    const totalRequiredWidth = targetWidth * totalColumns;
    let finalWidth = targetWidth;
    
    if (totalRequiredWidth > availableWidth) {
      finalWidth = (availableWidth - 1) / totalColumns;
      console.log(`🆘 EMERGENCY: Forced reduction to ${finalWidth.toFixed(1)}mm per column`);
      
      if (finalWidth < 6) {
        fontSize = Math.max(fontSize - 1, 2);
        cellPadding = 0.3;
        console.log(`🆘 CRITICAL: Font reduced to ${fontSize}pt, padding to ${cellPadding}mm`);
      }
    }
    
    // Применение одинаковой ширины ко всем колонкам
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
      'legal': orientation === 'landscape' ? 356 : 216,
    };
    return sizes[pageSize as keyof typeof sizes] || 356;
  }

  /**
   * Получение стилей таблицы
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
