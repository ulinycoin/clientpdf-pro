"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
const PDFNumber_1 = tslib_1.__importDefault(require("../objects/PDFNumber"));
const PDFArray_1 = tslib_1.__importDefault(require("../objects/PDFArray"));
const PDFHexString_1 = tslib_1.__importDefault(require("../objects/PDFHexString"));
const PDFString_1 = tslib_1.__importDefault(require("../objects/PDFString"));
class AppearanceCharacteristics {
    constructor(dict) {
        this.dict = dict;
    }
    R() {
        const R = this.dict.lookup(PDFName_1.default.of('R'));
        if (R instanceof PDFNumber_1.default)
            return R;
        return undefined;
    }
    BC() {
        const BC = this.dict.lookup(PDFName_1.default.of('BC'));
        if (BC instanceof PDFArray_1.default)
            return BC;
        return undefined;
    }
    BG() {
        const BG = this.dict.lookup(PDFName_1.default.of('BG'));
        if (BG instanceof PDFArray_1.default)
            return BG;
        return undefined;
    }
    CA() {
        const CA = this.dict.lookup(PDFName_1.default.of('CA'));
        if (CA instanceof PDFHexString_1.default || CA instanceof PDFString_1.default)
            return CA;
        return undefined;
    }
    RC() {
        const RC = this.dict.lookup(PDFName_1.default.of('RC'));
        if (RC instanceof PDFHexString_1.default || RC instanceof PDFString_1.default)
            return RC;
        return undefined;
    }
    AC() {
        const AC = this.dict.lookup(PDFName_1.default.of('AC'));
        if (AC instanceof PDFHexString_1.default || AC instanceof PDFString_1.default)
            return AC;
        return undefined;
    }
    getRotation() {
        var _a;
        return (_a = this.R()) === null || _a === void 0 ? void 0 : _a.asNumber();
    }
    getBorderColor() {
        const BC = this.BC();
        if (!BC)
            return undefined;
        const components = [];
        for (let idx = 0, len = BC === null || BC === void 0 ? void 0 : BC.size(); idx < len; idx++) {
            const component = BC.get(idx);
            if (component instanceof PDFNumber_1.default)
                components.push(component.asNumber());
        }
        return components;
    }
    getBackgroundColor() {
        const BG = this.BG();
        if (!BG)
            return undefined;
        const components = [];
        for (let idx = 0, len = BG === null || BG === void 0 ? void 0 : BG.size(); idx < len; idx++) {
            const component = BG.get(idx);
            if (component instanceof PDFNumber_1.default)
                components.push(component.asNumber());
        }
        return components;
    }
    getCaptions() {
        const CA = this.CA();
        const RC = this.RC();
        const AC = this.AC();
        return {
            normal: CA === null || CA === void 0 ? void 0 : CA.decodeText(),
            rollover: RC === null || RC === void 0 ? void 0 : RC.decodeText(),
            down: AC === null || AC === void 0 ? void 0 : AC.decodeText(),
        };
    }
    setRotation(rotation) {
        const R = this.dict.context.obj(rotation);
        this.dict.set(PDFName_1.default.of('R'), R);
    }
    setBorderColor(color) {
        const BC = this.dict.context.obj(color);
        this.dict.set(PDFName_1.default.of('BC'), BC);
    }
    setBackgroundColor(color) {
        const BG = this.dict.context.obj(color);
        this.dict.set(PDFName_1.default.of('BG'), BG);
    }
    setCaptions(captions) {
        const CA = PDFHexString_1.default.fromText(captions.normal);
        this.dict.set(PDFName_1.default.of('CA'), CA);
        if (captions.rollover) {
            const RC = PDFHexString_1.default.fromText(captions.rollover);
            this.dict.set(PDFName_1.default.of('RC'), RC);
        }
        else {
            this.dict.delete(PDFName_1.default.of('RC'));
        }
        if (captions.down) {
            const AC = PDFHexString_1.default.fromText(captions.down);
            this.dict.set(PDFName_1.default.of('AC'), AC);
        }
        else {
            this.dict.delete(PDFName_1.default.of('AC'));
        }
    }
}
AppearanceCharacteristics.fromDict = (dict) => new AppearanceCharacteristics(dict);
exports.default = AppearanceCharacteristics;
//# sourceMappingURL=AppearanceCharacteristics.js.map