import { PDFDocument, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export interface CyrillicFontInfo {
  name: string;
  displayName: string;
  supportsCyrillic: boolean;
  isStandard: boolean;
  url?: string;
  fallbackUrl?: string;
  googleFontsUrl?: string;
  isEmbedded?: boolean;
  priority: number; // 1 = highest priority for Cyrillic
  fileSize?: number; // KB
}

export interface FontLoadResult {
  font: any;
  fontName: string;
  supportsCyrillic: boolean;
  source: 'standard' | 'external' | 'embedded' | 'google-fonts' | 'browser-fallback';
  actualFontFamily?: string;
}

export interface CyrillicFontLoadOptions {
  preferredFontFamily?: string;
  allowFallback: boolean;
  requireCyrillic: boolean;
  documentType: 'mixed' | 'cyrillic-only' | 'latin-only';
  userAgent?: string;
}

/**
 * Динамический менеджер шрифтов с поддержкой кириллицы
 * 
 * Возможности:
 * - Автоматическая загрузка Web Fonts из CDN и Google Fonts
 * - Интеллектуальный fallback для разных браузеров и ОС
 * - Кэширование загруженных шрифтов
 * - Специальная обработка смешанных документов (кириллица + латиница)
 * - Проверка поддержки Unicode на уровне браузера
 */
export class DynamicFontManager {
  private static instance: DynamicFontManager;
  private fontCache = new Map<string, any>();
  private fontTestCache = new Map<string, boolean>();
  private webFontLoadPromises = new Map<string, Promise<FontFace>>();
  
  // Максимальное время ожидания загрузки шрифта
  private readonly FONT_LOAD_TIMEOUT = 10000; // 10 секунд
  
  static getInstance(): DynamicFontManager {
    if (!this.instance) {
      this.instance = new DynamicFontManager();
    }
    return this.instance;
  }

  /**
   * Расширенная база шрифтов с поддержкой кириллицы
   * Включает CDN источники и Google Fonts
   */
  private readonly cyrillicFonts: { [key: string]: CyrillicFontInfo } = {
    // Стандартные PDF шрифты (без кириллицы)
    'Helvetica': {
      name: 'Helvetica',
      displayName: 'Helvetica',
      supportsCyrillic: false,
      isStandard: true,
      priority: 10
    },
    'Times-Roman': {
      name: 'Times-Roman',
      displayName: 'Times New Roman',
      supportsCyrillic: false,
      isStandard: true,
      priority: 10
    },
    'Courier': {
      name: 'Courier',
      displayName: 'Courier',
      supportsCyrillic: false,
      isStandard: true,
      priority: 10
    },

    // Высокоприоритетные шрифты для кириллицы
    'DejaVu-Sans': {
      name: 'DejaVu-Sans',
      displayName: 'DejaVu Sans',
      supportsCyrillic: true,
      isStandard: false,
      priority: 1,
      url: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf',
      fallbackUrl: 'https://github.com/dejavu-fonts/dejavu-fonts/raw/master/ttf/DejaVuSans.ttf',
      fileSize: 757 // KB
    },

    'PT-Sans': {
      name: 'PT-Sans',
      displayName: 'PT Sans',
      supportsCyrillic: true,
      isStandard: false,
      priority: 2,
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap',
      url: 'https://fonts.gstatic.com/s/ptsans/v17/jizaRExUiTo99u79D0KEwA.woff2',
      fileSize: 45 // KB
    },

    'Noto-Sans': {
      name: 'Noto-Sans',
      displayName: 'Noto Sans',
      supportsCyrillic: true,
      isStandard: false,
      priority: 3,
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap',
      url: 'https://fonts.gstatic.com/s/notosans/v36/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A-9a6Vs.woff2',
      fileSize: 120 // KB
    },

    'Roboto': {
      name: 'Roboto',
      displayName: 'Roboto',
      supportsCyrillic: true,
      isStandard: false,
      priority: 4,
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap',
      url: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
      fileSize: 85 // KB
    },

    'Source-Sans-Pro': {
      name: 'Source-Sans-Pro',
      displayName: 'Source Sans Pro',
      supportsCyrillic: true,
      isStandard: false,
      priority: 5,
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;700&display=swap',
      url: 'https://fonts.gstatic.com/s/sourcesanspro/v22/6xK3dSBYKcSV-LCoeQqfX1RYOo3qOK7lujVj9w.woff2',
      fileSize: 78 // KB
    },

    // Эмбеддед шрифт как последний fallback
    'Embedded-Cyrillic': {
      name: 'Embedded-Cyrillic',
      displayName: 'Embedded Cyrillic',
      supportsCyrillic: true,
      isStandard: false,
      isEmbedded: true,
      priority: 9
    }
  };

  /**
   * Проверка поддержки кириллицы в браузере пользователя
   */
  private async checkBrowserCyrillicSupport(): Promise<{
    hasSystemCyrillicFonts: boolean;
    detectedFonts: string[];
    recommendedStrategy: 'system' | 'web-fonts' | 'embedded';
  }> {
    const testText = 'Тест Кириллицы'; // Тестовый текст на кириллице
    const testFonts = [
      'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 
      'PT Sans', 'Roboto', 'DejaVu Sans', 'Liberation Sans'
    ];

    const detectedFonts: string[] = [];
    
    // Создаем canvas для тестирования отображения шрифтов
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return {
        hasSystemCyrillicFonts: false,
        detectedFonts: [],
        recommendedStrategy: 'web-fonts'
      };
    }

    canvas.width = 300;
    canvas.height = 100;

    // Базовое измерение с fallback шрифтом
    ctx.font = '20px monospace';
    const baselineWidth = ctx.measureText(testText).width;

    for (const fontName of testFonts) {
      ctx.font = `20px "${fontName}", monospace`;
      const testWidth = ctx.measureText(testText).width;
      
      // Если ширина отличается, значит шрифт доступен и правильно отображает кириллицу
      if (Math.abs(testWidth - baselineWidth) > 2) {
        detectedFonts.push(fontName);
      }
    }

    const hasSystemCyrillicFonts = detectedFonts.length > 0;
    const recommendedStrategy = hasSystemCyrillicFonts ? 'system' : 
                               (detectedFonts.length >= 2) ? 'web-fonts' : 'embedded';

    console.log(`🔍 Browser Cyrillic Support Analysis:`, {
      hasSystemCyrillicFonts,
      detectedFonts,
      recommendedStrategy,
      testText,
      baselineWidth
    });

    return { hasSystemCyrillicFonts, detectedFonts, recommendedStrategy };
  }

  /**
   * Динамическая загрузка Web Font с поддержкой кириллицы
   */
  private async loadWebFont(fontInfo: CyrillicFontInfo): Promise<FontFace> {
    const cacheKey = fontInfo.name;
    
    // Проверяем, есть ли уже загружающийся промис
    if (this.webFontLoadPromises.has(cacheKey)) {
      return await this.webFontLoadPromises.get(cacheKey)!;
    }

    const loadPromise = this.performWebFontLoad(fontInfo);
    this.webFontLoadPromises.set(cacheKey, loadPromise);
    
    try {
      const fontFace = await loadPromise;
      console.log(`✅ Web Font loaded: ${fontInfo.displayName}`);
      return fontFace;
    } catch (error) {
      this.webFontLoadPromises.delete(cacheKey);
      throw error;
    }
  }

  private async performWebFontLoad(fontInfo: CyrillicFontInfo): Promise<FontFace> {
    const urls = [
      fontInfo.url,
      fontInfo.fallbackUrl,
    ].filter(Boolean) as string[];

    let lastError: Error | null = null;

    for (const url of urls) {
      try {
        console.log(`📥 Loading Web Font: ${fontInfo.displayName} from ${url}`);

        // Создаем FontFace с поддержкой кириллицы
        const fontFace = new FontFace(fontInfo.displayName, `url(${url})`, {
          style: 'normal',
          weight: 'normal',
          unicodeRange: 'U+0000-04FF', // Включаем кириллицу U+0400-04FF
        });

        // Загружаем шрифт с таймаутом
        const loadedFont = await Promise.race([
          fontFace.load(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Font load timeout')), this.FONT_LOAD_TIMEOUT)
          )
        ]);

        // Добавляем в системы шрифтов браузера
        document.fonts.add(loadedFont);
        
        // Ждем готовности браузера
        await document.fonts.ready;

        return loadedFont;

      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Failed to load ${fontInfo.displayName} from ${url}:`, error);
      }
    }

    throw new Error(`Failed to load ${fontInfo.displayName}: ${lastError?.message}`);
  }

  /**
   * Загрузка Google Fonts через CSS API
   */
  private async loadGoogleFont(fontInfo: CyrillicFontInfo): Promise<void> {
    if (!fontInfo.googleFontsUrl) {
      throw new Error('No Google Fonts URL provided');
    }

    return new Promise((resolve, reject) => {
      // Проверяем, не загружен ли уже этот шрифт
      const existingLink = document.querySelector(`link[href="${fontInfo.googleFontsUrl}"]`);
      if (existingLink) {
        resolve();
        return;
      }

      // Создаем link элемент для загрузки Google Font
      const link = document.createElement('link');
      link.href = fontInfo.googleFontsUrl;
      link.rel = 'stylesheet';
      link.type = 'text/css';

      link.onload = () => {
        console.log(`✅ Google Font loaded: ${fontInfo.displayName}`);
        
        // Даем время браузеру обработать новый шрифт
        setTimeout(() => resolve(), 500);
      };

      link.onerror = () => {
        reject(new Error(`Failed to load Google Font: ${fontInfo.displayName}`));
      };

      document.head.appendChild(link);

      // Таймаут для загрузки Google Fonts
      setTimeout(() => {
        reject(new Error(`Google Font load timeout: ${fontInfo.displayName}`));
      }, this.FONT_LOAD_TIMEOUT);
    });
  }

  /**
   * Интеллектуальный выбор лучшего шрифта для текста
   */
  async selectBestFont(
    text: string,
    options: CyrillicFontLoadOptions
  ): Promise<CyrillicFontInfo> {
    const needsCyrillic = this.containsCyrillic(text);
    const browserSupport = await this.checkBrowserCyrillicSupport();

    console.log(`🎯 Font Selection for document type: ${options.documentType}`, {
      needsCyrillic,
      requireCyrillic: options.requireCyrillic,
      preferredFamily: options.preferredFontFamily,
      browserStrategy: browserSupport.recommendedStrategy
    });

    // Если предпочтительный шрифт указан, пробуем его использовать
    if (options.preferredFontFamily && this.cyrillicFonts[options.preferredFontFamily]) {
      const preferred = this.cyrillicFonts[options.preferredFontFamily];
      if (!needsCyrillic || preferred.supportsCyrillic) {
        console.log(`🎯 Using preferred font: ${preferred.displayName}`);
        return preferred;
      }
    }

    // Получаем кандидатов и сортируем по приоритету
    const candidates = Object.values(this.cyrillicFonts)
      .filter(font => {
        // Фильтруем по требованиям кириллицы
        if (options.requireCyrillic && !font.supportsCyrillic) {
          return false;
        }
        
        // Для смешанных документов предпочитаем универсальные шрифты
        if (options.documentType === 'mixed' && !font.supportsCyrillic) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Сортировка по приоритету для кириллицы
        if (needsCyrillic) {
          return a.priority - b.priority;
        }
        
        // Для латинского текста предпочитаем стандартные шрифты
        if (a.isStandard && !b.isStandard) return -1;
        if (!a.isStandard && b.isStandard) return 1;
        
        return a.priority - b.priority;
      });

    if (candidates.length === 0) {
      console.warn('⚠️ No suitable fonts found, using Helvetica fallback');
      return this.cyrillicFonts['Helvetica'];
    }

    const selected = candidates[0];
    console.log(`✅ Selected font: ${selected.displayName} (priority: ${selected.priority})`);
    
    return selected;
  }

  /**
   * Главный метод загрузки шрифта для PDF документа
   */
  async loadFont(
    pdfDoc: PDFDocument,
    text: string,
    options: CyrillicFontLoadOptions = {
      allowFallback: true,
      requireCyrillic: false,
      documentType: 'mixed'
    }
  ): Promise<FontLoadResult> {
    
    console.log(`🔄 DynamicFontManager - Loading font for text analysis...`);
    
    // Регистрируем fontkit для поддержки Unicode
    pdfDoc.registerFontkit(fontkit);

    try {
      // Выбираем лучший шрифт
      const selectedFont = await this.selectBestFont(text, options);
      
      // Проверяем кэш
      const cacheKey = `${selectedFont.name}-${Date.now()}`;
      if (this.fontCache.has(cacheKey)) {
        const cached = this.fontCache.get(cacheKey);
        console.log(`✅ Using cached font: ${selectedFont.displayName}`);
        return {
          font: cached,
          fontName: selectedFont.displayName,
          supportsCyrillic: selectedFont.supportsCyrillic,
          source: 'cache'
        } as FontLoadResult;
      }

      let font: any;
      let source: FontLoadResult['source'] = 'standard';

      // Стандартные PDF шрифты
      if (selectedFont.isStandard) {
        font = await this.loadStandardFont(pdfDoc, selectedFont.name);
        source = 'standard';
        
      } 
      // Embedded шрифт
      else if (selectedFont.isEmbedded) {
        font = await this.loadEmbeddedFont(pdfDoc);
        source = 'embedded';
        
      } 
      // Web Fonts (Google Fonts или CDN)
      else {
        try {
          // Пробуем Google Fonts первым (более надежно)
          if (selectedFont.googleFontsUrl) {
            await this.loadGoogleFont(selectedFont);
            
            // После загрузки Google Font, проверяем доступность
            if (await this.testFontAvailability(selectedFont.displayName, text)) {
              font = await this.loadBrowserFont(pdfDoc, selectedFont.displayName);
              source = 'google-fonts';
            } else {
              throw new Error('Google Font not available after loading');
            }
          } else {
            // Загружаем через FontFace API
            await this.loadWebFont(selectedFont);
            font = await this.loadBrowserFont(pdfDoc, selectedFont.displayName);
            source = 'external';
          }
        } catch (webFontError) {
          console.warn(`⚠️ Web font loading failed: ${webFontError.message}`);
          
          // Fallback к embedded шрифту
          if (options.allowFallback) {
            try {
              font = await this.loadEmbeddedFont(pdfDoc);
              source = 'embedded';
              console.log(`✅ Using embedded font fallback`);
            } catch (embeddedError) {
              console.warn(`⚠️ Embedded fallback failed: ${embeddedError.message}`);
              font = await pdfDoc.embedFont(StandardFonts.Helvetica);
              source = 'browser-fallback';
            }
          } else {
            throw webFontError;
          }
        }
      }

      // Кэшируем результат
      this.fontCache.set(cacheKey, font);

      const result: FontLoadResult = {
        font,
        fontName: selectedFont.displayName,
        supportsCyrillic: selectedFont.supportsCyrillic,
        source
      };

      console.log(`✅ Font loaded successfully:`, {
        fontName: result.fontName,
        supportsCyrillic: result.supportsCyrillic,
        source: result.source
      });

      return result;

    } catch (error) {
      console.error(`❌ Font loading failed:`, error);
      
      // Финальный fallback к Helvetica
      const fallbackFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      return {
        font: fallbackFont,
        fontName: 'Helvetica',
        supportsCyrillic: false,
        source: 'browser-fallback'
      };
    }
  }

  /**
   * Загрузка стандартного PDF шрифта
   */
  private async loadStandardFont(pdfDoc: PDFDocument, fontName: string): Promise<any> {
    switch (fontName) {
      case 'Times-Roman':
        return await pdfDoc.embedFont(StandardFonts.TimesRoman);
      case 'Courier':
        return await pdfDoc.embedFont(StandardFonts.Courier);
      case 'Helvetica':
      default:
        return await pdfDoc.embedFont(StandardFonts.Helvetica);
    }
  }

  /**
   * Загрузка шрифта из системы браузера
   */
  private async loadBrowserFont(pdfDoc: PDFDocument, fontFamily: string): Promise<any> {
    // Эта функция требует дальнейшей реализации
    // В текущей версии pdf-lib нет прямой поддержки системных шрифтов
    // Возвращаем fallback к embedded шрифту
    return await this.loadEmbeddedFont(pdfDoc);
  }

  /**
   * Загрузка embedded кириллического шрифта
   */
  private async loadEmbeddedFont(pdfDoc: PDFDocument): Promise<any> {
    try {
      // Пробуем основной CDN
      const response = await fetch('https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf', {
        mode: 'cors',
        cache: 'force-cache'
      });
      
      if (!response.ok) {
        throw new Error(`DejaVu fetch failed: ${response.status}`);
      }
      
      const fontBytes = await response.arrayBuffer();
      return await pdfDoc.embedFont(fontBytes);
      
    } catch (error) {
      console.error('❌ Embedded font loading failed:', error);
      throw new Error('Unable to load Cyrillic font');
    }
  }

  /**
   * Тестирование доступности шрифта в браузере
   */
  private async testFontAvailability(fontFamily: string, testText: string): Promise<boolean> {
    const cacheKey = `${fontFamily}-${testText.substring(0, 20)}`;
    
    if (this.fontTestCache.has(cacheKey)) {
      return this.fontTestCache.get(cacheKey)!;
    }

    try {
      // Используем Canvas для тестирования
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return false;

      canvas.width = 200;
      canvas.height = 50;

      // Тестируем с fallback шрифтом
      ctx.font = '16px monospace';
      const fallbackWidth = ctx.measureText(testText).width;

      // Тестируем с целевым шрифтом
      ctx.font = `16px "${fontFamily}", monospace`;
      const targetWidth = ctx.measureText(testText).width;

      const isAvailable = Math.abs(targetWidth - fallbackWidth) > 1;
      
      this.fontTestCache.set(cacheKey, isAvailable);
      return isAvailable;
      
    } catch (error) {
      console.warn(`Font availability test failed for ${fontFamily}:`, error);
      this.fontTestCache.set(cacheKey, false);
      return false;
    }
  }

  /**
   * Проверка наличия кириллицы в тексте
   */
  containsCyrillic(text: string): boolean {
    return /[\u0400-\u04FF]/.test(text);
  }

  /**
   * Проверка смешанного контента (кириллица + латиница)
   */
  isMixedScript(text: string): boolean {
    const hasCyrillic = /[\u0400-\u04FF]/.test(text);
    const hasLatin = /[A-Za-z]/.test(text);
    return hasCyrillic && hasLatin;
  }

  /**
   * Получение списка доступных шрифтов
   */
  getAvailableFonts(): CyrillicFontInfo[] {
    return Object.values(this.cyrillicFonts);
  }

  /**
   * Получение рекомендаций шрифтов для текста
   */
  getFontRecommendations(text: string): CyrillicFontInfo[] {
    const needsCyrillic = this.containsCyrillic(text);
    const isMixed = this.isMixedScript(text);

    return Object.values(this.cyrillicFonts)
      .filter(font => {
        if (needsCyrillic && !font.supportsCyrillic) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Для смешанных документов приоритет универсальным шрифтам
        if (isMixed) {
          if (a.supportsCyrillic && !b.supportsCyrillic) return -1;
          if (!a.supportsCyrillic && b.supportsCyrillic) return 1;
        }
        
        return a.priority - b.priority;
      });
  }

  /**
   * Очистка кэшей
   */
  clearCache(): void {
    this.fontCache.clear();
    this.fontTestCache.clear();
    this.webFontLoadPromises.clear();
    console.log('🧹 DynamicFontManager - Cache cleared');
  }
}