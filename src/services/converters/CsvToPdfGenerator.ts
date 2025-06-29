import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CsvParseResult, CsvToPdfOptions } from './CsvToPdfConverter';
import { EnhancedUnicodeFontService } from '../EnhancedUnicodeFontService';

/**
 * 🛡️ ОБНОВЛЕНО: Enhanced CSV to PDF Generator с поддержкой флага useSystemFonts
 * Решает проблемы встроенных шрифтов с помощью надежных системных шрифтов
 */
export class CsvToPdfGenerator {
  /**
   * 🛡️ Обновленная генерация PDF с поддержкой надежных системных шрифтов
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
      fontFamily: 'Arial', // 🛡️ По умолчанию используем Arial
      useSystemFonts: true, // 🛡️ НОВЫЙ ФЛАГ: принудительно используем системные шрифты
      ...options
    };

    console.log('🎯 Starting PDF generation with options:', {
      ...finalOptions,
      useSystemFonts: finalOptions.useSystemFonts // Логируем новый флаг
    });

    // Создаем PDF документ
    const pdf = new jsPDF({
      orientation: finalOptions.orientation,
      unit: 'pt',
      format: finalOptions.pageSize
    });

    try {
      // Collect sample texts for font analysis
      const sampleTexts = [
        ...parseResult.headers,
        ...parseResult.data.slice(0, 10).flatMap(row => 
          Object.values(row).map(v => String(v || '')).filter(text => text.length > 0)
        )
      ];

      console.log('🔤 Analyzing text for font selection...');
      
      // 🛡️ ОБНОВЛЕННЫЙ вызов с флагом useSystemFonts
      const fontSetup = await EnhancedUnicodeFontService.setupPDFFont(pdf, sampleTexts, {
        useSystemFonts: finalOptions.useSystemFonts,
        fontFamily: finalOptions.fontFamily
      });
      
      console.log('🎯 Font setup result:', {
        success: fontSetup.success,
        selectedFont: fontSetup.selectedFont,
        preservesCyrillic: fontSetup.preservesCyrillic,
        warnings: fontSetup.warnings.length,
        systemFontsUsed: finalOptions.useSystemFonts // 🛡️ Логируем использование системных шрифтов
      });

      if (!fontSetup.success) {
        console.warn('⚠️ Font setup failed, using emergency fallback');
        // 🛡️ Экстренный fallback к Arial
        pdf.setFont('Arial', 'normal');
      } else {
        console.log(`✅ Font set successfully: ${fontSetup.selectedFont}`);
      }

      // Set initial font size
      pdf.setFontSize(finalOptions.fontSize);

      // 🧹 Process data with cleaning (удаляем эмодзи и проблемные символы)
      const processedData = this.processDataWithCleaning(
        parseResult, 
        fontSetup.preservesCyrillic || false
      );

      console.log('📊 Data processed:', {
        originalRows: parseResult.data.length,
        processedRows: processedData.tableData.length,
        preservesCyrillic: fontSetup.preservesCyrillic,
        useSystemFonts: finalOptions.useSystemFonts
      });

      // Add document title if specified
      let startY = finalOptions.marginTop;
      
      if (finalOptions.title || parseResult.reportTitle) {
        const title = finalOptions.title || parseResult.reportTitle || 'CSV Data';
        pdf.setFontSize(16);
        pdf.setFont(fontSetup.selectedFont || 'Arial', 'bold');
        
        // 🧹 Очищаем заголовок
        const cleanTitle = EnhancedUnicodeFontService.smartCleanText(
          title, 
          fontSetup.preservesCyrillic || false
        );
        
        pdf.text(cleanTitle, finalOptions.marginLeft, startY);
        startY += 30;
      }

      // Configure table styles based on options
      const tableStyles = this.getTableStyles(finalOptions, fontSetup.selectedFont || 'Arial');

      console.log('🎨 Generating table with styles:', {
        tableStyle: finalOptions.tableStyle,
        headerStyle: finalOptions.headerStyle,
        fontSize: finalOptions.fontSize,
        font: fontSetup.selectedFont
      });

      // 🛡️ Generate the auto table with reliable font configuration
      (pdf as any).autoTable({
        head: [processedData.cleanHeaders],
        body: processedData.tableData,
        startY: startY,
        margin: {
          top: finalOptions.marginTop,
          bottom: finalOptions.marginBottom,
          left: finalOptions.marginLeft,
          right: finalOptions.marginRight
        },
        ...tableStyles,
        didDrawPage: (data: any) => {
          // Add page numbers with reliable font
          const pageNum = data.pageNumber;
          const totalPages = (pdf as any).internal.getNumberOfPages();
          
          pdf.setFontSize(8);
          pdf.setFont(fontSetup.selectedFont || 'Arial', 'normal');
          
          const pageText = `Page ${pageNum} of ${totalPages}`;
          const cleanPageText = EnhancedUnicodeFontService.smartCleanText(
            pageText, 
            fontSetup.preservesCyrillic || false
          );
          
          pdf.text(
            cleanPageText,
            data.settings.margin.left,
            pdf.internal.pageSize.height - 10
          );
        },
        // 🧹 Enhanced cell processing with cleaning
        didParseCell: (data: any) => {
          if (data.cell && data.cell.text && Array.isArray(data.cell.text)) {
            data.cell.text = data.cell.text.map((text: string) => {
              return EnhancedUnicodeFontService.smartCleanText(
                String(text), 
                fontSetup.preservesCyrillic || false
              );
            });
          }
        }
      });

      console.log('✅ PDF generation completed successfully');

      // Return PDF as Uint8Array
      const pdfOutput = pdf.output('arraybuffer');
      return new Uint8Array(pdfOutput);

    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      
      // 🛡️ Create a fallback PDF with reliable Arial font
      try {
        pdf.setFont('Arial', 'normal');
        pdf.setFontSize(12);
        pdf.text('PDF Generation Error', 50, 50);
        pdf.setFontSize(10);
        pdf.text(`Error: ${String(error)}`, 50, 80);
        pdf.text('Please try with different settings or contact support.', 50, 100);
        
        const fallbackOutput = pdf.output('arraybuffer');
        return new Uint8Array(fallbackOutput);
      } catch (fallbackError) {
        throw new Error(`Critical PDF generation failure: ${error}`);
      }
    }
  }

  /**
   * 🧹 Process CSV data with proper cleaning (updated method name)
   */
  private static processDataWithCleaning(
    parseResult: CsvParseResult,
    preservesCyrillic: boolean
  ): {
    cleanHeaders: string[];
    tableData: string[][];
  } {
    console.log('🔄 Processing data with cleaning, preservesCyrillic:', preservesCyrillic);

    // Process headers with cleaning
    const cleanHeaders = parseResult.headers.map(header => {
      return EnhancedUnicodeFontService.smartCleanText(header, preservesCyrillic);
    });

    // Process table data with cleaning
    const tableData = parseResult.data.map(row => 
      parseResult.headers.map(header => {
        const value = row[header];
        const stringValue = String(value || '');
        return EnhancedUnicodeFontService.smartCleanText(stringValue, preservesCyrillic);
      })
    );

    console.log('✅ Data cleaning completed:', {
      headersProcessed: cleanHeaders.length,
      rowsProcessed: tableData.length,
      sampleHeader: cleanHeaders[0],
      sampleCell: tableData[0]?.[0]
    });

    return { cleanHeaders, tableData };
  }

  /**
   * 🛡️ Get table styles configuration with reliable fonts
   */
  private static getTableStyles(options: CsvToPdfOptions, selectedFont: string) {
    const baseStyles = {
      fontSize: options.fontSize,
      cellPadding: 4,
      overflow: 'linebreak' as const,
      halign: 'left' as const,
      valign: 'middle' as const,
      font: selectedFont // 🛡️ Используем надежный выбранный шрифт
    };

    const headerStyles = {
      fillColor: options.headerStyle === 'colored' ? [51, 122, 183] : [240, 240, 240],
      textColor: options.headerStyle === 'colored' ? [255, 255, 255] : [51, 51, 51],
      fontStyle: options.headerStyle === 'bold' ? 'bold' as const : 'normal' as const,
      font: selectedFont // 🛡️ Используем надежный выбранный шрифт
    };

    let alternateRowStyles = {};
    let tableLineColor = [200, 200, 200];
    let tableLineWidth = 0.5;

    switch (options.tableStyle) {
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
      tableLineWidth,
      theme: 'plain' // Use plain theme for better font control
    };
  }

  /**
   * Compatibility method for existing code
   */
  public static async generatePdf(
    data: any[][], 
    options: any = {},
    onProgress?: (progress: number, status: string) => void
  ): Promise<jsPDF> {
    
    onProgress?.(10, 'Preparing data...');
    
    // Convert data format
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

    onProgress?.(50, 'Generating PDF with reliable fonts...');
    
    // 🛡️ Добавляем флаг useSystemFonts в опции
    const enhancedOptions = {
      ...options,
      useSystemFonts: true, // 🛡️ Принудительно используем системные шрифты
      fontFamily: 'Arial'
    };
    
    const pdfBytes = await this.convertToPDF(parseResult, enhancedOptions);
    
    onProgress?.(90, 'Finalizing...');
    
    // Create jsPDF object for compatibility
    const pdf = new jsPDF();
    
    onProgress?.(100, 'Complete!');
    
    return pdf;
  }

  /**
   * 🛡️ Test font compatibility (enhanced for system fonts)
   */
  public static testFontCompatibility(pdf: jsPDF, fontName: string): boolean {
    try {
      pdf.setFont(fontName, 'normal');
      const testWidth = pdf.getTextWidth('Test Тест');
      return !isNaN(testWidth) && testWidth > 0;
    } catch (error) {
      console.warn(`⚠️ Font compatibility test failed for ${fontName}:`, error);
      return false;
    }
  }
}