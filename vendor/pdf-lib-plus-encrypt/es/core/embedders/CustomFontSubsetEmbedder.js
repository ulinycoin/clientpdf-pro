import { __awaiter } from "tslib";
import CustomFontEmbedder from "./CustomFontEmbedder";
import PDFHexString from "../objects/PDFHexString";
import { Cache, mergeUint8Arrays, toHexStringOfMinLength } from "../../utils";
/**
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit, as
 * this class borrows from:
 *   https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/jpeg.coffee
 */
class CustomFontSubsetEmbedder extends CustomFontEmbedder {
    constructor(font, fontData, customFontName, fontFeatures) {
        super(font, fontData, customFontName, fontFeatures);
        this.subset = this.font.createSubset();
        this.glyphs = [];
        this.glyphCache = Cache.populatedBy(() => this.glyphs);
        this.glyphIdMap = new Map();
    }
    static for(fontkit, fontData, customFontName, fontFeatures) {
        return __awaiter(this, void 0, void 0, function* () {
            const font = yield fontkit.create(fontData);
            return new CustomFontSubsetEmbedder(font, fontData, customFontName, fontFeatures);
        });
    }
    encodeText(text) {
        const { glyphs } = this.font.layout(text, this.fontFeatures);
        const hexCodes = new Array(glyphs.length);
        for (let idx = 0, len = glyphs.length; idx < len; idx++) {
            const glyph = glyphs[idx];
            const subsetGlyphId = this.subset.includeGlyph(glyph);
            this.glyphs[subsetGlyphId - 1] = glyph;
            this.glyphIdMap.set(glyph.id, subsetGlyphId);
            hexCodes[idx] = toHexStringOfMinLength(subsetGlyphId, 4);
        }
        this.glyphCache.invalidate();
        return PDFHexString.of(hexCodes.join(''));
    }
    isCFF() {
        return this.subset.cff;
    }
    glyphId(glyph) {
        return glyph ? this.glyphIdMap.get(glyph.id) : -1;
    }
    serializeFont() {
        return new Promise((resolve, reject) => {
            const parts = [];
            this.subset
                .encodeStream()
                .on('data', (bytes) => parts.push(bytes))
                .on('end', () => resolve(mergeUint8Arrays(parts)))
                .on('error', (err) => reject(err));
        });
    }
}
export default CustomFontSubsetEmbedder;
//# sourceMappingURL=CustomFontSubsetEmbedder.js.map