import { __awaiter } from "tslib";
import PDFCrossRefSection from "../document/PDFCrossRefSection";
import PDFHeader from "../document/PDFHeader";
import PDFTrailer from "../document/PDFTrailer";
import { MissingKeywordError, MissingPDFHeaderError, PDFInvalidObjectParsingError, ReparseError, StalledParserError, } from "../errors";
import PDFDict from "../objects/PDFDict";
import PDFInvalidObject from "../objects/PDFInvalidObject";
import PDFName from "../objects/PDFName";
import PDFRawStream from "../objects/PDFRawStream";
import PDFRef from "../objects/PDFRef";
import ByteStream from "./ByteStream";
import PDFObjectParser from "./PDFObjectParser";
import PDFObjectStreamParser from "./PDFObjectStreamParser";
import PDFXRefStreamParser from "./PDFXRefStreamParser";
import PDFContext from "../PDFContext";
import CharCodes from "../syntax/CharCodes";
import { Keywords } from "../syntax/Keywords";
import { IsDigit } from "../syntax/Numeric";
import { waitForTick } from "../../utils";
class PDFParser extends PDFObjectParser {
    constructor(pdfBytes, objectsPerTick = Infinity, throwOnInvalidObject = false, capNumbers = false) {
        super(ByteStream.of(pdfBytes), PDFContext.create(), capNumbers);
        this.alreadyParsed = false;
        this.parsedObjects = 0;
        this.shouldWaitForTick = () => {
            this.parsedObjects += 1;
            return this.parsedObjects % this.objectsPerTick === 0;
        };
        this.objectsPerTick = objectsPerTick;
        this.throwOnInvalidObject = throwOnInvalidObject;
    }
    parseDocument() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.alreadyParsed) {
                throw new ReparseError('PDFParser', 'parseDocument');
            }
            this.alreadyParsed = true;
            this.context.header = this.parseHeader();
            let prevOffset;
            while (!this.bytes.done()) {
                yield this.parseDocumentSection();
                const offset = this.bytes.offset();
                if (offset === prevOffset) {
                    throw new StalledParserError(this.bytes.position());
                }
                prevOffset = offset;
            }
            this.maybeRecoverRoot();
            if (this.context.lookup(PDFRef.of(0))) {
                console.warn('Removing parsed object: 0 0 R');
                this.context.delete(PDFRef.of(0));
            }
            return this.context;
        });
    }
    maybeRecoverRoot() {
        const isValidCatalog = (obj) => obj instanceof PDFDict &&
            obj.lookup(PDFName.of('Type')) === PDFName.of('Catalog');
        const catalog = this.context.lookup(this.context.trailerInfo.Root);
        if (!isValidCatalog(catalog)) {
            const indirectObjects = this.context.enumerateIndirectObjects();
            for (let idx = 0, len = indirectObjects.length; idx < len; idx++) {
                const [ref, object] = indirectObjects[idx];
                if (isValidCatalog(object)) {
                    this.context.trailerInfo.Root = ref;
                }
            }
        }
    }
    parseHeader() {
        while (!this.bytes.done()) {
            if (this.matchKeyword(Keywords.header)) {
                const major = this.parseRawInt();
                this.bytes.assertNext(CharCodes.Period);
                const minor = this.parseRawInt();
                const header = PDFHeader.forVersion(major, minor);
                this.skipBinaryHeaderComment();
                return header;
            }
            this.bytes.next();
        }
        throw new MissingPDFHeaderError(this.bytes.position());
    }
    parseIndirectObjectHeader() {
        this.skipWhitespaceAndComments();
        const objectNumber = this.parseRawInt();
        this.skipWhitespaceAndComments();
        const generationNumber = this.parseRawInt();
        this.skipWhitespaceAndComments();
        if (!this.matchKeyword(Keywords.obj)) {
            throw new MissingKeywordError(this.bytes.position(), Keywords.obj);
        }
        return PDFRef.of(objectNumber, generationNumber);
    }
    matchIndirectObjectHeader() {
        const initialOffset = this.bytes.offset();
        try {
            this.parseIndirectObjectHeader();
            return true;
        }
        catch (e) {
            this.bytes.moveTo(initialOffset);
            return false;
        }
    }
    parseIndirectObject() {
        return __awaiter(this, void 0, void 0, function* () {
            const ref = this.parseIndirectObjectHeader();
            this.skipWhitespaceAndComments();
            const object = this.parseObject();
            this.skipWhitespaceAndComments();
            // if (!this.matchKeyword(Keywords.endobj)) {
            // throw new MissingKeywordError(this.bytes.position(), Keywords.endobj);
            // }
            // TODO: Log a warning if this fails...
            this.matchKeyword(Keywords.endobj);
            if (object instanceof PDFRawStream &&
                object.dict.lookup(PDFName.of('Type')) === PDFName.of('ObjStm')) {
                yield PDFObjectStreamParser.forStream(object, this.shouldWaitForTick).parseIntoContext();
            }
            else if (object instanceof PDFRawStream &&
                object.dict.lookup(PDFName.of('Type')) === PDFName.of('XRef')) {
                PDFXRefStreamParser.forStream(object).parseIntoContext();
            }
            else {
                this.context.assign(ref, object);
            }
            return ref;
        });
    }
    // TODO: Improve and clean this up
    tryToParseInvalidIndirectObject() {
        const startPos = this.bytes.position();
        const msg = `Trying to parse invalid object: ${JSON.stringify(startPos)})`;
        if (this.throwOnInvalidObject)
            throw new Error(msg);
        console.warn(msg);
        const ref = this.parseIndirectObjectHeader();
        console.warn(`Invalid object ref: ${ref}`);
        this.skipWhitespaceAndComments();
        const start = this.bytes.offset();
        let failed = true;
        while (!this.bytes.done()) {
            if (this.matchKeyword(Keywords.endobj)) {
                failed = false;
            }
            if (!failed)
                break;
            this.bytes.next();
        }
        if (failed)
            throw new PDFInvalidObjectParsingError(startPos);
        const end = this.bytes.offset() - Keywords.endobj.length;
        const object = PDFInvalidObject.of(this.bytes.slice(start, end));
        this.context.assign(ref, object);
        return ref;
    }
    parseIndirectObjects() {
        return __awaiter(this, void 0, void 0, function* () {
            this.skipWhitespaceAndComments();
            while (!this.bytes.done() && IsDigit[this.bytes.peek()]) {
                const initialOffset = this.bytes.offset();
                try {
                    yield this.parseIndirectObject();
                }
                catch (e) {
                    // TODO: Add tracing/logging mechanism to track when this happens!
                    this.bytes.moveTo(initialOffset);
                    this.tryToParseInvalidIndirectObject();
                }
                this.skipWhitespaceAndComments();
                // TODO: Can this be done only when needed, to avoid harming performance?
                this.skipJibberish();
                if (this.shouldWaitForTick())
                    yield waitForTick();
            }
        });
    }
    maybeParseCrossRefSection() {
        this.skipWhitespaceAndComments();
        if (!this.matchKeyword(Keywords.xref))
            return;
        this.skipWhitespaceAndComments();
        let objectNumber = -1;
        const xref = PDFCrossRefSection.createEmpty();
        while (!this.bytes.done() && IsDigit[this.bytes.peek()]) {
            const firstInt = this.parseRawInt();
            this.skipWhitespaceAndComments();
            const secondInt = this.parseRawInt();
            this.skipWhitespaceAndComments();
            const byte = this.bytes.peek();
            if (byte === CharCodes.n || byte === CharCodes.f) {
                const ref = PDFRef.of(objectNumber, secondInt);
                if (this.bytes.next() === CharCodes.n) {
                    xref.addEntry(ref, firstInt);
                }
                else {
                    // this.context.delete(ref);
                    xref.addDeletedEntry(ref, firstInt);
                }
                objectNumber += 1;
            }
            else {
                objectNumber = firstInt;
            }
            this.skipWhitespaceAndComments();
        }
        return xref;
    }
    maybeParseTrailerDict() {
        this.skipWhitespaceAndComments();
        if (!this.matchKeyword(Keywords.trailer))
            return;
        this.skipWhitespaceAndComments();
        const dict = this.parseDict();
        const { context } = this;
        context.trailerInfo = {
            Root: dict.get(PDFName.of('Root')) || context.trailerInfo.Root,
            Encrypt: dict.get(PDFName.of('Encrypt')) || context.trailerInfo.Encrypt,
            Info: dict.get(PDFName.of('Info')) || context.trailerInfo.Info,
            ID: dict.get(PDFName.of('ID')) || context.trailerInfo.ID,
        };
    }
    maybeParseTrailer() {
        this.skipWhitespaceAndComments();
        if (!this.matchKeyword(Keywords.startxref))
            return;
        this.skipWhitespaceAndComments();
        const offset = this.parseRawInt();
        this.skipWhitespace();
        this.matchKeyword(Keywords.eof);
        this.skipWhitespaceAndComments();
        this.matchKeyword(Keywords.eof);
        this.skipWhitespaceAndComments();
        return PDFTrailer.forLastCrossRefSectionOffset(offset);
    }
    parseDocumentSection() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.parseIndirectObjects();
            this.maybeParseCrossRefSection();
            this.maybeParseTrailerDict();
            this.maybeParseTrailer();
            // TODO: Can this be done only when needed, to avoid harming performance?
            this.skipJibberish();
        });
    }
    /**
     * This operation is not necessary for valid PDF files. But some invalid PDFs
     * contain jibberish in between indirect objects. This method is designed to
     * skip past that jibberish, should it exist, until it reaches the next
     * indirect object header, an xref table section, or the file trailer.
     */
    skipJibberish() {
        this.skipWhitespaceAndComments();
        while (!this.bytes.done()) {
            const initialOffset = this.bytes.offset();
            const byte = this.bytes.peek();
            const isAlphaNumeric = byte >= CharCodes.Space && byte <= CharCodes.Tilde;
            if (isAlphaNumeric) {
                if (this.matchKeyword(Keywords.xref) ||
                    this.matchKeyword(Keywords.trailer) ||
                    this.matchKeyword(Keywords.startxref) ||
                    this.matchIndirectObjectHeader()) {
                    this.bytes.moveTo(initialOffset);
                    break;
                }
            }
            this.bytes.next();
        }
    }
    /**
     * Skips the binary comment following a PDF header. The specification
     * defines this binary comment (section 7.5.2 File Header) as a sequence of 4
     * or more bytes that are 128 or greater, and which are preceded by a "%".
     *
     * This would imply that to strip out this binary comment, we could check for
     * a sequence of bytes starting with "%", and remove all subsequent bytes that
     * are 128 or greater. This works for many documents that properly comply with
     * the spec. But in the wild, there are PDFs that omit the leading "%", and
     * include bytes that are less than 128 (e.g. 0 or 1). So in order to parse
     * these headers correctly, we just throw out all bytes leading up to the
     * first indirect object header.
     */
    skipBinaryHeaderComment() {
        this.skipWhitespaceAndComments();
        try {
            const initialOffset = this.bytes.offset();
            this.parseIndirectObjectHeader();
            this.bytes.moveTo(initialOffset);
        }
        catch (e) {
            this.bytes.next();
            this.skipWhitespaceAndComments();
        }
    }
}
PDFParser.forBytesWithOptions = (pdfBytes, objectsPerTick, throwOnInvalidObject, capNumbers) => new PDFParser(pdfBytes, objectsPerTick, throwOnInvalidObject, capNumbers);
export default PDFParser;
//# sourceMappingURL=PDFParser.js.map