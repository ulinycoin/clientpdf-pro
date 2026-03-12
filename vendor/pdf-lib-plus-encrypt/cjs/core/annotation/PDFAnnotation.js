"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFDict_1 = tslib_1.__importDefault(require("../objects/PDFDict"));
const PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
const PDFStream_1 = tslib_1.__importDefault(require("../objects/PDFStream"));
const PDFArray_1 = tslib_1.__importDefault(require("../objects/PDFArray"));
const PDFRef_1 = tslib_1.__importDefault(require("../objects/PDFRef"));
const PDFNumber_1 = tslib_1.__importDefault(require("../objects/PDFNumber"));
class PDFAnnotation {
    constructor(dict) {
        this.dict = dict;
    }
    // This is technically required by the PDF spec
    Rect() {
        return this.dict.lookup(PDFName_1.default.of('Rect'), PDFArray_1.default);
    }
    AP() {
        return this.dict.lookupMaybe(PDFName_1.default.of('AP'), PDFDict_1.default);
    }
    F() {
        const numberOrRef = this.dict.lookup(PDFName_1.default.of('F'));
        return this.dict.context.lookupMaybe(numberOrRef, PDFNumber_1.default);
    }
    getRectangle() {
        var _a;
        const Rect = this.Rect();
        return (_a = Rect === null || Rect === void 0 ? void 0 : Rect.asRectangle()) !== null && _a !== void 0 ? _a : { x: 0, y: 0, width: 0, height: 0 };
    }
    setRectangle(rect) {
        const { x, y, width, height } = rect;
        const Rect = this.dict.context.obj([x, y, x + width, y + height]);
        this.dict.set(PDFName_1.default.of('Rect'), Rect);
    }
    getAppearanceState() {
        const AS = this.dict.lookup(PDFName_1.default.of('AS'));
        if (AS instanceof PDFName_1.default)
            return AS;
        return undefined;
    }
    setAppearanceState(state) {
        this.dict.set(PDFName_1.default.of('AS'), state);
    }
    setAppearances(appearances) {
        this.dict.set(PDFName_1.default.of('AP'), appearances);
    }
    ensureAP() {
        let AP = this.AP();
        if (!AP) {
            AP = this.dict.context.obj({});
            this.dict.set(PDFName_1.default.of('AP'), AP);
        }
        return AP;
    }
    getNormalAppearance() {
        const AP = this.ensureAP();
        const N = AP.get(PDFName_1.default.of('N'));
        if (N instanceof PDFRef_1.default || N instanceof PDFDict_1.default)
            return N;
        throw new Error(`Unexpected N type: ${N === null || N === void 0 ? void 0 : N.constructor.name}`);
    }
    /** @param appearance A PDFDict or PDFStream (direct or ref) */
    setNormalAppearance(appearance) {
        const AP = this.ensureAP();
        AP.set(PDFName_1.default.of('N'), appearance);
    }
    /** @param appearance A PDFDict or PDFStream (direct or ref) */
    setRolloverAppearance(appearance) {
        const AP = this.ensureAP();
        AP.set(PDFName_1.default.of('R'), appearance);
    }
    /** @param appearance A PDFDict or PDFStream (direct or ref) */
    setDownAppearance(appearance) {
        const AP = this.ensureAP();
        AP.set(PDFName_1.default.of('D'), appearance);
    }
    removeRolloverAppearance() {
        const AP = this.AP();
        AP === null || AP === void 0 ? void 0 : AP.delete(PDFName_1.default.of('R'));
    }
    removeDownAppearance() {
        const AP = this.AP();
        AP === null || AP === void 0 ? void 0 : AP.delete(PDFName_1.default.of('D'));
    }
    getAppearances() {
        const AP = this.AP();
        if (!AP)
            return undefined;
        const N = AP.lookup(PDFName_1.default.of('N'), PDFDict_1.default, PDFStream_1.default);
        const R = AP.lookupMaybe(PDFName_1.default.of('R'), PDFDict_1.default, PDFStream_1.default);
        const D = AP.lookupMaybe(PDFName_1.default.of('D'), PDFDict_1.default, PDFStream_1.default);
        return { normal: N, rollover: R, down: D };
    }
    getFlags() {
        var _a, _b;
        return (_b = (_a = this.F()) === null || _a === void 0 ? void 0 : _a.asNumber()) !== null && _b !== void 0 ? _b : 0;
    }
    setFlags(flags) {
        this.dict.set(PDFName_1.default.of('F'), PDFNumber_1.default.of(flags));
    }
    hasFlag(flag) {
        const flags = this.getFlags();
        return (flags & flag) !== 0;
    }
    setFlag(flag) {
        const flags = this.getFlags();
        this.setFlags(flags | flag);
    }
    clearFlag(flag) {
        const flags = this.getFlags();
        this.setFlags(flags & ~flag);
    }
    setFlagTo(flag, enable) {
        if (enable)
            this.setFlag(flag);
        else
            this.clearFlag(flag);
    }
}
PDFAnnotation.fromDict = (dict) => new PDFAnnotation(dict);
exports.default = PDFAnnotation;
//# sourceMappingURL=PDFAnnotation.js.map