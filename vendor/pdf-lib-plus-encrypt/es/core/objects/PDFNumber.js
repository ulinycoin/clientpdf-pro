import { copyStringIntoBuffer, numberToString } from "../../utils/index";
import PDFObject from "./PDFObject";
class PDFNumber extends PDFObject {
    constructor(value) {
        super();
        this.numberValue = value;
        this.stringValue = numberToString(value);
    }
    asNumber() {
        return this.numberValue;
    }
    /** @deprecated in favor of [[PDFNumber.asNumber]] */
    value() {
        return this.numberValue;
    }
    clone() {
        return PDFNumber.of(this.numberValue);
    }
    toString() {
        return this.stringValue;
    }
    sizeInBytes() {
        return this.stringValue.length;
    }
    copyBytesInto(buffer, offset) {
        offset += copyStringIntoBuffer(this.stringValue, buffer, offset);
        return this.stringValue.length;
    }
}
PDFNumber.of = (value) => new PDFNumber(value);
export default PDFNumber;
//# sourceMappingURL=PDFNumber.js.map