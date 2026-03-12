import PDFNumber from "../objects/PDFNumber";
import PDFString from "../objects/PDFString";
import PDFHexString from "../objects/PDFHexString";
import PDFName from "../objects/PDFName";
import PDFAcroTerminal from "./PDFAcroTerminal";
class PDFAcroText extends PDFAcroTerminal {
    MaxLen() {
        const maxLen = this.dict.lookup(PDFName.of('MaxLen'));
        if (maxLen instanceof PDFNumber)
            return maxLen;
        return undefined;
    }
    Q() {
        const q = this.dict.lookup(PDFName.of('Q'));
        if (q instanceof PDFNumber)
            return q;
        return undefined;
    }
    setMaxLength(maxLength) {
        this.dict.set(PDFName.of('MaxLen'), PDFNumber.of(maxLength));
    }
    removeMaxLength() {
        this.dict.delete(PDFName.of('MaxLen'));
    }
    getMaxLength() {
        var _a;
        return (_a = this.MaxLen()) === null || _a === void 0 ? void 0 : _a.asNumber();
    }
    setQuadding(quadding) {
        this.dict.set(PDFName.of('Q'), PDFNumber.of(quadding));
    }
    getQuadding() {
        var _a;
        return (_a = this.Q()) === null || _a === void 0 ? void 0 : _a.asNumber();
    }
    setValue(value) {
        this.dict.set(PDFName.of('V'), value);
        // const widgets = this.getWidgets();
        // for (let idx = 0, len = widgets.length; idx < len; idx++) {
        //   const widget = widgets[idx];
        //   const state = widget.getOnValue() === value ? value : PDFName.of('Off');
        //   widget.setAppearanceState(state);
        // }
    }
    removeValue() {
        this.dict.delete(PDFName.of('V'));
    }
    getValue() {
        const v = this.V();
        if (v instanceof PDFString || v instanceof PDFHexString)
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
export default PDFAcroText;
//# sourceMappingURL=PDFAcroText.js.map