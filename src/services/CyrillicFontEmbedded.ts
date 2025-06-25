/**
 * CyrillicFontEmbedded.ts - Встроенные шрифты с поддержкой кириллицы
 * Содержит base64-encoded TTF шрифты для оффлайн использования
 */

import { jsPDF } from 'jspdf';

export interface EmbeddedFontResult {
  success: boolean;
  fontName: string;
  method: string;
}

export class CyrillicFontEmbedded {
  // Минимальный TTF шрифт с кириллицей (DejaVu Sans - урезанная версия)
  // В реальном проекте здесь должен быть полный base64 шрифт
  private static readonly DEJAVU_CYRILLIC_BASE64 = `
    // TODO: Вставить реальный base64 TTF шрифт с кириллицей
    // Для демонстрации используем заглушку
    ""
  `;

  // Простой шрифт PT Sans (можно скачать с Google Fonts и конвертировать)
  private static readonly PT_SANS_BASE64 = `
    // TODO: base64 данные PT Sans TTF
    ""
  `;

  /**
   * Список встроенных шрифтов с кириллицей
   */
  private static readonly EMBEDDED_FONTS = new Map<string, string>([
    ['DejaVu-Cyrillic', CyrillicFontEmbedded.DEJAVU_CYRILLIC_BASE64],
    ['PT-Sans', CyrillicFontEmbedded.PT_SANS_BASE64],
  ]);

  /**
   * Добавление встроенного кириллического шрифта в PDF
   */
  public static addEmbeddedCyrillicFont(pdf: jsPDF, fontName: string = 'DejaVu-Cyrillic'): EmbeddedFontResult {
    const base64Font = this.EMBEDDED_FONTS.get(fontName);
    
    if (!base64Font || base64Font.trim() === '""' || base64Font.trim() === '') {
      console.warn(`❌ Embedded font ${fontName} not available`);
      return {
        success: false,
        fontName: 'helvetica',
        method: 'Embedded font not found'
      };
    }

    try {
      // Добавляем шрифт в jsPDF
      const fontFileName = `${fontName}.ttf`;
      pdf.addFileToVFS(fontFileName, base64Font);
      pdf.addFont(fontFileName, fontName, 'normal');
      
      // Устанавливаем как текущий шрифт
      pdf.setFont(fontName, 'normal');
      
      console.log(`✅ Embedded Cyrillic font ${fontName} added successfully`);
      return {
        success: true,
        fontName: fontName,
        method: 'Embedded TTF font'
      };
    } catch (error) {
      console.error(`❌ Failed to add embedded font ${fontName}:`, error);
      return {
        success: false,
        fontName: 'helvetica',
        method: 'Embedded font failed'
      };
    }
  }

  /**
   * Генерация base64 шрифта из TTF файла (для разработчиков)
   */
  public static async generateBase64FromTTF(ttfFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(ttfFile);
    });
  }

  /**
   * Получение списка доступных встроенных шрифтов
   */
  public static getAvailableEmbeddedFonts(): string[] {
    return Array.from(this.EMBEDDED_FONTS.keys());
  }
}
