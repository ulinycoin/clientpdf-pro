"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PDFDict_1 = tslib_1.__importDefault(require("../objects/PDFDict"));
const PDFArray_1 = tslib_1.__importDefault(require("../objects/PDFArray"));
const PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
const PDFAcroNonTerminal_1 = tslib_1.__importDefault(require("./PDFAcroNonTerminal"));
const utils_1 = require("./utils");
class PDFAcroForm {
    constructor(dict) {
        this.dict = dict;
    }
    Fields() {
        const fields = this.dict.lookup(PDFName_1.default.of('Fields'));
        if (fields instanceof PDFArray_1.default)
            return fields;
        return undefined;
    }
    getFields() {
        const { Fields } = this.normalizedEntries();
        const fields = new Array(Fields.size());
        for (let idx = 0, len = Fields.size(); idx < len; idx++) {
            const ref = Fields.get(idx);
            const dict = Fields.lookup(idx, PDFDict_1.default);
            fields[idx] = [(0, utils_1.createPDFAcroField)(dict, ref), ref];
        }
        return fields;
    }
    getAllFields() {
        const allFields = [];
        const pushFields = (fields) => {
            if (!fields)
                return;
            for (let idx = 0, len = fields.length; idx < len; idx++) {
                const field = fields[idx];
                allFields.push(field);
                const [fieldModel] = field;
                if (fieldModel instanceof PDFAcroNonTerminal_1.default) {
                    pushFields((0, utils_1.createPDFAcroFields)(fieldModel.Kids()));
                }
            }
        };
        pushFields(this.getFields());
        return allFields;
    }
    addField(field) {
        const { Fields } = this.normalizedEntries();
        Fields === null || Fields === void 0 ? void 0 : Fields.push(field);
    }
    removeField(field) {
        const parent = field.getParent();
        const fields = parent === undefined ? this.normalizedEntries().Fields : parent.Kids();
        const index = fields === null || fields === void 0 ? void 0 : fields.indexOf(field.ref);
        if (fields === undefined || index === undefined) {
            throw new Error(`Tried to remove inexistent field ${field.getFullyQualifiedName()}`);
        }
        fields.remove(index);
        if (parent !== undefined && fields.size() === 0) {
            this.removeField(parent);
        }
    }
    normalizedEntries() {
        let Fields = this.Fields();
        if (!Fields) {
            Fields = this.dict.context.obj([]);
            this.dict.set(PDFName_1.default.of('Fields'), Fields);
        }
        return { Fields };
    }
}
PDFAcroForm.fromDict = (dict) => new PDFAcroForm(dict);
PDFAcroForm.create = (context) => {
    const dict = context.obj({ Fields: [] });
    return new PDFAcroForm(dict);
};
exports.default = PDFAcroForm;
//# sourceMappingURL=PDFAcroForm.js.map