"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFAcroButton_1 = tslib_1.__importDefault(require("./PDFAcroButton"));
const flags_1 = require("./flags");
class PDFAcroPushButton extends PDFAcroButton_1.default {
}
PDFAcroPushButton.fromDict = (dict, ref) => new PDFAcroPushButton(dict, ref);
PDFAcroPushButton.create = (context) => {
    const dict = context.obj({
        FT: 'Btn',
        Ff: flags_1.AcroButtonFlags.PushButton,
        Kids: [],
    });
    const ref = context.register(dict);
    return new PDFAcroPushButton(dict, ref);
};
exports.default = PDFAcroPushButton;
//# sourceMappingURL=PDFAcroPushButton.js.map