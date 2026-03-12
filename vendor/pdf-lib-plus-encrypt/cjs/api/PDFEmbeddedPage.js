"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFDocument_1 = tslib_1.__importDefault(require("./PDFDocument"));
const core_1 = require("../core");
const utils_1 = require("../utils");
/**
 * Represents a PDF page that has been embedded in a [[PDFDocument]].
 */
class PDFEmbeddedPage {
    constructor(ref, doc, embedder) {
        this.alreadyEmbedded = false;
        (0, utils_1.assertIs)(ref, 'ref', [[core_1.PDFRef, 'PDFRef']]);
        (0, utils_1.assertIs)(doc, 'doc', [[PDFDocument_1.default, 'PDFDocument']]);
        (0, utils_1.assertIs)(embedder, 'embedder', [[core_1.PDFPageEmbedder, 'PDFPageEmbedder']]);
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
        (0, utils_1.assertIs)(factor, 'factor', ['number']);
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
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.alreadyEmbedded) {
                yield this.embedder.embedIntoContext(this.doc.context, this.ref);
                this.alreadyEmbedded = true;
            }
        });
    }
}
exports.default = PDFEmbeddedPage;
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