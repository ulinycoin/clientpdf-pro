"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFString_1 = tslib_1.__importDefault(require("../objects/PDFString"));
const PDFHexString_1 = tslib_1.__importDefault(require("../objects/PDFHexString"));
const PDFArray_1 = tslib_1.__importDefault(require("../objects/PDFArray"));
const PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
const PDFAcroTerminal_1 = tslib_1.__importDefault(require("./PDFAcroTerminal"));
const errors_1 = require("../errors");
class PDFAcroButton extends PDFAcroTerminal_1.default {
    Opt() {
        return this.dict.lookupMaybe(PDFName_1.default.of('Opt'), PDFString_1.default, PDFHexString_1.default, PDFArray_1.default);
    }
    setOpt(opt) {
        this.dict.set(PDFName_1.default.of('Opt'), this.dict.context.obj(opt));
    }
    getExportValues() {
        const opt = this.Opt();
        if (!opt)
            return undefined;
        if (opt instanceof PDFString_1.default || opt instanceof PDFHexString_1.default) {
            return [opt];
        }
        const values = [];
        for (let idx = 0, len = opt.size(); idx < len; idx++) {
            const value = opt.lookup(idx);
            if (value instanceof PDFString_1.default || value instanceof PDFHexString_1.default) {
                values.push(value);
            }
        }
        return values;
    }
    removeExportValue(idx) {
        const opt = this.Opt();
        if (!opt)
            return;
        if (opt instanceof PDFString_1.default || opt instanceof PDFHexString_1.default) {
            if (idx !== 0)
                throw new errors_1.IndexOutOfBoundsError(idx, 0, 0);
            this.setOpt([]);
        }
        else {
            if (idx < 0 || idx > opt.size()) {
                throw new errors_1.IndexOutOfBoundsError(idx, 0, opt.size());
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
            const exportVal = (_b = exportValues[idx]) !== null && _b !== void 0 ? _b : PDFHexString_1.default.fromText((_d = (_c = widget.getOnValue()) === null || _c === void 0 ? void 0 : _c.decodeText()) !== null && _d !== void 0 ? _d : '');
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
        const apStateValue = PDFName_1.default.of(String(optIdx));
        this.addWidget(widget);
        return apStateValue;
    }
}
exports.default = PDFAcroButton;
//# sourceMappingURL=PDFAcroButton.js.map