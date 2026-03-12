"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
const PDFAcroButton_1 = tslib_1.__importDefault(require("./PDFAcroButton"));
const errors_1 = require("../errors");
class PDFAcroCheckBox extends PDFAcroButton_1.default {
    setValue(value) {
        var _a;
        const onValue = (_a = this.getOnValue()) !== null && _a !== void 0 ? _a : PDFName_1.default.of('Yes');
        if (value !== onValue && value !== PDFName_1.default.of('Off')) {
            throw new errors_1.InvalidAcroFieldValueError();
        }
        this.dict.set(PDFName_1.default.of('V'), value);
        const widgets = this.getWidgets();
        for (let idx = 0, len = widgets.length; idx < len; idx++) {
            const widget = widgets[idx];
            const state = widget.getOnValue() === value ? value : PDFName_1.default.of('Off');
            widget.setAppearanceState(state);
        }
    }
    getValue() {
        const v = this.V();
        if (v instanceof PDFName_1.default)
            return v;
        return PDFName_1.default.of('Off');
    }
    getOnValue() {
        const [widget] = this.getWidgets();
        return widget === null || widget === void 0 ? void 0 : widget.getOnValue();
    }
}
PDFAcroCheckBox.fromDict = (dict, ref) => new PDFAcroCheckBox(dict, ref);
PDFAcroCheckBox.create = (context) => {
    const dict = context.obj({
        FT: 'Btn',
        Kids: [],
    });
    const ref = context.register(dict);
    return new PDFAcroCheckBox(dict, ref);
};
exports.default = PDFAcroCheckBox;
//# sourceMappingURL=PDFAcroCheckBox.js.map