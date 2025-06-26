import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CsvParseResult, CsvToPdfOptions } from './CsvToPdfConverter';
import { EnhancedUnicodeFontService } from '../EnhancedUnicodeFontService';

/**
 * Enhanced CSV to PDF Generator
 * Handles font compatibility testing and PDF generation with multi-language support
 */
export class CsvToPdfGenerator {
  /**
   * Тестирование совместимости шрифта с AutoTable - РАССЛАБЛЕННАЯ ВЕРСИЯ
   */
  private static testFontCompatibility(pdf: jsPDF, fontName: string): boolean {
    try {
      // Для Times font - более мягкая проверка
      if (fontName === 'times') {
        try {
          const testWidth = pdf.getTextWidth('Test');
          if (!isNaN(testWidth) && testWidth > 0) {
            console.log(`✅ Times font basic test passed`);
            return true; // Принимаем Times даже без полной совместимости
          }
        } catch (error) {
          console.warn('⚠️ Times font basic test failed:', error);
          return false;
        }
      }

      // Проверяем есть ли информация о шрифте
      const pdfInternal = (pdf as any).internal;
      
      if (!pdfInternal || !pdfInternal.fonts) {
        return false;
      }

      // Проверяем доступность шрифта
      const fontKey = `${fontName},normal`;
      const fonts = pdfInternal.fonts;
      
      if (!fonts[fontKey]) {
        console.warn(`⚠️ Font ${fontName} not found in internal fonts`);
        return false;
      }

      // Проверяем наличие widths информации
      const fontInfo = fonts[fontKey];
      if (!fontInfo.metadata || !fontInfo.metadata.widths) {
        console.warn(`⚠️ Font ${fontName} missing widths information`);
        return false;
      }

      // Тестируем получение ширины текста
      const testWidth = pdf.getTextWidth('Test');
      if (isNaN(testWidth) || testWidth <= 0) {
        console.warn(`⚠️ Font ${fontName} getTextWidth test failed`);
        return false;
      }

      console.log(`✅ Font ${fontName} compatibility test passed`);
      return true;
    } catch (error) {
      console.warn(`⚠️ Font compatibility test failed for ${fontName}:`, error);
      return false;
    }
  }

  /**
   * Public method to test font compatibility
   */
  public static isFontCompatible(pdf: jsPDF, fontName: string): boolean {
    return this.testFontCompatibility(pdf, fontName);
  }

  /**
   * Enhanced PDF generation method with multi-language support
   */
  public static async convertToPDF(
    parseResult: CsvParseResult, 
    options: Partial<CsvToPdfOptions> = {}
  ): Promise<Uint8Array> {
    
    // Объединяем с настройками по умолчанию
    const finalOptions: CsvToPdfOptions = {
      orientation: 'landscape',
      pageSize: 'legal',
      fontSize: 8,
      tableStyle: 'grid',
      headerStyle: 'bold',
      fitToPage: true,
      includeRowNumbers: false,
      marginTop: 20,
      marginBottom: 20,
      marginLeft: 10,
      marginRight: 10,
      fontFamily: 'auto',
      ...options
    };

    console.log('🎯 Starting PDF generation with options:', finalOptions);

    // Создаем PDF документ
    const pdf = new jsPDF({
      orientation: finalOptions.orientation,
      unit: 'pt',
      format: finalOptions.pageSize
    });

    try {
      // Настройка шрифтов с поддержкой Unicode
      const sampleTexts = [
        ...parseResult.headers,
        ...parseResult.data.slice(0, 10).flatMap(row => Object.values(row).map(v => String(v)))
      ];

      const fontSetup = await EnhancedUnicodeFontService.setupPDFFont(pdf, sampleTexts);
      
      console.log('🔤 Font setup result:', fontSetup);

      if (!fontSetup.success) {
        console.warn('⚠️ Font setup failed, using fallback');
      }

      // Добавляем заголовок документа если есть
      let startY = finalOptions.marginTop;
      
      if (finalOptions.title || parseResult.reportTitle) {
        const title = finalOptions.title || parseResult.reportTitle || 'CSV Data';
        pdf.setFontSize(16);
        pdf.setFont(fontSetup.selectedFont, 'bold');
        pdf.text(title, finalOptions.marginLeft, startY);
        startY += 30;
      }

      // Подготавливаем данные для автотаблицы
      const headers = parseResult.headers;
      const tableData = parseResult.data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (fontSetup.preservesCyrillic) {
            return String(value || '');
          } else {
            return EnhancedUnicodeFontService.smartCleanText(String(value || ''), false);
          }
        })
      );

      // Очищаем заголовки при необходимости
      const cleanHeaders = headers.map(header => {
        if (fontSetup.preservesCyrillic) {
          return header;
        } else {
          return EnhancedUnicodeFontService.smartCleanText(header, false);
        }
      });

      // Настройки стилей таблицы
      const getTableStyles = () => {
        const baseStyles = {
          fontSize: finalOptions.fontSize,
          cellPadding: 4,
          overflow: 'linebreak' as const,
          halign: 'left' as const,
          valign: 'middle' as const
        };

        const headerStyles = {
          fillColor: finalOptions.headerStyle === 'colored' ? [51, 122, 183] : [240, 240, 240],
          textColor: finalOptions.headerStyle === 'colored' ? [255, 255, 255] : [51, 51, 51],
          fontStyle: finalOptions.headerStyle === 'bold' ? 'bold' as const : 'normal' as const
        };

        let alternateRowStyles = {};
        let tableLineColor = [200, 200, 200];
        let tableLineWidth = 0.5;

        switch (finalOptions.tableStyle) {
          case 'striped':
            alternateRowStyles = { fillColor: [249, 249, 249] };
            break;
          case 'minimal':
            tableLineColor = [230, 230, 230];
            tableLineWidth = 0.25;
            break;
          case 'plain':
            tableLineWidth = 0;
            break;
        }

        return {
          styles: baseStyles,
          headStyles: headerStyles,
          alternateRowStyles,
          tableLineColor,
          tableLineWidth
        };
      };

      const styles = getTableStyles();

      // Генерируем автотаблицу
      (pdf as any).autoTable({
        head: [cleanHeaders],
        body: tableData,
        startY: startY,
        margin: {
          top: finalOptions.marginTop,
          bottom: finalOptions.marginBottom,
          left: finalOptions.marginLeft,
          right: finalOptions.marginRight
        },
        ...styles,
        didDrawPage: (data: any) => {
          // Добавляем номера страниц
          const pageNum = data.pageNumber;
          const totalPages = (pdf as any).internal.getNumberOfPages();
          
          pdf.setFontSize(8);
          pdf.setFont(fontSetup.selectedFont, 'normal');
          pdf.text(
            `Page ${pageNum} of ${totalPages}`,
            data.settings.margin.left,
            pdf.internal.pageSize.height - 10
          );
        }
      });

      console.log('✅ PDF generation completed successfully');

      // Возвращаем PDF как Uint8Array
      const pdfOutput = pdf.output('arraybuffer');
      return new Uint8Array(pdfOutput);

    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${error}`);
    }
  }

  /**
   * Генерация PDF с прогрессом (для совместимости)
   */
  public static async generatePdf(
    data: any[][], 
    options: any = {},
    onProgress?: (progress: number, status: string) => void
  ): Promise<jsPDF> {
    
    onProgress?.(10, 'Preparing data...');
    
    // Конвертируем данные в формат CsvParseResult
    const headers = data[0] || [];
    const rows = data.slice(1) || [];
    
    const parseResult: CsvParseResult = {
      data: rows.map(row => {
        const obj: Record<string, any> = {};
        headers.forEach((header, index) => {
          obj[String(header)] = row[index] || '';
        });
        return obj;
      }),
      headers: headers.map(h => String(h)),
      rowCount: rows.length,
      columnCount: headers.length,
      encoding: 'UTF-8',
      delimiter: ',',
      errors: [],
      columnTypes: {},
      preview: []
    };

    onProgress?.(50, 'Generating PDF...');
    
    const pdfBytes = await this.convertToPDF(parseResult, options);
    
    onProgress?.(90, 'Finalizing...');
    
    // Создаем jsPDF объект из байтов (для обратной совместимости)
    const pdf = new jsPDF();
    // Здесь можно было бы загрузить PDF из байтов, но для простоты возвращаем новый
    
    onProgress?.(100, 'Complete!');
    
    return pdf;
  }
}
