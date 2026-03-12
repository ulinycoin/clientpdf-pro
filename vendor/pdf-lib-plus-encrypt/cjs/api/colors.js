"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colorToComponents = exports.componentsToColor = exports.setStrokingColor = exports.setFillingColor = exports.cmyk = exports.rgb = exports.grayscale = exports.ColorTypes = void 0;
const operators_1 = require("./operators");
const utils_1 = require("../utils");
var ColorTypes;
(function (ColorTypes) {
    ColorTypes["Grayscale"] = "Grayscale";
    ColorTypes["RGB"] = "RGB";
    ColorTypes["CMYK"] = "CMYK";
})(ColorTypes = exports.ColorTypes || (exports.ColorTypes = {}));
const grayscale = (gray) => {
    (0, utils_1.assertRange)(gray, 'gray', 0.0, 1.0);
    return { type: ColorTypes.Grayscale, gray };
};
exports.grayscale = grayscale;
const rgb = (red, green, blue) => {
    (0, utils_1.assertRange)(red, 'red', 0, 1);
    (0, utils_1.assertRange)(green, 'green', 0, 1);
    (0, utils_1.assertRange)(blue, 'blue', 0, 1);
    return { type: ColorTypes.RGB, red, green, blue };
};
exports.rgb = rgb;
const cmyk = (cyan, magenta, yellow, key) => {
    (0, utils_1.assertRange)(cyan, 'cyan', 0, 1);
    (0, utils_1.assertRange)(magenta, 'magenta', 0, 1);
    (0, utils_1.assertRange)(yellow, 'yellow', 0, 1);
    (0, utils_1.assertRange)(key, 'key', 0, 1);
    return { type: ColorTypes.CMYK, cyan, magenta, yellow, key };
};
exports.cmyk = cmyk;
const { Grayscale, RGB, CMYK } = ColorTypes;
// prettier-ignore
const setFillingColor = (color) => color.type === Grayscale ? (0, operators_1.setFillingGrayscaleColor)(color.gray)
    : color.type === RGB ? (0, operators_1.setFillingRgbColor)(color.red, color.green, color.blue)
        : color.type === CMYK ? (0, operators_1.setFillingCmykColor)(color.cyan, color.magenta, color.yellow, color.key)
            : (0, utils_1.error)(`Invalid color: ${JSON.stringify(color)}`);
exports.setFillingColor = setFillingColor;
// prettier-ignore
const setStrokingColor = (color) => color.type === Grayscale ? (0, operators_1.setStrokingGrayscaleColor)(color.gray)
    : color.type === RGB ? (0, operators_1.setStrokingRgbColor)(color.red, color.green, color.blue)
        : color.type === CMYK ? (0, operators_1.setStrokingCmykColor)(color.cyan, color.magenta, color.yellow, color.key)
            : (0, utils_1.error)(`Invalid color: ${JSON.stringify(color)}`);
exports.setStrokingColor = setStrokingColor;
// prettier-ignore
const componentsToColor = (comps, scale = 1) => ((comps === null || comps === void 0 ? void 0 : comps.length) === 1 ? (0, exports.grayscale)(comps[0] * scale)
    : (comps === null || comps === void 0 ? void 0 : comps.length) === 3 ? (0, exports.rgb)(comps[0] * scale, comps[1] * scale, comps[2] * scale)
        : (comps === null || comps === void 0 ? void 0 : comps.length) === 4 ? (0, exports.cmyk)(comps[0] * scale, comps[1] * scale, comps[2] * scale, comps[3] * scale)
            : undefined);
exports.componentsToColor = componentsToColor;
// prettier-ignore
const colorToComponents = (color) => color.type === Grayscale ? [color.gray]
    : color.type === RGB ? [color.red, color.green, color.blue]
        : color.type === CMYK ? [color.cyan, color.magenta, color.yellow, color.key]
            : (0, utils_1.error)(`Invalid color: ${JSON.stringify(color)}`);
exports.colorToComponents = colorToComponents;
//# sourceMappingURL=colors.js.map