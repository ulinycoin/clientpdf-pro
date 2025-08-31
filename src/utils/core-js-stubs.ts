// Comprehensive core-js stubs to resolve all internals modules
// This file provides fallback implementations for problematic core-js internal modules

// Global and environment stubs
export const defineGlobalThisProperty = globalThis;
export const globalThisStub = globalThis;
export const createNonEnumerable = () => {};

// Array method stubs
export const arrayReduce = Array.prototype.reduce;
export const arrayMethodIsStrict = false;
export const arrayIncludes = Array.prototype.includes;
export const isArray = Array.isArray;

// String method stubs  
export const stringTrim = String.prototype.trim;
export const stringTrimTo = (str: string) => str.trim();

// Function and environment stubs
export const functionName = () => '';
export const environmentV8Version = '';
export const regexpStickyHelpers = {};

// Default export for catch-all
export default globalThis;