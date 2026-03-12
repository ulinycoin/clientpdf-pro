"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFCrossRefSection_1 = tslib_1.__importDefault(require("../document/PDFCrossRefSection"));
const PDFTrailer_1 = tslib_1.__importDefault(require("../document/PDFTrailer"));
const PDFTrailerDict_1 = tslib_1.__importDefault(require("../document/PDFTrailerDict"));
const PDFObjectStream_1 = tslib_1.__importDefault(require("../structures/PDFObjectStream"));
const CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
const utils_1 = require("../../utils");
const PDFStream_1 = tslib_1.__importDefault(require("../objects/PDFStream"));
class PDFWriter {
    constructor(context, objectsPerTick) {
        this.parsedObjects = 0;
        this.shouldWaitForTick = (n) => {
            this.parsedObjects += n;
            return this.parsedObjects % this.objectsPerTick === 0;
        };
        this.context = context;
        this.objectsPerTick = objectsPerTick;
    }
    serializeToBuffer() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { size, header, indirectObjects, xref, trailerDict, trailer } = yield this.computeBufferSize();
            let offset = 0;
            const buffer = new Uint8Array(size);
            offset += header.copyBytesInto(buffer, offset);
            buffer[offset++] = CharCodes_1.default.Newline;
            buffer[offset++] = CharCodes_1.default.Newline;
            for (let idx = 0, len = indirectObjects.length; idx < len; idx++) {
                const [ref, object] = indirectObjects[idx];
                const objectNumber = String(ref.objectNumber);
                offset += (0, utils_1.copyStringIntoBuffer)(objectNumber, buffer, offset);
                buffer[offset++] = CharCodes_1.default.Space;
                const generationNumber = String(ref.generationNumber);
                offset += (0, utils_1.copyStringIntoBuffer)(generationNumber, buffer, offset);
                buffer[offset++] = CharCodes_1.default.Space;
                buffer[offset++] = CharCodes_1.default.o;
                buffer[offset++] = CharCodes_1.default.b;
                buffer[offset++] = CharCodes_1.default.j;
                buffer[offset++] = CharCodes_1.default.Newline;
                offset += object.copyBytesInto(buffer, offset);
                buffer[offset++] = CharCodes_1.default.Newline;
                buffer[offset++] = CharCodes_1.default.e;
                buffer[offset++] = CharCodes_1.default.n;
                buffer[offset++] = CharCodes_1.default.d;
                buffer[offset++] = CharCodes_1.default.o;
                buffer[offset++] = CharCodes_1.default.b;
                buffer[offset++] = CharCodes_1.default.j;
                buffer[offset++] = CharCodes_1.default.Newline;
                buffer[offset++] = CharCodes_1.default.Newline;
                const n = object instanceof PDFObjectStream_1.default ? object.getObjectsCount() : 1;
                if (this.shouldWaitForTick(n))
                    yield (0, utils_1.waitForTick)();
            }
            if (xref) {
                offset += xref.copyBytesInto(buffer, offset);
                buffer[offset++] = CharCodes_1.default.Newline;
            }
            if (trailerDict) {
                offset += trailerDict.copyBytesInto(buffer, offset);
                buffer[offset++] = CharCodes_1.default.Newline;
                buffer[offset++] = CharCodes_1.default.Newline;
            }
            offset += trailer.copyBytesInto(buffer, offset);
            return buffer;
        });
    }
    computeIndirectObjectSize([ref, object]) {
        const refSize = ref.sizeInBytes() + 3; // 'R' -> 'obj\n'
        const objectSize = object.sizeInBytes() + 9; // '\nendobj\n\n'
        return refSize + objectSize;
    }
    createTrailerDict() {
        return this.context.obj({
            Size: this.context.largestObjectNumber + 1,
            Root: this.context.trailerInfo.Root,
            Encrypt: this.context.trailerInfo.Encrypt,
            Info: this.context.trailerInfo.Info,
            ID: this.context.trailerInfo.ID,
        });
    }
    computeBufferSize() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const header = this.context.header;
            let size = header.sizeInBytes() + 2;
            const xref = PDFCrossRefSection_1.default.create();
            const pdfSecurity = this.context.getSecurity();
            const indirectObjects = this.context.enumerateIndirectObjects();
            for (let idx = 0, len = indirectObjects.length; idx < len; idx++) {
                const indirectObject = indirectObjects[idx];
                const [ref, object] = indirectObject;
                xref.addEntry(ref, size);
                // Only encrypt item that is under PDFStream
                // Run the content through EncryptFn and update the content
                // before compute of object size to ensure correct buffer size
                if (pdfSecurity && object instanceof PDFStream_1.default) {
                    this.encrypt(ref, object, pdfSecurity);
                }
                size += this.computeIndirectObjectSize(indirectObject);
                if (this.shouldWaitForTick(1))
                    yield (0, utils_1.waitForTick)();
            }
            const xrefOffset = size;
            size += xref.sizeInBytes() + 1; // '\n'
            const trailerDict = PDFTrailerDict_1.default.of(this.createTrailerDict());
            size += trailerDict.sizeInBytes() + 2; // '\n\n'
            const trailer = PDFTrailer_1.default.forLastCrossRefSectionOffset(xrefOffset);
            size += trailer.sizeInBytes();
            return { size, header, indirectObjects, xref, trailerDict, trailer };
        });
    }
    encrypt(ref, object, pdfSecurity) {
        const encryptFn = pdfSecurity.getEncryptFn(ref.objectNumber, ref.generationNumber);
        let toBeEncrypt = object.getContents();
        if (encryptFn) {
            toBeEncrypt = new Uint8Array(encryptFn(toBeEncrypt));
            object.updateContent(toBeEncrypt);
        }
    }
}
PDFWriter.forContext = (context, objectsPerTick) => new PDFWriter(context, objectsPerTick);
exports.default = PDFWriter;
//# sourceMappingURL=PDFWriter.js.map