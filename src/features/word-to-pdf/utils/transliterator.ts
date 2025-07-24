// Transliteration utility for Cyrillic fallback
export class Transliterator {
  private static instance: Transliterator;

  // Russian to Latin transliteration map
  private readonly cyrillicToLatin: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',

    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
    'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
    'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',

    // Ukrainian specific
    'і': 'i', 'ї': 'yi', 'є': 'ye', 'ґ': 'g',
    'І': 'I', 'Ї': 'Yi', 'Є': 'Ye', 'Ґ': 'G',

    // Common symbols
    '№': 'No.', '₽': 'rub.'
  };

  static getInstance(): Transliterator {
    if (!this.instance) {
      this.instance = new Transliterator();
    }
    return this.instance;
  }

  transliterate(text: string): string {
    if (!text) return text;

    const result = text
      .split('')
      .map(char => {
        const replacement = this.cyrillicToLatin[char];
        // If character is not in map but is cyrillic, log warning
        if (replacement === undefined && /[\u0400-\u04FF]/.test(char)) {
          console.warn(`Cyrillic character not in transliteration map: "${char}" (${char.charCodeAt(0).toString(16)})`);
          return '?'; // Replace with question mark as fallback
        }
        return replacement !== undefined ? replacement : char;
      })
      .join('')
      .replace(/\s+/g, ' ') // Clean up multiple spaces
      .trim();

    return result;
  }

  // Check if text contains Cyrillic characters
  hasCyrillic(text: string): boolean {
    return /[\u0400-\u04FF]/.test(text);
  }

  // Get transliteration preview (first 100 chars)
  getPreview(text: string): {
    original: string;
    transliterated: string;
    hasChanges: boolean;
  } {
    const preview = text.substring(0, 100);
    const transliterated = this.transliterate(preview);

    return {
      original: preview + (text.length > 100 ? '...' : ''),
      transliterated: transliterated + (text.length > 100 ? '...' : ''),
      hasChanges: preview !== transliterated
    };
  }

  // Selective transliteration - only transliterate problematic characters
  selectiveTransliterate(text: string, unsupportedChars: string[]): string {
    if (!text || unsupportedChars.length === 0) return text;

    let result = text;

    unsupportedChars.forEach(char => {
      const replacement = this.cyrillicToLatin[char];
      if (replacement !== undefined) {
        result = result.replace(new RegExp(char, 'g'), replacement);
      }
    });

    return result;
  }

  // Get statistics about Cyrillic content
  getStatistics(text: string): {
    totalChars: number;
    cyrillicChars: number;
    cyrillicPercentage: number;
    uniqueCyrillicChars: string[];
    canTransliterate: boolean;
  } {
    const totalChars = text.length;
    const cyrillicMatches = text.match(/[\u0400-\u04FF]/g) || [];
    const cyrillicChars = cyrillicMatches.length;
    const uniqueCyrillicChars = [...new Set(cyrillicMatches)];

    // Check if all Cyrillic chars can be transliterated
    const canTransliterate = uniqueCyrillicChars.every(char =>
      this.cyrillicToLatin[char] !== undefined
    );

    return {
      totalChars,
      cyrillicChars,
      cyrillicPercentage: totalChars > 0 ? (cyrillicChars / totalChars) * 100 : 0,
      uniqueCyrillicChars,
      canTransliterate
    };
  }

  // Smart transliteration with context preservation
  smartTransliterate(text: string, preserveFormatting: boolean = true): string {
    if (!this.hasCyrillic(text)) return text;

    let result = text;
    const preservedPatterns: string[] = [];

    if (preserveFormatting) {
      // Preserve URLs, emails, and other special patterns
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

      // Replace URLs with placeholders
      result = result.replace(urlRegex, (match) => {
        preservedPatterns.push(match);
        return `__PRESERVED_${preservedPatterns.length - 1}__`;
      });

      // Replace emails with placeholders
      result = result.replace(emailRegex, (match) => {
        preservedPatterns.push(match);
        return `__PRESERVED_${preservedPatterns.length - 1}__`;
      });
    }

    // Perform transliteration - use basic method for reliability
    result = this.transliterate(result);

    // Double-check: ensure no cyrillic characters remain
    if (this.hasCyrillic(result)) {
      console.warn('Cyrillic characters still present after smart transliteration, applying basic transliteration');
      result = this.transliterate(result);
    }

    if (preserveFormatting && preservedPatterns.length > 0) {
      // Restore preserved patterns
      preservedPatterns.forEach((original, index) => {
        result = result.replace(`__PRESERVED_${index}__`, original);
      });
    }

    return result;
  }
}
