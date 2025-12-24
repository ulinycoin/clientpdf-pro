// Critical Node.js polyfills for browser - MUST be first!
// Required for pdf-lib and other Node-based libraries to work in browser
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
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

    // Use real Buffer package
    import('buffer').then(({ Buffer }) => {
      if (typeof (window as any).Buffer === 'undefined' || (window as any).Buffer === Uint8Array || !(window as any).Buffer.isBuffer) {
        (window as any).Buffer = Buffer;
        (globalThis as any).Buffer = Buffer;
      }
    });

    // Immediate fallback with critical methods to prevent crashes during load
    if (typeof (window as any).Buffer === 'undefined') {
      (window as any).Buffer = Uint8Array;
      (window as any).Buffer.isBuffer = (obj: any) => obj instanceof Uint8Array;
      (globalThis as any).Buffer = (window as any).Buffer;
    }
  };

  // Defer heavy polyfills until after initial render
  const deferredPolyfills = () => {
    // Only set up require polyfill when actually needed
    if (!(window as any).require) {
      (window as any).require = function (moduleName: string) {
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
import { I18nProvider } from '@/contexts/I18nContext'
import { inject } from '@vercel/analytics';
import posthog from 'posthog-js';

// Initialize Vercel Analytics
inject();

// Initialize PostHog with Privacy-First configuration
if (typeof window !== 'undefined' && import.meta.env.VITE_POSTHOG_KEY) {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: window.location.origin + '/ingest',
    ui_host: 'https://app.posthog.com',
    person_profiles: 'always',
    autocapture: true, // Enable autocapture temporarily to verify working status
    capture_pageview: true,
    debug: true, // Enable debug mode to see logs in console
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: ".ph-no-capture",
      blockSelector: ".ph-no-capture, canvas"
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
)
