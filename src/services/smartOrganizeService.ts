/**
 * Smart Organize Service
 * AI-powered page analysis for intelligent PDF organization
 *
 * Features:
 * - Blank page detection
 * - Duplicate page detection
 * - Chapter/section detection
 * - Rotation detection (landscape vs portrait)
 * - Page type classification
 */

import * as pdfjsLib from 'pdfjs-dist';

// Types
export interface PageAnalysis {
  pageNumber: number;

  // Content analysis
  isBlank: boolean;
  blankConfidence: number;
  textLength: number;
  hasImages: boolean;

  // Structure detection
  isChapterStart: boolean;
  chapterTitle: string | null;
  isTOC: boolean; // Table of Contents
  isCover: boolean;

  // Orientation
  needsRotation: boolean;
  suggestedRotation: 0 | 90 | 180 | 270;
  isLandscape: boolean;

  // Quality indicators
  textDensity: number; // 0-1

  // Content hash for duplicate detection
  contentHash: string;
}

export interface DuplicatePageGroup {
  pages: number[]; // page numbers
  similarity: number;
}

export interface ChapterInfo {
  title: string;
  startPage: number;
  endPage: number | null;
}

export interface SmartOrganizeAnalysis {
  pages: PageAnalysis[];

  // Detected issues
  blankPages: number[];
  duplicateGroups: DuplicatePageGroup[];
  rotationNeeded: number[];

  // Structure
  chapters: ChapterInfo[];
  tocPages: number[];
  coverPage: number | null;

  // Summary
  totalPages: number;
  issuesCount: number;
  analysisTime: number;
}

export interface SmartAction {
  type: 'remove_blank' | 'remove_duplicates' | 'fix_rotation' | 'move_toc' | 'group_chapters';
  label: string;
  description: string;
  affectedPages: number[];
  icon: string;
}

// Chapter detection patterns - Expanded for 9 languages
const CHAPTER_PATTERNS = [
  // English
  /^chapter\s+(\d+|[ivxlcdm]+)/i,
  /^part\s+(\d+|[ivxlcdm]+|one|two|three)/i,
  /^section\s+(\d+)/i,
  /^introduction/i,
  /^preface/i,
  /^conclusion/i,
  /^appendix/i,
  /^index/i,

  // Russian
  /^глава\s+(\d+|[ivxlcdm]+)/i,
  /^часть\s+(\d+|[ivxlcdm]+)/i,
  /^раздел\s+(\d+)/i,
  /^введение/i,
  /^предисловие/i,
  /^заключение/i,
  /^приложение/i,

  // German
  /^kapitel\s+(\d+|[ivxlcdm]+)/i,
  /^teil\s+(\d+|[ivxlcdm]+)/i,
  /^einführung/i,
  /^einleitung/i,
  /^anhang/i,

  // French
  /^chapitre\s+(\d+|[ivxlcdm]+)/i,
  /^partie\s+(\d+|[ivxlcdm]+)/i,
  /^introduction/i,
  /^annexe/i,

  // Spanish/Portuguese
  /^capítulo\s+(\d+|[ivxlcdm]+)/i,
  /^parte\s+(\d+|[ivxlcdm]+)/i,
  /^sección\s+(\d+)/i,
  /^introducción/i,
  /^introdução/i,
  /^anexo/i,

  // Italian
  /^capitolo\s+(\d+|[ivxlcdm]+)/i,
  /^parte\s+(\d+|[ivxlcdm]+)/i,
  /^introduzione/i,
  /^appendice/i,

  // CJK (Chinese, Japanese)
  /^(第)?\s*(\d+|[零一二三四五六七八九十百]+)\s*(章|节|部|篇)/, // Chapter/Section X
  /^绪论/, // Introduction (ZH)
  /^はじめに/, // Introduction (JA)
  /^前言/, // Preface

  // Generic Numbering
  /^(\d+)\.\s+/,
  /^[IVXLCDM]+\.\s+/,
];

const TOC_PATTERNS = [
  /table\s+of\s+contents/i,
  /contents/i,
  /оглавление/i,
  /содержание/i,
  /inhaltsverzeichnis/i,
  /sommaire/i,
  /índice/i,
  /indice/i,
  /目录/, // ZH
  /目次/, // JA
];



class SmartOrganizeService {
  private static instance: SmartOrganizeService;

  static getInstance(): SmartOrganizeService {
    if (!this.instance) {
      this.instance = new SmartOrganizeService();
    }
    return this.instance;
  }

  /**
   * Analyze all pages in a PDF document
   */
  async analyzeDocument(
    file: File,
    onProgress?: (progress: number, message: string) => void
  ): Promise<SmartOrganizeAnalysis> {
    const startTime = performance.now();

    onProgress?.(0, 'Loading document...');

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;

    const pages: PageAnalysis[] = [];

    // Analyze each page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      onProgress?.(
        (pageNum / totalPages) * 80,
        `Analyzing page ${pageNum} of ${totalPages}...`
      );

      const analysis = await this.analyzePage(pdf, pageNum);
      pages.push(analysis);
    }

    onProgress?.(85, 'Detecting duplicates...');
    const duplicateGroups = this.detectDuplicatePages(pages);

    onProgress?.(90, 'Identifying structure...');
    const chapters = this.detectChapters(pages);

    onProgress?.(95, 'Generating recommendations...');

    // Collect results
    const blankPages = pages.filter(p => p.isBlank).map(p => p.pageNumber);
    const rotationNeeded = pages.filter(p => p.needsRotation).map(p => p.pageNumber);
    const tocPages = pages.filter(p => p.isTOC).map(p => p.pageNumber);
    const coverPage = pages.find(p => p.isCover)?.pageNumber || null;

    const issuesCount = blankPages.length +
      duplicateGroups.reduce((sum, g) => sum + g.pages.length - 1, 0) +
      rotationNeeded.length;

    onProgress?.(100, 'Analysis complete!');

    return {
      pages,
      blankPages,
      duplicateGroups,
      rotationNeeded,
      chapters,
      tocPages,
      coverPage,
      totalPages,
      issuesCount,
      analysisTime: performance.now() - startTime,
    };
  }

  /**
   * Analyze a single page
   */
  private async analyzePage(
    pdf: pdfjsLib.PDFDocumentProxy,
    pageNum: number
  ): Promise<PageAnalysis> {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });

    // Get text content
    const textContent = await page.getTextContent();
    const textItems = textContent.items as Array<{
      str: string;
      transform: number[];
      width?: number;
      fontName?: string;
    }>;
    const fullText = textItems.map(item => item.str).join(' ').trim();
    const textLength = fullText.length;

    // Analyze text positions for structure detection
    const textWithPositions = textItems.map(item => ({
      text: item.str,
      x: item.transform[4],
      y: item.transform[5],
      fontSize: Math.abs(item.transform[0]) || 12,
      width: item.width || 0,
      fontName: item.fontName,
    }));

    // Calculate median font size for heuristic analysis
    const fontSizes = textWithPositions.map(t => t.fontSize).sort((a, b) => a - b);
    const medianFontSize = fontSizes.length > 0
      ? fontSizes[Math.floor(fontSizes.length / 2)]
      : 12;

    // Check for images first (needed for blank detection)
    const hasImages = await this.detectImages(page);

    // Detect blank page (considering images)
    const { isBlank, confidence: blankConfidence } = this.detectBlankPage(
      textLength,
      textWithPositions,
      viewport,
      hasImages
    );

    // Detect page orientation issues
    const { needsRotation, suggestedRotation, isLandscape } = this.detectOrientation(
      textWithPositions,
      viewport
    );

    // Detect chapter start
    const { isChapterStart, chapterTitle } = this.detectChapterStart(
      fullText,
      textWithPositions,
      viewport,
      medianFontSize
    );

    // Detect TOC
    const isTOC = this.detectTOC(fullText);

    // Detect cover page (first page with minimal text, often just title)
    const isCover = pageNum === 1 && textLength < 500 && !isTOC;

    // Calculate text density
    const pageArea = viewport.width * viewport.height;
    const textDensity = Math.min(textLength / (pageArea / 100), 1);

    // Generate content hash for duplicate detection
    const contentHash = await this.hashContent(fullText);

    return {
      pageNumber: pageNum,
      isBlank,
      blankConfidence,
      textLength,
      hasImages,
      isChapterStart,
      chapterTitle,
      isTOC,
      isCover,
      needsRotation,
      suggestedRotation,
      isLandscape,
      textDensity,
      contentHash,
    };
  }

  /**
   * Detect if page is blank or nearly blank
   * Pages with images are NOT considered blank
   */
  private detectBlankPage(
    textLength: number,
    textItems: Array<{ text: string; fontSize: number }>,
    viewport: { width: number; height: number },
    hasImages: boolean
  ): { isBlank: boolean; confidence: number } {
    // If page has images, it's not blank (even without text)
    if (hasImages) {
      return { isBlank: false, confidence: 0 };
    }

    // Very little or no text (and no images)
    if (textLength < 10) {
      return { isBlank: true, confidence: 0.95 };
    }

    // Only whitespace or page numbers
    const meaningfulText = textItems.filter(
      item => item.text.trim().length > 2 && !/^\d+$/.test(item.text.trim())
    );

    if (meaningfulText.length === 0) {
      return { isBlank: true, confidence: 0.9 };
    }

    // Low text density
    const pageArea = viewport.width * viewport.height;
    const density = textLength / (pageArea / 100);

    if (density < 0.01 && textLength < 50) {
      return { isBlank: true, confidence: 0.7 };
    }

    return { isBlank: false, confidence: 0 };
  }

  /**
   * Detect page orientation issues
   */
  private detectOrientation(
    textItems: Array<{ text: string; x: number; y: number; width: number }>,
    viewport: { width: number; height: number }
  ): { needsRotation: boolean; suggestedRotation: 0 | 90 | 180 | 270; isLandscape: boolean } {
    const isLandscape = viewport.width > viewport.height;

    if (textItems.length < 5) {
      return { needsRotation: false, suggestedRotation: 0, isLandscape };
    }

    // Analyze text flow direction
    // If most text is positioned vertically (tall and narrow), might need rotation
    const textBounds = {
      minX: Math.min(...textItems.map(t => t.x)),
      maxX: Math.max(...textItems.map(t => t.x + (t.width || 0))),
      minY: Math.min(...textItems.map(t => t.y)),
      maxY: Math.max(...textItems.map(t => t.y)),
    };

    const textWidth = textBounds.maxX - textBounds.minX;
    const textHeight = textBounds.maxY - textBounds.minY;

    // If text area is much taller than wide on a landscape page, might be rotated
    if (isLandscape && textHeight > textWidth * 2) {
      return { needsRotation: true, suggestedRotation: 90, isLandscape };
    }

    // If text area is much wider than tall on a portrait page, might be rotated
    if (!isLandscape && textWidth > textHeight * 2 && textItems.length > 20) {
      return { needsRotation: true, suggestedRotation: 270, isLandscape };
    }

    return { needsRotation: false, suggestedRotation: 0, isLandscape };
  }

  /**
   * Detect chapter/section start
   */
  private detectChapterStart(
    fullText: string,
    textItems: Array<{ text: string; fontSize: number; y: number }>,
    viewport: { height: number },
    medianFontSize: number
  ): { isChapterStart: boolean; chapterTitle: string | null } {
    // 1. Visual Detection (Language Agnostic)
    // Find significantly large text at the top of the page
    const visualHeader = this.detectVisualHeader(textItems, viewport, medianFontSize);
    if (visualHeader) {
      return { isChapterStart: true, chapterTitle: visualHeader };
    }

    // 2. Pattern Matching (9 Languages)
    // Get first few lines to check for keywords
    const firstLines = fullText.split(/\n|\r/).slice(0, 5).join(' ').trim();

    // Check against chapter patterns
    for (const pattern of CHAPTER_PATTERNS) {
      if (pattern.test(firstLines)) {
        // Extract chapter title (first significant text)
        // Some regexes capture the number, we want the whole line
        const match = firstLines.match(/^.{0,100}/);
        if (match) {
          // Clean up string
          const title = match[0].trim();
          // Remove trailing numbers if it's just a TOC line entry (heuristic)
          if (!/\.{3,}\s*\d+$/.test(title)) {
            return {
              isChapterStart: true,
              chapterTitle: title,
            };
          }
        }
      }
    }

    return { isChapterStart: false, chapterTitle: null };
  }

  /**
   * Detect header based on visual properties (font size, position)
   */
  private detectVisualHeader(
    textItems: Array<{ text: string; fontSize: number; y: number }>,
    viewport: { height: number },
    medianFontSize: number
  ): string | null {
    // Define "Top of page" as the upper 40%
    // PDF coordinates: origin (0,0) is usually bottom-left
    const topThreshold = viewport.height * 0.6;

    // Filter items at the top
    const topItems = textItems.filter(item => item.y > topThreshold);

    if (topItems.length === 0) return null;

    // Find the item with the largest font size
    let maxFontSize = 0;
    let maxFontItem = null;

    for (const item of topItems) {
      // Filter out noise / small numbers
      if (item.text.trim().length < 2) continue;

      if (item.fontSize > maxFontSize) {
        maxFontSize = item.fontSize;
        maxFontItem = item;
      }
    }

    // Heuristic: Header must be significantly larger than median (e.g. > 1.3x)
    // Or it must be absolutely large (e.g. > 20px)
    if (maxFontItem && (maxFontSize >= medianFontSize * 1.3 || maxFontSize > 18)) {
      const title = maxFontItem.text.trim();
      // Avoid empty or trivially short titles
      if (title.length > 2 && title.length < 100) {
        // Check if it's ALL CAPS (common for headers)
        const isAllCaps = title === title.toUpperCase() && /[A-Z]/.test(title);

        if (isAllCaps || maxFontSize >= medianFontSize * 1.5) {
          return title;
        }
      }
    }

    return null;
  }

  private detectTOC(
    fullText: string
  ): boolean {
    const lowerText = fullText.toLowerCase();

    // Check for TOC title in various languages
    for (const pattern of TOC_PATTERNS) {
      if (pattern.test(lowerText)) {
        return true;
      }
    }

    // Check for TOC-like structure (many page numbers)
    const pageNumberPattern = /\d+\s*$/gm;
    const pageNumbers = fullText.match(pageNumberPattern);

    // If more than 5 lines end with numbers, likely a TOC
    if (pageNumbers && pageNumbers.length > 5) {
      // Also check for dots or leaders (common in TOCs)
      if (/\.{3,}|\s{3,}\d+/.test(fullText)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if page has images
   */
  private async detectImages(page: pdfjsLib.PDFPageProxy): Promise<boolean> {
    try {
      const operatorList = await page.getOperatorList();
      // Look for image operators
      const imageOps = [
        pdfjsLib.OPS.paintImageXObject,
        pdfjsLib.OPS.paintImageXObjectRepeat,
        // @ts-expect-error - paintJpegXObject might be missing in some type definitions
        pdfjsLib.OPS.paintJpegXObject,
      ];

      return operatorList.fnArray.some(op => imageOps.includes(op));
    } catch {
      return false;
    }
  }

  /**
   * Generate content hash for duplicate detection
   */
  private async hashContent(text: string): Promise<string> {
    // Normalize text
    const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 1000);

    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(normalized);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Fallback simple hash
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Detect duplicate pages
   */
  private detectDuplicatePages(pages: PageAnalysis[]): DuplicatePageGroup[] {
    const groups: DuplicatePageGroup[] = [];
    const processed = new Set<number>();

    for (let i = 0; i < pages.length; i++) {
      if (processed.has(i) || pages[i].isBlank) continue;

      const group: number[] = [pages[i].pageNumber];

      for (let j = i + 1; j < pages.length; j++) {
        if (processed.has(j) || pages[j].isBlank) continue;

        // Compare hashes
        if (pages[i].contentHash === pages[j].contentHash) {
          group.push(pages[j].pageNumber);
          processed.add(j);
        }
        // Also check similar text length (within 10%)
        else if (
          Math.abs(pages[i].textLength - pages[j].textLength) < pages[i].textLength * 0.1 &&
          pages[i].textLength > 100
        ) {
          // Could be similar - would need more detailed comparison
          // For now, skip to avoid false positives
        }
      }

      if (group.length > 1) {
        processed.add(i);
        groups.push({ pages: group, similarity: 1 });
      }
    }

    return groups;
  }

  /**
   * Detect chapters structure
   */
  private detectChapters(pages: PageAnalysis[]): ChapterInfo[] {
    const chapters: ChapterInfo[] = [];

    for (let i = 0; i < pages.length; i++) {
      if (pages[i].isChapterStart && pages[i].chapterTitle) {
        // Find end of chapter (next chapter start or end of document)
        let endPage: number | null = null;
        for (let j = i + 1; j < pages.length; j++) {
          if (pages[j].isChapterStart) {
            endPage = pages[j].pageNumber - 1;
            break;
          }
        }

        chapters.push({
          title: pages[i].chapterTitle!,
          startPage: pages[i].pageNumber,
          endPage,
        });
      }
    }

    return chapters;
  }

  /**
   * Generate smart actions based on analysis
   */
  generateActions(analysis: SmartOrganizeAnalysis, t: (key: string) => string): SmartAction[] {
    const actions: SmartAction[] = [];

    // Remove blank pages
    if (analysis.blankPages.length > 0) {
      actions.push({
        type: 'remove_blank',
        label: t('smartOrganize.removeBlank') || 'Remove Blank Pages',
        description: `${analysis.blankPages.length} blank page(s) detected`,
        affectedPages: analysis.blankPages,
        icon: '📄',
      });
    }

    // Remove duplicate pages
    if (analysis.duplicateGroups.length > 0) {
      const duplicatePages = analysis.duplicateGroups.flatMap(g => g.pages.slice(1));
      actions.push({
        type: 'remove_duplicates',
        label: t('smartOrganize.removeDuplicates') || 'Remove Duplicates',
        description: `${duplicatePages.length} duplicate page(s) found`,
        affectedPages: duplicatePages,
        icon: '🔄',
      });
    }

    // Fix rotation
    if (analysis.rotationNeeded.length > 0) {
      actions.push({
        type: 'fix_rotation',
        label: t('smartOrganize.fixRotation') || 'Fix Rotation',
        description: `${analysis.rotationNeeded.length} page(s) may need rotation`,
        affectedPages: analysis.rotationNeeded,
        icon: '🔃',
      });
    }

    // Move TOC to front
    if (analysis.tocPages.length > 0 && analysis.tocPages[0] > 2) {
      actions.push({
        type: 'move_toc',
        label: t('smartOrganize.moveTOC') || 'Move TOC to Front',
        description: 'Table of Contents found on later pages',
        affectedPages: analysis.tocPages,
        icon: '📑',
      });
    }

    return actions;
  }
}

export const smartOrganizeService = SmartOrganizeService.getInstance();
export default smartOrganizeService;
