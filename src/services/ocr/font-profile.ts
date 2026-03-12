import type { LanguageDetectionResult } from './language-detector';

export interface FontSupportProfile {
  requiredScripts: Array<'latin' | 'cyrillic'>;
  recommendedSansSerifStack: string;
  recommendedMonospaceStack: string;
}

const LATIN_SANS = "'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif";
const CYRILLIC_SANS = "'Noto Sans', 'Segoe UI', 'Arial Unicode MS', Arial, sans-serif";
const MIXED_SANS = "'Noto Sans', 'Inter', 'Segoe UI', 'Arial Unicode MS', Arial, sans-serif";

const LATIN_MONO = "'JetBrains Mono', 'Fira Code', 'Consolas', monospace";
const CYRILLIC_MONO = "'Noto Sans Mono', 'JetBrains Mono', 'Consolas', monospace";
const MIXED_MONO = "'Noto Sans Mono', 'JetBrains Mono', 'Fira Code', 'Consolas', monospace";

export function buildFontSupportProfile(
  text: string,
  detection?: LanguageDetectionResult,
): FontSupportProfile {
  const hasLatin = /\p{Script=Latin}/u.test(text);
  const hasCyrillic = /\p{Script=Cyrillic}/u.test(text);
  const requiredScripts: Array<'latin' | 'cyrillic'> = [];

  if (hasLatin || detection?.dominantScript === 'latin') {
    requiredScripts.push('latin');
  }
  if (hasCyrillic || detection?.dominantScript === 'cyrillic') {
    requiredScripts.push('cyrillic');
  }
  if (requiredScripts.length === 0) {
    requiredScripts.push('latin');
  }

  const hasMixedScripts = requiredScripts.includes('latin') && requiredScripts.includes('cyrillic');
  if (hasMixedScripts) {
    return {
      requiredScripts,
      recommendedSansSerifStack: MIXED_SANS,
      recommendedMonospaceStack: MIXED_MONO,
    };
  }
  if (requiredScripts[0] === 'cyrillic') {
    return {
      requiredScripts,
      recommendedSansSerifStack: CYRILLIC_SANS,
      recommendedMonospaceStack: CYRILLIC_MONO,
    };
  }
  return {
    requiredScripts,
    recommendedSansSerifStack: LATIN_SANS,
    recommendedMonospaceStack: LATIN_MONO,
  };
}
