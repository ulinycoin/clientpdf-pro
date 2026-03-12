"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const errors_1 = require("../errors");
const PDFArray_1 = tslib_1.__importDefault(require("../objects/PDFArray"));
const PDFBool_1 = tslib_1.__importDefault(require("../objects/PDFBool"));
const PDFDict_1 = tslib_1.__importDefault(require("../objects/PDFDict"));
const PDFHexString_1 = tslib_1.__importDefault(require("../objects/PDFHexString"));
const PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
const PDFNull_1 = tslib_1.__importDefault(require("../objects/PDFNull"));
const PDFNumber_1 = tslib_1.__importDefault(require("../objects/PDFNumber"));
const PDFRawStream_1 = tslib_1.__importDefault(require("../objects/PDFRawStream"));
const PDFRef_1 = tslib_1.__importDefault(require("../objects/PDFRef"));
const PDFString_1 = tslib_1.__importDefault(require("../objects/PDFString"));
const BaseParser_1 = tslib_1.__importDefault(require("./BaseParser"));
const ByteStream_1 = tslib_1.__importDefault(require("./ByteStream"));
const PDFCatalog_1 = tslib_1.__importDefault(require("../structures/PDFCatalog"));
const PDFPageLeaf_1 = tslib_1.__importDefault(require("../structures/PDFPageLeaf"));
const PDFPageTree_1 = tslib_1.__importDefault(require("../structures/PDFPageTree"));
const CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
const Delimiters_1 = require("../syntax/Delimiters");
const Keywords_1 = require("../syntax/Keywords");
const Numeric_1 = require("../syntax/Numeric");
const Whitespace_1 = require("../syntax/Whitespace");
const utils_1 = require("../../utils");
// TODO: Throw error if eof is reached before finishing object parse...
class PDFObjectParser extends BaseParser_1.default {
    constructor(byteStream, context, capNumbers = false) {
        super(byteStream, capNumbers);
        this.context = context;
    }
    // TODO: Is it possible to reduce duplicate parsing for ref lookaheads?
    parseObject() {
        this.skipWhitespaceAndComments();
        if (this.matchKeyword(Keywords_1.Keywords.true))
            return PDFBool_1.default.True;
        if (this.matchKeyword(Keywords_1.Keywords.false))
            return PDFBool_1.default.False;
        if (this.matchKeyword(Keywords_1.Keywords.null))
            return PDFNull_1.default;
        const byte = this.bytes.peek();
        if (byte === CharCodes_1.default.LessThan &&
            this.bytes.peekAhead(1) === CharCodes_1.default.LessThan) {
            return this.parseDictOrStream();
        }
        if (byte === CharCodes_1.default.LessThan)
            return this.parseHexString();
        if (byte === CharCodes_1.default.LeftParen)
            return this.parseString();
        if (byte === CharCodes_1.default.ForwardSlash)
            return this.parseName();
        if (byte === CharCodes_1.default.LeftSquareBracket)
            return this.parseArray();
        if (Numeric_1.IsNumeric[byte])
            return this.parseNumberOrRef();
        throw new errors_1.PDFObjectParsingError(this.bytes.position(), byte);
    }
    parseNumberOrRef() {
        const firstNum = this.parseRawNumber();
        this.skipWhitespaceAndComments();
        const lookaheadStart = this.bytes.offset();
        if (Numeric_1.IsDigit[this.bytes.peek()]) {
            const secondNum = this.parseRawNumber();
            this.skipWhitespaceAndComments();
            if (this.bytes.peek() === CharCodes_1.default.R) {
                this.bytes.assertNext(CharCodes_1.default.R);
                return PDFRef_1.default.of(firstNum, secondNum);
            }
        }
        this.bytes.moveTo(lookaheadStart);
        return PDFNumber_1.default.of(firstNum);
    }
    // TODO: Maybe update PDFHexString.of() logic to remove whitespace and validate input?
    parseHexString() {
        let value = '';
        this.bytes.assertNext(CharCodes_1.default.LessThan);
        while (!this.bytes.done() && this.bytes.peek() !== CharCodes_1.default.GreaterThan) {
            value += (0, utils_1.charFromCode)(this.bytes.next());
        }
        this.bytes.assertNext(CharCodes_1.default.GreaterThan);
        return PDFHexString_1.default.of(value);
    }
    parseString() {
        let nestingLvl = 0;
        let isEscaped = false;
        let value = '';
        while (!this.bytes.done()) {
            const byte = this.bytes.next();
            value += (0, utils_1.charFromCode)(byte);
            // Check for unescaped parenthesis
            if (!isEscaped) {
                if (byte === CharCodes_1.default.LeftParen)
                    nestingLvl += 1;
                if (byte === CharCodes_1.default.RightParen)
                    nestingLvl -= 1;
            }
            // Track whether current character is being escaped or not
            if (byte === CharCodes_1.default.BackSlash) {
                isEscaped = !isEscaped;
            }
            else if (isEscaped) {
                isEscaped = false;
            }
            // Once (if) the unescaped parenthesis balance out, return their contents
            if (nestingLvl === 0) {
                // Remove the outer parens so they aren't part of the contents
                return PDFString_1.default.of(value.substring(1, value.length - 1));
            }
        }
        throw new errors_1.UnbalancedParenthesisError(this.bytes.position());
    }
    // TODO: Compare performance of string concatenation to charFromCode(...bytes)
    // TODO: Maybe preallocate small Uint8Array if can use charFromCode?
    parseName() {
        this.bytes.assertNext(CharCodes_1.default.ForwardSlash);
        let name = '';
        while (!this.bytes.done()) {
            const byte = this.bytes.peek();
            if (Whitespace_1.IsWhitespace[byte] || Delimiters_1.IsDelimiter[byte])
                break;
            name += (0, utils_1.charFromCode)(byte);
            this.bytes.next();
        }
        return PDFName_1.default.of(name);
    }
    parseArray() {
        this.bytes.assertNext(CharCodes_1.default.LeftSquareBracket);
        this.skipWhitespaceAndComments();
        const pdfArray = PDFArray_1.default.withContext(this.context);
        while (this.bytes.peek() !== CharCodes_1.default.RightSquareBracket) {
            const element = this.parseObject();
            pdfArray.push(element);
            this.skipWhitespaceAndComments();
        }
        this.bytes.assertNext(CharCodes_1.default.RightSquareBracket);
        return pdfArray;
    }
    parseDict() {
        this.bytes.assertNext(CharCodes_1.default.LessThan);
        this.bytes.assertNext(CharCodes_1.default.LessThan);
        this.skipWhitespaceAndComments();
        const dict = new Map();
        while (!this.bytes.done() &&
            this.bytes.peek() !== CharCodes_1.default.GreaterThan &&
            this.bytes.peekAhead(1) !== CharCodes_1.default.GreaterThan) {
            const key = this.parseName();
            const value = this.parseObject();
            dict.set(key, value);
            this.skipWhitespaceAndComments();
        }
        this.skipWhitespaceAndComments();
        this.bytes.assertNext(CharCodes_1.default.GreaterThan);
        this.bytes.assertNext(CharCodes_1.default.GreaterThan);
        const Type = dict.get(PDFName_1.default.of('Type'));
        if (Type === PDFName_1.default.of('Catalog')) {
            return PDFCatalog_1.default.fromMapWithContext(dict, this.context);
        }
        else if (Type === PDFName_1.default.of('Pages')) {
            return PDFPageTree_1.default.fromMapWithContext(dict, this.context);
        }
        else if (Type === PDFName_1.default.of('Page')) {
            return PDFPageLeaf_1.default.fromMapWithContext(dict, this.context);
        }
        else {
            return PDFDict_1.default.fromMapWithContext(dict, this.context);
        }
    }
    parseDictOrStream() {
        const startPos = this.bytes.position();
        const dict = this.parseDict();
        this.skipWhitespaceAndComments();
        if (!this.matchKeyword(Keywords_1.Keywords.streamEOF1) &&
            !this.matchKeyword(Keywords_1.Keywords.streamEOF2) &&
            !this.matchKeyword(Keywords_1.Keywords.streamEOF3) &&
            !this.matchKeyword(Keywords_1.Keywords.streamEOF4) &&
            !this.matchKeyword(Keywords_1.Keywords.stream)) {
            return dict;
        }
        const start = this.bytes.offset();
        let end;
        const Length = dict.get(PDFName_1.default.of('Length'));
        if (Length instanceof PDFNumber_1.default) {
            end = start + Length.asNumber();
            this.bytes.moveTo(end);
            this.skipWhitespaceAndComments();
            if (!this.matchKeyword(Keywords_1.Keywords.endstream)) {
                this.bytes.moveTo(start);
                end = this.findEndOfStreamFallback(startPos);
            }
        }
        else {
            end = this.findEndOfStreamFallback(startPos);
        }
        const contents = this.bytes.slice(start, end);
        return PDFRawStream_1.default.of(dict, contents);
    }
    findEndOfStreamFallback(startPos) {
        // Move to end of stream, while handling nested streams
        let nestingLvl = 1;
        let end = this.bytes.offset();
        while (!this.bytes.done()) {
            end = this.bytes.offset();
            if (this.matchKeyword(Keywords_1.Keywords.stream)) {
                nestingLvl += 1;
            }
            else if (this.matchKeyword(Keywords_1.Keywords.EOF1endstream) ||
                this.matchKeyword(Keywords_1.Keywords.EOF2endstream) ||
                this.matchKeyword(Keywords_1.Keywords.EOF3endstream) ||
                this.matchKeyword(Keywords_1.Keywords.endstream)) {
                nestingLvl -= 1;
            }
            else {
                this.bytes.next();
            }
            if (nestingLvl === 0)
                break;
        }
        if (nestingLvl !== 0)
            throw new errors_1.PDFStreamParsingError(startPos);
        return end;
    }
}
PDFObjectParser.forBytes = (bytes, context, capNumbers) => new PDFObjectParser(ByteStream_1.default.of(bytes), context, capNumbers);
PDFObjectParser.forByteStream = (byteStream, context, capNumbers = false) => new PDFObjectParser(byteStream, context, capNumbers);
exports.default = PDFObjectParser;
//# sourceMappingURL=PDFObjectParser.js.map