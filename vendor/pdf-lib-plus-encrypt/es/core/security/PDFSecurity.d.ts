import * as CryptoJS from './crypto-js';
import PDFDocument from "../../api/PDFDocument";
import PDFDict from '../objects/PDFDict';
import { LiteralObject } from '../PDFContext';
declare type WordArray = CryptoJS.lib.WordArray;
/**
 * Interface representing type of user permission
 * @interface UserPermission
 */
interface UserPermission {
    /**
     * Printing Permission
     * For Security handlers of revision <= 2 : Boolean
     * For Security handlers of revision >= 3 : 'lowResolution' or 'highResolution'
     */
    printing?: boolean | 'lowResolution' | 'highResolution';
    /**
     * Modify Content Permission (Other than 'annotating', 'fillingForms' and 'documentAssembly')
     */
    modifying?: boolean;
    /** Copy or otherwise extract text and graphics from document */
    copying?: boolean;
    /** Permission to add or modify text annotations */
    annotating?: boolean;
    /**
     * Security handlers of revision >= 3
     * Fill in existing interactive form fields (including signature fields)
     */
    fillingForms?: boolean;
    /**
     * Security handlers of revision >= 3
     * Extract text and graphics (in support of accessibility to users with disabilities or for other purposes)
     */
    contentAccessibility?: boolean;
    /**
     * Security handlers of revision >= 3
     * Assemble the document (insert, rotate or delete pages and create bookmarks or thumbnail images)
     */
    documentAssembly?: boolean;
}
export declare type EncryptFn = (buffer: Uint8Array) => Uint8Array;
/**
 * Interface option for security
 * @interface SecurityOption
 */
export interface SecurityOption {
    /**
     * Password that provide unlimited access to the encrypted document.
     *
     * Opening encrypted document with owner password allow full (owner) access to the document
     */
    ownerPassword?: string;
    /** Password that restrict reader according to defined permissions
     *
     * Opening encrypted document with user password will have limitations in accordance to the permission defined.
     */
    userPassword: string;
    /** Object representing type of user permission enforced on the document
     * @link {@link UserPermission}
     */
    permissions?: UserPermission;
    /** Version of PDF, string of '1.x' */
    pdfVersion?: string;
}
interface StdCF {
    AuthEvent: 'DocOpen';
    CFM: 'AESV2' | 'AESV3';
    Length: number;
}
interface CF {
    StdCF: StdCF;
}
declare type EncDictV = 1 | 2 | 4 | 5;
declare type EncDictR = 2 | 3 | 4 | 5;
declare type EncKeyBits = 40 | 128 | 256;
interface EncDict extends LiteralObject {
    R: EncDictR;
    O: Uint8Array;
    U: Uint8Array;
    P: number;
    V: EncDictV;
    Filter: 'Standard';
}
export interface EncDictV1V2V4 extends EncDict {
    Length?: number;
    CF?: CF;
    StmF?: string;
    StrF?: string;
}
export interface EncDictV5 extends EncDict {
    OE: Uint8Array;
    UE: Uint8Array;
    Perms: Uint8Array;
    Length?: number;
    CF: CF;
    StmF: 'StdCF';
    StrF: 'StdCF';
}
declare class PDFSecurity {
    document: PDFDocument;
    version: EncDictV;
    dictionary: EncDictV5 | EncDictV1V2V4;
    keyBits: EncKeyBits;
    encryptionKey: WordArray;
    id: Uint8Array;
    static generateFileID(info: PDFDict): Uint8Array;
    static generateRandomWordArray(bytes: number): WordArray;
    static create(document: PDFDocument, options?: SecurityOption): PDFSecurity;
    constructor(document: PDFDocument, options?: SecurityOption);
    _setupEncryption(options: SecurityOption): void;
    _setupEncryptionV1V2V4(v: EncDictV, options: SecurityOption): EncDictV1V2V4;
    _setupEncryptionV5(options: SecurityOption): EncDictV5;
    getEncryptFn(obj: number, gen: number): (buffer: Uint8Array) => Uint8Array;
}
export default PDFSecurity;
//# sourceMappingURL=PDFSecurity.d.ts.map