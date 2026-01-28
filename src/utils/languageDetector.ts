// Advanced language detection for OCR
// Supports multiple detection methods: filename analysis, script detection, geo keywords, content analysis with franc

import { francAll } from 'franc-min';

export interface LanguageDetectionResult {
  language: string;
  confidence: 'high' | 'medium' | 'low';
  detectionMethods: string[];
  details: string;
}

const countMatches = (pattern: RegExp, text: string): number => {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
};

const detectFromContentSample = (contentSample: string): LanguageDetectionResult | null => {
  const sample = contentSample
    .replace(/[^\p{L}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (sample.length < 10) return null;

  const methods: string[] = [];

  const cyrillicCount = countMatches(/[а-яёА-ЯЁ]/g, sample);
  if (cyrillicCount >= 5) {
    const ukrCount = countMatches(/[іїєґІЇЄҐ]/g, sample);
    const belCount = countMatches(/[ўЎ]/g, sample);
    const rusCount = countMatches(/[ёыъэЁЫЪЭ]/g, sample);

    if (ukrCount > 0 && ukrCount >= rusCount && ukrCount >= belCount) {
      return {
        language: 'ukr',
        confidence: 'high',
        detectionMethods: ['content_cyrillic_ukr'],
        details: `Detected Ukrainian-specific Cyrillic (${ukrCount} matches)`,
      };
    }
    if (belCount > 0 && belCount >= rusCount) {
      return {
        language: 'bel',
        confidence: 'high',
        detectionMethods: ['content_cyrillic_bel'],
        details: `Detected Belarusian-specific Cyrillic (${belCount} matches)`,
      };
    }
    if (rusCount > 0) {
      return {
        language: 'rus',
        confidence: 'high',
        detectionMethods: ['content_cyrillic_rus'],
        details: `Detected Russian-specific Cyrillic (${rusCount} matches)`,
      };
    }
    return {
      language: 'rus',
      confidence: 'medium',
      detectionMethods: ['content_cyrillic_generic'],
      details: `Detected Cyrillic script (${cyrillicCount} matches)`,
    };
  }

  const latvianCount = countMatches(/[āčēģīķļņšūžĀČĒĢĪĶĻŅŠŪŽ]/g, sample);
  const lithuanianCount = countMatches(/[ąčęėįšųūžĄČĘĖĮŠŲŪŽ]/g, sample);
  const estonianCount = countMatches(/[äõöšüžÄÕÖŠÜŽ]/g, sample);
  const finnishCount = countMatches(/[äöÄÖ]/g, sample);
  const swedishCount = countMatches(/[åäöÅÄÖ]/g, sample);

  const latvianWords = countMatches(/\b(un|ir|es|viņš|viņa|mēs|jūs|kas|vai|bet|par|no|uz|ar|pie|pēc)\b/gi, sample);
  const lithuanianWords = countMatches(/\b(ir|yra|kad|bet|su|iš|į|pas|nuo|apie|kaip|kas|kuris)\b/gi, sample);
  const estonianWords = countMatches(/\b(on|ja|ei|või|kui|mis|kes|see|seda|kuid|ning|siis)\b/gi, sample);
  const finnishWords = countMatches(/\b(ja|ei|on|että|joka|mikä|mutta|kanssa)\b/gi, sample);
  const swedishWords = countMatches(/\b(och|att|det|som|för|med|inte)\b/gi, sample);

  const candidates: Array<{ lang: string; score: number; details: string }> = [
    { lang: 'lav', score: latvianCount * 2 + latvianWords, details: `Latvian diacritics/words (${latvianCount}/${latvianWords})` },
    { lang: 'lit', score: lithuanianCount * 2 + lithuanianWords, details: `Lithuanian diacritics/words (${lithuanianCount}/${lithuanianWords})` },
    { lang: 'est', score: estonianCount * 2 + estonianWords, details: `Estonian diacritics/words (${estonianCount}/${estonianWords})` },
    { lang: 'fin', score: finnishCount * 2 + finnishWords, details: `Finnish diacritics/words (${finnishCount}/${finnishWords})` },
    { lang: 'swe', score: swedishCount * 2 + swedishWords, details: `Swedish diacritics/words (${swedishCount}/${swedishWords})` },
  ];

  const top = candidates.sort((a, b) => b.score - a.score)[0];
  if (top.score >= 2) {
    return {
      language: top.lang,
      confidence: top.score >= 4 ? 'high' : 'medium',
      detectionMethods: ['content_diacritics_words'],
      details: top.details,
    };
  }

  return null;
};

// Mapping from franc's ISO 639-3 codes to our Tesseract codes if they differ
const francToTesseractMap: { [key: string]: string } = {
  cmn: 'chi_sim', // Mandarin -> Chinese Simplified
  yue: 'chi_tra', // Cantonese -> Chinese Traditional
  nan: 'chi_tra', // Min Nan -> Chinese Traditional
  // Franc uses 'srp' for Serbian Latin, Tesseract uses 'srp' for Cyrillic.
  // We assume content will guide this correctly.

  // Additional ISO 639-3 to Tesseract mappings
  deu: 'deu', // German (already exists but explicit)
  fra: 'fra', // French
  spa: 'spa', // Spanish
  por: 'por', // Portuguese
  ita: 'ita', // Italian
  nld: 'nld', // Dutch
  pol: 'pol', // Polish
  rus: 'rus', // Russian
  ukr: 'ukr', // Ukrainian
  bel: 'bel', // Belarusian
  bul: 'bul', // Bulgarian
  ces: 'ces', // Czech
  slk: 'slk', // Slovak
  slv: 'slv', // Slovenian
  hrv: 'hrv', // Croatian
  srp: 'srp', // Serbian
  mkd: 'mkd', // Macedonian
  ron: 'ron', // Romanian
  hun: 'hun', // Hungarian
  tur: 'tur', // Turkish
  ell: 'ell', // Greek (modern)
  sqi: 'sqi', // Albanian
  cat: 'cat', // Catalan
  glg: 'glg', // Galician
  eus: 'eus', // Basque
  swe: 'swe', // Swedish
  nor: 'nor', // Norwegian
  dan: 'dan', // Danish
  fin: 'fin', // Finnish
  isl: 'isl', // Icelandic
  lav: 'lav', // Latvian
  lit: 'lit', // Lithuanian
  est: 'est', // Estonian
  jpn: 'jpn', // Japanese
  kor: 'kor', // Korean
  ara: 'ara', // Arabic
  heb: 'heb', // Hebrew
  fas: 'fas', // Persian/Farsi
  hin: 'hin', // Hindi
  tha: 'tha', // Thai
  vie: 'vie', // Vietnamese
};

// List of supported Tesseract codes from the UI
const supportedTesseractCodes = new Set([
  'eng', 'rus', 'deu', 'fra', 'spa', 'ita', 'por', 'pol', 'lav', 'lit', 'est',
  'swe', 'nor', 'dan', 'fin', 'isl', 'ukr', 'bel', 'ces', 'slk', 'slv', 'hrv',
  'srp', 'bul', 'mkd', 'nld', 'cat', 'glg', 'eus', 'ron', 'hun', 'ell', 'tur',
  'sqi', 'chi_sim', 'chi_tra', 'jpn', 'kor', 'hin', 'tha', 'vie', 'ara', 'heb', 'fas'
]);

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
    { keywords: ['latviešu', 'latvian', 'latvia', 'latvija', 'lav', 'lv'], lang: 'lav' },
    { keywords: ['lietuvių', 'lithuanian', 'lithuania', 'lietuva', 'lit', 'lt'], lang: 'lit' },
    { keywords: ['eesti', 'estonian', 'estonia', 'est', 'et'], lang: 'est' },
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
        pattern: /[а-яёА-ЯЁ]/g,
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
      // Baltic languages - specific character detection with better patterns
      {
        pattern: /[āčēģīķļņšūž]/gi,
        lang: 'lav',
        script: 'Latvian diacritics',
        minMatches: 1
      },
      // Latvian common words/patterns
      {
        pattern: /\b(un|ir|es|viņš|viņa|mēs|jūs|kas|vai|bet|par|no|uz|ar|pie|pēc)\b/gi,
        lang: 'lav',
        script: 'Latvian common words',
        minMatches: 2
      },
      {
        pattern: /[ąčęėįšųūž]/gi,
        lang: 'lit',
        script: 'Lithuanian diacritics',
        minMatches: 1
      },
      // Lithuanian common words/patterns
      {
        pattern: /\b(ir|yra|kad|bet|su|iš|į|pas|nuo|apie|kaip|kas|kuris)\b/gi,
        lang: 'lit',
        script: 'Lithuanian common words',
        minMatches: 2
      },
      {
        pattern: /[äõöšüž]/gi,
        lang: 'est',
        script: 'Estonian characters',
        minMatches: 1
      },
      // Estonian common words/patterns
      {
        pattern: /\b(on|ja|ei|või|kui|mis|kes|see|seda|kuid|ning|siis)\b/gi,
        lang: 'est',
        script: 'Estonian common words',
        minMatches: 2
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
      { keywords: ['riga', 'rīga', 'rigas', 'rīgas', 'daugavpils', 'liepaja', 'jelgava', 'jūrmala'], lang: 'lav' },
      { keywords: ['vilnius', 'kaunas', 'klaipeda', 'klaipėda', 'šiauliai', 'panevezys', 'panevėžys'], lang: 'lit' },
      { keywords: ['tallinn', 'tartu', 'narva', 'pärnu', 'kohtla-järve'], lang: 'est' },
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
      // Baltic language document keywords
      { keywords: ['lēmums', 'lemums', 'līgums', 'ligums', 'lēmumu', 'dokumenti', 'dokumentu', 'apliecība'], lang: 'lav' },
      { keywords: ['sprendimas', 'sutartis', 'dokumentas', 'pažyma', 'pažymėjimas', 'liudijimas'], lang: 'lit' },
      { keywords: ['otsus', 'leping', 'dokument', 'tõend', 'tunnistus'], lang: 'est' },
    ];

    for (const { keywords, lang } of docTypeKeywords) {
      const matchedKeyword = keywords.find(keyword => name.includes(keyword));
      if (matchedKeyword) {
        detectedLang = lang;
        // Higher confidence for Baltic languages with diacritics
        if (['lav', 'lit', 'est'].includes(lang) && matchedKeyword.match(/[āčēģīķļņšūžąčęėįšųūžäõöšüž]/)) {
          confidence = 'high';
          details = `Found ${lang} document keyword '${matchedKeyword}' with diacritics`;
        } else {
          confidence = 'medium';
          details = `Found document type keyword '${matchedKeyword}' suggesting ${lang}`;
        }
        methods.push('document_type_keywords');
        break;
      }
    }
  }

  // Method 5: Content analysis (script/diacritics) before Franc
  if (contentSample && contentSample.trim().length > 10) {
    const contentResult = detectFromContentSample(contentSample);
    if (contentResult) {
      if (confidence !== 'high' || contentResult.confidence === 'high') {
        detectedLang = contentResult.language;
        confidence = contentResult.confidence;
        methods.push(...contentResult.detectionMethods);
        details = contentResult.details;
      }
    }
  }

  // Method 6: Content analysis with Franc (high confidence)
  if (contentSample && contentSample.trim().length > 10) {
    // Clean content sample for better analysis
    const cleanedSample = contentSample
      .replace(/[^\p{L}\p{N}\s.,!?;:()-]/gu, ' ') // Keep letters, numbers, basic punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    console.log('📄 Content sample for Franc analysis:', cleanedSample.substring(0, 200) + '...');

    if (cleanedSample.length > 10) {
      const francResults = francAll(cleanedSample, { minLength: 3 });
      console.log('🔍 Franc analysis - top 10 results:');
      francResults.slice(0, 10).forEach(([code, score], index) => {
        console.log(`  ${index + 1}. ${code} (score: ${score})`);
      });

      if (francResults && francResults.length > 0 && francResults[0][0] !== 'und') {
        // Try to find first supported language in top results
        // Expand search to top 20 results for better coverage
        let foundLanguage = false;
        for (let i = 0; i < Math.min(20, francResults.length); i++) {
          const [francCode, score] = francResults[i];
          const tesseractCode = francToTesseractMap[francCode] || francCode;

          if (supportedTesseractCodes.has(tesseractCode)) {
            console.log(`✅ Found supported language at position ${i + 1}: ${francCode} → ${tesseractCode} (score: ${score})`);
            detectedLang = tesseractCode;

            // Confidence depends on position and existing confidence
            if (i === 0 && score > 5) {
              confidence = 'high'; // Top match with good score
            } else if (i < 3 && confidence !== 'high') {
              confidence = 'high'; // Top 3 is reliable
            } else if (i < 10 && confidence === 'low') {
              confidence = 'medium'; // Top 10 is decent
            }

            methods.push('content_analysis_franc');
            details = confidence === 'high' ?
              `Detected ${tesseractCode} from content with high confidence (rank: ${i + 1})` :
              `Content suggests ${tesseractCode} (rank: ${i + 1}, verify recommended)`;
            foundLanguage = true;
            break;
          }
        }

        if (!foundLanguage) {
          const [topCode, topScore] = francResults[0];
          console.log(`⚠️ Franc top result '${topCode}' (score: ${topScore}) is not supported by Tesseract`);
          console.log(`⚠️ None of the top 20 Franc results are supported by Tesseract`);
        }
      } else {
        console.log('⚠️ Franc returned undefined or no results');
      }
    } else {
      console.log('⚠️ Content sample too short after cleaning');
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
