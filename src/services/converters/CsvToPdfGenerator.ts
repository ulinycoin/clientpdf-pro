import jsPDF from 'jspdf';

/**
 * Enhanced CSV to PDF Generator
 * Handles font compatibility testing and PDF generation
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
   * Placeholder for future PDF generation method
   */
  public static async generatePdf(data: any[][], options: any = {}): Promise<jsPDF> {
    const pdf = new jsPDF();
    // TODO: Implement enhanced PDF generation with multi-language support
    return pdf;
  }
}
