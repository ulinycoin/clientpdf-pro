/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import * as pdfjsLib from 'pdfjs-dist';
import type { TextElement, UseContentEditorReturn } from '@/types/contentEditor';

// Helper function to prepare text for PDF (preserve Unicode)
const prepareTextForPDF = (text: string) => {
    return text
        // Strip non-printable control characters (like 0x0018) that crash pdf-lib encoding
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // eslint-disable-line no-control-regex
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'")
        .replace(/[–—]/g, '-')
        .replace(/[…]/g, '...');
};

// Helper function to draw multiline text with Unicode font
const drawMultilineText = (page: any, text: string, anchorX: number, centerY: number, options: any) => {
    const lines = text.split('\n');
    const size = options.size;
    const font = options.font;
    const lineHeight = size * 1.2;
    const totalHeight = lines.length * lineHeight;
    const textAlign = options.textAlign || 'center';
    const xScale = options.scaleX || 1.0;

    // centerY is the logical center of the block.
    let currentY = centerY + (totalHeight / 2) - (size * 1.1);

    lines.forEach((line) => {
        const safeLine = prepareTextForPDF(line);
        if (safeLine.trim()) {
            const activeFont = font;
            if (!activeFont || typeof activeFont.widthOfTextAtSize !== 'function') {
                console.warn('Invalid font passed to drawMultilineText');
                return;
            }

            try {
                const rawWidth = activeFont.widthOfTextAtSize(safeLine, size);
                const actualWidth = rawWidth * xScale;

                let lineX = anchorX;
                if (textAlign === 'center') {
                    lineX = anchorX - (actualWidth / 2);
                } else if (textAlign === 'right') {
                    lineX = anchorX - actualWidth;
                }

                page.drawText(safeLine, {
                    ...options,
                    x: lineX,
                    y: currentY,
                    font: activeFont,
                });
            } catch (err) {
                console.error('Error drawing line:', err, safeLine);
            }
        }
        currentY -= lineHeight;
    });
};

export const useContentEditor = (): UseContentEditorReturn => {
    // State
    const [textElements, setTextElements] = useState<TextElement[]>([]);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [scale, setScale] = useState(1);
    const [toolMode, setToolMode] = useState<'select' | 'add' | 'edit'>('edit');
    const [isProcessing, setIsProcessing] = useState(false);

    // History management
    const [history, setHistory] = useState<TextElement[][]>([[]]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const elementIdCounter = useRef(0);
    const textElementsRef = useRef<TextElement[]>([]);

    // Keep ref in sync
    useEffect(() => {
        textElementsRef.current = textElements;
    }, [textElements]);

    // History helpers
    const saveToHistory = useCallback((elements: TextElement[]) => {
        setHistory(prevHistory => {
            const nextHistory = prevHistory.slice(0, historyIndex + 1);
            nextHistory.push([...elements]);
            return nextHistory;
        });
        setHistoryIndex(prevIndex => prevIndex + 1);
    }, [historyIndex]);

    // Add text element
    const addTextElement = useCallback((x: number, y: number, text: string = 'New Text', initialProps?: Partial<TextElement>) => {
        const newElement: TextElement = {
            id: `text-${Date.now()}-${++elementIdCounter.current}`,
            text,
            x, // In percentage
            y, // In percentage
            fontSize: 24,
            fontFamily: 'Roboto',
            color: '#000000',
            opacity: 100,
            rotation: 0,
            bold: false,
            italic: false,
            isSelected: false,
            pageNumber: currentPage,
            backgroundColor: 'transparent',
            textAlign: 'left',
            horizontalScaling: 1.0,
            ...initialProps
        };

        const newElements = [...textElements, newElement];
        setTextElements(newElements);
        setSelectedElementId(newElement.id);
        saveToHistory(newElements);
        return newElement.id;
    }, [currentPage, textElements, saveToHistory]);

    // Update text element
    const updateTextElement = useCallback((id: string, updates: Partial<TextElement>) => {
        const next = textElementsRef.current.map(el =>
            el.id === id ? { ...el, ...updates } : el
        );
        setTextElements(next);
        saveToHistory(next);
    }, [saveToHistory]);

    // Delete text element
    const deleteTextElement = useCallback((id: string) => {
        const next = textElementsRef.current.filter(el => el.id !== id);
        setTextElements(next);
        saveToHistory(next);
        if (selectedElementId === id) setSelectedElementId(null);
    }, [selectedElementId, saveToHistory]);

    // Select element
    const selectElement = useCallback((id: string | null) => {
        setSelectedElementId(id);
    }, []);

    // Move element
    const moveElement = useCallback((id: string, x: number, y: number) => {
        const next = textElementsRef.current.map(el =>
            el.id === id ? { ...el, x, y } : el
        );
        setTextElements(next);
    }, []);

    const finishMovement = useCallback(() => {
        saveToHistory(textElementsRef.current);
    }, [saveToHistory]);

    // Navigation and Scale
    const goToPage = useCallback((page: number) => setCurrentPage(page), []);
    const handleSetTotalPages = useCallback((total: number) => setTotalPages(total), []);
    const handleSetScale = useCallback((s: number) => setScale(s), []);
    const handleSetToolMode = useCallback((mode: 'select' | 'add' | 'edit') => setToolMode(mode), []);

    // History actions
    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setTextElements([...history[newIndex]]);
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setTextElements([...history[newIndex]]);
        }
    }, [history, historyIndex]);

    // Smart Detection Logic with Line Grouping
    // Smart Detection Logic with Line Grouping
    const detectTextAt = useCallback(async (pdfDocument: pdfjsLib.PDFDocumentProxy, pageNumber: number, xPercent: number, yPercent: number) => {
        try {
            const page = await pdfDocument.getPage(pageNumber);
            const textContent = await (page as any).getTextContent({ includeStyles: true });
            const viewport = page.getViewport({ scale: 1.0 });

            const targetX = (xPercent / 100) * viewport.width;
            const targetY = (yPercent / 100) * viewport.height;

            // 1. Find the target item under cursor
            let targetItem: any = null;
            let minDistance = Infinity;

            for (const item of textContent.items) {
                if (!('str' in item)) continue;

                const transform = item.transform;
                const fontSize = Math.sqrt(transform[0] * transform[0] + transform[1] * transform[1]);
                const itemX = transform[4];
                const itemY = viewport.height - transform[5] - (item.height || fontSize);
                const itemW = (item as any).width || ((item as any).str.length * fontSize * 0.5);
                const itemH = (item as any).height || fontSize;

                const centerX = itemX + itemW / 2;
                const centerY = itemY + itemH / 2;
                const dist = Math.sqrt(Math.pow(targetX - centerX, 2) + Math.pow(targetY - centerY, 2));

                if (dist < minDistance && dist < 50) {
                    minDistance = dist;
                    targetItem = { item, fontSize, centerY };
                }
            }

            if (!targetItem) return null;

            // 2. Find all items on the SAME line (similar Y)
            const Y_TOLERANCE = targetItem.fontSize * 0.5;
            const lineItems = textContent.items.filter((item: any) => {
                if (!('str' in item)) return false;
                const itemY = viewport.height - item.transform[5] - (item.height || targetItem.fontSize);
                const itemFontSize = Math.sqrt(item.transform[0] * item.transform[0] + item.transform[1] * item.transform[1]);
                const itemCenterY = itemY + (item.height || itemFontSize) / 2;
                return Math.abs(itemCenterY - targetItem.centerY) < Y_TOLERANCE;
            }).sort((a: any, b: any) => a.transform[4] - b.transform[4]);

            if (lineItems.length === 0) return null;

            // 3. Merge into a single line and extract styles
            const firstItem = lineItems[0] as any;
            const lastItem = lineItems[lineItems.length - 1] as any;

            const firstX = firstItem.transform[4];
            const lastX = lastItem.transform[4];
            const lastW = (lastItem as any).width || (lastItem.str.length * targetItem.fontSize * 0.5);

            const totalWidth = (lastX + lastW) - firstX;

            // Extract font styles
            const itemStyle = textContent.styles[targetItem.item.fontName];
            let fontFamily = 'Roboto';
            let bold = false;
            let italic = false;
            // Use vertical scaling (transform[0] is often horizontal scaling which can be compressed)
            // But we need to use the larger of the two to avoid under-sizing
            const scaleX = Math.sqrt(targetItem.item.transform[0] * targetItem.item.transform[0] + targetItem.item.transform[1] * targetItem.item.transform[1]);
            const scaleY = Math.sqrt(targetItem.item.transform[2] * targetItem.item.transform[2] + targetItem.item.transform[3] * targetItem.item.transform[3]);
            // Use the larger dimension to avoid issues with condensed text and round to 2 decimals
            const fontSize = Math.round(Math.max(scaleX, scaleY) * 100) / 100;

            if (itemStyle) {
                // Normalize font name: remove subset prefix (e.g. "ABCDEF+Arial-Bold" -> "Arial-Bold")
                const rawFontName = itemStyle.fontFamily || '';
                const fontName = (rawFontName.includes('+') ? rawFontName.split('+')[1] : rawFontName).toLowerCase();

                // Better Bold/Italic detection
                bold = fontName.includes('bold') || fontName.includes('heavy') || fontName.includes('black') || fontName.includes('medium') || fontName.includes('demi');
                italic = fontName.includes('italic') || fontName.includes('oblique') || fontName.includes('slanted');

                // Intelligent Font Mapping
                if (fontName.includes('roboto')) {
                    fontFamily = 'Roboto';
                } else if (fontName.includes('arial') || fontName.includes('helvetica') || fontName.includes('sans') || fontName.includes('inter') || fontName.includes('system') || fontName.includes('tahoma') || fontName.includes('verdana') || fontName.includes('calibri') || fontName.includes('segoe')) {
                    fontFamily = 'Arial';
                } else if (fontName.includes('times') || fontName.includes('serif') || fontName.includes('minion') || fontName.includes('garamond') || fontName.includes('georgia')) {
                    fontFamily = 'Times New Roman';
                } else if (fontName.includes('courier') || fontName.includes('mono') || fontName.includes('code') || fontName.includes('terminal') || fontName.includes('consolas')) {
                    fontFamily = 'Courier New';
                }
            } else {
                // Fallback if no style object, try to guess from targetItem fontName string if available
                const directFontName = targetItem.item.fontName.toLowerCase();
                bold = directFontName.includes('bold');
                italic = directFontName.includes('italic');
            }

            // Intelligent Merging: check gaps between fragments
            let mergedText = "";
            for (let i = 0; i < lineItems.length; i++) {
                const item = lineItems[i] as any;
                if (i > 0) {
                    const prevItem = lineItems[i - 1] as any;
                    const prevX = prevItem.transform[4];
                    const prevW = (prevItem as any).width || (prevItem.str.length * targetItem.fontSize * 0.5);
                    const gap = item.transform[4] - (prevX + prevW);

                    // If gap > 10% of font size, it's likely a space
                    if (gap > targetItem.fontSize * 0.1 && !mergedText.endsWith(' ') && !item.str.startsWith(' ')) {
                        mergedText += " ";
                    }
                }
                mergedText += item.str;
            }
            mergedText = mergedText.replace(/\s+/g, ' ').trim();

            return {
                text: mergedText,
                x: ((firstX + totalWidth / 2) / viewport.width) * 100,
                y: (targetItem.centerY / viewport.height) * 100,
                width: (totalWidth / viewport.width) * 100,
                height: (fontSize * 1.1 / viewport.height) * 100,
                fontSize: fontSize,
                fontFamily,
                bold,
                italic
            };
        } catch (error) {
            console.error('Error detecting text line:', error);
            return null;
        }
    }, []);

    // Convert hex color to RGB
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255,
        } : { r: 0, g: 0, b: 0 };
    };

    // Function to load fonts with Cyrillic support
    const loadFonts = async (pdfDoc: any) => {
        pdfDoc.registerFontkit(fontkit);

        const fonts: Record<string, any> = {};
        const fontNames = ['Roboto-Regular', 'Roboto-Bold', 'Roboto-Italic', 'Roboto-BoldItalic'];

        // Primary source: Local; Secondary: CDN (Google Fonts)
        const getFontUrl = (name: string) => {
            const cdnMap: Record<string, string> = {
                'Roboto-Regular': 'https://raw.githubusercontent.com/google/fonts/main/apache/roboto/static/Roboto-Regular.ttf',
                'Roboto-Bold': 'https://raw.githubusercontent.com/google/fonts/main/apache/roboto/static/Roboto-Bold.ttf',
                'Roboto-Italic': 'https://raw.githubusercontent.com/google/fonts/main/apache/roboto/static/Roboto-Italic.ttf',
                'Roboto-BoldItalic': 'https://raw.githubusercontent.com/google/fonts/main/apache/roboto/static/Roboto-BoldItalic.ttf',
            };
            return cdnMap[name];
        };

        try {
            for (const name of fontNames) {
                let response = await fetch(`/fonts/${name}.ttf`);
                if (!response.ok) {
                    const cdnUrl = getFontUrl(name);
                    if (cdnUrl) {
                        try {
                            response = await fetch(cdnUrl);
                        } catch (e) {
                            console.warn(`Failed to fetch font ${name} from CDN:`, e);
                        }
                    }
                }

                if (response.ok) {
                    const contentType = response.headers.get('content-type') || '';
                    if (contentType.includes('text/html')) {
                        console.warn(`Font fetch for ${name} returned HTML (status: ${response.status}). Skipping.`);
                        continue;
                    }
                    const fontBytes = await response.arrayBuffer();
                    try {
                        fonts[name] = await pdfDoc.embedFont(fontBytes);
                    } catch (fontErr) {
                        console.error(`Error embedding font ${name}:`, fontErr);
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to load local or CDN fonts:', error);
        }

        const standardHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const standardHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const standardHelveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
        const standardHelveticaBoldOblique = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

        const standardCourier = await pdfDoc.embedFont(StandardFonts.Courier);
        const standardCourierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);
        const standardTimes = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const standardTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

        const getBestFontForElement = (el: TextElement) => {
            // Standard PDF fonts (WinAnsi) don't support Cyrillic/Unicode.
            // If text contains non-Latin characters, we MUST use an embedded font like Roboto.
            const hasUnicode = /[^\x00-\x7F]/.test(el.text); // eslint-disable-line no-control-regex
            const isCustomFont = el.fontFamily === 'Roboto' || el.fontFamily === 'Arial' || hasUnicode;

            if (isCustomFont) {
                let selectedFont = null;
                if (el.bold && el.italic) selectedFont = fonts['Roboto-BoldItalic'];
                else if (el.bold) selectedFont = fonts['Roboto-Bold'];
                else if (el.italic) selectedFont = fonts['Roboto-Italic'];
                else selectedFont = fonts['Roboto-Regular'];

                if (!selectedFont) selectedFont = fonts['Roboto-Regular'];
                if (selectedFont) return selectedFont;

                // If even Roboto failed to load, we have to use standard fonts (will fail for Unicode, but better than nothing)
                if (el.bold && el.italic) return standardHelveticaBoldOblique;
                if (el.bold) return standardHelveticaBold;
                if (el.italic) return standardHelveticaOblique;
                return standardHelvetica;
            }

            if (el.fontFamily === 'Courier New' || el.fontFamily === 'Courier') {
                return el.bold ? standardCourierBold : standardCourier;
            }
            if (el.fontFamily === 'Times New Roman' || el.fontFamily === 'Times') {
                return el.bold ? standardTimesBold : standardTimes;
            }
            return standardHelvetica;
        };

        return { getBestFontForElement };
    };

    // Save PDF with text elements
    const savePDF = useCallback(async (originalFile: File): Promise<Blob> => {
        setIsProcessing(true);
        try {
            const arrayBuffer = await originalFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            const { getBestFontForElement } = await loadFonts(pdfDoc);

            const elementsByPage: Record<number, TextElement[]> = textElements.reduce((acc: any, element: TextElement) => {
                if (!acc[element.pageNumber]) {
                    acc[element.pageNumber] = [];
                }
                acc[element.pageNumber].push(element);
                return acc;
            }, {});

            Object.entries(elementsByPage).forEach(([pageNum, elements]) => {
                const pageIndex = parseInt(pageNum) - 1;
                if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) return;

                const page = pdfDoc.getPage(pageIndex);
                const { width, height } = page.getSize();

                (elements as TextElement[]).forEach(element => {
                    const color = hexToRgb(element.color);
                    const font = getBestFontForElement(element);

                    // Convert percentage coordinates back to PDF points
                    const xPos = (element.x / 100) * width;
                    const yPos = height - ((element.y / 100) * height);

                    // If edited existing text, draw background cover first
                    if (element.originalRect) {
                        const rectX = (element.originalRect.x / 100) * width;
                        const rectY = height - ((element.originalRect.y / 100) * height);
                        const rectW = (element.originalRect.w / 100) * width;
                        const rectH = (element.originalRect.h / 100) * height;

                        const bgColor = hexToRgb(element.backgroundColor || '#FFFFFF');

                        // Draw background (or detected background)
                        page.drawRectangle({
                            x: rectX,
                            y: rectY - rectH,
                            width: rectW,
                            height: rectH,
                            color: rgb(bgColor.r, bgColor.g, bgColor.b),
                        });
                    }

                    drawMultilineText(page, element.text, xPos, yPos, {
                        size: element.fontSize,
                        color: rgb(color.r, color.g, color.b),
                        font: font,
                        opacity: element.opacity / 100,
                        rotate: degrees(element.rotation),
                        // Support for alignment and scaling
                        textAlign: element.textAlign || 'center',
                        scaleX: element.horizontalScaling || 1.0
                    });
                });
            });

            const pdfBytes = await pdfDoc.save();
            return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });

        } catch (error) {
            console.error('Error saving PDF:', error);
            throw error;
        } finally {
            setIsProcessing(false);
        }
    }, [textElements]);

    // Reset all state
    const reset = useCallback(() => {
        setTextElements([]);
        setSelectedElementId(null);
        setCurrentPage(1);
        setTotalPages(1);
        setScale(1);
        setToolMode('edit');
        setHistory([[]]);
        setHistoryIndex(0);
        elementIdCounter.current = 0;
    }, []);

    return {
        textElements,
        selectedElementId,
        currentPage,
        totalPages,
        scale,
        toolMode,
        isProcessing,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        addTextElement,
        updateTextElement,
        deleteTextElement,
        selectElement,
        moveElement,
        finishMovement,
        goToPage,
        setTotalPages: handleSetTotalPages,
        setScale: handleSetScale,
        setToolMode: handleSetToolMode,
        undo,
        redo,
        detectTextAt,
        savePDF,
        reset,
    };
};
