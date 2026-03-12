"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const errors_1 = require("../errors");
const decode_1 = require("../streams/decode");
const CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
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
        if (byte === CharCodes_1.default.Newline) {
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
            throw new errors_1.NextByteAssertionError(this.position(), expected, this.peek());
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
ByteStream.fromPDFRawStream = (rawStream) => ByteStream.of((0, decode_1.decodePDFRawStream)(rawStream).decode());
exports.default = ByteStream;
//# sourceMappingURL=ByteStream.js.map