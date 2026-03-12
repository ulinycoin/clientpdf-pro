"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawOptionList = exports.drawTextField = exports.drawTextLines = exports.drawButton = exports.drawRadioButton = exports.drawCheckBox = exports.rotateInPlace = exports.drawCheckMark = exports.drawSvgPath = exports.drawEllipse = exports.drawEllipsePath = exports.drawRectangle = exports.drawLine = exports.drawPage = exports.drawImage = exports.drawLinesOfText = exports.drawText = void 0;
const colors_1 = require("./colors");
const operators_1 = require("./operators");
const rotations_1 = require("./rotations");
const svgPath_1 = require("./svgPath");
const objects_1 = require("./objects");
const drawText = (line, options) => [
    (0, operators_1.pushGraphicsState)(),
    options.graphicsState && (0, operators_1.setGraphicsState)(options.graphicsState),
    (0, operators_1.beginText)(),
    (0, colors_1.setFillingColor)(options.color),
    (0, operators_1.setFontAndSize)(options.font, options.size),
    (0, operators_1.rotateAndSkewTextRadiansAndTranslate)((0, rotations_1.toRadians)(options.rotate), (0, rotations_1.toRadians)(options.xSkew), (0, rotations_1.toRadians)(options.ySkew), options.x, options.y),
    (0, operators_1.showText)(line),
    (0, operators_1.endText)(),
    (0, operators_1.popGraphicsState)(),
].filter(Boolean);
exports.drawText = drawText;
const drawLinesOfText = (lines, options) => {
    const operators = [
        (0, operators_1.pushGraphicsState)(),
        options.graphicsState && (0, operators_1.setGraphicsState)(options.graphicsState),
        (0, operators_1.beginText)(),
        (0, colors_1.setFillingColor)(options.color),
        (0, operators_1.setFontAndSize)(options.font, options.size),
        (0, operators_1.setLineHeight)(options.lineHeight),
        (0, operators_1.rotateAndSkewTextRadiansAndTranslate)((0, rotations_1.toRadians)(options.rotate), (0, rotations_1.toRadians)(options.xSkew), (0, rotations_1.toRadians)(options.ySkew), options.x, options.y),
    ].filter(Boolean);
    for (let idx = 0, len = lines.length; idx < len; idx++) {
        operators.push((0, operators_1.showText)(lines[idx]), (0, operators_1.nextLine)());
    }
    operators.push((0, operators_1.endText)(), (0, operators_1.popGraphicsState)());
    return operators;
};
exports.drawLinesOfText = drawLinesOfText;
const drawImage = (name, options) => [
    (0, operators_1.pushGraphicsState)(),
    options.graphicsState && (0, operators_1.setGraphicsState)(options.graphicsState),
    (0, operators_1.translate)(options.x, options.y),
    (0, operators_1.rotateRadians)((0, rotations_1.toRadians)(options.rotate)),
    (0, operators_1.scale)(options.width, options.height),
    (0, operators_1.skewRadians)((0, rotations_1.toRadians)(options.xSkew), (0, rotations_1.toRadians)(options.ySkew)),
    (0, operators_1.drawObject)(name),
    (0, operators_1.popGraphicsState)(),
].filter(Boolean);
exports.drawImage = drawImage;
const drawPage = (name, options) => [
    (0, operators_1.pushGraphicsState)(),
    options.graphicsState && (0, operators_1.setGraphicsState)(options.graphicsState),
    (0, operators_1.translate)(options.x, options.y),
    (0, operators_1.rotateRadians)((0, rotations_1.toRadians)(options.rotate)),
    (0, operators_1.scale)(options.xScale, options.yScale),
    (0, operators_1.skewRadians)((0, rotations_1.toRadians)(options.xSkew), (0, rotations_1.toRadians)(options.ySkew)),
    (0, operators_1.drawObject)(name),
    (0, operators_1.popGraphicsState)(),
].filter(Boolean);
exports.drawPage = drawPage;
const drawLine = (options) => {
    var _a, _b;
    return [
        (0, operators_1.pushGraphicsState)(),
        options.graphicsState && (0, operators_1.setGraphicsState)(options.graphicsState),
        options.color && (0, colors_1.setStrokingColor)(options.color),
        (0, operators_1.setLineWidth)(options.thickness),
        (0, operators_1.setDashPattern)((_a = options.dashArray) !== null && _a !== void 0 ? _a : [], (_b = options.dashPhase) !== null && _b !== void 0 ? _b : 0),
        (0, operators_1.moveTo)(options.start.x, options.start.y),
        options.lineCap && (0, operators_1.setLineCap)(options.lineCap),
        (0, operators_1.moveTo)(options.start.x, options.start.y),
        (0, operators_1.lineTo)(options.end.x, options.end.y),
        (0, operators_1.stroke)(),
        (0, operators_1.popGraphicsState)(),
    ].filter(Boolean);
};
exports.drawLine = drawLine;
const drawRectangle = (options) => {
    var _a, _b;
    return [
        (0, operators_1.pushGraphicsState)(),
        options.graphicsState && (0, operators_1.setGraphicsState)(options.graphicsState),
        options.color && (0, colors_1.setFillingColor)(options.color),
        options.borderColor && (0, colors_1.setStrokingColor)(options.borderColor),
        (0, operators_1.setLineWidth)(options.borderWidth),
        options.borderLineCap && (0, operators_1.setLineCap)(options.borderLineCap),
        (0, operators_1.setDashPattern)((_a = options.borderDashArray) !== null && _a !== void 0 ? _a : [], (_b = options.borderDashPhase) !== null && _b !== void 0 ? _b : 0),
        (0, operators_1.translate)(options.x, options.y),
        (0, operators_1.rotateRadians)((0, rotations_1.toRadians)(options.rotate)),
        (0, operators_1.skewRadians)((0, rotations_1.toRadians)(options.xSkew), (0, rotations_1.toRadians)(options.ySkew)),
        (0, operators_1.moveTo)(0, 0),
        (0, operators_1.lineTo)(0, options.height),
        (0, operators_1.lineTo)(options.width, options.height),
        (0, operators_1.lineTo)(options.width, 0),
        (0, operators_1.closePath)(),
        // prettier-ignore
        options.color && options.borderWidth ? (0, operators_1.fillAndStroke)()
            : options.color ? (0, operators_1.fill)()
                : options.borderColor ? (0, operators_1.stroke)()
                    : (0, operators_1.closePath)(),
        (0, operators_1.popGraphicsState)(),
    ].filter(Boolean);
};
exports.drawRectangle = drawRectangle;
const KAPPA = 4.0 * ((Math.sqrt(2) - 1.0) / 3.0);
/** @deprecated */
const drawEllipsePath = (config) => {
    let x = (0, objects_1.asNumber)(config.x);
    let y = (0, objects_1.asNumber)(config.y);
    const xScale = (0, objects_1.asNumber)(config.xScale);
    const yScale = (0, objects_1.asNumber)(config.yScale);
    x -= xScale;
    y -= yScale;
    const ox = xScale * KAPPA;
    const oy = yScale * KAPPA;
    const xe = x + xScale * 2;
    const ye = y + yScale * 2;
    const xm = x + xScale;
    const ym = y + yScale;
    return [
        (0, operators_1.pushGraphicsState)(),
        (0, operators_1.moveTo)(x, ym),
        (0, operators_1.appendBezierCurve)(x, ym - oy, xm - ox, y, xm, y),
        (0, operators_1.appendBezierCurve)(xm + ox, y, xe, ym - oy, xe, ym),
        (0, operators_1.appendBezierCurve)(xe, ym + oy, xm + ox, ye, xm, ye),
        (0, operators_1.appendBezierCurve)(xm - ox, ye, x, ym + oy, x, ym),
        (0, operators_1.popGraphicsState)(),
    ];
};
exports.drawEllipsePath = drawEllipsePath;
const drawEllipseCurves = (config) => {
    const centerX = (0, objects_1.asNumber)(config.x);
    const centerY = (0, objects_1.asNumber)(config.y);
    const xScale = (0, objects_1.asNumber)(config.xScale);
    const yScale = (0, objects_1.asNumber)(config.yScale);
    const x = -xScale;
    const y = -yScale;
    const ox = xScale * KAPPA;
    const oy = yScale * KAPPA;
    const xe = x + xScale * 2;
    const ye = y + yScale * 2;
    const xm = x + xScale;
    const ym = y + yScale;
    return [
        (0, operators_1.translate)(centerX, centerY),
        (0, operators_1.rotateRadians)((0, rotations_1.toRadians)(config.rotate)),
        (0, operators_1.moveTo)(x, ym),
        (0, operators_1.appendBezierCurve)(x, ym - oy, xm - ox, y, xm, y),
        (0, operators_1.appendBezierCurve)(xm + ox, y, xe, ym - oy, xe, ym),
        (0, operators_1.appendBezierCurve)(xe, ym + oy, xm + ox, ye, xm, ye),
        (0, operators_1.appendBezierCurve)(xm - ox, ye, x, ym + oy, x, ym),
    ];
};
const drawEllipse = (options) => {
    var _a, _b, _c;
    return [
        (0, operators_1.pushGraphicsState)(),
        options.graphicsState && (0, operators_1.setGraphicsState)(options.graphicsState),
        options.color && (0, colors_1.setFillingColor)(options.color),
        options.borderColor && (0, colors_1.setStrokingColor)(options.borderColor),
        (0, operators_1.setLineWidth)(options.borderWidth),
        options.borderLineCap && (0, operators_1.setLineCap)(options.borderLineCap),
        (0, operators_1.setDashPattern)((_a = options.borderDashArray) !== null && _a !== void 0 ? _a : [], (_b = options.borderDashPhase) !== null && _b !== void 0 ? _b : 0),
        // The `drawEllipsePath` branch is only here for backwards compatibility.
        // See https://github.com/brennanmcquerry/pdf-lib-plus-encrypt/pull/511#issuecomment-667685655.
        ...(options.rotate === undefined
            ? (0, exports.drawEllipsePath)({
                x: options.x,
                y: options.y,
                xScale: options.xScale,
                yScale: options.yScale,
            })
            : drawEllipseCurves({
                x: options.x,
                y: options.y,
                xScale: options.xScale,
                yScale: options.yScale,
                rotate: (_c = options.rotate) !== null && _c !== void 0 ? _c : (0, rotations_1.degrees)(0),
            })),
        // prettier-ignore
        options.color && options.borderWidth ? (0, operators_1.fillAndStroke)()
            : options.color ? (0, operators_1.fill)()
                : options.borderColor ? (0, operators_1.stroke)()
                    : (0, operators_1.closePath)(),
        (0, operators_1.popGraphicsState)(),
    ].filter(Boolean);
};
exports.drawEllipse = drawEllipse;
const drawSvgPath = (path, options) => {
    var _a, _b, _c;
    return [
        (0, operators_1.pushGraphicsState)(),
        options.graphicsState && (0, operators_1.setGraphicsState)(options.graphicsState),
        (0, operators_1.translate)(options.x, options.y),
        (0, operators_1.rotateRadians)((0, rotations_1.toRadians)((_a = options.rotate) !== null && _a !== void 0 ? _a : (0, rotations_1.degrees)(0))),
        // SVG path Y axis is opposite pdf-lib's
        options.scale ? (0, operators_1.scale)(options.scale, -options.scale) : (0, operators_1.scale)(1, -1),
        options.color && (0, colors_1.setFillingColor)(options.color),
        options.borderColor && (0, colors_1.setStrokingColor)(options.borderColor),
        options.borderWidth && (0, operators_1.setLineWidth)(options.borderWidth),
        options.borderLineCap && (0, operators_1.setLineCap)(options.borderLineCap),
        (0, operators_1.setDashPattern)((_b = options.borderDashArray) !== null && _b !== void 0 ? _b : [], (_c = options.borderDashPhase) !== null && _c !== void 0 ? _c : 0),
        ...(0, svgPath_1.svgPathToOperators)(path),
        // prettier-ignore
        options.color && options.borderWidth ? (0, operators_1.fillAndStroke)()
            : options.color ? (0, operators_1.fill)()
                : options.borderColor ? (0, operators_1.stroke)()
                    : (0, operators_1.closePath)(),
        (0, operators_1.popGraphicsState)(),
    ].filter(Boolean);
};
exports.drawSvgPath = drawSvgPath;
const drawCheckMark = (options) => {
    const size = (0, objects_1.asNumber)(options.size);
    /*********************** Define Check Mark Points ***************************/
    // A check mark is defined by three points in some coordinate space. Here, we
    // define these points in a unit coordinate system, where the range of the x
    // and y axis are both [-1, 1].
    //
    // Note that we do not hard code `p1y` in case we wish to change the
    // size/shape of the check mark in the future. We want the check mark to
    // always form a right angle. This means that the dot product between (p1-p2)
    // and (p3-p2) should be zero:
    //
    //   (p1x-p2x) * (p3x-p2x) + (p1y-p2y) * (p3y-p2y) = 0
    //
    // We can now rejigger this equation to solve for `p1y`:
    //
    //   (p1y-p2y) * (p3y-p2y) = -((p1x-p2x) * (p3x-p2x))
    //   (p1y-p2y) = -((p1x-p2x) * (p3x-p2x)) / (p3y-p2y)
    //   p1y = -((p1x-p2x) * (p3x-p2x)) / (p3y-p2y) + p2y
    //
    // Thanks to my friend Joel Walker (https://github.com/JWalker1995) for
    // devising the above equation and unit coordinate system approach!
    // (x, y) coords of the check mark's bottommost point
    const p2x = -1 + 0.75;
    const p2y = -1 + 0.51;
    // (x, y) coords of the check mark's topmost point
    const p3y = 1 - 0.525;
    const p3x = 1 - 0.31;
    // (x, y) coords of the check mark's center (vertically) point
    const p1x = -1 + 0.325;
    const p1y = -((p1x - p2x) * (p3x - p2x)) / (p3y - p2y) + p2y;
    /****************************************************************************/
    return [
        (0, operators_1.pushGraphicsState)(),
        options.color && (0, colors_1.setStrokingColor)(options.color),
        (0, operators_1.setLineWidth)(options.thickness),
        (0, operators_1.translate)(options.x, options.y),
        (0, operators_1.moveTo)(p1x * size, p1y * size),
        (0, operators_1.lineTo)(p2x * size, p2y * size),
        (0, operators_1.lineTo)(p3x * size, p3y * size),
        (0, operators_1.stroke)(),
        (0, operators_1.popGraphicsState)(),
    ].filter(Boolean);
};
exports.drawCheckMark = drawCheckMark;
// prettier-ignore
const rotateInPlace = (options) => options.rotation === 0 ? [
    (0, operators_1.translate)(0, 0),
    (0, operators_1.rotateDegrees)(0)
]
    : options.rotation === 90 ? [
        (0, operators_1.translate)(options.width, 0),
        (0, operators_1.rotateDegrees)(90)
    ]
        : options.rotation === 180 ? [
            (0, operators_1.translate)(options.width, options.height),
            (0, operators_1.rotateDegrees)(180)
        ]
            : options.rotation === 270 ? [
                (0, operators_1.translate)(0, options.height),
                (0, operators_1.rotateDegrees)(270)
            ]
                : []; // Invalid rotation - noop
exports.rotateInPlace = rotateInPlace;
const drawCheckBox = (options) => {
    const outline = (0, exports.drawRectangle)({
        x: options.x,
        y: options.y,
        width: options.width,
        height: options.height,
        borderWidth: options.borderWidth,
        color: options.color,
        borderColor: options.borderColor,
        rotate: (0, rotations_1.degrees)(0),
        xSkew: (0, rotations_1.degrees)(0),
        ySkew: (0, rotations_1.degrees)(0),
    });
    if (!options.filled)
        return outline;
    const width = (0, objects_1.asNumber)(options.width);
    const height = (0, objects_1.asNumber)(options.height);
    const checkMarkSize = Math.min(width, height) / 2;
    const checkMark = (0, exports.drawCheckMark)({
        x: width / 2,
        y: height / 2,
        size: checkMarkSize,
        thickness: options.thickness,
        color: options.markColor,
    });
    return [(0, operators_1.pushGraphicsState)(), ...outline, ...checkMark, (0, operators_1.popGraphicsState)()];
};
exports.drawCheckBox = drawCheckBox;
const drawRadioButton = (options) => {
    const width = (0, objects_1.asNumber)(options.width);
    const height = (0, objects_1.asNumber)(options.height);
    const outlineScale = Math.min(width, height) / 2;
    const outline = (0, exports.drawEllipse)({
        x: options.x,
        y: options.y,
        xScale: outlineScale,
        yScale: outlineScale,
        color: options.color,
        borderColor: options.borderColor,
        borderWidth: options.borderWidth,
    });
    if (!options.filled)
        return outline;
    const dot = (0, exports.drawEllipse)({
        x: options.x,
        y: options.y,
        xScale: outlineScale * 0.45,
        yScale: outlineScale * 0.45,
        color: options.dotColor,
        borderColor: undefined,
        borderWidth: 0,
    });
    return [(0, operators_1.pushGraphicsState)(), ...outline, ...dot, (0, operators_1.popGraphicsState)()];
};
exports.drawRadioButton = drawRadioButton;
const drawButton = (options) => {
    const x = (0, objects_1.asNumber)(options.x);
    const y = (0, objects_1.asNumber)(options.y);
    const width = (0, objects_1.asNumber)(options.width);
    const height = (0, objects_1.asNumber)(options.height);
    const background = (0, exports.drawRectangle)({
        x,
        y,
        width,
        height,
        borderWidth: options.borderWidth,
        color: options.color,
        borderColor: options.borderColor,
        rotate: (0, rotations_1.degrees)(0),
        xSkew: (0, rotations_1.degrees)(0),
        ySkew: (0, rotations_1.degrees)(0),
    });
    const lines = (0, exports.drawTextLines)(options.textLines, {
        color: options.textColor,
        font: options.font,
        size: options.fontSize,
        rotate: (0, rotations_1.degrees)(0),
        xSkew: (0, rotations_1.degrees)(0),
        ySkew: (0, rotations_1.degrees)(0),
    });
    return [(0, operators_1.pushGraphicsState)(), ...background, ...lines, (0, operators_1.popGraphicsState)()];
};
exports.drawButton = drawButton;
const drawTextLines = (lines, options) => {
    const operators = [
        (0, operators_1.beginText)(),
        (0, colors_1.setFillingColor)(options.color),
        (0, operators_1.setFontAndSize)(options.font, options.size),
    ];
    for (let idx = 0, len = lines.length; idx < len; idx++) {
        const { encoded, x, y } = lines[idx];
        operators.push((0, operators_1.rotateAndSkewTextRadiansAndTranslate)((0, rotations_1.toRadians)(options.rotate), (0, rotations_1.toRadians)(options.xSkew), (0, rotations_1.toRadians)(options.ySkew), x, y), (0, operators_1.showText)(encoded));
    }
    operators.push((0, operators_1.endText)());
    return operators;
};
exports.drawTextLines = drawTextLines;
const drawTextField = (options) => {
    const x = (0, objects_1.asNumber)(options.x);
    const y = (0, objects_1.asNumber)(options.y);
    const width = (0, objects_1.asNumber)(options.width);
    const height = (0, objects_1.asNumber)(options.height);
    const borderWidth = (0, objects_1.asNumber)(options.borderWidth);
    const padding = (0, objects_1.asNumber)(options.padding);
    const clipX = x + borderWidth / 2 + padding;
    const clipY = y + borderWidth / 2 + padding;
    const clipWidth = width - (borderWidth / 2 + padding) * 2;
    const clipHeight = height - (borderWidth / 2 + padding) * 2;
    const clippingArea = [
        (0, operators_1.moveTo)(clipX, clipY),
        (0, operators_1.lineTo)(clipX, clipY + clipHeight),
        (0, operators_1.lineTo)(clipX + clipWidth, clipY + clipHeight),
        (0, operators_1.lineTo)(clipX + clipWidth, clipY),
        (0, operators_1.closePath)(),
        (0, operators_1.clip)(),
        (0, operators_1.endPath)(),
    ];
    const background = (0, exports.drawRectangle)({
        x,
        y,
        width,
        height,
        borderWidth: options.borderWidth,
        color: options.color,
        borderColor: options.borderColor,
        rotate: (0, rotations_1.degrees)(0),
        xSkew: (0, rotations_1.degrees)(0),
        ySkew: (0, rotations_1.degrees)(0),
    });
    const lines = (0, exports.drawTextLines)(options.textLines, {
        color: options.textColor,
        font: options.font,
        size: options.fontSize,
        rotate: (0, rotations_1.degrees)(0),
        xSkew: (0, rotations_1.degrees)(0),
        ySkew: (0, rotations_1.degrees)(0),
    });
    const markedContent = [
        (0, operators_1.beginMarkedContent)('Tx'),
        (0, operators_1.pushGraphicsState)(),
        ...lines,
        (0, operators_1.popGraphicsState)(),
        (0, operators_1.endMarkedContent)(),
    ];
    return [
        (0, operators_1.pushGraphicsState)(),
        ...background,
        ...clippingArea,
        ...markedContent,
        (0, operators_1.popGraphicsState)(),
    ];
};
exports.drawTextField = drawTextField;
const drawOptionList = (options) => {
    const x = (0, objects_1.asNumber)(options.x);
    const y = (0, objects_1.asNumber)(options.y);
    const width = (0, objects_1.asNumber)(options.width);
    const height = (0, objects_1.asNumber)(options.height);
    const lineHeight = (0, objects_1.asNumber)(options.lineHeight);
    const borderWidth = (0, objects_1.asNumber)(options.borderWidth);
    const padding = (0, objects_1.asNumber)(options.padding);
    const clipX = x + borderWidth / 2 + padding;
    const clipY = y + borderWidth / 2 + padding;
    const clipWidth = width - (borderWidth / 2 + padding) * 2;
    const clipHeight = height - (borderWidth / 2 + padding) * 2;
    const clippingArea = [
        (0, operators_1.moveTo)(clipX, clipY),
        (0, operators_1.lineTo)(clipX, clipY + clipHeight),
        (0, operators_1.lineTo)(clipX + clipWidth, clipY + clipHeight),
        (0, operators_1.lineTo)(clipX + clipWidth, clipY),
        (0, operators_1.closePath)(),
        (0, operators_1.clip)(),
        (0, operators_1.endPath)(),
    ];
    const background = (0, exports.drawRectangle)({
        x,
        y,
        width,
        height,
        borderWidth: options.borderWidth,
        color: options.color,
        borderColor: options.borderColor,
        rotate: (0, rotations_1.degrees)(0),
        xSkew: (0, rotations_1.degrees)(0),
        ySkew: (0, rotations_1.degrees)(0),
    });
    const highlights = [];
    for (let idx = 0, len = options.selectedLines.length; idx < len; idx++) {
        const line = options.textLines[options.selectedLines[idx]];
        highlights.push(...(0, exports.drawRectangle)({
            x: line.x - padding,
            y: line.y - (lineHeight - line.height) / 2,
            width: width - borderWidth,
            height: line.height + (lineHeight - line.height) / 2,
            borderWidth: 0,
            color: options.selectedColor,
            borderColor: undefined,
            rotate: (0, rotations_1.degrees)(0),
            xSkew: (0, rotations_1.degrees)(0),
            ySkew: (0, rotations_1.degrees)(0),
        }));
    }
    const lines = (0, exports.drawTextLines)(options.textLines, {
        color: options.textColor,
        font: options.font,
        size: options.fontSize,
        rotate: (0, rotations_1.degrees)(0),
        xSkew: (0, rotations_1.degrees)(0),
        ySkew: (0, rotations_1.degrees)(0),
    });
    const markedContent = [
        (0, operators_1.beginMarkedContent)('Tx'),
        (0, operators_1.pushGraphicsState)(),
        ...lines,
        (0, operators_1.popGraphicsState)(),
        (0, operators_1.endMarkedContent)(),
    ];
    return [
        (0, operators_1.pushGraphicsState)(),
        ...background,
        ...highlights,
        ...clippingArea,
        ...markedContent,
        (0, operators_1.popGraphicsState)(),
    ];
};
exports.drawOptionList = drawOptionList;
//# sourceMappingURL=operations.js.map