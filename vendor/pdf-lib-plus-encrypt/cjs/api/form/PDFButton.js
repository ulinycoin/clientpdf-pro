"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFPage_1 = tslib_1.__importDefault(require("../PDFPage"));
const PDFFont_1 = tslib_1.__importDefault(require("../PDFFont"));
const alignment_1 = require("../image/alignment");
const appearances_1 = require("./appearances");
const PDFField_1 = tslib_1.__importStar(require("./PDFField"));
const colors_1 = require("../colors");
const rotations_1 = require("../rotations");
const core_1 = require("../../core");
const utils_1 = require("../../utils");
/**
 * Represents a button field of a [[PDFForm]].
 *
 * [[PDFButton]] fields are interactive controls that users can click with their
 * mouse. This type of [[PDFField]] is not stateful. The purpose of a button
 * is to perform an action when the user clicks on it, such as opening a print
 * modal or resetting the form. Buttons are typically rectangular in shape and
 * have a text label describing the action that they perform when clicked.
 */
class PDFButton extends PDFField_1.default {
    constructor(acroPushButton, ref, doc) {
        super(acroPushButton, ref, doc);
        (0, utils_1.assertIs)(acroPushButton, 'acroButton', [
            [core_1.PDFAcroPushButton, 'PDFAcroPushButton'],
        ]);
        this.acroField = acroPushButton;
    }
    /**
     * Display an image inside the bounds of this button's widgets. For example:
     * ```js
     * const pngImage = await pdfDoc.embedPng(...)
     * const button = form.getButton('some.button.field')
     * button.setImage(pngImage, ImageAlignment.Center)
     * ```
     * This will update the appearances streams for each of this button's widgets.
     * @param image The image that should be displayed.
     * @param alignment The alignment of the image.
     */
    setImage(image, alignment = alignment_1.ImageAlignment.Center) {
        const widgets = this.acroField.getWidgets();
        for (let idx = 0, len = widgets.length; idx < len; idx++) {
            const widget = widgets[idx];
            const streamRef = this.createImageAppearanceStream(widget, image, alignment);
            this.updateWidgetAppearances(widget, { normal: streamRef });
        }
        this.markAsClean();
    }
    /**
     * Set the font size for this field. Larger font sizes will result in larger
     * text being displayed when PDF readers render this button. Font sizes may
     * be integer or floating point numbers. Supplying a negative font size will
     * cause this method to throw an error.
     *
     * For example:
     * ```js
     * const button = form.getButton('some.button.field')
     * button.setFontSize(4)
     * button.setFontSize(15.7)
     * ```
     *
     * > This method depends upon the existence of a default appearance
     * > (`/DA`) string. If this field does not have a default appearance string,
     * > or that string does not contain a font size (via the `Tf` operator),
     * > then this method will throw an error.
     *
     * @param fontSize The font size to be used when rendering text in this field.
     */
    setFontSize(fontSize) {
        (0, utils_1.assertPositive)(fontSize, 'fontSize');
        this.acroField.setFontSize(fontSize);
        this.markAsDirty();
    }
    /**
     * Show this button on the specified page with the given text. For example:
     * ```js
     * const ubuntuFont = await pdfDoc.embedFont(ubuntuFontBytes)
     * const page = pdfDoc.addPage()
     *
     * const form = pdfDoc.getForm()
     * const button = form.createButton('some.button.field')
     *
     * button.addToPage('Do Stuff', page, {
     *   x: 50,
     *   y: 75,
     *   width: 200,
     *   height: 100,
     *   textColor: rgb(1, 0, 0),
     *   backgroundColor: rgb(0, 1, 0),
     *   borderColor: rgb(0, 0, 1),
     *   borderWidth: 2,
     *   rotate: degrees(90),
     *   font: ubuntuFont,
     * })
     * ```
     * This will create a new widget for this button field.
     * @param text The text to be displayed for this button widget.
     * @param page The page to which this button widget should be added.
     * @param options The options to be used when adding this button widget.
     */
    addToPage(
    // TODO: This needs to be optional, e.g. for image buttons
    text, page, options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        (0, utils_1.assertOrUndefined)(text, 'text', ['string']);
        (0, utils_1.assertOrUndefined)(page, 'page', [[PDFPage_1.default, 'PDFPage']]);
        (0, PDFField_1.assertFieldAppearanceOptions)(options);
        // Create a widget for this button
        const widget = this.createWidget({
            x: ((_a = options === null || options === void 0 ? void 0 : options.x) !== null && _a !== void 0 ? _a : 0) - ((_b = options === null || options === void 0 ? void 0 : options.borderWidth) !== null && _b !== void 0 ? _b : 0) / 2,
            y: ((_c = options === null || options === void 0 ? void 0 : options.y) !== null && _c !== void 0 ? _c : 0) - ((_d = options === null || options === void 0 ? void 0 : options.borderWidth) !== null && _d !== void 0 ? _d : 0) / 2,
            width: (_e = options === null || options === void 0 ? void 0 : options.width) !== null && _e !== void 0 ? _e : 100,
            height: (_f = options === null || options === void 0 ? void 0 : options.height) !== null && _f !== void 0 ? _f : 50,
            textColor: (_g = options === null || options === void 0 ? void 0 : options.textColor) !== null && _g !== void 0 ? _g : (0, colors_1.rgb)(0, 0, 0),
            backgroundColor: (_h = options === null || options === void 0 ? void 0 : options.backgroundColor) !== null && _h !== void 0 ? _h : (0, colors_1.rgb)(0.75, 0.75, 0.75),
            borderColor: options === null || options === void 0 ? void 0 : options.borderColor,
            borderWidth: (_j = options === null || options === void 0 ? void 0 : options.borderWidth) !== null && _j !== void 0 ? _j : 0,
            rotate: (_k = options === null || options === void 0 ? void 0 : options.rotate) !== null && _k !== void 0 ? _k : (0, rotations_1.degrees)(0),
            caption: text,
            hidden: options === null || options === void 0 ? void 0 : options.hidden,
        });
        const widgetRef = this.doc.context.register(widget.dict);
        // Add widget to this field
        this.acroField.addWidget(widgetRef);
        // Set appearance streams for widget
        const font = (_l = options === null || options === void 0 ? void 0 : options.font) !== null && _l !== void 0 ? _l : this.doc.getForm().getDefaultFont();
        this.updateWidgetAppearance(widget, font);
        // Add widget to the given page
        page.node.addAnnot(widgetRef);
    }
    /**
     * Returns `true` if this button has been marked as dirty, or if any of this
     * button's widgets do not have an appearance stream. For example:
     * ```js
     * const button = form.getButton('some.button.field')
     * if (button.needsAppearancesUpdate()) console.log('Needs update')
     * ```
     * @returns Whether or not this button needs an appearance update.
     */
    needsAppearancesUpdate() {
        var _a;
        if (this.isDirty())
            return true;
        const widgets = this.acroField.getWidgets();
        for (let idx = 0, len = widgets.length; idx < len; idx++) {
            const widget = widgets[idx];
            const hasAppearances = ((_a = widget.getAppearances()) === null || _a === void 0 ? void 0 : _a.normal) instanceof core_1.PDFStream;
            if (!hasAppearances)
                return true;
        }
        return false;
    }
    /**
     * Update the appearance streams for each of this button's widgets using
     * the default appearance provider for buttons. For example:
     * ```js
     * const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
     * const button = form.getButton('some.button.field')
     * button.defaultUpdateAppearances(helvetica)
     * ```
     * @param font The font to be used for creating the appearance streams.
     */
    defaultUpdateAppearances(font) {
        (0, utils_1.assertIs)(font, 'font', [[PDFFont_1.default, 'PDFFont']]);
        this.updateAppearances(font);
    }
    /**
     * Update the appearance streams for each of this button's widgets using
     * the given appearance provider. If no `provider` is passed, the default
     * appearance provider for buttons will be used. For example:
     * ```js
     * const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
     * const button = form.getButton('some.button.field')
     * button.updateAppearances(helvetica, (field, widget, font) => {
     *   ...
     *   return {
     *     normal: drawButton(...),
     *     down: drawButton(...),
     *   }
     * })
     * ```
     * @param font The font to be used for creating the appearance streams.
     * @param provider Optionally, the appearance provider to be used for
     *                 generating the contents of the appearance streams.
     */
    updateAppearances(font, provider) {
        (0, utils_1.assertIs)(font, 'font', [[PDFFont_1.default, 'PDFFont']]);
        (0, utils_1.assertOrUndefined)(provider, 'provider', [Function]);
        const widgets = this.acroField.getWidgets();
        for (let idx = 0, len = widgets.length; idx < len; idx++) {
            const widget = widgets[idx];
            this.updateWidgetAppearance(widget, font, provider);
        }
    }
    updateWidgetAppearance(widget, font, provider) {
        const apProvider = provider !== null && provider !== void 0 ? provider : appearances_1.defaultButtonAppearanceProvider;
        const appearances = (0, appearances_1.normalizeAppearance)(apProvider(this, widget, font));
        this.updateWidgetAppearanceWithFont(widget, font, appearances);
    }
}
exports.default = PDFButton;
/**
 * > **NOTE:** You probably don't want to call this method directly. Instead,
 * > consider using the [[PDFForm.getButton]] method, which will create an
 * > instance of [[PDFButton]] for you.
 *
 * Create an instance of [[PDFButton]] from an existing acroPushButton and ref
 *
 * @param acroPushButton The underlying `PDFAcroPushButton` for this button.
 * @param ref The unique reference for this button.
 * @param doc The document to which this button will belong.
 */
PDFButton.of = (acroPushButton, ref, doc) => new PDFButton(acroPushButton, ref, doc);
//# sourceMappingURL=PDFButton.js.map