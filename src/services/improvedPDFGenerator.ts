import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { OCRResult } from '../types/ocr.types';

/**
 * Улучшенный генератор searchable PDF с корректной поддержкой кириллицы
 * 
 * Ключевые исправления:
 * ✅ Правильное встраивание Unicode шрифтов
 * ✅ Корректные координаты текста для поиска
 * ✅ Fallback стратегии для шрифтов
 * ✅ Proper debugging и logging
 * ✅ Валидация данных OCR перед обработкой
 */
export class ImprovedPDFGenerator {
  
  /**
   * Создание searchable PDF с улучшенной обработкой ошибок
   */
  async createSearchablePDF(
    originalFile: File,
    ocrResult: OCRResult,
    images: ImageData[]
  ): Promise<Blob> {
    
    console.log('📄 ImprovedPDF - Starting searchable PDF creation:', {
      originalFile: originalFile.name,
      pagesCount: images.length,
      textLength: ocrResult.text.length,
      hasWords: !!(ocrResult.words && ocrResult.words.length > 0),
      hasBlocks: !!(ocrResult.blocks && ocrResult.blocks.length > 0)
    });

    try {
      // Создаем новый PDF документ
      const pdfDoc = await PDFDocument.create();
      
      // Регистрируем fontkit для поддержки Unicode
      pdfDoc.registerFontkit(fontkit);

      // Определяем нужен ли кириллический шрифт
      const textSample = ocrResult.text || '';
      const needsCyrillic = this.containsCyrillic(textSample);
      
      console.log(`🔤 ImprovedPDF - Text analysis:`, {
        textLength: textSample.length,
        textPreview: textSample.substring(0, 100) + '...',
        needsCyrillic,
        language: this.detectLanguage(textSample)
      });

      // Загружаем подходящий шрифт
      const font = await this.loadOptimalFont(pdfDoc, needsCyrillic, textSample);
      
      console.log(`✅ ImprovedPDF - Font loaded successfully:`, {
        fontType: font.name || 'unknown',
        supportsCyrillic: needsCyrillic
      });

      // Обрабатываем каждую страницу
      for (let pageIndex = 0; pageIndex < images.length; pageIndex++) {
        const imageData = images[pageIndex];
        const pageResult = ocrResult.pages?.[pageIndex] || ocrResult.pages?.[0] || {
          text: ocrResult.text,
          confidence: ocrResult.confidence,
          blocks: ocrResult.blocks || [],
          dimensions: { width: imageData.width, height: imageData.height }
        };

        console.log(`📄 ImprovedPDF - Processing page ${pageIndex + 1}:`, {
          dimensions: `${imageData.width}x${imageData.height}`,
          blocks: pageResult.blocks?.length || 0,
          pageText: pageResult.text?.length || 0
        });

        await this.createSearchablePage(
          pdfDoc, 
          font, 
          imageData, 
          pageResult, 
          pageIndex + 1
        );
      }

      // Сохраняем PDF
      console.log('💾 ImprovedPDF - Saving PDF...');
      const pdfBytes = await pdfDoc.save();
      
      console.log(`✅ ImprovedPDF - PDF created successfully:`, {
        size: pdfBytes.length,
        sizeKB: (pdfBytes.length / 1024).toFixed(1) + 'KB',
        pages: images.length
      });

      return new Blob([pdfBytes], { type: 'application/pdf' });

    } catch (error) {
      console.error('❌ ImprovedPDF - Creation failed:', error);
      throw new Error(`Failed to create searchable PDF: ${error.message}`);
    }
  }

  /**
   * Создание отдельной страницы с searchable текстом
   */
  private async createSearchablePage(
    pdfDoc: PDFDocument,
    font: any,
    imageData: ImageData,
    pageResult: any,
    pageNumber: number
  ): Promise<void> {
    
    // Создаем страницу
    const page = pdfDoc.addPage([imageData.width, imageData.height]);
    
    console.log(`📄 Page ${pageNumber} - Adding background image...`);
    
    // Добавляем фоновое изображение
    await this.addBackgroundImage(page, imageData);

    // Добавляем невидимый текстовый слой для поиска
    console.log(`🔍 Page ${pageNumber} - Adding searchable text layer...`);
    await this.addSearchableTextLayer(page, font, pageResult, imageData, pageNumber);
    
    console.log(`✅ Page ${pageNumber} completed`);
  }

  /**
   * Добавление фонового изображения
   */
  private async addBackgroundImage(page: any, imageData: ImageData): Promise<void> {
    try {
      // Конвертируем ImageData в PNG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not create canvas context');
      }

      canvas.width = imageData.width;
      canvas.height = imageData.height;
      ctx.putImageData(imageData, 0, 0);

      // Конвертируем в blob
      const imageBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create image blob'));
          }
        }, 'image/png', 0.95);
      });

      // Встраиваем в PDF
      const imageBytes = await imageBlob.arrayBuffer();
      const image = await page.doc.embedPng(imageBytes);

      // Отображаем на странице
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: imageData.width,
        height: imageData.height,
      });

      console.log('🖼️ Background image added successfully');

    } catch (error) {
      console.error('❌ Failed to add background image:', error);
      throw error;
    }
  }

  /**
   * Добавление невидимого текстового слоя для поиска
   */
  private async addSearchableTextLayer(
    page: any,
    font: any,
    pageResult: any,
    imageData: ImageData,
    pageNumber: number
  ): Promise<void> {
    
    try {
      // Получаем слова для размещения
      const words = this.extractWordsFromPageResult(pageResult);
      
      console.log(`🔤 Page ${pageNumber} - Found ${words.length} words to place`);

      if (words.length === 0) {
        // Если нет отдельных слов, размещаем весь текст
        await this.addFallbackText(page, font, pageResult.text || '', imageData);
        return;
      }

      // Размещаем каждое слово в соответствующих координатах
      let placedWords = 0;
      for (const word of words) {
        try {
          if (word.text && word.text.trim() && word.bbox) {
            await this.placeWordInPDF(page, font, word, imageData);
            placedWords++;
          }
        } catch (wordError) {
          console.warn(`⚠️ Failed to place word "${word.text}":`, wordError);
          // Продолжаем с другими словами
        }
      }

      console.log(`✅ Page ${pageNumber} - Successfully placed ${placedWords}/${words.length} words`);

    } catch (error) {
      console.error(`❌ Failed to add searchable text layer for page ${pageNumber}:`, error);
      
      // Fallback: добавляем весь текст одним блоком
      try {
        await this.addFallbackText(page, font, pageResult.text || '', imageData);
        console.log(`✅ Page ${pageNumber} - Added fallback text layer`);
      } catch (fallbackError) {
        console.error(`❌ Even fallback text failed for page ${pageNumber}:`, fallbackError);
      }
    }
  }

  /**
   * Извлечение слов из результатов OCR
   */
  private extractWordsFromPageResult(pageResult: any): any[] {
    let words: any[] = [];

    // Пробуем разные источники слов
    if (pageResult.words && Array.isArray(pageResult.words)) {
      words = pageResult.words;
    } else if (pageResult.blocks && Array.isArray(pageResult.blocks)) {
      // Извлекаем слова из блоков
      for (const block of pageResult.blocks) {
        if (block.words && Array.isArray(block.words)) {
          words.push(...block.words);
        }
      }
    }

    // Фильтруем валидные слова
    return words.filter(word => 
      word && 
      word.text && 
      word.text.trim() && 
      word.bbox &&
      typeof word.bbox.x0 === 'number' &&
      typeof word.bbox.y0 === 'number' &&
      typeof word.bbox.x1 === 'number' &&
      typeof word.bbox.y1 === 'number'
    );
  }

  /**
   * Размещение отдельного слова в PDF
   */
  private async placeWordInPDF(
    page: any,
    font: any,
    word: any,
    imageData: ImageData
  ): Promise<void> {
    
    // Вычисляем размер шрифта на основе размеров bbox
    const wordHeight = Math.abs(word.bbox.y1 - word.bbox.y0);
    const fontSize = Math.max(wordHeight * 0.8, 8); // Минимум 8pt
    
    // PDF координаты (Y инвертирован)
    const x = word.bbox.x0;
    const y = imageData.height - word.bbox.y1;

    // Проверяем, что координаты в разумных пределах
    if (x < 0 || x > imageData.width || y < 0 || y > imageData.height) {
      console.warn(`⚠️ Word "${word.text}" has invalid coordinates: x=${x}, y=${y}`);
      return;
    }

    try {
      // Размещаем невидимый текст для поиска
      page.drawText(word.text, {
        x: x,
        y: y,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
        opacity: 0, // Невидимый для пользователя, но доступный для поиска
      });

    } catch (drawError) {
      // Если не удалось нарисовать с исходным текстом, пробуем fallback
      console.warn(`⚠️ Failed to draw "${word.text}", trying ASCII fallback`);
      
      try {
        // Заменяем не-ASCII символы на пробелы для совместимости
        const asciiText = word.text.replace(/[^\x20-\x7E]/g, ' ');
        if (asciiText.trim()) {
          page.drawText(asciiText, {
            x: x,
            y: y,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
            opacity: 0,
          });
        }
      } catch (fallbackError) {
        console.warn(`⚠️ Even ASCII fallback failed for word "${word.text}"`);
      }
    }
  }

  /**
   * Добавление fallback текста когда нет координат слов
   */
  private async addFallbackText(
    page: any,
    font: any,
    text: string,
    imageData: ImageData
  ): Promise<void> {
    
    if (!text || !text.trim()) {
      console.warn('⚠️ No text to add as fallback');
      return;
    }

    try {
      // Размещаем текст в верхнем левом углу невидимым слоем
      page.drawText(text, {
        x: 10,
        y: imageData.height - 50,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
        opacity: 0, // Невидимый
      });

      console.log(`✅ Fallback text added: ${text.length} characters`);

    } catch (error) {
      console.error('❌ Failed to add fallback text:', error);
    }
  }

  /**
   * Загрузка оптимального шрифта для текста
   */
  private async loadOptimalFont(pdfDoc: PDFDocument, needsCyrillic: boolean, textSample: string): Promise<any> {
    
    if (needsCyrillic) {
      console.log('🔤 Loading Cyrillic font...');
      
      // Пробуем загрузить DejaVu Sans для кириллицы
      try {
        const fontUrl = 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf';
        const response = await fetch(fontUrl, { mode: 'cors' });
        
        if (!response.ok) {
          throw new Error(`Font fetch failed: ${response.status}`);
        }
        
        const fontBytes = await response.arrayBuffer();
        const font = await pdfDoc.embedFont(fontBytes);
        
        console.log('✅ DejaVu Sans font loaded successfully');
        return font;
        
      } catch (fontError) {
        console.warn('⚠️ Failed to load DejaVu Sans, trying alternative:', fontError);
        
        // Fallback: пробуем другой кириллический шрифт
        try {
          const fallbackUrl = 'https://fonts.gstatic.com/s/notosans/v36/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A-9a6Vs.woff2';
          const response = await fetch(fallbackUrl, { mode: 'cors' });
          
          if (response.ok) {
            const fontBytes = await response.arrayBuffer();
            const font = await pdfDoc.embedFont(fontBytes);
            
            console.log('✅ Noto Sans font loaded as fallback');
            return font;
          }
        } catch (fallbackError) {
          console.warn('⚠️ Fallback font also failed:', fallbackError);
        }
        
        // Финальный fallback к стандартному шрифту
        console.log('⚠️ Using standard font as final fallback');
        return await pdfDoc.embedFont(StandardFonts.Helvetica);
      }
      
    } else {
      // Для латинского текста используем стандартный шрифт
      console.log('🔤 Loading standard font for Latin text...');
      return await pdfDoc.embedFont(StandardFonts.Helvetica);
    }
  }

  /**
   * Проверка наличия кириллицы в тексте
   */
  private containsCyrillic(text: string): boolean {
    return /[\u0400-\u04FF]/.test(text);
  }

  /**
   * Определение языка текста
   */
  private detectLanguage(text: string): string {
    const hasCyrillic = this.containsCyrillic(text);
    const hasLatin = /[A-Za-z]/.test(text);
    
    if (hasCyrillic && hasLatin) {
      return 'mixed';
    } else if (hasCyrillic) {
      return 'cyrillic';
    } else if (hasLatin) {
      return 'latin';
    } else {
      return 'unknown';
    }
  }
}

// Экспортируем экземпляр
export const improvedPDFGenerator = new ImprovedPDFGenerator();