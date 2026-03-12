"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFObject_1 = tslib_1.__importDefault(require("../objects/PDFObject"));
const CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
const utils_1 = require("../../utils");
class PDFOperator {
    constructor(name, args) {
        this.name = name;
        this.args = args || [];
    }
    clone(context) {
        const args = new Array(this.args.length);
        for (let idx = 0, len = args.length; idx < len; idx++) {
            const arg = this.args[idx];
            args[idx] = arg instanceof PDFObject_1.default ? arg.clone(context) : arg;
        }
        return PDFOperator.of(this.name, args);
    }
    toString() {
        let value = '';
        for (let idx = 0, len = this.args.length; idx < len; idx++) {
            value += String(this.args[idx]) + ' ';
        }
        value += this.name;
        return value;
    }
    sizeInBytes() {
        let size = 0;
        for (let idx = 0, len = this.args.length; idx < len; idx++) {
            const arg = this.args[idx];
            size += (arg instanceof PDFObject_1.default ? arg.sizeInBytes() : arg.length) + 1;
        }
        size += this.name.length;
        return size;
    }
    copyBytesInto(buffer, offset) {
        const initialOffset = offset;
        for (let idx = 0, len = this.args.length; idx < len; idx++) {
            const arg = this.args[idx];
            if (arg instanceof PDFObject_1.default) {
                offset += arg.copyBytesInto(buffer, offset);
            }
            else {
                offset += (0, utils_1.copyStringIntoBuffer)(arg, buffer, offset);
            }
            buffer[offset++] = CharCodes_1.default.Space;
        }
        offset += (0, utils_1.copyStringIntoBuffer)(this.name, buffer, offset);
        return offset - initialOffset;
    }
}
PDFOperator.of = (name, args) => new PDFOperator(name, args);
exports.default = PDFOperator;
//# sourceMappingURL=PDFOperator.js.map