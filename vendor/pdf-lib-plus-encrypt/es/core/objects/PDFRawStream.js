import PDFStream from "./PDFStream";
import { arrayAsString } from "../../utils";
class PDFRawStream extends PDFStream {
    constructor(dict, contents) {
        super(dict);
        this.contents = contents;
    }
    asUint8Array() {
        return this.contents.slice();
    }
    clone(context) {
        return PDFRawStream.of(this.dict.clone(context), this.contents.slice());
    }
    getContentsString() {
        return arrayAsString(this.contents);
    }
    updateContent(encrypt) {
        this.contents = encrypt;
    }
    getContents() {
        return this.contents;
    }
    getContentsSize() {
        return this.contents.length;
    }
}
PDFRawStream.of = (dict, contents) => new PDFRawStream(dict, contents);
export default PDFRawStream;
//# sourceMappingURL=PDFRawStream.js.map