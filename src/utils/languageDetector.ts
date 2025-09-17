import { franc } from 'franc';

// Language mapping from franc codes to OCR codes
const FRANC_TO_OCR_MAPPING: Record<string, string> = {
  'eng': 'eng',
  'rus': 'rus',
  'deu': 'deu',
  'fra': 'fra',
  'spa': 'spa',
  'ita': 'ita',
  'por': 'por',
  'nld': 'nld',
  'pol': 'pol',
  'ukr': 'ukr',
  // Alternative codes
  'en': 'eng',
  'ru': 'rus',
  'de': 'deu',
  'fr': 'fra',
  'es': 'spa',
  'it': 'ita',
  'pt': 'por',
  'nl': 'nld',
  'pl': 'pol',
  'uk': 'ukr',
};

export interface LanguageDetectionResult {
  language: string;
  confidence: 'high' | 'medium' | 'low';
  detectionMethods: string[];
  details: string;
}

// Enhanced language detection from filename with multiple heuristics
export const detectLanguageFromFilename = (filename: string): string => {
  const result = detectLanguageAdvanced(filename);
  return result.language;
};

// Advanced language detection with detailed results
export const detectLanguageAdvanced = (filename: string, contentSample?: string): LanguageDetectionResult => {
  const name = filename.toLowerCase();
  const methods: string[] = [];
  let detectedLang = 'eng';
  let confidence: 'high' | 'medium' | 'low' = 'low';
  let details = '';

  // Method 1: Explicit language keywords in filename (highest confidence)
  const explicitKeywords = [
    { keywords: ['русский', 'russian', 'россия', 'russia', 'рус', 'rus'], lang: 'rus' },
    { keywords: ['deutsch', 'german', 'germany', 'deutschland', 'deu', 'ger'], lang: 'deu' },
    { keywords: ['français', 'french', 'france', 'fra', 'fr'], lang: 'fra' },
    { keywords: ['español', 'spanish', 'spain', 'españa', 'spa', 'es'], lang: 'spa' },
    { keywords: ['italiano', 'italian', 'italy', 'italia', 'ita', 'it'], lang: 'ita' },
    { keywords: ['português', 'portuguese', 'portugal', 'brasil', 'por', 'pt'], lang: 'por' },
    { keywords: ['nederlands', 'dutch', 'netherlands', 'holland', 'nld', 'nl'], lang: 'nld' },
    { keywords: ['polski', 'polish', 'poland', 'polska', 'pol', 'pl'], lang: 'pol' },
    { keywords: ['українська', 'ukrainian', 'ukraine', 'україна', 'ukr', 'uk'], lang: 'ukr' },
    { keywords: ['english'], lang: 'eng' }, // Removed 'eng' and 'en' to prevent false positives
  ];

  for (const { keywords, lang } of explicitKeywords) {
    // Use word boundary matching to prevent false positives like "22" matching "en"
    const hasKeyword = keywords.some(keyword => {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(name);
    });

    if (hasKeyword) {
      detectedLang = lang;
      confidence = 'high';
      methods.push('explicit_keywords');
      details = `Found explicit language keyword in filename`;
      break;
    }
  }

  // Method 2: Script detection from special characters (medium-high confidence)
  if (confidence !== 'high') {
    const scriptPatterns = [
      // Enhanced Russian detection with more comprehensive patterns
      {
        pattern: /[а-яё]/gi,
        lang: 'rus',
        script: 'Cyrillic',
        minMatches: 2 // At least 2 cyrillic chars for Russian
      },
      // Specific Ukrainian characters (must come before general Cyrillic)
      {
        pattern: /[іїєґ]/gi,
        lang: 'ukr',
        script: 'Ukrainian Cyrillic',
        minMatches: 1 // Even 1 specific char is strong indicator
      },
      // Common Russian words/endings that are strong indicators
      {
        pattern: /(?:ция|ство|ник|тель|ость|ение|ание|ский|ной|ный|ная|ное|ые|ых|ими|ами|ов|ев|ах|ях)/gi,
        lang: 'rus',
        script: 'Russian word patterns',
        minMatches: 1
      },
      {
        pattern: /[äöüß]/gi,
        lang: 'deu',
        script: 'German umlauts',
        minMatches: 1
      },
      {
        pattern: /[àâäçéèêëïîôùûüÿñæœ]/gi,
        lang: 'fra',
        script: 'French accents',
        minMatches: 2
      },
      {
        pattern: /[ñáéíóúü¿¡]/gi,
        lang: 'spa',
        script: 'Spanish accents',
        minMatches: 1
      },
      {
        pattern: /[àèéìíîòóù]/gi,
        lang: 'ita',
        script: 'Italian accents',
        minMatches: 2
      },
      {
        pattern: /[ąćęłńóśźż]/gi,
        lang: 'pol',
        script: 'Polish diacritics',
        minMatches: 1
      },
    ];

    for (const { pattern, lang, script, minMatches } of scriptPatterns) {
      const matches = name.match(pattern);
      if (matches && matches.length >= minMatches) {
        detectedLang = lang;
        confidence = confidence === 'low' ? 'medium' : confidence;

        // Special boost for Russian patterns
        if (lang === 'rus' && matches.length >= 3) {
          confidence = 'high';
        }

        methods.push('script_detection');
        details = `Detected ${script} characters in filename (${matches.length} matches)`;
        break;
      }
    }
  }

  // Method 3: City/country detection (medium confidence)
  if (confidence === 'low') {
    const geoKeywords = [
      { keywords: ['moscow', 'москва', 'санкт-петербург', 'спб', 'spb', 'petersburg', 'новосибирск', 'екатеринбург', 'казань', 'самара', 'омск', 'челябинск', 'ростов', 'уфа', 'красноярск'], lang: 'rus' },
      { keywords: ['berlin', 'münchen', 'munich', 'hamburg', 'cologne', 'köln', 'frankfurt', 'stuttgart', 'düsseldorf', 'dortmund', 'essen', 'leipzig', 'bremen', 'dresden', 'hannover'], lang: 'deu' },
      { keywords: ['paris', 'lyon', 'marseille', 'toulouse', 'nice', 'nantes', 'strasbourg', 'montpellier', 'bordeaux', 'lille', 'rennes', 'reims', 'toulon'], lang: 'fra' },
      { keywords: ['madrid', 'barcelona', 'valencia', 'sevilla', 'zaragoza', 'málaga', 'murcia', 'palma', 'bilbao', 'alicante', 'córdoba', 'valladolid'], lang: 'spa' },
      { keywords: ['roma', 'milano', 'napoli', 'torino', 'palermo', 'genova', 'bologna', 'firenze', 'florence', 'bari', 'catania', 'venezia', 'venice', 'verona'], lang: 'ita' },
      { keywords: ['amsterdam', 'rotterdam', 'utrecht', 'eindhoven', 'tilburg', 'groningen', 'almere', 'breda', 'nijmegen', 'haarlem'], lang: 'nld' },
      { keywords: ['warszawa', 'warsaw', 'krakow', 'cracow', 'łódź', 'lodz', 'wrocław', 'wroclaw', 'poznań', 'poznan', 'gdansk', 'szczecin', 'bydgoszcz', 'lublin'], lang: 'pol' },
      { keywords: ['київ', 'kyiv', 'kiev', 'харків', 'kharkiv', 'kharkov', 'одеса', 'odesa', 'odessa', 'дніпро', 'dnipro', 'львів', 'lviv', 'запоріжжя', 'запорожье'], lang: 'ukr' },
    ];

    for (const { keywords, lang } of geoKeywords) {
      if (keywords.some(keyword => name.includes(keyword))) {
        detectedLang = lang;
        confidence = 'medium';
        methods.push('geo_keywords');
        details = `Found location indicator '${keywords.find(k => name.includes(k))}' suggesting ${lang}`;
        break;
      }
    }
  }

  // Method 3.5: Document type keywords (low-medium confidence)
  if (confidence === 'low') {
    const docTypeKeywords = [
      {
        keywords: [
          'договор', 'контракт', 'документ', 'справка', 'акт', 'протокол', 'отчет', 'заявление',
          'приказ', 'распоряжение', 'инструкция', 'положение', 'регламент', 'устав',
          'соглашение', 'доверенность', 'квитанция', 'счет', 'накладная', 'ведомость',
          'паспорт', 'свидетельство', 'сертификат', 'лицензия', 'патент', 'диплом',
          'удостоверение', 'билет', 'абонемент', 'талон', 'купон', 'чек'
        ],
        lang: 'rus'
      },
      { keywords: ['vertrag', 'dokument', 'bericht', 'protokoll', 'antrag', 'bescheinigung'], lang: 'deu' },
      { keywords: ['contrat', 'document', 'rapport', 'protocole', 'demande', 'certificat'], lang: 'fra' },
      { keywords: ['contrato', 'documento', 'informe', 'protocolo', 'solicitud', 'certificado'], lang: 'spa' },
      { keywords: ['contratto', 'documento', 'rapporto', 'protocollo', 'richiesta', 'certificato'], lang: 'ita' },
    ];

    for (const { keywords, lang } of docTypeKeywords) {
      if (keywords.some(keyword => name.includes(keyword))) {
        detectedLang = lang;
        confidence = 'medium';
        methods.push('document_type_keywords');
        details = `Found document type keyword suggesting ${lang}`;
        break;
      }
    }
  }

  // Method 4: Content analysis using franc (if content sample provided)
  if (contentSample && contentSample.length > 50) {
    try {
      const francResult = franc(contentSample);
      const mappedLang = FRANC_TO_OCR_MAPPING[francResult];

      if (mappedLang && francResult !== 'und') {
        // If filename detection failed or has low confidence, trust content analysis more
        if (confidence === 'low') {
          detectedLang = mappedLang;
          confidence = 'high';
          methods.push('content_analysis');
          details = `Language detected from document content`;
        } else if (detectedLang === mappedLang) {
          // Filename and content agree - increase confidence
          confidence = 'high';
          methods.push('content_analysis');
          details += ` (confirmed by content analysis)`;
        } else {
          // Conflict between filename and content - prefer content but note the conflict
          methods.push('content_analysis_conflict');
          details += ` (content suggests ${mappedLang}, creating uncertainty)`;
        }
      }
    } catch (error) {
      // Franc failed, continue with filename-based detection
      methods.push('content_analysis_failed');
    }
  }

  // Method 5: Common filename patterns (very low confidence)
  if (confidence === 'low' && methods.length === 0) {
    // Check for common document patterns that might hint at language
    if (name.includes('scan') || name.includes('document') || name.includes('doc') ||
        name.includes('image') || name.includes('photo') || name.includes('file')) {
      methods.push('generic_filename');
      details = 'Generic filename detected - content analysis recommended';
    } else if (name.match(/^\d+$/)) {
      // Numeric filename
      methods.push('numeric_filename');
      details = 'Numeric filename - content analysis required for language detection';
    } else if (name.match(/\d{4}-\d{2}-\d{2}/)) {
      // Date-based filename (like 2025-07-22 22.02.30.jpg)
      methods.push('date_filename');
      details = 'Date-based filename - content analysis required for language detection';
    } else if (name.length < 5) {
      // Very short filename
      methods.push('short_filename');
      details = 'Short filename - content analysis required for language detection';
    } else {
      // Some other filename that we couldn't categorize
      methods.push('unrecognized_filename');
      details = 'Filename pattern not recognized - content analysis required for accurate detection';
    }
  }

  // Default fallback with better messaging
  if (methods.length === 0) {
    methods.push('default_fallback');
    details = 'No language indicators found - defaulted to English (most common OCR language)';
  }

  return {
    language: detectedLang,
    confidence,
    detectionMethods: methods,
    details
  };
};

// Get language confidence based on detection method (backwards compatibility)
export const getLanguageConfidence = (filename: string, detectedLang: string): 'high' | 'medium' | 'low' => {
  const result = detectLanguageAdvanced(filename);
  return result.confidence;
};

// Get user-friendly language confidence message with enhanced details
export const getLanguageConfidenceMessage = (confidence: 'high' | 'medium' | 'low', language: string, filename?: string): string => {
  if (filename) {
    const result = detectLanguageAdvanced(filename);
    return result.details;
  }

  // Fallback for backwards compatibility
  switch (confidence) {
    case 'high':
      return `Language auto-detected with high confidence`;
    case 'medium':
      return `Language guessed based on filename characteristics`;
    case 'low':
      return `Default language selected - please verify`;
    default:
      return 'Please select the correct language';
  }
};

// Perform quick content analysis for language detection
export const analyzeContentForLanguage = async (file: File): Promise<LanguageDetectionResult | null> => {
  try {
    // For images, we can't pre-analyze content easily, skip
    if (file.type.startsWith('image/')) {
      return null;
    }

    // For PDFs, try to extract a small sample of text for quick analysis
    if (file.type === 'application/pdf') {
      // This would require a lightweight PDF text extraction
      // For now, skip content analysis for PDFs to avoid heavy processing
      return null;
    }

    return null;
  } catch (error) {
    console.warn('Content analysis failed:', error);
    return null;
  }
};
