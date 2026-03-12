"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFTrailer_1 = tslib_1.__importDefault(require("../document/PDFTrailer"));
const PDFInvalidObject_1 = tslib_1.__importDefault(require("../objects/PDFInvalidObject"));
const PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
const PDFNumber_1 = tslib_1.__importDefault(require("../objects/PDFNumber"));
const PDFRef_1 = tslib_1.__importDefault(require("../objects/PDFRef"));
const PDFStream_1 = tslib_1.__importDefault(require("../objects/PDFStream"));
const PDFCrossRefStream_1 = tslib_1.__importDefault(require("../structures/PDFCrossRefStream"));
const PDFObjectStream_1 = tslib_1.__importDefault(require("../structures/PDFObjectStream"));
const PDFWriter_1 = tslib_1.__importDefault(require("./PDFWriter"));
const utils_1 = require("../../utils");
class PDFStreamWriter extends PDFWriter_1.default {
    constructor(context, objectsPerTick, encodeStreams, objectsPerStream) {
        super(context, objectsPerTick);
        this.encodeStreams = encodeStreams;
        this.objectsPerStream = objectsPerStream;
    }
    computeBufferSize() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let objectNumber = this.context.largestObjectNumber + 1;
            const header = this.context.header;
            let size = header.sizeInBytes() + 2;
            const xrefStream = PDFCrossRefStream_1.default.create(this.createTrailerDict(), this.encodeStreams);
            const uncompressedObjects = [];
            const compressedObjects = [];
            const objectStreamRefs = [];
            const pdfSecurity = this.context.getSecurity();
            const indirectObjects = this.context.enumerateIndirectObjects();
            for (let idx = 0, len = indirectObjects.length; idx < len; idx++) {
                const indirectObject = indirectObjects[idx];
                const [ref, object] = indirectObject;
                const shouldNotCompress = ref === this.context.trailerInfo.Encrypt ||
                    object instanceof PDFStream_1.default ||
                    object instanceof PDFInvalidObject_1.default ||
                    ref.generationNumber !== 0;
                if (shouldNotCompress) {
                    uncompressedObjects.push(indirectObject);
                    if (pdfSecurity && object instanceof PDFStream_1.default) {
                        this.encrypt(ref, object, pdfSecurity);
                    }
                    xrefStream.addUncompressedEntry(ref, size);
                    size += this.computeIndirectObjectSize(indirectObject);
                    if (this.shouldWaitForTick(1))
                        yield (0, utils_1.waitForTick)();
                }
                else {
                    let chunk = (0, utils_1.last)(compressedObjects);
                    let objectStreamRef = (0, utils_1.last)(objectStreamRefs);
                    if (!chunk || chunk.length % this.objectsPerStream === 0) {
                        chunk = [];
                        compressedObjects.push(chunk);
                        objectStreamRef = PDFRef_1.default.of(objectNumber++);
                        objectStreamRefs.push(objectStreamRef);
                    }
                    xrefStream.addCompressedEntry(ref, objectStreamRef, chunk.length);
                    chunk.push(indirectObject);
                }
            }
            for (let idx = 0, len = compressedObjects.length; idx < len; idx++) {
                const chunk = compressedObjects[idx];
                const ref = objectStreamRefs[idx];
                const objectStream = PDFObjectStream_1.default.withContextAndObjects(this.context, chunk, this.encodeStreams);
                // Encrypt
                if (pdfSecurity)
                    this.encrypt(ref, objectStream, pdfSecurity);
                xrefStream.addUncompressedEntry(ref, size);
                size += this.computeIndirectObjectSize([ref, objectStream]);
                uncompressedObjects.push([ref, objectStream]);
                if (this.shouldWaitForTick(chunk.length))
                    yield (0, utils_1.waitForTick)();
            }
            const xrefStreamRef = PDFRef_1.default.of(objectNumber++);
            xrefStream.dict.set(PDFName_1.default.of('Size'), PDFNumber_1.default.of(objectNumber));
            xrefStream.addUncompressedEntry(xrefStreamRef, size);
            const xrefOffset = size;
            size += this.computeIndirectObjectSize([xrefStreamRef, xrefStream]);
            uncompressedObjects.push([xrefStreamRef, xrefStream]);
            const trailer = PDFTrailer_1.default.forLastCrossRefSectionOffset(xrefOffset);
            size += trailer.sizeInBytes();
            return { size, header, indirectObjects: uncompressedObjects, trailer };
        });
    }
}
PDFStreamWriter.forContext = (context, objectsPerTick, encodeStreams = true, objectsPerStream = 50) => new PDFStreamWriter(context, objectsPerTick, encodeStreams, objectsPerStream);
exports.default = PDFStreamWriter;
//# sourceMappingURL=PDFStreamWriter.js.map