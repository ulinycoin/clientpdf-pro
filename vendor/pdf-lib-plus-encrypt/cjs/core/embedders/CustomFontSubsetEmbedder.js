"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const CustomFontEmbedder_1 = tslib_1.__importDefault(require("./CustomFontEmbedder"));
const PDFHexString_1 = tslib_1.__importDefault(require("../objects/PDFHexString"));
const utils_1 = require("../../utils");
/**
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit, as
 * this class borrows from:
 *   https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/jpeg.coffee
 */
class CustomFontSubsetEmbedder extends CustomFontEmbedder_1.default {
    constructor(font, fontData, customFontName, fontFeatures) {
        super(font, fontData, customFontName, fontFeatures);
        this.subset = this.font.createSubset();
        this.glyphs = [];
        this.glyphCache = utils_1.Cache.populatedBy(() => this.glyphs);
        this.glyphIdMap = new Map();
    }
    static for(fontkit, fontData, customFontName, fontFeatures) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
            hexCodes[idx] = (0, utils_1.toHexStringOfMinLength)(subsetGlyphId, 4);
        }
        this.glyphCache.invalidate();
        return PDFHexString_1.default.of(hexCodes.join(''));
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
                .on('end', () => resolve((0, utils_1.mergeUint8Arrays)(parts)))
                .on('error', (err) => reject(err));
        });
    }
}
exports.default = CustomFontSubsetEmbedder;
//# sourceMappingURL=CustomFontSubsetEmbedder.js.map