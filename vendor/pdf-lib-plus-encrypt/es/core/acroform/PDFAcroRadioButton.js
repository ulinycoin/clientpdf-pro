import PDFName from "../objects/PDFName";
import PDFAcroButton from "./PDFAcroButton";
import { AcroButtonFlags } from "./flags";
import { InvalidAcroFieldValueError } from "../errors";
class PDFAcroRadioButton extends PDFAcroButton {
    setValue(value) {
        const onValues = this.getOnValues();
        if (!onValues.includes(value) && value !== PDFName.of('Off')) {
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
        Ff: AcroButtonFlags.Radio,
        Kids: [],
    });
    const ref = context.register(dict);
    return new PDFAcroRadioButton(dict, ref);
};
export default PDFAcroRadioButton;
//# sourceMappingURL=PDFAcroRadioButton.js.map