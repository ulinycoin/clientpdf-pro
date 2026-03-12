"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFAcroChoice_1 = tslib_1.__importDefault(require("./PDFAcroChoice"));
const flags_1 = require("./flags");
class PDFAcroComboBox extends PDFAcroChoice_1.default {
}
PDFAcroComboBox.fromDict = (dict, ref) => new PDFAcroComboBox(dict, ref);
PDFAcroComboBox.create = (context) => {
    const dict = context.obj({
        FT: 'Ch',
        Ff: flags_1.AcroChoiceFlags.Combo,
        Kids: [],
    });
    const ref = context.register(dict);
    return new PDFAcroComboBox(dict, ref);
};
exports.default = PDFAcroComboBox;
//# sourceMappingURL=PDFAcroComboBox.js.map