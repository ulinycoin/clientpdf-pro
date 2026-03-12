import PDFString from "../objects/PDFString";
import PDFHexString from "../objects/PDFHexString";
import PDFArray from "../objects/PDFArray";
import PDFName from "../objects/PDFName";
import PDFAcroTerminal from "./PDFAcroTerminal";
import { IndexOutOfBoundsError } from "../errors";
class PDFAcroButton extends PDFAcroTerminal {
    Opt() {
        return this.dict.lookupMaybe(PDFName.of('Opt'), PDFString, PDFHexString, PDFArray);
    }
    setOpt(opt) {
        this.dict.set(PDFName.of('Opt'), this.dict.context.obj(opt));
    }
    getExportValues() {
        const opt = this.Opt();
        if (!opt)
            return undefined;
        if (opt instanceof PDFString || opt instanceof PDFHexString) {
            return [opt];
        }
        const values = [];
        for (let idx = 0, len = opt.size(); idx < len; idx++) {
            const value = opt.lookup(idx);
            if (value instanceof PDFString || value instanceof PDFHexString) {
                values.push(value);
            }
        }
        return values;
    }
    removeExportValue(idx) {
        const opt = this.Opt();
        if (!opt)
            return;
        if (opt instanceof PDFString || opt instanceof PDFHexString) {
            if (idx !== 0)
                throw new IndexOutOfBoundsError(idx, 0, 0);
            this.setOpt([]);
        }
        else {
            if (idx < 0 || idx > opt.size()) {
                throw new IndexOutOfBoundsError(idx, 0, opt.size());
            }
            opt.remove(idx);
        }
    }
    // Enforce use use of /Opt even if it isn't strictly necessary
    normalizeExportValues() {
        var _a, _b, _c, _d;
        const exportValues = (_a = this.getExportValues()) !== null && _a !== void 0 ? _a : [];
        const Opt = [];
        const widgets = this.getWidgets();
        for (let idx = 0, len = widgets.length; idx < len; idx++) {
            const widget = widgets[idx];
            const exportVal = (_b = exportValues[idx]) !== null && _b !== void 0 ? _b : PDFHexString.fromText((_d = (_c = widget.getOnValue()) === null || _c === void 0 ? void 0 : _c.decodeText()) !== null && _d !== void 0 ? _d : '');
            Opt.push(exportVal);
        }
        this.setOpt(Opt);
    }
    /**
     * Reuses existing opt if one exists with the same value (assuming
     * `useExistingIdx` is `true`). Returns index of existing (or new) opt.
     */
    addOpt(opt, useExistingOptIdx) {
        var _a;
        this.normalizeExportValues();
        const optText = opt.decodeText();
        let existingIdx;
        if (useExistingOptIdx) {
            const exportValues = (_a = this.getExportValues()) !== null && _a !== void 0 ? _a : [];
            for (let idx = 0, len = exportValues.length; idx < len; idx++) {
                const exportVal = exportValues[idx];
                if (exportVal.decodeText() === optText)
                    existingIdx = idx;
            }
        }
        const Opt = this.Opt();
        Opt.push(opt);
        return existingIdx !== null && existingIdx !== void 0 ? existingIdx : Opt.size() - 1;
    }
    addWidgetWithOpt(widget, opt, useExistingOptIdx) {
        const optIdx = this.addOpt(opt, useExistingOptIdx);
        const apStateValue = PDFName.of(String(optIdx));
        this.addWidget(widget);
        return apStateValue;
    }
}
export default PDFAcroButton;
//# sourceMappingURL=PDFAcroButton.js.map