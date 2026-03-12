"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFNull_1 = tslib_1.__importDefault(require("./PDFNull"));
const PDFObject_1 = tslib_1.__importDefault(require("./PDFObject"));
const CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
class PDFDict extends PDFObject_1.default {
    constructor(map, context) {
        super();
        this.dict = map;
        this.context = context;
    }
    keys() {
        return Array.from(this.dict.keys());
    }
    values() {
        return Array.from(this.dict.values());
    }
    entries() {
        return Array.from(this.dict.entries());
    }
    set(key, value) {
        this.dict.set(key, value);
    }
    get(key, 
    // TODO: `preservePDFNull` is for backwards compatibility. Should be
    // removed in next breaking API change.
    preservePDFNull = false) {
        const value = this.dict.get(key);
        if (value === PDFNull_1.default && !preservePDFNull)
            return undefined;
        return value;
    }
    has(key) {
        const value = this.dict.get(key);
        return value !== undefined && value !== PDFNull_1.default;
    }
    lookupMaybe(key, ...types) {
        // TODO: `preservePDFNull` is for backwards compatibility. Should be
        // removed in next breaking API change.
        const preservePDFNull = types.includes(PDFNull_1.default);
        const value = this.context.lookupMaybe(this.get(key, preservePDFNull), 
        // @ts-ignore
        ...types);
        if (value === PDFNull_1.default && !preservePDFNull)
            return undefined;
        return value;
    }
    lookup(key, ...types) {
        // TODO: `preservePDFNull` is for backwards compatibility. Should be
        // removed in next breaking API change.
        const preservePDFNull = types.includes(PDFNull_1.default);
        const value = this.context.lookup(this.get(key, preservePDFNull), 
        // @ts-ignore
        ...types);
        if (value === PDFNull_1.default && !preservePDFNull)
            return undefined;
        return value;
    }
    delete(key) {
        return this.dict.delete(key);
    }
    asMap() {
        return new Map(this.dict);
    }
    clone(context) {
        const clone = PDFDict.withContext(context || this.context);
        const entries = this.entries();
        for (let idx = 0, len = entries.length; idx < len; idx++) {
            const [key, value] = entries[idx];
            clone.set(key, value);
        }
        return clone;
    }
    toString() {
        let dictString = '<<\n';
        const entries = this.entries();
        for (let idx = 0, len = entries.length; idx < len; idx++) {
            const [key, value] = entries[idx];
            dictString += key.toString() + ' ' + value.toString() + '\n';
        }
        dictString += '>>';
        return dictString;
    }
    sizeInBytes() {
        let size = 5;
        const entries = this.entries();
        for (let idx = 0, len = entries.length; idx < len; idx++) {
            const [key, value] = entries[idx];
            size += key.sizeInBytes() + value.sizeInBytes() + 2;
        }
        return size;
    }
    copyBytesInto(buffer, offset) {
        const initialOffset = offset;
        buffer[offset++] = CharCodes_1.default.LessThan;
        buffer[offset++] = CharCodes_1.default.LessThan;
        buffer[offset++] = CharCodes_1.default.Newline;
        const entries = this.entries();
        for (let idx = 0, len = entries.length; idx < len; idx++) {
            const [key, value] = entries[idx];
            offset += key.copyBytesInto(buffer, offset);
            buffer[offset++] = CharCodes_1.default.Space;
            offset += value.copyBytesInto(buffer, offset);
            buffer[offset++] = CharCodes_1.default.Newline;
        }
        buffer[offset++] = CharCodes_1.default.GreaterThan;
        buffer[offset++] = CharCodes_1.default.GreaterThan;
        return offset - initialOffset;
    }
}
PDFDict.withContext = (context) => new PDFDict(new Map(), context);
PDFDict.fromMapWithContext = (map, context) => new PDFDict(map, context);
exports.default = PDFDict;
//# sourceMappingURL=PDFDict.js.map