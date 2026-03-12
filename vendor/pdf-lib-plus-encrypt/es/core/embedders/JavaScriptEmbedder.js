import { __awaiter } from "tslib";
import PDFHexString from "../objects/PDFHexString";
class JavaScriptEmbedder {
    constructor(script, scriptName) {
        this.script = script;
        this.scriptName = scriptName;
    }
    static for(script, scriptName) {
        return new JavaScriptEmbedder(script, scriptName);
    }
    embedIntoContext(context, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            const jsActionDict = context.obj({
                Type: 'Action',
                S: 'JavaScript',
                JS: PDFHexString.fromText(this.script),
            });
            if (ref) {
                context.assign(ref, jsActionDict);
                return ref;
            }
            else {
                return context.register(jsActionDict);
            }
        });
    }
}
export default JavaScriptEmbedder;
//# sourceMappingURL=JavaScriptEmbedder.js.map