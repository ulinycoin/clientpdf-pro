"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFDict_1 = tslib_1.__importDefault(require("../objects/PDFDict"));
const PDFString_1 = tslib_1.__importDefault(require("../objects/PDFString"));
const PDFHexString_1 = tslib_1.__importDefault(require("../objects/PDFHexString"));
const PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
const PDFNumber_1 = tslib_1.__importDefault(require("../objects/PDFNumber"));
const PDFArray_1 = tslib_1.__importDefault(require("../objects/PDFArray"));
const PDFRef_1 = tslib_1.__importDefault(require("../objects/PDFRef"));
const utils_1 = require("../../utils");
const errors_1 = require("../errors");
// Examples:
//   `/Helv 12 Tf` -> ['Helv', '12']
//   `/HeBo 8.00 Tf` -> ['HeBo', '8.00']
//   `/HeBo Tf` -> ['HeBo', undefined]
const tfRegex = /\/([^\0\t\n\f\r\ ]+)[\0\t\n\f\r\ ]*(\d*\.\d+|\d+)?[\0\t\n\f\r\ ]+Tf/;
class PDFAcroField {
    constructor(dict, ref) {
        this.dict = dict;
        this.ref = ref;
    }
    T() {
        return this.dict.lookupMaybe(PDFName_1.default.of('T'), PDFString_1.default, PDFHexString_1.default);
    }
    Ff() {
        const numberOrRef = this.getInheritableAttribute(PDFName_1.default.of('Ff'));
        return this.dict.context.lookupMaybe(numberOrRef, PDFNumber_1.default);
    }
    V() {
        const valueOrRef = this.getInheritableAttribute(PDFName_1.default.of('V'));
        return this.dict.context.lookup(valueOrRef);
    }
    Kids() {
        return this.dict.lookupMaybe(PDFName_1.default.of('Kids'), PDFArray_1.default);
    }
    // Parent(): PDFDict | undefined {
    //   return this.dict.lookupMaybe(PDFName.of('Parent'), PDFDict);
    // }
    DA() {
        const da = this.dict.lookup(PDFName_1.default.of('DA'));
        if (da instanceof PDFString_1.default || da instanceof PDFHexString_1.default)
            return da;
        return undefined;
    }
    setKids(kids) {
        this.dict.set(PDFName_1.default.of('Kids'), this.dict.context.obj(kids));
    }
    getParent() {
        // const parent = this.Parent();
        // if (!parent) return undefined;
        // return new PDFAcroField(parent);
        const parentRef = this.dict.get(PDFName_1.default.of('Parent'));
        if (parentRef instanceof PDFRef_1.default) {
            const parent = this.dict.lookup(PDFName_1.default.of('Parent'), PDFDict_1.default);
            return new PDFAcroField(parent, parentRef);
        }
        return undefined;
    }
    setParent(parent) {
        if (!parent)
            this.dict.delete(PDFName_1.default.of('Parent'));
        else
            this.dict.set(PDFName_1.default.of('Parent'), parent);
    }
    getFullyQualifiedName() {
        const parent = this.getParent();
        if (!parent)
            return this.getPartialName();
        return `${parent.getFullyQualifiedName()}.${this.getPartialName()}`;
    }
    getPartialName() {
        var _a;
        return (_a = this.T()) === null || _a === void 0 ? void 0 : _a.decodeText();
    }
    setPartialName(partialName) {
        if (!partialName)
            this.dict.delete(PDFName_1.default.of('T'));
        else
            this.dict.set(PDFName_1.default.of('T'), PDFHexString_1.default.fromText(partialName));
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
    setFontSize(fontSize) {
        var _a;
        const name = (_a = this.getFullyQualifiedName()) !== null && _a !== void 0 ? _a : '';
        const da = this.getDefaultAppearance();
        if (!da)
            throw new errors_1.MissingDAEntryError(name);
        const daMatch = (0, utils_1.findLastMatch)(da, tfRegex);
        if (!daMatch.match)
            throw new errors_1.MissingTfOperatorError(name);
        const daStart = da.slice(0, daMatch.pos - daMatch.match[0].length);
        const daEnd = daMatch.pos <= da.length ? da.slice(daMatch.pos) : '';
        const fontName = daMatch.match[1];
        const modifiedDa = `${daStart} /${fontName} ${fontSize} Tf ${daEnd}`;
        this.setDefaultAppearance(modifiedDa);
    }
    getFlags() {
        var _a, _b;
        return (_b = (_a = this.Ff()) === null || _a === void 0 ? void 0 : _a.asNumber()) !== null && _b !== void 0 ? _b : 0;
    }
    setFlags(flags) {
        this.dict.set(PDFName_1.default.of('Ff'), PDFNumber_1.default.of(flags));
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
    getInheritableAttribute(name) {
        let attribute;
        this.ascend((node) => {
            if (!attribute)
                attribute = node.dict.get(name);
        });
        return attribute;
    }
    ascend(visitor) {
        visitor(this);
        const parent = this.getParent();
        if (parent)
            parent.ascend(visitor);
    }
}
exports.default = PDFAcroField;
//# sourceMappingURL=PDFAcroField.js.map