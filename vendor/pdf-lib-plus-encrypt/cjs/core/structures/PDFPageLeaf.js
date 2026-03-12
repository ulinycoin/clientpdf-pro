"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFArray_1 = tslib_1.__importDefault(require("../objects/PDFArray"));
const PDFDict_1 = tslib_1.__importDefault(require("../objects/PDFDict"));
const PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
const PDFNumber_1 = tslib_1.__importDefault(require("../objects/PDFNumber"));
const PDFStream_1 = tslib_1.__importDefault(require("../objects/PDFStream"));
class PDFPageLeaf extends PDFDict_1.default {
    constructor(map, context, autoNormalizeCTM = true) {
        super(map, context);
        this.normalized = false;
        this.autoNormalizeCTM = autoNormalizeCTM;
    }
    clone(context) {
        const clone = PDFPageLeaf.fromMapWithContext(new Map(), context || this.context, this.autoNormalizeCTM);
        const entries = this.entries();
        for (let idx = 0, len = entries.length; idx < len; idx++) {
            const [key, value] = entries[idx];
            clone.set(key, value);
        }
        return clone;
    }
    Parent() {
        return this.lookupMaybe(PDFName_1.default.Parent, PDFDict_1.default);
    }
    Contents() {
        return this.lookup(PDFName_1.default.of('Contents'));
    }
    Annots() {
        return this.lookupMaybe(PDFName_1.default.Annots, PDFArray_1.default);
    }
    BleedBox() {
        return this.lookupMaybe(PDFName_1.default.BleedBox, PDFArray_1.default);
    }
    TrimBox() {
        return this.lookupMaybe(PDFName_1.default.TrimBox, PDFArray_1.default);
    }
    ArtBox() {
        return this.lookupMaybe(PDFName_1.default.ArtBox, PDFArray_1.default);
    }
    Resources() {
        const dictOrRef = this.getInheritableAttribute(PDFName_1.default.Resources);
        return this.context.lookupMaybe(dictOrRef, PDFDict_1.default);
    }
    MediaBox() {
        const arrayOrRef = this.getInheritableAttribute(PDFName_1.default.MediaBox);
        return this.context.lookup(arrayOrRef, PDFArray_1.default);
    }
    CropBox() {
        const arrayOrRef = this.getInheritableAttribute(PDFName_1.default.CropBox);
        return this.context.lookupMaybe(arrayOrRef, PDFArray_1.default);
    }
    Rotate() {
        const numberOrRef = this.getInheritableAttribute(PDFName_1.default.Rotate);
        return this.context.lookupMaybe(numberOrRef, PDFNumber_1.default);
    }
    getInheritableAttribute(name) {
        let attribute;
        this.ascend((node) => {
            if (!attribute)
                attribute = node.get(name);
        });
        return attribute;
    }
    setParent(parentRef) {
        this.set(PDFName_1.default.Parent, parentRef);
    }
    addContentStream(contentStreamRef) {
        const Contents = this.normalizedEntries().Contents || this.context.obj([]);
        this.set(PDFName_1.default.Contents, Contents);
        Contents.push(contentStreamRef);
    }
    wrapContentStreams(startStream, endStream) {
        const Contents = this.Contents();
        if (Contents instanceof PDFArray_1.default) {
            Contents.insert(0, startStream);
            Contents.push(endStream);
            return true;
        }
        return false;
    }
    addAnnot(annotRef) {
        const { Annots } = this.normalizedEntries();
        Annots.push(annotRef);
    }
    removeAnnot(annotRef) {
        const { Annots } = this.normalizedEntries();
        const index = Annots.indexOf(annotRef);
        if (index !== undefined) {
            Annots.remove(index);
        }
    }
    setFontDictionary(name, fontDictRef) {
        const { Font } = this.normalizedEntries();
        Font.set(name, fontDictRef);
    }
    setXObject(name, xObjectRef) {
        const { XObject } = this.normalizedEntries();
        XObject.set(name, xObjectRef);
    }
    setExtGState(name, extGStateRef) {
        const { ExtGState } = this.normalizedEntries();
        ExtGState.set(name, extGStateRef);
    }
    ascend(visitor) {
        visitor(this);
        const Parent = this.Parent();
        if (Parent)
            Parent.ascend(visitor);
    }
    normalize() {
        if (this.normalized)
            return;
        const { context } = this;
        const contentsRef = this.get(PDFName_1.default.Contents);
        const contents = this.context.lookup(contentsRef);
        if (contents instanceof PDFStream_1.default) {
            this.set(PDFName_1.default.Contents, context.obj([contentsRef]));
        }
        if (this.autoNormalizeCTM) {
            this.wrapContentStreams(this.context.getPushGraphicsStateContentStream(), this.context.getPopGraphicsStateContentStream());
        }
        // TODO: Clone `Resources` if it is inherited
        const dictOrRef = this.getInheritableAttribute(PDFName_1.default.Resources);
        const Resources = context.lookupMaybe(dictOrRef, PDFDict_1.default) || context.obj({});
        this.set(PDFName_1.default.Resources, Resources);
        // TODO: Clone `Font` if it is inherited
        const Font = Resources.lookupMaybe(PDFName_1.default.Font, PDFDict_1.default) || context.obj({});
        Resources.set(PDFName_1.default.Font, Font);
        // TODO: Clone `XObject` if it is inherited
        const XObject = Resources.lookupMaybe(PDFName_1.default.XObject, PDFDict_1.default) || context.obj({});
        Resources.set(PDFName_1.default.XObject, XObject);
        // TODO: Clone `ExtGState` if it is inherited
        const ExtGState = Resources.lookupMaybe(PDFName_1.default.ExtGState, PDFDict_1.default) || context.obj({});
        Resources.set(PDFName_1.default.ExtGState, ExtGState);
        const Annots = this.Annots() || context.obj([]);
        this.set(PDFName_1.default.Annots, Annots);
        this.normalized = true;
    }
    normalizedEntries() {
        this.normalize();
        const Annots = this.Annots();
        const Resources = this.Resources();
        const Contents = this.Contents();
        return {
            Annots,
            Resources,
            Contents,
            Font: Resources.lookup(PDFName_1.default.Font, PDFDict_1.default),
            XObject: Resources.lookup(PDFName_1.default.XObject, PDFDict_1.default),
            ExtGState: Resources.lookup(PDFName_1.default.ExtGState, PDFDict_1.default),
        };
    }
}
PDFPageLeaf.InheritableEntries = [
    'Resources',
    'MediaBox',
    'CropBox',
    'Rotate',
];
PDFPageLeaf.withContextAndParent = (context, parent) => {
    const dict = new Map();
    dict.set(PDFName_1.default.Type, PDFName_1.default.Page);
    dict.set(PDFName_1.default.Parent, parent);
    dict.set(PDFName_1.default.Resources, context.obj({}));
    dict.set(PDFName_1.default.MediaBox, context.obj([0, 0, 612, 792]));
    return new PDFPageLeaf(dict, context, false);
};
PDFPageLeaf.fromMapWithContext = (map, context, autoNormalizeCTM = true) => new PDFPageLeaf(map, context, autoNormalizeCTM);
exports.default = PDFPageLeaf;
//# sourceMappingURL=PDFPageLeaf.js.map