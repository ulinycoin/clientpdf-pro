import PDFAcroChoice from "./PDFAcroChoice";
class PDFAcroListBox extends PDFAcroChoice {
}
PDFAcroListBox.fromDict = (dict, ref) => new PDFAcroListBox(dict, ref);
PDFAcroListBox.create = (context) => {
    const dict = context.obj({
        FT: 'Ch',
        Kids: [],
    });
    const ref = context.register(dict);
    return new PDFAcroListBox(dict, ref);
};
export default PDFAcroListBox;
//# sourceMappingURL=PDFAcroListBox.js.map