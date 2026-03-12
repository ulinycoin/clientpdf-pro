# Studio Taxonomy: Edit vs Convert

Date: 2026-02-16
Status: Ready for implementation

## Classification Rule
- `Edit`: input and output stay in PDF domain; user modifies structure, order, security, or layout.
- `Convert`: user changes source/target document representation or extraction mode.

## Current Tool Mapping

### Edit
- `merge-pdf`
- `split-pdf`
- `rotate-pdf`
- `delete-pages-pdf`
- `compress-pdf`
- `unlock-pdf`
- `encrypt-pdf`
- `pdf-editor`

### Convert
- `word-to-pdf`
- `excel-to-pdf`
- `pdf-to-jpg`
- `ocr-pdf`

## Studio Navigation Contract
Top navigation in Studio:
- Segment switch: `Edit | Convert`.
- Action row shows only tools from selected segment.
- Segment is sticky in session and restorable from URL (`?segment=edit|convert`).

## UX Notes
- `Edit` is default segment for users who open existing PDFs.
- `Convert` should prioritize import/export transformations.
- Unknown or new tools must not appear until categorized.

## Engineering Contract
- Category source in code: `src/app/navigation/tool-categories.ts`.
- Category UI should be built from menu + category map, not hardcoded lists inside components.
- Tests required for each new tool category mapping.
