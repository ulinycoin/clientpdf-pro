"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const errors_1 = require("../errors");
const PDFObject_1 = tslib_1.__importDefault(require("./PDFObject"));
const CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
const ENFORCER = {};
class PDFBool extends PDFObject_1.default {
    constructor(enforcer, value) {
        if (enforcer !== ENFORCER)
            throw new errors_1.PrivateConstructorError('PDFBool');
        super();
        this.value = value;
    }
    asBoolean() {
        return this.value;
    }
    clone() {
        return this;
    }
    toString() {
        return String(this.value);
    }
    sizeInBytes() {
        return this.value ? 4 : 5;
    }
    copyBytesInto(buffer, offset) {
        if (this.value) {
            buffer[offset++] = CharCodes_1.default.t;
            buffer[offset++] = CharCodes_1.default.r;
            buffer[offset++] = CharCodes_1.default.u;
            buffer[offset++] = CharCodes_1.default.e;
            return 4;
        }
        else {
            buffer[offset++] = CharCodes_1.default.f;
            buffer[offset++] = CharCodes_1.default.a;
            buffer[offset++] = CharCodes_1.default.l;
            buffer[offset++] = CharCodes_1.default.s;
            buffer[offset++] = CharCodes_1.default.e;
            return 5;
        }
    }
}
PDFBool.True = new PDFBool(ENFORCER, true);
PDFBool.False = new PDFBool(ENFORCER, false);
exports.default = PDFBool;
//# sourceMappingURL=PDFBool.js.map