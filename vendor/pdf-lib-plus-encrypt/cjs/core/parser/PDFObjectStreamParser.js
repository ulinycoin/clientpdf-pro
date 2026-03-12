"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const errors_1 = require("../errors");
const PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
const PDFNumber_1 = tslib_1.__importDefault(require("../objects/PDFNumber"));
const PDFRef_1 = tslib_1.__importDefault(require("../objects/PDFRef"));
const ByteStream_1 = tslib_1.__importDefault(require("./ByteStream"));
const PDFObjectParser_1 = tslib_1.__importDefault(require("./PDFObjectParser"));
const utils_1 = require("../../utils");
class PDFObjectStreamParser extends PDFObjectParser_1.default {
    constructor(rawStream, shouldWaitForTick) {
        super(ByteStream_1.default.fromPDFRawStream(rawStream), rawStream.dict.context);
        const { dict } = rawStream;
        this.alreadyParsed = false;
        this.shouldWaitForTick = shouldWaitForTick || (() => false);
        this.firstOffset = dict.lookup(PDFName_1.default.of('First'), PDFNumber_1.default).asNumber();
        this.objectCount = dict.lookup(PDFName_1.default.of('N'), PDFNumber_1.default).asNumber();
    }
    parseIntoContext() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.alreadyParsed) {
                throw new errors_1.ReparseError('PDFObjectStreamParser', 'parseIntoContext');
            }
            this.alreadyParsed = true;
            const offsetsAndObjectNumbers = this.parseOffsetsAndObjectNumbers();
            for (let idx = 0, len = offsetsAndObjectNumbers.length; idx < len; idx++) {
                const { objectNumber, offset } = offsetsAndObjectNumbers[idx];
                this.bytes.moveTo(this.firstOffset + offset);
                const object = this.parseObject();
                const ref = PDFRef_1.default.of(objectNumber, 0);
                this.context.assign(ref, object);
                if (this.shouldWaitForTick())
                    yield (0, utils_1.waitForTick)();
            }
        });
    }
    parseOffsetsAndObjectNumbers() {
        const offsetsAndObjectNumbers = [];
        for (let idx = 0, len = this.objectCount; idx < len; idx++) {
            this.skipWhitespaceAndComments();
            const objectNumber = this.parseRawInt();
            this.skipWhitespaceAndComments();
            const offset = this.parseRawInt();
            offsetsAndObjectNumbers.push({ objectNumber, offset });
        }
        return offsetsAndObjectNumbers;
    }
}
PDFObjectStreamParser.forStream = (rawStream, shouldWaitForTick) => new PDFObjectStreamParser(rawStream, shouldWaitForTick);
exports.default = PDFObjectStreamParser;
//# sourceMappingURL=PDFObjectStreamParser.js.map