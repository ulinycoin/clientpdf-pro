import { CombedTextLayoutError } from "../errors";
import { TextAlignment } from "./alignment";
import { cleanText, lineSplit, mergeLines, charAtIndex, charSplit, } from "../../utils";
const MIN_FONT_SIZE = 4;
const MAX_FONT_SIZE = 500;
const computeFontSize = (lines, font, bounds) => {
    let fontSize = MIN_FONT_SIZE;
    while (fontSize < MAX_FONT_SIZE) {
        for (let idx = 0, len = lines.length; idx < len; idx++) {
            const line = lines[idx];
            const tooLong = font.widthOfTextAtSize(line, fontSize) > bounds.width;
            if (tooLong)
                return fontSize - 1;
        }
        const height = font.heightAtSize(fontSize);
        const lineHeight = height + height * 0.2;
        const totalHeight = lines.length * lineHeight;
        if (totalHeight > Math.abs(bounds.height))
            return fontSize - 1;
        fontSize += 1;
    }
    return fontSize;
};
const computeCombedFontSize = (line, font, bounds, cellCount) => {
    const cellWidth = bounds.width / cellCount;
    const cellHeight = bounds.height;
    let fontSize = MIN_FONT_SIZE;
    const chars = charSplit(line);
    while (fontSize < MAX_FONT_SIZE) {
        for (let idx = 0, len = chars.length; idx < len; idx++) {
            const c = chars[idx];
            const tooLong = font.widthOfTextAtSize(c, fontSize) > cellWidth * 0.75;
            if (tooLong)
                return fontSize - 1;
        }
        const height = font.heightAtSize(fontSize, { descender: false });
        if (height > cellHeight)
            return fontSize - 1;
        fontSize += 1;
    }
    return fontSize;
};
const lastIndexOfWhitespace = (line) => {
    for (let idx = line.length; idx > 0; idx--) {
        if (/\s/.test(line[idx]))
            return idx;
    }
    return undefined;
};
const splitOutLines = (input, maxWidth, font, fontSize) => {
    var _a;
    let lastWhitespaceIdx = input.length;
    while (lastWhitespaceIdx > 0) {
        const line = input.substring(0, lastWhitespaceIdx);
        const encoded = font.encodeText(line);
        const width = font.widthOfTextAtSize(line, fontSize);
        if (width < maxWidth) {
            const remainder = input.substring(lastWhitespaceIdx) || undefined;
            return { line, encoded, width, remainder };
        }
        lastWhitespaceIdx = (_a = lastIndexOfWhitespace(line)) !== null && _a !== void 0 ? _a : 0;
    }
    // We were unable to split the input enough to get a chunk that would fit
    // within the specified `maxWidth` so we'll just return everything
    return {
        line: input,
        encoded: font.encodeText(input),
        width: font.widthOfTextAtSize(input, fontSize),
        remainder: undefined,
    };
};
export const layoutMultilineText = (text, { alignment, fontSize, font, bounds }) => {
    const lines = lineSplit(cleanText(text));
    if (fontSize === undefined || fontSize === 0) {
        // fontSize = computeFontSize(lines, font, bounds);
        // This is hardcoded to make it easier to perform automatic line-wrapping.
        //
        // TODO: Update `computeFontSize` to support automatic line-wrapping and
        //       automatic font size calculation.
        fontSize = 12;
    }
    const height = font.heightAtSize(fontSize);
    const lineHeight = height + height * 0.2;
    const textLines = [];
    let minX = bounds.x;
    let minY = bounds.y;
    let maxX = bounds.x + bounds.width;
    let maxY = bounds.y + bounds.height;
    let y = bounds.y + bounds.height;
    for (let idx = 0, len = lines.length; idx < len; idx++) {
        let prevRemainder = lines[idx];
        while (prevRemainder !== undefined) {
            const { line, encoded, width, remainder } = splitOutLines(prevRemainder, bounds.width, font, fontSize);
            // prettier-ignore
            const x = (alignment === TextAlignment.Left ? bounds.x
                : alignment === TextAlignment.Center ? bounds.x + (bounds.width / 2) - (width / 2)
                    : alignment === TextAlignment.Right ? bounds.x + bounds.width - width
                        : bounds.x);
            y -= lineHeight;
            if (x < minX)
                minX = x;
            if (y < minY)
                minY = y;
            if (x + width > maxX)
                maxX = x + width;
            if (y + height > maxY)
                maxY = y + height;
            textLines.push({ text: line, encoded, width, height, x, y });
            // Only trim lines that we had to split ourselves. So we won't trim lines
            // that the user provided themselves with whitespace.
            prevRemainder = remainder === null || remainder === void 0 ? void 0 : remainder.trim();
        }
    }
    return {
        fontSize,
        lineHeight,
        lines: textLines,
        bounds: {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
        },
    };
};
export const layoutCombedText = (text, { fontSize, font, bounds, cellCount }) => {
    const line = mergeLines(cleanText(text));
    if (line.length > cellCount) {
        throw new CombedTextLayoutError(line.length, cellCount);
    }
    if (fontSize === undefined || fontSize === 0) {
        fontSize = computeCombedFontSize(line, font, bounds, cellCount);
    }
    const cellWidth = bounds.width / cellCount;
    const height = font.heightAtSize(fontSize, { descender: false });
    const y = bounds.y + (bounds.height / 2 - height / 2);
    const cells = [];
    let minX = bounds.x;
    let minY = bounds.y;
    let maxX = bounds.x + bounds.width;
    let maxY = bounds.y + bounds.height;
    let cellOffset = 0;
    let charOffset = 0;
    while (cellOffset < cellCount) {
        const [char, charLength] = charAtIndex(line, charOffset);
        const encoded = font.encodeText(char);
        const width = font.widthOfTextAtSize(char, fontSize);
        const cellCenter = bounds.x + (cellWidth * cellOffset + cellWidth / 2);
        const x = cellCenter - width / 2;
        if (x < minX)
            minX = x;
        if (y < minY)
            minY = y;
        if (x + width > maxX)
            maxX = x + width;
        if (y + height > maxY)
            maxY = y + height;
        cells.push({ text: line, encoded, width, height, x, y });
        cellOffset += 1;
        charOffset += charLength;
    }
    return {
        fontSize,
        cells,
        bounds: {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
        },
    };
};
export const layoutSinglelineText = (text, { alignment, fontSize, font, bounds }) => {
    const line = mergeLines(cleanText(text));
    if (fontSize === undefined || fontSize === 0) {
        fontSize = computeFontSize([line], font, bounds);
    }
    const encoded = font.encodeText(line);
    const width = font.widthOfTextAtSize(line, fontSize);
    const height = font.heightAtSize(fontSize, { descender: false });
    // prettier-ignore
    const x = (alignment === TextAlignment.Left ? bounds.x
        : alignment === TextAlignment.Center ? bounds.x + (bounds.width / 2) - (width / 2)
            : alignment === TextAlignment.Right ? bounds.x + bounds.width - width
                : bounds.x);
    const y = bounds.y + (bounds.height / 2 - height / 2);
    return {
        fontSize,
        line: { text: line, encoded, width, height, x, y },
        bounds: { x, y, width, height },
    };
};
//# sourceMappingURL=layout.js.map