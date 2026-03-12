"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const errors_1 = require("../errors");
const PDFNumber_1 = tslib_1.__importDefault(require("../objects/PDFNumber"));
const PDFRawStream_1 = tslib_1.__importDefault(require("../objects/PDFRawStream"));
const PDFStream_1 = tslib_1.__importDefault(require("../objects/PDFStream"));
const decode_1 = require("../streams/decode");
const PDFContentStream_1 = tslib_1.__importDefault(require("../structures/PDFContentStream"));
const CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
const utils_1 = require("../../utils");
const fullPageBoundingBox = (page) => {
    const mediaBox = page.MediaBox();
    const width = mediaBox.lookup(2, PDFNumber_1.default).asNumber() -
        mediaBox.lookup(0, PDFNumber_1.default).asNumber();
    const height = mediaBox.lookup(3, PDFNumber_1.default).asNumber() -
        mediaBox.lookup(1, PDFNumber_1.default).asNumber();
    return { left: 0, bottom: 0, right: width, top: height };
};
// Returns the identity matrix, modified to position the content of the given
// bounding box at (0, 0).
const boundingBoxAdjustedMatrix = (bb) => [1, 0, 0, 1, -bb.left, -bb.bottom];
class PDFPageEmbedder {
    constructor(page, boundingBox, transformationMatrix) {
        this.page = page;
        const bb = boundingBox !== null && boundingBox !== void 0 ? boundingBox : fullPageBoundingBox(page);
        this.width = bb.right - bb.left;
        this.height = bb.top - bb.bottom;
        this.boundingBox = bb;
        this.transformationMatrix =
            transformationMatrix !== null && transformationMatrix !== void 0 ? transformationMatrix : boundingBoxAdjustedMatrix(bb);
    }
    static for(page, boundingBox, transformationMatrix) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return new PDFPageEmbedder(page, boundingBox, transformationMatrix);
        });
    }
    embedIntoContext(context, ref) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { Contents, Resources } = this.page.normalizedEntries();
            if (!Contents)
                throw new errors_1.MissingPageContentsEmbeddingError();
            const decodedContents = this.decodeContents(Contents);
            const { left, bottom, right, top } = this.boundingBox;
            const xObject = context.flateStream(decodedContents, {
                Type: 'XObject',
                Subtype: 'Form',
                FormType: 1,
                BBox: [left, bottom, right, top],
                Matrix: this.transformationMatrix,
                Resources,
            });
            if (ref) {
                context.assign(ref, xObject);
                return ref;
            }
            else {
                return context.register(xObject);
            }
        });
    }
    // `contents` is an array of streams which are merged to include them in the XObject.
    // This methods extracts each stream and joins them with a newline character.
    decodeContents(contents) {
        const newline = Uint8Array.of(CharCodes_1.default.Newline);
        const decodedContents = [];
        for (let idx = 0, len = contents.size(); idx < len; idx++) {
            const stream = contents.lookup(idx, PDFStream_1.default);
            let content;
            if (stream instanceof PDFRawStream_1.default) {
                content = (0, decode_1.decodePDFRawStream)(stream).decode();
            }
            else if (stream instanceof PDFContentStream_1.default) {
                content = stream.getUnencodedContents();
            }
            else {
                throw new errors_1.UnrecognizedStreamTypeError(stream);
            }
            decodedContents.push(content, newline);
        }
        return (0, utils_1.mergeIntoTypedArray)(...decodedContents);
    }
}
exports.default = PDFPageEmbedder;
//# sourceMappingURL=PDFPageEmbedder.js.map