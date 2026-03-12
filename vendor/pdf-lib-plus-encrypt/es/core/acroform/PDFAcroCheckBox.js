import PDFName from "../objects/PDFName";
import PDFAcroButton from "./PDFAcroButton";
import { InvalidAcroFieldValueError } from "../errors";
class PDFAcroCheckBox extends PDFAcroButton {
    setValue(value) {
        var _a;
        const onValue = (_a = this.getOnValue()) !== null && _a !== void 0 ? _a : PDFName.of('Yes');
        if (value !== onValue && value !== PDFName.of('Off')) {
            throw new InvalidAcroFieldValueError();
        }
        this.dict.set(PDFName.of('V'), value);
        const widgets = this.getWidgets();
        for (let idx = 0, len = widgets.length; idx < len; idx++) {
            const widget = widgets[idx];
            const state = widget.getOnValue() === value ? value : PDFName.of('Off');
            widget.setAppearanceState(state);
        }
    }
    getValue() {
        const v = this.V();
        if (v instanceof PDFName)
            return v;
        return PDFName.of('Off');
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
export default PDFAcroCheckBox;
//# sourceMappingURL=PDFAcroCheckBox.js.map