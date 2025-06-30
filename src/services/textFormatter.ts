/**
 * Text Formatting Service for extracted PDF text
 * Phase 1: Quick wins - clean up and structure basic text
 */

export interface TextFormattingOptions {
  cleanLineBreaks: boolean;
  mergeHyphenatedWords: boolean;
  preserveParagraphs: boolean;
  detectHeadings: boolean;
  removeExtraSpaces: boolean;
  preserveListStructure: boolean;
}

export class TextFormatter {
  private static instance: TextFormatter;

  static getInstance(): TextFormatter {
    if (!this.instance) {
      this.instance = new TextFormatter();
    }
    return this.instance;
  }

  formatText(rawText: string, options: TextFormattingOptions): string {
    let formattedText = rawText;

    // 1. Remove extra spaces and normalize whitespace
    if (options.removeExtraSpaces) {
      formattedText = this.removeExtraSpaces(formattedText);
    }

    // 2. Merge hyphenated words (split across lines)
    if (options.mergeHyphenatedWords) {
      formattedText = this.mergeHyphenatedWords(formattedText);
    }

    // 3. Clean line breaks and preserve paragraphs
    if (options.cleanLineBreaks && options.preserveParagraphs) {
      formattedText = this.cleanLineBreaksAndPreserveParagraphs(formattedText);
    } else if (options.cleanLineBreaks) {
      formattedText = this.cleanLineBreaks(formattedText);
    }

    // 4. Detect and format headings
    if (options.detectHeadings) {
      formattedText = this.detectAndFormatHeadings(formattedText);
    }

    // 5. Preserve list structure
    if (options.preserveListStructure) {
      formattedText = this.preserveListStructure(formattedText);
    }

    // 6. Final cleanup
    formattedText = this.finalCleanup(formattedText);

    return formattedText;
  }

  private removeExtraSpaces(text: string): string {
    return text
      // Remove multiple spaces
      .replace(/ {2,}/g, ' ')
      // Remove spaces at start/end of lines
      .replace(/^ +/gm, '')
      .replace(/ +$/gm, '')
      // Fix spaces around punctuation
      .replace(/ +([,.!?;:])/g, '$1')
      .replace(/([.!?]) +/g, '$1 ');
  }

  private mergeHyphenatedWords(text: string): string {
    return text
      // Merge words split with hyphen at end of line
      .replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2')
      // Handle common hyphenation patterns
      .replace(/(\w+)-\s+(\w+)/g, (match, part1, part2) => {
        // Only merge if second part starts with lowercase (likely continuation)
        if (part2[0] === part2[0].toLowerCase()) {
          return part1 + part2;
        }
        return match;
      });
  }

  private cleanLineBreaks(text: string): string {
    return text
      // Replace single line breaks with spaces (within paragraphs)
      .replace(/([^\n])\n([^\n])/g, '$1 $2')
      // Keep double line breaks as paragraph separators
      .replace(/\n\n+/g, '\n\n');
  }

  private cleanLineBreaksAndPreserveParagraphs(text: string): string {
    return text
      // Split into potential paragraphs
      .split(/\n\s*\n/)
      .map(paragraph => {
        // Clean each paragraph internally
        return paragraph
          .replace(/\n+/g, ' ')
          .replace(/ +/g, ' ')
          .trim();
      })
      .filter(p => p.length > 0)
      .join('\n\n');
  }

  private detectAndFormatHeadings(text: string): string {
    const lines = text.split('\n');
    const formattedLines = lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) return line;

      // Detect heading patterns
      const isHeading = this.isLikelyHeading(trimmedLine, lines, index);
      
      if (isHeading) {
        // Format as heading with extra spacing
        return `\n## ${trimmedLine}\n`;
      }
      
      return line;
    });

    return formattedLines.join('\n');
  }

  private isLikelyHeading(line: string, allLines: string[], index: number): boolean {
    const trimmedLine = line.trim();
    
    // Skip very short or very long lines
    if (trimmedLine.length < 3 || trimmedLine.length > 100) {
      return false;
    }

    // Check for heading indicators
    const headingIndicators = [
      // All caps (but not ALL CAPS SPAM)
      /^[A-Z][A-Z\s\d\-]{2,50}[A-Z\d]$/.test(trimmedLine),
      // Starts with number (1. 2. 1.1 etc.)
      /^\d+[\.\)]\s/.test(trimmedLine),
      // Title case with few words
      /^[A-Z][a-z]+(\s[A-Z][a-z]+){1,5}$/.test(trimmedLine),
      // Ends with colon (but not mid-sentence)
      /^[A-Z].*:$/.test(trimmedLine) && trimmedLine.split(' ').length <= 8
    ];

    // Check context - headings often have empty lines before/after
    const prevLine = index > 0 ? allLines[index - 1].trim() : '';
    const nextLine = index < allLines.length - 1 ? allLines[index + 1].trim() : '';
    const hasSpacing = prevLine === '' || nextLine === '';

    return headingIndicators.some(indicator => indicator) && hasSpacing;
  }

  private preserveListStructure(text: string): string {
    const lines = text.split('\n');
    const formattedLines = lines.map(line => {
      const trimmedLine = line.trim();
      
      // Detect list items
      const listPatterns = [
        /^[\-\*\+]\s+(.+)$/,           // - * + bullets
        /^[\u2022\u2023\u25E6]\s+(.+)$/, // Unicode bullets
        /^\d+[\.\)]\s+(.+)$/,         // 1. 2) numbered
        /^[a-zA-Z][\.\)]\s+(.+)$/,    // a. b) lettered
        /^[ivxlcdm]+[\.\)]\s+(.+)$/i  // roman numerals
      ];

      for (const pattern of listPatterns) {
        const match = trimmedLine.match(pattern);
        if (match) {
          // Format list item with consistent indentation
          return `  • ${match[1]}`;
        }
      }

      return line;
    });

    return formattedLines.join('\n');
  }

  private finalCleanup(text: string): string {
    return text
      // Remove excessive line breaks
      .replace(/\n{4,}/g, '\n\n\n')
      // Fix spacing around headings
      .replace(/\n+##\s+/g, '\n\n## ')
      .replace(/##\s+(.+)\n+/g, '## $1\n\n')
      // Clean up start and end
      .trim();
  }

  // Get default formatting options
  getDefaultOptions(): TextFormattingOptions {
    return {
      cleanLineBreaks: true,
      mergeHyphenatedWords: true,
      preserveParagraphs: true,
      detectHeadings: true,
      removeExtraSpaces: true,
      preserveListStructure: true
    };
  }

  // Get minimal formatting options
  getMinimalOptions(): TextFormattingOptions {
    return {
      cleanLineBreaks: true,
      mergeHyphenatedWords: true,
      preserveParagraphs: false,
      detectHeadings: false,
      removeExtraSpaces: true,
      preserveListStructure: false
    };
  }

  // Preview formatting changes
  previewFormatting(text: string, options: TextFormattingOptions): {
    original: string;
    formatted: string;
    changes: string[];
  } {
    const originalLength = text.length;
    const formatted = this.formatText(text, options);
    const formattedLength = formatted.length;

    const changes = [];
    
    if (options.mergeHyphenatedWords) {
      const hyphenatedWords = (text.match(/\w+-\s*\n\s*\w+/g) || []).length;
      if (hyphenatedWords > 0) {
        changes.push(`Merged ${hyphenatedWords} hyphenated words`);
      }
    }

    if (options.removeExtraSpaces) {
      const extraSpaces = (text.match(/ {2,}/g) || []).length;
      if (extraSpaces > 0) {
        changes.push(`Cleaned ${extraSpaces} extra space groups`);
      }
    }

    if (options.detectHeadings) {
      const headings = (formatted.match(/## .+/g) || []).length;
      if (headings > 0) {
        changes.push(`Detected ${headings} headings`);
      }
    }

    changes.push(`Text length: ${originalLength} → ${formattedLength} characters`);

    return {
      original: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      formatted: formatted.substring(0, 200) + (formatted.length > 200 ? '...' : ''),
      changes
    };
  }
}