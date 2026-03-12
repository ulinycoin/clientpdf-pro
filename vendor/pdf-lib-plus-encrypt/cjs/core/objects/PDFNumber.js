"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../../utils/index");
const PDFObject_1 = tslib_1.__importDefault(require("./PDFObject"));
class PDFNumber extends PDFObject_1.default {
    constructor(value) {
        super();
        this.numberValue = value;
        this.stringValue = (0, index_1.numberToString)(value);
    }
    asNumber() {
        return this.numberValue;
    }
    /** @deprecated in favor of [[PDFNumber.asNumber]] */
    value() {
        return this.numberValue;
    }
    clone() {
        return PDFNumber.of(this.numberValue);
    }
    toString() {
        return this.stringValue;
    }
    sizeInBytes() {
        return this.stringValue.length;
    }
    copyBytesInto(buffer, offset) {
        offset += (0, index_1.copyStringIntoBuffer)(this.stringValue, buffer, offset);
        return this.stringValue.length;
    }
}
PDFNumber.of = (value) => new PDFNumber(value);
exports.default = PDFNumber;
//# sourceMappingURL=PDFNumber.js.map