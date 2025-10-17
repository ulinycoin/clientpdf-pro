// Critical Node.js polyfills for browser - MUST be first!
// Required for pdf-lib and other Node-based libraries to work in browser
(function setupPolyfills() {
  'use strict';

  if (typeof window === 'undefined') return;

  // Minimal critical polyfills only
  const criticalGlobals = () => {
    if (typeof (window as any).process === 'undefined') {
      (window as any).process = {
        env: { NODE_ENV: 'production' },
        browser: true,
        versions: { node: '18.0.0' },
        nextTick: (cb: Function) => Promise.resolve().then(() => cb())
      };
    }

    if (typeof (window as any).global === 'undefined') {
      (window as any).global = globalThis;
    }

    // Lightweight Buffer fallback
    if (typeof (window as any).Buffer === 'undefined') {
      (window as any).Buffer = Uint8Array;
      (globalThis as any).Buffer = Uint8Array;
    }
  };

  // Defer heavy polyfills until after initial render
  const deferredPolyfills = () => {
    // Only set up require polyfill when actually needed
    if (!(window as any).require) {
      (window as any).require = function(moduleName: string) {
        switch (moduleName) {
          case 'stream':
            return {
              Readable: class { constructor() { (this as any)._readableState = { objectMode: false }; } },
              Writable: class { constructor() { (this as any)._writableState = { objectMode: false }; } },
              Transform: class { constructor() { (this as any)._readableState = (this as any)._writableState = { objectMode: false }; } }
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
          default:
            return {};
        }
      };
    }
  };

  // Run critical polyfills immediately
  criticalGlobals();

  // Defer heavy polyfills to next idle period
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => deferredPolyfills(), { timeout: 1000 });
  } else {
    setTimeout(deferredPolyfills, 0);
  }
})();

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
