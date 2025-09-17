import { franc } from 'franc';

export interface LanguageDetectionResult {
  language: string;
  confidence: number;
  isCyrillic: boolean;
  recommendedFont: string;
}

export class LanguageDetector {
  private static instance: LanguageDetector;

  static getInstance(): LanguageDetector {
    if (!this.instance) {
      this.instance = new LanguageDetector();
    }
    return this.instance;
  }

  detectLanguage(text: string): LanguageDetectionResult {
    if (!text || text.trim().length < 10) {
      // For very short text, fall back to basic detection
      return this.fallbackDetection(text);
    }

    try {
      // Use franc for language detection
      const detectedLang = franc(text);

      // Map franc language codes to our format
      const language = this.mapLanguageCode(detectedLang);
      const isCyrillic = this.isCyrillicLanguage(language);

      return {
        language,
        confidence: this.calculateConfidence(text, language),
        isCyrillic,
        recommendedFont: this.getRecommendedFont(language, isCyrillic)
      };
    } catch (error) {
      console.warn('Language detection failed, using fallback:', error);
      return this.fallbackDetection(text);
    }
  }

  private fallbackDetection(text: string): LanguageDetectionResult {
    // Simple cyrillic detection based on character ranges
    const cyrillicRegex = /[\u0400-\u04FF]/;
    const isCyrillic = cyrillicRegex.test(text);

    return {
      language: isCyrillic ? 'ru' : 'en',
      confidence: 0.5, // Low confidence for fallback
      isCyrillic,
      recommendedFont: this.getRecommendedFont(isCyrillic ? 'ru' : 'en', isCyrillic)
    };
  }

  private mapLanguageCode(francCode: string): string {
    // Map franc language codes to our simplified codes
    const langMap: { [key: string]: string } = {
      'rus': 'ru',     // Russian
      'ukr': 'uk',     // Ukrainian
      'bul': 'bg',     // Bulgarian
      'srp': 'sr',     // Serbian
      'eng': 'en',     // English
      'fra': 'fr',     // French
      'deu': 'de',     // German
      'spa': 'es',     // Spanish
      'ita': 'it',     // Italian
      'und': 'en'      // Undetermined -> English
    };

    return langMap[francCode] || 'en'; // Default to English
  }

  private isCyrillicLanguage(language: string): boolean {
    const cyrillicLangs = ['ru', 'uk', 'bg', 'sr', 'mk', 'be'];
    return cyrillicLangs.includes(language);
  }

  private calculateConfidence(text: string, language: string): number {
    // Simple confidence calculation based on text characteristics
    const length = text.length;

    if (length < 50) return 0.3;
    if (length < 200) return 0.6;
    if (length < 500) return 0.8;
    return 0.9;
  }

  private getRecommendedFont(language: string, isCyrillic: boolean): string {
    if (isCyrillic) {
      // Cyrillic-supporting fonts in order of preference
      return 'DejaVu Sans'; // Will implement font loading later
    }

    // Latin fonts
    switch (language) {
      case 'en':
      case 'fr':
      case 'de':
      case 'es':
      case 'it':
        return 'Helvetica';
      default:
        return 'Helvetica';
    }
  }

  // Utility method to detect multiple languages in text
  detectMixedLanguages(text: string): LanguageDetectionResult[] {
    // Split text into paragraphs and detect language for each
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 20);

    if (paragraphs.length <= 1) {
      return [this.detectLanguage(text)];
    }

    const results: LanguageDetectionResult[] = [];

    for (const paragraph of paragraphs.slice(0, 5)) { // Limit to first 5 paragraphs
      const result = this.detectLanguage(paragraph);

      // Only add if we haven't seen this language before
      if (!results.find(r => r.language === result.language)) {
        results.push(result);
      }
    }

    return results.length > 0 ? results : [this.detectLanguage(text)];
  }

  // Get the primary language from mixed detection
  getPrimaryLanguage(text: string): LanguageDetectionResult {
    const mixed = this.detectMixedLanguages(text);

    // Return the language with highest confidence, prefer cyrillic if detected
    return mixed.reduce((best, current) => {
      if (current.isCyrillic && !best.isCyrillic) return current;
      if (current.confidence > best.confidence) return current;
      return best;
    });
  }
}
