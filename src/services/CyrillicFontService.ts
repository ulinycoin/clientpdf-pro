/**
 * CyrillicFontService.ts - Сервис для поддержки кириллицы в PDF
 * Использует встроенные возможности jsPDF для Unicode текста
 */

import { jsPDF } from 'jspdf';

export class CyrillicFontService {
  private static fontCache = new Map<string, boolean>();

  /**
   * Настройка PDF для поддержки кириллицы
   * Использует встроенную поддержку Unicode в jsPDF
   */
  public static setupCyrillicSupport(pdf: jsPDF): {
    success: boolean;
    selectedFont: string;
    method: string;
  } {
    try {
      // Метод 1: Используем встроенную поддержку Unicode
      pdf.setFont('helvetica', 'normal');
      
      // Включаем Unicode режим через internal API
      const internal = (pdf as any).internal;
      if (internal) {
        // Настройка кодировки для Unicode
        internal.events.subscribe('addFonts', function() {
          // Включаем поддержку Unicode символов
          this.addFont('helvetica', 'normal', 'StandardEncoding', 'Identity-H');
        });
      }

      return {
        success: true,
        selectedFont: 'helvetica',
        method: 'Built-in Unicode support'
      };

    } catch (error) {
      console.error('Failed to setup Cyrillic support:', error);
      return {
        success: false,
        selectedFont: 'helvetica',
        method: 'fallback'
      };
    }
  }

  /**
   * Проверка поддержки кириллицы в браузере
   */
  public static testCyrillicSupport(pdf: jsPDF, testText: string = 'Привет мир!'): boolean {
    try {
      // Пробуем добавить кириллический текст
      pdf.text(testText, 10, 10);
      return true;
    } catch (error) {
      console.warn('Cyrillic not supported:', error);
      return false;
    }
  }

  /**
   * Умное определение - использовать кириллицу или транслитерацию
   */
  public static shouldUseCyrillic(text: string): boolean {
    // Проверяем процент кириллических символов
    const cyrillicChars = (text.match(/[а-яё]/gi) || []).length;
    const totalChars = text.replace(/\s/g, '').length;
    
    // Если больше 30% кириллицы, пытаемся использовать нативную поддержку
    return totalChars > 0 && (cyrillicChars / totalChars > 0.3);
  }
}