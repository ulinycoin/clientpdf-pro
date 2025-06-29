/**
 * 🎨 Элегантная система шрифтов для PDF
 * Решает проблему поддержки международных языков
 */

// 🌍 Web-safe шрифты с Unicode поддержкой
const WEB_SAFE_FONTS = {
  // Универсальные системные шрифты
  universal: [
    'Arial Unicode MS',
    'Lucida Sans Unicode', 
    'Tahoma',
    'Verdana',
    'Georgia'
  ],
  
  // Кириллица
  cyrillic: [
    'Arial',
    'Times New Roman', 
    'Calibri',
    'Segoe UI',
    'DejaVu Sans'
  ],
  
  // CJK (Chinese, Japanese, Korean)
  cjk: [
    'Microsoft YaHei',
    'SimSun',
    'Arial Unicode MS',
    'Malgun Gothic',
    'Yu Gothic'
  ],
  
  // Арабский
  arabic: [
    'Arial Unicode MS',
    'Tahoma',
    'Microsoft Sans Serif',
    'Segoe UI'
  ]
};

// 🎯 Встроенные Base64 шрифты (мини-версии)
const EMBEDDED_FONTS = {
  // Минимальная поддержка кириллицы (только основные символы)
  cyrillicBasic: {
    name: 'CyrillicBasic',
    data: null, // Будет загружен динамически
    supports: ['ru', 'lv', 'lt', 'bg', 'sr']
  },
  
  // Базовая латынь с диакритикой
  latinExtended: {
    name: 'LatinExtended', 
    data: null,
    supports: ['en', 'de', 'fr', 'es', 'it', 'pl']
  }
};

export interface FontSolution {
  primary: string;
  fallback: string[];
  embedded?: string;
  webFontUrl?: string;
  strategy: 'system' | 'web' | 'embedded';
}

/**
 * 🔧 Получить лучшее решение шрифта для языка
 */
export async function getBestFontSolution(
  language: string, 
  script: string
): Promise<FontSolution> {
  
  // 1️⃣ Сначала пробуем системные шрифты
  const systemFonts = getSystemFonts(script);
  const availableSystem = await checkSystemFontAvailability(systemFonts);
  
  if (availableSystem.length > 0) {
    return {
      primary: availableSystem[0],
      fallback: availableSystem.slice(1),
      strategy: 'system'
    };
  }
  
  // 2️⃣ Пробуем web-safe шрифты
  const webSafeFonts = WEB_SAFE_FONTS.universal;
  const availableWebSafe = await checkSystemFontAvailability(webSafeFonts);
  
  if (availableWebSafe.length > 0) {
    return {
      primary: availableWebSafe[0],
      fallback: availableWebSafe.slice(1),
      strategy: 'system'
    };
  }
  
  // 3️⃣ Используем Google Fonts как fallback
  const googleFont = getGoogleFontForScript(script);
  if (googleFont) {
    return {
      primary: googleFont.family,
      fallback: ['Arial', 'sans-serif'],
      webFontUrl: googleFont.url,
      strategy: 'web'
    };
  }
  
  // 4️⃣ Крайний случай - встроенный шрифт
  return {
    primary: 'Arial',
    fallback: ['sans-serif'],
    embedded: getEmbeddedFontForScript(script),
    strategy: 'embedded'
  };
}

/**
 * 🔍 Проверка доступности системных шрифтов
 */
async function checkSystemFontAvailability(fonts: string[]): Promise<string[]> {
  const available: string[] = [];
  
  for (const font of fonts) {
    try {
      // Создаем тестовый элемент
      const testElement = document.createElement('div');
      testElement.style.fontFamily = `"${font}", monospace`;
      testElement.style.fontSize = '12px';
      testElement.style.position = 'absolute';
      testElement.style.visibility = 'hidden';
      testElement.textContent = 'Test';
      
      document.body.appendChild(testElement);
      
      // Измеряем ширину с базовым шрифтом
      testElement.style.fontFamily = 'monospace';
      const baseWidth = testElement.offsetWidth;
      
      // Измеряем ширину с тестируемым шрифтом
      testElement.style.fontFamily = `"${font}", monospace`;
      const testWidth = testElement.offsetWidth;
      
      document.body.removeChild(testElement);
      
      // Если ширина изменилась, шрифт доступен
      if (baseWidth !== testWidth) {
        available.push(font);
      }
    } catch (error) {
      console.warn(`Font check failed for ${font}:`, error);
    }
  }
  
  return available;
}

/**
 * 🌐 Google Fonts для разных скриптов
 */
function getGoogleFontForScript(script: string): { family: string; url: string } | null {
  const googleFonts = {
    latin: {
      family: 'Inter',
      url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap'
    },
    cyrillic: {
      family: 'Roboto',
      url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&subset=cyrillic&display=swap'
    },
    cjk: {
      family: 'Noto Sans SC',
      url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap'
    },
    arabic: {
      family: 'Noto Sans Arabic',
      url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;700&display=swap'
    }
  };
  
  return googleFonts[script as keyof typeof googleFonts] || googleFonts.latin;
}

/**
 * 📦 Получить встроенный шрифт для скрипта
 */
function getEmbeddedFontForScript(script: string): string | undefined {
  const embeddings = {
    cyrillic: 'cyrillicBasic',
    latin: 'latinExtended'
  };
  
  return embeddings[script as keyof typeof embeddings];
}

/**
 * 🎯 Получить системные шрифты для скрипта
 */
function getSystemFonts(script: string): string[] {
  return WEB_SAFE_FONTS[script as keyof typeof WEB_SAFE_FONTS] || WEB_SAFE_FONTS.universal;
}

/**
 * 🔄 Динамическая загрузка Google Font
 */
export async function loadGoogleFont(fontUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Проверяем, не загружен ли уже
    const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
    if (existingLink) {
      resolve(true);
      return;
    }
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontUrl;
    
    link.onload = () => {
      console.log('✅ Google Font loaded successfully');
      resolve(true);
    };
    
    link.onerror = () => {
      console.warn('❌ Failed to load Google Font');
      resolve(false);
    };
    
    document.head.appendChild(link);
    
    // Timeout fallback
    setTimeout(() => resolve(false), 5000);
  });
}

/**
 * 🎨 Применить шрифтовое решение к PDF опциям
 */
export function applyFontSolutionToPDF(
  pdfOptions: any, 
  fontSolution: FontSolution,
  text: string
): any {
  
  // Проверяем поддержку символов
  const hasUnicodeChars = /[^\u0000-\u00FF]/.test(text);
  
  if (hasUnicodeChars && fontSolution.strategy === 'system') {
    // Для Unicode используем более надежные шрифты
    return {
      ...pdfOptions,
      fontFamily: fontSolution.primary,
      fontFallback: fontSolution.fallback,
      // Дополнительные опции для Unicode
      useSystemFonts: true,
      embedFonts: false, // Не встраиваем, используем системные
      unicodeSupport: true
    };
  }
  
  return {
    ...pdfOptions,
    fontFamily: fontSolution.primary,
    fontFallback: fontSolution.fallback,
    embedFonts: fontSolution.strategy === 'embedded'
  };
}

/**
 * 🧪 Тестирование поддержки символов
 */
export function testFontSupport(fontFamily: string, testText: string): boolean {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    
    // Тестируем отрисовку символов
    ctx.font = `12px "${fontFamily}"`;
    const metrics1 = ctx.measureText(testText);
    
    ctx.font = '12px monospace';
    const metrics2 = ctx.measureText(testText);
    
    // Если ширина разная, шрифт поддерживает символы
    return Math.abs(metrics1.width - metrics2.width) > 1;
  } catch {
    return false;
  }
}

/**
 * 🎯 Получить оптимальные настройки для PDF с учетом шрифтов
 */
export async function getOptimalFontSettings(
  language: string,
  script: string, 
  csvData: string[][]
): Promise<{
  fontSolution: FontSolution;
  pdfOptions: any;
  recommendations: string[];
}> {
  
  const sampleText = csvData.flat().slice(0, 10).join(' ');
  const fontSolution = await getBestFontSolution(language, script);
  
  // Загружаем web шрифт если нужно
  if (fontSolution.webFontUrl) {
    await loadGoogleFont(fontSolution.webFontUrl);
  }
  
  const recommendations: string[] = [];
  
  // Генерируем рекомендации
  if (fontSolution.strategy === 'web') {
    recommendations.push(`📡 Using web font: ${fontSolution.primary}`);
  } else if (fontSolution.strategy === 'system') {
    recommendations.push(`💻 Using system font: ${fontSolution.primary}`);
  } else {
    recommendations.push(`📦 Using embedded font for better compatibility`);
  }
  
  const pdfOptions = applyFontSolutionToPDF({}, fontSolution, sampleText);
  
  return {
    fontSolution,
    pdfOptions,
    recommendations
  };
}

export default {
  getBestFontSolution,
  loadGoogleFont,
  applyFontSolutionToPDF,
  testFontSupport,
  getOptimalFontSettings
};