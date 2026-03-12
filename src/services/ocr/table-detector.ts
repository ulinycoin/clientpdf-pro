import type { OcrWord } from './ocr-engine';

export interface DetectedTableCell {
  text: string;
  x0: number;
  x1: number;
}

export interface DetectedTableRow {
  cells: DetectedTableCell[];
  y0: number;
  y1: number;
}

export interface DetectedTable {
  columns: number;
  rows: DetectedTableRow[];
}

interface WordLine {
  words: OcrWord[];
  y0: number;
  y1: number;
  centerY: number;
}

function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function buildWordLines(words: OcrWord[]): WordLine[] {
  const sorted = [...words]
    .filter((word) => word.text.trim().length > 0)
    .sort((a, b) => {
      const ay = (a.bbox.y0 + a.bbox.y1) / 2;
      const by = (b.bbox.y0 + b.bbox.y1) / 2;
      return ay - by || a.bbox.x0 - b.bbox.x0;
    });

  const heights = sorted.map((word) => Math.max(1, word.bbox.y1 - word.bbox.y0));
  const lineTolerance = Math.max(8, median(heights) * 0.65);
  const lines: WordLine[] = [];

  for (const word of sorted) {
    const centerY = (word.bbox.y0 + word.bbox.y1) / 2;
    const last = lines[lines.length - 1];
    if (!last || Math.abs(centerY - last.centerY) > lineTolerance) {
      lines.push({
        words: [word],
        y0: word.bbox.y0,
        y1: word.bbox.y1,
        centerY,
      });
      continue;
    }
    last.words.push(word);
    last.y0 = Math.min(last.y0, word.bbox.y0);
    last.y1 = Math.max(last.y1, word.bbox.y1);
    last.centerY = (last.y0 + last.y1) / 2;
  }

  for (const line of lines) {
    line.words.sort((a, b) => a.bbox.x0 - b.bbox.x0);
  }

  return lines;
}

function buildRow(line: WordLine): DetectedTableRow | null {
  const widths = line.words.map((word) => Math.max(1, word.bbox.x1 - word.bbox.x0));
  const pageWidth = line.words.reduce((max, word) => Math.max(max, word.bbox.x1), 0);
  const gapThreshold = Math.max(18, median(widths) * 1.35, pageWidth * 0.035);

  const cells: DetectedTableCell[] = [];
  let currentWords: OcrWord[] = [];

  const flush = () => {
    if (currentWords.length === 0) {
      return;
    }
    cells.push({
      text: currentWords.map((word) => word.text.trim()).join(' ').replace(/\s+/g, ' ').trim(),
      x0: currentWords[0].bbox.x0,
      x1: currentWords[currentWords.length - 1].bbox.x1,
    });
    currentWords = [];
  };

  for (let idx = 0; idx < line.words.length; idx += 1) {
    const word = line.words[idx];
    const previous = line.words[idx - 1];
    if (previous) {
      const gap = word.bbox.x0 - previous.bbox.x1;
      if (gap >= gapThreshold) {
        flush();
      }
    }
    currentWords.push(word);
  }
  flush();

  if (cells.length < 2) {
    return null;
  }

  return {
    cells,
    y0: line.y0,
    y1: line.y1,
  };
}

function columnsAlign(previous: DetectedTableRow, next: DetectedTableRow): boolean {
  if (previous.cells.length !== next.cells.length) {
    return false;
  }
  const widths = previous.cells.map((cell) => Math.max(1, cell.x1 - cell.x0));
  const tolerance = Math.max(18, median(widths) * 1.8);
  for (let idx = 0; idx < previous.cells.length; idx += 1) {
    const prevCenter = (previous.cells[idx].x0 + previous.cells[idx].x1) / 2;
    const nextCenter = (next.cells[idx].x0 + next.cells[idx].x1) / 2;
    if (Math.abs(prevCenter - nextCenter) > tolerance) {
      return false;
    }
  }
  return true;
}

function looksLikeParagraph(row: DetectedTableRow): boolean {
  const texts = row.cells.map((cell) => cell.text);
  const longCells = texts.filter((text) => text.length >= 24).length;
  return row.cells.length === 2 && longCells === 2;
}

export function detectTablesFromWords(words: OcrWord[]): DetectedTable[] {
  const rows = buildWordLines(words)
    .map((line) => buildRow(line))
    .filter((row): row is DetectedTableRow => row !== null && !looksLikeParagraph(row));

  const tables: DetectedTable[] = [];
  let current: DetectedTableRow[] = [];

  const flush = () => {
    if (current.length >= 2) {
      const minColumns = current.reduce((min, row) => Math.min(min, row.cells.length), current[0].cells.length);
      if (minColumns >= 2) {
        tables.push({
          columns: minColumns,
          rows: current.map((row) => ({
            ...row,
            cells: row.cells.slice(0, minColumns),
          })),
        });
      }
    }
    current = [];
  };

  for (const row of rows) {
    const previous = current[current.length - 1];
    if (!previous) {
      current.push(row);
      continue;
    }
    if (columnsAlign(previous, row)) {
      current.push(row);
      continue;
    }
    flush();
    current.push(row);
  }
  flush();

  return tables;
}

function escapeMarkdownCell(input: string): string {
  return input.replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim();
}

export function renderDetectedTablesAsMarkdown(tables: DetectedTable[]): string {
  return tables
    .map((table) => {
      const normalizedRows = table.rows.map((row) => {
        const cells = row.cells.slice(0, table.columns).map((cell) => escapeMarkdownCell(cell.text));
        while (cells.length < table.columns) {
          cells.push('');
        }
        return cells;
      });
      if (normalizedRows.length === 0) {
        return '';
      }
      const header = normalizedRows[0];
      const divider = Array.from({ length: table.columns }, () => '---');
      const body = normalizedRows.slice(1);
      return [
        `| ${header.join(' | ')} |`,
        `| ${divider.join(' | ')} |`,
        ...body.map((row) => `| ${row.join(' | ')} |`),
      ].join('\n');
    })
    .filter(Boolean)
    .join('\n\n');
}
