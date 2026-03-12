"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFDict_1 = tslib_1.__importDefault(require("../objects/PDFDict"));
const PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
const PDFRef_1 = tslib_1.__importDefault(require("../objects/PDFRef"));
const PDFString_1 = tslib_1.__importDefault(require("../objects/PDFString"));
const PDFHexString_1 = tslib_1.__importDefault(require("../objects/PDFHexString"));
const BorderStyle_1 = tslib_1.__importDefault(require("./BorderStyle"));
const PDFAnnotation_1 = tslib_1.__importDefault(require("./PDFAnnotation"));
const AppearanceCharacteristics_1 = tslib_1.__importDefault(require("./AppearanceCharacteristics"));
class PDFWidgetAnnotation extends PDFAnnotation_1.default {
    MK() {
        const MK = this.dict.lookup(PDFName_1.default.of('MK'));
        if (MK instanceof PDFDict_1.default)
            return MK;
        return undefined;
    }
    BS() {
        const BS = this.dict.lookup(PDFName_1.default.of('BS'));
        if (BS instanceof PDFDict_1.default)
            return BS;
        return undefined;
    }
    DA() {
        const da = this.dict.lookup(PDFName_1.default.of('DA'));
        if (da instanceof PDFString_1.default || da instanceof PDFHexString_1.default)
            return da;
        return undefined;
    }
    P() {
        const P = this.dict.get(PDFName_1.default.of('P'));
        if (P instanceof PDFRef_1.default)
            return P;
        return undefined;
    }
    setDefaultAppearance(appearance) {
        this.dict.set(PDFName_1.default.of('DA'), PDFString_1.default.of(appearance));
    }
    getDefaultAppearance() {
        const DA = this.DA();
        if (DA instanceof PDFHexString_1.default) {
            return DA.decodeText();
        }
        return DA === null || DA === void 0 ? void 0 : DA.asString();
    }
    getAppearanceCharacteristics() {
        const MK = this.MK();
        if (MK)
            return AppearanceCharacteristics_1.default.fromDict(MK);
        return undefined;
    }
    getOrCreateAppearanceCharacteristics() {
        const MK = this.MK();
        if (MK)
            return AppearanceCharacteristics_1.default.fromDict(MK);
        const ac = AppearanceCharacteristics_1.default.fromDict(this.dict.context.obj({}));
        this.dict.set(PDFName_1.default.of('MK'), ac.dict);
        return ac;
    }
    getBorderStyle() {
        const BS = this.BS();
        if (BS)
            return BorderStyle_1.default.fromDict(BS);
        return undefined;
    }
    getOrCreateBorderStyle() {
        const BS = this.BS();
        if (BS)
            return BorderStyle_1.default.fromDict(BS);
        const bs = BorderStyle_1.default.fromDict(this.dict.context.obj({}));
        this.dict.set(PDFName_1.default.of('BS'), bs.dict);
        return bs;
    }
    getOnValue() {
        var _a;
        const normal = (_a = this.getAppearances()) === null || _a === void 0 ? void 0 : _a.normal;
        if (normal instanceof PDFDict_1.default) {
            const keys = normal.keys();
            for (let idx = 0, len = keys.length; idx < len; idx++) {
                const key = keys[idx];
                if (key !== PDFName_1.default.of('Off'))
                    return key;
            }
        }
        return undefined;
    }
}
PDFWidgetAnnotation.fromDict = (dict) => new PDFWidgetAnnotation(dict);
PDFWidgetAnnotation.create = (context, parent) => {
    const dict = context.obj({
        Type: 'Annot',
        Subtype: 'Widget',
        Rect: [0, 0, 0, 0],
        Parent: parent,
    });
    return new PDFWidgetAnnotation(dict);
};
exports.default = PDFWidgetAnnotation;
//# sourceMappingURL=PDFWidgetAnnotation.js.map