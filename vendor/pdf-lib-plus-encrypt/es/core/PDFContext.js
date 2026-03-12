import pako from 'pako';
import PDFHeader from "./document/PDFHeader";
import { UnexpectedObjectTypeError } from "./errors";
import PDFArray from "./objects/PDFArray";
import PDFBool from "./objects/PDFBool";
import PDFDict from "./objects/PDFDict";
import PDFHexString from "./objects/PDFHexString";
import PDFName from "./objects/PDFName";
import PDFNull from "./objects/PDFNull";
import PDFNumber from "./objects/PDFNumber";
import PDFObject from "./objects/PDFObject";
import PDFRawStream from "./objects/PDFRawStream";
import PDFRef from "./objects/PDFRef";
import PDFOperator from "./operators/PDFOperator";
import Ops from "./operators/PDFOperatorNames";
import PDFContentStream from "./structures/PDFContentStream";
import { assertSecurity, typedArrayFor, Uint8ArrToHex } from "../utils";
const byAscendingObjectNumber = ([a], [b]) => a.objectNumber - b.objectNumber;
class PDFContext {
    constructor() {
        this.largestObjectNumber = 0;
        this.header = PDFHeader.forVersion(1, 7);
        this.trailerInfo = {};
        this.indirectObjects = new Map();
    }
    getSecurity() {
        return this._security;
    }
    setSecurity(pdfSecurity) {
        assertSecurity(pdfSecurity, 'PDFSecurity Instance');
        this._security = pdfSecurity;
    }
    assign(ref, object) {
        this.indirectObjects.set(ref, object);
        if (ref.objectNumber > this.largestObjectNumber) {
            this.largestObjectNumber = ref.objectNumber;
        }
    }
    nextRef() {
        this.largestObjectNumber += 1;
        return PDFRef.of(this.largestObjectNumber);
    }
    register(object) {
        const ref = this.nextRef();
        this.assign(ref, object);
        return ref;
    }
    delete(ref) {
        return this.indirectObjects.delete(ref);
    }
    lookupMaybe(ref, ...types) {
        // TODO: `preservePDFNull` is for backwards compatibility. Should be
        // removed in next breaking API change.
        const preservePDFNull = types.includes(PDFNull);
        const result = ref instanceof PDFRef ? this.indirectObjects.get(ref) : ref;
        if (!result || (result === PDFNull && !preservePDFNull))
            return undefined;
        for (let idx = 0, len = types.length; idx < len; idx++) {
            const type = types[idx];
            if (type === PDFNull) {
                if (result === PDFNull)
                    return result;
            }
            else {
                if (result instanceof type)
                    return result;
            }
        }
        throw new UnexpectedObjectTypeError(types, result);
    }
    lookup(ref, ...types) {
        const result = ref instanceof PDFRef ? this.indirectObjects.get(ref) : ref;
        if (types.length === 0)
            return result;
        for (let idx = 0, len = types.length; idx < len; idx++) {
            const type = types[idx];
            if (type === PDFNull) {
                if (result === PDFNull)
                    return result;
            }
            else {
                if (result instanceof type)
                    return result;
            }
        }
        throw new UnexpectedObjectTypeError(types, result);
    }
    getObjectRef(pdfObject) {
        const entries = Array.from(this.indirectObjects.entries());
        for (let idx = 0, len = entries.length; idx < len; idx++) {
            const [ref, object] = entries[idx];
            if (object === pdfObject) {
                return ref;
            }
        }
        return undefined;
    }
    enumerateIndirectObjects() {
        return Array.from(this.indirectObjects.entries()).sort(byAscendingObjectNumber);
    }
    obj(literal) {
        if (literal instanceof PDFObject) {
            return literal;
        }
        else if (literal === null || literal === undefined) {
            return PDFNull;
        }
        else if (typeof literal === 'string') {
            return PDFName.of(literal);
        }
        else if (typeof literal === 'number') {
            return PDFNumber.of(literal);
        }
        else if (typeof literal === 'boolean') {
            return literal ? PDFBool.True : PDFBool.False;
        }
        else if (literal instanceof Uint8Array) {
            // Convert ID/U/O field of Security to Hex String
            return PDFHexString.of(Uint8ArrToHex(literal));
        }
        else if (Array.isArray(literal)) {
            const array = PDFArray.withContext(this);
            for (let idx = 0, len = literal.length; idx < len; idx++) {
                array.push(this.obj(literal[idx]));
            }
            return array;
        }
        else {
            const dict = PDFDict.withContext(this);
            const keys = Object.keys(literal);
            for (let idx = 0, len = keys.length; idx < len; idx++) {
                const key = keys[idx];
                const value = literal[key];
                if (value !== undefined)
                    dict.set(PDFName.of(key), this.obj(value));
            }
            return dict;
        }
    }
    stream(contents, dict = {}) {
        return PDFRawStream.of(this.obj(dict), typedArrayFor(contents));
    }
    flateStream(contents, dict = {}) {
        return this.stream(pako.deflate(typedArrayFor(contents)), Object.assign(Object.assign({}, dict), { Filter: 'FlateDecode' }));
    }
    contentStream(operators, dict = {}) {
        return PDFContentStream.of(this.obj(dict), operators);
    }
    formXObject(operators, dict = {}) {
        return this.contentStream(operators, Object.assign(Object.assign({ BBox: this.obj([0, 0, 0, 0]), Matrix: this.obj([1, 0, 0, 1, 0, 0]) }, dict), { Type: 'XObject', Subtype: 'Form' }));
    }
    /*
     * Reference to PDFContentStream that contains a single PDFOperator: `q`.
     * Used by [[PDFPageLeaf]] instances to ensure that when content streams are
     * added to a modified PDF, they start in the default, unchanged graphics
     * state.
     */
    getPushGraphicsStateContentStream() {
        if (this.pushGraphicsStateContentStreamRef) {
            return this.pushGraphicsStateContentStreamRef;
        }
        const dict = this.obj({});
        const op = PDFOperator.of(Ops.PushGraphicsState);
        const stream = PDFContentStream.of(dict, [op]);
        this.pushGraphicsStateContentStreamRef = this.register(stream);
        return this.pushGraphicsStateContentStreamRef;
    }
    /*
     * Reference to PDFContentStream that contains a single PDFOperator: `Q`.
     * Used by [[PDFPageLeaf]] instances to ensure that when content streams are
     * added to a modified PDF, they start in the default, unchanged graphics
     * state.
     */
    getPopGraphicsStateContentStream() {
        if (this.popGraphicsStateContentStreamRef) {
            return this.popGraphicsStateContentStreamRef;
        }
        const dict = this.obj({});
        const op = PDFOperator.of(Ops.PopGraphicsState);
        const stream = PDFContentStream.of(dict, [op]);
        this.popGraphicsStateContentStreamRef = this.register(stream);
        return this.popGraphicsStateContentStreamRef;
    }
}
PDFContext.create = () => new PDFContext();
export default PDFContext;
//# sourceMappingURL=PDFContext.js.map