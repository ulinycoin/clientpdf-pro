import { drawCheckBox, rotateInPlace, drawRadioButton, drawButton, drawTextField, drawOptionList, } from "../operations";
import { rgb, componentsToColor, setFillingColor, grayscale, cmyk, } from "../colors";
import { reduceRotation, adjustDimsForRotation } from "../rotations";
import { layoutMultilineText, layoutCombedText, layoutSinglelineText, } from "../text/layout";
import { TextAlignment } from "../text/alignment";
import { setFontAndSize } from "../operators";
import { findLastMatch } from "../../utils";
/********************* Appearance Provider Functions **************************/
export const normalizeAppearance = (appearance) => {
    if ('normal' in appearance)
        return appearance;
    return { normal: appearance };
};
// Examples:
//   `/Helv 12 Tf` -> ['/Helv 12 Tf', 'Helv', '12']
//   `/HeBo 8.00 Tf` -> ['/HeBo 8 Tf', 'HeBo', '8.00']
const tfRegex = /\/([^\0\t\n\f\r\ ]+)[\0\t\n\f\r\ ]+(\d*\.\d+|\d+)[\0\t\n\f\r\ ]+Tf/;
const getDefaultFontSize = (field) => {
    var _a, _b;
    const da = (_a = field.getDefaultAppearance()) !== null && _a !== void 0 ? _a : '';
    const daMatch = (_b = findLastMatch(da, tfRegex).match) !== null && _b !== void 0 ? _b : [];
    const defaultFontSize = Number(daMatch[2]);
    return isFinite(defaultFontSize) ? defaultFontSize : undefined;
};
// Examples:
//   `0.3 g` -> ['0.3', 'g']
//   `0.3 1 .3 rg` -> ['0.3', '1', '.3', 'rg']
//   `0.3 1 .3 0 k` -> ['0.3', '1', '.3', '0', 'k']
const colorRegex = /(\d*\.\d+|\d+)[\0\t\n\f\r\ ]*(\d*\.\d+|\d+)?[\0\t\n\f\r\ ]*(\d*\.\d+|\d+)?[\0\t\n\f\r\ ]*(\d*\.\d+|\d+)?[\0\t\n\f\r\ ]+(g|rg|k)/;
const getDefaultColor = (field) => {
    var _a;
    const da = (_a = field.getDefaultAppearance()) !== null && _a !== void 0 ? _a : '';
    const daMatch = findLastMatch(da, colorRegex).match;
    const [, c1, c2, c3, c4, colorSpace] = daMatch !== null && daMatch !== void 0 ? daMatch : [];
    if (colorSpace === 'g' && c1) {
        return grayscale(Number(c1));
    }
    if (colorSpace === 'rg' && c1 && c2 && c3) {
        return rgb(Number(c1), Number(c2), Number(c3));
    }
    if (colorSpace === 'k' && c1 && c2 && c3 && c4) {
        return cmyk(Number(c1), Number(c2), Number(c3), Number(c4));
    }
    return undefined;
};
const updateDefaultAppearance = (field, color, font, fontSize = 0) => {
    var _a;
    const da = [
        setFillingColor(color).toString(),
        setFontAndSize((_a = font === null || font === void 0 ? void 0 : font.name) !== null && _a !== void 0 ? _a : 'dummy__noop', fontSize).toString(),
    ].join('\n');
    field.setDefaultAppearance(da);
};
export const defaultCheckBoxAppearanceProvider = (checkBox, widget) => {
    var _a, _b, _c;
    // The `/DA` entry can be at the widget or field level - so we handle both
    const widgetColor = getDefaultColor(widget);
    const fieldColor = getDefaultColor(checkBox.acroField);
    const rectangle = widget.getRectangle();
    const ap = widget.getAppearanceCharacteristics();
    const bs = widget.getBorderStyle();
    const borderWidth = (_a = bs === null || bs === void 0 ? void 0 : bs.getWidth()) !== null && _a !== void 0 ? _a : 0;
    const rotation = reduceRotation(ap === null || ap === void 0 ? void 0 : ap.getRotation());
    const { width, height } = adjustDimsForRotation(rectangle, rotation);
    const rotate = rotateInPlace(Object.assign(Object.assign({}, rectangle), { rotation }));
    const black = rgb(0, 0, 0);
    const borderColor = (_b = componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBorderColor())) !== null && _b !== void 0 ? _b : black;
    const normalBackgroundColor = componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBackgroundColor());
    const downBackgroundColor = componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBackgroundColor(), 0.8);
    // Update color
    const textColor = (_c = widgetColor !== null && widgetColor !== void 0 ? widgetColor : fieldColor) !== null && _c !== void 0 ? _c : black;
    if (widgetColor) {
        updateDefaultAppearance(widget, textColor);
    }
    else {
        updateDefaultAppearance(checkBox.acroField, textColor);
    }
    const options = {
        x: 0 + borderWidth / 2,
        y: 0 + borderWidth / 2,
        width: width - borderWidth,
        height: height - borderWidth,
        thickness: 1.5,
        borderWidth,
        borderColor,
        markColor: textColor,
    };
    return {
        normal: {
            on: [
                ...rotate,
                ...drawCheckBox(Object.assign(Object.assign({}, options), { color: normalBackgroundColor, filled: true })),
            ],
            off: [
                ...rotate,
                ...drawCheckBox(Object.assign(Object.assign({}, options), { color: normalBackgroundColor, filled: false })),
            ],
        },
        down: {
            on: [
                ...rotate,
                ...drawCheckBox(Object.assign(Object.assign({}, options), { color: downBackgroundColor, filled: true })),
            ],
            off: [
                ...rotate,
                ...drawCheckBox(Object.assign(Object.assign({}, options), { color: downBackgroundColor, filled: false })),
            ],
        },
    };
};
export const defaultRadioGroupAppearanceProvider = (radioGroup, widget) => {
    var _a, _b, _c;
    // The `/DA` entry can be at the widget or field level - so we handle both
    const widgetColor = getDefaultColor(widget);
    const fieldColor = getDefaultColor(radioGroup.acroField);
    const rectangle = widget.getRectangle();
    const ap = widget.getAppearanceCharacteristics();
    const bs = widget.getBorderStyle();
    const borderWidth = (_a = bs === null || bs === void 0 ? void 0 : bs.getWidth()) !== null && _a !== void 0 ? _a : 0;
    const rotation = reduceRotation(ap === null || ap === void 0 ? void 0 : ap.getRotation());
    const { width, height } = adjustDimsForRotation(rectangle, rotation);
    const rotate = rotateInPlace(Object.assign(Object.assign({}, rectangle), { rotation }));
    const black = rgb(0, 0, 0);
    const borderColor = (_b = componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBorderColor())) !== null && _b !== void 0 ? _b : black;
    const normalBackgroundColor = componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBackgroundColor());
    const downBackgroundColor = componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBackgroundColor(), 0.8);
    // Update color
    const textColor = (_c = widgetColor !== null && widgetColor !== void 0 ? widgetColor : fieldColor) !== null && _c !== void 0 ? _c : black;
    if (widgetColor) {
        updateDefaultAppearance(widget, textColor);
    }
    else {
        updateDefaultAppearance(radioGroup.acroField, textColor);
    }
    const options = {
        x: width / 2,
        y: height / 2,
        width: width - borderWidth,
        height: height - borderWidth,
        borderWidth,
        borderColor,
        dotColor: textColor,
    };
    return {
        normal: {
            on: [
                ...rotate,
                ...drawRadioButton(Object.assign(Object.assign({}, options), { color: normalBackgroundColor, filled: true })),
            ],
            off: [
                ...rotate,
                ...drawRadioButton(Object.assign(Object.assign({}, options), { color: normalBackgroundColor, filled: false })),
            ],
        },
        down: {
            on: [
                ...rotate,
                ...drawRadioButton(Object.assign(Object.assign({}, options), { color: downBackgroundColor, filled: true })),
            ],
            off: [
                ...rotate,
                ...drawRadioButton(Object.assign(Object.assign({}, options), { color: downBackgroundColor, filled: false })),
            ],
        },
    };
};
export const defaultButtonAppearanceProvider = (button, widget, font) => {
    var _a, _b, _c, _d, _e;
    // The `/DA` entry can be at the widget or field level - so we handle both
    const widgetColor = getDefaultColor(widget);
    const fieldColor = getDefaultColor(button.acroField);
    const widgetFontSize = getDefaultFontSize(widget);
    const fieldFontSize = getDefaultFontSize(button.acroField);
    const rectangle = widget.getRectangle();
    const ap = widget.getAppearanceCharacteristics();
    const bs = widget.getBorderStyle();
    const captions = ap === null || ap === void 0 ? void 0 : ap.getCaptions();
    const normalText = (_a = captions === null || captions === void 0 ? void 0 : captions.normal) !== null && _a !== void 0 ? _a : '';
    const downText = (_c = (_b = captions === null || captions === void 0 ? void 0 : captions.down) !== null && _b !== void 0 ? _b : normalText) !== null && _c !== void 0 ? _c : '';
    const borderWidth = (_d = bs === null || bs === void 0 ? void 0 : bs.getWidth()) !== null && _d !== void 0 ? _d : 0;
    const rotation = reduceRotation(ap === null || ap === void 0 ? void 0 : ap.getRotation());
    const { width, height } = adjustDimsForRotation(rectangle, rotation);
    const rotate = rotateInPlace(Object.assign(Object.assign({}, rectangle), { rotation }));
    const black = rgb(0, 0, 0);
    const borderColor = componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBorderColor());
    const normalBackgroundColor = componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBackgroundColor());
    const downBackgroundColor = componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBackgroundColor(), 0.8);
    const bounds = {
        x: borderWidth,
        y: borderWidth,
        width: width - borderWidth * 2,
        height: height - borderWidth * 2,
    };
    const normalLayout = layoutSinglelineText(normalText, {
        alignment: TextAlignment.Center,
        fontSize: widgetFontSize !== null && widgetFontSize !== void 0 ? widgetFontSize : fieldFontSize,
        font,
        bounds,
    });
    const downLayout = layoutSinglelineText(downText, {
        alignment: TextAlignment.Center,
        fontSize: widgetFontSize !== null && widgetFontSize !== void 0 ? widgetFontSize : fieldFontSize,
        font,
        bounds,
    });
    // Update font size and color
    const fontSize = Math.min(normalLayout.fontSize, downLayout.fontSize);
    const textColor = (_e = widgetColor !== null && widgetColor !== void 0 ? widgetColor : fieldColor) !== null && _e !== void 0 ? _e : black;
    if (widgetColor || widgetFontSize !== undefined) {
        updateDefaultAppearance(widget, textColor, font, fontSize);
    }
    else {
        updateDefaultAppearance(button.acroField, textColor, font, fontSize);
    }
    const options = {
        x: 0 + borderWidth / 2,
        y: 0 + borderWidth / 2,
        width: width - borderWidth,
        height: height - borderWidth,
        borderWidth,
        borderColor,
        textColor,
        font: font.name,
        fontSize,
    };
    return {
        normal: [
            ...rotate,
            ...drawButton(Object.assign(Object.assign({}, options), { color: normalBackgroundColor, textLines: [normalLayout.line] })),
        ],
        down: [
            ...rotate,
            ...drawButton(Object.assign(Object.assign({}, options), { color: downBackgroundColor, textLines: [downLayout.line] })),
        ],
    };
};
export const defaultTextFieldAppearanceProvider = (textField, widget, font) => {
    var _a, _b, _c, _d;
    // The `/DA` entry can be at the widget or field level - so we handle both
    const widgetColor = getDefaultColor(widget);
    const fieldColor = getDefaultColor(textField.acroField);
    const widgetFontSize = getDefaultFontSize(widget);
    const fieldFontSize = getDefaultFontSize(textField.acroField);
    const rectangle = widget.getRectangle();
    const ap = widget.getAppearanceCharacteristics();
    const bs = widget.getBorderStyle();
    const text = (_a = textField.getText()) !== null && _a !== void 0 ? _a : '';
    const borderWidth = (_b = bs === null || bs === void 0 ? void 0 : bs.getWidth()) !== null && _b !== void 0 ? _b : 0;
    const rotation = reduceRotation(ap === null || ap === void 0 ? void 0 : ap.getRotation());
    const { width, height } = adjustDimsForRotation(rectangle, rotation);
    const rotate = rotateInPlace(Object.assign(Object.assign({}, rectangle), { rotation }));
    const black = rgb(0, 0, 0);
    const borderColor = componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBorderColor());
    const normalBackgroundColor = componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBackgroundColor());
    let textLines;
    let fontSize;
    const padding = textField.isCombed() ? 0 : 1;
    const bounds = {
        x: borderWidth + padding,
        y: borderWidth + padding,
        width: width - (borderWidth + padding) * 2,
        height: height - (borderWidth + padding) * 2,
    };
    if (textField.isMultiline()) {
        const layout = layoutMultilineText(text, {
            alignment: textField.getAlignment(),
            fontSize: widgetFontSize !== null && widgetFontSize !== void 0 ? widgetFontSize : fieldFontSize,
            font,
            bounds,
        });
        textLines = layout.lines;
        fontSize = layout.fontSize;
    }
    else if (textField.isCombed()) {
        const layout = layoutCombedText(text, {
            fontSize: widgetFontSize !== null && widgetFontSize !== void 0 ? widgetFontSize : fieldFontSize,
            font,
            bounds,
            cellCount: (_c = textField.getMaxLength()) !== null && _c !== void 0 ? _c : 0,
        });
        textLines = layout.cells;
        fontSize = layout.fontSize;
    }
    else {
        const layout = layoutSinglelineText(text, {
            alignment: textField.getAlignment(),
            fontSize: widgetFontSize !== null && widgetFontSize !== void 0 ? widgetFontSize : fieldFontSize,
            font,
            bounds,
        });
        textLines = [layout.line];
        fontSize = layout.fontSize;
    }
    // Update font size and color
    const textColor = (_d = widgetColor !== null && widgetColor !== void 0 ? widgetColor : fieldColor) !== null && _d !== void 0 ? _d : black;
    if (widgetColor || widgetFontSize !== undefined) {
        updateDefaultAppearance(widget, textColor, font, fontSize);
    }
    else {
        updateDefaultAppearance(textField.acroField, textColor, font, fontSize);
    }
    const options = {
        x: 0 + borderWidth / 2,
        y: 0 + borderWidth / 2,
        width: width - borderWidth,
        height: height - borderWidth,
        borderWidth: borderWidth !== null && borderWidth !== void 0 ? borderWidth : 0,
        borderColor,
        textColor,
        font: font.name,
        fontSize,
        color: normalBackgroundColor,
        textLines,
        padding,
    };
    return [...rotate, ...drawTextField(options)];
};
export const defaultDropdownAppearanceProvider = (dropdown, widget, font) => {
    var _a, _b, _c;
    // The `/DA` entry can be at the widget or field level - so we handle both
    const widgetColor = getDefaultColor(widget);
    const fieldColor = getDefaultColor(dropdown.acroField);
    const widgetFontSize = getDefaultFontSize(widget);
    const fieldFontSize = getDefaultFontSize(dropdown.acroField);
    const rectangle = widget.getRectangle();
    const ap = widget.getAppearanceCharacteristics();
    const bs = widget.getBorderStyle();
    const text = (_a = dropdown.getSelected()[0]) !== null && _a !== void 0 ? _a : '';
    const borderWidth = (_b = bs === null || bs === void 0 ? void 0 : bs.getWidth()) !== null && _b !== void 0 ? _b : 0;
    const rotation = reduceRotation(ap === null || ap === void 0 ? void 0 : ap.getRotation());
    const { width, height } = adjustDimsForRotation(rectangle, rotation);
    const rotate = rotateInPlace(Object.assign(Object.assign({}, rectangle), { rotation }));
    const black = rgb(0, 0, 0);
    const borderColor = componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBorderColor());
    const normalBackgroundColor = componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBackgroundColor());
    const padding = 1;
    const bounds = {
        x: borderWidth + padding,
        y: borderWidth + padding,
        width: width - (borderWidth + padding) * 2,
        height: height - (borderWidth + padding) * 2,
    };
    const { line, fontSize } = layoutSinglelineText(text, {
        alignment: TextAlignment.Left,
        fontSize: widgetFontSize !== null && widgetFontSize !== void 0 ? widgetFontSize : fieldFontSize,
        font,
        bounds,
    });
    // Update font size and color
    const textColor = (_c = widgetColor !== null && widgetColor !== void 0 ? widgetColor : fieldColor) !== null && _c !== void 0 ? _c : black;
    if (widgetColor || widgetFontSize !== undefined) {
        updateDefaultAppearance(widget, textColor, font, fontSize);
    }
    else {
        updateDefaultAppearance(dropdown.acroField, textColor, font, fontSize);
    }
    const options = {
        x: 0 + borderWidth / 2,
        y: 0 + borderWidth / 2,
        width: width - borderWidth,
        height: height - borderWidth,
        borderWidth: borderWidth !== null && borderWidth !== void 0 ? borderWidth : 0,
        borderColor,
        textColor,
        font: font.name,
        fontSize,
        color: normalBackgroundColor,
        textLines: [line],
        padding,
    };
    return [...rotate, ...drawTextField(options)];
};
export const defaultOptionListAppearanceProvider = (optionList, widget, font) => {
    var _a, _b;
    // The `/DA` entry can be at the widget or field level - so we handle both
    const widgetColor = getDefaultColor(widget);
    const fieldColor = getDefaultColor(optionList.acroField);
    const widgetFontSize = getDefaultFontSize(widget);
    const fieldFontSize = getDefaultFontSize(optionList.acroField);
    const rectangle = widget.getRectangle();
    const ap = widget.getAppearanceCharacteristics();
    const bs = widget.getBorderStyle();
    const borderWidth = (_a = bs === null || bs === void 0 ? void 0 : bs.getWidth()) !== null && _a !== void 0 ? _a : 0;
    const rotation = reduceRotation(ap === null || ap === void 0 ? void 0 : ap.getRotation());
    const { width, height } = adjustDimsForRotation(rectangle, rotation);
    const rotate = rotateInPlace(Object.assign(Object.assign({}, rectangle), { rotation }));
    const black = rgb(0, 0, 0);
    const borderColor = componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBorderColor());
    const normalBackgroundColor = componentsToColor(ap === null || ap === void 0 ? void 0 : ap.getBackgroundColor());
    const options = optionList.getOptions();
    const selected = optionList.getSelected();
    if (optionList.isSorted())
        options.sort();
    let text = '';
    for (let idx = 0, len = options.length; idx < len; idx++) {
        text += options[idx];
        if (idx < len - 1)
            text += '\n';
    }
    const padding = 1;
    const bounds = {
        x: borderWidth + padding,
        y: borderWidth + padding,
        width: width - (borderWidth + padding) * 2,
        height: height - (borderWidth + padding) * 2,
    };
    const { lines, fontSize, lineHeight } = layoutMultilineText(text, {
        alignment: TextAlignment.Left,
        fontSize: widgetFontSize !== null && widgetFontSize !== void 0 ? widgetFontSize : fieldFontSize,
        font,
        bounds,
    });
    const selectedLines = [];
    for (let idx = 0, len = lines.length; idx < len; idx++) {
        const line = lines[idx];
        if (selected.includes(line.text))
            selectedLines.push(idx);
    }
    const blue = rgb(153 / 255, 193 / 255, 218 / 255);
    // Update font size and color
    const textColor = (_b = widgetColor !== null && widgetColor !== void 0 ? widgetColor : fieldColor) !== null && _b !== void 0 ? _b : black;
    if (widgetColor || widgetFontSize !== undefined) {
        updateDefaultAppearance(widget, textColor, font, fontSize);
    }
    else {
        updateDefaultAppearance(optionList.acroField, textColor, font, fontSize);
    }
    return [
        ...rotate,
        ...drawOptionList({
            x: 0 + borderWidth / 2,
            y: 0 + borderWidth / 2,
            width: width - borderWidth,
            height: height - borderWidth,
            borderWidth: borderWidth !== null && borderWidth !== void 0 ? borderWidth : 0,
            borderColor,
            textColor,
            font: font.name,
            fontSize,
            color: normalBackgroundColor,
            textLines: lines,
            lineHeight,
            selectedColor: blue,
            selectedLines,
            padding,
        }),
    ];
};
//# sourceMappingURL=appearances.js.map