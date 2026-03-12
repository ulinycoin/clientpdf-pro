"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
const PDFAcroButton_1 = tslib_1.__importDefault(require("./PDFAcroButton"));
const flags_1 = require("./flags");
const errors_1 = require("../errors");
class PDFAcroRadioButton extends PDFAcroButton_1.default {
    setValue(value) {
        const onValues = this.getOnValues();
        if (!onValues.includes(value) && value !== PDFName_1.default.of('Off')) {
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
    getOnValues() {
        const widgets = this.getWidgets();
        const onValues = [];
        for (let idx = 0, len = widgets.length; idx < len; idx++) {
            const onValue = widgets[idx].getOnValue();
            if (onValue)
                onValues.push(onValue);
        }
        return onValues;
    }
}
PDFAcroRadioButton.fromDict = (dict, ref) => new PDFAcroRadioButton(dict, ref);
PDFAcroRadioButton.create = (context) => {
    const dict = context.obj({
        FT: 'Btn',
        Ff: flags_1.AcroButtonFlags.Radio,
        Kids: [],
    });
    const ref = context.register(dict);
    return new PDFAcroRadioButton(dict, ref);
};
exports.default = PDFAcroRadioButton;
//# sourceMappingURL=PDFAcroRadioButton.js.map