# E2E PDF Fixtures

This directory contains generated E2E fixtures grouped by real-world use cases.

## Regeneration

Run:

```bash
npm run fixtures:pdfs
```

This updates all fixture PDFs and `catalog.json`.

## Taxonomy

- `invoices/`: invoice-like docs with totals, tax, and pagination.
- `forms/`: form-style layouts with repeated labels and entry boxes.
- `documents/`: paragraph-heavy and multi-column text samples.
- `scanned/`: image-like docs and OCR-like low-confidence text layer.
- `edge-cases/`: duplicate labels, rotated text, dense tables, and positioning stress cases.

## Expected Editing Behavior

- `documents/*`, `invoices/simple-invoice.pdf`, `invoices/tax-invoice.pdf`:
  primary true-replace candidates.
- `invoices/multi-page-invoice.pdf`, `documents/two-column-article.pdf`:
  pagination/layout-sensitive replacements.
- `scanned/*`, `edge-cases/rotated-text.pdf`:
  expected fallback paths in many edits.
- `edge-cases/duplicate-labels.pdf`, `edge-cases/minimal-positioning.pdf`, `edge-cases/complex-table.pdf`:
  ambiguity/heuristic stress tests.
