# QA Audit & Performance Report

## Overview
As part of the pre-release QA audit for LocalPDF, a primary concern was ensuring the application handles memory correctly during long, intensive, offline sessions. Because all processing is done locally via WebAssembly (`pdf-lib`, `pdf.js`), improper resource management (dangling `ArrayBuffers`, detached `Canvas` elements) can quickly crash the browser tab.

## Work Completed
1. **Memory Leak E2E Test Suite (`e2e/memory-leak.spec.ts`)**:
   - Implemented an automated Playwright test that simulates 50 consecutive PDF uploads and closings.
   - Reconfigured Playwright to launch Chromium with the `--expose-gc` flag, allowing explicit garbage collection (`window.gc()`) between iterations to eliminate false-positives caused by V8's lazy GC.
   - Connected directly to the Chrome DevTools Protocol (`CDP`) to measure exact JS Heap differences ($\Delta$) and monitor "Detached DOM nodes".

2. **Large-Scale Virtualization Test**:
   - Created a helper script (`generate-large.mjs`) to generate a 1000-page PDF document locally.
   - Verified that the `StudioShell` component does not mount 1000 `<canvas>` elements simultaneously, strictly relying on the Konva viewport virtualization to keep DOM nodes low.

3. **Codebase Inspection**:
   - Verified `pdfjs.destroy()` is consistently called on component unmounts and task completions across `StudioShell`, `PageObject`, and the floating menus.
   - Audited the `useDocumentStore` and Undo/Redo history states to ensure no stray Blob URLs are kept alive indefinitely. History pruning works exclusively on serializable commands and `ArrayBuffers` that are naturally garbage-collected.

## Next Steps for the Team
- **CI Integration**: The `memory-leak.spec.ts` script should be executed routinely during the CI testing phase. It sets a strict ceiling of `~50MB` heap growth over 50 iterations, which operates as a tripwire against any future regressions in worker management.
- **Manual Verification**: Developers should occasionally drop the `large-1000-pages.pdf` fixture into the UI to manually confirm browser scrolling remains performant.
