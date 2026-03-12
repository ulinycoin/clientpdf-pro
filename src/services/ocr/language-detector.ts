export type SupportedOcrLanguage =
  | 'eng'
  | 'rus'
  | 'ukr'
  | 'deu'
  | 'fra'
  | 'spa'
  | 'ita'
  | 'por'
  | 'jpn'
  | 'chi_sim'
  | 'hin'
  | 'ara';

type ScriptKind = 'latin' | 'cyrillic' | 'japanese' | 'han' | 'devanagari' | 'arabic';

interface LanguageModel {
  script: ScriptKind;
  stopwords: readonly string[];
}

const LANGUAGE_MODELS: Record<SupportedOcrLanguage, LanguageModel> = {
  eng: { script: 'latin', stopwords: ['the', 'and', 'for', 'with', 'from', 'this', 'that', 'will', 'your', 'is'] },
  rus: { script: 'cyrillic', stopwords: ['и', 'в', 'на', 'с', 'по', 'для', 'от', 'это', 'что', 'как'] },
  ukr: { script: 'cyrillic', stopwords: ['і', 'в', 'на', 'з', 'для', 'що', 'це', 'як', 'до', 'та'] },
  deu: { script: 'latin', stopwords: ['und', 'der', 'die', 'das', 'mit', 'für', 'auf', 'ist', 'von', 'den'] },
  fra: { script: 'latin', stopwords: ['le', 'la', 'les', 'de', 'des', 'et', 'pour', 'avec', 'est', 'dans'] },
  spa: { script: 'latin', stopwords: ['el', 'la', 'los', 'las', 'de', 'del', 'para', 'con', 'que', 'en'] },
  ita: { script: 'latin', stopwords: ['il', 'la', 'gli', 'le', 'di', 'per', 'con', 'che', 'nel', 'una'] },
  por: { script: 'latin', stopwords: ['o', 'a', 'os', 'as', 'de', 'do', 'para', 'com', 'que', 'em'] },
  jpn: { script: 'japanese', stopwords: ['の', 'に', 'は', 'を', 'が', 'です', 'ます', 'で', 'て', 'と'] },
  chi_sim: { script: 'han', stopwords: ['的', '是', '了', '在', '和', '有', '为', '与', '及', '本'] },
  hin: { script: 'devanagari', stopwords: ['के', 'में', 'और', 'का', 'है', 'से', 'यह', 'को', 'पर', 'की'] },
  ara: { script: 'arabic', stopwords: ['في', 'من', 'على', 'إلى', 'لا', 'أن', 'ما', 'هو', 'مع', 'عن'] },
};

export interface LanguageCandidate {
  language: SupportedOcrLanguage;
  score: number;
}

export interface LanguageDetectionResult {
  primaryLanguage: SupportedOcrLanguage;
  confidence: number;
  dominantScript: ScriptKind | 'mixed' | 'unknown';
  candidates: LanguageCandidate[];
}

function tokenize(text: string): string[] {
  return Array.from(text.toLowerCase().matchAll(/\p{L}+/gu), (match) => match[0] ?? '').filter(Boolean);
}

function detectDominantScript(text: string): LanguageDetectionResult['dominantScript'] {
  let latinCount = 0;
  let cyrillicCount = 0;
  let devanagariCount = 0;
  let hanCount = 0;
  let kanaCount = 0;
  let arabicCount = 0;

  for (const char of text) {
    if (/\p{Script=Latin}/u.test(char)) {
      latinCount += 1;
    } else if (/\p{Script=Cyrillic}/u.test(char)) {
      cyrillicCount += 1;
    } else if (/\p{Script=Devanagari}/u.test(char)) {
      devanagariCount += 1;
    } else if (/\p{Script=Arabic}/u.test(char)) {
      arabicCount += 1;
    } else if (/\p{Script=Han}/u.test(char)) {
      hanCount += 1;
    } else if (/\p{Script=Hiragana}|\p{Script=Katakana}/u.test(char)) {
      kanaCount += 1;
    }
  }

  const total = latinCount + cyrillicCount + devanagariCount + hanCount + kanaCount + arabicCount;
  if (total === 0) {
    return 'unknown';
  }

  const latinShare = latinCount / total;
  const cyrillicShare = cyrillicCount / total;
  const devanagariShare = devanagariCount / total;
  const hanShare = hanCount / total;
  const arabicShare = arabicCount / total;
  const japaneseShare = (hanCount + kanaCount) / total;
  const kanaShare = kanaCount / total;

  if (latinShare > 0.8) {
    return 'latin';
  }
  if (cyrillicShare > 0.8) {
    return 'cyrillic';
  }
  if (devanagariShare > 0.6) {
    return 'devanagari';
  }
  if (arabicShare > 0.6) {
    return 'arabic';
  }
  if (japaneseShare > 0.7 && kanaShare > 0.04) {
    return 'japanese';
  }
  if (hanShare > 0.7) {
    return 'han';
  }
  return 'mixed';
}

export function detectDocumentLanguage(text: string): LanguageDetectionResult {
  const tokens = tokenize(text);
  const dominantScript = detectDominantScript(text);

  const scores = (Object.entries(LANGUAGE_MODELS) as Array<[SupportedOcrLanguage, LanguageModel]>).map(
    ([language, model]): LanguageCandidate => {
      let score = 0;

      for (const token of tokens) {
        if (model.stopwords.includes(token)) {
          score += 1;
          continue;
        }

        // For languages without reliable whitespace tokenization, allow stopword substring matching.
        if ((language === 'jpn' || language === 'chi_sim') && model.stopwords.some((word) => token.includes(word))) {
          score += 0.45;
        }
      }

      if (dominantScript === model.script) {
        score += 1.5;
      }

      // Distinguish Ukrainian from Russian on unique letters.
      if (language === 'ukr' && /[іїєґ]/u.test(text.toLowerCase())) {
        score += 2;
      }
      if (language === 'rus' && /[ыэъ]/u.test(text.toLowerCase())) {
        score += 1.5;
      }

      return { language, score };
    },
  );

  scores.sort((a, b) => b.score - a.score);
  const top = scores[0] ?? { language: 'eng' as const, score: 0 };
  const totalScore = scores.reduce((sum, item) => sum + item.score, 0);
  const confidence = totalScore > 0 ? top.score / totalScore : 0;

  return {
    primaryLanguage: top.language,
    confidence: Number(confidence.toFixed(3)),
    dominantScript,
    candidates: scores.slice(0, 3).map((item) => ({ language: item.language, score: Number(item.score.toFixed(3)) })),
  };
}

export function selectAutoOcrLanguagePack(detection: LanguageDetectionResult): string {
  const base = detection.primaryLanguage;
  const second = detection.candidates[1];
  if (second && second.score > 0 && second.score >= detection.candidates[0].score * 0.6) {
    return `${base}+${second.language}`;
  }
  return base;
}
