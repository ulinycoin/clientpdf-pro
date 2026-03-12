"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFDict_1 = tslib_1.__importDefault(require("../objects/PDFDict"));
const PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
const PDFAcroField_1 = tslib_1.__importDefault(require("./PDFAcroField"));
const PDFWidgetAnnotation_1 = tslib_1.__importDefault(require("../annotation/PDFWidgetAnnotation"));
const errors_1 = require("../errors");
class PDFAcroTerminal extends PDFAcroField_1.default {
    FT() {
        const nameOrRef = this.getInheritableAttribute(PDFName_1.default.of('FT'));
        return this.dict.context.lookup(nameOrRef, PDFName_1.default);
    }
    getWidgets() {
        const kidDicts = this.Kids();
        // This field is itself a widget
        if (!kidDicts)
            return [PDFWidgetAnnotation_1.default.fromDict(this.dict)];
        // This field's kids are its widgets
        const widgets = new Array(kidDicts.size());
        for (let idx = 0, len = kidDicts.size(); idx < len; idx++) {
            const dict = kidDicts.lookup(idx, PDFDict_1.default);
            widgets[idx] = PDFWidgetAnnotation_1.default.fromDict(dict);
        }
        return widgets;
    }
    addWidget(ref) {
        const { Kids } = this.normalizedEntries();
        Kids.push(ref);
    }
    removeWidget(idx) {
        const kidDicts = this.Kids();
        if (!kidDicts) {
            // This field is itself a widget
            if (idx !== 0)
                throw new errors_1.IndexOutOfBoundsError(idx, 0, 0);
            this.setKids([]);
        }
        else {
            // This field's kids are its widgets
            if (idx < 0 || idx > kidDicts.size()) {
                throw new errors_1.IndexOutOfBoundsError(idx, 0, kidDicts.size());
            }
            kidDicts.remove(idx);
        }
    }
    normalizedEntries() {
        let Kids = this.Kids();
        // If this field is itself a widget (because it was only rendered once in
        // the document, so the field and widget properties were merged) then we
        // add itself to the `Kids` array. The alternative would be to try
        // splitting apart the widget properties and creating a separate object
        // for them.
        if (!Kids) {
            Kids = this.dict.context.obj([this.ref]);
            this.dict.set(PDFName_1.default.of('Kids'), Kids);
        }
        return { Kids };
    }
}
PDFAcroTerminal.fromDict = (dict, ref) => new PDFAcroTerminal(dict, ref);
exports.default = PDFAcroTerminal;
//# sourceMappingURL=PDFAcroTerminal.js.map