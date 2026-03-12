import { __awaiter } from "tslib";
import { createCmap } from "./CMap";
import { deriveFontFlags } from "./FontFlags";
import PDFHexString from "../objects/PDFHexString";
import PDFString from "../objects/PDFString";
import { addRandomSuffix, byAscendingId, Cache, sortedUniq, toHexStringOfMinLength, } from "../../utils";
/**
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit, as
 * this class borrows from:
 *   https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/jpeg.coffee
 */
class CustomFontEmbedder {
    constructor(font, fontData, customName, fontFeatures) {
        this.allGlyphsInFontSortedById = () => {
            const glyphs = new Array(this.font.characterSet.length);
            for (let idx = 0, len = glyphs.length; idx < len; idx++) {
                const codePoint = this.font.characterSet[idx];
                glyphs[idx] = this.font.glyphForCodePoint(codePoint);
            }
            return sortedUniq(glyphs.sort(byAscendingId), (g) => g.id);
        };
        this.font = font;
        this.scale = 1000 / this.font.unitsPerEm;
        this.fontData = fontData;
        this.fontName = this.font.postscriptName || 'Font';
        this.customName = customName;
        this.fontFeatures = fontFeatures;
        this.baseFontName = '';
        this.glyphCache = Cache.populatedBy(this.allGlyphsInFontSortedById);
    }
    static for(fontkit, fontData, customName, fontFeatures) {
        return __awaiter(this, void 0, void 0, function* () {
            const font = yield fontkit.create(fontData);
            return new CustomFontEmbedder(font, fontData, customName, fontFeatures);
        });
    }
    /**
     * Encode the JavaScript string into this font. (JavaScript encodes strings in
     * Unicode, but embedded fonts use their own custom encodings)
     */
    encodeText(text) {
        const { glyphs } = this.font.layout(text, this.fontFeatures);
        const hexCodes = new Array(glyphs.length);
        for (let idx = 0, len = glyphs.length; idx < len; idx++) {
            hexCodes[idx] = toHexStringOfMinLength(glyphs[idx].id, 4);
        }
        return PDFHexString.of(hexCodes.join(''));
    }
    // The advanceWidth takes into account kerning automatically, so we don't
    // have to do that manually like we do for the standard fonts.
    widthOfTextAtSize(text, size) {
        const { glyphs } = this.font.layout(text, this.fontFeatures);
        let totalWidth = 0;
        for (let idx = 0, len = glyphs.length; idx < len; idx++) {
            totalWidth += glyphs[idx].advanceWidth * this.scale;
        }
        const scale = size / 1000;
        return totalWidth * scale;
    }
    heightOfFontAtSize(size, options = {}) {
        const { descender = true } = options;
        const { ascent, descent, bbox } = this.font;
        const yTop = (ascent || bbox.maxY) * this.scale;
        const yBottom = (descent || bbox.minY) * this.scale;
        let height = yTop - yBottom;
        if (!descender)
            height -= Math.abs(descent) || 0;
        return (height / 1000) * size;
    }
    sizeOfFontAtHeight(height) {
        const { ascent, descent, bbox } = this.font;
        const yTop = (ascent || bbox.maxY) * this.scale;
        const yBottom = (descent || bbox.minY) * this.scale;
        return (1000 * height) / (yTop - yBottom);
    }
    embedIntoContext(context, ref) {
        this.baseFontName = this.customName || addRandomSuffix(this.fontName);
        return this.embedFontDict(context, ref);
    }
    embedFontDict(context, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            const cidFontDictRef = yield this.embedCIDFontDict(context);
            const unicodeCMapRef = this.embedUnicodeCmap(context);
            const fontDict = context.obj({
                Type: 'Font',
                Subtype: 'Type0',
                BaseFont: this.baseFontName,
                Encoding: 'Identity-H',
                DescendantFonts: [cidFontDictRef],
                ToUnicode: unicodeCMapRef,
            });
            if (ref) {
                context.assign(ref, fontDict);
                return ref;
            }
            else {
                return context.register(fontDict);
            }
        });
    }
    isCFF() {
        return this.font.cff;
    }
    embedCIDFontDict(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const fontDescriptorRef = yield this.embedFontDescriptor(context);
            const cidFontDict = context.obj({
                Type: 'Font',
                Subtype: this.isCFF() ? 'CIDFontType0' : 'CIDFontType2',
                CIDToGIDMap: 'Identity',
                BaseFont: this.baseFontName,
                CIDSystemInfo: {
                    Registry: PDFString.of('Adobe'),
                    Ordering: PDFString.of('Identity'),
                    Supplement: 0,
                },
                FontDescriptor: fontDescriptorRef,
                W: this.computeWidths(),
            });
            return context.register(cidFontDict);
        });
    }
    embedFontDescriptor(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const fontStreamRef = yield this.embedFontStream(context);
            const { scale } = this;
            const { italicAngle, ascent, descent, capHeight, xHeight } = this.font;
            const { minX, minY, maxX, maxY } = this.font.bbox;
            const fontDescriptor = context.obj({
                Type: 'FontDescriptor',
                FontName: this.baseFontName,
                Flags: deriveFontFlags(this.font),
                FontBBox: [minX * scale, minY * scale, maxX * scale, maxY * scale],
                ItalicAngle: italicAngle,
                Ascent: ascent * scale,
                Descent: descent * scale,
                CapHeight: (capHeight || ascent) * scale,
                XHeight: (xHeight || 0) * scale,
                // Not sure how to compute/find this, nor is anybody else really:
                // https://stackoverflow.com/questions/35485179/stemv-value-of-the-truetype-font
                StemV: 0,
                [this.isCFF() ? 'FontFile3' : 'FontFile2']: fontStreamRef,
            });
            return context.register(fontDescriptor);
        });
    }
    serializeFont() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.fontData;
        });
    }
    embedFontStream(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const fontStream = context.flateStream(yield this.serializeFont(), {
                Subtype: this.isCFF() ? 'CIDFontType0C' : undefined,
            });
            return context.register(fontStream);
        });
    }
    embedUnicodeCmap(context) {
        const cmap = createCmap(this.glyphCache.access(), this.glyphId.bind(this));
        const cmapStream = context.flateStream(cmap);
        return context.register(cmapStream);
    }
    glyphId(glyph) {
        return glyph ? glyph.id : -1;
    }
    computeWidths() {
        const glyphs = this.glyphCache.access();
        const widths = [];
        let currSection = [];
        for (let idx = 0, len = glyphs.length; idx < len; idx++) {
            const currGlyph = glyphs[idx];
            const prevGlyph = glyphs[idx - 1];
            const currGlyphId = this.glyphId(currGlyph);
            const prevGlyphId = this.glyphId(prevGlyph);
            if (idx === 0) {
                widths.push(currGlyphId);
            }
            else if (currGlyphId - prevGlyphId !== 1) {
                widths.push(currSection);
                widths.push(currGlyphId);
                currSection = [];
            }
            currSection.push(currGlyph.advanceWidth * this.scale);
        }
        widths.push(currSection);
        return widths;
    }
}
export default CustomFontEmbedder;
//# sourceMappingURL=CustomFontEmbedder.js.map