import PDFName from "../objects/PDFName";
import PDFNumber from "../objects/PDFNumber";
import PDFArray from "../objects/PDFArray";
import PDFHexString from "../objects/PDFHexString";
import PDFString from "../objects/PDFString";
class AppearanceCharacteristics {
    constructor(dict) {
        this.dict = dict;
    }
    R() {
        const R = this.dict.lookup(PDFName.of('R'));
        if (R instanceof PDFNumber)
            return R;
        return undefined;
    }
    BC() {
        const BC = this.dict.lookup(PDFName.of('BC'));
        if (BC instanceof PDFArray)
            return BC;
        return undefined;
    }
    BG() {
        const BG = this.dict.lookup(PDFName.of('BG'));
        if (BG instanceof PDFArray)
            return BG;
        return undefined;
    }
    CA() {
        const CA = this.dict.lookup(PDFName.of('CA'));
        if (CA instanceof PDFHexString || CA instanceof PDFString)
            return CA;
        return undefined;
    }
    RC() {
        const RC = this.dict.lookup(PDFName.of('RC'));
        if (RC instanceof PDFHexString || RC instanceof PDFString)
            return RC;
        return undefined;
    }
    AC() {
        const AC = this.dict.lookup(PDFName.of('AC'));
        if (AC instanceof PDFHexString || AC instanceof PDFString)
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
            if (component instanceof PDFNumber)
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
            if (component instanceof PDFNumber)
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
        this.dict.set(PDFName.of('R'), R);
    }
    setBorderColor(color) {
        const BC = this.dict.context.obj(color);
        this.dict.set(PDFName.of('BC'), BC);
    }
    setBackgroundColor(color) {
        const BG = this.dict.context.obj(color);
        this.dict.set(PDFName.of('BG'), BG);
    }
    setCaptions(captions) {
        const CA = PDFHexString.fromText(captions.normal);
        this.dict.set(PDFName.of('CA'), CA);
        if (captions.rollover) {
            const RC = PDFHexString.fromText(captions.rollover);
            this.dict.set(PDFName.of('RC'), RC);
        }
        else {
            this.dict.delete(PDFName.of('RC'));
        }
        if (captions.down) {
            const AC = PDFHexString.fromText(captions.down);
            this.dict.set(PDFName.of('AC'), AC);
        }
        else {
            this.dict.delete(PDFName.of('AC'));
        }
    }
}
AppearanceCharacteristics.fromDict = (dict) => new AppearanceCharacteristics(dict);
export default AppearanceCharacteristics;
//# sourceMappingURL=AppearanceCharacteristics.js.map