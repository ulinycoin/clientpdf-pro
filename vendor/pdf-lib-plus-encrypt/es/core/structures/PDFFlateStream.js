import pako from 'pako';
import { MethodNotImplementedError } from "../errors";
import PDFName from "../objects/PDFName";
import PDFStream from "../objects/PDFStream";
import { Cache } from "../../utils";
class PDFFlateStream extends PDFStream {
    constructor(dict, encode) {
        super(dict);
        this.computeContents = () => {
            const unencodedContents = this.getUnencodedContents();
            return this.encode ? pako.deflate(unencodedContents) : unencodedContents;
        };
        this.encode = encode;
        if (encode)
            dict.set(PDFName.of('Filter'), PDFName.of('FlateDecode'));
        this.contentsCache = Cache.populatedBy(this.computeContents);
    }
    getContents() {
        return this.contentsCache.access();
    }
    getContentsSize() {
        return this.contentsCache.access().length;
    }
    updateContent(encrypt) {
        this.contentsCache = Cache.populatedBy(() => encrypt);
        //   this.contentsCache = Cache.populatedBy(() =>
        //   this.encode ? pako.deflate(encrypt) : encrypt,
        // );
    }
    getUnencodedContents() {
        throw new MethodNotImplementedError(this.constructor.name, 'getUnencodedContents');
    }
}
export default PDFFlateStream;
//# sourceMappingURL=PDFFlateStream.js.map