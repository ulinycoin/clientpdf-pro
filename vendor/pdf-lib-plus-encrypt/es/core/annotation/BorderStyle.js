import PDFName from "../objects/PDFName";
import PDFNumber from "../objects/PDFNumber";
// TODO: Also handle the `/S` and `/D` entries
class BorderStyle {
    constructor(dict) {
        this.dict = dict;
    }
    W() {
        const W = this.dict.lookup(PDFName.of('W'));
        if (W instanceof PDFNumber)
            return W;
        return undefined;
    }
    getWidth() {
        var _a, _b;
        return (_b = (_a = this.W()) === null || _a === void 0 ? void 0 : _a.asNumber()) !== null && _b !== void 0 ? _b : 1;
    }
    setWidth(width) {
        const W = this.dict.context.obj(width);
        this.dict.set(PDFName.of('W'), W);
    }
}
BorderStyle.fromDict = (dict) => new BorderStyle(dict);
export default BorderStyle;
//# sourceMappingURL=BorderStyle.js.map