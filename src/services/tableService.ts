import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { PDFDocument, rgb, StandardFonts, type PDFFont, PageSizes } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { Buffer } from 'buffer';

// Polyfill Buffer for XLSX and other libraries
if (typeof window !== 'undefined') {
    (window as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
}

export interface TableStyle {
    headerBgColor: string;
    headerTextColor: string;
    rowBgColor1: string;
    rowBgColor2: string;
    borderColor: string;
    borderWidth: number;
    fontSize: number;
    padding: number;
    useStripes: boolean;
    orientation: 'portrait' | 'landscape' | 'auto';
}

export interface TableData {
    name: string;
    data: (string | number | boolean | Date | null)[][];
}

export const tableService = {
    /**
     * Parse an Excel file and return data for all sheets
     */
    async parseExcel(file: File): Promise<TableData[]> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, {
                        type: 'array',
                        cellDates: true, // Try to parse dates
                        cellNF: true,    // Preserve number formats
                        cellText: true   // Ensure .w (formatted text) is generated
                    });

                    const result: TableData[] = workbook.SheetNames.map(name => {
                        const sheet = workbook.Sheets[name];
                        const jsonData = XLSX.utils.sheet_to_json(sheet, {
                            header: 1,
                            raw: false,    // Use formatted strings
                            dateNF: 'dd.mm.yy', // Fallback date format
                            defval: ''
                        }) as (string | number | boolean | Date | null)[][];
                        return {
                            name,
                            data: jsonData
                        };
                    });

                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    },

    /**
     * Parse a CSV file
     */
    async parseCSV(file: File): Promise<TableData> {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                complete: (results) => {
                    resolve({
                        name: file.name.replace(/\.[^/.]+$/, ""),
                        data: results.data as (string | number | boolean | Date | null)[][]
                    });
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    },

    /**
     * Helper to wrap text into multiple lines
     */
    wrapText(text: string, width: number, font: PDFFont, fontSize: number): string[] {
        if (!text || width <= 0) return [];
        const str = String(text);
        const words = str.split(/\s+/);
        if (words.length === 0) return [];

        const lines: string[] = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            let textWidth = 0;
            try {
                textWidth = font.widthOfTextAtSize(testLine, fontSize);
            } catch {
                textWidth = testLine.length * (fontSize * 0.6);
            }

            if (textWidth > width && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
    },

    /**
     * Calculate optimal column widths based on content
     */
    calculateColumnWidths(data: (string | number | boolean | Date | null)[][], totalWidth: number, font: PDFFont, fontSize: number, padding: number): number[] {
        if (data.length === 0) return [];

        let colCount = 0;
        data.forEach(row => {
            if (row && row.length > colCount) colCount = row.length;
        });

        if (colCount === 0) return [];

        const maxContentWidths = new Array(colCount).fill(10);

        data.forEach(row => {
            if (!row) return;
            row.forEach((cell, i) => {
                const text = String(cell || '');
                let textWidth = 0;
                try {
                    textWidth = font.widthOfTextAtSize(text, fontSize);
                } catch {
                    textWidth = text.length * (fontSize * 0.6);
                }
                maxContentWidths[i] = Math.max(maxContentWidths[i], textWidth + (padding * 2));
            });
        });

        const sumWidths = maxContentWidths.reduce((a, b) => a + b, 0);

        if (sumWidths <= 0 || isNaN(sumWidths)) {
            return new Array(colCount).fill(totalWidth / colCount);
        }

        // We use a base width calculation. If we have horizontal pagination, 
        // these widths will be used within their respective "strips".
        return maxContentWidths.map(w => (w / sumWidths) * totalWidth);
    },

    /**
     * Generate PDF from tables with horizontal pagination support
     */
    async generatePDF(
        tables: TableData[],
        style: TableStyle,
        basePdf?: File
    ): Promise<Uint8Array> {
        const pdfDoc = basePdf
            ? await PDFDocument.load(await basePdf.arrayBuffer())
            : await PDFDocument.create();

        pdfDoc.registerFontkit(fontkit);

        let font: PDFFont;
        try {
            const fontResponse = await fetch('/fonts/Roboto-Regular.ttf');
            if (!fontResponse.ok) throw new Error('Font not found');
            const fontBytes = await fontResponse.arrayBuffer();
            font = await pdfDoc.embedFont(fontBytes);
        } catch {
            font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        }

        const {
            headerBgColor = '#5F7FFF',
            headerTextColor = '#FFFFFF',
            borderColor = '#E5E7EB',
            rowBgColor1 = '#FFFFFF',
            rowBgColor2 = '#F9FAFB',
            borderWidth = 1,
            fontSize = 10,
            padding = 5,
            useStripes = true,
            orientation = 'auto'
        } = style;

        const safeHexToRgb = (hex: string) => {
            try {
                const h = hex.startsWith('#') ? hex : '#' + hex;
                const r = parseInt(h.substring(1, 3) || 'ff', 16) / 255;
                const g = parseInt(h.substring(3, 5) || 'ff', 16) / 255;
                const b = parseInt(h.substring(5, 7) || 'ff', 16) / 255;
                return rgb(isNaN(r) ? 1 : r, isNaN(g) ? 1 : g, isNaN(b) ? 1 : b);
            } catch {
                return rgb(1, 1, 1);
            }
        };

        const hBg = safeHexToRgb(headerBgColor);
        const hText = safeHexToRgb(headerTextColor);
        const bColor = safeHexToRgb(borderColor);
        const r1 = safeHexToRgb(rowBgColor1);
        const r2 = safeHexToRgb(rowBgColor2);

        for (const table of tables) {
            const rows = table.data;
            if (!rows || rows.length === 0) continue;

            const margin = 50;
            let isLandscape = orientation === 'landscape';
            if (orientation === 'auto') {
                let maxCols = 0;
                rows.forEach(r => { if (r.length > maxCols) maxCols = r.length; });
                isLandscape = maxCols > 7;
            }

            const pageSize = isLandscape ? [PageSizes.A4[1], PageSizes.A4[0]] : PageSizes.A4;
            const pageWidth = pageSize[0];
            const pageHeight = pageSize[1];
            const availableWidth = pageWidth - (2 * margin);

            // Calculate widths for ALL columns proportionally
            const originalColWidths = this.calculateColumnWidths(rows, availableWidth, font, fontSize, padding);
            const totalCols = originalColWidths.length;

            // Horizontal Pagination Logic
            // Split columns into groups (strips)
            // Strip 1: [Col 0, Col 1, ... Col K]
            // Strip 2: [Col 0, Col K+1, ... Col M]
            // We always repeat column 0 for context
            const hThreshold = isLandscape ? 12 : 8;
            const columnGroups: number[][] = [];

            if (totalCols <= hThreshold) {
                columnGroups.push(Array.from({ length: totalCols }, (_, i) => i));
            } else {
                // Determine how many columns fit per "strip"
                // For simplicity, we split by fixed count based on threshold
                // But we always keep column 0
                let currentGroup = [0];
                for (let i = 1; i < totalCols; i++) {
                    currentGroup.push(i);
                    if (currentGroup.length >= hThreshold || i === totalCols - 1) {
                        columnGroups.push(currentGroup);
                        currentGroup = [0]; // Reset, but keep col 0
                    }
                }
            }

            // Now we render. We need to handle vertical and horizontal pagination.
            // Loop through row chunks, and for each chunk, render all columnGroups.
            let startRow = 0;
            while (startRow < rows.length) {
                // For each strip (column group)
                for (let gIdx = 0; gIdx < columnGroups.length; gIdx++) {
                    const colGroup = columnGroups[gIdx];
                    const groupColWidths = colGroup.map(idx => originalColWidths[idx]);
                    const groupTotalWidth = groupColWidths.reduce((a, b) => a + b, 0);

                    // Rescale widths for this group to fit availableWidth
                    const scaledWidths = groupColWidths.map(w => (w / groupTotalWidth) * availableWidth);

                    const page = pdfDoc.addPage(pageSize as [number, number]);
                    let currY = pageHeight - margin;

                    // Draw Header for this group
                    const drawRowInGroup = (rowIdx: number, isHeader: boolean) => {
                        const rowItems = rows[rowIdx] || [];
                        const groupItems = colGroup.map(idx => rowItems[idx] || '');

                        const cellWrappedLines = groupItems.map((cell, i) =>
                            this.wrapText(String(cell || ''), scaledWidths[i] - (padding * 2), font, fontSize)
                        );

                        const lineCount = Math.max(1, ...cellWrappedLines.map(l => l.length));
                        const lineHeight = fontSize * 1.2;
                        const rowHeight = (lineCount * lineHeight) + (padding * 2);

                        // If not header and exceeds page, we stop and let the row loop handle it
                        if (!isHeader && currY - rowHeight < margin) {
                            return null;
                        }

                        const bgColor = isHeader ? hBg : (useStripes && rowIdx % 2 === 0 ? r2 : r1);
                        const textColor = isHeader ? hText : rgb(0.1, 0.1, 0.1);
                        const safeY = currY - rowHeight;

                        page.drawRectangle({
                            x: margin,
                            y: safeY,
                            width: availableWidth,
                            height: rowHeight,
                            color: bgColor,
                            borderColor: bColor,
                            borderWidth: borderWidth,
                        });

                        let currX = margin;
                        cellWrappedLines.forEach((lines, i) => {
                            const cw = scaledWidths[i];
                            lines.forEach((line, lIdx) => {
                                const ty = currY - padding - (lIdx + 1) * fontSize;
                                if (!isNaN(ty)) {
                                    page.drawText(line, { x: currX + padding, y: ty, size: fontSize, font, color: textColor });
                                }
                            });

                            if (i < colGroup.length - 1) {
                                page.drawLine({
                                    start: { x: currX + cw, y: currY },
                                    end: { x: currX + cw, y: safeY },
                                    thickness: borderWidth,
                                    color: bColor,
                                });
                            }
                            currX += cw;
                        });

                        currY -= rowHeight;
                        return rowHeight;
                    };

                    // Header
                    drawRowInGroup(0, true);

                    // Body rows for this chunk
                    let rIdx = startRow === 0 ? 1 : startRow;
                    let lastProcessedRow = rIdx;
                    while (rIdx < rows.length) {
                        const h = drawRowInGroup(rIdx, false);
                        if (h === null) break; // Page full
                        rIdx++;
                        lastProcessedRow = rIdx;
                    }

                    // If this is the last column group, update startRow for the next vertical chunk
                    if (gIdx === columnGroups.length - 1) {
                        startRow = lastProcessedRow;
                    }
                }
            }
        }

        return await pdfDoc.save();
    }
};
