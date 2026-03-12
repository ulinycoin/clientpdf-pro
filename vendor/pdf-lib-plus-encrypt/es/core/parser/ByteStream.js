import { NextByteAssertionError } from "../errors";
import { decodePDFRawStream } from "../streams/decode";
import CharCodes from "../syntax/CharCodes";
// TODO: See how line/col tracking affects performance
class ByteStream {
    constructor(bytes) {
        this.idx = 0;
        this.line = 0;
        this.column = 0;
        this.bytes = bytes;
        this.length = this.bytes.length;
    }
    moveTo(offset) {
        this.idx = offset;
    }
    next() {
        const byte = this.bytes[this.idx++];
        if (byte === CharCodes.Newline) {
            this.line += 1;
            this.column = 0;
        }
        else {
            this.column += 1;
        }
        return byte;
    }
    assertNext(expected) {
        if (this.peek() !== expected) {
            throw new NextByteAssertionError(this.position(), expected, this.peek());
        }
        return this.next();
    }
    peek() {
        return this.bytes[this.idx];
    }
    peekAhead(steps) {
        return this.bytes[this.idx + steps];
    }
    peekAt(offset) {
        return this.bytes[offset];
    }
    done() {
        return this.idx >= this.length;
    }
    offset() {
        return this.idx;
    }
    slice(start, end) {
        return this.bytes.slice(start, end);
    }
    position() {
        return { line: this.line, column: this.column, offset: this.idx };
    }
}
ByteStream.of = (bytes) => new ByteStream(bytes);
ByteStream.fromPDFRawStream = (rawStream) => ByteStream.of(decodePDFRawStream(rawStream).decode());
export default ByteStream;
//# sourceMappingURL=ByteStream.js.map