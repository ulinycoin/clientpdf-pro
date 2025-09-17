// Simple text formatter for extracted PDF text
export interface TextFormattingOptions {
  removeExtraSpaces: boolean;
  normalizeLineBreaks: boolean;
  removeEmptyLines: boolean;
  detectHeadings?: boolean;
  preserveListStructure?: boolean;
  trimWhitespace: boolean;
}

export interface FormattingPreview {
  changes: string[];
  preview: string;
}

/**
 * TextFormatter - Service for formatting and cleaning extracted PDF text
 *
 * Provides various text formatting options including:
 * - Removing extra spaces and normalizing whitespace
 * - Normalizing line breaks across different operating systems
 * - Removing empty lines and trimming whitespace
 * - Detecting headings and preserving list structures
 *
 * Uses singleton pattern to ensure consistent formatting across the application.
 */
export class TextFormatter {
  private static instance: TextFormatter;

  static getInstance(): TextFormatter {
    if (!this.instance) {
      this.instance = new TextFormatter();
    }
    return this.instance;
  }

  /**
   * Formats text according to the provided options
   *
   * @param text - The text to format
   * @param options - Formatting options object specifying which transformations to apply
   * @returns Formatted text string
   *
   * @example
   * ```typescript
   * const formatter = TextFormatter.getInstance()
   * const options = {
   *   removeExtraSpaces: true,
   *   normalizeLineBreaks: true,
   *   removeEmptyLines: true,
   *   trimWhitespace: true
   * }
   * const formatted = formatter.formatText('  Text  with\r\n\r\nextra  spaces  ', options)
   * // Returns: "Text with\nextra spaces"
   * ```
   */
  formatText(text: string, options: TextFormattingOptions): string {
    if (!text) {
      return text;
    }

    // If text is only whitespace and trimWhitespace is enabled, return empty string
    if (!text.trim() && options.trimWhitespace) {
      return '';
    }

    // If text is only whitespace but trimWhitespace is disabled, return original
    if (!text.trim()) {
      return text;
    }

    let formattedText = text;

    // Remove extra spaces
    if (options.removeExtraSpaces) {
      formattedText = formattedText.replace(/[ \t]+/g, ' ');
    }

    // Normalize line breaks
    if (options.normalizeLineBreaks) {
      formattedText = formattedText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }

    // Remove empty lines
    if (options.removeEmptyLines) {
      formattedText = formattedText.replace(/\n\s*\n/g, '\n');
    }

    // Trim whitespace
    if (options.trimWhitespace) {
      formattedText = formattedText.trim();
    }

    // Simple heading detection (lines that are all caps or followed by multiple newlines)
    if (options.detectHeadings) {
      formattedText = formattedText.replace(
        /^([A-Z\s]{5,})$/gm,
        '### $1'
      );
    }

    // Preserve list structure (lines starting with bullet points or numbers)
    if (options.preserveListStructure) {
      formattedText = formattedText.replace(
        /^(\s*)([•·▪▫‣⁃-]|\d+\.)\s+/gm,
        '$1$2 '
      );
    }

    return formattedText;
  }

  previewFormatting(text: string, options: TextFormattingOptions): FormattingPreview {
    const changes: string[] = [];

    if (options.removeExtraSpaces) {
      changes.push('Remove extra spaces');
    }
    if (options.normalizeLineBreaks) {
      changes.push('Normalize line breaks');
    }
    if (options.removeEmptyLines) {
      changes.push('Remove empty lines');
    }
    if (options.detectHeadings) {
      changes.push('Detect headings');
    }
    if (options.preserveListStructure) {
      changes.push('Preserve lists');
    }
    if (options.trimWhitespace) {
      changes.push('Trim whitespace');
    }

    const preview = this.formatText(text.substring(0, 200), options);

    return {
      changes,
      preview: preview + (text.length > 200 ? '...' : '')
    };
  }

  getDefaultOptions(): TextFormattingOptions {
    return {
      removeExtraSpaces: true,
      normalizeLineBreaks: true,
      removeEmptyLines: true,
      trimWhitespace: true,
      detectHeadings: false,
      preserveListStructure: false
    };
  }

  getMinimalOptions(): TextFormattingOptions {
    return {
      removeExtraSpaces: false,
      normalizeLineBreaks: true,
      removeEmptyLines: false,
      trimWhitespace: true,
      detectHeadings: false,
      preserveListStructure: false
    };
  }

  getAdvancedOptions(): TextFormattingOptions {
    return {
      removeExtraSpaces: true,
      normalizeLineBreaks: true,
      removeEmptyLines: true,
      trimWhitespace: true,
      detectHeadings: true,
      preserveListStructure: true
    };
  }
}
