// Comprehensive core-js stubs to resolve all internals modules
// This file provides fallback implementations for problematic core-js internal modules

console.log('🔄 Core-js stub loaded - providing browser-safe replacements');

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

// Browser-safe Promise implementation
export const PromiseStub = Promise;

// ES module stubs
export const arrayIterator = Array.prototype[Symbol.iterator];
export const stringMatch = String.prototype.match;
export const stringReplace = String.prototype.replace;
export const stringStartsWith = String.prototype.startsWith;
export const stringEndsWith = String.prototype.endsWith;
export const stringSplit = String.prototype.split;
export const arrayIndexOf = Array.prototype.indexOf;
export const stringIncludes = String.prototype.includes;
export const arrayReverse = Array.prototype.reverse;
export const regexpToString = RegExp.prototype.toString;

// Web DOM collections iterator
export const webDomCollectionsIterator = Symbol.iterator;

// Default export for catch-all - now provides individual modules
const coreJsStub = {
  // ES Promise
  'es.promise': PromiseStub,
  'es.promise.js': PromiseStub,
  
  // ES Array methods
  'es.array.iterator': arrayIterator,
  'es.array.iterator.js': arrayIterator,
  'es.array.reduce': arrayReduce,
  'es.array.reduce.js': arrayReduce,
  'es.array.index-of': arrayIndexOf,
  'es.array.index-of.js': arrayIndexOf,
  'es.array.reverse': arrayReverse,
  'es.array.reverse.js': arrayReverse,
  
  // ES String methods
  'es.string.match': stringMatch,
  'es.string.match.js': stringMatch,
  'es.string.replace': stringReplace,
  'es.string.replace.js': stringReplace,
  'es.string.starts-with': stringStartsWith,
  'es.string.starts-with.js': stringStartsWith,
  'es.string.ends-with': stringEndsWith,
  'es.string.ends-with.js': stringEndsWith,
  'es.string.split': stringSplit,
  'es.string.split.js': stringSplit,
  'es.string.trim': stringTrim,
  'es.string.trim.js': stringTrim,
  'es.string.includes': stringIncludes,
  'es.string.includes.js': stringIncludes,
  
  // ES RegExp
  'es.regexp.to-string': regexpToString,
  'es.regexp.to-string.js': regexpToString,
  
  // Web DOM
  'web.dom-collections.iterator': webDomCollectionsIterator,
  'web.dom-collections.iterator.js': webDomCollectionsIterator,
  
  // Fallback
  default: globalThis
};

export default coreJsStub;