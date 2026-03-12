"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const errors_1 = require("../errors");
const PDFObject_1 = tslib_1.__importDefault(require("./PDFObject"));
const utils_1 = require("../../utils");
const ENFORCER = {};
const pool = new Map();
class PDFRef extends PDFObject_1.default {
    constructor(enforcer, objectNumber, generationNumber) {
        if (enforcer !== ENFORCER)
            throw new errors_1.PrivateConstructorError('PDFRef');
        super();
        this.objectNumber = objectNumber;
        this.generationNumber = generationNumber;
        this.tag = `${objectNumber} ${generationNumber} R`;
    }
    clone() {
        return this;
    }
    toString() {
        return this.tag;
    }
    sizeInBytes() {
        return this.tag.length;
    }
    copyBytesInto(buffer, offset) {
        offset += (0, utils_1.copyStringIntoBuffer)(this.tag, buffer, offset);
        return this.tag.length;
    }
}
PDFRef.of = (objectNumber, generationNumber = 0) => {
    const tag = `${objectNumber} ${generationNumber} R`;
    let instance = pool.get(tag);
    if (!instance) {
        instance = new PDFRef(ENFORCER, objectNumber, generationNumber);
        pool.set(tag, instance);
    }
    return instance;
};
exports.default = PDFRef;
//# sourceMappingURL=PDFRef.js.map