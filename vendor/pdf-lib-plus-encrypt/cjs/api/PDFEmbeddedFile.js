"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("../core");
/**
 * Represents a file that has been embedded in a [[PDFDocument]].
 */
class PDFEmbeddedFile {
    constructor(ref, doc, embedder) {
        this.alreadyEmbedded = false;
        this.ref = ref;
        this.doc = doc;
        this.embedder = embedder;
    }
    /**
     * > **NOTE:** You probably don't need to call this method directly. The
     * > [[PDFDocument.save]] and [[PDFDocument.saveAsBase64]] methods will
     * > automatically ensure all embeddable files get embedded.
     *
     * Embed this embeddable file in its document.
     *
     * @returns Resolves when the embedding is complete.
     */
    embed() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.alreadyEmbedded) {
                const ref = yield this.embedder.embedIntoContext(this.doc.context, this.ref);
                if (!this.doc.catalog.has(core_1.PDFName.of('Names'))) {
                    this.doc.catalog.set(core_1.PDFName.of('Names'), this.doc.context.obj({}));
                }
                const Names = this.doc.catalog.lookup(core_1.PDFName.of('Names'), core_1.PDFDict);
                if (!Names.has(core_1.PDFName.of('EmbeddedFiles'))) {
                    Names.set(core_1.PDFName.of('EmbeddedFiles'), this.doc.context.obj({}));
                }
                const EmbeddedFiles = Names.lookup(core_1.PDFName.of('EmbeddedFiles'), core_1.PDFDict);
                if (!EmbeddedFiles.has(core_1.PDFName.of('Names'))) {
                    EmbeddedFiles.set(core_1.PDFName.of('Names'), this.doc.context.obj([]));
                }
                const EFNames = EmbeddedFiles.lookup(core_1.PDFName.of('Names'), core_1.PDFArray);
                EFNames.push(core_1.PDFHexString.fromText(this.embedder.fileName));
                EFNames.push(ref);
                /**
                 * The AF-Tag is needed to achieve PDF-A3 compliance for embedded files
                 *
                 * The following document outlines the uses cases of the associated files (AF) tag.
                 * See:
                 * https://www.pdfa.org/wp-content/uploads/2018/10/PDF20_AN002-AF.pdf
                 */
                if (!this.doc.catalog.has(core_1.PDFName.of('AF'))) {
                    this.doc.catalog.set(core_1.PDFName.of('AF'), this.doc.context.obj([]));
                }
                const AF = this.doc.catalog.lookup(core_1.PDFName.of('AF'), core_1.PDFArray);
                AF.push(ref);
                this.alreadyEmbedded = true;
            }
        });
    }
}
exports.default = PDFEmbeddedFile;
/**
 * > **NOTE:** You probably don't want to call this method directly. Instead,
 * > consider using the [[PDFDocument.attach]] method, which will create
 * instances of [[PDFEmbeddedFile]] for you.
 *
 * Create an instance of [[PDFEmbeddedFile]] from an existing ref and embedder
 *
 * @param ref The unique reference for this file.
 * @param doc The document to which the file will belong.
 * @param embedder The embedder that will be used to embed the file.
 */
PDFEmbeddedFile.of = (ref, doc, embedder) => new PDFEmbeddedFile(ref, doc, embedder);
//# sourceMappingURL=PDFEmbeddedFile.js.map