"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFObject_1 = tslib_1.__importDefault(require("./PDFObject"));
const CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
class PDFNull extends PDFObject_1.default {
    asNull() {
        return null;
    }
    clone() {
        return this;
    }
    toString() {
        return 'null';
    }
    sizeInBytes() {
        return 4;
    }
    copyBytesInto(buffer, offset) {
        buffer[offset++] = CharCodes_1.default.n;
        buffer[offset++] = CharCodes_1.default.u;
        buffer[offset++] = CharCodes_1.default.l;
        buffer[offset++] = CharCodes_1.default.l;
        return 4;
    }
}
exports.default = new PDFNull();
//# sourceMappingURL=PDFNull.js.map