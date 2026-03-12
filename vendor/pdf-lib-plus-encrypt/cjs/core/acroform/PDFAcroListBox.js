"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFAcroChoice_1 = tslib_1.__importDefault(require("./PDFAcroChoice"));
class PDFAcroListBox extends PDFAcroChoice_1.default {
}
PDFAcroListBox.fromDict = (dict, ref) => new PDFAcroListBox(dict, ref);
PDFAcroListBox.create = (context) => {
    const dict = context.obj({
        FT: 'Ch',
        Kids: [],
    });
    const ref = context.register(dict);
    return new PDFAcroListBox(dict, ref);
};
exports.default = PDFAcroListBox;
//# sourceMappingURL=PDFAcroListBox.js.map