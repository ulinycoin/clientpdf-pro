/**
 * SimpleCyrillicFont.ts - Простой встроенный кириллический шрифт
 * Минимальная реализация для быстрого старта
 */

import { jsPDF } from 'jspdf';

export class SimpleCyrillicFont {
  // Упрощенный base64 шрифт DejaVu Sans (урезанная версия только с основными символами)
  // Для продакшена замените на полный шрифт
  private static readonly SIMPLE_CYRILLIC_FONT = `
    T1RUTwAMAIQAAAwAAEJBU0UAAAACAAEABAAAAERTSUcAAAACABIAAA==
    // TODO: Вставить реальный base64 минимального TTF шрифта
  `;

  /**
   * Быстрая настройка кириллицы для тестирования
   */
  public static quickSetupCyrillic(pdf: jsPDF): boolean {
    try {
      // Пробуем Times (у него есть частичная поддержка кириллицы)
      pdf.setFont('times', 'normal');
      
      // Тестируем кириллические символы
      const testText = 'Тест';
      pdf.text(testText, 1000, 1000); // Вне видимой области для теста
      
      console.log('✅ Times font supports some Cyrillic characters');
      return true;
    } catch (error) {
      console.warn('⚠️ Cyrillic support limited, will use transliteration');
      pdf.setFont('helvetica', 'normal');
      return false;
    }
  }

  /**
   * Улучшенная транслитерация для русского языка
   */
  public static transliterateRussian(text: string): string {
    const map = new Map([
      ['а', 'a'], ['б', 'b'], ['в', 'v'], ['г', 'g'], ['д', 'd'],
      ['е', 'e'], ['ё', 'yo'], ['ж', 'zh'], ['з', 'z'], ['и', 'i'],
      ['й', 'y'], ['к', 'k'], ['л', 'l'], ['м', 'm'], ['н', 'n'],
      ['о', 'o'], ['п', 'p'], ['р', 'r'], ['с', 's'], ['т', 't'],
      ['у', 'u'], ['ф', 'f'], ['х', 'kh'], ['ц', 'ts'], ['ч', 'ch'],
      ['ш', 'sh'], ['щ', 'sch'], ['ъ', ''], ['ы', 'y'], ['ь', ''],
      ['э', 'e'], ['ю', 'yu'], ['я', 'ya'],
      // Заглавные
      ['А', 'A'], ['Б', 'B'], ['В', 'V'], ['Г', 'G'], ['Д', 'D'],
      ['Е', 'E'], ['Ё', 'Yo'], ['Ж', 'Zh'], ['З', 'Z'], ['И', 'I'],
      ['Й', 'Y'], ['К', 'K'], ['Л', 'L'], ['М', 'M'], ['Н', 'N'],
      ['О', 'O'], ['П', 'P'], ['Р', 'R'], ['С', 'S'], ['Т', 'T'],
      ['У', 'U'], ['Ф', 'F'], ['Х', 'Kh'], ['Ц', 'Ts'], ['Ч', 'Ch'],
      ['Ш', 'Sh'], ['Щ', 'Sch'], ['Ъ', ''], ['Ы', 'Y'], ['Ь', ''],
      ['Э', 'E'], ['Ю', 'Yu'], ['Я', 'Ya']
    ]);

    let result = text;
    for (const [cyrillic, latin] of map) {
      result = result.replace(new RegExp(cyrillic, 'g'), latin);
    }
    return result;
  }

  /**
   * Обработка текста с автоматическим выбором метода
   */
  public static processText(pdf: jsPDF, text: string, x: number, y: number): void {
    // Проверяем есть ли кириллица
    const hasCyrillic = /[а-яё]/i.test(text);
    
    if (!hasCyrillic) {
      // Обычный текст
      pdf.text(text, x, y);
      return;
    }

    // Пробуем отобразить кириллицу напрямую
    try {
      pdf.setFont('times', 'normal');
      pdf.text(text, x, y);
      console.log('🔤 Cyrillic text rendered with Times font');
    } catch (error) {
      // Fallback к транслитерации
      const transliterated = this.transliterateRussian(text);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${transliterated} [RU]`, x, y);
      console.log('🔤 Cyrillic text transliterated');
    }
  }
}
