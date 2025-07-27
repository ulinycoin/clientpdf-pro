import { franc } from 'franc';
import { LanguageDetectionResult } from '../types/excelToPdf.types';

const UNICODE_RANGES = {
  latin: [0x0000, 0x024F],
  cyrillic: [0x0400, 0x04FF],
  arabic: [0x0600, 0x06FF],
  cjk: [0x4E00, 0x9FFF],
  devanagari: [0x0900, 0x097F],
  thai: [0x0E00, 0x0E7F],
  hebrew: [0x0590, 0x05FF]
};

const FONT_SUBSET_MAP: Record<string, string[]> = {
  latin: ['en', 'fr', 'de', 'es', 'it', 'pt', 'nl', 'sv', 'no', 'da', 'fi'],
  cyrillic: ['ru', 'uk', 'bg', 'sr', 'mk', 'be'],
  arabic: ['ar', 'fa', 'ur'],
  cjk: ['zh', 'ja', 'ko'],
  devanagari: ['hi', 'ne', 'mr'],
  thai: ['th'],
  hebrew: ['he']
};

export async function detectLanguageFromText(text: string): Promise<LanguageDetectionResult> {
  if (!text || text.trim().length === 0) {
    return {
      primaryLanguage: 'en',
      confidence: 0.5,
      detectedLanguages: [{ language: 'en', confidence: 0.5, script: 'latin' }],
      requiredFontSubsets: ['latin']
    };
  }

  const cleanText = text.trim().slice(0, 1000);

  try {
    const francResult = franc(cleanText);
    const scriptAnalysis = analyzeUnicodeScripts(cleanText);

    const detectedLanguages = [
      {
        language: francResult === 'und' ? 'en' : francResult,
        confidence: francResult === 'und' ? 0.5 : 0.8,
        script: getPrimaryScript(scriptAnalysis)
      }
    ];

    scriptAnalysis.forEach(({ script, percentage }) => {
      if (percentage > 0.1) {
        const languages = FONT_SUBSET_MAP[script] || [];
        languages.forEach(lang => {
          if (!detectedLanguages.find(d => d.language === lang)) {
            detectedLanguages.push({
              language: lang,
              confidence: percentage,
              script
            });
          }
        });
      }
    });

    const requiredFontSubsets = Array.from(new Set(
      scriptAnalysis
        .filter(s => s.percentage > 0.05)
        .map(s => s.script)
    ));

    return {
      primaryLanguage: detectedLanguages[0].language,
      confidence: detectedLanguages[0].confidence,
      detectedLanguages,
      requiredFontSubsets
    };
  } catch (error) {
    console.warn('Language detection failed:', error);
    return {
      primaryLanguage: 'en',
      confidence: 0.5,
      detectedLanguages: [{ language: 'en', confidence: 0.5, script: 'latin' }],
      requiredFontSubsets: ['latin']
    };
  }
}

function analyzeUnicodeScripts(text: string): Array<{ script: string; percentage: number }> {
  const scriptCounts: Record<string, number> = {};
  let totalChars = 0;

  for (const char of text) {
    const code = char.codePointAt(0);
    if (!code || code < 32) continue;

    totalChars++;
    const script = getScriptForCodePoint(code);
    scriptCounts[script] = (scriptCounts[script] || 0) + 1;
  }

  return Object.entries(scriptCounts)
    .map(([script, count]) => ({
      script,
      percentage: count / totalChars
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

function getScriptForCodePoint(codePoint: number): string {
  for (const [script, [start, end]] of Object.entries(UNICODE_RANGES)) {
    if (codePoint >= start && codePoint <= end) {
      return script;
    }
  }
  return 'latin';
}

function getPrimaryScript(scriptAnalysis: Array<{ script: string; percentage: number }>): string {
  return scriptAnalysis.length > 0 ? scriptAnalysis[0].script : 'latin';
}

export function getRequiredFontSubset(languages: string[]): string {
  for (const [subset, langs] of Object.entries(FONT_SUBSET_MAP)) {
    if (languages.some(lang => langs.includes(lang))) {
      return subset;
    }
  }
  return 'latin';
}

export function isTextSupported(text: string, availableSubsets: string[]): boolean {
  const analysis = analyzeUnicodeScripts(text);
  const requiredSubsets = analysis
    .filter(s => s.percentage > 0.05)
    .map(s => s.script);

  return requiredSubsets.every(subset => availableSubsets.includes(subset));
}
