import fontkit from '@pdf-lib/fontkit';
import type { ToolLogicFunction } from '../../../core/types/contracts';

type PdfOrientation = 'portrait' | 'landscape';
type CellValue = string | number | null;
type SheetTable = CellValue[][];

const A4_PORTRAIT = { width: 595.28, height: 841.89 };
const A4_LANDSCAPE = { width: 841.89, height: 595.28 };
const TABLE_FONT_SIZE = 9;
const HEADER_FONT_SIZE = 9;
const TITLE_FONT_SIZE = 12;
const FOOTER_FONT_SIZE = 8;
const LINE_HEIGHT = 12;
const CELL_PADDING_X = 4;
const CELL_PADDING_Y = 3;
const MARGIN_X = 20;
const MARGIN_TOP = 20;
const MARGIN_BOTTOM = 20;
const HEADER_FILL = { r: 0.96, g: 0.96, b: 0.96 };
const BORDER_COLOR = { r: 0.85, g: 0.85, b: 0.85 };
const TEXT_COLOR = { r: 0.1, g: 0.1, b: 0.1 };

function isZipContainer(bytes: Uint8Array): boolean {
  return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b;
}

function isCfbContainer(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0xd0 &&
    bytes[1] === 0xcf &&
    bytes[2] === 0x11 &&
    bytes[3] === 0xe0 &&
    bytes[4] === 0xa1 &&
    bytes[5] === 0xb1 &&
    bytes[6] === 0x1a &&
    bytes[7] === 0xe1
  );
}

function isLikelyExcelBinary(bytes: Uint8Array): boolean {
  return isZipContainer(bytes) || isCfbContainer(bytes);
}

function normalizeCellValue(value: unknown): string | number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }
  if (typeof value === 'object') {
    if ('result' in value) {
      return normalizeCellValue((value as { result?: unknown }).result);
    }
    if ('text' in value && typeof (value as { text?: unknown }).text === 'string') {
      return (value as { text: string }).text;
    }
    if ('richText' in value && Array.isArray((value as { richText?: unknown }).richText)) {
      return ((value as { richText: Array<{ text?: string }> }).richText).map((part) => part.text ?? '').join('');
    }
  }
  return String(value);
}

function normalizeText(value: CellValue): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function normalizeSheetRows(rows: SheetTable): SheetTable {
  const maxColumns = rows.reduce((max, row) => Math.max(max, row.length), 0);
  if (maxColumns === 0) {
    return [];
  }
  return rows.map((row) => (row.length === maxColumns ? row : [...row, ...Array.from({ length: maxColumns - row.length }, () => null)]));
}

function colLettersToIndex(letters: string): number {
  let value = 0;
  for (let i = 0; i < letters.length; i += 1) {
    value = value * 26 + (letters.charCodeAt(i) - 64);
  }
  return value - 1;
}

function buildMergedColumnSet(merges: unknown): Set<number> {
  const mergedColumns = new Set<number>();
  if (!Array.isArray(merges)) {
    return mergedColumns;
  }

  for (const mergeRef of merges) {
    if (typeof mergeRef !== 'string') {
      continue;
    }
    const [startRef, endRef = startRef] = mergeRef.split(':');
    const startMatch = startRef.match(/^([A-Z]+)/i);
    const endMatch = endRef.match(/^([A-Z]+)/i);
    if (!startMatch || !endMatch) {
      continue;
    }
    const startCol = colLettersToIndex(startMatch[1].toUpperCase());
    const endCol = colLettersToIndex(endMatch[1].toUpperCase());
    for (let col = Math.min(startCol, endCol); col <= Math.max(startCol, endCol); col += 1) {
      mergedColumns.add(col);
    }
  }
  return mergedColumns;
}

export function findNonEmptyColumnIndexes(rows: SheetTable, mergedColumns: Set<number> = new Set<number>()): number[] {
  const normalizedRows = normalizeSheetRows(rows);
  const maxColumns = normalizedRows[0]?.length ?? 0;
  const indexes: number[] = [];

  for (let col = 0; col < maxColumns; col += 1) {
    if (mergedColumns.has(col)) {
      indexes.push(col);
      continue;
    }
    let hasValue = false;
    for (let row = 0; row < normalizedRows.length; row += 1) {
      if (normalizeText(normalizedRows[row][col]) !== '') {
        hasValue = true;
        break;
      }
    }
    if (hasValue) {
      indexes.push(col);
    }
  }
  return indexes;
}

export function stripEmptyColumns(rows: SheetTable, mergedColumns: Set<number> = new Set<number>()): SheetTable {
  const normalizedRows = normalizeSheetRows(rows);
  if (normalizedRows.length === 0) {
    return [];
  }
  const kept = findNonEmptyColumnIndexes(normalizedRows, mergedColumns);
  if (kept.length === 0) {
    return normalizedRows.map(() => []);
  }
  return normalizedRows.map((row) => kept.map((colIndex) => row[colIndex] ?? null));
}

function estimateColumnWidth(value: CellValue): number {
  const text = normalizeText(value);
  if (!text) {
    return 42;
  }
  const longestLine = text.split(/\r?\n/).reduce((max, line) => Math.max(max, line.length), 0);
  return Math.min(260, Math.max(42, 16 + longestLine * 5.6));
}

function computeColumnWidths(rows: SheetTable): number[] {
  const normalizedRows = normalizeSheetRows(rows);
  const widthCount = normalizedRows[0]?.length ?? 0;
  const widths = Array.from({ length: widthCount }, () => 42);
  for (const row of normalizedRows) {
    for (let i = 0; i < widthCount; i += 1) {
      widths[i] = Math.max(widths[i], estimateColumnWidth(row[i] ?? null));
    }
  }
  return widths;
}

function sumWidths(widths: number[]): number {
  return widths.reduce((acc, value) => acc + value, 0);
}

function pickOrientation(portraitPrintableWidth: number, totalColumnsWidth: number): PdfOrientation {
  return totalColumnsWidth <= portraitPrintableWidth ? 'portrait' : 'landscape';
}

export function splitIntoColumnBands(columnWidths: number[], maxWidth: number, stickyCount = 1): number[][] {
  if (columnWidths.length === 0) {
    return [];
  }
  if (sumWidths(columnWidths) <= maxWidth) {
    return [columnWidths.map((_, index) => index)];
  }

  const normalizedStickyCount = Math.max(0, Math.min(stickyCount, Math.max(0, columnWidths.length - 1)));
  const stickyIndexes = Array.from({ length: normalizedStickyCount }, (_, i) => i);
  const remainderIndexes = Array.from({ length: columnWidths.length - normalizedStickyCount }, (_, i) => i + normalizedStickyCount);
  const bands: number[][] = [];
  let pointer = 0;

  while (pointer < remainderIndexes.length) {
    const band = [...stickyIndexes];
    let used = stickyIndexes.reduce((acc, index) => acc + columnWidths[index], 0);

    while (pointer < remainderIndexes.length) {
      const currentIndex = remainderIndexes[pointer];
      const nextWidth = columnWidths[currentIndex];
      if (band.length > stickyIndexes.length && used + nextWidth > maxWidth) {
        break;
      }
      if (band.length === stickyIndexes.length && used + nextWidth > maxWidth) {
        band.push(currentIndex);
        pointer += 1;
        break;
      }
      band.push(currentIndex);
      used += nextWidth;
      pointer += 1;
    }

    if (band.length === stickyIndexes.length && pointer < remainderIndexes.length) {
      band.push(remainderIndexes[pointer]);
      pointer += 1;
    }
    bands.push(band);
  }

  return bands.length > 0 ? bands : [columnWidths.map((_, index) => index)];
}

function fitBandWidths(widths: number[], maxWidth: number): number[] {
  const total = sumWidths(widths);
  if (total <= maxWidth || total === 0) {
    return widths;
  }
  const scale = maxWidth / total;
  return widths.map((width) => Math.max(18, width * scale));
}

function projectRows(rows: SheetTable, indexes: number[]): SheetTable {
  return rows.map((row) => indexes.map((index) => row[index] ?? null));
}

function hasCyrillic(text: string): boolean {
  return /\p{Script=Cyrillic}/u.test(text);
}

function tokenize(text: string): string[] {
  const tokens = text.match(/\S+\s*|\s+/g);
  return tokens && tokens.length > 0 ? tokens : [text];
}

function breakLongWord(
  word: string,
  font: { widthOfTextAtSize: (text: string, size: number) => number },
  fontSize: number,
  maxWidth: number,
): string[] {
  const chunks: string[] = [];
  let current = '';
  for (const char of word) {
    const candidate = current + char;
    if (current.length > 0 && safeWidthOfText(font, candidate, fontSize) > maxWidth) {
      chunks.push(current);
      current = char;
    } else {
      current = candidate;
    }
  }
  if (current.length > 0) {
    chunks.push(current);
  }
  return chunks.length > 0 ? chunks : [word];
}

function wrapText(
  text: string,
  font: { widthOfTextAtSize: (text: string, size: number) => number },
  fontSize: number,
  maxWidth: number,
): string[] {
  const paragraphs = text.replace(/\r\n/g, '\n').split('\n');
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const clean = paragraph.trim();
    if (!clean) {
      lines.push('');
      continue;
    }

    const tokens = tokenize(clean);
    let current = '';
    for (const token of tokens) {
      const candidate = current + token;
      if (current && safeWidthOfText(font, candidate, fontSize) > maxWidth) {
        lines.push(current.trimEnd());
        current = token.trimStart();
        if (safeWidthOfText(font, current, fontSize) > maxWidth) {
          const broken = breakLongWord(current, font, fontSize, maxWidth);
          lines.push(...broken.slice(0, -1));
          current = broken[broken.length - 1] ?? '';
        }
      } else {
        current = candidate;
      }
    }
    if (current.trim().length > 0) {
      lines.push(current.trimEnd());
    }
  }

  return lines.length > 0 ? lines : [''];
}

function safeWidthOfText(
  font: { widthOfTextAtSize: (text: string, size: number) => number },
  text: string,
  fontSize: number,
): number {
  try {
    return font.widthOfTextAtSize(text, fontSize);
  } catch {
    return font.widthOfTextAtSize(sanitizeToWinAnsi(text), fontSize);
  }
}

function splitByScriptRuns(text: string): Array<{ text: string; isCyrillic: boolean }> {
  if (!text) {
    return [];
  }
  const runs: Array<{ text: string; isCyrillic: boolean }> = [];
  let current = '';
  let currentIsCyr = hasCyrillic(text[0] ?? '');
  for (const char of text) {
    const isCyr = hasCyrillic(char);
    if (current.length > 0 && isCyr !== currentIsCyr) {
      runs.push({ text: current, isCyrillic: currentIsCyr });
      current = char;
      currentIsCyr = isCyr;
      continue;
    }
    current += char;
  }
  if (current.length > 0) {
    runs.push({ text: current, isCyrillic: currentIsCyr });
  }
  return runs;
}

function drawMixedText(
  page: any,
  text: string,
  x: number,
  y: number,
  size: number,
  latinFont: any,
  cyrillicFont: any,
  color: { r: number; g: number; b: number },
  toRgb: (r: number, g: number, b: number) => any,
): void {
  let cursorX = x;
  const runs = splitByScriptRuns(text);
  for (const run of runs) {
    const runFont = run.isCyrillic ? cyrillicFont : latinFont;
    let renderText = run.text;
    try {
      page.drawText(renderText, {
        x: cursorX,
        y,
        font: runFont,
        size,
        color: toRgb(color.r, color.g, color.b),
      });
    } catch {
      renderText = sanitizeToWinAnsi(renderText);
      page.drawText(renderText, {
        x: cursorX,
        y,
        font: latinFont,
        size,
        color: toRgb(color.r, color.g, color.b),
      });
    }
    const measureFont = run.isCyrillic ? cyrillicFont : latinFont;
    cursorX += safeWidthOfText(measureFont, renderText, size);
  }
}

type PageSelector = (pageNumber: number) => boolean;

export function parsePageSelection(value: unknown): PageSelector {
  if (typeof value !== 'string' || value.trim() === '') {
    return () => true;
  }
  const tokens = value.split(',').map((part) => part.trim()).filter(Boolean);
  if (tokens.length === 0) {
    return () => true;
  }

  const ranges: Array<{ start: number; end: number }> = [];
  for (const token of tokens) {
    const rangeMatch = /^(\d+)-(\d+)$/.exec(token);
    if (rangeMatch) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);
      if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
        throw new Error(`Invalid page range: "${token}"`);
      }
      ranges.push({ start, end });
      continue;
    }
    if (!/^\d+$/.test(token)) {
      throw new Error(`Invalid page token: "${token}"`);
    }
    const page = Number(token);
    if (!Number.isInteger(page) || page < 1) {
      throw new Error(`Invalid page number: "${token}"`);
    }
    ranges.push({ start: page, end: page });
  }

  return (pageNumber: number) => ranges.some((r) => pageNumber >= r.start && pageNumber <= r.end);
}

async function loadFontBytes(url: string): Promise<Uint8Array> {
  if (url.startsWith('data:')) {
    const match = /^data:[^;]+;base64,(.+)$/i.exec(url);
    if (!match) {
      throw new Error('Unsupported data URL font payload');
    }
    if (typeof atob !== 'function') {
      throw new Error('Base64 decoder is unavailable in current runtime');
    }
    const binary = atob(match[1]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load font: ${response.status} ${url}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

async function resolveNotoFontBytes(): Promise<{ latinBytes: Uint8Array; cyrillicBytes: Uint8Array } | null> {
  try {
    const [latinInline, cyrillicInline] = await Promise.all([
      import('@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff?inline') as Promise<{ default: string }>,
      import('@fontsource/noto-sans/files/noto-sans-cyrillic-400-normal.woff?inline') as Promise<{ default: string }>,
    ]);
    return {
      latinBytes: await loadFontBytes(latinInline.default),
      cyrillicBytes: await loadFontBytes(cyrillicInline.default),
    };
  } catch {
    // Try URL mode below.
  }

  try {
    const [latinUrl, cyrillicUrl] = await Promise.all([
      import('@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff?url') as Promise<{ default: string }>,
      import('@fontsource/noto-sans/files/noto-sans-cyrillic-400-normal.woff?url') as Promise<{ default: string }>,
    ]);
    return {
      latinBytes: await loadFontBytes(latinUrl.default),
      cyrillicBytes: await loadFontBytes(cyrillicUrl.default),
    };
  } catch {
    return null;
  }
}

async function filterPdfPages(inputBlob: Blob, pageSelector: PageSelector): Promise<Blob> {
  const { PDFDocument } = await import('pdf-lib');
  const source = await PDFDocument.load(await inputBlob.arrayBuffer());
  const selectedIndexes: number[] = [];
  for (let i = 0; i < source.getPageCount(); i += 1) {
    if (pageSelector(i + 1)) {
      selectedIndexes.push(i);
    }
  }
  if (selectedIndexes.length === 0) {
    throw new Error('No pages matched selected range');
  }
  const output = await PDFDocument.create();
  const copied = await output.copyPages(source, selectedIndexes);
  for (const page of copied) {
    output.addPage(page);
  }
  const bytes = new Uint8Array(await output.save());
  return new Blob([bytes], { type: 'application/pdf' });
}

function sanitizeToWinAnsi(text: string): string {
  return text.replace(/[^\x20-\x7E]/g, '?');
}

export const run: ToolLogicFunction = async ({ inputIds, fs, emitProgress, options }) => {
  if (inputIds.length === 0) {
    throw new Error('Excel to PDF requires at least one input file');
  }

  const exceljsModule = await import('exceljs');
  const WorkbookCtor = (exceljsModule.default?.Workbook as (new () => any) | undefined);
  if (!WorkbookCtor) {
    throw new Error('Excel parser is unavailable: Workbook constructor not found');
  }

  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const outputIds: string[] = [];
  const selectedRange = options?.range === 'active-sheet' ? 'active-sheet' : 'workbook';
  const showGrid = options?.showGrid !== false;
  const forcedOrientation = options?.autoOrientation === false && options?.orientation === 'portrait'
    ? 'portrait'
    : (options?.autoOrientation === false && options?.orientation === 'landscape' ? 'landscape' : null);
  const pageSelector = parsePageSelection(options?.pageSelection);

  for (let i = 0; i < inputIds.length; i += 1) {
    const entry = await fs.read(inputIds[i]);
    const arrayBuffer = await entry.getBlob().then((b) => b.arrayBuffer());
    const bytes = new Uint8Array(arrayBuffer);
    if (!isLikelyExcelBinary(bytes)) {
      throw new Error(`Failed to parse Excel file ${inputIds[i]}: unsupported container format`);
    }

    const workbook = new WorkbookCtor();
    await workbook.xlsx.load(arrayBuffer);
    if (workbook.worksheets.length === 0) {
      throw new Error(`Failed to parse Excel file ${inputIds[i]}: no sheets found`);
    }

    const pdf = await PDFDocument.create();
    let latinFont = await pdf.embedFont(StandardFonts.Helvetica);
    let cyrillicFont = latinFont;
    let hasUnicodeFont = false;
    try {
      pdf.registerFontkit(fontkit);
      const resolved = await resolveNotoFontBytes();
      if (!resolved) {
        throw new Error('Noto font payload unavailable');
      }
      const { latinBytes, cyrillicBytes } = resolved;
      latinFont = await pdf.embedFont(latinBytes, { subset: true });
      cyrillicFont = await pdf.embedFont(cyrillicBytes, { subset: true });
      hasUnicodeFont = true;
    } catch {
      // Keep Helvetica fallback.
    }

    const worksheets = selectedRange === 'active-sheet' ? workbook.worksheets.slice(0, 1) : workbook.worksheets;
    const selectedSheetNames = Array.isArray(options?.selectedSheets)
      ? options.selectedSheets.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      : [];
    const selectedSheetSet = new Set(selectedSheetNames.map((name) => name.trim()));
    const filteredWorksheets = selectedSheetSet.size > 0
      ? worksheets.filter((sheet: { name: string }) => selectedSheetSet.has(sheet.name))
      : worksheets;
    const hasCyrillicContent = filteredWorksheets.some((sheet: { name: string }) => hasCyrillic(sheet.name));
    if (hasCyrillicContent && !hasUnicodeFont) {
      throw new Error('Cyrillic font is unavailable in this runtime. Cannot render sheet names without replacing text.');
    }
    let globalPageNumber = 0;

    for (const worksheet of filteredWorksheets) {
      const sheetData: SheetTable = [];
      worksheet.eachRow({ includeEmpty: true }, (row: any) => {
        const rowValues = Array.isArray(row.values) ? row.values.slice(1) : [];
        sheetData.push(rowValues.map((cell: unknown) => normalizeCellValue(cell)));
      });
      const mergedColumns = buildMergedColumnSet((worksheet as { model?: { merges?: unknown } }).model?.merges);
      const compactData = stripEmptyColumns(sheetData, mergedColumns);
      if (compactData.length === 0 || (compactData[0] && compactData[0].length === 0)) {
        continue;
      }

      const columnWidths = computeColumnWidths(compactData);
      const portraitPrintableWidth = A4_PORTRAIT.width - MARGIN_X * 2;
      const orientation = forcedOrientation ?? pickOrientation(portraitPrintableWidth, sumWidths(columnWidths));
      const pageSize = orientation === 'portrait' ? A4_PORTRAIT : A4_LANDSCAPE;
      const printableWidth = pageSize.width - MARGIN_X * 2;
      const bands = splitIntoColumnBands(columnWidths, printableWidth, compactData[0].length > 1 ? 1 : 0);

      for (let bandIndex = 0; bandIndex < bands.length; bandIndex += 1) {
        const columnIndexes = bands[bandIndex];
        const projected = projectRows(compactData, columnIndexes);
        const headRow = projected[0] ?? [];
        const bodyRows = projected.slice(1);
        const fittedBandWidths = fitBandWidths(columnIndexes.map((index) => columnWidths[index]), printableWidth);
        let rowPointer = 0;

        const createPage = (firstPageForBand: boolean): {
          page: any;
          y: number;
          bodyBottom: number;
        } => {
          globalPageNumber += 1;
          const page = pdf.addPage([pageSize.width, pageSize.height]);
          const subtitle = bands.length > 1 ? ` (${bandIndex + 1}/${bands.length})` : '';
          const titleText = `Sheet: ${worksheet.name}${subtitle}`;
          drawMixedText(
            page,
            titleText,
            MARGIN_X,
            pageSize.height - MARGIN_TOP - TITLE_FONT_SIZE,
            TITLE_FONT_SIZE,
            latinFont,
            cyrillicFont,
            TEXT_COLOR,
            rgb,
          );
          if (!firstPageForBand) {
            page.drawText('(continued)', {
              x: pageSize.width - MARGIN_X - 60,
              y: pageSize.height - MARGIN_TOP - TITLE_FONT_SIZE,
              font: latinFont,
              size: FOOTER_FONT_SIZE,
              color: rgb(TEXT_COLOR.r, TEXT_COLOR.g, TEXT_COLOR.b),
            });
          }
          page.drawText(`Page ${globalPageNumber}`, {
            x: MARGIN_X,
            y: MARGIN_BOTTOM - 4,
            font: latinFont,
            size: FOOTER_FONT_SIZE,
            color: rgb(TEXT_COLOR.r, TEXT_COLOR.g, TEXT_COLOR.b),
          });
          return {
            page,
            y: pageSize.height - MARGIN_TOP - TITLE_FONT_SIZE - 14,
            bodyBottom: MARGIN_BOTTOM + 10,
          };
        };

        let pageState = createPage(true);
        const drawRow = (cells: CellValue[], isHeader: boolean): void => {
          const cellLines = cells.map((cell) => {
            const text = normalizeText(cell);
            const font = hasCyrillic(text) ? cyrillicFont : latinFont;
            return { text, font, lines: [] as string[] };
          });
          for (let c = 0; c < cellLines.length; c += 1) {
            const availableWidth = Math.max(8, fittedBandWidths[c] - CELL_PADDING_X * 2);
            cellLines[c].lines = wrapText(
              cellLines[c].text,
              cellLines[c].font,
              isHeader ? HEADER_FONT_SIZE : TABLE_FONT_SIZE,
              availableWidth,
            );
          }

          const maxLineCount = Math.max(1, ...cellLines.map((entry) => entry.lines.length));
          const rowHeight = maxLineCount * LINE_HEIGHT + CELL_PADDING_Y * 2;
          if (pageState.y - rowHeight < pageState.bodyBottom && !isHeader) {
            pageState = createPage(false);
            drawRow(headRow, true);
          }

          let x = MARGIN_X;
          const yTop = pageState.y;
          for (let c = 0; c < cells.length; c += 1) {
            const width = fittedBandWidths[c];
            if (showGrid) {
              pageState.page.drawRectangle({
                x,
                y: yTop - rowHeight,
                width,
                height: rowHeight,
                borderWidth: 0.5,
                borderColor: rgb(BORDER_COLOR.r, BORDER_COLOR.g, BORDER_COLOR.b),
                color: isHeader ? rgb(HEADER_FILL.r, HEADER_FILL.g, HEADER_FILL.b) : undefined,
                opacity: 1,
              });
            }

            const lines = cellLines[c].lines;
            let lineY = yTop - CELL_PADDING_Y - LINE_HEIGHT + 2;
            for (const line of lines) {
              if (hasCyrillic(line) && !hasUnicodeFont) {
                throw new Error('Cyrillic font is unavailable in this runtime. Cannot render table text without replacement.');
              }
              drawMixedText(
                pageState.page,
                line,
                x + CELL_PADDING_X,
                lineY,
                isHeader ? HEADER_FONT_SIZE : TABLE_FONT_SIZE,
                latinFont,
                cyrillicFont,
                TEXT_COLOR,
                rgb,
              );
              lineY -= LINE_HEIGHT;
            }
            x += width;
          }

          pageState.y -= rowHeight;
        };

        drawRow(headRow, true);
        while (rowPointer < bodyRows.length) {
          drawRow(bodyRows[rowPointer], false);
          rowPointer += 1;
        }
      }
    }

    if (pdf.getPageCount() === 0) {
      throw new Error(`Failed to parse Excel file ${inputIds[i]}: no renderable sheet data found`);
    }

    const rawBytes = new Uint8Array(await pdf.save());
    let outBlob = new Blob([rawBytes], { type: 'application/pdf' });
    if (typeof options?.pageSelection === 'string' && options.pageSelection.trim() !== '') {
      outBlob = await filterPdfPages(outBlob, pageSelector);
    }

    const outEntry = await fs.write(outBlob);
    outputIds.push(outEntry.id);
    emitProgress?.(Math.round(((i + 1) / inputIds.length) * 100));
  }

  return { outputIds };
};
