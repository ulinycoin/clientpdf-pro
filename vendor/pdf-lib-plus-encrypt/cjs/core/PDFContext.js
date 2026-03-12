"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const pako_1 = tslib_1.__importDefault(require("pako"));
const PDFHeader_1 = tslib_1.__importDefault(require("./document/PDFHeader"));
const errors_1 = require("./errors");
const PDFArray_1 = tslib_1.__importDefault(require("./objects/PDFArray"));
const PDFBool_1 = tslib_1.__importDefault(require("./objects/PDFBool"));
const PDFDict_1 = tslib_1.__importDefault(require("./objects/PDFDict"));
const PDFHexString_1 = tslib_1.__importDefault(require("./objects/PDFHexString"));
const PDFName_1 = tslib_1.__importDefault(require("./objects/PDFName"));
const PDFNull_1 = tslib_1.__importDefault(require("./objects/PDFNull"));
const PDFNumber_1 = tslib_1.__importDefault(require("./objects/PDFNumber"));
const PDFObject_1 = tslib_1.__importDefault(require("./objects/PDFObject"));
const PDFRawStream_1 = tslib_1.__importDefault(require("./objects/PDFRawStream"));
const PDFRef_1 = tslib_1.__importDefault(require("./objects/PDFRef"));
const PDFOperator_1 = tslib_1.__importDefault(require("./operators/PDFOperator"));
const PDFOperatorNames_1 = tslib_1.__importDefault(require("./operators/PDFOperatorNames"));
const PDFContentStream_1 = tslib_1.__importDefault(require("./structures/PDFContentStream"));
const utils_1 = require("../utils");
const byAscendingObjectNumber = ([a], [b]) => a.objectNumber - b.objectNumber;
class PDFContext {
    constructor() {
        this.largestObjectNumber = 0;
        this.header = PDFHeader_1.default.forVersion(1, 7);
        this.trailerInfo = {};
        this.indirectObjects = new Map();
    }
    getSecurity() {
        return this._security;
    }
    setSecurity(pdfSecurity) {
        (0, utils_1.assertSecurity)(pdfSecurity, 'PDFSecurity Instance');
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
        return PDFRef_1.default.of(this.largestObjectNumber);
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
        const preservePDFNull = types.includes(PDFNull_1.default);
        const result = ref instanceof PDFRef_1.default ? this.indirectObjects.get(ref) : ref;
        if (!result || (result === PDFNull_1.default && !preservePDFNull))
            return undefined;
        for (let idx = 0, len = types.length; idx < len; idx++) {
            const type = types[idx];
            if (type === PDFNull_1.default) {
                if (result === PDFNull_1.default)
                    return result;
            }
            else {
                if (result instanceof type)
                    return result;
            }
        }
        throw new errors_1.UnexpectedObjectTypeError(types, result);
    }
    lookup(ref, ...types) {
        const result = ref instanceof PDFRef_1.default ? this.indirectObjects.get(ref) : ref;
        if (types.length === 0)
            return result;
        for (let idx = 0, len = types.length; idx < len; idx++) {
            const type = types[idx];
            if (type === PDFNull_1.default) {
                if (result === PDFNull_1.default)
                    return result;
            }
            else {
                if (result instanceof type)
                    return result;
            }
        }
        throw new errors_1.UnexpectedObjectTypeError(types, result);
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
        if (literal instanceof PDFObject_1.default) {
            return literal;
        }
        else if (literal === null || literal === undefined) {
            return PDFNull_1.default;
        }
        else if (typeof literal === 'string') {
            return PDFName_1.default.of(literal);
        }
        else if (typeof literal === 'number') {
            return PDFNumber_1.default.of(literal);
        }
        else if (typeof literal === 'boolean') {
            return literal ? PDFBool_1.default.True : PDFBool_1.default.False;
        }
        else if (literal instanceof Uint8Array) {
            // Convert ID/U/O field of Security to Hex String
            return PDFHexString_1.default.of((0, utils_1.Uint8ArrToHex)(literal));
        }
        else if (Array.isArray(literal)) {
            const array = PDFArray_1.default.withContext(this);
            for (let idx = 0, len = literal.length; idx < len; idx++) {
                array.push(this.obj(literal[idx]));
            }
            return array;
        }
        else {
            const dict = PDFDict_1.default.withContext(this);
            const keys = Object.keys(literal);
            for (let idx = 0, len = keys.length; idx < len; idx++) {
                const key = keys[idx];
                const value = literal[key];
                if (value !== undefined)
                    dict.set(PDFName_1.default.of(key), this.obj(value));
            }
            return dict;
        }
    }
    stream(contents, dict = {}) {
        return PDFRawStream_1.default.of(this.obj(dict), (0, utils_1.typedArrayFor)(contents));
    }
    flateStream(contents, dict = {}) {
        return this.stream(pako_1.default.deflate((0, utils_1.typedArrayFor)(contents)), Object.assign(Object.assign({}, dict), { Filter: 'FlateDecode' }));
    }
    contentStream(operators, dict = {}) {
        return PDFContentStream_1.default.of(this.obj(dict), operators);
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
        const op = PDFOperator_1.default.of(PDFOperatorNames_1.default.PushGraphicsState);
        const stream = PDFContentStream_1.default.of(dict, [op]);
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
        const op = PDFOperator_1.default.of(PDFOperatorNames_1.default.PopGraphicsState);
        const stream = PDFContentStream_1.default.of(dict, [op]);
        this.popGraphicsStateContentStreamRef = this.register(stream);
        return this.popGraphicsStateContentStreamRef;
    }
}
PDFContext.create = () => new PDFContext();
exports.default = PDFContext;
//# sourceMappingURL=PDFContext.js.map