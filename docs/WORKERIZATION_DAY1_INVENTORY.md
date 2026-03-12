# Workerization Day 1 Inventory

Date: 2026-02-09

## Scope
- Goal: identify all imports that reference `src/services/*` and classify them by execution zone.
- Audit command:
  - `npm run audit:workerization`
  - `npm run audit:workerization:strict`

## Current Snapshot
- Total service imports: `16`
- `main-thread-forbidden`: `0`
- `worker-only`: `14`
- `test-only`: `1`
- `service-internal`: `0`
- `other`: `1`

## Forbidden (must migrate before release)

| File | Import | Why forbidden |
|---|---|---|
| none | none | no forbidden imports in `src/app/**`, `src/v6/**`, `src/plugins/**/ui/**`. |

## Worker-only (allowed)

| Tool | File | Service import |
|---|---|---|
| compress-pdf | `src/plugins/compress-pdf/logic/index.ts:2` | `services/pdf/compress-engine` |
| delete-pages-pdf | `src/plugins/delete-pages-pdf/logic/index.ts:2` | `services/pdf/pdf-engine` |
| encrypt-pdf | `src/plugins/encrypt-pdf/logic/index.ts:2` | `services/pdf/qpdf-engine` |
| encrypt-pdf | `src/plugins/encrypt-pdf/logic/index.ts:3` | `services/pdf/qpdf-engine` |
| encrypt-pdf | `src/plugins/encrypt-pdf/logic/index.ts:4` | `services/pdf/qpdf-errors` |
| merge-pdf | `src/plugins/merge-pdf/logic/index.ts:2` | `services/pdf/pdf-engine` |
| ocr-pdf | `src/plugins/ocr-pdf/logic/index.ts:2` | `services/ocr/ocr-engine` |
| ocr-pdf | `src/plugins/ocr-pdf/logic/index.ts:3` | `services/ocr/ocr-errors` |
| ocr-pdf | `src/plugins/ocr-pdf/logic/index.ts:4` | `services/pdf/pdf-rasterizer` |
| pdf-to-jpg | `src/plugins/pdf-to-jpg/logic/index.ts:2` | `services/pdf/pdf-rasterizer` |
| rotate-pdf | `src/plugins/rotate-pdf/logic/index.ts:2` | `services/pdf/pdf-engine` |
| split-pdf | `src/plugins/split-pdf/logic/index.ts:2` | `services/pdf/pdf-engine` |
| unlock-pdf | `src/plugins/unlock-pdf/logic/index.ts:2` | `services/pdf/qpdf-engine` |
| unlock-pdf | `src/plugins/unlock-pdf/logic/index.ts:3` | `services/pdf/qpdf-engine` |

## Test-only (non-blocking)

| File | Import |
|---|---|
| `src/plugins/encrypt-pdf/logic/index.test.ts:4` | `services/pdf/qpdf-errors` |

## Day 1 Output
- Added automated inventory script: `scripts/workerization-audit.mjs`.
- Added package scripts:
  - `audit:workerization`
  - `audit:workerization:strict`
- Migrated page-count path to worker command `GET_PDF_PAGE_COUNT` (`PAGE_COUNT_RESULT`).
- Verified `audit:workerization:strict` passes (no forbidden imports remain).
- Added UI-core boundary gate in audit strict mode:
  - `src/app/react/**`, `src/v6/**`, `src/plugins/**/ui/**` can import only `core/public/*`.
  - Non-allowlisted `core/**` imports in UI zones fail strict mode.

## Migration Queue (next execution step)
1. Keep `audit:workerization:strict` in CI as release blocker.
2. Expand workerization audit with explicit rule for `src/core/**` (allow only `src/core/workers/**` imports from `services/*`).
3. Start Day 2 migration batch for remaining heavy operations and add integration assertions for metadata-query path.
