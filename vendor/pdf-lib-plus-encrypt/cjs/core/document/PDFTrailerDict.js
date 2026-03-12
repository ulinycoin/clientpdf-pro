"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
class PDFTrailerDict {
    constructor(dict) {
        this.dict = dict;
    }
    toString() {
        return `trailer\n${this.dict.toString()}`;
    }
    sizeInBytes() {
        return 8 + this.dict.sizeInBytes();
    }
    copyBytesInto(buffer, offset) {
        const initialOffset = offset;
        buffer[offset++] = CharCodes_1.default.t;
        buffer[offset++] = CharCodes_1.default.r;
        buffer[offset++] = CharCodes_1.default.a;
        buffer[offset++] = CharCodes_1.default.i;
        buffer[offset++] = CharCodes_1.default.l;
        buffer[offset++] = CharCodes_1.default.e;
        buffer[offset++] = CharCodes_1.default.r;
        buffer[offset++] = CharCodes_1.default.Newline;
        offset += this.dict.copyBytesInto(buffer, offset);
        return offset - initialOffset;
    }
}
PDFTrailerDict.of = (dict) => new PDFTrailerDict(dict);
exports.default = PDFTrailerDict;
//# sourceMappingURL=PDFTrailerDict.js.map