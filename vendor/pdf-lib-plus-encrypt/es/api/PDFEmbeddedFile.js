import { __awaiter } from "tslib";
import { PDFName, PDFArray, PDFDict, PDFHexString } from "../core";
/**
 * Represents a file that has been embedded in a [[PDFDocument]].
 */
export default class PDFEmbeddedFile {
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
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.alreadyEmbedded) {
                const ref = yield this.embedder.embedIntoContext(this.doc.context, this.ref);
                if (!this.doc.catalog.has(PDFName.of('Names'))) {
                    this.doc.catalog.set(PDFName.of('Names'), this.doc.context.obj({}));
                }
                const Names = this.doc.catalog.lookup(PDFName.of('Names'), PDFDict);
                if (!Names.has(PDFName.of('EmbeddedFiles'))) {
                    Names.set(PDFName.of('EmbeddedFiles'), this.doc.context.obj({}));
                }
                const EmbeddedFiles = Names.lookup(PDFName.of('EmbeddedFiles'), PDFDict);
                if (!EmbeddedFiles.has(PDFName.of('Names'))) {
                    EmbeddedFiles.set(PDFName.of('Names'), this.doc.context.obj([]));
                }
                const EFNames = EmbeddedFiles.lookup(PDFName.of('Names'), PDFArray);
                EFNames.push(PDFHexString.fromText(this.embedder.fileName));
                EFNames.push(ref);
                /**
                 * The AF-Tag is needed to achieve PDF-A3 compliance for embedded files
                 *
                 * The following document outlines the uses cases of the associated files (AF) tag.
                 * See:
                 * https://www.pdfa.org/wp-content/uploads/2018/10/PDF20_AN002-AF.pdf
                 */
                if (!this.doc.catalog.has(PDFName.of('AF'))) {
                    this.doc.catalog.set(PDFName.of('AF'), this.doc.context.obj([]));
                }
                const AF = this.doc.catalog.lookup(PDFName.of('AF'), PDFArray);
                AF.push(ref);
                this.alreadyEmbedded = true;
            }
        });
    }
}
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