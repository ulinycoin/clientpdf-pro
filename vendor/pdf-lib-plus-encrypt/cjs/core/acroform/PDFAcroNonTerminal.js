"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
const PDFAcroField_1 = tslib_1.__importDefault(require("./PDFAcroField"));
class PDFAcroNonTerminal extends PDFAcroField_1.default {
    addField(field) {
        const { Kids } = this.normalizedEntries();
        Kids === null || Kids === void 0 ? void 0 : Kids.push(field);
    }
    normalizedEntries() {
        let Kids = this.Kids();
        if (!Kids) {
            Kids = this.dict.context.obj([]);
            this.dict.set(PDFName_1.default.of('Kids'), Kids);
        }
        return { Kids };
    }
}
PDFAcroNonTerminal.fromDict = (dict, ref) => new PDFAcroNonTerminal(dict, ref);
PDFAcroNonTerminal.create = (context) => {
    const dict = context.obj({});
    const ref = context.register(dict);
    return new PDFAcroNonTerminal(dict, ref);
};
exports.default = PDFAcroNonTerminal;
//# sourceMappingURL=PDFAcroNonTerminal.js.map