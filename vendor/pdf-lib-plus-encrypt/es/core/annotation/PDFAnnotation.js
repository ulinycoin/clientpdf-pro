import PDFDict from "../objects/PDFDict";
import PDFName from "../objects/PDFName";
import PDFStream from "../objects/PDFStream";
import PDFArray from "../objects/PDFArray";
import PDFRef from "../objects/PDFRef";
import PDFNumber from "../objects/PDFNumber";
class PDFAnnotation {
    constructor(dict) {
        this.dict = dict;
    }
    // This is technically required by the PDF spec
    Rect() {
        return this.dict.lookup(PDFName.of('Rect'), PDFArray);
    }
    AP() {
        return this.dict.lookupMaybe(PDFName.of('AP'), PDFDict);
    }
    F() {
        const numberOrRef = this.dict.lookup(PDFName.of('F'));
        return this.dict.context.lookupMaybe(numberOrRef, PDFNumber);
    }
    getRectangle() {
        var _a;
        const Rect = this.Rect();
        return (_a = Rect === null || Rect === void 0 ? void 0 : Rect.asRectangle()) !== null && _a !== void 0 ? _a : { x: 0, y: 0, width: 0, height: 0 };
    }
    setRectangle(rect) {
        const { x, y, width, height } = rect;
        const Rect = this.dict.context.obj([x, y, x + width, y + height]);
        this.dict.set(PDFName.of('Rect'), Rect);
    }
    getAppearanceState() {
        const AS = this.dict.lookup(PDFName.of('AS'));
        if (AS instanceof PDFName)
            return AS;
        return undefined;
    }
    setAppearanceState(state) {
        this.dict.set(PDFName.of('AS'), state);
    }
    setAppearances(appearances) {
        this.dict.set(PDFName.of('AP'), appearances);
    }
    ensureAP() {
        let AP = this.AP();
        if (!AP) {
            AP = this.dict.context.obj({});
            this.dict.set(PDFName.of('AP'), AP);
        }
        return AP;
    }
    getNormalAppearance() {
        const AP = this.ensureAP();
        const N = AP.get(PDFName.of('N'));
        if (N instanceof PDFRef || N instanceof PDFDict)
            return N;
        throw new Error(`Unexpected N type: ${N === null || N === void 0 ? void 0 : N.constructor.name}`);
    }
    /** @param appearance A PDFDict or PDFStream (direct or ref) */
    setNormalAppearance(appearance) {
        const AP = this.ensureAP();
        AP.set(PDFName.of('N'), appearance);
    }
    /** @param appearance A PDFDict or PDFStream (direct or ref) */
    setRolloverAppearance(appearance) {
        const AP = this.ensureAP();
        AP.set(PDFName.of('R'), appearance);
    }
    /** @param appearance A PDFDict or PDFStream (direct or ref) */
    setDownAppearance(appearance) {
        const AP = this.ensureAP();
        AP.set(PDFName.of('D'), appearance);
    }
    removeRolloverAppearance() {
        const AP = this.AP();
        AP === null || AP === void 0 ? void 0 : AP.delete(PDFName.of('R'));
    }
    removeDownAppearance() {
        const AP = this.AP();
        AP === null || AP === void 0 ? void 0 : AP.delete(PDFName.of('D'));
    }
    getAppearances() {
        const AP = this.AP();
        if (!AP)
            return undefined;
        const N = AP.lookup(PDFName.of('N'), PDFDict, PDFStream);
        const R = AP.lookupMaybe(PDFName.of('R'), PDFDict, PDFStream);
        const D = AP.lookupMaybe(PDFName.of('D'), PDFDict, PDFStream);
        return { normal: N, rollover: R, down: D };
    }
    getFlags() {
        var _a, _b;
        return (_b = (_a = this.F()) === null || _a === void 0 ? void 0 : _a.asNumber()) !== null && _b !== void 0 ? _b : 0;
    }
    setFlags(flags) {
        this.dict.set(PDFName.of('F'), PDFNumber.of(flags));
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
export default PDFAnnotation;
//# sourceMappingURL=PDFAnnotation.js.map