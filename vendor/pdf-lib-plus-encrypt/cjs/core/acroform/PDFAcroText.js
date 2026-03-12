"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFNumber_1 = tslib_1.__importDefault(require("../objects/PDFNumber"));
const PDFString_1 = tslib_1.__importDefault(require("../objects/PDFString"));
const PDFHexString_1 = tslib_1.__importDefault(require("../objects/PDFHexString"));
const PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
const PDFAcroTerminal_1 = tslib_1.__importDefault(require("./PDFAcroTerminal"));
class PDFAcroText extends PDFAcroTerminal_1.default {
    MaxLen() {
        const maxLen = this.dict.lookup(PDFName_1.default.of('MaxLen'));
        if (maxLen instanceof PDFNumber_1.default)
            return maxLen;
        return undefined;
    }
    Q() {
        const q = this.dict.lookup(PDFName_1.default.of('Q'));
        if (q instanceof PDFNumber_1.default)
            return q;
        return undefined;
    }
    setMaxLength(maxLength) {
        this.dict.set(PDFName_1.default.of('MaxLen'), PDFNumber_1.default.of(maxLength));
    }
    removeMaxLength() {
        this.dict.delete(PDFName_1.default.of('MaxLen'));
    }
    getMaxLength() {
        var _a;
        return (_a = this.MaxLen()) === null || _a === void 0 ? void 0 : _a.asNumber();
    }
    setQuadding(quadding) {
        this.dict.set(PDFName_1.default.of('Q'), PDFNumber_1.default.of(quadding));
    }
    getQuadding() {
        var _a;
        return (_a = this.Q()) === null || _a === void 0 ? void 0 : _a.asNumber();
    }
    setValue(value) {
        this.dict.set(PDFName_1.default.of('V'), value);
        // const widgets = this.getWidgets();
        // for (let idx = 0, len = widgets.length; idx < len; idx++) {
        //   const widget = widgets[idx];
        //   const state = widget.getOnValue() === value ? value : PDFName.of('Off');
        //   widget.setAppearanceState(state);
        // }
    }
    removeValue() {
        this.dict.delete(PDFName_1.default.of('V'));
    }
    getValue() {
        const v = this.V();
        if (v instanceof PDFString_1.default || v instanceof PDFHexString_1.default)
            return v;
        return undefined;
    }
}
PDFAcroText.fromDict = (dict, ref) => new PDFAcroText(dict, ref);
PDFAcroText.create = (context) => {
    const dict = context.obj({
        FT: 'Tx',
        Kids: [],
    });
    const ref = context.register(dict);
    return new PDFAcroText(dict, ref);
};
exports.default = PDFAcroText;
//# sourceMappingURL=PDFAcroText.js.map