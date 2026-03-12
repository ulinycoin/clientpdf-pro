import { __awaiter } from "tslib";
import { ReparseError } from "../errors";
import PDFName from "../objects/PDFName";
import PDFNumber from "../objects/PDFNumber";
import PDFRef from "../objects/PDFRef";
import ByteStream from "./ByteStream";
import PDFObjectParser from "./PDFObjectParser";
import { waitForTick } from "../../utils";
class PDFObjectStreamParser extends PDFObjectParser {
    constructor(rawStream, shouldWaitForTick) {
        super(ByteStream.fromPDFRawStream(rawStream), rawStream.dict.context);
        const { dict } = rawStream;
        this.alreadyParsed = false;
        this.shouldWaitForTick = shouldWaitForTick || (() => false);
        this.firstOffset = dict.lookup(PDFName.of('First'), PDFNumber).asNumber();
        this.objectCount = dict.lookup(PDFName.of('N'), PDFNumber).asNumber();
    }
    parseIntoContext() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.alreadyParsed) {
                throw new ReparseError('PDFObjectStreamParser', 'parseIntoContext');
            }
            this.alreadyParsed = true;
            const offsetsAndObjectNumbers = this.parseOffsetsAndObjectNumbers();
            for (let idx = 0, len = offsetsAndObjectNumbers.length; idx < len; idx++) {
                const { objectNumber, offset } = offsetsAndObjectNumbers[idx];
                this.bytes.moveTo(this.firstOffset + offset);
                const object = this.parseObject();
                const ref = PDFRef.of(objectNumber, 0);
                this.context.assign(ref, object);
                if (this.shouldWaitForTick())
                    yield waitForTick();
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
export default PDFObjectStreamParser;
//# sourceMappingURL=PDFObjectStreamParser.js.map