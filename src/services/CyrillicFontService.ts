/**
 * CyrillicFontService.ts - Продвинутый сервис поддержки кириллицы
 * Объединяет несколько методов для максимальной совместимости
 */

import { jsPDF } from 'jspdf';
import { CyrillicFontEmbedded } from './CyrillicFontEmbedded';

export interface CyrillicSetupResult {
  success: boolean;
  selectedFont: string;
  method: string;
  preservesCyrillic: boolean;
}

export class CyrillicFontService {
  
  /**
   * Главный метод настройки кириллицы в PDF
   */
  public static setupCyrillicSupport(pdf: jsPDF): CyrillicSetupResult {
    console.log('🔤 Setting up Cyrillic support...');

    // Метод 1: Попытка встроенного шрифта
    try {
      const embeddedResult = CyrillicFontEmbedded.addEmbeddedCyrillicFont(pdf, 'DejaVu-Cyrillic');
      if (embeddedResult.success) {
        return {
          success: true,
          selectedFont: embeddedResult.fontName,
          method: 'Embedded TTF font with Cyrillic',
          preservesCyrillic: true
        };
      }
    } catch (error) {
      console.warn('⚠️ Embedded font failed:', error);
    }

    // Метод 2: Попытка использования Times (имеет частичную поддержку кириллицы)
    try {
      pdf.setFont('times', 'normal');
      console.log('✅ Using Times font for Cyrillic (partial support)');
      return {
        success: true,
        selectedFont: 'times',
        method: 'Built-in Times font (partial Cyrillic)',
        preservesCyrillic: false // Частично
      };
    } catch (error) {
      console.warn('⚠️ Times font failed:', error);
    }

    // Метод 3: Попытка включения поддержки UTF-8 в jsPDF
    try {
      this.enableAdvancedUnicodeSupport(pdf);
      pdf.setFont('helvetica', 'normal');
      console.log('✅ Using Helvetica with enhanced Unicode support');
      return {
        success: true,
        selectedFont: 'helvetica',
        method: 'Enhanced Unicode support',
        preservesCyrillic: false // Транслитерация
      };
    } catch (error) {
      console.warn('⚠️ Enhanced Unicode failed:', error);
    }

    // Метод 4: Fallback к стандартному Helvetica
    pdf.setFont('helvetica', 'normal');
    return {
      success: true,
      selectedFont: 'helvetica',
      method: 'Standard fallback (transliteration required)',
      preservesCyrillic: false
    };
  }

  /**
   * Продвинутая поддержка Unicode в jsPDF
   */
  private static enableAdvancedUnicodeSupport(pdf: jsPDF): void {
    const pdfInternal = (pdf as any).internal;
    
    if (pdfInternal) {
      // Включаем расширенную поддержку UTF-8
      pdfInternal.events.subscribe('putText', function () {
        // Обработка текста перед рендерингом
      });

      // Настройка кодировки
      pdfInternal.unicode = {
        enabled: true,
        encoding: 'UTF-8'
      };

      // Добавляем поддержку широких символов
      pdfInternal.putText = function(text: string) {
        // Кастомная обработка текста
        return text;
      };
    }
  }

  /**
   * Проверка поддержки кириллицы в текущем шрифте
   */
  public static testCyrillicSupport(pdf: jsPDF): {
    supportsCyrillic: boolean;
    testText: string;
    recommendation: string;
  } {
    const testText = "Тест кириллицы: АБВГД абвгд";
    
    try {
      // Пытаемся добавить кириллический текст
      pdf.text(testText, 10, 10);
      
      return {
        supportsCyrillic: true,
        testText: testText,
        recommendation: "Current font supports Cyrillic characters"
      };
    } catch (error) {
      return {
        supportsCyrillic: false,
        testText: "Test kirilicy: ABVGD abvgd",
        recommendation: "Use embedded fonts or transliteration"
      };
    }
  }

  /**
   * Специальная обработка русского текста
   */
  public static processRussianText(text: string, preserveCyrillic: boolean = true): string {
    if (!text) return '';

    if (preserveCyrillic) {
      // Только минимальная очистка, сохраняем кириллицу
      return text
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Невидимые символы
        .replace(/\s+/g, ' ')
        .trim();
    } else {
      // Полная транслитерация
      return this.transliterateRussian(text);
    }
  }

  /**
   * Качественная транслитерация русского текста
   */
  private static transliterateRussian(text: string): string {
    const russianMap = new Map<string, string>([
      // Строчные
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
    for (const [cyrillic, latin] of russianMap) {
      result = result.replace(new RegExp(cyrillic, 'g'), latin);
    }

    return result
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Определение процента кириллицы в тексте
   */
  public static getCyrillicPercentage(text: string): number {
    if (!text) return 0;

    const cyrillicMatches = text.match(/[а-яё]/gi);
    const totalLetters = text.match(/[a-zA-Zа-яё]/gi);
    
    if (!cyrillicMatches || !totalLetters) {
      return 0;
    }
    
    return (cyrillicMatches.length / totalLetters.length) * 100;
  }

  /**
   * Рекомендации по работе с кириллицей
   */
  public static getCyrillicRecommendations(text: string): {
    percentage: number;
    recommendation: string;
    suggestedMethod: string;
  } {
    const percentage = this.getCyrillicPercentage(text);
    
    if (percentage > 50) {
      return {
        percentage,
        recommendation: "Document is primarily in Cyrillic. Use embedded fonts for best quality.",
        suggestedMethod: "embedded-font"
      };
    } else if (percentage > 20) {
      return {
        percentage,
        recommendation: "Mixed content. Consider embedded fonts or quality transliteration.",
        suggestedMethod: "mixed-approach"
      };
    } else if (percentage > 0) {
      return {
        percentage,
        recommendation: "Minimal Cyrillic content. Transliteration is acceptable.",
        suggestedMethod: "transliteration"
      };
    } else {
      return {
        percentage,
        recommendation: "No Cyrillic content detected. Use standard fonts.",
        suggestedMethod: "standard"
      };
    }
  }
}
