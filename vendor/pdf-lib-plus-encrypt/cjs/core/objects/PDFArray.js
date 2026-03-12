"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFNumber_1 = tslib_1.__importDefault(require("./PDFNumber"));
const PDFObject_1 = tslib_1.__importDefault(require("./PDFObject"));
const CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
const errors_1 = require("../errors");
class PDFArray extends PDFObject_1.default {
    constructor(context) {
        super();
        this.array = [];
        this.context = context;
    }
    size() {
        return this.array.length;
    }
    push(object) {
        this.array.push(object);
    }
    insert(index, object) {
        this.array.splice(index, 0, object);
    }
    indexOf(object) {
        const index = this.array.indexOf(object);
        return index === -1 ? undefined : index;
    }
    remove(index) {
        this.array.splice(index, 1);
    }
    set(idx, object) {
        this.array[idx] = object;
    }
    get(index) {
        return this.array[index];
    }
    lookupMaybe(index, ...types) {
        return this.context.lookupMaybe(this.get(index), 
        // @ts-ignore
        ...types);
    }
    lookup(index, ...types) {
        return this.context.lookup(this.get(index), 
        // @ts-ignore
        ...types);
    }
    asRectangle() {
        if (this.size() !== 4)
            throw new errors_1.PDFArrayIsNotRectangleError(this.size());
        const lowerLeftX = this.lookup(0, PDFNumber_1.default).asNumber();
        const lowerLeftY = this.lookup(1, PDFNumber_1.default).asNumber();
        const upperRightX = this.lookup(2, PDFNumber_1.default).asNumber();
        const upperRightY = this.lookup(3, PDFNumber_1.default).asNumber();
        const x = lowerLeftX;
        const y = lowerLeftY;
        const width = upperRightX - lowerLeftX;
        const height = upperRightY - lowerLeftY;
        return { x, y, width, height };
    }
    asArray() {
        return this.array.slice();
    }
    clone(context) {
        const clone = PDFArray.withContext(context || this.context);
        for (let idx = 0, len = this.size(); idx < len; idx++) {
            clone.push(this.array[idx]);
        }
        return clone;
    }
    toString() {
        let arrayString = '[ ';
        for (let idx = 0, len = this.size(); idx < len; idx++) {
            arrayString += this.get(idx).toString();
            arrayString += ' ';
        }
        arrayString += ']';
        return arrayString;
    }
    sizeInBytes() {
        let size = 3;
        for (let idx = 0, len = this.size(); idx < len; idx++) {
            size += this.get(idx).sizeInBytes() + 1;
        }
        return size;
    }
    copyBytesInto(buffer, offset) {
        const initialOffset = offset;
        buffer[offset++] = CharCodes_1.default.LeftSquareBracket;
        buffer[offset++] = CharCodes_1.default.Space;
        for (let idx = 0, len = this.size(); idx < len; idx++) {
            offset += this.get(idx).copyBytesInto(buffer, offset);
            buffer[offset++] = CharCodes_1.default.Space;
        }
        buffer[offset++] = CharCodes_1.default.RightSquareBracket;
        return offset - initialOffset;
    }
}
PDFArray.withContext = (context) => new PDFArray(context);
exports.default = PDFArray;
//# sourceMappingURL=PDFArray.js.map