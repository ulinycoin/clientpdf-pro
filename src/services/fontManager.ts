import { FontSubset } from '../types/excelToPdf.types';

const AVAILABLE_FONT_SUBSETS: FontSubset[] = [
  {
    name: 'DejaVu Sans',
    subset: 'mixed',
    languages: ['en', 'ru', 'de', 'fr', 'es', 'no', 'sv', 'da'],
    size: 180000,
    loaded: false
  },
  {
    name: 'Noto Sans Latin',
    subset: 'latin',
    languages: ['en', 'fr', 'de', 'es', 'it', 'pt', 'nl', 'sv', 'no', 'da', 'fi'],
    size: 120000,
    loaded: false
  },
  {
    name: 'Noto Sans Cyrillic',
    subset: 'cyrillic',
    languages: ['ru', 'uk', 'bg', 'sr', 'mk', 'be'],
    size: 140000,
    loaded: false
  },
  {
    name: 'Noto Sans Arabic',
    subset: 'arabic',
    languages: ['ar', 'fa', 'ur'],
    size: 160000,
    loaded: false
  },
  {
    name: 'Noto Sans CJK',
    subset: 'cjk',
    languages: ['zh', 'ja', 'ko'],
    size: 250000,
    loaded: false
  }
];

export class FontManager {
  private loadedFonts = new Map<string, FontSubset>();
  private loadingPromises = new Map<string, Promise<FontSubset>>();

  async loadRequiredFonts(
    requiredSubsets: string[],
    onProgress?: (loaded: number, total: number, fontName: string) => void
  ): Promise<FontSubset[]> {
    const fontsToLoad = AVAILABLE_FONT_SUBSETS.filter(font =>
      requiredSubsets.some(subset => font.subset.includes(subset))
    );

    if (fontsToLoad.length === 0) {
      return [AVAILABLE_FONT_SUBSETS[0]];
    }

    const loadPromises = fontsToLoad.map(async (font, index) => {
      onProgress?.(index, fontsToLoad.length, font.name);
      return await this.loadFontSubset(font);
    });

    const loadedFonts = await Promise.all(loadPromises);
    onProgress?.(fontsToLoad.length, fontsToLoad.length, 'Complete');

    return loadedFonts.filter(font => font.loaded);
  }

  async loadFontSubset(fontSubset: FontSubset): Promise<FontSubset> {
    if (this.loadedFonts.has(fontSubset.name)) {
      return this.loadedFonts.get(fontSubset.name)!;
    }

    if (this.loadingPromises.has(fontSubset.name)) {
      return await this.loadingPromises.get(fontSubset.name)!;
    }

    const loadPromise = this.performFontLoad(fontSubset);
    this.loadingPromises.set(fontSubset.name, loadPromise);

    try {
      const result = await loadPromise;
      this.loadedFonts.set(fontSubset.name, result);
      return result;
    } finally {
      this.loadingPromises.delete(fontSubset.name);
    }
  }

  private async performFontLoad(fontSubset: FontSubset): Promise<FontSubset> {
    try {
      const mockFontData = this.generateMockFontData(fontSubset);

      const loadedFont: FontSubset = {
        ...fontSubset,
        loaded: true
      };

      await new Promise(resolve => setTimeout(resolve, 100));

      return loadedFont;
    } catch (error) {
      console.warn(`Failed to load font ${fontSubset.name}:`, error);
      return {
        ...fontSubset,
        loaded: false
      };
    }
  }

  private generateMockFontData(fontSubset: FontSubset): string {
    return `mock-font-data-${fontSubset.name.toLowerCase().replace(/\s+/g, '-')}`;
  }

  getBestFontForLanguages(languages: string[]): FontSubset {
    for (const font of AVAILABLE_FONT_SUBSETS) {
      if (languages.some(lang => font.languages.includes(lang))) {
        return font;
      }
    }
    return AVAILABLE_FONT_SUBSETS[0];
  }

  getFontBySubset(subset: string): FontSubset | undefined {
    return AVAILABLE_FONT_SUBSETS.find(font => font.subset === subset);
  }

  getAvailableFonts(): FontSubset[] {
    return [...AVAILABLE_FONT_SUBSETS];
  }

  isLanguageSupported(language: string): boolean {
    return AVAILABLE_FONT_SUBSETS.some(font =>
      font.languages.includes(language)
    );
  }

  getUnsupportedLanguages(languages: string[]): string[] {
    return languages.filter(lang => !this.isLanguageSupported(lang));
  }

  estimateLoadSize(requiredSubsets: string[]): number {
    return AVAILABLE_FONT_SUBSETS
      .filter(font => requiredSubsets.some(subset => font.subset.includes(subset)))
      .reduce((total, font) => total + font.size, 0);
  }
}

export const fontManager = new FontManager();
