"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
const utils_1 = require("../../utils");
class PDFHeader {
    constructor(major, minor) {
        this.major = String(major);
        this.minor = String(minor);
    }
    getVersion() {
        return `${this.major}.${this.minor}`;
    }
    toString() {
        const bc = (0, utils_1.charFromCode)(129);
        return `%PDF-${this.major}.${this.minor}\n%${bc}${bc}${bc}${bc}`;
    }
    sizeInBytes() {
        return 12 + this.major.length + this.minor.length;
    }
    copyBytesInto(buffer, offset) {
        const initialOffset = offset;
        buffer[offset++] = CharCodes_1.default.Percent;
        buffer[offset++] = CharCodes_1.default.P;
        buffer[offset++] = CharCodes_1.default.D;
        buffer[offset++] = CharCodes_1.default.F;
        buffer[offset++] = CharCodes_1.default.Dash;
        offset += (0, utils_1.copyStringIntoBuffer)(this.major, buffer, offset);
        buffer[offset++] = CharCodes_1.default.Period;
        offset += (0, utils_1.copyStringIntoBuffer)(this.minor, buffer, offset);
        buffer[offset++] = CharCodes_1.default.Newline;
        buffer[offset++] = CharCodes_1.default.Percent;
        buffer[offset++] = 129;
        buffer[offset++] = 129;
        buffer[offset++] = 129;
        buffer[offset++] = 129;
        return offset - initialOffset;
    }
}
PDFHeader.forVersion = (major, minor) => new PDFHeader(major, minor);
exports.default = PDFHeader;
//# sourceMappingURL=PDFHeader.js.map