"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFFlateStream_1 = tslib_1.__importDefault(require("./PDFFlateStream"));
const CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
class PDFContentStream extends PDFFlateStream_1.default {
    constructor(dict, operators, encode = true) {
        super(dict, encode);
        this.operators = operators;
    }
    push(...operators) {
        this.operators.push(...operators);
    }
    clone(context) {
        const operators = new Array(this.operators.length);
        for (let idx = 0, len = this.operators.length; idx < len; idx++) {
            operators[idx] = this.operators[idx].clone(context);
        }
        const { dict, encode } = this;
        return PDFContentStream.of(dict.clone(context), operators, encode);
    }
    getContentsString() {
        let value = '';
        for (let idx = 0, len = this.operators.length; idx < len; idx++) {
            value += `${this.operators[idx]}\n`;
        }
        return value;
    }
    getUnencodedContents() {
        const buffer = new Uint8Array(this.getUnencodedContentsSize());
        let offset = 0;
        for (let idx = 0, len = this.operators.length; idx < len; idx++) {
            offset += this.operators[idx].copyBytesInto(buffer, offset);
            buffer[offset++] = CharCodes_1.default.Newline;
        }
        return buffer;
    }
    getUnencodedContentsSize() {
        let size = 0;
        for (let idx = 0, len = this.operators.length; idx < len; idx++) {
            size += this.operators[idx].sizeInBytes() + 1;
        }
        return size;
    }
}
PDFContentStream.of = (dict, operators, encode = true) => new PDFContentStream(dict, operators, encode);
exports.default = PDFContentStream;
//# sourceMappingURL=PDFContentStream.js.map