import PDFDict from "./PDFDict";
import PDFStream from "./PDFStream";
import PDFContext from "../PDFContext";
declare class PDFRawStream extends PDFStream {
    static of: (dict: PDFDict, contents: Uint8Array) => PDFRawStream;
    contents: Uint8Array;
    private constructor();
    asUint8Array(): Uint8Array;
    clone(context?: PDFContext): PDFRawStream;
    getContentsString(): string;
    updateContent(encrypt: Uint8Array): void;
    getContents(): Uint8Array;
    getContentsSize(): number;
}
export default PDFRawStream;
//# sourceMappingURL=PDFRawStream.d.ts.map