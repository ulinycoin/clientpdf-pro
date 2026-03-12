"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const errors_1 = require("../errors");
const PDFObject_1 = tslib_1.__importDefault(require("./PDFObject"));
const CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
const Irregular_1 = require("../syntax/Irregular");
const utils_1 = require("../../utils");
const decodeName = (name) => name.replace(/#([\dABCDEF]{2})/g, (_, hex) => (0, utils_1.charFromHexCode)(hex));
const isRegularChar = (charCode) => charCode >= CharCodes_1.default.ExclamationPoint &&
    charCode <= CharCodes_1.default.Tilde &&
    !Irregular_1.IsIrregular[charCode];
const ENFORCER = {};
const pool = new Map();
class PDFName extends PDFObject_1.default {
    constructor(enforcer, name) {
        if (enforcer !== ENFORCER)
            throw new errors_1.PrivateConstructorError('PDFName');
        super();
        let encodedName = '/';
        for (let idx = 0, len = name.length; idx < len; idx++) {
            const character = name[idx];
            const code = (0, utils_1.toCharCode)(character);
            encodedName += isRegularChar(code) ? character : `#${(0, utils_1.toHexString)(code)}`;
        }
        this.encodedName = encodedName;
    }
    asBytes() {
        const bytes = [];
        let hex = '';
        let escaped = false;
        const pushByte = (byte) => {
            if (byte !== undefined)
                bytes.push(byte);
            escaped = false;
        };
        for (let idx = 1, len = this.encodedName.length; idx < len; idx++) {
            const char = this.encodedName[idx];
            const byte = (0, utils_1.toCharCode)(char);
            const nextChar = this.encodedName[idx + 1];
            if (!escaped) {
                if (byte === CharCodes_1.default.Hash)
                    escaped = true;
                else
                    pushByte(byte);
            }
            else {
                if ((byte >= CharCodes_1.default.Zero && byte <= CharCodes_1.default.Nine) ||
                    (byte >= CharCodes_1.default.a && byte <= CharCodes_1.default.f) ||
                    (byte >= CharCodes_1.default.A && byte <= CharCodes_1.default.F)) {
                    hex += char;
                    if (hex.length === 2 ||
                        !((nextChar >= '0' && nextChar <= '9') ||
                            (nextChar >= 'a' && nextChar <= 'f') ||
                            (nextChar >= 'A' && nextChar <= 'F'))) {
                        pushByte(parseInt(hex, 16));
                        hex = '';
                    }
                }
                else {
                    pushByte(byte);
                }
            }
        }
        return new Uint8Array(bytes);
    }
    // TODO: This should probably use `utf8Decode()`
    // TODO: Polyfill Array.from?
    decodeText() {
        const bytes = this.asBytes();
        return String.fromCharCode(...Array.from(bytes));
    }
    asString() {
        return this.encodedName;
    }
    /** @deprecated in favor of [[PDFName.asString]] */
    value() {
        return this.encodedName;
    }
    clone() {
        return this;
    }
    toString() {
        return this.encodedName;
    }
    sizeInBytes() {
        return this.encodedName.length;
    }
    copyBytesInto(buffer, offset) {
        offset += (0, utils_1.copyStringIntoBuffer)(this.encodedName, buffer, offset);
        return this.encodedName.length;
    }
}
PDFName.of = (name) => {
    const decodedValue = decodeName(name);
    let instance = pool.get(decodedValue);
    if (!instance) {
        instance = new PDFName(ENFORCER, decodedValue);
        pool.set(decodedValue, instance);
    }
    return instance;
};
/* tslint:disable member-ordering */
PDFName.Length = PDFName.of('Length');
PDFName.FlateDecode = PDFName.of('FlateDecode');
PDFName.Resources = PDFName.of('Resources');
PDFName.Font = PDFName.of('Font');
PDFName.XObject = PDFName.of('XObject');
PDFName.ExtGState = PDFName.of('ExtGState');
PDFName.Contents = PDFName.of('Contents');
PDFName.Type = PDFName.of('Type');
PDFName.Parent = PDFName.of('Parent');
PDFName.MediaBox = PDFName.of('MediaBox');
PDFName.Page = PDFName.of('Page');
PDFName.Annots = PDFName.of('Annots');
PDFName.TrimBox = PDFName.of('TrimBox');
PDFName.ArtBox = PDFName.of('ArtBox');
PDFName.BleedBox = PDFName.of('BleedBox');
PDFName.CropBox = PDFName.of('CropBox');
PDFName.Rotate = PDFName.of('Rotate');
PDFName.Title = PDFName.of('Title');
PDFName.Author = PDFName.of('Author');
PDFName.Subject = PDFName.of('Subject');
PDFName.Creator = PDFName.of('Creator');
PDFName.Keywords = PDFName.of('Keywords');
PDFName.Producer = PDFName.of('Producer');
PDFName.CreationDate = PDFName.of('CreationDate');
PDFName.ModDate = PDFName.of('ModDate');
exports.default = PDFName;
//# sourceMappingURL=PDFName.js.map