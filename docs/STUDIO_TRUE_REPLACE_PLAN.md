# Studio Text Edit: True Replace Plan

## Context
Current Studio text editing uses an overlay approach (whiteout + new text). Visual replacement works, but extracted PDF text still contains the original text plus the new text.

## Goal
Implement true replacement in PDF content streams for supported cases, with overlay as explicit fallback only.

## Scope and order
1. Define replacement contract and fallback rules.
2. Inventory current text-edit apply pipeline and mapping inputs.
3. Implement content-stream parser for text operators (`BT/ET`, `Tj`, `TJ`).
4. Implement deterministic span-to-operator matching.
5. Implement in-stream rewrite path (`true replace`).
6. Keep overlay path as fallback with telemetry reason codes.
7. Add guardrails for unsupported/ambiguous/font-encoding cases.
8. Add tests (unit/integration/e2e) for text extraction correctness.
9. Roll out behind feature flag (`studio_true_replace`) and collect telemetry.

## Definition of done
- Supported documents: extracted text contains replacement only (no legacy token duplication).
- Unsupported documents: fallback path works and telemetry explicitly explains why.
- No regressions in batch save, undo/redo save, and existing Studio edit e2e suite.

## Next session start checklist
1. Inspect `src/services/pdf/studio-text-edit-applier.ts` and identify overlay insertion points.
2. Add parser/matcher module skeleton and unit test harness.
3. Implement first vertical slice for single-line `Tj` replacement on one-page PDFs.
