/**
 * UniversalPdfService.ts - Универсальный сервис для работы с PDF с поддержкой Unicode
 * Обеспечивает единый интерфейс для всех PDF операций с автоматической поддержкой шрифтов
 */

import { jsPDF } from 'jspdf';
import { FontManager } from './FontManager';

export interface PdfTextOptions {
  fontFamily?: 'auto' | 'DejaVuSans' | 'Roboto' | 'NotoSans' | 'times' | 'helvetica';
  fontSize?: number;
  fontStyle?: 'normal' | 'bold' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  maxWidth?: number;
  lineHeight?: number;
}

export interface PdfPageOptions {
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'a3' | 'letter' | 'legal';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface PdfMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
}

export interface PdfTableOptions {
  fontSize?: number;
  headerStyle?: 'normal' | 'bold';
  cellPadding?: number;
  columnWidths?: number[];
  maxWidth?: number;
  headerBackground?: string;
  alternateRowColors?: boolean;
  borderWidth?: number;
}

export class UniversalPdfService {
  private selectedFont: string = 'helvetica';
  private fontSetupComplete: boolean = false;

  /**
   * Создание нового PDF документа с автоматической настройкой шрифтов
   */
  async createDocument(
    pageOptions: PdfPageOptions = {},
    metadata: PdfMetadata = {},
    textSamples: string[] = []
  ): Promise<jsPDF> {
    const pdf = new jsPDF({
      orientation: pageOptions.orientation || 'portrait',
      unit: 'mm',
      format: pageOptions.format || 'a4'
    });

    // Настройка метаданных
    if (Object.keys(metadata).length > 0) {
      pdf.setProperties({
        title: metadata.title || 'PDF Document',
        author: metadata.author || 'ClientPDF Pro',
        subject: metadata.subject || 'Generated PDF with Unicode support',
        keywords: metadata.keywords?.join(', ') || 'PDF, Unicode, ClientPDF',
        creator: metadata.creator || 'ClientPDF Pro - Universal PDF Service'
      });
    }

    // Настройка шрифтов если есть образцы текста
    if (textSamples.length > 0) {
      await this.setupFonts(pdf, textSamples);
    } else {
      // Загружаем базовый Unicode шрифт
      try {
        this.selectedFont = await FontManager.setupFontsForText(pdf, ['Sample text', 'Образец текста', 'Teksta paraugs']);
        this.fontSetupComplete = true;
      } catch (error) {
        console.warn('⚠️ Font setup failed, using fallback font:', error);
        this.selectedFont = 'times';
        pdf.setFont('times', 'normal');
      }
    }

    return pdf;
  }

  /**
   * Настройка шрифтов для PDF документа
   */
  async setupFonts(pdf: jsPDF, textSamples: string[]): Promise<string> {
    try {
      this.selectedFont = await FontManager.setupFontsForText(pdf, textSamples);
      this.fontSetupComplete = true;
      console.log(`✅ Fonts setup completed. Selected: ${this.selectedFont}`);
      return this.selectedFont;
    } catch (error) {
      console.error('❌ Font setup failed:', error);
      this.selectedFont = 'times';
      pdf.setFont('times', 'normal');
      this.fontSetupComplete = true;
      return this.selectedFont;
    }
  }

  /**
   * Добавление текста с автоматической поддержкой Unicode
   */
  async addText(
    pdf: jsPDF,
    text: string,
    x: number,
    y: number,
    options: PdfTextOptions = {}
  ): Promise<void> {
    // Настраиваем шрифты если еще не настроены
    if (!this.fontSetupComplete) {
      await this.setupFonts(pdf, [text]);
    }

    // Определяем шрифт
    let fontFamily = options.fontFamily || this.selectedFont;
    if (options.fontFamily === 'auto') {
      fontFamily = await FontManager.setupFontsForText(pdf, [text]);
    }

    // Применяем настройки текста
    const fontSize = options.fontSize || 12;
    const fontStyle = options.fontStyle || 'normal';
    
    pdf.setFont(fontFamily, fontStyle);
    pdf.setFontSize(fontSize);

    // Добавляем текст с учетом выравнивания
    const align = options.textAlign || 'left';
    const maxWidth = options.maxWidth;

    if (maxWidth && text.length > 50) {
      // Разбиваем длинный текст на строки
      const lines = pdf.splitTextToSize(text, maxWidth);
      const lineHeight = options.lineHeight || fontSize * 0.35;
      
      lines.forEach((line: string, index: number) => {
        const lineY = y + (index * lineHeight);
        this.addSingleLine(pdf, line, x, lineY, align, maxWidth);
      });
    } else {
      this.addSingleLine(pdf, text, x, y, align, maxWidth);
    }
  }

  /**
   * Добавление заголовка с автоматическим форматированием
   */
  async addTitle(
    pdf: jsPDF,
    title: string,
    x: number,
    y: number,
    options: Partial<PdfTextOptions> = {}
  ): Promise<void> {
    const titleOptions: PdfTextOptions = {
      fontSize: 16,
      fontStyle: 'bold',
      textAlign: 'center',
      ...options
    };

    await this.addText(pdf, title, x, y, titleOptions);
  }

  /**
   * Добавление многострочного текста с автоматическим переносом
   */
  async addParagraph(
    pdf: jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    options: PdfTextOptions = {}
  ): Promise<number> {
    if (!this.fontSetupComplete) {
      await this.setupFonts(pdf, [text]);
    }

    const fontSize = options.fontSize || 10;
    const lineHeight = options.lineHeight || fontSize * 0.35;
    
    pdf.setFont(this.selectedFont, options.fontStyle || 'normal');
    pdf.setFontSize(fontSize);

    const lines = pdf.splitTextToSize(text, maxWidth);
    let currentY = y;

    lines.forEach((line: string) => {
      this.addSingleLine(pdf, line, x, currentY, options.textAlign || 'left', maxWidth);
      currentY += lineHeight;
    });

    return currentY; // Возвращаем Y координату после текста
  }

  /**
   * Создание таблицы с поддержкой Unicode
   */
  async createTable(
    pdf: jsPDF,
    headers: string[],
    data: string[][],
    startY: number,
    options: PdfTableOptions = {}
  ): Promise<number> {
    if (!this.fontSetupComplete) {
      const allTexts = [...headers, ...data.flat()];
      await this.setupFonts(pdf, allTexts);
    }

    const fontSize = options.fontSize || 10;
    const cellPadding = options.cellPadding || 2;
    const borderWidth = options.borderWidth || 0.1;
    
    pdf.setFont(this.selectedFont, 'normal');
    pdf.setFontSize(fontSize);

    // Расчет ширин колонок
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margins = 20; // левый и правый отступы
    const tableWidth = options.maxWidth || (pageWidth - margins * 2);
    
    const columnWidths = options.columnWidths || 
      new Array(headers.length).fill(tableWidth / headers.length);

    let currentY = startY;

    // Рисуем заголовки
    if (options.headerBackground) {
      pdf.setFillColor(options.headerBackground);
    }
    
    pdf.setFont(this.selectedFont, options.headerStyle || 'bold');
    
    let currentX = margins;
    headers.forEach((header, index) => {
      const cellWidth = columnWidths[index];
      
      if (options.headerBackground) {
        pdf.rect(currentX, currentY, cellWidth, fontSize + cellPadding * 2, 'F');
      }
      
      if (borderWidth > 0) {
        pdf.setLineWidth(borderWidth);
        pdf.rect(currentX, currentY, cellWidth, fontSize + cellPadding * 2);
      }
      
      // Центрируем текст в ячейке заголовка
      const textX = currentX + cellWidth / 2;
      const textY = currentY + cellPadding + fontSize * 0.7;
      
      this.addSingleLine(pdf, header, textX, textY, 'center', cellWidth - cellPadding * 2);
      currentX += cellWidth;
    });

    currentY += fontSize + cellPadding * 2;

    // Рисуем данные
    pdf.setFont(this.selectedFont, 'normal');
    
    data.forEach((row, rowIndex) => {
      // Альтернативные цвета строк
      if (options.alternateRowColors && rowIndex % 2 === 1) {
        pdf.setFillColor('#f5f5f5');
        pdf.rect(margins, currentY, tableWidth, fontSize + cellPadding * 2, 'F');
      }

      currentX = margins;
      row.forEach((cell, cellIndex) => {
        const cellWidth = columnWidths[cellIndex];
        
        if (borderWidth > 0) {
          pdf.setLineWidth(borderWidth);
          pdf.rect(currentX, currentY, cellWidth, fontSize + cellPadding * 2);
        }
        
        const textX = currentX + cellPadding;
        const textY = currentY + cellPadding + fontSize * 0.7;
        
        this.addSingleLine(pdf, cell, textX, textY, 'left', cellWidth - cellPadding * 2);
        currentX += cellWidth;
      });

      currentY += fontSize + cellPadding * 2;
    });

    return currentY;
  }

  /**
   * Добавление изображения в PDF с подписью
   */
  async addImageWithCaption(
    pdf: jsPDF,
    imageData: string,
    x: number,
    y: number,
    width: number,
    height: number,
    caption?: string,
    captionOptions: PdfTextOptions = {}
  ): Promise<number> {
    // Добавляем изображение
    pdf.addImage(imageData, 'JPEG', x, y, width, height);
    
    let finalY = y + height;

    // Добавляем подпись если есть
    if (caption) {
      const captionY = finalY + 5;
      const captionX = x + width / 2;
      
      const options: PdfTextOptions = {
        fontSize: 9,
        fontStyle: 'italic',
        textAlign: 'center',
        maxWidth: width,
        ...captionOptions
      };

      await this.addText(pdf, caption, captionX, captionY, options);
      finalY = captionY + (options.fontSize || 9) + 5;
    }

    return finalY;
  }

  /**
   * Добавление водяного знака
   */
  async addWatermark(
    pdf: jsPDF,
    text: string,
    options: {
      fontSize?: number;
      opacity?: number;
      angle?: number;
      color?: string;
    } = {}
  ): Promise<void> {
    if (!this.fontSetupComplete) {
      await this.setupFonts(pdf, [text]);
    }

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const fontSize = options.fontSize || 50;
    const opacity = options.opacity || 0.1;
    const angle = options.angle || 45;
    const color = options.color || 'gray';

    // Сохраняем текущее состояние
    pdf.saveGraphicsState();
    
    // Настраиваем прозрачность и цвет
    pdf.setGState(new (pdf as any).GState({ opacity: opacity }));
    pdf.setTextColor(color);
    pdf.setFont(this.selectedFont, 'bold');
    pdf.setFontSize(fontSize);

    // Поворачиваем и позиционируем текст
    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;
    
    pdf.text(text, centerX, centerY, {
      angle: angle,
      align: 'center'
    });

    // Восстанавливаем состояние
    pdf.restoreGraphicsState();
  }

  /**
   * Добавление номеров страниц
   */
  async addPageNumbers(
    pdf: jsPDF,
    position: 'bottom-center' | 'bottom-left' | 'bottom-right' = 'bottom-center',
    format: string = 'Page {current} of {total}',
    options: PdfTextOptions = {}
  ): Promise<void> {
    if (!this.fontSetupComplete) {
      await this.setupFonts(pdf, [format]);
    }

    const totalPages = pdf.getNumberOfPages();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const fontSize = options.fontSize || 10;
    const margin = 15;

    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      const pageText = format
        .replace('{current}', i.toString())
        .replace('{total}', totalPages.toString());

      let x: number;
      const y = pageHeight - margin;

      switch (position) {
        case 'bottom-left':
          x = margin;
          break;
        case 'bottom-right':
          x = pageWidth - margin;
          break;
        case 'bottom-center':
        default:
          x = pageWidth / 2;
          break;
      }

      const textAlign = position === 'bottom-left' ? 'left' : 
                      position === 'bottom-right' ? 'right' : 'center';

      await this.addText(pdf, pageText, x, y, {
        fontSize,
        textAlign,
        ...options
      });
    }
  }

  /**
   * Получение информации о текущем шрифте
   */
  getCurrentFont(): string {
    return this.selectedFont;
  }

  /**
   * Сброс настроек шрифта
   */
  resetFontSettings(): void {
    this.selectedFont = 'helvetica';
    this.fontSetupComplete = false;
  }

  /**
   * Проверка поддержки Unicode для текста
   */
  async analyzeTextSupport(text: string): Promise<{
    unicodeRanges: string[];
    recommendedFont: string;
    requiresSpecialFont: boolean;
  }> {
    const analysis = FontManager.testUnicodeSupport(text);
    const detectedLanguages = FontManager.detectLanguage(text);
    const recommendedFont = FontManager.selectOptimalFont(detectedLanguages);

    return {
      unicodeRanges: analysis.unicodeRanges,
      recommendedFont,
      requiresSpecialFont: analysis.unicodeRanges.length > 0
    };
  }

  /**
   * Добавление одной строки текста с выравниванием
   */
  private addSingleLine(
    pdf: jsPDF,
    text: string,
    x: number,
    y: number,
    align: 'left' | 'center' | 'right' = 'left',
    maxWidth?: number
  ): void {
    if (maxWidth && text.length > 100) {
      // Обрезаем слишком длинный текст
      const truncated = text.substring(0, 97) + '...';
      pdf.text(truncated, x, y, { align });
    } else {
      pdf.text(text, x, y, { align });
    }
  }
}