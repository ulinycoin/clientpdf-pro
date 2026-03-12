"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFAcroTerminal_1 = tslib_1.__importDefault(require("./PDFAcroTerminal"));
class PDFAcroSignature extends PDFAcroTerminal_1.default {
}
PDFAcroSignature.fromDict = (dict, ref) => new PDFAcroSignature(dict, ref);
exports.default = PDFAcroSignature;
//# sourceMappingURL=PDFAcroSignature.js.map