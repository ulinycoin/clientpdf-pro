# Progress Log (2026-02-09)

## Summary
- Wizard/worker cancellation race fixed (`AbortSignal` pre-aborted/in-flight paths).
- Build chunking strategy stabilized (`manualChunks`, warning threshold tuning).
- UI/UX 2026 wave delivered for shell + tool config screens.
- E2E suite stabilized and passing.

## Key Completed Items
- `WorkerOrchestrator.dispatch` returns deterministic `WORKER_ABORTED` for canceled signals.
- Regression coverage added for orchestrator abort scenarios.
- Shell visual refresh:
  - gradient/glass layout
  - refined sidebar + telemetry
  - wizard chips/cards/progress/actions
- Plugin UI consistency pass across `src/plugins/*/ui/index.tsx`.
- `UxFeedbackOverlay` migrated from inline styles to shared class-based design system.
- Microcopy/icons standardization pass completed:
  - unified primary CTA labels to `Run [Tool/Action]`
  - wizard processing/result/download copy aligned with 2026 dictionary
  - internal linear icon set added and used in wizard + merge order controls
- UI QA baseline documented and polish pass applied:
  - checklist added at `docs/UI_QA_CHECKLIST_2026.md`
  - keyboard activation for upload zone (`Enter`/`Space`)
  - dark-theme error banner readability improved
  - spacing/hover polish for wizard cards and controls
- Preview MVP started and integrated into wizard:
  - new `FilePreviewService` with first-page PDF thumbnail, image thumbnail, and LRU objectURL cache
  - new `useFilePreviews` hook + `PreviewPanel` UI in wizard flow
  - added unit coverage for preview cache/eviction behavior
  - quality gates revalidated (`build`, `test`, `test:e2e`) after integration
- Preview wave 2 completed:
  - PDF `pageCount` surfaced in preview metadata
  - preview list pagination added to `PreviewPanel` (`Prev/Next`, page indicator)
  - lazy image loading via `IntersectionObserver` in preview cards
  - telemetry added for preview lifecycle (`UI_PREVIEW_RENDERED`, `UI_PREVIEW_ERROR`)
  - quality gates revalidated (`build`, `test`, `test:e2e`, `audit:workerization:strict`)
- Preview wave 3 completed:
  - PDF card now supports page-level preview switching (`Prev page` / `Next page`)
  - page thumbnails cached in `FilePreviewService` (`fileId::page`) with LRU eviction + URL revoke
  - full regression pass revalidated (`build`, `test`, `test:e2e`)
- Preview reliability fix (Delete Pages case):
  - `pageCount` for preview is now derived from `pdfjs` document context used for thumbnail render
  - removed fragile dependency on separate parser path for preview-page controls visibility
  - revalidated quality gates (`build`, `test`, `test:e2e`)
- Playwright runner made deterministic:
  - `workers=1`, `fullyParallel=false`
  - `build + preview` webServer profile on `127.0.0.1:4173`

## Current Quality Snapshot
- `npm run build`: green
- `npm test`: 78/78 pass
- `npm run test:e2e`: 10/10 pass
- `npm run audit:workerization:strict`: green

## Notes
- Decision baseline is documented in `docs/UI_UX_2026_DECISIONS.md`.

## Update (2026-02-13)
- Word to PDF config screen migrated to concept-driven workspace layout:
  - old minimal config UI removed
  - inline upload in config enabled (no standalone upload card for `word-to-pdf`)
  - full-width + full-height alignment tuned to match OCR workspace behavior
- OCR PDF screen cleanup and alignment:
  - removed concept placeholder copy from OCR test/config screens
  - header alignment adjusted
  - reduced page-level vertical scroll by constraining OCR test shell and moving scroll to inner panels
  - left settings menu compacted; action row kept visible with sticky bottom behavior
- Excel to PDF migrated to the same modern workspace pattern as OCR/Word:
  - concept-based settings + preview layout added
  - inline upload in config enabled
  - sizing aligned with OCR/Word (full-width/full-height behavior)
- Standalone navigation cleanup:
  - removed standalone routes and sidebar entries for `rotate-pdf`, `split-pdf`, `delete-pages-pdf` (functions remain available via Studio)
- Sidebar ordering updated:
  - top sequence set to `Studio -> OCR -> Word -> Excel -> PDF to JPG`
  - all other tools preserved and shown after prioritized items

## Current Quality Snapshot (2026-02-13)
- `npm run build`: green
- `npm test`: 90/90 pass
