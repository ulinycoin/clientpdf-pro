"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("../core");
/**
 * Represents JavaScript that has been embedded in a [[PDFDocument]].
 */
class PDFJavaScript {
    constructor(ref, doc, embedder) {
        this.alreadyEmbedded = false;
        this.ref = ref;
        this.doc = doc;
        this.embedder = embedder;
    }
    /**
     * > **NOTE:** You probably don't need to call this method directly. The
     * > [[PDFDocument.save]] and [[PDFDocument.saveAsBase64]] methods will
     * > automatically ensure all JavaScripts get embedded.
     *
     * Embed this JavaScript in its document.
     *
     * @returns Resolves when the embedding is complete.
     */
    embed() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.alreadyEmbedded) {
                const { catalog, context } = this.doc;
                const ref = yield this.embedder.embedIntoContext(this.doc.context, this.ref);
                if (!catalog.has(core_1.PDFName.of('Names'))) {
                    catalog.set(core_1.PDFName.of('Names'), context.obj({}));
                }
                const Names = catalog.lookup(core_1.PDFName.of('Names'), core_1.PDFDict);
                if (!Names.has(core_1.PDFName.of('JavaScript'))) {
                    Names.set(core_1.PDFName.of('JavaScript'), context.obj({}));
                }
                const Javascript = Names.lookup(core_1.PDFName.of('JavaScript'), core_1.PDFDict);
                if (!Javascript.has(core_1.PDFName.of('Names'))) {
                    Javascript.set(core_1.PDFName.of('Names'), context.obj([]));
                }
                const JSNames = Javascript.lookup(core_1.PDFName.of('Names'), core_1.PDFArray);
                JSNames.push(core_1.PDFHexString.fromText(this.embedder.scriptName));
                JSNames.push(ref);
                this.alreadyEmbedded = true;
            }
        });
    }
}
exports.default = PDFJavaScript;
/**
 * > **NOTE:** You probably don't want to call this method directly. Instead,
 * > consider using the [[PDFDocument.addJavaScript]] method, which will
 * create instances of [[PDFJavaScript]] for you.
 *
 * Create an instance of [[PDFJavaScript]] from an existing ref and script
 *
 * @param ref The unique reference for this script.
 * @param doc The document to which the script will belong.
 * @param embedder The embedder that will be used to embed the script.
 */
PDFJavaScript.of = (ref, doc, embedder) => new PDFJavaScript(ref, doc, embedder);
//# sourceMappingURL=PDFJavaScript.js.map