// Critical Node.js polyfills for browser - MUST be first!
(function setupPolyfills() {
  'use strict';
  
  // Aggressive stream polyfill to prevent pdf-lib errors
  if (typeof window !== 'undefined') {
    // Override require function globally with aggressive blocking
    (window as any).require = function(moduleName: string) {
      console.warn(`[POLYFILL] require() called for module: ${moduleName} - blocked in browser`);
      
      switch (moduleName) {
        case 'stream':
          return {
            Readable: class MockReadable {
              constructor() { this._readableState = { objectMode: false }; }
              read() { return null; }
              pipe(dest: any) { return dest; }
              on() { return this; }
              once() { return this; }
              emit() { return true; }
              removeListener() { return this; }
              destroy() { return this; }
            },
            Writable: class MockWritable {
              constructor() { this._writableState = { objectMode: false }; }
              write() { return true; }
              end() { return this; }
              on() { return this; }
              once() { return this; }
              emit() { return true; }
              removeListener() { return this; }
              destroy() { return this; }
            },
            Transform: class MockTransform {
              constructor() { 
                this._readableState = { objectMode: false };
                this._writableState = { objectMode: false };
              }
              _transform() {}
              pipe(dest: any) { return dest; }
              on() { return this; }
              once() { return this; }
              emit() { return true; }
              removeListener() { return this; }
              destroy() { return this; }
            }
          };
        case 'buffer':
          return { Buffer: globalThis.Buffer || Uint8Array };
        case 'util':
          return {
            promisify: (fn: Function) => (...args: any[]) => Promise.resolve(fn(...args)),
            inspect: (obj: any) => JSON.stringify(obj)
          };
        case 'crypto':
          return globalThis.crypto || {};
        case 'pdf-lib':
        case '@pdf-lib/fontkit':
          return {
            PDFDocument: class { 
              static create() { throw new Error('pdf-lib disabled'); }
              static load() { throw new Error('pdf-lib disabled'); }
            },
            rgb: () => ({}),
            degrees: (d: number) => d,
            StandardFonts: {},
            default: {}
          };
        default:
          console.warn(`Module ${moduleName} polyfilled as empty object`);
          return {};
      }
    };

    // Ensure global Buffer is available
    if (typeof (window as any).Buffer === 'undefined') {
      // Try to load buffer polyfill, but fallback to Uint8Array
      try {
        // Import buffer polyfill dynamically
        import('buffer').then(bufferModule => {
          (window as any).Buffer = bufferModule.Buffer;
          (globalThis as any).Buffer = bufferModule.Buffer;
        }).catch(() => {
          (window as any).Buffer = Uint8Array;
          (globalThis as any).Buffer = Uint8Array;
        });
      } catch (e) {
        (window as any).Buffer = Uint8Array;
        (globalThis as any).Buffer = Uint8Array;
      }
    }

    // Ensure process is available
    if (typeof (window as any).process === 'undefined') {
      (window as any).process = {
        env: { NODE_ENV: 'development' },
        browser: true,
        versions: { node: '18.0.0' },
        nextTick: (cb: Function) => setTimeout(cb, 0)
      };
    }

    // Ensure global is available
    if (typeof (window as any).global === 'undefined') {
      (window as any).global = globalThis;
    }
  }
})();

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);