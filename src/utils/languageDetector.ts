// Advanced language detection for OCR
// Supports multiple detection methods: filename analysis, script detection, geo keywords, content analysis

export interface LanguageDetectionResult {
  language: string;
  confidence: 'high' | 'medium' | 'low';
  detectionMethods: string[];
  details: string;
}

// Advanced language detection with detailed results
export const detectLanguageAdvanced = (filename: string, contentSample?: string): LanguageDetectionResult => {
  const name = filename.toLowerCase();
  const methods: string[] = [];
  let detectedLang = 'eng';
  let confidence: 'high' | 'medium' | 'low' = 'low';
  let details = '';

  // Method 1: Explicit language keywords in filename (highest confidence)
  const explicitKeywords = [
    // European languages
    { keywords: ['русский', 'russian', 'россия', 'russia', 'рус', 'rus'], lang: 'rus' },
    { keywords: ['deutsch', 'german', 'germany', 'deutschland', 'deu', 'ger'], lang: 'deu' },
    { keywords: ['français', 'french', 'france', 'fra', 'fr'], lang: 'fra' },
    { keywords: ['español', 'spanish', 'spain', 'españa', 'spa', 'es'], lang: 'spa' },
    { keywords: ['português', 'portuguese', 'portugal', 'brasil', 'brazil', 'por', 'pt'], lang: 'por' },
    { keywords: ['italiano', 'italian', 'italy', 'italia', 'ita', 'it'], lang: 'ita' },
    { keywords: ['polski', 'polish', 'poland', 'polska', 'pol', 'pl'], lang: 'pol' },
    { keywords: ['türkçe', 'turkish', 'turkey', 'türkiye', 'tur', 'tr'], lang: 'tur' },
    { keywords: ['english'], lang: 'eng' },

    // Asian languages
    { keywords: ['中文', '简体', 'chinese', 'simplified', 'china', 'zh-cn', 'chs'], lang: 'chi_sim' },
    { keywords: ['繁體', '繁体', 'traditional', 'taiwan', 'hongkong', 'zh-tw', 'cht'], lang: 'chi_tra' },
    { keywords: ['日本語', 'japanese', 'japan', 'nihongo', 'jpn', 'ja'], lang: 'jpn' },
    { keywords: ['한국어', '한글', 'korean', 'korea', 'hangul', 'kor', 'ko'], lang: 'kor' },
    { keywords: ['हिन्दी', 'hindi', 'india', 'bharat', 'hin', 'hi'], lang: 'hin' },

    // Middle Eastern
    { keywords: ['العربية', 'arabic', 'arab', 'عربي', 'ara', 'ar'], lang: 'ara' },
  ];

  for (const { keywords, lang } of explicitKeywords) {
    // Use word boundary matching to prevent false positives
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
      // Enhanced Russian detection
      {
        pattern: /[а-яё]/gi,
        lang: 'rus',
        script: 'Cyrillic',
        minMatches: 2
      },
      // Common Russian word patterns
      {
        pattern: /(?:ция|ство|ник|тель|ость|ение|ание|ский|ной|ный|ная|ное|ые|ых|ими|ами|ов|ев|ах|ях)/gi,
        lang: 'rus',
        script: 'Russian word patterns',
        minMatches: 1
      },
      // European special characters
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
        pattern: /[ãáàâçéêíóôõú]/gi,
        lang: 'por',
        script: 'Portuguese accents',
        minMatches: 1
      },
      {
        pattern: /[àèéìíîòóùú]/gi,
        lang: 'ita',
        script: 'Italian accents',
        minMatches: 1
      },
      {
        pattern: /[ąćęłńóśźż]/gi,
        lang: 'pol',
        script: 'Polish diacritics',
        minMatches: 1
      },
      {
        pattern: /[çğıöşü]/gi,
        lang: 'tur',
        script: 'Turkish characters',
        minMatches: 1
      },
      // Asian scripts
      {
        pattern: /[\u4e00-\u9fff]/g,
        lang: 'chi_sim',
        script: 'Chinese characters (CJK)',
        minMatches: 2
      },
      {
        pattern: /[\u3040-\u309f\u30a0-\u30ff]/g,
        lang: 'jpn',
        script: 'Japanese Hiragana/Katakana',
        minMatches: 2
      },
      {
        pattern: /[\uac00-\ud7af]/g,
        lang: 'kor',
        script: 'Korean Hangul',
        minMatches: 2
      },
      {
        pattern: /[\u0900-\u097f]/g,
        lang: 'hin',
        script: 'Hindi Devanagari',
        minMatches: 2
      },
      {
        pattern: /[\u0600-\u06ff]/g,
        lang: 'ara',
        script: 'Arabic script',
        minMatches: 2
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
      // European countries/cities
      { keywords: ['moscow', 'москва', 'санкт-петербург', 'spb', 'petersburg', 'новосибирск', 'екатеринбург', 'казань'], lang: 'rus' },
      { keywords: ['berlin', 'münchen', 'munich', 'hamburg', 'cologne', 'köln', 'frankfurt', 'stuttgart'], lang: 'deu' },
      { keywords: ['paris', 'lyon', 'marseille', 'toulouse', 'nice', 'nantes'], lang: 'fra' },
      { keywords: ['madrid', 'barcelona', 'valencia', 'sevilla', 'málaga'], lang: 'spa' },
      { keywords: ['lisbon', 'lisboa', 'porto', 'brasilia', 'são paulo', 'rio'], lang: 'por' },
      { keywords: ['rome', 'roma', 'milan', 'milano', 'venice', 'venezia', 'naples', 'napoli'], lang: 'ita' },
      { keywords: ['warsaw', 'warszawa', 'kraków', 'wrocław', 'gdańsk', 'poznań'], lang: 'pol' },
      { keywords: ['istanbul', 'ankara', 'izmir', 'bursa', 'antalya'], lang: 'tur' },

      // Asian countries/cities
      { keywords: ['beijing', '北京', 'shanghai', '上海', 'guangzhou', 'shenzhen', 'china'], lang: 'chi_sim' },
      { keywords: ['taipei', '台北', 'kaohsiung', 'taiwan', 'hongkong', '香港'], lang: 'chi_tra' },
      { keywords: ['tokyo', '東京', 'osaka', 'kyoto', 'yokohama', 'nagoya', 'sapporo'], lang: 'jpn' },
      { keywords: ['seoul', '서울', 'busan', 'incheon', 'daegu', 'korea'], lang: 'kor' },
      { keywords: ['delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata', 'hyderabad'], lang: 'hin' },

      // Middle East
      { keywords: ['dubai', 'riyadh', 'cairo', 'baghdad', 'damascus', 'jeddah', 'mecca'], lang: 'ara' },
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

  // Method 4: Document type keywords (low-medium confidence)
  if (confidence === 'low') {
    const docTypeKeywords = [
      {
        keywords: [
          'договор', 'контракт', 'документ', 'справка', 'акт', 'протокол', 'отчет', 'заявление',
          'приказ', 'инструкция', 'соглашение', 'счет', 'паспорт', 'сертификат', 'диплом'
        ],
        lang: 'rus'
      },
      { keywords: ['vertrag', 'dokument', 'bericht', 'protokoll', 'antrag'], lang: 'deu' },
      { keywords: ['contrat', 'document', 'rapport', 'protocole', 'demande'], lang: 'fra' },
      { keywords: ['contrato', 'documento', 'informe', 'protocolo', 'solicitud'], lang: 'spa' },
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

  // Method 5: Content analysis (if content sample provided)
  if (contentSample && contentSample.length > 50) {
    // Calculate ratios for different scripts
    const scriptRatios = [
      { pattern: /[а-яё]/gi, lang: 'rus', name: 'Cyrillic', threshold: 0.05, highThreshold: 0.2 },
      { pattern: /[\u4e00-\u9fff]/g, lang: 'chi_sim', name: 'Chinese', threshold: 0.02, highThreshold: 0.1 },
      { pattern: /[\u3040-\u309f\u30a0-\u30ff]/g, lang: 'jpn', name: 'Japanese', threshold: 0.02, highThreshold: 0.1 },
      { pattern: /[\uac00-\ud7af]/g, lang: 'kor', name: 'Korean', threshold: 0.02, highThreshold: 0.1 },
      { pattern: /[\u0900-\u097f]/g, lang: 'hin', name: 'Hindi', threshold: 0.02, highThreshold: 0.1 },
      { pattern: /[\u0600-\u06ff]/g, lang: 'ara', name: 'Arabic', threshold: 0.02, highThreshold: 0.1 },
      { pattern: /[äöüß]/gi, lang: 'deu', name: 'German', threshold: 0.02, highThreshold: 0.05 },
      { pattern: /[àâäçéèêëïîôùûüÿñæœ]/gi, lang: 'fra', name: 'French', threshold: 0.02, highThreshold: 0.05 },
      { pattern: /[ñáéíóúü¿¡]/gi, lang: 'spa', name: 'Spanish', threshold: 0.02, highThreshold: 0.05 },
      { pattern: /[ãáàâçéêíóôõú]/gi, lang: 'por', name: 'Portuguese', threshold: 0.02, highThreshold: 0.05 },
      { pattern: /[àèéìíîòóùú]/gi, lang: 'ita', name: 'Italian', threshold: 0.02, highThreshold: 0.05 },
      { pattern: /[ąćęłńóśźż]/gi, lang: 'pol', name: 'Polish', threshold: 0.02, highThreshold: 0.05 },
      { pattern: /[çğıöşü]/gi, lang: 'tur', name: 'Turkish', threshold: 0.02, highThreshold: 0.05 },
    ];

    // Find the script with highest ratio
    let maxRatio = 0;
    let detectedScript = null;

    for (const { pattern, lang, name, threshold, highThreshold } of scriptRatios) {
      const ratio = (contentSample.match(pattern)?.length || 0) / contentSample.length;
      if (ratio > threshold && ratio > maxRatio) {
        maxRatio = ratio;
        detectedScript = { lang, name, ratio, highThreshold };
      }
    }

    if (detectedScript) {
      detectedLang = detectedScript.lang;
      confidence = maxRatio > detectedScript.highThreshold ? 'high' : 'medium';
      methods.push('content_analysis');
      details = `Detected ${detectedScript.name} text in content (${Math.round(maxRatio * 100)}%)`;
    }
  }

  // Method 6: Filename patterns (very low confidence)
  if (confidence === 'low' && methods.length === 0) {
    if (name.match(/\d{4}-\d{2}-\d{2}/)) {
      methods.push('date_filename');
      details = 'Date-based filename - content analysis required for language detection';
    } else if (name.length < 5) {
      methods.push('short_filename');
      details = 'Short filename - content analysis required for language detection';
    } else {
      methods.push('unrecognized_filename');
      details = 'Filename pattern not recognized - content analysis required';
    }
  }

  // Default fallback
  if (methods.length === 0) {
    methods.push('default_fallback');
    details = 'No language indicators found - defaulted to English';
  }

  return {
    language: detectedLang,
    confidence,
    detectionMethods: methods,
    details
  };
};

// Get language confidence message
export const getLanguageConfidenceMessage = (confidence: 'high' | 'medium' | 'low'): string => {
  switch (confidence) {
    case 'high':
      return 'Language auto-detected with high confidence';
    case 'medium':
      return 'Language guessed based on filename characteristics';
    case 'low':
      return 'Default language selected - please verify';
    default:
      return 'Please select the correct language';
  }
};
