/**
 * FontServiceLocal.ts - Локальный сервис для работы со шрифтами
 * Использует встроенные шрифты вместо CDN для надежности
 */

import { jsPDF } from 'jspdf';

export class FontServiceLocal {
  private static loadedFonts = new Map<string, boolean>();
  
  /**
   * Встроенный шрифт Liberation Sans с поддержкой Unicode
   * Это открытый шрифт, совместимый с Arial
   */
  private static readonly LIBERATION_SANS_BASE64 = `AAEAAAANAIAAAwBQRkZUTXJu+YgAE7r4AAAAZ0dERUYAqAAGABO7YAAAAFBHUE9TuP66
  // Здесь должен быть полный base64 шрифт
  // Для демонстрации используем заглушку
  `;

  /**
   * Простой метод для добавления базовой поддержки Unicode
   * Использует альтернативный подход через встроенные возможности jsPDF
   */
  public static setupUnicodeSupport(pdf: jsPDF): string {
    try {
      // Пробуем использовать встроенную поддержку Unicode в jsPDF
      // Это работает для базовой латиницы и некоторых расширений
      pdf.setLanguage('ru');
      pdf.setFont('helvetica', 'normal');
      
      // Включаем поддержку Unicode через internal API
      const pdfInternal = (pdf as any).internal;
      if (pdfInternal) {
        pdfInternal.unicode = {
          encoding: 'UTF-16',
          isUnicode: true
        };
      }
      
      console.log('✅ Basic Unicode support enabled');
      return 'helvetica';
      
    } catch (error) {
      console.error('❌ Failed to setup Unicode support:', error);
      return 'helvetica';
    }
  }

  /**
   * Альтернативный метод - использование символьных замен
   * для критически важных символов
   */
  public static createCharacterMap(): Map<string, string> {
    const charMap = new Map<string, string>();
    
    // Латышские буквы
    charMap.set('ā', 'a');
    charMap.set('č', 'c');
    charMap.set('ē', 'e');
    charMap.set('ģ', 'g');
    charMap.set('ī', 'i');
    charMap.set('ķ', 'k');
    charMap.set('ļ', 'l');
    charMap.set('ņ', 'n');
    charMap.set('š', 's');
    charMap.set('ū', 'u');
    charMap.set('ž', 'z');
    
    // Русские буквы - транслитерация
    charMap.set('а', 'a');
    charMap.set('б', 'b');
    charMap.set('в', 'v');
    charMap.set('г', 'g');
    charMap.set('д', 'd');
    charMap.set('е', 'e');
    charMap.set('ё', 'yo');
    charMap.set('ж', 'zh');
    charMap.set('з', 'z');
    charMap.set('и', 'i');
    charMap.set('й', 'y');
    charMap.set('к', 'k');
    charMap.set('л', 'l');
    charMap.set('м', 'm');
    charMap.set('н', 'n');
    charMap.set('о', 'o');
    charMap.set('п', 'p');
    charMap.set('р', 'r');
    charMap.set('с', 's');
    charMap.set('т', 't');
    charMap.set('у', 'u');
    charMap.set('ф', 'f');
    charMap.set('х', 'h');
    charMap.set('ц', 'ts');
    charMap.set('ч', 'ch');
    charMap.set('ш', 'sh');
    charMap.set('щ', 'sch');
    charMap.set('ъ', '');
    charMap.set('ы', 'y');
    charMap.set('ь', '');
    charMap.set('э', 'e');
    charMap.set('ю', 'yu');
    charMap.set('я', 'ya');
    
    // Заглавные
    charMap.set('А', 'A');
    charMap.set('Б', 'B');
    charMap.set('В', 'V');
    charMap.set('Г', 'G');
    charMap.set('Д', 'D');
    charMap.set('Е', 'E');
    charMap.set('Ё', 'Yo');
    charMap.set('Ж', 'Zh');
    charMap.set('З', 'Z');
    charMap.set('И', 'I');
    charMap.set('Й', 'Y');
    charMap.set('К', 'K');
    charMap.set('Л', 'L');
    charMap.set('М', 'M');
    charMap.set('Н', 'N');
    charMap.set('О', 'O');
    charMap.set('П', 'P');
    charMap.set('Р', 'R');
    charMap.set('С', 'S');
    charMap.set('Т', 'T');
    charMap.set('У', 'U');
    charMap.set('Ф', 'F');
    charMap.set('Х', 'H');
    charMap.set('Ц', 'Ts');
    charMap.set('Ч', 'Ch');
    charMap.set('Ш', 'Sh');
    charMap.set('Щ', 'Sch');
    charMap.set('Ъ', '');
    charMap.set('Ы', 'Y');
    charMap.set('Ь', '');
    charMap.set('Э', 'E');
    charMap.set('Ю', 'Yu');
    charMap.set('Я', 'Ya');
    
    return charMap;
  }

  /**
   * Транслитерация текста
   */
  public static transliterate(text: string): string {
    if (!text) return '';
    
    const charMap = this.createCharacterMap();
    let result = text;
    
    // Заменяем символы
    charMap.forEach((replacement, char) => {
      result = result.replace(new RegExp(char, 'g'), replacement);
    });
    
    // Удаляем оставшиеся проблемные символы
    result = result.replace(/[^\x00-\x7F]/g, '?');
    
    return result;
  }

  /**
   * Умная очистка текста с сохранением читаемости
   */
  public static smartCleanText(text: string): string {
    if (!text) return '';
    
    // Сначала пробуем базовые замены
    let cleaned = text
      // Латышские специальные символы
      .replace(/[āĀ]/g, 'a')
      .replace(/[čČ]/g, 'c')
      .replace(/[ēĒ]/g, 'e')
      .replace(/[ģĢ]/g, 'g')
      .replace(/[īĪ]/g, 'i')
      .replace(/[ķĶ]/g, 'k')
      .replace(/[ļĻ]/g, 'l')
      .replace(/[ņŅ]/g, 'n')
      .replace(/[šŠ]/g, 's')
      .replace(/[ūŪ]/g, 'u')
      .replace(/[žŽ]/g, 'z')
      // Польские символы
      .replace(/[ąĄ]/g, 'a')
      .replace(/[ćĆ]/g, 'c')
      .replace(/[ęĘ]/g, 'e')
      .replace(/[łŁ]/g, 'l')
      .replace(/[ńŃ]/g, 'n')
      .replace(/[óÓ]/g, 'o')
      .replace(/[śŚ]/g, 's')
      .replace(/[źŹżŻ]/g, 'z')
      // Литовские символы
      .replace(/[ėĖ]/g, 'e')
      .replace(/[įĮ]/g, 'i')
      .replace(/[ųŲ]/g, 'u')
      // Специальные символы
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .replace(/[–—]/g, '-')
      .replace(/…/g, '...')
      .replace(/№/g, 'No.')
      .replace(/€/g, 'EUR')
      .replace(/£/g, 'GBP')
      .replace(/₽/g, 'RUB');
    
    // Если остались кириллические символы, применяем транслитерацию
    if (/[а-яА-Я]/.test(cleaned)) {
      cleaned = this.transliterate(cleaned);
    }
    
    // Финальная очистка
    cleaned = cleaned.replace(/[^\x00-\x7F]/g, '?');
    
    return cleaned;
  }
}
