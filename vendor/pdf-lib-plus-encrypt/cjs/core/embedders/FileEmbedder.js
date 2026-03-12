"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AFRelationship = void 0;
const tslib_1 = require("tslib");
const PDFString_1 = tslib_1.__importDefault(require("../objects/PDFString"));
const PDFHexString_1 = tslib_1.__importDefault(require("../objects/PDFHexString"));
/**
 * From the PDF-A3 specification, section **3.1. Requirements - General**.
 * See:
 * * https://www.pdfa.org/wp-content/uploads/2018/10/PDF20_AN002-AF.pdf
 */
var AFRelationship;
(function (AFRelationship) {
    AFRelationship["Source"] = "Source";
    AFRelationship["Data"] = "Data";
    AFRelationship["Alternative"] = "Alternative";
    AFRelationship["Supplement"] = "Supplement";
    AFRelationship["EncryptedPayload"] = "EncryptedPayload";
    AFRelationship["FormData"] = "EncryptedPayload";
    AFRelationship["Schema"] = "Schema";
    AFRelationship["Unspecified"] = "Unspecified";
})(AFRelationship = exports.AFRelationship || (exports.AFRelationship = {}));
class FileEmbedder {
    constructor(fileData, fileName, options = {}) {
        this.fileData = fileData;
        this.fileName = fileName;
        this.options = options;
    }
    static for(bytes, fileName, options = {}) {
        return new FileEmbedder(bytes, fileName, options);
    }
    embedIntoContext(context, ref) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { mimeType, description, creationDate, modificationDate, afRelationship, } = this.options;
            const embeddedFileStream = context.flateStream(this.fileData, {
                Type: 'EmbeddedFile',
                Subtype: mimeType !== null && mimeType !== void 0 ? mimeType : undefined,
                Params: {
                    Size: this.fileData.length,
                    CreationDate: creationDate
                        ? PDFString_1.default.fromDate(creationDate)
                        : undefined,
                    ModDate: modificationDate
                        ? PDFString_1.default.fromDate(modificationDate)
                        : undefined,
                },
            });
            const embeddedFileStreamRef = context.register(embeddedFileStream);
            const fileSpecDict = context.obj({
                Type: 'Filespec',
                F: PDFString_1.default.of(this.fileName),
                UF: PDFHexString_1.default.fromText(this.fileName),
                EF: { F: embeddedFileStreamRef },
                Desc: description ? PDFHexString_1.default.fromText(description) : undefined,
                AFRelationship: afRelationship !== null && afRelationship !== void 0 ? afRelationship : undefined,
            });
            if (ref) {
                context.assign(ref, fileSpecDict);
                return ref;
            }
            else {
                return context.register(fileSpecDict);
            }
        });
    }
}
exports.default = FileEmbedder;
//# sourceMappingURL=FileEmbedder.js.map