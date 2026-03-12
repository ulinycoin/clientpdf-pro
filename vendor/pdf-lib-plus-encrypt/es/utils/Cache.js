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
export default Cache;
//# sourceMappingURL=Cache.js.map