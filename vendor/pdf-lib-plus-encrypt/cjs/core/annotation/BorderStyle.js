"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
const PDFNumber_1 = tslib_1.__importDefault(require("../objects/PDFNumber"));
// TODO: Also handle the `/S` and `/D` entries
class BorderStyle {
    constructor(dict) {
        this.dict = dict;
    }
    W() {
        const W = this.dict.lookup(PDFName_1.default.of('W'));
        if (W instanceof PDFNumber_1.default)
            return W;
        return undefined;
    }
    getWidth() {
        var _a, _b;
        return (_b = (_a = this.W()) === null || _a === void 0 ? void 0 : _a.asNumber()) !== null && _b !== void 0 ? _b : 1;
    }
    setWidth(width) {
        const W = this.dict.context.obj(width);
        this.dict.set(PDFName_1.default.of('W'), W);
    }
}
BorderStyle.fromDict = (dict) => new BorderStyle(dict);
exports.default = BorderStyle;
//# sourceMappingURL=BorderStyle.js.map