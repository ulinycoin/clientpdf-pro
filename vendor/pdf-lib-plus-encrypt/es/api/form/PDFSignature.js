import PDFField from "./PDFField";
import { PDFAcroSignature } from "../../core";
import { assertIs } from "../../utils";
/**
 * Represents a signature field of a [[PDFForm]].
 *
 * [[PDFSignature]] fields are digital signatures. `pdf-lib` does not
 * currently provide any specialized APIs for creating digital signatures or
 * reading the contents of existing digital signatures.
 */
export default class PDFSignature extends PDFField {
    constructor(acroSignature, ref, doc) {
        super(acroSignature, ref, doc);
        assertIs(acroSignature, 'acroSignature', [
            [PDFAcroSignature, 'PDFAcroSignature'],
        ]);
        this.acroField = acroSignature;
    }
    needsAppearancesUpdate() {
        return false;
    }
}
/**
 * > **NOTE:** You probably don't want to call this method directly. Instead,
 * > consider using the [[PDFForm.getSignature]] method, which will create an
 * > instance of [[PDFSignature]] for you.
 *
 * Create an instance of [[PDFSignature]] from an existing acroSignature and
 * ref
 *
 * @param acroSignature The underlying `PDFAcroSignature` for this signature.
 * @param ref The unique reference for this signature.
 * @param doc The document to which this signature will belong.
 */
PDFSignature.of = (acroSignature, ref, doc) => new PDFSignature(acroSignature, ref, doc);
//# sourceMappingURL=PDFSignature.js.map