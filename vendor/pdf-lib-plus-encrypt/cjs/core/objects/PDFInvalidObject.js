"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFObject_1 = tslib_1.__importDefault(require("./PDFObject"));
class PDFInvalidObject extends PDFObject_1.default {
    constructor(data) {
        super();
        this.data = data;
    }
    clone() {
        return PDFInvalidObject.of(this.data.slice());
    }
    toString() {
        return `PDFInvalidObject(${this.data.length} bytes)`;
    }
    sizeInBytes() {
        return this.data.length;
    }
    copyBytesInto(buffer, offset) {
        const length = this.data.length;
        for (let idx = 0; idx < length; idx++) {
            buffer[offset++] = this.data[idx];
        }
        return length;
    }
}
PDFInvalidObject.of = (data) => new PDFInvalidObject(data);
exports.default = PDFInvalidObject;
//# sourceMappingURL=PDFInvalidObject.js.map