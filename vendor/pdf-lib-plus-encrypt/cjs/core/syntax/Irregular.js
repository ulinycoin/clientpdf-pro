"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsIrregular = void 0;
const tslib_1 = require("tslib");
const CharCodes_1 = tslib_1.__importDefault(require("./CharCodes"));
const Delimiters_1 = require("./Delimiters");
const Whitespace_1 = require("./Whitespace");
exports.IsIrregular = new Uint8Array(256);
for (let idx = 0, len = 256; idx < len; idx++) {
    exports.IsIrregular[idx] = Whitespace_1.IsWhitespace[idx] || Delimiters_1.IsDelimiter[idx] ? 1 : 0;
}
exports.IsIrregular[CharCodes_1.default.Hash] = 1;
//# sourceMappingURL=Irregular.js.map