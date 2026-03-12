import PDFName from "../objects/PDFName";
import PDFAcroField from "./PDFAcroField";
class PDFAcroNonTerminal extends PDFAcroField {
    addField(field) {
        const { Kids } = this.normalizedEntries();
        Kids === null || Kids === void 0 ? void 0 : Kids.push(field);
    }
    normalizedEntries() {
        let Kids = this.Kids();
        if (!Kids) {
            Kids = this.dict.context.obj([]);
            this.dict.set(PDFName.of('Kids'), Kids);
        }
        return { Kids };
    }
}
PDFAcroNonTerminal.fromDict = (dict, ref) => new PDFAcroNonTerminal(dict, ref);
PDFAcroNonTerminal.create = (context) => {
    const dict = context.obj({});
    const ref = context.register(dict);
    return new PDFAcroNonTerminal(dict, ref);
};
export default PDFAcroNonTerminal;
//# sourceMappingURL=PDFAcroNonTerminal.js.map