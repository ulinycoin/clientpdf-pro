declare class PDFHeader {
    static forVersion: (major: number, minor: number) => PDFHeader;
    private readonly major;
    private readonly minor;
    private constructor();
    getVersion(): string;
    toString(): string;
    sizeInBytes(): number;
    copyBytesInto(buffer: Uint8Array, offset: number): number;
}
export default PDFHeader;
//# sourceMappingURL=PDFHeader.d.ts.map