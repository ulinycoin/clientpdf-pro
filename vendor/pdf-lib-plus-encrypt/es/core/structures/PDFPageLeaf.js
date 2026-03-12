import PDFArray from "../objects/PDFArray";
import PDFDict from "../objects/PDFDict";
import PDFName from "../objects/PDFName";
import PDFNumber from "../objects/PDFNumber";
import PDFStream from "../objects/PDFStream";
class PDFPageLeaf extends PDFDict {
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
        return this.lookupMaybe(PDFName.Parent, PDFDict);
    }
    Contents() {
        return this.lookup(PDFName.of('Contents'));
    }
    Annots() {
        return this.lookupMaybe(PDFName.Annots, PDFArray);
    }
    BleedBox() {
        return this.lookupMaybe(PDFName.BleedBox, PDFArray);
    }
    TrimBox() {
        return this.lookupMaybe(PDFName.TrimBox, PDFArray);
    }
    ArtBox() {
        return this.lookupMaybe(PDFName.ArtBox, PDFArray);
    }
    Resources() {
        const dictOrRef = this.getInheritableAttribute(PDFName.Resources);
        return this.context.lookupMaybe(dictOrRef, PDFDict);
    }
    MediaBox() {
        const arrayOrRef = this.getInheritableAttribute(PDFName.MediaBox);
        return this.context.lookup(arrayOrRef, PDFArray);
    }
    CropBox() {
        const arrayOrRef = this.getInheritableAttribute(PDFName.CropBox);
        return this.context.lookupMaybe(arrayOrRef, PDFArray);
    }
    Rotate() {
        const numberOrRef = this.getInheritableAttribute(PDFName.Rotate);
        return this.context.lookupMaybe(numberOrRef, PDFNumber);
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
        this.set(PDFName.Parent, parentRef);
    }
    addContentStream(contentStreamRef) {
        const Contents = this.normalizedEntries().Contents || this.context.obj([]);
        this.set(PDFName.Contents, Contents);
        Contents.push(contentStreamRef);
    }
    wrapContentStreams(startStream, endStream) {
        const Contents = this.Contents();
        if (Contents instanceof PDFArray) {
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
        const contentsRef = this.get(PDFName.Contents);
        const contents = this.context.lookup(contentsRef);
        if (contents instanceof PDFStream) {
            this.set(PDFName.Contents, context.obj([contentsRef]));
        }
        if (this.autoNormalizeCTM) {
            this.wrapContentStreams(this.context.getPushGraphicsStateContentStream(), this.context.getPopGraphicsStateContentStream());
        }
        // TODO: Clone `Resources` if it is inherited
        const dictOrRef = this.getInheritableAttribute(PDFName.Resources);
        const Resources = context.lookupMaybe(dictOrRef, PDFDict) || context.obj({});
        this.set(PDFName.Resources, Resources);
        // TODO: Clone `Font` if it is inherited
        const Font = Resources.lookupMaybe(PDFName.Font, PDFDict) || context.obj({});
        Resources.set(PDFName.Font, Font);
        // TODO: Clone `XObject` if it is inherited
        const XObject = Resources.lookupMaybe(PDFName.XObject, PDFDict) || context.obj({});
        Resources.set(PDFName.XObject, XObject);
        // TODO: Clone `ExtGState` if it is inherited
        const ExtGState = Resources.lookupMaybe(PDFName.ExtGState, PDFDict) || context.obj({});
        Resources.set(PDFName.ExtGState, ExtGState);
        const Annots = this.Annots() || context.obj([]);
        this.set(PDFName.Annots, Annots);
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
            Font: Resources.lookup(PDFName.Font, PDFDict),
            XObject: Resources.lookup(PDFName.XObject, PDFDict),
            ExtGState: Resources.lookup(PDFName.ExtGState, PDFDict),
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
    dict.set(PDFName.Type, PDFName.Page);
    dict.set(PDFName.Parent, parent);
    dict.set(PDFName.Resources, context.obj({}));
    dict.set(PDFName.MediaBox, context.obj([0, 0, 612, 792]));
    return new PDFPageLeaf(dict, context, false);
};
PDFPageLeaf.fromMapWithContext = (map, context, autoNormalizeCTM = true) => new PDFPageLeaf(map, context, autoNormalizeCTM);
export default PDFPageLeaf;
//# sourceMappingURL=PDFPageLeaf.js.map