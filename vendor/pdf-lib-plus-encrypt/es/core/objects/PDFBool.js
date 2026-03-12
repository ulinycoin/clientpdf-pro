import { PrivateConstructorError } from "../errors";
import PDFObject from "./PDFObject";
import CharCodes from "../syntax/CharCodes";
const ENFORCER = {};
class PDFBool extends PDFObject {
    constructor(enforcer, value) {
        if (enforcer !== ENFORCER)
            throw new PrivateConstructorError('PDFBool');
        super();
        this.value = value;
    }
    asBoolean() {
        return this.value;
    }
    clone() {
        return this;
    }
    toString() {
        return String(this.value);
    }
    sizeInBytes() {
        return this.value ? 4 : 5;
    }
    copyBytesInto(buffer, offset) {
        if (this.value) {
            buffer[offset++] = CharCodes.t;
            buffer[offset++] = CharCodes.r;
            buffer[offset++] = CharCodes.u;
            buffer[offset++] = CharCodes.e;
            return 4;
        }
        else {
            buffer[offset++] = CharCodes.f;
            buffer[offset++] = CharCodes.a;
            buffer[offset++] = CharCodes.l;
            buffer[offset++] = CharCodes.s;
            buffer[offset++] = CharCodes.e;
            return 5;
        }
    }
}
PDFBool.True = new PDFBool(ENFORCER, true);
PDFBool.False = new PDFBool(ENFORCER, false);
export default PDFBool;
//# sourceMappingURL=PDFBool.js.map