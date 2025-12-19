/**
 * Smart Merge Service
 * AI-powered document analysis for intelligent PDF merging
 *
 * Features:
 * - Date extraction and chronological sorting
 * - Duplicate detection
 * - Filename pattern recognition
 * - Document metadata analysis
 */

import * as pdfjsLib from 'pdfjs-dist';

// Types
export interface DocumentAnalysis {
  fileId: string;
  fileName: string;
  fileSize: number;
  pageCount: number;

  // Extracted data
  dates: ExtractedDate[];
  primaryDate: Date | null;

  // Content fingerprint for duplicate detection
  contentHash: string;
  textSample: string; // First ~500 chars for comparison

  // Filename analysis
  filenameNumber: number | null;
  filenameDate: Date | null;

  // Metadata
  metadata: {
    title?: string;
    author?: string;
    creationDate?: Date;
    modificationDate?: Date;
  };
}

export interface ExtractedDate {
  value: Date;
  source: 'content' | 'filename' | 'metadata';
  confidence: number; // 0-1
  context: string; // Surrounding text
}

export interface DuplicateGroup {
  files: string[]; // file IDs
  similarity: number; // 0-1
  reason: 'exact' | 'similar_content' | 'similar_name';
}

export interface SmartSortSuggestion {
  type: 'date_asc' | 'date_desc' | 'filename' | 'size' | 'custom';
  label: string;
  description: string;
  order: string[]; // file IDs in suggested order
  confidence: number;
}

export interface SmartMergeAnalysis {
  documents: DocumentAnalysis[];
  duplicates: DuplicateGroup[];
  suggestions: SmartSortSuggestion[];
  warnings: SmartMergeWarning[];
  analysisTime: number;
}

export interface SmartMergeWarning {
  type: 'duplicate' | 'no_dates' | 'mixed_content' | 'large_file';
  message: string;
  fileIds: string[];
  severity: 'info' | 'warning' | 'error';
}

// Date parsing patterns (supports multiple formats and languages)
const DATE_PATTERNS = [
  // ISO format
  { regex: /(\d{4})-(\d{2})-(\d{2})/, format: 'ISO' },
  // European: DD.MM.YYYY, DD/MM/YYYY
  { regex: /(\d{1,2})[./](\d{1,2})[./](\d{4})/, format: 'EU' },
  // US: MM/DD/YYYY
  { regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/, format: 'US' },
  // Written: January 15, 2024 / 15 January 2024
  { regex: /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i, format: 'WRITTEN_EU' },
  { regex: /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i, format: 'WRITTEN_US' },
  // Russian: 15 января 2024
  { regex: /(\d{1,2})\s+(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)\s+(\d{4})/i, format: 'RU' },
  // German: 15. Januar 2024
  { regex: /(\d{1,2})\.?\s+(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s+(\d{4})/i, format: 'DE' },
  // Short year: DD.MM.YY
  { regex: /(\d{1,2})[./](\d{1,2})[./](\d{2})(?!\d)/, format: 'SHORT_YEAR' },
];

const MONTH_NAMES: Record<string, number> = {
  // English
  'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
  'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11,
  // Russian
  'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3, 'мая': 4, 'июня': 5,
  'июля': 6, 'августа': 7, 'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11,
  // German
  'januar': 0, 'februar': 1, 'märz': 2, 'mai': 4, 'juni': 5,
  'juli': 6, 'oktober': 9, 'dezember': 11,
};

class SmartMergeService {
  private static instance: SmartMergeService;

  static getInstance(): SmartMergeService {
    if (!this.instance) {
      this.instance = new SmartMergeService();
    }
    return this.instance;
  }

  /**
   * Analyze multiple PDF files for smart merging
   */
  async analyzeDocuments(
    files: Array<{ id: string; file: File }>,
    onProgress?: (progress: number, message: string) => void
  ): Promise<SmartMergeAnalysis> {
    const startTime = performance.now();
    const documents: DocumentAnalysis[] = [];

    onProgress?.(0, 'Starting document analysis...');

    // Analyze each document
    for (let i = 0; i < files.length; i++) {
      const { id, file } = files[i];
      onProgress?.(
        ((i + 1) / files.length) * 70,
        `Analyzing ${file.name}...`
      );

      try {
        const analysis = await this.analyzeDocument(id, file);
        documents.push(analysis);
      } catch (error) {
        console.warn(`Failed to analyze ${file.name}:`, error);
        // Add minimal analysis for failed files
        documents.push({
          fileId: id,
          fileName: file.name,
          fileSize: file.size,
          pageCount: 0,
          dates: [],
          primaryDate: null,
          contentHash: '',
          textSample: '',
          filenameNumber: this.extractNumberFromFilename(file.name),
          filenameDate: this.extractDateFromFilename(file.name),
          metadata: {},
        });
      }
    }

    onProgress?.(75, 'Detecting duplicates...');
    const duplicates = this.detectDuplicates(documents);

    onProgress?.(85, 'Generating suggestions...');
    const suggestions = this.generateSortSuggestions(documents);

    onProgress?.(95, 'Finalizing analysis...');
    const warnings = this.generateWarnings(documents, duplicates);

    onProgress?.(100, 'Analysis complete!');

    return {
      documents,
      duplicates,
      suggestions,
      warnings,
      analysisTime: performance.now() - startTime,
    };
  }

  /**
   * Analyze a single PDF document
   */
  private async analyzeDocument(id: string, file: File): Promise<DocumentAnalysis> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // Get metadata
    const metadata = await pdf.getMetadata();
    const info = metadata?.info as Record<string, string> || {};

    // Extract text from first few pages (limit for performance)
    const maxPagesToScan = Math.min(pdf.numPages, 5);
    let fullText = '';

    for (let pageNum = 1; pageNum <= maxPagesToScan; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      fullText += pageText + '\n';
    }

    // Extract dates from content
    const contentDates = this.extractDatesFromText(fullText);

    // Extract date from filename
    const filenameDate = this.extractDateFromFilename(file.name);
    if (filenameDate) {
      contentDates.push({
        value: filenameDate,
        source: 'filename',
        confidence: 0.9,
        context: file.name,
      });
    }

    // Add metadata dates
    if (info.CreationDate) {
      const creationDate = this.parsePdfDate(info.CreationDate);
      if (creationDate) {
        contentDates.push({
          value: creationDate,
          source: 'metadata',
          confidence: 0.7,
          context: 'PDF Creation Date',
        });
      }
    }

    // Sort dates by confidence and select primary
    contentDates.sort((a, b) => b.confidence - a.confidence);
    const primaryDate = contentDates.length > 0 ? contentDates[0].value : null;

    // Generate content hash for duplicate detection
    const textSample = fullText.slice(0, 500).trim();
    const contentHash = await this.hashText(textSample);

    return {
      fileId: id,
      fileName: file.name,
      fileSize: file.size,
      pageCount: pdf.numPages,
      dates: contentDates,
      primaryDate,
      contentHash,
      textSample,
      filenameNumber: this.extractNumberFromFilename(file.name),
      filenameDate,
      metadata: {
        title: info.Title || undefined,
        author: info.Author || undefined,
        creationDate: info.CreationDate ? this.parsePdfDate(info.CreationDate) || undefined : undefined,
        modificationDate: info.ModDate ? this.parsePdfDate(info.ModDate) || undefined : undefined,
      },
    };
  }

  /**
   * Extract dates from text content
   */
  private extractDatesFromText(text: string): ExtractedDate[] {
    const dates: ExtractedDate[] = [];
    const seen = new Set<number>(); // Avoid duplicate timestamps

    for (const pattern of DATE_PATTERNS) {
      const matches = text.matchAll(new RegExp(pattern.regex, 'gi'));

      for (const match of matches) {
        try {
          const date = this.parseMatchToDate(match, pattern.format);
          if (date && !isNaN(date.getTime()) && !seen.has(date.getTime())) {
            // Validate date is reasonable (1990 - 2100)
            const year = date.getFullYear();
            if (year >= 1990 && year <= 2100) {
              seen.add(date.getTime());

              // Get context (surrounding text)
              const start = Math.max(0, match.index! - 30);
              const end = Math.min(text.length, match.index! + match[0].length + 30);
              const context = text.slice(start, end).replace(/\s+/g, ' ').trim();

              dates.push({
                value: date,
                source: 'content',
                confidence: this.calculateDateConfidence(match[0], context),
                context,
              });
            }
          }
        } catch {
          // Skip invalid dates
        }
      }
    }

    return dates;
  }

  /**
   * Parse regex match to Date based on format
   */
  private parseMatchToDate(match: RegExpMatchArray, format: string): Date | null {
    try {
      let day: number, month: number, year: number;

      switch (format) {
        case 'ISO':
          year = parseInt(match[1]);
          month = parseInt(match[2]) - 1;
          day = parseInt(match[3]);
          break;
        case 'EU':
          day = parseInt(match[1]);
          month = parseInt(match[2]) - 1;
          year = parseInt(match[3]);
          break;
        case 'US':
          month = parseInt(match[1]) - 1;
          day = parseInt(match[2]);
          year = parseInt(match[3]);
          break;
        case 'WRITTEN_EU':
          day = parseInt(match[1]);
          month = MONTH_NAMES[match[2].toLowerCase()] ?? 0;
          year = parseInt(match[3]);
          break;
        case 'WRITTEN_US':
          month = MONTH_NAMES[match[1].toLowerCase()] ?? 0;
          day = parseInt(match[2]);
          year = parseInt(match[3]);
          break;
        case 'RU':
        case 'DE':
          day = parseInt(match[1]);
          month = MONTH_NAMES[match[2].toLowerCase()] ?? 0;
          year = parseInt(match[3]);
          break;
        case 'SHORT_YEAR':
          day = parseInt(match[1]);
          month = parseInt(match[2]) - 1;
          year = parseInt(match[3]);
          year = year < 50 ? 2000 + year : 1900 + year;
          break;
        default:
          return null;
      }

      // Validate day/month ranges
      if (day < 1 || day > 31 || month < 0 || month > 11) {
        return null;
      }

      return new Date(year, month, day);
    } catch {
      return null;
    }
  }

  /**
   * Extract date from filename
   */
  private extractDateFromFilename(filename: string): Date | null {
    // Common filename date patterns
    const patterns = [
      /(\d{4})-(\d{2})-(\d{2})/, // 2024-01-15
      /(\d{4})(\d{2})(\d{2})/, // 20240115
      /(\d{2})-(\d{2})-(\d{4})/, // 15-01-2024
      /(\d{2})\.(\d{2})\.(\d{4})/, // 15.01.2024
    ];

    for (const pattern of patterns) {
      const match = filename.match(pattern);
      if (match) {
        // Try to parse as ISO first
        if (match[1].length === 4) {
          const date = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
          if (!isNaN(date.getTime())) return date;
        } else {
          // DD-MM-YYYY or DD.MM.YYYY
          const date = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
          if (!isNaN(date.getTime())) return date;
        }
      }
    }

    return null;
  }

  /**
   * Extract number from filename (for sorting)
   */
  private extractNumberFromFilename(filename: string): number | null {
    // Remove extension
    const name = filename.replace(/\.[^/.]+$/, '');

    // Common patterns: part1, chapter2, 01_document, document_03
    const patterns = [
      /(?:part|chapter|section|page|doc|file|item)[\s_-]*(\d+)/i,
      /(\d+)[\s_-]*(?:part|chapter|section|page|doc|file|item)/i,
      /^(\d+)[\s_.-]/,
      /[\s_.-](\d+)$/,
      /[_-](\d+)[_-]/,
    ];

    for (const pattern of patterns) {
      const match = name.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }

    // Try to find any standalone number
    const numbers = name.match(/\d+/g);
    if (numbers && numbers.length === 1) {
      return parseInt(numbers[0]);
    }

    return null;
  }

  /**
   * Calculate confidence score for extracted date
   */
  private calculateDateConfidence(dateStr: string, context: string): number {
    let confidence = 0.5;

    // Boost for common date indicators in context
    const dateIndicators = ['date', 'dated', 'issued', 'created', 'signed', 'effective', 'дата', 'datum'];
    if (dateIndicators.some(ind => context.toLowerCase().includes(ind))) {
      confidence += 0.2;
    }

    // Boost for full format (with month name)
    if (/[a-zA-Zа-яА-ЯёЁ]{3,}/.test(dateStr)) {
      confidence += 0.1;
    }

    // Boost for 4-digit year
    if (/\d{4}/.test(dateStr)) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1);
  }

  /**
   * Parse PDF date format (D:YYYYMMDDHHmmSS)
   */
  private parsePdfDate(pdfDate: string): Date | null {
    if (!pdfDate) return null;

    // Remove 'D:' prefix if present
    const cleaned = pdfDate.replace(/^D:/, '');

    // Try to parse YYYYMMDDHHMMSS format
    const match = cleaned.match(/^(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?/);
    if (match) {
      return new Date(
        parseInt(match[1]),
        parseInt(match[2]) - 1,
        parseInt(match[3]),
        parseInt(match[4] || '0'),
        parseInt(match[5] || '0'),
        parseInt(match[6] || '0')
      );
    }

    // Try standard Date parsing
    const date = new Date(pdfDate);
    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * Simple hash function for text comparison
   */
  private async hashText(text: string): Promise<string> {
    // Normalize text
    const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();

    // Use SubtleCrypto if available
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(normalized);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Fallback: simple hash
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * Detect duplicate or similar documents
   */
  private detectDuplicates(documents: DocumentAnalysis[]): DuplicateGroup[] {
    const duplicates: DuplicateGroup[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < documents.length; i++) {
      if (processed.has(documents[i].fileId)) continue;

      const group: string[] = [documents[i].fileId];

      for (let j = i + 1; j < documents.length; j++) {
        if (processed.has(documents[j].fileId)) continue;

        const similarity = this.calculateSimilarity(documents[i], documents[j]);

        if (similarity.score > 0.8) {
          group.push(documents[j].fileId);
          processed.add(documents[j].fileId);
        }
      }

      if (group.length > 1) {
        processed.add(documents[i].fileId);
        duplicates.push({
          files: group,
          similarity: 1, // Simplified - could calculate average
          reason: 'similar_content',
        });
      }
    }

    return duplicates;
  }

  /**
   * Calculate similarity between two documents
   */
  private calculateSimilarity(a: DocumentAnalysis, b: DocumentAnalysis): { score: number; reason: string } {
    // Exact hash match
    if (a.contentHash && a.contentHash === b.contentHash) {
      return { score: 1, reason: 'exact' };
    }

    // Similar file size and page count
    const sizeRatio = Math.min(a.fileSize, b.fileSize) / Math.max(a.fileSize, b.fileSize);
    const pageRatio = a.pageCount && b.pageCount
      ? Math.min(a.pageCount, b.pageCount) / Math.max(a.pageCount, b.pageCount)
      : 0;

    // Text similarity (simple Jaccard)
    const textSim = this.calculateTextSimilarity(a.textSample, b.textSample);

    // Weighted score
    const score = (sizeRatio * 0.2) + (pageRatio * 0.2) + (textSim * 0.6);

    return { score, reason: 'similar_content' };
  }

  /**
   * Simple text similarity using word overlap
   */
  private calculateTextSimilarity(a: string, b: string): number {
    if (!a || !b) return 0;

    const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 3));

    if (wordsA.size === 0 || wordsB.size === 0) return 0;

    let intersection = 0;
    for (const word of wordsA) {
      if (wordsB.has(word)) intersection++;
    }

    // Jaccard similarity
    return intersection / (wordsA.size + wordsB.size - intersection);
  }

  /**
   * Generate smart sort suggestions
   */
  private generateSortSuggestions(documents: DocumentAnalysis[]): SmartSortSuggestion[] {
    const suggestions: SmartSortSuggestion[] = [];

    // Date-based sorting (if dates found)
    const docsWithDates = documents.filter(d => d.primaryDate);
    if (docsWithDates.length >= documents.length * 0.5) {
      // Chronological (oldest first)
      const dateAscOrder = [...documents].sort((a, b) => {
        if (!a.primaryDate && !b.primaryDate) return 0;
        if (!a.primaryDate) return 1;
        if (!b.primaryDate) return -1;
        return a.primaryDate.getTime() - b.primaryDate.getTime();
      });

      suggestions.push({
        type: 'date_asc',
        label: 'Chronological',
        description: 'Sort by date (oldest first)',
        order: dateAscOrder.map(d => d.fileId),
        confidence: docsWithDates.length / documents.length,
      });

      // Reverse chronological (newest first)
      suggestions.push({
        type: 'date_desc',
        label: 'Newest First',
        description: 'Sort by date (newest first)',
        order: [...dateAscOrder].reverse().map(d => d.fileId),
        confidence: docsWithDates.length / documents.length,
      });
    }

    // Filename number sorting
    const docsWithNumbers = documents.filter(d => d.filenameNumber !== null);
    if (docsWithNumbers.length >= documents.length * 0.5) {
      const numberOrder = [...documents].sort((a, b) => {
        if (a.filenameNumber === null && b.filenameNumber === null) return 0;
        if (a.filenameNumber === null) return 1;
        if (b.filenameNumber === null) return -1;
        return a.filenameNumber - b.filenameNumber;
      });

      suggestions.push({
        type: 'filename',
        label: 'By Filename',
        description: 'Sort by numbers in filenames',
        order: numberOrder.map(d => d.fileId),
        confidence: docsWithNumbers.length / documents.length,
      });
    }

    // Size sorting
    const sizeOrder = [...documents].sort((a, b) => b.fileSize - a.fileSize);
    suggestions.push({
      type: 'size',
      label: 'By Size',
      description: 'Sort by file size (largest first)',
      order: sizeOrder.map(d => d.fileId),
      confidence: 0.3,
    });

    // Sort suggestions by confidence
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Generate warnings for potential issues
   */
  private generateWarnings(
    documents: DocumentAnalysis[],
    duplicates: DuplicateGroup[]
  ): SmartMergeWarning[] {
    const warnings: SmartMergeWarning[] = [];

    // Duplicate warnings
    for (const group of duplicates) {
      warnings.push({
        type: 'duplicate',
        message: `${group.files.length} files appear to be duplicates or very similar`,
        fileIds: group.files,
        severity: 'warning',
      });
    }

    // No dates warning
    const docsWithoutDates = documents.filter(d => !d.primaryDate);
    if (docsWithoutDates.length > documents.length * 0.5) {
      warnings.push({
        type: 'no_dates',
        message: 'Most documents have no detectable dates for smart sorting',
        fileIds: docsWithoutDates.map(d => d.fileId),
        severity: 'info',
      });
    }

    // Large file warning
    const largeFiles = documents.filter(d => d.fileSize > 50 * 1024 * 1024); // > 50MB
    if (largeFiles.length > 0) {
      warnings.push({
        type: 'large_file',
        message: `${largeFiles.length} file(s) are larger than 50MB`,
        fileIds: largeFiles.map(d => d.fileId),
        severity: 'info',
      });
    }

    return warnings;
  }

  /**
   * Apply a sort suggestion to reorder files
   */
  applySortSuggestion(
    files: Array<{ id: string;[key: string]: unknown }>,
    suggestion: SmartSortSuggestion
  ): Array<{ id: string;[key: string]: unknown }> {
    const fileMap = new Map(files.map(f => [f.id, f]));
    return suggestion.order
      .map(id => fileMap.get(id))
      .filter((f): f is NonNullable<typeof f> => f !== undefined);
  }

  /**
   * Format date for display
   */
  formatDate(date: Date, locale = 'en'): string {
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

export const smartMergeService = SmartMergeService.getInstance();
export default smartMergeService;
