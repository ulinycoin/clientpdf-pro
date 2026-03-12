import { __awaiter } from "tslib";
import PDFDocument from "./PDFDocument";
import { PDFPageEmbedder, PDFRef } from "../core";
import { assertIs } from "../utils";
/**
 * Represents a PDF page that has been embedded in a [[PDFDocument]].
 */
export default class PDFEmbeddedPage {
    constructor(ref, doc, embedder) {
        this.alreadyEmbedded = false;
        assertIs(ref, 'ref', [[PDFRef, 'PDFRef']]);
        assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);
        assertIs(embedder, 'embedder', [[PDFPageEmbedder, 'PDFPageEmbedder']]);
        this.ref = ref;
        this.doc = doc;
        this.width = embedder.width;
        this.height = embedder.height;
        this.embedder = embedder;
    }
    /**
     * Compute the width and height of this page after being scaled by the
     * given `factor`. For example:
     * ```js
     * embeddedPage.width  // => 500
     * embeddedPage.height // => 250
     *
     * const scaled = embeddedPage.scale(0.5)
     * scaled.width  // => 250
     * scaled.height // => 125
     * ```
     * This operation is often useful before drawing a page with
     * [[PDFPage.drawPage]] to compute the `width` and `height` options.
     * @param factor The factor by which this page should be scaled.
     * @returns The width and height of the page after being scaled.
     */
    scale(factor) {
        assertIs(factor, 'factor', ['number']);
        return { width: this.width * factor, height: this.height * factor };
    }
    /**
     * Get the width and height of this page. For example:
     * ```js
     * const { width, height } = embeddedPage.size()
     * ```
     * @returns The width and height of the page.
     */
    size() {
        return this.scale(1);
    }
    /**
     * > **NOTE:** You probably don't need to call this method directly. The
     * > [[PDFDocument.save]] and [[PDFDocument.saveAsBase64]] methods will
     * > automatically ensure all embeddable pages get embedded.
     *
     * Embed this embeddable page in its document.
     *
     * @returns Resolves when the embedding is complete.
     */
    embed() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.alreadyEmbedded) {
                yield this.embedder.embedIntoContext(this.doc.context, this.ref);
                this.alreadyEmbedded = true;
            }
        });
    }
}
/**
 * > **NOTE:** You probably don't want to call this method directly. Instead,
 * > consider using the [[PDFDocument.embedPdf]] and
 * > [[PDFDocument.embedPage]] methods, which will create instances of
 * > [[PDFEmbeddedPage]] for you.
 *
 * Create an instance of [[PDFEmbeddedPage]] from an existing ref and embedder
 *
 * @param ref The unique reference for this embedded page.
 * @param doc The document to which the embedded page will belong.
 * @param embedder The embedder that will be used to embed the page.
 */
PDFEmbeddedPage.of = (ref, doc, embedder) => new PDFEmbeddedPage(ref, doc, embedder);
//# sourceMappingURL=PDFEmbeddedPage.js.map