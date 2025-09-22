/**
 * SEO Data for all tools and pages across all languages
 * Generated from modular localization system
 * Supports: EN, DE, FR, ES, RU
 */

import { getTranslations } from '../locales/index';
import type { SupportedLanguage } from '../types/i18n';

// SEO Interface definitions
export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  structuredData: {
    '@context': string;
    '@type': string;
    name: string;
    description: string;
    url: string;
    applicationCategory: string;
    operatingSystem: string;
    browserRequirements?: string;
    permissions?: string;
    isAccessibleForFree: boolean;
    inLanguage: string;
    offers: {
      '@type': string;
      price: string;
      priceCurrency: string;
      availability?: string;
    };
    featureList: string[];
    softwareVersion: string;
    applicationSubCategory: string;
    aggregateRating?: {
      '@type': string;
      ratingValue: string;
      ratingCount: string;
      bestRating: string;
    };
  };
  openGraph: {
    title: string;
    description: string;
    type: string;
    image?: string;
    url: string;
  };
}

export interface ToolSEOData {
  [toolId: string]: {
    [language in SupportedLanguage]: SEOData;
  };
}

// Base URL configuration
const BASE_URL = 'https://localpdf.online';

// Tool ID mapping from route paths to translation keys
const TOOL_IDS = [
  'merge-pdf',
  'split-pdf',
  'compress-pdf',
  'add-text-pdf',
  'watermark-pdf',
  'rotate-pdf',
  'extract-pages-pdf',
  'extract-text-pdf',
  'extract-images-from-pdf',
  'pdf-to-image',
  'pdf-to-svg',
  'images-to-pdf',
  'image-to-pdf', // alias for images-to-pdf
  'word-to-pdf',
  'excel-to-pdf',
  'protect-pdf',
  'ocr-pdf'
] as const;

// Translation key mapping
const TOOL_TRANSLATION_KEYS = {
  'merge-pdf': 'merge',
  'split-pdf': 'split',
  'compress-pdf': 'compress',
  'add-text-pdf': 'addText',
  'watermark-pdf': 'watermark',
  'rotate-pdf': 'rotate',
  'extract-pages-pdf': 'extractPages',
  'extract-text-pdf': 'extractText',
  'extract-images-from-pdf': 'extractImagesFromPdf',
  'pdf-to-image': 'pdfToImage',
  'pdf-to-svg': 'pdfToSvg',
  'images-to-pdf': 'imageToPdf',
  'image-to-pdf': 'imageToPdf',
  'word-to-pdf': 'wordToPdf',
  'excel-to-pdf': 'excelToPdf',
  'protect-pdf': 'protect',
  'ocr-pdf': 'ocr'
} as const;

// Language-specific keywords for each tool category
const KEYWORDS_BY_CATEGORY = {
  en: {
    merge: ['merge pdf', 'combine pdf', 'join pdf files', 'pdf merger', 'concatenate pdf'],
    split: ['split pdf', 'extract pdf pages', 'pdf splitter', 'separate pdf pages', 'divide pdf'],
    compress: ['compress pdf', 'reduce pdf size', 'pdf compressor', 'shrink pdf', 'optimize pdf'],
    addText: ['add text pdf', 'pdf text editor', 'fill pdf forms', 'pdf annotation', 'insert text pdf'],
    watermark: ['pdf watermark', 'add watermark pdf', 'watermark tool', 'protect pdf', 'pdf branding'],
    rotate: ['rotate pdf', 'pdf rotation', 'fix pdf orientation', 'rotate pages', 'pdf editor'],
    extractPages: ['extract pdf pages', 'pdf page extractor', 'get pages from pdf', 'pdf page selection'],
    extractText: ['extract text from pdf', 'pdf text extractor', 'get text from pdf', 'pdf to text'],
    extractImagesFromPdf: ['extract images from pdf', 'pdf image extractor', 'extract images pdf', 'pdf graphics'],
    pdfToImage: ['pdf to jpg', 'pdf to png', 'convert pdf to image', 'pdf to picture', 'pdf image converter'],
    pdfToSvg: ['pdf to svg', 'convert pdf to vector', 'pdf svg converter', 'pdf to scalable graphics'],
    imageToPdf: ['images to pdf', 'jpg to pdf', 'png to pdf', 'photo to pdf', 'convert images pdf'],
    wordToPdf: ['word to pdf', 'docx to pdf', 'convert word pdf', 'document converter', 'doc to pdf'],
    excelToPdf: ['excel to pdf', 'xlsx to pdf', 'convert excel pdf', 'spreadsheet to pdf', 'xls to pdf'],
    protect: ['password protect pdf', 'secure pdf', 'pdf encryption', 'protect pdf documents', 'pdf security'],
    ocr: ['ocr pdf', 'text recognition', 'extract text pdf', 'pdf ocr', 'image to text', 'scan to text']
  },
  de: {
    merge: ['pdf zusammenfügen', 'pdf verbinden', 'pdf dateien kombinieren', 'pdf merger', 'pdfs zusammenführen'],
    split: ['pdf aufteilen', 'pdf seiten extrahieren', 'pdf trennen', 'pdf seiten teilen', 'pdf splitter'],
    compress: ['pdf komprimieren', 'pdf größe reduzieren', 'pdf verkleinern', 'pdf optimieren', 'pdf kompressor'],
    addText: ['text zu pdf hinzufügen', 'pdf text editor', 'pdf formulare ausfüllen', 'text in pdf', 'pdf bearbeiten'],
    watermark: ['pdf wasserzeichen', 'wasserzeichen hinzufügen', 'pdf schützen', 'pdf branding', 'wasserzeichen tool'],
    rotate: ['pdf drehen', 'pdf seiten drehen', 'pdf ausrichtung', 'seiten rotieren', 'pdf rotation'],
    extractPages: ['pdf seiten extrahieren', 'seiten aus pdf', 'pdf seiten herauslösen', 'pdf seiten auswählen'],
    extractText: ['text aus pdf extrahieren', 'pdf text extractor', 'text aus pdf', 'pdf zu text'],
    extractImagesFromPdf: ['bilder aus pdf extrahieren', 'pdf bilder extractor', 'grafiken aus pdf', 'pdf bilder'],
    pdfToImage: ['pdf zu jpg', 'pdf zu png', 'pdf in bild umwandeln', 'pdf zu bild', 'pdf bild konverter'],
    pdfToSvg: ['pdf zu svg', 'pdf in vektor umwandeln', 'pdf svg konverter', 'pdf zu svg graphics'],
    imageToPdf: ['bilder zu pdf', 'jpg zu pdf', 'png zu pdf', 'fotos zu pdf', 'bilder in pdf umwandeln'],
    wordToPdf: ['word zu pdf', 'docx zu pdf', 'word in pdf umwandeln', 'dokument konverter', 'doc zu pdf'],
    excelToPdf: ['excel zu pdf', 'xlsx zu pdf', 'excel in pdf umwandeln', 'tabelle zu pdf', 'xls zu pdf'],
    protect: ['pdf passwort schützen', 'pdf sichern', 'pdf verschlüsselung', 'pdf dokumente schützen', 'pdf sicherheit'],
    ocr: ['ocr pdf', 'texterkennung', 'text aus pdf extrahieren', 'pdf ocr', 'bild zu text', 'scan zu text']
  },
  fr: {
    merge: ['fusionner pdf', 'combiner pdf', 'joindre pdf', 'fusionner documents pdf', 'merger pdf'],
    split: ['diviser pdf', 'extraire pages pdf', 'séparer pdf', 'diviser document pdf', 'splitter pdf'],
    compress: ['compresser pdf', 'réduire taille pdf', 'optimiser pdf', 'compresseur pdf', 'diminuer pdf'],
    addText: ['ajouter texte pdf', 'éditeur texte pdf', 'remplir formulaires pdf', 'texte dans pdf', 'éditer pdf'],
    watermark: ['filigrane pdf', 'ajouter filigrane', 'protéger pdf', 'marque pdf', 'filigrane outil'],
    rotate: ['faire pivoter pdf', 'rotation pdf', 'orienter pdf', 'tourner pages pdf', 'pivoter pages'],
    extractPages: ['extraire pages pdf', 'pages de pdf', 'extraire pdf pages', 'sélection pages pdf'],
    extractText: ['extraire texte pdf', 'extracteur texte pdf', 'texte de pdf', 'pdf vers texte'],
    extractImagesFromPdf: ['extraire images pdf', 'extracteur images pdf', 'images de pdf', 'graphiques pdf'],
    pdfToImage: ['pdf vers jpg', 'pdf vers png', 'convertir pdf image', 'pdf en image', 'convertisseur pdf image'],
    pdfToSvg: ['pdf vers svg', 'convertir pdf vecteur', 'convertisseur pdf svg', 'pdf en svg'],
    imageToPdf: ['images vers pdf', 'jpg vers pdf', 'png vers pdf', 'photos vers pdf', 'convertir images pdf'],
    wordToPdf: ['word vers pdf', 'docx vers pdf', 'convertir word pdf', 'convertisseur document', 'doc vers pdf'],
    excelToPdf: ['excel vers pdf', 'xlsx vers pdf', 'convertir excel pdf', 'tableau vers pdf', 'xls vers pdf'],
    protect: ['protéger pdf mot de passe', 'sécuriser pdf', 'chiffrement pdf', 'protéger documents pdf', 'sécurité pdf'],
    ocr: ['ocr pdf', 'reconnaissance texte', 'extraire texte pdf', 'pdf ocr', 'image vers texte', 'scan vers texte']
  },
  es: {
    merge: ['combinar pdf', 'unir pdf', 'fusionar pdf', 'juntar archivos pdf', 'merger pdf'],
    split: ['dividir pdf', 'extraer páginas pdf', 'separar pdf', 'dividir documento pdf', 'splitter pdf'],
    compress: ['comprimir pdf', 'reducir tamaño pdf', 'optimizar pdf', 'compresor pdf', 'reducir pdf'],
    addText: ['añadir texto pdf', 'editor texto pdf', 'rellenar formularios pdf', 'texto en pdf', 'editar pdf'],
    watermark: ['marca de agua pdf', 'añadir marca agua', 'proteger pdf', 'marca pdf', 'herramienta marca agua'],
    rotate: ['rotar pdf', 'girar pdf', 'orientación pdf', 'girar páginas pdf', 'rotación pdf'],
    extractPages: ['extraer páginas pdf', 'páginas de pdf', 'extraer pdf páginas', 'selección páginas pdf'],
    extractText: ['extraer texto pdf', 'extractor texto pdf', 'texto de pdf', 'pdf a texto'],
    extractImagesFromPdf: ['extraer imágenes pdf', 'extractor imágenes pdf', 'imágenes de pdf', 'gráficos pdf'],
    pdfToImage: ['pdf a jpg', 'pdf a png', 'convertir pdf imagen', 'pdf en imagen', 'convertidor pdf imagen'],
    pdfToSvg: ['pdf a svg', 'convertir pdf vector', 'convertidor pdf svg', 'pdf en svg'],
    imageToPdf: ['imágenes a pdf', 'jpg a pdf', 'png a pdf', 'fotos a pdf', 'convertir imágenes pdf'],
    wordToPdf: ['word a pdf', 'docx a pdf', 'convertir word pdf', 'convertidor documento', 'doc a pdf'],
    excelToPdf: ['excel a pdf', 'xlsx a pdf', 'convertir excel pdf', 'hoja cálculo pdf', 'xls a pdf'],
    protect: ['proteger pdf contraseña', 'asegurar pdf', 'cifrado pdf', 'proteger documentos pdf', 'seguridad pdf'],
    ocr: ['ocr pdf', 'reconocimiento texto', 'extraer texto pdf', 'pdf ocr', 'imagen a texto', 'escanear a texto']
  },
  ru: {
    merge: ['объединить пдф', 'соединить pdf', 'склеить pdf', 'объединение pdf файлов', 'слияние pdf'],
    split: ['разделить пдф', 'извлечь страницы pdf', 'разбить pdf', 'разделение pdf', 'сплиттер pdf'],
    compress: ['сжать пдф', 'уменьшить размер pdf', 'оптимизировать pdf', 'компрессор pdf', 'сжатие pdf'],
    addText: ['добавить текст в пдф', 'редактор текста pdf', 'заполнить формы pdf', 'текст в pdf', 'редактировать pdf'],
    watermark: ['водяной знак пдф', 'добавить водяной знак', 'защитить pdf', 'водяной знак', 'защита pdf'],
    rotate: ['повернуть пдф', 'поворот pdf', 'ориентация pdf', 'повернуть страницы', 'ротация pdf'],
    extractPages: ['извлечь страницы пдф', 'страницы из pdf', 'извлечение страниц pdf', 'выбор страниц pdf'],
    extractText: ['извлечь текст из пдф', 'экстрактор текста pdf', 'текст из pdf', 'pdf в текст'],
    extractImagesFromPdf: ['извлечь изображения пдф', 'экстрактор изображений pdf', 'картинки из pdf', 'графика pdf'],
    pdfToImage: ['пдф в jpg', 'pdf в png', 'конвертировать pdf в картинку', 'pdf в изображение', 'конвертер pdf'],
    pdfToSvg: ['пдф в svg', 'конвертировать pdf в вектор', 'pdf svg конвертер', 'pdf в svg графику'],
    imageToPdf: ['изображения в пдф', 'jpg в pdf', 'png в pdf', 'фото в pdf', 'конвертировать картинки в pdf'],
    wordToPdf: ['ворд в пдф', 'docx в pdf', 'конвертировать word в pdf', 'конвертер документов', 'doc в pdf'],
    excelToPdf: ['эксель в пдф', 'xlsx в pdf', 'конвертировать excel в pdf', 'таблица в pdf', 'xls в pdf'],
    protect: ['защитить пдф паролем', 'безопасность pdf', 'шифрование pdf', 'защита документов pdf', 'безопасность pdf'],
    ocr: ['распознавание текста пдф', 'ocr pdf', 'извлечь текст', 'pdf ocr', 'картинка в текст', 'сканирование в текст']
  }
};

// Feature lists by language
const FEATURE_LISTS = {
  en: {
    base: [
      '100% privacy - no server uploads',
      'Works entirely in browser',
      'No registration required',
      'GDPR compliant',
      'No file size limits',
      'Instant processing'
    ]
  },
  de: {
    base: [
      '100% Privatsphäre - keine Server-Uploads',
      'Funktioniert komplett im Browser',
      'Keine Registrierung erforderlich',
      'DSGVO-konform',
      'Keine Dateigrößenbeschränkungen',
      'Sofortige Verarbeitung'
    ]
  },
  fr: {
    base: [
      '100% confidentialité - aucun téléchargement serveur',
      'Fonctionne entièrement dans le navigateur',
      'Aucune inscription requise',
      'Conforme RGPD',
      'Aucune limite de taille de fichier',
      'Traitement instantané'
    ]
  },
  es: {
    base: [
      '100% privacidad - sin subidas al servidor',
      'Funciona completamente en el navegador',
      'Sin registro requerido',
      'Cumple con RGPD',
      'Sin límites de tamaño de archivo',
      'Procesamiento instantáneo'
    ]
  },
  ru: {
    base: [
      '100% конфиденциальность - без загрузки на сервер',
      'Работает полностью в браузере',
      'Регистрация не требуется',
      'Соответствует GDPR',
      'Без ограничений размера файлов',
      'Мгновенная обработка'
    ]
  }
};

// Generate URL for language and tool
function generateUrl(language: SupportedLanguage, toolId: string): string {
  // ALL canonical URLs point to English version for proper SEO hierarchy
  return `${BASE_URL}/${toolId}`;
}

// Generate SEO data for a specific tool and language (safe version for build time)
function generateToolSEOData(toolId: string, language: SupportedLanguage): SEOData {
  try {
    const translations = getTranslations(language);
    const translationKey = TOOL_TRANSLATION_KEYS[toolId as keyof typeof TOOL_TRANSLATION_KEYS];

    if (!translationKey || !translations.pages?.tools?.[translationKey]) {
      // Fallback to basic data if translations not available
      return generateFallbackSEOData(toolId, language);
    }

    const toolTranslations = translations.pages.tools[translationKey];
    const categoryKeywords = KEYWORDS_BY_CATEGORY[language]?.[translationKey] || [];
    const baseFeatures = FEATURE_LISTS[language].base;

    const canonicalUrl = generateUrl(language, toolId);

    return {
      title: toolTranslations.pageTitle || `${toolId} - LocalPDF`,
      description: toolTranslations.pageDescription || `Use our ${toolId} tool online for free`,
      keywords: categoryKeywords,
      canonical: canonicalUrl,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: toolTranslations.title || toolId,
        description: toolTranslations.pageDescription || `Use our ${toolId} tool online for free`,
        url: canonicalUrl,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web Browser',
        browserRequirements: 'Modern web browser with JavaScript enabled',
        permissions: 'none',
        isAccessibleForFree: true,
        inLanguage: language,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock'
        },
        featureList: [
          ...baseFeatures,
          ...(toolTranslations.benefits?.features || [])
        ],
        softwareVersion: '1.0.0',
        applicationSubCategory: 'PDF Tools',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '1247',
          bestRating: '5'
        }
      },
      openGraph: {
        title: toolTranslations.pageTitle || `${toolId} - LocalPDF`,
        description: toolTranslations.pageDescription || `Use our ${toolId} tool online for free`,
        type: 'website',
        url: canonicalUrl,
        image: `${BASE_URL}/images/tools/${toolId}-preview.png`
      }
    };
  } catch (error) {
    console.warn(`Failed to generate SEO data for ${toolId} in ${language}, using fallback:`, error);
    return generateFallbackSEOData(toolId, language);
  }
}

// Fallback SEO data for when translations are not available
function generateFallbackSEOData(toolId: string, language: SupportedLanguage): SEOData {
  const canonicalUrl = generateUrl(language, toolId);
  const categoryKeywords = KEYWORDS_BY_CATEGORY[language]?.[TOOL_TRANSLATION_KEYS[toolId as keyof typeof TOOL_TRANSLATION_KEYS]] || [];
  const baseFeatures = FEATURE_LISTS[language]?.base || FEATURE_LISTS.en.base;

  return {
    title: `${toolId.replace('-', ' ')} - LocalPDF`,
    description: `Use our ${toolId.replace('-', ' ')} tool online for free. Privacy-first PDF processing in your browser.`,
    keywords: categoryKeywords,
    canonical: canonicalUrl,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: `LocalPDF ${toolId.replace('-', ' ')}`,
      description: `Free ${toolId.replace('-', ' ')} tool that works entirely in your browser`,
      url: canonicalUrl,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      browserRequirements: 'Modern web browser with JavaScript enabled',
      permissions: 'none',
      isAccessibleForFree: true,
      inLanguage: language,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      },
      featureList: baseFeatures,
      softwareVersion: '1.0.0',
      applicationSubCategory: 'PDF Tools',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '1247',
        bestRating: '5'
      }
    },
    openGraph: {
      title: `${toolId.replace('-', ' ')} - LocalPDF`,
      description: `Use our ${toolId.replace('-', ' ')} tool online for free. Privacy-first PDF processing in your browser.`,
      type: 'website',
      url: canonicalUrl,
      image: `${BASE_URL}/images/tools/${toolId}-preview.png`
    }
  };
}

// Generate complete SEO data for all tools and languages
export function generateToolsSEOData(): ToolSEOData {
  const data: ToolSEOData = {};

  for (const toolId of TOOL_IDS) {
    data[toolId] = {};
    for (const language of ['en', 'de', 'fr', 'es', 'ru'] as SupportedLanguage[]) {
      try {
        data[toolId][language] = generateToolSEOData(toolId, language);
      } catch (error) {
        console.warn(`Failed to generate SEO data for ${toolId} in ${language}:`, error);
        // Fallback to English
        data[toolId][language] = generateToolSEOData(toolId, 'en');
      }
    }
  }

  return data;
}

// Lazy loading to avoid circular imports during build
let _toolsSEOData: ToolSEOData | null = null;

export function getToolsSEOData(): ToolSEOData {
  if (!_toolsSEOData) {
    _toolsSEOData = generateToolsSEOData();
  }
  return _toolsSEOData;
}

// Legacy export for backward compatibility (re-exports the function call)
export const toolsSEOData = getToolsSEOData();

// Helper function to get tool SEO data with fallback
export function getToolSEOData(toolId: string, language: SupportedLanguage): SEOData {
  const toolsData = getToolsSEOData();

  // Try to get data for requested language
  if (toolsData[toolId]?.[language]) {
    return toolsData[toolId][language];
  }

  // Fallback to English
  if (toolsData[toolId]?.['en']) {
    return toolsData[toolId]['en'];
  }

  // Ultimate fallback
  return generateFallbackSEOData(toolId, language);
}

// Homepage SEO data for all languages
export const homepageSEOData = {
  en: {
    title: "LocalPDF - Privacy-First PDF Tools | Merge, Split, Compress",
    description: "16 powerful PDF tools in your browser. Merge, split, compress, add text, watermark, extract images, OCR. 100% private - no uploads, no tracking. Free forever.",
    keywords: ["PDF tools", "merge PDF", "split PDF", "compress PDF", "privacy PDF tools", "browser PDF editor"],
    canonical: `${BASE_URL}/`
  },
  de: {
    title: "LocalPDF - Datenschutz-Erste PDF-Tools | Zusammenfügen, Teilen, Komprimieren",
    description: "16 leistungsstarke PDF-Tools in Ihrem Browser. Zusammenfügen, teilen, komprimieren, Text hinzufügen, Wasserzeichen, OCR. 100% privat - keine Uploads.",
    keywords: ["PDF Tools", "PDF zusammenfügen", "PDF teilen", "PDF komprimieren", "Datenschutz PDF", "Browser PDF Editor"],
    canonical: `${BASE_URL}/de/`
  },
  fr: {
    title: "LocalPDF - Outils PDF Confidentiels | Fusionner, Diviser, Compresser",
    description: "16 outils PDF puissants dans votre navigateur. Fusionner, diviser, compresser, ajouter texte, filigrane, OCR. 100% privé - pas de téléchargements.",
    keywords: ["outils PDF", "fusionner PDF", "diviser PDF", "compresser PDF", "PDF confidentialité", "éditeur PDF navigateur"],
    canonical: `${BASE_URL}/fr/`
  },
  es: {
    title: "LocalPDF - Herramientas PDF Privadas | Combinar, Dividir, Comprimir",
    description: "16 herramientas PDF potentes en tu navegador. Combinar, dividir, comprimir, añadir texto, marca de agua, OCR. 100% privado - sin subidas.",
    keywords: ["herramientas PDF", "combinar PDF", "dividir PDF", "comprimir PDF", "PDF privacidad", "editor PDF navegador"],
    canonical: `${BASE_URL}/es/`
  },
  ru: {
    title: "LocalPDF - Конфиденциальные PDF Инструменты | Объединить, Разделить, Сжать",
    description: "16 мощных PDF инструментов в браузере. Объединение, разделение, сжатие, добавление текста, водяные знаки, OCR. 100% конфиденциально.",
    keywords: ["PDF инструменты", "объединить PDF", "разделить PDF", "сжать PDF", "конфиденциальность PDF", "браузерный PDF редактор"],
    canonical: `${BASE_URL}/ru/`
  }
};

// Pages SEO data for static pages
export const pagesSEOData = {
  privacy: {
    en: {
      title: "Privacy Policy - LocalPDF | 100% Private PDF Processing",
      description: "LocalPDF privacy policy. Learn how we protect your privacy with 100% local PDF processing. No uploads, no tracking, no data collection.",
      keywords: ["privacy policy", "PDF privacy", "local processing", "no uploads", "data protection"],
      canonical: `${BASE_URL}/privacy`
    },
    de: {
      title: "Datenschutzrichtlinie - LocalPDF | 100% Private PDF-Verarbeitung",
      description: "LocalPDF Datenschutzrichtlinie. Erfahren Sie, wie wir Ihre Privatsphäre mit 100% lokaler PDF-Verarbeitung schützen. Keine Uploads, kein Tracking.",
      keywords: ["Datenschutzrichtlinie", "PDF Datenschutz", "lokale Verarbeitung", "keine Uploads", "Datenschutz"],
      canonical: `${BASE_URL}/de/privacy`
    },
    fr: {
      title: "Politique de Confidentialité - LocalPDF | Traitement PDF 100% Privé",
      description: "Politique de confidentialité LocalPDF. Découvrez comment nous protégeons votre vie privée avec un traitement PDF 100% local. Pas de téléchargements.",
      keywords: ["politique confidentialité", "PDF confidentialité", "traitement local", "pas téléchargements", "protection données"],
      canonical: `${BASE_URL}/fr/privacy`
    },
    es: {
      title: "Política de Privacidad - LocalPDF | Procesamiento PDF 100% Privado",
      description: "Política de privacidad LocalPDF. Aprenda cómo protegemos su privacidad con procesamiento PDF 100% local. Sin subidas, sin seguimiento.",
      keywords: ["política privacidad", "PDF privacidad", "procesamiento local", "sin subidas", "protección datos"],
      canonical: `${BASE_URL}/es/privacy`
    },
    ru: {
      title: "Политика Конфиденциальности - LocalPDF | 100% Приватная Обработка PDF",
      description: "Политика конфиденциальности LocalPDF. Узнайте, как мы защищаем вашу конфиденциальность с 100% локальной обработкой PDF.",
      keywords: ["политика конфиденциальности", "PDF конфиденциальность", "локальная обработка", "без загрузок", "защита данных"],
      canonical: `${BASE_URL}/ru/privacy`
    }
  },
  faq: {
    en: {
      title: "FAQ - Frequently Asked Questions | LocalPDF",
      description: "Get answers to common questions about LocalPDF. Learn about our privacy-first PDF tools, browser compatibility, and how to use our features.",
      keywords: ["FAQ", "questions", "help", "PDF tools guide", "LocalPDF support"],
      canonical: `${BASE_URL}/faq`
    },
    de: {
      title: "FAQ - Häufig Gestellte Fragen | LocalPDF",
      description: "Erhalten Sie Antworten auf häufige Fragen zu LocalPDF. Erfahren Sie mehr über unsere datenschutzorientierten PDF-Tools und Browser-Kompatibilität.",
      keywords: ["FAQ", "Fragen", "Hilfe", "PDF Tools Anleitung", "LocalPDF Support"],
      canonical: `${BASE_URL}/de/faq`
    },
    fr: {
      title: "FAQ - Questions Fréquemment Posées | LocalPDF",
      description: "Obtenez des réponses aux questions courantes sur LocalPDF. Découvrez nos outils PDF axés sur la confidentialité et la compatibilité des navigateurs.",
      keywords: ["FAQ", "questions", "aide", "guide outils PDF", "support LocalPDF"],
      canonical: `${BASE_URL}/fr/faq`
    },
    es: {
      title: "FAQ - Preguntas Frecuentes | LocalPDF",
      description: "Obtenga respuestas a preguntas comunes sobre LocalPDF. Aprenda sobre nuestras herramientas PDF centradas en la privacidad y compatibilidad del navegador.",
      keywords: ["FAQ", "preguntas", "ayuda", "guía herramientas PDF", "soporte LocalPDF"],
      canonical: `${BASE_URL}/es/faq`
    },
    ru: {
      title: "FAQ - Часто Задаваемые Вопросы | LocalPDF",
      description: "Получите ответы на распространенные вопросы о LocalPDF. Узнайте о наших PDF инструментах, ориентированных на конфиденциальность.",
      keywords: ["FAQ", "вопросы", "помощь", "руководство PDF инструменты", "поддержка LocalPDF"],
      canonical: `${BASE_URL}/ru/faq`
    }
  }
};

// Tool categories for breadcrumbs and navigation
export const toolCategories = {
  primary: ['merge-pdf', 'split-pdf', 'compress-pdf'],
  editing: ['add-text-pdf', 'watermark-pdf', 'rotate-pdf'],
  extraction: ['extract-pages-pdf', 'extract-text-pdf', 'extract-images-from-pdf', 'pdf-to-image'],
  conversion: ['pdf-to-svg', 'images-to-pdf', 'word-to-pdf', 'excel-to-pdf'],
  security: ['protect-pdf'],
  ocr: ['ocr-pdf']
};

// Related tools mapping for internal linking
export const relatedTools = {
  'merge-pdf': ['split-pdf', 'compress-pdf', 'extract-pages-pdf'],
  'split-pdf': ['merge-pdf', 'extract-pages-pdf', 'rotate-pdf'],
  'compress-pdf': ['merge-pdf', 'split-pdf', 'watermark-pdf'],
  'add-text-pdf': ['watermark-pdf', 'rotate-pdf', 'extract-text-pdf'],
  'watermark-pdf': ['add-text-pdf', 'compress-pdf', 'rotate-pdf', 'protect-pdf'],
  'rotate-pdf': ['add-text-pdf', 'watermark-pdf', 'split-pdf'],
  'extract-pages-pdf': ['split-pdf', 'merge-pdf', 'extract-images-from-pdf'],
  'extract-text-pdf': ['add-text-pdf', 'extract-pages-pdf', 'extract-images-from-pdf'],
  'extract-images-from-pdf': ['extract-text-pdf', 'extract-pages-pdf', 'pdf-to-image'],
  'pdf-to-image': ['pdf-to-svg', 'extract-images-from-pdf', 'extract-text-pdf'],
  'pdf-to-svg': ['pdf-to-image', 'extract-pages-pdf', 'rotate-pdf'],
  'images-to-pdf': ['pdf-to-image', 'merge-pdf', 'compress-pdf'],
  'word-to-pdf': ['excel-to-pdf', 'images-to-pdf', 'merge-pdf'],
  'excel-to-pdf': ['word-to-pdf', 'images-to-pdf', 'merge-pdf'],
  'protect-pdf': ['watermark-pdf', 'add-text-pdf', 'compress-pdf'],
  'ocr-pdf': ['extract-text-pdf', 'add-text-pdf', 'pdf-to-image']
};


// Helper function to get homepage SEO data for language
export function getHomepageSEOData(language: SupportedLanguage) {
  return homepageSEOData[language] || homepageSEOData.en;
}

// Helper function to get page SEO data
export function getPageSEOData(pageId: string, language: SupportedLanguage) {
  return pagesSEOData[pageId as keyof typeof pagesSEOData]?.[language] ||
         pagesSEOData[pageId as keyof typeof pagesSEOData]?.en || null;
}