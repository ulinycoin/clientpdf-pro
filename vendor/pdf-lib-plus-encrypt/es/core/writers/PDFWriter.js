import { __awaiter } from "tslib";
import PDFCrossRefSection from "../document/PDFCrossRefSection";
import PDFTrailer from "../document/PDFTrailer";
import PDFTrailerDict from "../document/PDFTrailerDict";
import PDFObjectStream from "../structures/PDFObjectStream";
import CharCodes from "../syntax/CharCodes";
import { copyStringIntoBuffer, waitForTick } from "../../utils";
import PDFStream from '../objects/PDFStream';
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
        return __awaiter(this, void 0, void 0, function* () {
            const { size, header, indirectObjects, xref, trailerDict, trailer } = yield this.computeBufferSize();
            let offset = 0;
            const buffer = new Uint8Array(size);
            offset += header.copyBytesInto(buffer, offset);
            buffer[offset++] = CharCodes.Newline;
            buffer[offset++] = CharCodes.Newline;
            for (let idx = 0, len = indirectObjects.length; idx < len; idx++) {
                const [ref, object] = indirectObjects[idx];
                const objectNumber = String(ref.objectNumber);
                offset += copyStringIntoBuffer(objectNumber, buffer, offset);
                buffer[offset++] = CharCodes.Space;
                const generationNumber = String(ref.generationNumber);
                offset += copyStringIntoBuffer(generationNumber, buffer, offset);
                buffer[offset++] = CharCodes.Space;
                buffer[offset++] = CharCodes.o;
                buffer[offset++] = CharCodes.b;
                buffer[offset++] = CharCodes.j;
                buffer[offset++] = CharCodes.Newline;
                offset += object.copyBytesInto(buffer, offset);
                buffer[offset++] = CharCodes.Newline;
                buffer[offset++] = CharCodes.e;
                buffer[offset++] = CharCodes.n;
                buffer[offset++] = CharCodes.d;
                buffer[offset++] = CharCodes.o;
                buffer[offset++] = CharCodes.b;
                buffer[offset++] = CharCodes.j;
                buffer[offset++] = CharCodes.Newline;
                buffer[offset++] = CharCodes.Newline;
                const n = object instanceof PDFObjectStream ? object.getObjectsCount() : 1;
                if (this.shouldWaitForTick(n))
                    yield waitForTick();
            }
            if (xref) {
                offset += xref.copyBytesInto(buffer, offset);
                buffer[offset++] = CharCodes.Newline;
            }
            if (trailerDict) {
                offset += trailerDict.copyBytesInto(buffer, offset);
                buffer[offset++] = CharCodes.Newline;
                buffer[offset++] = CharCodes.Newline;
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
        return __awaiter(this, void 0, void 0, function* () {
            const header = this.context.header;
            let size = header.sizeInBytes() + 2;
            const xref = PDFCrossRefSection.create();
            const pdfSecurity = this.context.getSecurity();
            const indirectObjects = this.context.enumerateIndirectObjects();
            for (let idx = 0, len = indirectObjects.length; idx < len; idx++) {
                const indirectObject = indirectObjects[idx];
                const [ref, object] = indirectObject;
                xref.addEntry(ref, size);
                // Only encrypt item that is under PDFStream
                // Run the content through EncryptFn and update the content
                // before compute of object size to ensure correct buffer size
                if (pdfSecurity && object instanceof PDFStream) {
                    this.encrypt(ref, object, pdfSecurity);
                }
                size += this.computeIndirectObjectSize(indirectObject);
                if (this.shouldWaitForTick(1))
                    yield waitForTick();
            }
            const xrefOffset = size;
            size += xref.sizeInBytes() + 1; // '\n'
            const trailerDict = PDFTrailerDict.of(this.createTrailerDict());
            size += trailerDict.sizeInBytes() + 2; // '\n\n'
            const trailer = PDFTrailer.forLastCrossRefSectionOffset(xrefOffset);
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
export default PDFWriter;
//# sourceMappingURL=PDFWriter.js.map