"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Cache {
    constructor(populate) {
        this.populate = populate;
        this.value = undefined;
    }
    getValue() {
        return this.value;
    }
    access() {
        if (!this.value)
            this.value = this.populate();
        return this.value;
    }
    invalidate() {
        this.value = undefined;
    }
}
Cache.populatedBy = (populate) => new Cache(populate);
exports.default = Cache;
//# sourceMappingURL=Cache.js.map