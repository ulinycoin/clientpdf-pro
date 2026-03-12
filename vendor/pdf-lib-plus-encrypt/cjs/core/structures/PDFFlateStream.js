"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const pako_1 = tslib_1.__importDefault(require("pako"));
const errors_1 = require("../errors");
const PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
const PDFStream_1 = tslib_1.__importDefault(require("../objects/PDFStream"));
const utils_1 = require("../../utils");
class PDFFlateStream extends PDFStream_1.default {
    constructor(dict, encode) {
        super(dict);
        this.computeContents = () => {
            const unencodedContents = this.getUnencodedContents();
            return this.encode ? pako_1.default.deflate(unencodedContents) : unencodedContents;
        };
        this.encode = encode;
        if (encode)
            dict.set(PDFName_1.default.of('Filter'), PDFName_1.default.of('FlateDecode'));
        this.contentsCache = utils_1.Cache.populatedBy(this.computeContents);
    }
    getContents() {
        return this.contentsCache.access();
    }
    getContentsSize() {
        return this.contentsCache.access().length;
    }
    updateContent(encrypt) {
        this.contentsCache = utils_1.Cache.populatedBy(() => encrypt);
        //   this.contentsCache = Cache.populatedBy(() =>
        //   this.encode ? pako.deflate(encrypt) : encrypt,
        // );
    }
    getUnencodedContents() {
        throw new errors_1.MethodNotImplementedError(this.constructor.name, 'getUnencodedContents');
    }
}
exports.default = PDFFlateStream;
//# sourceMappingURL=PDFFlateStream.js.map