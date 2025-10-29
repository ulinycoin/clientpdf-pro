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
    { keywords: ['русский', 'russian', 'россия', 'russia', 'рус', 'rus'], lang: 'rus' },
    { keywords: ['deutsch', 'german', 'germany', 'deutschland', 'deu', 'ger'], lang: 'deu' },
    { keywords: ['français', 'french', 'france', 'fra', 'fr'], lang: 'fra' },
    { keywords: ['español', 'spanish', 'spain', 'españa', 'spa', 'es'], lang: 'spa' },
    { keywords: ['english'], lang: 'eng' },
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
      { keywords: ['moscow', 'москва', 'санкт-петербург', 'spb', 'petersburg', 'новосибирск', 'екатеринбург', 'казань'], lang: 'rus' },
      { keywords: ['berlin', 'münchen', 'munich', 'hamburg', 'cologne', 'köln', 'frankfurt', 'stuttgart'], lang: 'deu' },
      { keywords: ['paris', 'lyon', 'marseille', 'toulouse', 'nice', 'nantes'], lang: 'fra' },
      { keywords: ['madrid', 'barcelona', 'valencia', 'sevilla', 'málaga'], lang: 'spa' },
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
    // Simple content-based detection
    const cyrillicRatio = (contentSample.match(/[а-яё]/gi)?.length || 0) / contentSample.length;
    const germanRatio = (contentSample.match(/[äöüß]/gi)?.length || 0) / contentSample.length;
    const frenchRatio = (contentSample.match(/[àâäçéèêëïîôùûüÿñæœ]/gi)?.length || 0) / contentSample.length;
    const spanishRatio = (contentSample.match(/[ñáéíóúü¿¡]/gi)?.length || 0) / contentSample.length;

    if (cyrillicRatio > 0.05) {
      detectedLang = 'rus';
      confidence = cyrillicRatio > 0.2 ? 'high' : 'medium';
      methods.push('content_analysis');
      details = `Detected Cyrillic text in content (${Math.round(cyrillicRatio * 100)}%)`;
    } else if (germanRatio > 0.02) {
      detectedLang = 'deu';
      confidence = 'medium';
      methods.push('content_analysis');
      details = `Detected German characters in content`;
    } else if (frenchRatio > 0.02) {
      detectedLang = 'fra';
      confidence = 'medium';
      methods.push('content_analysis');
      details = `Detected French characters in content`;
    } else if (spanishRatio > 0.02) {
      detectedLang = 'spa';
      confidence = 'medium';
      methods.push('content_analysis');
      details = `Detected Spanish characters in content`;
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
